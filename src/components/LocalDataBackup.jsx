
import React, { useRef, useState } from "react";
import { auth } from "../firebase";

const LOCAL_BACKUP_KEYS = [
  "orbitzQuotationDrafts",
  "orbitzWorkingCopy",
  "taxInvoices",
  "deletedTaxInvoices",
  "orbitz_itinerary_templates",
  "orbitzDraftsFirestoreMigrationV1",
];

const AI_PROPOSAL_PREFIX = "orbitz_ai_proposal_draft_";
const BACKUP_FORMAT = "orbitz-local-storage-backup";
const BACKUP_VERSION = 1;

function getLocalStorageKeys() {
  const keys = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }

  return keys;
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function downloadJson(content, filename) {
  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Delay revocation so the browser has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createBackupObject() {
  const allKeys = getLocalStorageKeys();

  const selectedKeys = new Set(
    LOCAL_BACKUP_KEYS.filter((key) => allKeys.includes(key))
  );

  allKeys.forEach((key) => {
    if (key.startsWith(AI_PROPOSAL_PREFIX)) selectedKeys.add(key);
  });

  const records = {};
  const errors = [];

  selectedKeys.forEach((key) => {
    try {
      const rawValue = localStorage.getItem(key);

      records[key] = {
        value: rawValue === null ? null : safeParse(rawValue),
        storageType: key.startsWith(AI_PROPOSAL_PREFIX)
          ? "aiProposalDraft"
          : "registeredLocalData",
      };
    } catch (error) {
      errors.push({
        key,
        message: error?.message || "Unable to read this key",
      });
    }
  });

  const excludedKeys = allKeys.filter((key) => !selectedKeys.has(key));

  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    source: "Current browser profile",
    backupScope: {
      registeredKeys: LOCAL_BACKUP_KEYS,
      aiProposalDraftPrefix: AI_PROPOSAL_PREFIX,
      discoveredLocalStorageKeys: allKeys,
      discoveredKeyCount: allKeys.length,
      exportedKeyCount: Object.keys(records).length,
      excludedKeys,
      excludedKeyCount: excludedKeys.length,
    },
    records,
    errors,
    limitations: [
      "This backup covers localStorage only in the current browser profile.",
      "It does not include Firestore data.",
      "It does not include sessionStorage, IndexedDB, cookies, or files outside this browser.",
      "Only the registered keys and matching AI proposal draft keys are exported.",
      "A successful export does not prove that the data can be restored.",
    ],
  };
}

function validateBackup(backup) {
  if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
    throw new Error("The selected file must contain a JSON object.");
  }

  if (
    backup.format !== BACKUP_FORMAT ||
    backup.formatVersion !== BACKUP_VERSION
  ) {
    throw new Error("Unsupported local backup format or version.");
  }

  if (
    !backup.records ||
    typeof backup.records !== "object" ||
    Array.isArray(backup.records)
  ) {
    throw new Error("The backup has no valid records object.");
  }

  const keys = Object.keys(backup.records);

  if (keys.length === 0) {
    throw new Error("The backup contains no records to restore.");
  }

  keys.forEach((key) => {
    const record = backup.records[key];

    if (
      !key ||
      !record ||
      typeof record !== "object" ||
      !Object.prototype.hasOwnProperty.call(record, "value")
    ) {
      throw new Error(`Invalid record structure for key: ${key}`);
    }

    const supported =
      LOCAL_BACKUP_KEYS.includes(key) ||
      key.startsWith(AI_PROPOSAL_PREFIX);

    if (!supported) {
      throw new Error(`Unsupported local-storage key in backup: ${key}`);
    }

    if (
      record.storageType !== "registeredLocalData" &&
      record.storageType !== "aiProposalDraft"
    ) {
      throw new Error(`Invalid storage type for key: ${key}`);
    }

    if (
      key.startsWith(AI_PROPOSAL_PREFIX) &&
      record.storageType !== "aiProposalDraft"
    ) {
      throw new Error(`AI proposal record has an invalid type: ${key}`);
    }
  });

  return keys;
}


