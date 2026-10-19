

import http from "node:http";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { promises as fsp } from "node:fs";

const HOST = "127.0.0.1";
const PORT = 4317;

const PROJECT = "C:\\Users\\Admin\\Desktop\\TourPackageMaker";
const BACKUP_SCRIPT = path.join(
  PROJECT,
  "backup-tools",
  "run-daily-backup.ps1"
);

const VERIFY_SCRIPT = path.join(
  PROJECT,
  "backup-tools",
  "run-structured-backup-v2.mjs"
);


const LOCAL_BACKUP_DIR = "C:\\OrbitzBackups\\Local Data Backups";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.0.102:5173",
]);

const LOCAL_KEYS = new Set([
  "orbitzQuotationDrafts",
  "orbitzWorkingCopy",
  "taxInvoices",
  "deletedTaxInvoices",
  "orbitz_itinerary_templates",
  "orbitzDraftsFirestoreMigrationV1",
]);

const AI_PREFIX = "orbitz_ai_proposal_draft_";
const TOKEN =
  process.env.ORBITZ_HELPER_TOKEN ||
  crypto.randomBytes(32).toString("hex");
  
let backupRunning = false;

let activeOperation = null;
let shuttingDown = false;
let activeRequests = 0;


function beginOperation(name) {
  if (shuttingDown || activeOperation !== null) {
    return false;
  }

  activeOperation = name;
  backupRunning = true;
  return true;
}

function endOperation(name) {
  if (activeOperation === name) {
    activeOperation = null;
    backupRunning = false;
  }
}




function send(res, status, data) {
  if (res.headersSent || res.destroyed) return;
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}

function readBody(req, maxBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      body += chunk.toString("utf8");
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}


function validateLocalBackup(data, options = {}) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    data.format !== "orbitz-local-storage-backup" ||
    data.formatVersion !== 1 ||
    !data.records ||
    typeof data.records !== "object" ||
    Array.isArray(data.records)
  ) {
    throw new Error("Unsupported or invalid Orbitz local backup JSON.");
  }

  const keys = Object.keys(data.records);

  if (keys.length === 0 && !options.allowEmpty) {
    throw new Error("The backup contains no local-storage records.");
  }

  const allowedStorageTypes = new Set([
    "localStorage",
    "registeredLocalData",
    "aiProposalDraft",
  ]);

  for (const key of keys) {
    if (!LOCAL_KEYS.has(key) && !key.startsWith(AI_PREFIX)) {
      throw new Error(`Unsupported local-storage key: ${key}`);
    }

    const record = data.records[key];

    if (
      !record ||
      typeof record !== "object" ||
      !Object.prototype.hasOwnProperty.call(record, "value")
    ) {
      throw new Error(`Invalid record for key: ${key}`);
    }

    if (
      record.storageType !== undefined &&
      !allowedStorageTypes.has(record.storageType)
    ) {
      throw new Error(`Unsupported storage type for key: ${key}`);
    }
  }

  return keys.length;
}




function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function saveLocalBackup(data, type) {
  const count = validateLocalBackup(data, {
  allowEmpty: type === "pre-restore",
});

  await fsp.mkdir(LOCAL_BACKUP_DIR, { recursive: true });

  const prefix =
    type === "pre-restore"
      ? "orbitz-local-pre-restore-"
      : "orbitz-local-backup-";

  const fileName = `${prefix}${timestamp()}.json`;
  const fullPath = path.join(LOCAL_BACKUP_DIR, fileName);

  // Exclusive creation prevents overwriting an existing backup.
  await fsp.writeFile(
    fullPath,
    JSON.stringify(data, null, 2) + "\n",
    { encoding: "utf8", flag: "wx" }
  );

  return { fileName, fullPath, recordCount: count };
}

