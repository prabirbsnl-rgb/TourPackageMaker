


import { useEffect, useState } from "react";
import { auth } from "../firebase";
import LocalDataBackup from "./LocalDataBackup";



export default function BackupRecoveryCenter({ onBack }) {
 
  const [connectionStatus, setConnectionStatus] = useState("unchecked");
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [verifyPanelOpen, setVerifyPanelOpen] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupResult, setBackupResult] = useState(null);
  const [showBackupDetails, setShowBackupDetails] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [controllerStatus, setControllerStatus] = useState(null);
  const [helperAction, setHelperAction] = useState("");
  const [helperActionMessage, setHelperActionMessage] = useState(null);
  const [serviceManagerStatus, setServiceManagerStatus] = useState(null);
  const [serviceManagerAction, setServiceManagerAction] = useState("");
  const [serviceManagerActionMessage, setServiceManagerActionMessage] = useState(null);
  const [controllerAction, setControllerAction] = useState("");
  const [controllerActionMessage, setControllerActionMessage] = useState(null);


  const sectionStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "18px",
  };

  const actionStyle = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    minWidth: 0,
  };

  const buttonStyle = {
    padding: "9px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    marginBottom: "12px",
    fontSize: "13px",
  };

  
  async function checkConnection() {
    setCheckingConnection(true);
    setConnectionStatus("checking");

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Sign in before checking the Backup Helper connection.");
      }

      const firebaseIdToken = await currentUser.getIdToken();

      
      // Check the Service Manager separately from the existing Helper connection.
      try {
        const managerResponse = await fetch(
          "/api/backup-service-manager/status",
          {
            method: "GET",
            headers: {
              "X-Firebase-ID-Token": firebaseIdToken,
            },
            cache: "no-store",
          }
        );

        const managerData = await managerResponse.json().catch(() => ({}));

        if (
          managerResponse.ok &&
          managerData.ok === true &&
          managerData.service === "Orbitz Backup Service Manager" &&
          managerData.version === 1
        ) {
          setServiceManagerStatus(managerData);
        } else {
          setServiceManagerStatus(null);
        }
      } catch (managerError) {
        console.error("Orbitz Backup Service Manager status error:", managerError);
        setServiceManagerStatus(null);
      }


      const response = await fetch("/api/backup-helper/status", {
        method: "GET",
        headers: {
          "X-Firebase-ID-Token": firebaseIdToken,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      const controllerAvailable =
  response.ok &&
  data.ok === true &&
  data.service === "Orbitz Backup Controller" &&
  data.version === 2;

if (controllerAvailable) {
  setControllerStatus(data);

  const helperConnected =
    data.helperRunning === true &&
    data.helperAuthenticated === true &&
    data.helper?.service === "Orbitz Backup Helper" &&
    data.helper?.version === 3;

  setConnectionStatus(helperConnected ? "connected" : "disconnected");
} else {
  setControllerStatus(null);
  setConnectionStatus("disconnected");
}

    } catch (error) {
  console.error("Orbitz Backup Center connection error:", error);
  setControllerStatus(null);
  setConnectionStatus("disconnected");
} finally {
      setCheckingConnection(false);
    }
  }


    useEffect(() => {
    checkConnection();
  }, []);



  
async function refreshControllerStatus() {
  setCheckingConnection(true);

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Sign in before checking the Backup Controller.");
    }

    const firebaseIdToken = await currentUser.getIdToken();

    const response = await fetch(
      "/api/backup-service-manager/status",
      {
        method: "GET",
        headers: {
          "X-Firebase-ID-Token": firebaseIdToken,
        },
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (
      !response.ok ||
      data.ok !== true ||
      data.service !== "Orbitz Backup Service Manager" ||
      data.version !== 1
    ) {
      setServiceManagerStatus(null);
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : `Service Manager status check failed (HTTP ${response.status}).`
      );
    }



    console.log("Backup Service Manager status:", {
  controllerReachable: data.controllerReachable,
  controller: data.controller,
  managerShuttingDown: data.managerShuttingDown,
});



setControllerActionMessage(null);

    setServiceManagerStatus(data);
  } catch (error) {
    setServiceManagerStatus(null);
    console.error("Orbitz Backup Controller status error:", error);

    setControllerActionMessage({
      type: "error",
      text:
        error instanceof Error
          ? error.message
          : "Could not refresh the Controller status.",
    });
  } finally {
    setCheckingConnection(false);
  }
}



  
async function runHelperAction(action) {
  if (action !== "start" && action !== "stop") return;

  setHelperAction(action);
  setHelperActionMessage(null);

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Sign in before managing the Backup Helper.");
    }

    const firebaseIdToken = await currentUser.getIdToken();

    const response = await fetch(`/api/backup-helper/${action}`, {
      method: "POST",
      headers: {
        "X-Firebase-ID-Token": firebaseIdToken,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok !== true) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : `The Helper ${action} request failed (HTTP ${response.status}).`
      );
    }

    setHelperActionMessage({
      type: "success",
      text:
        typeof data.message === "string"
          ? data.message
          : `Helper ${action} request accepted.`,
    });

    await checkConnection();
  } catch (error) {
    setHelperActionMessage({
      type: "error",
      text:
        error instanceof Error
          ? error.message
          : "The Helper action failed. Check the connection and status.",
    });

    console.error("Orbitz Backup Helper action error:", error);
  } finally {
    setHelperAction("");
  }
}




