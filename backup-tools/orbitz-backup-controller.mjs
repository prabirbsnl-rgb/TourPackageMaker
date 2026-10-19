
import http from "node:http";
import os from "node:os";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { verifyBackupAdmin } from "./verify-backup-admin.mjs";
import net from "node:net";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const HELPER_SCRIPT = path.join(
  __dirname,
  "orbitz-backup-helper.mjs"
);

const HOST = "127.0.0.1";
const PORT = 4318;
const HELPER_HOST = "127.0.0.1";
const HELPER_PORT = 4317;

const CONTROLLER_SECRET =
  process.env.ORBITZ_BACKUP_CONTROLLER_SECRET;

if (!CONTROLLER_SECRET || CONTROLLER_SECRET.length < 32) {
  console.error(
    "Missing or invalid ORBITZ_BACKUP_CONTROLLER_SECRET."
  );
  process.exit(1);
}

let helperChild = null;
let helperState = "stopped";
let helperToken = null;
let startPromise = null;

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}



function readJsonBody(req, maxBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    const declaredLength = Number(req.headers["content-length"] || 0);

    if (
      Number.isFinite(declaredLength) &&
      declaredLength > maxBytes
    ) {
      reject(new Error("Request body exceeds the allowed size."));
      req.resume();
      return;
    }

    req.on("data", chunk => {
      size += chunk.length;

      if (size > maxBytes) {
        reject(new Error("Request body exceeds the allowed size."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      if (size === 0) {
        reject(new Error("Request body is empty."));
        return;
      }

      try {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must contain valid JSON."));
      }
    });

    req.on("error", error => {
      reject(error);
    });
  });
}




async function helperStatus() {
  try {
    const response = await fetch(
      `http://${HELPER_HOST}:${HELPER_PORT}/status`,
      { signal: AbortSignal.timeout(1200) }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}



async function isHelperPortListening() {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: HELPER_HOST,
      port: HELPER_PORT,
    });

    let settled = false;

    const finish = (listening) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(listening);
    };

    socket.setTimeout(1200);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(true));
    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED") {
        finish(false);
      } else {
        finish(true);
      }
    });
  });
}






