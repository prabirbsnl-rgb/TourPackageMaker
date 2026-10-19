



import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyBackupAdmin } from "./verify-backup-admin.mjs";
   

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const CONTROLLER_SCRIPT = path.join(
  __dirname,
  "orbitz-backup-controller.mjs"
);

const HOST = "127.0.0.1";
const PORT = 4320;
const CONTROLLER_HOST = "127.0.0.1";
const CONTROLLER_PORT = 4318;


const CONTROLLER_SECRET =
  process.env.ORBITZ_BACKUP_CONTROLLER_SECRET;

if (!CONTROLLER_SECRET || CONTROLLER_SECRET.length < 32) {
  console.error(
    "Missing or invalid ORBITZ_BACKUP_CONTROLLER_SECRET."
  );
  process.exit(1);
}




let controllerChild = null;
let controllerStarting = false;
let managerShuttingDown = false;

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}



async function verifyAdminRequest(req) {
  try {
    const result = await verifyBackupAdmin({
      headers: {
        "x-firebase-id-token":
          req.headers["x-firebase-id-token"] || "",
      },
    });

    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        error: result.error,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 503,
      error: "Admin authorization could not be verified. Try again later.",
    };
  }
}


function getControllerStatus(currentFirebaseToken) {
  return new Promise((resolve) => {
    let settled = false;
    let body = "";

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const request = http.get(
      {
        host: CONTROLLER_HOST,
        port: CONTROLLER_PORT,
        path: "/status",
        timeout: 1500,
        headers: {
          Authorization: `Bearer ${CONTROLLER_SECRET}`,
          "X-Firebase-ID-Token": currentFirebaseToken,
        },
      },
      (response) => {
        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          body += chunk;

          if (body.length > 64 * 1024) {
            request.destroy();
            finish({ reachable: false, status: null });
          }
        });

        response.on("end", () => {
          if (settled) return;

          try {
            const status = JSON.parse(body);

            finish({
              reachable:
                response.statusCode === 200 && status.ok === true,
              status:
                response.statusCode === 200 && status.ok === true
                  ? status
                  : null,
            });
          } catch {
            finish({ reachable: false, status: null });
          }
        });

        response.on("error", () => {
          finish({ reachable: false, status: null });
        });
      }
    );

    request.setTimeout(1500, () => request.destroy());
    request.on("error", () => {
      finish({ reachable: false, status: null });
    });
  });
}



function isControllerPortOccupied() {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: CONTROLLER_HOST,
      port: CONTROLLER_PORT,
    });

    let settled = false;

    const finish = (occupied) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(occupied);
    };

    socket.setTimeout(1500);
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


function isHelperPortOccupied() {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: "127.0.0.1",
      port: 4317,
    });

    let settled = false;

    const finish = (occupied) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(occupied);
    };

    socket.setTimeout(1500);
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





function postControllerAction(pathname, currentFirebaseToken) {
  return new Promise((resolve) => {
    let settled = false;
    let body = "";

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const request = http.request(
      {
        host: CONTROLLER_HOST,
        port: CONTROLLER_PORT,
        path: pathname,
        method: "POST",
        timeout: 5000,
       headers: {
  Authorization: `Bearer ${CONTROLLER_SECRET}`,
  "X-Firebase-ID-Token": currentFirebaseToken,
  "Content-Length": "0",
  Connection: "close",
},
      },
      (response) => {
        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          body += chunk;

          if (body.length > 16 * 1024) {
            request.destroy();
            finish({ reachable: false, statusCode: null, data: null });
          }
        });



        response.on("aborted", () => {
  console.error("Controller shutdown response was aborted.");
});




        response.on("end", () => {
          if (settled) return;

          let data = null;
          try {
            data = JSON.parse(body);
          } catch {
            // Treat an unreadable response as a failed action.
          }

          finish({
            reachable: true,
            statusCode: response.statusCode ?? null,
            data,
          });
        });

        response.on("error", () => {
          finish({ reachable: false, statusCode: null, data: null });
        });
      }
    );

    request.setTimeout(5000, () => request.destroy());
    request.on("error", (error) => {
  console.error(
    "Controller action request failed:",
    error.code || "UNKNOWN"
  );

  finish({ reachable: false, statusCode: null, data: null });
});

    request.end();
  });
}