async function runServiceManagerAction(action) {
  if (action !== "start" && action !== "stop") return;

  setServiceManagerAction(action);
  setServiceManagerActionMessage(null);

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Sign in before managing the Backup Service Manager.");
    }

    const firebaseIdToken = await currentUser.getIdToken();
    const endpoint =
      action === "start"
        ? "/api/backup-service-manager/start"
        : "/api/backup-service-manager/shutdown";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Firebase-ID-Token": firebaseIdToken,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok !== true) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : `The Service Manager ${action} request failed (HTTP ${response.status}).`
      );
    }

    if (action === "start") {
      await refreshControllerStatus();
    } else {
      setServiceManagerStatus(null);
    }

    setServiceManagerActionMessage({
      type: "success",
      text:
        typeof data.message === "string"
          ? data.message
          : `Service Manager ${action} request completed.`,
    });
  } catch (error) {
    setServiceManagerActionMessage({
      type: "error",
      text:
        error instanceof Error
          ? error.message
          : "The Service Manager action failed. Check the connection and status.",
    });

    console.error("Orbitz Backup Service Manager action error:", error);
  } finally {
    setServiceManagerAction("");
  }
}


async function runControllerAction(action) {
  if (action !== "start" && action !== "stop") return;

  setControllerAction(action);
  setControllerActionMessage(null);

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Sign in before managing the Backup Controller.");
    }

    const firebaseIdToken = await currentUser.getIdToken();

    const response = await fetch(
      `/api/backup-service-manager/controller/${action}`,
      {
        method: "POST",
        headers: {
          "X-Firebase-ID-Token": firebaseIdToken,
        },
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok !== true) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : `The Controller ${action} request failed (HTTP ${response.status}).`
      );
    }

        await refreshControllerStatus();

    setControllerActionMessage({
      type: "success",
      text:
        typeof data.message === "string"
          ? data.message
          : `Controller ${action} request accepted.`,
    });


  } catch (error) {
    setControllerActionMessage({
      type: "error",
      text:
        error instanceof Error
          ? error.message
          : "The Controller action failed. Check the connection and status.",
    });

    console.error("Orbitz Backup Controller action error:", error);
  } finally {
    setControllerAction("");
  }
}





  async function handleVerify() {
   

    if (!selectedFile) {
      setResult({
        ok: false,
        message: "Select a JSON backup file first.",
      });
      setShowDetails(false);
      return;
    }

    if (!/^orbitz-firestore-backup-.*\.json$/i.test(selectedFile.name)) {
      setResult({
        ok: false,
        message: "Select a valid Orbitz Firestore backup JSON filename.",
      });
      setShowDetails(false);
      return;
    }

    setVerifying(true);
    setResult(null);
    setShowDetails(false);

    try {
            const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please sign in before verifying a backup.");
      }

      const firebaseIdToken = await currentUser.getIdToken();

      const response = await fetch("/api/backup-helper/verify-backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Firebase-ID-Token": firebaseIdToken,
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
        }),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));
      const output = data.output || "";
      const checksumMatch = output.match(
        /JSON checksum verified:\s*([a-f0-9]{64})/i
      );
      const countMatch = output.match(/Documents verified:\s*(\d+)/i);
      const jsonMatch = output.match(/JSON:\s*(.+\.json)\s*$/im);
      const xlsxMatch = output.match(/XLSX:\s*(.+\.xlsx)\s*$/im);
      const jsonCountMatch = output.match(/JSON records:\s*(\d+)/i);

      const passed =
        response.ok &&
        data.ok === true &&
        /STRUCTURED BACKUP PASS/.test(output) &&
        Boolean(checksumMatch) &&
        Boolean(countMatch) &&
        Boolean(xlsxMatch) &&
        Number(countMatch?.[1]) === Number(jsonCountMatch?.[1]);

      setConnectionStatus(
        response.status === 401 || response.status === 403
          ? "disconnected"
          : "connected"
      );

      setResult({
        ok: passed,
        message: passed
          ? "Backup verification passed."
          : data.message ||
            data.error ||
            "Verification did not pass all expected checks.",
        fileName: selectedFile.name,
        verifiedAt: new Date().toLocaleString(),
        checksum: checksumMatch?.[1] || null,
        documentCount: countMatch ? Number(countMatch[1]) : null,
        jsonRecordCount: jsonCountMatch
          ? Number(jsonCountMatch[1])
          : null,
        jsonPath: jsonMatch?.[1]?.trim() || null,
        xlsxPath: xlsxMatch?.[1]?.trim() || null,
        output,
        detail: data.detail || "",
      });

      setControlsExpanded(passed ? false : true);


    } catch (error) {
      setConnectionStatus("disconnected");
      setResult({
        ok: false,
        message:
          "Could not reach the Backup Helper. Check that it is running and reconnect.",
        detail: error.message,
        fileName: selectedFile.name,
        verifiedAt: new Date().toLocaleString(),
        output: "",
      });
    } finally {
      setVerifying(false);
    }
  }

  const statusInfo = {
    unchecked: {
      label: "Not checked",
      color: "#64748b",
      background: "#f1f5f9",
    },
    checking: {
      label: "Checking...",
      color: "#92400e",
      background: "#fef3c7",
    },
    connected: {
      label: "Connected",
      color: "#166534",
      background: "#dcfce7",
    },
    disconnected: {
      label: "Disconnected",
      color: "#991b1b",
      background: "#fee2e2",
    },
  }[connectionStatus];


  async function handleCreateBackup() {
   const currentUser = auth.currentUser;

  if (!currentUser) {
    setBackupResult({
      ok: false,
      message: "Please sign in before creating a backup.",
    });
    return;
  }

  setCreatingBackup(true);
setBackupResult(null);
setShowBackupDetails(false);
setSummaryCollapsed(false);

  const startedAt = new Date().toLocaleString();

    try {
    const firebaseIdToken = await currentUser.getIdToken();

    const response = await fetch("/api/backup-helper/firestore-backup", {
      method: "POST",
      headers: {
        "X-Firebase-ID-Token": firebaseIdToken,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
   
    const output = data.output || "";

    const checksumMatch = output.match(
      /JSON checksum verified:\s*([a-f0-9]{64})/i
    );
    const documentCountMatch = output.match(
      /Documents verified:\s*(\d+)/i
    );
    const jsonCountMatch = output.match(/JSON records:\s*(\d+)/i);
    const jsonPathMatch = output.match(/JSON:\s*(.+\.json)\s*$/im);
    const xlsxPathMatch = output.match(/XLSX:\s*(.+\.xlsx)\s*$/im);

    const verified =
      response.ok &&
      data.ok === true &&
      /STRUCTURED BACKUP PASS/.test(output) &&
      Boolean(checksumMatch) &&
      Boolean(documentCountMatch) &&
      Boolean(jsonPathMatch) &&
      Boolean(xlsxPathMatch) &&
      Number(documentCountMatch?.[1]) === Number(jsonCountMatch?.[1]);

    setBackupResult({
      ok: verified,
      message: verified
        ? "Backup created and verification passed."
        : data.error ||
          data.message ||
          "Backup could not be confirmed as successful.",
      startedAt: data.startedAt
        ? new Date(data.startedAt).toLocaleString()
        : startedAt,
      finishedAt: data.finishedAt
        ? new Date(data.finishedAt).toLocaleString()
        : new Date().toLocaleString(),
      jsonFile: jsonPathMatch?.[1]?.trim() || null,
      xlsxFile: xlsxPathMatch?.[1]?.trim() || null,
      checksum: checksumMatch?.[1] || null,
      documentCount: documentCountMatch
        ? Number(documentCountMatch[1])
        : null,
      jsonRecordCount: jsonCountMatch
        ? Number(jsonCountMatch[1])
        : null,
      output,
      detail: data.detail || "",
    });

  } catch (error) {
    setBackupResult({
      ok: false,
      message: "Could not reach the Backup Helper.",
      detail: error.message,
      startedAt,
      finishedAt: new Date().toLocaleString(),
      output: "",
    });
  } finally {
    setCreatingBackup(false);
  }
}




  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "26px" }}>
            Backup &amp; Recovery Center
          </h1>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Manage manual backups and recovery for Orbitz Holidays.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "10px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Workspace
        </button>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "19px" }}>
          Firestore Backup &amp; Recovery
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.6 }}>
          Use the verified manual JSON and XLSX backup workflow.
          Backup creation and restoration remain disconnected.
          Verification checks backup integrity without modifying
          production records.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            alignItems: "start",
          }}
        >
          
          <div style={actionStyle}>
            <h3 style={{ marginTop: 0 }}>Create Backup</h3>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Manually create the structured JSON and XLSX backup.
              This runs the approved local backup workflow.
            </p>

            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #1d4ed8",
                borderRadius: "7px",
                background: creatingBackup ? "#94a3b8" : "#1d4ed8",
                color: "#ffffff",
                fontWeight: 600,
                cursor: creatingBackup ? "wait" : "pointer",
              }}
            >
              {creatingBackup ? "Creating Backup..." : "Create Backup"}
            </button>

            {creatingBackup && (
              <p style={{ color: "#92400e", fontSize: "13px" }}>
                Backup is running. Keep the helper window open and wait for
                the result.
              </p>
            )}

            
            {backupResult && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  border: `1px solid ${
                    backupResult.ok ? "#86efac" : "#fca5a5"
                  }`,
                  borderRadius: "8px",
                  background: backupResult.ok ? "#f0fdf4" : "#fef2f2",
                  color: backupResult.ok ? "#166534" : "#991b1b",
                  fontSize: "13px",
                  overflowWrap: "anywhere",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                 
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    {backupResult.ok
                      ? "Backup successful"
                      : "Backup not confirmed"}
                  </strong>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        setSummaryCollapsed((current) => !current)
                      }
                      style={{
                        padding: "5px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        background: "#ffffff",
                        color: "#334155",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {summaryCollapsed ? "Expand Summary" : "Collapse Summary"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBackupResult(null);
                        setShowBackupDetails(false);
                        setSummaryCollapsed(false);
                      }}
                      title="Reset to Create Backup"
                      aria-label="Reset backup result"
                      style={{
                        padding: "5px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        background: "#ffffff",
                        color: "#334155",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reset ×
                    </button>
                  </div>
                </div>

                </div>


                 {!summaryCollapsed && (
                  <>

                <p style={{ margin: "7px 0" }}>
                  {backupResult.message}
                </p>

                {backupResult.startedAt && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      Started
                    </div>
                    <div>{backupResult.startedAt}</div>
                  </div>
                )}

                {backupResult.finishedAt && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      Finished
                    </div>
                    <div>{backupResult.finishedAt}</div>
                  </div>
                )}

                {backupResult.jsonFile && (
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      JSON backup
                    </div>
                    <div style={{ fontWeight: 600, marginTop: "3px" }}>
                      {backupResult.jsonFile.split(/[\\/]/).pop()}
                    </div>
                    <div
                      style={{
                        color: "#475569",
                        fontSize: "11px",
                        marginTop: "3px",
                      }}
                    >
                      {backupResult.jsonFile}
                    </div>
                  </div>
                )}

                {backupResult.xlsxFile && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      Structured XLSX
                    </div>
                    <div style={{ fontWeight: 600, marginTop: "3px" }}>
                      {backupResult.xlsxFile.split(/[\\/]/).pop()}
                    </div>
                    <div
                      style={{
                        color: "#475569",
                        fontSize: "11px",
                        marginTop: "3px",
                      }}
                    >
                      {backupResult.xlsxFile}
                    </div>
                  </div>
                )}

                {backupResult.checksum && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      JSON checksum
                    </div>
                    <div style={{ fontWeight: 600 }}>Verified</div>
                    <code
                      style={{
                        display: "block",
                        fontSize: "10px",
                        marginTop: "4px",
                        overflowWrap: "anywhere",
                        userSelect: "text",
                      }}
                    >
                      {backupResult.checksum}
                    </code>
                  </div>
                )}

                {backupResult.documentCount !== null &&
                  backupResult.documentCount !== undefined && (
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ color: "#475569", fontSize: "12px" }}>
                        Documents verified
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "16px" }}>
                        {backupResult.documentCount}
                        {backupResult.jsonRecordCount !== null &&
                        backupResult.jsonRecordCount !== undefined
                          ? ` / ${backupResult.jsonRecordCount}`
                          : ""}
                      </div>
                    </div>
                  )}

                {backupResult.detail && (
                  <p style={{ marginTop: "10px" }}>
                    {backupResult.detail}
                  </p>
                )}

                {backupResult.output && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        setShowBackupDetails((current) => !current)
                      }
                      style={{
                        padding: "8px 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {showBackupDetails ? "Hide Details" : "View Details"}
                    </button>

                    {showBackupDetails && (
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          maxHeight: "260px",
                          overflowY: "auto",
                          padding: "10px",
                          borderRadius: "6px",
                          background: "#ffffff",
                          color: "#334155",
                          fontSize: "11px",
                          margin: "10px 0 0",
                        }}
                      >
                        {backupResult.output}
                      </pre>
                    )}
                  </div>
                )}

               </>
                )}

              </div>
            )}

          </div>


          <div style={actionStyle}>
            <h3 style={{ marginTop: 0 }}>Verify Backup</h3>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5 }}>
              Verify the JSON checksum, backup structure, companion XLSX
              and document counts. This does not compare against live
              production Firestore.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                Helper status
              </span>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "999px",
                  background: statusInfo.background,
                  color: statusInfo.color,
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {statusInfo.label}
              </span>
            </div>




            {/* Controller-managed Helper controls */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              {controllerStatus?.state === "stopped" &&
                controllerStatus?.helperRunning === false &&
                controllerStatus?.controllerOwnsHelper === false && (
                  <button
                    type="button"
                    onClick={() => runHelperAction("start")}
                    disabled={!!helperAction || checkingConnection}
                    style={{
                      ...buttonStyle,
                      flex: "1 1 140px",
                      background: "#166534",
                      color: "#ffffff",
                      border: "1px solid #166534",
                      opacity: helperAction || checkingConnection ? 0.6 : 1,
                      cursor:
                        helperAction || checkingConnection
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {helperAction === "start" ? "Starting Helper..." : "Start Helper"}
                  </button>
                )}

              {controllerStatus?.state === "running" &&
                controllerStatus?.helperRunning === true &&
                controllerStatus?.helperAuthenticated === true &&
                controllerStatus?.controllerOwnsHelper === true && (
                  <button
                    type="button"
                    onClick={() => runHelperAction("stop")}
                    disabled={!!helperAction || checkingConnection}
                    style={{
                      ...buttonStyle,
                      flex: "1 1 140px",
                      background: "#b91c1c",
                      color: "#ffffff",
                      border: "1px solid #b91c1c",
                      opacity: helperAction || checkingConnection ? 0.6 : 1,
                      cursor:
                        helperAction || checkingConnection
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {helperAction === "stop" ? "Stopping Helper..." : "Stop Helper"}
                  </button>
                )}

              <button
                type="button"
                onClick={checkConnection}
                disabled={checkingConnection || !!helperAction}
                style={{
                  ...buttonStyle,
                  flex: "1 1 140px",
                  opacity: checkingConnection || helperAction ? 0.6 : 1,
                  cursor:
                    checkingConnection || helperAction
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {checkingConnection ? "Refreshing..." : "Refresh Status"}
              </button>
            </div>

            {helperActionMessage && (
              <p
                role="status"
                aria-live="polite"
                style={{
                  margin: "0 0 14px",
                  padding: "9px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  overflowWrap: "anywhere",
                  background:
                    helperActionMessage.type === "success"
                      ? "#f0fdf4"
                      : "#fef2f2",
                  color:
                    helperActionMessage.type === "success"
                      ? "#166534"
                      : "#991b1b",
                  border:
                    helperActionMessage.type === "success"
                      ? "1px solid #86efac"
                      : "1px solid #fca5a5",
                }}
              >
                {helperActionMessage.text}
              </p>
            )}




            {/* Backup Controller lifecycle controls */}
            <div
              style={{
                margin: "0 0 14px",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#f8fafc",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  color: "#0f172a",
                }}
              >
                Backup Controller
              </h3>

              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "12px",
                  color: "#475569",
                }}
              >
                Service Manager:{" "}
                {serviceManagerStatus
                  ? "Connected"
                  : "Unavailable or not yet checked"}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => runServiceManagerAction("start")}
                  disabled={
                    !!serviceManagerAction ||
                    checkingConnection ||
                    !!controllerAction ||
                    !!helperAction ||
                    !!serviceManagerStatus
                  }
                  style={{
                    ...buttonStyle,
                    flex: "1 1 150px",
                    opacity:
                      serviceManagerAction ||
                      checkingConnection ||
                      controllerAction ||
                      helperAction ||
                      serviceManagerStatus
                        ? 0.6
                        : 1,
                    cursor:
                      serviceManagerAction ||
                      checkingConnection ||
                      controllerAction ||
                      helperAction ||
                      serviceManagerStatus
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {serviceManagerAction === "start"
                    ? "Starting Service Manager..."
                    : "Start Service Manager"}
                </button>

                <button
                  type="button"
                  onClick={() => runServiceManagerAction("stop")}
                  disabled={
                    !serviceManagerStatus ||
                    serviceManagerStatus.controllerReachable ||
                    !!serviceManagerAction ||
                    checkingConnection ||
                    !!controllerAction ||
                    !!helperAction
                  }
                  style={{
                    ...buttonStyle,
                    flex: "1 1 150px",
                    opacity:
                      !serviceManagerStatus ||
                      serviceManagerStatus.controllerReachable ||
                      serviceManagerAction ||
                      checkingConnection ||
                      controllerAction ||
                      helperAction
                        ? 0.6
                        : 1,
                    cursor:
                      !serviceManagerStatus ||
                      serviceManagerStatus.controllerReachable ||
                      serviceManagerAction ||
                      checkingConnection ||
                      controllerAction ||
                      helperAction
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {serviceManagerAction === "stop"
                    ? "Stopping Service Manager..."
                    : "Stop Service Manager"}
                </button>
              </div>

              {serviceManagerActionMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{
                    margin: "0 0 12px",
                    padding: "9px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    overflowWrap: "anywhere",
                    background:
                      serviceManagerActionMessage.type === "success"
                        ? "#f0fdf4"
                        : "#fef2f2",
                    color:
                      serviceManagerActionMessage.type === "success"
                        ? "#166534"
                        : "#991b1b",
                    border:
                      serviceManagerActionMessage.type === "success"
                        ? "1px solid #86efac"
                        : "1px solid #fca5a5",
                  }}
                >
                  {serviceManagerActionMessage.text}
                </p>
              )}

              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: "12px",
                  color: "#475569",
                  overflowWrap: "anywhere",
                }}
              >
                
Controller:{" "}
{serviceManagerStatus?.controllerReachable
  ? "Running and authenticated"
  : "Not confirmed as reachable"}

              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => runControllerAction("start")}
                  disabled={
                    !serviceManagerStatus ||
                    !!controllerAction ||
                    checkingConnection ||
                    !!helperAction ||
                    serviceManagerStatus.controllerReachable
                  }
                  style={{
                    ...buttonStyle,
                    flex: "1 1 120px",
                    opacity:
                      !serviceManagerStatus ||
                      controllerAction ||
                      checkingConnection ||
                      helperAction ||
                      serviceManagerStatus.controllerReachable
                        ? 0.6
                        : 1,
                    cursor:
                      !serviceManagerStatus ||
                      controllerAction ||
                      checkingConnection ||
                      helperAction ||
                      serviceManagerStatus.controllerReachable
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {controllerAction === "start"
                    ? "Starting Controller..."
                    : "Start Controller"}
                </button>

                <button
                  type="button"
                  onClick={() => runControllerAction("stop")}
                  disabled={
                    !serviceManagerStatus ||
                    !!controllerAction ||
                    checkingConnection ||
                    !!helperAction ||
                    !serviceManagerStatus.controllerReachable ||
                    serviceManagerStatus.controller?.state !== "stopped" ||
                    serviceManagerStatus.controller?.helperRunning === true ||
                    serviceManagerStatus.controller?.helperAuthenticated === true ||
                    serviceManagerStatus.controller?.controllerOwnsHelper === true
                  }
                  style={{
                    ...buttonStyle,
                    flex: "1 1 120px",
                    opacity:
                      !serviceManagerStatus ||
                      controllerAction ||
                      checkingConnection ||
                      helperAction ||
                      !serviceManagerStatus.controllerReachable ||
                      serviceManagerStatus.controller?.state !== "stopped" ||
                      serviceManagerStatus.controller?.helperRunning === true ||
                      serviceManagerStatus.controller?.helperAuthenticated === true ||
                      serviceManagerStatus.controller?.controllerOwnsHelper === true
                        ? 0.6
                        : 1,
                    cursor:
                      !serviceManagerStatus ||
                      controllerAction ||
                      checkingConnection ||
                      helperAction ||
                      !serviceManagerStatus.controllerReachable ||
                      serviceManagerStatus.controller?.state !== "stopped" ||
                      serviceManagerStatus.controller?.helperRunning === true ||
                      serviceManagerStatus.controller?.helperAuthenticated === true ||
                      serviceManagerStatus.controller?.controllerOwnsHelper === true
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {controllerAction === "stop"
                    ? "Stopping Controller..."
                    : "Stop Controller"}
                </button>

                <button
                  type="button"
                 onClick={refreshControllerStatus}
                  disabled={
                    checkingConnection ||
                    !!helperAction ||
                    !!controllerAction
                  }
                  style={{
                    ...buttonStyle,
                    flex: "1 1 120px",
                    opacity:
                      checkingConnection ||
                      helperAction ||
                      controllerAction
                        ? 0.6
                        : 1,
                    cursor:
                      checkingConnection ||
                      helperAction ||
                      controllerAction
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Refresh Status
                </button>
              </div>

              {controllerActionMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{
                    margin: "12px 0 0",
                    padding: "9px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    overflowWrap: "anywhere",
                    background:
                      controllerActionMessage.type === "success"
                        ? "#f0fdf4"
                        : "#fef2f2",
                    color:
                      controllerActionMessage.type === "success"
                        ? "#166534"
                        : "#991b1b",
                    border:
                      controllerActionMessage.type === "success"
                        ? "1px solid #86efac"
                        : "1px solid #fca5a5",
                  }}
                >
                  {controllerActionMessage.text}
                </p>
              )}
            </div>



            {!verifyPanelOpen && (
              <button
                type="button"
                onClick={() => {
                  setVerifyPanelOpen(true);
                  setControlsExpanded(true);
                  setResult(null);
                  setShowDetails(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #1d4ed8",
                  borderRadius: "7px",
                  background: "#1d4ed8",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Verify Backup
              </button>
            )}





{verifyPanelOpen && controlsExpanded && (
  <>
  
           

            <button
              type="button"
              onClick={checkConnection}
                            disabled={checkingConnection}
              style={{
                ...buttonStyle,
                width: "100%",
                marginBottom: "14px",
                cursor: checkingConnection ? "not-allowed" : "pointer",
                opacity: checkingConnection ? 0.6 : 1,
              }}
            >
              {checkingConnection ? "Checking connection..." : "Check Connection"}
            </button>

            <label
              htmlFor="firestore-backup-file"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              JSON backup file
            </label>
            <input
              id="firestore-backup-file"
              type="file"
              accept=".json,application/json"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] || null);
                setResult(null);
                setShowDetails(false);
              }}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                fontSize: "12px",
                marginBottom: "12px",
              }}
            />

            {selectedFile && (
              <p
                style={{
                  margin: "-4px 0 12px",
                  color: "#475569",
                  fontSize: "12px",
                  overflowWrap: "anywhere",
                }}
              >
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || checkingConnection}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #1d4ed8",
                borderRadius: "7px",
                background: verifying ? "#94a3b8" : "#1d4ed8",
                color: "#ffffff",
                fontWeight: 600,
                cursor: verifying ? "wait" : "pointer",
                opacity: verifying || checkingConnection ? 0.8 : 1,
              }}
            >
              {verifying ? "Verifying backup..." : "Verify Backup"}
            </button>

            
                <button
                  type="button"
                  onClick={() => {
                    setVerifyPanelOpen(false);
                    setControlsExpanded(false);
                    setResult(null);
                    setShowDetails(false);
                  }}
                  disabled={verifying}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "7px",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: verifying ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>

              </>
)}



            {!controlsExpanded && result && (
              <button
                type="button"
               
onClick={() => {
  setVerifyPanelOpen(true);
  setControlsExpanded(true);
  setResult(null);
  setShowDetails(false);
}}

                style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "7px",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Verify Another Backup
              </button>
            )}



            {result && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  border: `1px solid ${result.ok ? "#86efac" : "#fca5a5"}`,
                  borderRadius: "8px",
                  background: result.ok ? "#f0fdf4" : "#fef2f2",
                  color: result.ok ? "#166534" : "#991b1b",
                  fontSize: "13px",
                  overflowWrap: "anywhere",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <strong>
                    {result.ok ? "Verification passed" : "Verification failed"}
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
  setResult(null);
  setShowDetails(false);
  setControlsExpanded(false);
  setVerifyPanelOpen(false);
}}
                    aria-label="Close verification results"
                    title="Close results"
                    style={{
                      ...buttonStyle,
                      padding: "3px 8px",
                      fontSize: "16px",
                      lineHeight: 1.2,
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                <p style={{ margin: "7px 0" }}>{result.message}</p>

                {result.fileName && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      Backup file
                    </div>
                    <div style={{ fontWeight: 600 }}>{result.fileName}</div>
                  </div>
                )}

                {result.verifiedAt && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      Verification time
                    </div>
                    <div>{result.verifiedAt}</div>
                  </div>
                )}

                {result.checksum && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                      JSON checksum
                    </div>
                    <div style={{ fontWeight: 600 }}>Verified</div>
                    <code
                      style={{
                        display: "block",
                        fontSize: "10px",
                        marginTop: "4px",
                        overflowWrap: "anywhere",
                        userSelect: "text",
                      }}
                    >
                      {result.checksum}
                    </code>
                  </div>
                )}

                {result.documentCount !== null &&
                  result.documentCount !== undefined && (
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ color: "#475569", fontSize: "12px" }}>
                        Documents verified
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "16px" }}>
                        {result.documentCount}
                        {result.jsonRecordCount !== null &&
                        result.jsonRecordCount !== undefined
                          ? ` / ${result.jsonRecordCount}`
                          : ""}
                      </div>
                    </div>
                  )}

                {result.xlsxPath && (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#475569",
                      fontSize: "11px",
                    }}
                  >
                    Companion XLSX validated.
                  </p>
                )}

                {result.detail && (
                  <p style={{ margin: "8px 0 0" }}>{result.detail}</p>
                )}

                {result.output && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setShowDetails((current) => !current)}
                      style={buttonStyle}
                    >
                      {showDetails ? "Hide Details" : "View Details"}
                    </button>

                    {showDetails && (
                      <>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                            maxHeight: "260px",
                            overflowY: "auto",
                            padding: "10px",
                            borderRadius: "6px",
                            background: "#ffffff",
                            color: "#334155",
                            fontSize: "11px",
                            margin: "10px 0 0",
                          }}
                        >
                          {result.output}
                        </pre>
                        <button
                          type="button"
                          onClick={() => {
  setResult(null);
  setShowDetails(false);
  setControlsExpanded(false);
  setVerifyPanelOpen(false);
}}
                          style={{
                            ...buttonStyle,
                            marginTop: "10px",
                          }}
                        >
                          Close Results ×
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <p style={{ color: "#64748b", fontSize: "12px", marginBottom: 0 }}>
              Choose a JSON backup from C:\OrbitzBackups\Daily. The helper
              verifies the matching file in that approved folder. The
              selected file is not uploaded.
            </p>
          </div>

          <div style={actionStyle}>
            <h3 style={{ marginTop: 0 }}>Restore Data</h3>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              A protected workflow with backup validation,
              explicit confirmation, and a clearly defined scope.
            </p>
            <span style={{ color: "#92400e", fontSize: "13px" }}>
              Protected action — not connected
            </span>
          </div>
        </div>

        <p
          style={{
            marginBottom: 0,
            marginTop: "18px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Backups are manual only. No scheduled jobs or automatic
          production restores are enabled by this page.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "19px" }}>
          Local Data Backup
        </h2>
        <p style={{ color: "#64748b" }}>
          Existing local application-data backup tools are preserved below.
        </p>
        <LocalDataBackup />
      </div>
    </div>
  );
}