export default function LocalDataBackup() {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("");
  
  const [helperConnected, setHelperConnected] = useState(false);
  const [helperBusy, setHelperBusy] = useState(false);


  const [lastSummary, setLastSummary] = useState(null);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [overwrite, setOverwrite] = useState(false);
  const [restoring, setRestoring] = useState(false);


  
  
    async function connectHelper() {
    setHelperBusy(true);

    setStatus("Checking Backup Helper connection...");

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Sign in before checking the Backup Helper connection.");
      }

      const firebaseIdToken = await currentUser.getIdToken();

      const response = await fetch("/api/backup-helper/status", {
        method: "GET",
        headers: {
          "X-Firebase-ID-Token": firebaseIdToken,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Firebase authentication is required. Sign in again."
            : response.status === 403
              ? "Active Admin access is required."
              : `Backup Controller status returned HTTP ${response.status}.`
        );
      }

      const data = await response.json();
      const helper = data.helper;

      if (
        data.service !== "Orbitz Backup Controller" ||
        data.version !== 2
      ) {
        throw new Error("The expected Backup Controller v2 was not found.");
      }

      if (
        !data.helperRunning ||
        helper?.service !== "Orbitz Backup Helper" ||
        helper?.version !== 3 ||
        !helper.capabilities?.includes("local-json-backup") ||
        !helper.capabilities?.includes("local-pre-restore-safety-copy")
      ) {
        throw new Error(
          "The Backup Helper is not running or its expected v3 capabilities were not found."
        );
      }

     
      if (!data.helperAuthenticated) {
        throw new Error(
          "The Controller could not verify Helper authentication. Confirm that the Controller owns the running Helper."
        );
      }


      setHelperConnected(true);
      setStatus(
        `Connected to Backup Helper v${helper.version} on ${helper.computer}.`
      );
    } catch (error) {
      console.error("Orbitz helper connection error:", error);

      setHelperConnected(false);
      setStatus(
        `Helper connection failed.\n` +
        `Error name: ${error?.name || "Unknown"}\n` +
        `Error message: ${error?.message || String(error)}\n` +
        "Check the browser console for details."
      );
    } finally {
      setHelperBusy(false);
    }
  }




  
   async function createBackup() {
    if (!helperConnected) {
      setStatus("Connect the Backup Helper before saving to the backup folder.");
      return;
    }

    setHelperBusy(true);
    setStatus("Creating local JSON backup...");

    try {
      const backup = createBackupObject();

      if (backup.errors.length > 0) {
        throw new Error(
          "Some local-storage keys could not be read. No backup file was saved. Review the errors before continuing."
        );
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please sign in before creating a local backup.");
      }

      const firebaseIdToken = await currentUser.getIdToken();

      const response = await fetch(
        "/api/backup-helper/local-backups",
        {
          method: "POST",
          headers: {
            "X-Firebase-ID-Token": firebaseIdToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backup),
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || `Save failed (HTTP ${response.status}).`
        );
      }

      setLastSummary({
        exportedKeys: result.recordCount,
        readErrors: backup.errors.length,
        excludedKeys: backup.backupScope.excludedKeyCount,
      });

      setStatus(
        `Local JSON backup saved successfully.\n` +
        `File: ${result.fullPath}\n` +
        `Keys saved: ${result.recordCount}\n` +
        `Excluded keys: ${backup.backupScope.excludedKeyCount}`
      );
    } catch (error) {
      setLastSummary(null);
      setStatus(
        `Local backup failed: ${error?.message || "Unexpected error"}`
      );
    } finally {
      setHelperBusy(false);
    }
  }



  async function handleFileSelected(event) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after correcting an issue.
    event.target.value = "";

    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const keys = validateBackup(backup);

      setSelectedBackup(backup);
      setSelectedKeys(keys);
      setOverwrite(false);
      setStatus(
        `Backup validated. Created: ${backup.createdAt || "Unknown date"}. ` +
          `${keys.length} local-storage keys are available for review. Nothing has been restored yet.`
      );
    } catch (error) {
      setSelectedBackup(null);
      setSelectedKeys([]);
      setStatus(`Cannot import this file: ${error?.message || "Invalid JSON"}`);
    }
  }



  
  async function restoreBackup() {
    if (!selectedBackup || restoring) return;

        if (!helperConnected) {
      setStatus("Connect the Backup Helper before restoring. A safety copy must be saved first.");
      return;
    }

    const conflicts = selectedKeys.filter(
      (key) => localStorage.getItem(key) !== null
    );

    const keysToRestore = selectedKeys.filter(
      (key) => overwrite || localStorage.getItem(key) === null
    );

    if (keysToRestore.length === 0) {
      setStatus(
        "Nothing to restore: all selected keys already exist, and merge mode preserves them."
      );
      return;
    }

    const modeText = overwrite
      ? "OVERWRITE matching local-storage keys"
      : "merge without overwriting existing keys";

    const confirmed = window.confirm(
      `Restore ${keysToRestore.length} key(s) using ${modeText}?\n\n` +
        `Existing keys: ${conflicts.length}\n` +
        `Keys to restore: ${keysToRestore.length}\n\n` +
        "The current local data will first be saved to the backup folder. Continue?"
    );

    if (!confirmed) return;

    setRestoring(true);
    setHelperBusy(true);
    setStatus("Saving pre-restore safety copy...");

    try {
      const safetyBackup = createBackupObject();

      if (safetyBackup.errors.length > 0) {
        throw new Error(
          "The safety copy has read errors. No data was restored."
        );
      }

            const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error(
          "Please sign in before creating the pre-restore safety copy. No data was restored."
        );
      }

      const firebaseIdToken = await currentUser.getIdToken();

      const safetyResponse = await fetch(
        "/api/backup-helper/local-backups/pre-restore",
        {
          method: "POST",
          headers: {
            "X-Firebase-ID-Token": firebaseIdToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(safetyBackup),
          cache: "no-store",
        }
      );

      const safetyResult = await safetyResponse.json();

      
if (
  !safetyResponse.ok ||
  !safetyResult.ok ||
  !safetyResult.fullPath ||
  !Number.isInteger(safetyResult.recordCount) ||
  safetyResult.recordCount < 0
) {

        throw new Error(
          safetyResult.error ||
            "The helper did not confirm the pre-restore safety copy. No data was restored."
        );
      }

      // Capture destination values before changing anything.
      const originalValues = new Map();
      const appliedKeys = [];

      try {
        for (const key of keysToRestore) {
          originalValues.set(key, localStorage.getItem(key));

          const serialized = JSON.stringify(
            selectedBackup.records[key].value
          );

          if (typeof serialized !== "string") {
            throw new Error(`Could not serialize key: ${key}`);
          }

          appliedKeys.push(key);
localStorage.setItem(key, serialized);
        }
      } catch (error) {
        const rollbackErrors = [];

        for (const key of appliedKeys.reverse()) {
          try {
            const original = originalValues.get(key);

            if (original === null) {
              localStorage.removeItem(key);
            } else {
              localStorage.setItem(key, original);
            }
          } catch {
            rollbackErrors.push(key);
          }
        }

        throw new Error(
          `${error?.message || "Restore failed"}${
            rollbackErrors.length
              ? ` Rollback also failed for: ${rollbackErrors.join(", ")}.`
              : " Changes made by this attempt were rolled back."
          }`
        );
      }

      setLastSummary({
        restoredKeys: appliedKeys.length,
        skippedKeys: overwrite ? 0 : conflicts.length,
        excludedKeys:
          selectedBackup.backupScope?.excludedKeyCount ?? "Unknown",
      });

      setStatus(
        `Local restore completed. Restored ${appliedKeys.length} key(s).\n` +
          `${overwrite
            ? "Matching keys were overwritten where selected."
            : `${conflicts.length} existing key(s) were preserved.`}\n` +
          `Pre-restore safety copy: ${safetyResult.fullPath}\n` +
          "Reload the application and verify the restored data."
      );

      setSelectedBackup(null);
      setSelectedKeys([]);
      setOverwrite(false);
    } catch (error) {
      setStatus(
        `Restore stopped: ${error?.message || "Unexpected error"}`
      );
    } finally {
      setRestoring(false);
      setHelperBusy(false);
    }
  }




  return (
    <section
      style={{
        padding: 14,
        border: "1px solid #d9dee7",
        borderRadius: 10,
        background: "#ffffff",
        color: "#1f2937",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Local Data Backup</h2>
          <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>
            Export or restore supported local data for this browser profile.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={createBackup}
            style={{
              padding: "9px 12px",
              border: 0,
              borderRadius: 7,
              background: "#174ea6",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Export Local Data JSON
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={restoring}
            style={{
              padding: "9px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 7,
              background: "#ffffff",
              color: "#1f2937",
              cursor: restoring ? "wait" : "pointer",
              fontWeight: 600,
            }}
          >
            Import / Restore JSON
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />


      
      <div
        style={{
          marginTop: 12,
          padding: 10,
          border: "1px solid #d9dee7",
          borderRadius: 8,
          background: "#f8fafc",
        }}
      >
        <strong style={{ fontSize: 13 }}>Local Backup Helper</strong>
        <p style={{ margin: "5px 0 8px", color: "#64748b", fontSize: 12 }}>
          Destination: C:\OrbitzBackups\Local Data Backups
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
         

          <button
            type="button"
            onClick={connectHelper}
            disabled={helperBusy || restoring}
            style={{
              padding: "9px 12px",
              border: 0,
              borderRadius: 7,
              background: "#334155",
              color: "#ffffff",
              cursor: helperBusy || restoring ? "wait" : "pointer",
              fontWeight: 600,
            }}
          >
            {helperBusy ? "Connecting..." : "Connect Helper"}
          </button>
        </div>

        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
          {helperConnected
            ? "Helper connected. Local JSON backup actions are available."
            : "Start the helper separately, then enter its token to connect."}
        </p>
      </div>



      <p style={{ margin: "10px 0 0", color: "#8a4b08", fontSize: 12 }}>
        Local storage only. This does not restore Firestore, cookies,
        IndexedDB, session storage, or data excluded from the export.
        Keep backup files private.
      </p>

      {selectedBackup && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            background: "#f8fafc",
          }}
        >
          <strong>Restore preview</strong>
          <p style={{ margin: "6px 0", fontSize: 13 }}>
            Backup date: {selectedBackup.createdAt || "Unknown"}
          </p>
          <p style={{ margin: "6px 0", fontSize: 13 }}>
            Supported keys in file: {selectedKeys.length}
          </p>
          <p style={{ margin: "6px 0", fontSize: 13 }}>
            Existing destination keys:{" "}
            {
              selectedKeys.filter(
                (key) => localStorage.getItem(key) !== null
              ).length
            }
          </p>

          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginTop: 10,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(event) => setOverwrite(event.target.checked)}
              disabled={restoring}
            />
            <span>
              <strong>Overwrite matching keys</strong>
              <br />
              Replace existing values with values from the selected backup.
              Leave unchecked to merge without overwriting existing keys.
            </span>
          </label>

          {overwrite && (
            <p style={{ color: "#92400e", fontSize: 12 }}>
              Overwrite mode replaces matching local data. Confirm carefully.
            </p>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={restoreBackup}
              disabled={restoring}
              style={{
                padding: "9px 12px",
                border: 0,
                borderRadius: 7,
                background: overwrite ? "#b91c1c" : "#166534",
                color: "#ffffff",
                cursor: restoring ? "wait" : "pointer",
                fontWeight: 600,
              }}
            >
              {restoring ? "Restoring..." : "Confirm Local Restore"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedBackup(null);
                setSelectedKeys([]);
                setOverwrite(false);
                setStatus("Restore cancelled. No data was changed.");
              }}
              disabled={restoring}
              style={{
                padding: "9px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 7,
                background: "#ffffff",
                cursor: restoring ? "wait" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status && (
        <p
          role="status"
          style={{
            marginTop: 12,
            marginBottom: 0,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            fontSize: 13,
          }}
        >
          {status}
        </p>
      )}

      {lastSummary && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: "#f3f6fa",
            fontSize: 13,
          }}
        >
          {lastSummary.exportedKeys !== undefined && (
            <>
              <div>Keys exported: {lastSummary.exportedKeys}</div>
              <div>Read errors: {lastSummary.readErrors}</div>
              <div>Excluded keys: {lastSummary.excludedKeys}</div>
            </>
          )}
          {lastSummary.restoredKeys !== undefined && (
            <>
              <div>Keys restored: {lastSummary.restoredKeys}</div>
              <div>Keys preserved/skipped: {lastSummary.skippedKeys}</div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