const server = http.createServer(async (req, res) => {

    activeRequests++;

  let requestCounted = true;
  const releaseRequest = () => {
    if (!requestCounted) return;
    requestCounted = false;
    activeRequests = Math.max(0, activeRequests - 1);
  };

  res.once("finish", releaseRequest);
  res.once("close", releaseRequest);

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.headers.host !== `${HOST}:${PORT}`) {
    return send(res, 403, { ok: false, error: "Invalid host." });
  }

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return send(res, 403, { ok: false, error: "Origin not allowed." });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === "GET" && url.pathname === "/status") {
    return send(res, 200, {
      ok: true,
      service: "Orbitz Backup Helper",
      version: 3,
      computer: os.hostname(),
      capabilities: [
        "status",
        "manual-firestore-backup",
        "local-json-backup",
        "local-pre-restore-safety-copy",
      ],
      localBackupDirectory: LOCAL_BACKUP_DIR,
      productionOperationsEnabled: false,
      backupRunning,
    });
  }


    if (shuttingDown) {
    return send(res, 503, {
      ok: false,
      error: "Helper is shutting down. Try again shortly.",
    });
  }




  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return send(res, 401, {
      ok: false,
      error: "Missing or invalid helper token.",
    });
  }


      if (req.method === "POST" && url.pathname === "/shutdown") {
    if (process.env.ORBITZ_HELPER_CONTROLLER_MODE !== "1") {
      return send(res, 403, {
        ok: false,
        error: "Shutdown is permitted only in controller-managed mode.",
      });
    }

    if (
  activeRequests > 1 ||
  activeOperation !== null ||
  backupRunning
) {
      return send(res, 409, {
        ok: false,
        error: `Cannot stop Helper while an operation is active: ${activeOperation || "backup"}.`,
      });
    }

    shuttingDown = true;

    send(res, 200, {
      ok: true,
      message: "Helper is shutting down gracefully.",
    });

    setImmediate(() => {
      server.close(error => {
        if (error) {
          console.error("Helper shutdown error:", error.message);
          process.exitCode = 1;
        }
      });
    });

    return;
  }



    if (req.method === "GET" && url.pathname === "/auth-check") {
    return send(res, 200, {
      ok: true,
      authenticated: true,
      service: "Orbitz Backup Helper",
      version: 3,
    });
  }




   if (
    req.method === "POST" &&
    (
      url.pathname === "/local-backups" ||
      url.pathname === "/local-backups/pre-restore"
    )
  ) {
    const operationName = url.pathname.endsWith("/pre-restore")
      ? "local-pre-restore-backup"
      : "local-backup";

    if (!beginOperation(operationName)) {
      return send(res, 409, {
        ok: false,
        error: shuttingDown
          ? "Backup Helper is shutting down."
          : `Another operation is already running: ${activeOperation}.`,
      });
    }

    try {
      const body = await readBody(req);
      const data = JSON.parse(body);

      const result = await saveLocalBackup(
        data,
        url.pathname.endsWith("/pre-restore")
          ? "pre-restore"
          : "regular"
      );

      return send(res, 200, {
        ok: true,
        message:
          url.pathname.endsWith("/pre-restore")
            ? "Pre-restore safety copy saved."
            : "Local JSON backup saved.",
        ...result,
      });
    } catch (error) {
      return send(res, 400, {
        ok: false,
        error: error.message || "Could not save local backup.",
      });
    } finally {
      endOperation(operationName);
    }
  }



    if (req.method === "POST" && url.pathname === "/firestore-backup") {
    try {
      const body = await readBody(req, 4096);

      if (body.trim() !== "") {
        return send(res, 400, {
          ok: false,
          error: "This endpoint accepts no request body.",
        });
      }
    } catch {
      return send(res, 400, {
        ok: false,
        error: "Invalid request body.",
      });
    }

    if (!fs.existsSync(BACKUP_SCRIPT)) {
      return send(res, 500, {
        ok: false,
        error: "The approved backup script was not found.",
      });
    }

    const operationName = "firestore-backup";

    if (!beginOperation(operationName)) {
      return send(res, 409, {
        ok: false,
        error: shuttingDown
          ? "Backup Helper is shutting down."
          : `Another operation is already running: ${activeOperation}.`,
      });
    }

    const output = [];
    const startedAt = new Date().toISOString();
    let finished = false;
    let timedOut = false;
    let spawnError = null;
    let timeout;

    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        BACKUP_SCRIPT,
      ],
      {
        cwd: PROJECT,
        windowsHide: true,
        env: { ...process.env, FIRESTORE_EMULATOR_HOST: "" },
      }
    );

    const finish = (status, result) => {
      if (finished) return;
      finished = true;

      clearTimeout(timeout);
      endOperation(operationName);

      send(res, status, result);
    };

    timeout = setTimeout(() => {
      if (finished) return;

      timedOut = true;
      output.push("\nBackup timed out after five minutes.");
      child.kill();
    }, 5 * 60 * 1000);

    child.stdout.on("data", data => output.push(data.toString()));
    child.stderr.on("data", data => output.push(data.toString()));

    child.on("error", error => {
      spawnError = error;
      output.push(`\nProcess error: ${error.message}`);
    });

    child.on("close", code => {
      const finishedAt = new Date().toISOString();
      const outputText = output.join("").slice(-18000);

      if (timedOut) {
        return finish(500, {
          ok: false,
          startedAt,
          finishedAt,
          exitCode: code,
          error: "Backup timed out. The process has exited. Check the backup log.",
          output: outputText,
        });
      }

      if (spawnError) {
        return finish(500, {
          ok: false,
          startedAt,
          finishedAt,
          error: "Could not start or complete the approved backup script.",
          detail: spawnError.message,
          output: outputText,
        });
      }

      return finish(code === 0 ? 200 : 500, {
        ok: code === 0,
        startedAt,
        finishedAt,
        exitCode: code,
        output: outputText,
        message:
          code === 0
            ? "Backup script completed. Review its verification result."
            : "Backup failed. Review the output and log.",
      });
    });

    return;
  }


  
  if (req.method === "POST" && url.pathname === "/verify-backup") {
    if (activeOperation !== null || shuttingDown) {
      return send(res, 409, {
        ok: false,
        error: "A backup is currently running. Try verification again later.",
      });
    }

    try {
      const body = await readBody(req, 4096);
      const data = JSON.parse(body);

      if (
        !data ||
        typeof data.fileName !== "string" ||
        !/^orbitz-firestore-backup-.*\.json$/i.test(data.fileName) ||
        data.fileName.includes("..") ||
        /[\\/]/.test(data.fileName)
      ) {
        return send(res, 400, {
          ok: false,
          error: "Provide an approved JSON backup filename only.",
        });
      }

      const backupDir = path.resolve("C:\\OrbitzBackups\\Daily");
      const jsonFile = path.resolve(backupDir, data.fileName);

      if (path.dirname(jsonFile) !== backupDir) {
        return send(res, 400, {
          ok: false,
          error: "Backup path is outside the approved directory.",
        });
      }

      if (!fs.existsSync(VERIFY_SCRIPT) || !fs.existsSync(jsonFile)) {
        return send(res, 404, {
          ok: false,
          error: "The verification script or selected backup was not found.",
        });
      }

            const output = [];
      const operationName = "verify-backup";

      if (!beginOperation(operationName)) {
        return send(res, 409, {
          ok: false,
          error: shuttingDown
            ? "Backup Helper is shutting down."
            : `Another operation is already running: ${activeOperation}.`,
        });
      }

      const child = spawn(

        process.execPath,
        [VERIFY_SCRIPT, "--verify-only", jsonFile],
        {
          cwd: PROJECT,
          windowsHide: true,
          env: { ...process.env, FIRESTORE_EMULATOR_HOST: "" },
        }
      );

            let finished = false;
      let timedOut = false;
      let spawnError = null;
      let timeout;

      const finish = (status, result) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        endOperation(operationName);
        send(res, status, result);
      };

      timeout = setTimeout(() => {
        if (finished) return;

        timedOut = true;
        child.kill();
      }, 2 * 60 * 1000);

      child.stdout.on("data", data => output.push(data.toString()));
      child.stderr.on("data", data => output.push(data.toString()));

      child.on("error", error => {
        spawnError = error;
      });

      child.on("close", code => {
        const text = output.join("").slice(-18000);

        if (timedOut) {
          return finish(500, {
            ok: false,
            error: "Verification timed out. The process has exited.",
            exitCode: code,
            output: text,
          });
        }

        if (spawnError) {
          return finish(500, {
            ok: false,
            error: "Could not start or complete the verification script.",
            detail: spawnError.message,
            output: text,
          });
        }

        return finish(code === 0 ? 200 : 422, {
          ok: code === 0,
          message: code === 0
            ? "Backup verification passed."
            : "Backup verification failed.",
          output: text,
        });
      });


      return;
    } catch (error) {
      return send(res, 400, {
        ok: false,
        error: error.message || "Invalid verification request.",
      });
    }
  }


  return send(res, 404, { ok: false, error: "Endpoint not found." });
});

server.on("error", error => {
  console.error("Helper server error:", error.message);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log("Orbitz Backup Helper v3 started.");
  console.log(`Computer: ${os.hostname()}`);
  console.log(`Status: http://${HOST}:${PORT}/status`);
  
  console.log("Local JSON backups: enabled.");
  console.log("Firestore restore: disabled.");
  console.log("No scheduled backups are enabled.");
});