const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.headers.host !== `${HOST}:${PORT}`) {
    return send(res, 403, {
      ok: false,
      error: "Invalid host.",
    });
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (managerShuttingDown) {
    return send(res, 503, {
      ok: false,
      error: "Service Manager is shutting down.",
    });
  }

  const adminCheck = await verifyAdminRequest(req);

  if (!adminCheck.ok) {
    return send(res, adminCheck.status, {
      ok: false,
      error: adminCheck.error,
    });
  }

  if (req.method === "GET" && url.pathname === "/status") {
       const controller = await getControllerStatus(
      req.headers["x-firebase-id-token"]
    );
    return send(res, 200, {
      ok: true,
      service: "Orbitz Backup Service Manager",
      version: 1,
      computer: process.env.COMPUTERNAME || "TRAVEL-02",
      controllerReachable: controller.reachable,
      controller: controller.status,
      managerShuttingDown,
    });
  }


  if (req.method === "POST" && url.pathname === "/manager/shutdown") {
    if (controllerStarting || controllerChild !== null) {
      return send(res, 409, {
        ok: false,
        error:
          "Service Manager shutdown refused while a Controller process or startup operation is still tracked.",
      });
    }

    const controllerPortOccupied = await isControllerPortOccupied();
    const helperPortOccupied = await isHelperPortOccupied();

    if (controllerPortOccupied || helperPortOccupied) {
      return send(res, 409, {
        ok: false,
        error:
          "Stop the Backup Helper and Backup Controller first. Service Manager shutdown is refused while either service is listening or its state is uncertain.",
      });
    }

    managerShuttingDown = true;

    res.once("finish", () => {
      server.close(() => {
        console.log("Orbitz Backup Service Manager stopped gracefully.");
      });
    });

    return send(res, 200, {
      ok: true,
      message: "Service Manager stopped gracefully.",
    });
  }


  
  if (req.method === "POST" && url.pathname === "/controller/start") {
    
    if (controllerStarting) {
      return send(res, 409, {
        ok: false,
        error: "Controller startup is already in progress.",
      });
    }

    if (controllerChild !== null) {
      return send(res, 409, {
        ok: false,
        error:
          "A Controller process launched by this Manager still exists. Verify its status before retrying.",
      });
    }


    const currentFirebaseToken =
      req.headers["x-firebase-id-token"];

    const current = await getControllerStatus(currentFirebaseToken);

        if (current.reachable) {
      return send(res, 200, {
        ok: true,
        message: "Controller is already running.",
        controller: current.status,
      });
    }

    const portOccupied = await isControllerPortOccupied();

    if (portOccupied) {
      return send(res, 503, {
        ok: false,
        error:
          "Controller port is occupied, but authenticated status could not be confirmed. No new process was started.",
      });
    }

    controllerStarting = true;

    try {
      const child = spawn(
        process.execPath,
        [CONTROLLER_SCRIPT],
        {
          cwd: PROJECT,
          env: { ...process.env },
          windowsHide: true,
          stdio: ["ignore", "inherit", "inherit"],
        }
      );


      let controllerStartFailed = false;


      controllerChild = child;

      child.once("error", () => {
        controllerStartFailed = true;
        if (controllerChild === child) controllerChild = null;
        controllerStarting = false;
        console.error("Controller process could not be started.");
      });

      child.once("exit", () => {
        if (controllerChild === child) controllerChild = null;
        controllerStarting = false;
      });

      const deadline = Date.now() + 8000;

      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 250));

        const check = await getControllerStatus(currentFirebaseToken);

        if (check.reachable) {
          controllerStarting = false;

          return send(res, 200, {
            ok: true,
            message: "Controller started and authenticated.",
            controller: check.status,
          });
        }

        if (
  controllerStartFailed ||
  child.exitCode !== null ||
  child.signalCode !== null
) {
  break;
}
      }

      
            const finalCheck = await getControllerStatus(currentFirebaseToken);

      if (finalCheck.reachable) {
        controllerStarting = false;

        return send(res, 200, {
          ok: true,
          message: "Controller started and authenticated.",
          controller: finalCheck.status,
        });
      }

      controllerStarting = false;

      const controllerPortOccupied = await isControllerPortOccupied();

      if (controllerChild === child && controllerPortOccupied) {
        return send(res, 503, {
          ok: false,
          error:
            "Controller startup could not be authenticated or confirmed. The process may still be running; check its status before retrying.",
        });
      }

      return send(res, 503, {
        ok: false,
        error:
          "Controller startup failed. Check the service log and port status before retrying.",
      });

    } catch {
      controllerStarting = false;

      return send(res, 503, {
        ok: false,
        error: "Controller could not be started.",
      });
    }
  }



  if (req.method === "POST" && url.pathname === "/controller/stop") {
    const currentFirebaseToken =
      req.headers["x-firebase-id-token"];

    const current = await getControllerStatus(currentFirebaseToken);

    if (!current.reachable) {
      return send(res, 503, {
        ok: false,
        error:
          "Controller status cannot be verified. No shutdown was requested.",
      });
    }

    const status = current.status;

    if (
      status.helperRunning !== false ||
      status.helperAuthenticated !== false ||
      status.controllerOwnsHelper !== false ||
      status.state !== "stopped"
    ) {
      return send(res, 409, {
        ok: false,
        error:
          "Controller shutdown refused because Helper state is not confirmed safe.",
      });
    }

    const result = await postControllerAction(
      "/shutdown",
      currentFirebaseToken
    );

    
    if (!result.reachable) {
      const controllerPortOccupied = await isControllerPortOccupied();

      if (!controllerPortOccupied) {
        return send(res, 200, {
          ok: true,
          message: "Controller stopped; the shutdown response was not received.",
        });
      }

      return send(res, 503, {
        ok: false,
        error:
          "Controller shutdown response was not received, and its port is still occupied or uncertain. Refresh status before retrying.",
      });
    }


    if (result.statusCode !== 202 || result.data?.ok !== true) {
      return send(res, result.statusCode || 503, {
        ok: false,
        error:
          result.data?.error ||
          "Controller refused shutdown or returned an invalid response.",
      });
    }

    
    
    const shutdownDeadline = Date.now() + 8000;

    while (Date.now() < shutdownDeadline) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const controllerPortOccupied = await isControllerPortOccupied();

      if (!controllerPortOccupied) {
        return send(res, 200, {
          ok: true,
          message: "Controller stopped gracefully.",
        });
      }
    }

    return send(res, 503, {
      ok: false,
      error:
        "Shutdown was accepted, but Controller termination could not be confirmed. Check the service before retrying.",
    });

  }





  return send(res, 404, {
    ok: false,
    error: "Endpoint not found.",
  });
});

server.on("error", () => {
  console.error("Orbitz Backup Service Manager server error.");
});

server.listen(PORT, HOST, () => {
  console.log(
    `Orbitz Backup Service Manager listening on ${HOST}:${PORT}`
  );
});