async function helperAuthenticated() {
  if (!helperToken) return false;

  try {
    const response = await fetch(
      `http://${HELPER_HOST}:${HELPER_PORT}/auth-check`,
      {
        headers: {
          Authorization: `Bearer ${helperToken}`,
        },
        signal: AbortSignal.timeout(1200),
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.ok === true && data.authenticated === true;
  } catch {
    return false;
  }
}





async function startHelper() {
  if (helperState === "running" && helperChild) {
    return { ok: true, message: "Helper is already running." };
  }

  if (startPromise) return startPromise;

  if (helperChild) {
    return {
      ok: false,
      error:
        "A controller-owned helper process still exists. Wait for its lifecycle to settle before attempting another start.",
    };
  }

  startPromise = (async () => {

    const existing = await helperStatus();

    if (existing) {
      helperState = "external";
      return {
        ok: false,
        error:
          "A helper is already running but is not owned by this controller. Stop/start is disabled for safety.",
      };
    }

    helperState = "starting";
    helperToken = null;


    helperToken = crypto.randomBytes(32).toString("hex");


    helperChild = spawn(
      process.execPath,
      [HELPER_SCRIPT],
      {
        cwd: PROJECT,
        windowsHide: true,
        env: {
  ...process.env,
  ORBITZ_HELPER_CONTROLLER_MODE: "1",
  ORBITZ_HELPER_TOKEN: helperToken,
},
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

        const captureOutput = () => {
      // Consume child output without retaining or logging potentially sensitive data.
    };

    helperChild.stdout.on("data", captureOutput);
    helperChild.stderr.on("data", captureOutput);

        helperChild.once("error", error => {
      helperState = "stopping";
      console.error("Could not start Backup Helper:", error.message);
    });

           helperChild.once("exit", () => {
      helperState = "stopping";
    });

    helperChild.once("close", () => {
      helperState = "stopped";
      helperChild = null;
      helperToken = null;
    });

    const deadline = Date.now() + 8000;

    while (Date.now() < deadline) {
      if (!helperChild) {
        return {
          ok: false,
          error: "Helper process exited before becoming ready.",
        };
      }

     const child = helperChild;

if (!child || child.exitCode !== null) {
  return {
    ok: false,
    error: "Helper process exited before startup could be confirmed.",
  };
}

const status = await helperStatus();
const authenticated = await helperAuthenticated();

if (
  helperChild === child &&
  child.exitCode === null &&
  status?.ok &&
  authenticated
) {
  helperState = "running";
  return {
    ok: true,
    message: "Helper is running and authenticated.",
    helper: status,
  };
}

      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return {
      ok: false,
      error:
        "Helper did not become ready. It remains managed by the controller if its process is still running.",
    };
  })();

  try {
    return await startPromise;
  } finally {
    startPromise = null;
  }
}

let activeRequests = 0;
let shutdownRequested = false;

const server = http.createServer(async (req, res) => {
  activeRequests += 1;

  let requestFinished = false;
  const finishRequest = () => {
    if (requestFinished) return;
    requestFinished = true;
    activeRequests = Math.max(0, activeRequests - 1);
  };

  res.once("finish", finishRequest);
  res.once("close", finishRequest);

  res.setHeader("Cache-Control", "no-store");

  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.headers.host !== `${HOST}:${PORT}`) {
    return send(res, 403, { ok: false, error: "Invalid host." });
  }


    



  const url = new URL(req.url, `http://${HOST}:${PORT}`);

   if (req.headers.authorization !== `Bearer ${CONTROLLER_SECRET}`) {
    return send(res, 401, {
      ok: false,
      error: "Missing or invalid controller authentication.",
    });
  }

      let adminCheck;

  try {
    adminCheck = await verifyBackupAdmin({
      headers: {
        "x-firebase-id-token": req.headers["x-firebase-id-token"] || "",
      },
    });
  } catch {
    return send(res, 503, {
      ok: false,
      error: "Admin authorization could not be verified. Try again later.",
    });
  }

  if (!adminCheck.ok) {
    return send(res, adminCheck.status, {
      ok: false,
      error: adminCheck.error,
    });
  }


  if (shutdownRequested) {
    return send(res, 503, {
      ok: false,
      error: "Controller shutdown is in progress. Try again later.",
    });
  }


          if (req.method === "POST" && url.pathname === "/shutdown") {
    const helperMayBeListening = await isHelperPortListening();

    if (
      activeRequests > 1 ||
      startPromise ||
      
      helperChild !== null ||
      helperState !== "stopped" ||
      helperMayBeListening
    ) {
      return send(res, 409, {
        ok: false,
        error:
          "Controller shutdown refused. Another request or Helper activity may be in progress.",
      });
    }

    shutdownRequested = true;


    console.log("Controller shutdown accepted; sending HTTP 202 response.");




    res.once("finish", () => {
      server.close((error) => {
        if (error) {
          console.error("Controller server shutdown failed.");
          return;
        }

        console.log("Controller server closed gracefully.");
      });
    });

    return send(res, 202, {
      ok: true,
      message: "Controller shutdown accepted.",
    });
  }


  if (
  req.method === "POST" &&
  url.pathname === "/local-backups/pre-restore"
) {
  if (helperState !== "running" || !helperChild || !helperToken) {
    return send(res, 503, {
      ok: false,
      error: "The Controller-managed Backup Helper is not running.",
    });
  }

  let payload;

  try {
    payload = await readJsonBody(req);
  } catch (error) {
    return send(res, 400, {
      ok: false,
      error: error.message || "Invalid pre-restore request.",
    });
  }

  try {
    const authenticated = await helperAuthenticated();

    if (!authenticated) {
      return send(res, 503, {
        ok: false,
        error: "The Controller could not authenticate the Backup Helper.",
      });
    }

    const upstream = await fetch(
      `http://${HELPER_HOST}:${HELPER_PORT}/local-backups/pre-restore`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${helperToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      }
    );

    let result;

    try {
      result = await upstream.json();
    } catch {
      return send(res, 502, {
        ok: false,
        error: "The Backup Helper returned an invalid response.",
      });
    }

    return send(res, upstream.status, result);
  } catch {
    return send(res, 502, {
      ok: false,
      error: "The pre-restore safety-copy operation failed or timed out.",
    });
  }
}




  
  if (req.method === "POST" && url.pathname === "/local-backups") {
    if (helperState !== "running" || !helperChild || !helperToken) {
      return send(res, 503, {
        ok: false,
        error: "The Controller-managed Backup Helper is not running.",
      });
    }

    let payload;

    try {
      payload = await readJsonBody(req);
    } catch (error) {
      return send(res, 400, {
        ok: false,
        error: error.message || "Invalid local-backup request.",
      });
    }

    try {
      const authenticated = await helperAuthenticated();

      if (!authenticated) {
        return send(res, 503, {
          ok: false,
          error: "The Controller could not authenticate the Backup Helper.",
        });
      }

      const upstream = await fetch(
        `http://${HELPER_HOST}:${HELPER_PORT}/local-backups`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${helperToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        }
      );

      let result;

      try {
        result = await upstream.json();
      } catch {
        return send(res, 502, {
          ok: false,
          error: "The Backup Helper returned an invalid response.",
        });
      }

      return send(res, upstream.status, result);
    } catch {
      return send(res, 502, {
        ok: false,
        error: "The local-backup operation failed or timed out.",
      });
    }
  }


    if (req.method === "POST" && url.pathname === "/firestore-backup") {
    if (helperState !== "running" || !helperChild || !helperToken) {
      return send(res, 503, {
        ok: false,
        error: "The Controller-managed Backup Helper is not running.",
      });
    }

    try {
      const authenticated = await helperAuthenticated();

      if (!authenticated) {
        return send(res, 503, {
          ok: false,
          error: "The Controller could not authenticate the Backup Helper.",
        });
      }

      const upstream = await fetch(
        `http://${HELPER_HOST}:${HELPER_PORT}/firestore-backup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${helperToken}`,
          },
          signal: AbortSignal.timeout(330000),
        }
      );

      let result;

      try {
        result = await upstream.json();
      } catch {
        return send(res, 502, {
          ok: false,
          error: "The Backup Helper returned an invalid backup response.",
        });
      }

      return send(res, upstream.status, result);
    } catch {
      return send(res, 502, {
        ok: false,
        error: "The Firestore backup operation failed or timed out.",
      });
    }
  }



  if (req.method === "POST" && url.pathname === "/verify-backup") {
  if (helperState !== "running" || !helperChild || !helperToken) {
    return send(res, 503, {
      ok: false,
      error: "The Controller-managed Backup Helper is not running.",
    });
  }

  let payload;

  try {
    payload = await readJsonBody(req, 4096);
  } catch (error) {
    return send(res, 400, {
      ok: false,
      error: error.message || "Invalid verification request.",
    });
  }

  if (
    !payload ||
    typeof payload.fileName !== "string" ||
    !/^orbitz-firestore-backup-.*\.json$/i.test(payload.fileName) ||
    payload.fileName.includes("..") ||
    /[\\/]/.test(payload.fileName)
  ) {
    return send(res, 400, {
      ok: false,
      error: "Provide an approved JSON backup filename only.",
    });
  }

  try {
    const authenticated = await helperAuthenticated();

    if (!authenticated) {
      return send(res, 503, {
        ok: false,
        error: "The Controller could not authenticate the Backup Helper.",
      });
    }

    const upstream = await fetch(
      `http://${HELPER_HOST}:${HELPER_PORT}/verify-backup`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${helperToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(150000),
      }
    );

    let result;

    try {
      result = await upstream.json();
    } catch {
      return send(res, 502, {
        ok: false,
        error: "The Backup Helper returned an invalid verification response.",
      });
    }

    return send(res, upstream.status, result);
  } catch {
    return send(res, 502, {
      ok: false,
      error: "Backup verification failed or timed out.",
    });
  }
}


  
  if (req.method === "GET" && url.pathname === "/status") {
    const status = await helperStatus();
    const authenticated = await helperAuthenticated();

    return send(res, 200, {
      ok: true,
      service: "Orbitz Backup Controller",
      version: 2,
      computer: os.hostname(),
      state: helperState,
      helperRunning: Boolean(status?.ok),
      helperAuthenticated: authenticated,
      controllerOwnsHelper: Boolean(helperChild),
      helper: status,
    });
  }




  if (req.method === "POST" && url.pathname === "/start") {
    const result = await startHelper();
    return send(res, result.ok ? 200 : 409, result);
  }

      if (req.method === "POST" && url.pathname === "/stop") {
    if (startPromise || helperState === "starting") {
      return send(res, 409, {
        ok: false,
        error: "Cannot stop Helper while startup is in progress.",
      });
    }

    if (helperState === "stopping") {
      return send(res, 409, {
        ok: false,
        error: "Helper shutdown is already in progress.",
      });
    }

    if (helperState !== "running" || !helperChild || !helperToken) {
      return send(res, 409, {
        ok: false,
        error:
          "Cannot stop Helper because no running Controller-owned Helper is available.",
      });
    }

    const child = helperChild;
    const token = helperToken;

    let resolveClosed;
    const closedPromise = new Promise(resolve => {
      resolveClosed = resolve;
    });

    const onClose = () => resolveClosed(true);
    child.once("close", onClose);

    try {
      if (!(await helperAuthenticated())) {
  if (child.exitCode !== null) {
    helperState = "stopping";
  }

  child.removeListener("close", onClose);

  return send(res, 503, {
    ok: false,
    error:
      "The Controller could not authenticate its Helper. No shutdown request was sent.",
  });
}

      helperState = "stopping";

      let upstream;

      try {
        upstream = await fetch(
          `http://${HELPER_HOST}:${HELPER_PORT}/shutdown`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: AbortSignal.timeout(5000),
          }
        );
            } catch {
        child.removeListener("close", onClose);

        return send(res, 502, {
          ok: false,
          error:
            "The shutdown request failed or timed out. Helper state remains stopping until process closure is confirmed.",
        });
      }

      let result;

      try {
        result = await upstream.json();
      } catch {
        result = {
          ok: false,
          error: "The Helper returned an invalid shutdown response.",
        };
      }

                 if (!upstream.ok || result.ok !== true) {
        helperState = "stopping";

        child.removeListener("close", onClose);

        return send(res, upstream.status, result);
      }

      const exited = await Promise.race([
        closedPromise,
        new Promise(resolve =>
          setTimeout(() => resolve(false), 8000)
        ),
      ]);

      child.removeListener("close", onClose);

           if (!exited) {
        return send(res, 504, {
          ok: false,
          error:
            "Shutdown was accepted, but the Helper process has not exited yet. The Controller is still waiting for process closure.",
        });
      }

      return send(res, 200, {
        ok: true,
        message: "Helper stopped gracefully.",
      });
   } catch {
  helperState = "stopping";

  child.removeListener("close", onClose);

  return send(res, 500, {
    ok: false,
    error:
      "The Controller could not confirm shutdown completion. Helper state remains stopping until process closure is confirmed.",
  });
}
  }


  return send(res, 404, { ok: false, error: "Endpoint not found." });
});

server.on("error", error => {
  console.error("Orbitz Backup Controller error:", error.message);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(
    `Orbitz Backup Controller listening on ${HOST}:${PORT}`
  );
  console.log("Controller secret is loaded.");
    console.log("Controller-managed Helper start/stop is enabled.");
});
