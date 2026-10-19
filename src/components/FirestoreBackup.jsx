
import { useState } from "react";
import { db } from "../firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  DocumentReference,
  GeoPoint,
  Bytes,
} from "firebase/firestore";

const PROJECT_ID = "orbitzquote";
const DATABASE_ID = "(default)";

// Explicit inventory. This is not automatic discovery of every
// collection in Firestore; the manifest reports that limitation.
const BACKUP_REGISTRY = {
  version: 3,

  modules: {
    clients: {
      collections: ["clients"],
      documents: [],
      category: "business",
    },
    leadManagement: {
      collections: ["leads"],
      documents: ["counters/leadId"],
      category: "business",
    },
    quotations: {
      collections: ["drafts"],
      documents: [],
      category: "business",
    },
    proposalLibrary: {
      collections: ["proposalLibrary"],
      documents: [],
      category: "business",
    },
    taxInvoices: {
      collections: ["taxInvoices"],
      documents: [],
      category: "business",
    },
    templates: {
      collections: ["templates"],
      documents: [],
      category: "business",
    },
    userProfiles: {
      collections: ["users"],
      documents: [],
      category: "restricted",
    },
        loginDirectory: {
      collections: [],
      documents: [],
      category: "excluded-restricted",
    },
       systemTests: {
      collections: [],
      documents: [],
      category: "excluded-operational",
    },
        counters: {
      collections: [],
      documents: ["counters/leadId"],
      category: "operational",
    },
  },
};


function getUniqueResources(field, allowedCategories) {
  return [
    ...new Set(
      Object.values(BACKUP_REGISTRY.modules)
        .filter((module) =>
          allowedCategories.includes(module.category)
        )
        .flatMap((module) => module[field])
    ),
  ];
}


// Convert Firestore-specific values to an explicit JSON representation.
// This avoids silently losing Timestamp, GeoPoint, Bytes, or references.
function serializeValue(value) {
  if (value instanceof Timestamp) {
    return {
      __type: "FirestoreTimestamp",
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    };
  }

  if (value instanceof DocumentReference) {
    return {
      __type: "FirestoreDocumentReference",
      path: value.path,
    };
  }

  if (value instanceof GeoPoint) {
    return {
      __type: "FirestoreGeoPoint",
      latitude: value.latitude,
      longitude: value.longitude,
    };
  }

  if (value instanceof Bytes) {
    return {
      __type: "FirestoreBytes",
      base64: value.toBase64(),
    };
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    const result = {};

    for (const [key, child] of Object.entries(value)) {
      result[key] = serializeValue(child);
    }

    return result;
  }

  return value;
}

function getSafeError(error) {
  return {
    code: error?.code || "unknown",
    message: error?.message || "No error details available",
  };
}

export default function FirestoreBackup({ onBack }) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(
    "Ready to create a read-only Firestore export."
  );

  async function createBackup() {
    if (running) return;

    setRunning(true);
    setMessage("Preparing backup manifest…");

    
const collectionNames = getUniqueResources(
  "collections",
  ["business"]
);

const documentPaths = getUniqueResources(
  "documents",
  ["business", "operational"]
);


    const backup = {
      format: "orbitz-firestore-json-backup",
      formatVersion: 3,
      projectId: PROJECT_ID,
      database: DATABASE_ID,
      createdAt: new Date().toISOString(),

      registry: {
        version: BACKUP_REGISTRY.version,
        modules: BACKUP_REGISTRY.modules,
        registeredCollections: collectionNames,
        registeredDocuments: documentPaths,
      },

      coverage: {
        registeredCollections: collectionNames.length,
        registeredDocuments: documentPaths.length,

               excludedCollections: [
  {
    path: "users",
    status: "intentionally_excluded",
    reason:
      "Restricted user-profile data is excluded from the general business recovery backup.",
  },
  {
    path: "loginDirectory",
    status: "intentionally_excluded",
    reason:
      "Restricted login-directory data is excluded from this client-side backup.",
  },
          {
            path: "systemTests",
            status: "intentionally_excluded",
            reason:
              "Operational test data is excluded from this client-side backup.",
          },
        ],

        
        collections: {},
        documents: {},
        nestedSubcollections: {
          status: "not_checked",
          reason:
            "This client-side exporter does not recursively enumerate " +
            "subcollections. Nested subcollections may be missing.",
        },
        unregisteredResources: {
          status: "unknown",
          reason:
            "The exporter cannot enumerate every Firestore resource " +
            "with the current registry and client-side access.",
        },
        restoreVerification: "not_verified",
      },

      collections: {},
      errors: [],
    };

    try {
      // Read each registered top-level collection independently.
      for (const name of collectionNames) {
        setMessage(`Reading registered collection: ${name}…`);

        const resourceReport = {
          path: name,
          type: "collection",
          status: "pending",
          documentCount: null,
        };

        backup.coverage.collections[name] = resourceReport;

        try {
          const snapshot = await getDocs(collection(db, name));

          backup.collections[name] = snapshot.docs.map(
            (document) => ({
              id: document.id,
              data: serializeValue(document.data()),
            })
          );

          resourceReport.status = "read_success";
          resourceReport.documentCount = snapshot.size;
        } catch (error) {
          resourceReport.status = "read_failed";

          const safeError = getSafeError(error);

          backup.errors.push({
            path: name,
            type: "collection",
            ...safeError,
          });
        }
      }

      // Read individually registered documents, even when collection
      // listing is forbidden by Firestore security rules.
      for (const path of documentPaths) {
        setMessage(`Reading registered document: ${path}…`);

        const resourceReport = {
          path,
          type: "document",
          status: "pending",
          documentCount: null,
        };

        backup.coverage.documents[path] = resourceReport;

        try {
          const segments = path.split("/");

          if (
            segments.length !== 2 ||
            segments.some((segment) => !segment)
          ) {
            throw new Error(
              "Invalid document path in backup registry."
            );
          }

          const snapshot = await getDoc(
            doc(db, segments[0], segments[1])
          );

          backup.collections[path] = snapshot.exists()
            ? [
                {
                  id: snapshot.id,
                  data: serializeValue(snapshot.data()),
                },
              ]
            : [];

          resourceReport.status = snapshot.exists()
            ? "read_success"
            : "not_found";

          resourceReport.documentCount = snapshot.exists() ? 1 : 0;
        } catch (error) {
          resourceReport.status = "read_failed";

          const safeError = getSafeError(error);

          backup.errors.push({
            path,
            type: "document",
            ...safeError,
          });
        }
      }

      const collectionStatuses = Object.values(
        backup.coverage.collections
      );
      const documentStatuses = Object.values(
        backup.coverage.documents
      );

      const failedReads = backup.errors.length;

      const unresolvedResources = [
        ...collectionStatuses,
        ...documentStatuses,
      ].filter(
        (resource) =>
          resource.status === "pending" ||
          resource.status === "read_failed"
      ).length;

      const notFoundDocuments = documentStatuses.filter(
        (resource) => resource.status === "not_found"
      ).length;

      const successfulCollections = collectionStatuses.filter(
        (resource) => resource.status === "read_success"
      ).length;

      const successfulDocuments = documentStatuses.filter(
        (resource) => resource.status === "read_success"
      ).length;

      const totalDocuments = [
        ...Object.values(backup.collections),
      ].reduce(
        (total, documents) => total + documents.length,
        0
      );

      backup.summary = {
        successfulCollections,
        successfulDocuments,
        totalDocumentsExported: totalDocuments,
        failedReads,
        unresolvedResources,
        notFoundDocuments,
        exportStatus:
          failedReads === 0 && unresolvedResources === 0
            ? "registered_resources_read_without_errors"
            : "incomplete",
        restoreVerification: "not_verified",
        fullCoverageVerification: "not_verified",
      };

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        `orbitz-firestore-backup-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      const resourceLines = [
        ...collectionStatuses,
        ...documentStatuses,
      ].map(
        (resource) =>
          `${resource.path}: ${resource.status}` +
          (
            resource.documentCount === null
              ? ""
              : ` (${resource.documentCount} documents)`
          )
      );

      setMessage(
        `JSON export downloaded.\n\n` +
        `Project: ${PROJECT_ID}\n` +
        `Collections read successfully: ${successfulCollections}\n` +
        `Documents read successfully: ${successfulDocuments}\n` +
        `Total documents exported: ${totalDocuments}\n` +
        `Read errors: ${failedReads}\n` +
        `Resources needing attention: ${unresolvedResources}\n` +
        `Registered documents not found: ${notFoundDocuments}\n\n` +
        `RESOURCE MANIFEST\n${resourceLines.join("\n")}\n\n` +
        `COVERAGE LIMITATIONS\n` +
        `Nested subcollections: NOT CHECKED\n` +
        `Unregistered resources: UNKNOWN\n` +
        `Restore test: NOT PERFORMED\n\n` +
        (
          failedReads || unresolvedResources
            ? "WARNING: This export has resource read failures. " +
              "Review the errors array in the JSON file."
            : "Registered resources were read without recorded errors. " +
              "This does not establish complete Firestore coverage."
        
        ) +
        `\n\nKeep this file private. It may contain customer and business data. ` +
        `Restricted user profiles and login-directory data are excluded.`
      );

    } catch (error) {
      setMessage(`Backup failed: ${error.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "24px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Orbitz Holidays — Firestore Backup</h2>

      <p>
        Reads registered Firestore resources and downloads a JSON
        export. It does not write to or delete database records.
      </p>

      <p>
        This is a registered-resource export, not yet a complete
        or restore-verified backup. Nested subcollections and
        unregistered resources are not guaranteed to be included.
      </p>

      <p>
  Keep the downloaded file private. It may contain customer and
  business data. Restricted user profiles and login-directory
  data are excluded from this export.
</p>

      <button
        type="button"
        onClick={createBackup}
        disabled={running}
        style={{
          padding: "10px 16px",
          marginRight: 10,
          cursor: running ? "wait" : "pointer",
        }}
      >
        {running ? "Creating backup…" : "Download JSON Backup"}
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={running}
          style={{ padding: "10px 16px", cursor: "pointer" }}
        >
          Back
        </button>
      )}

      <pre
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          background: "#f4f6f8",
          border: "1px solid #d8dee6",
          borderRadius: 8,
          padding: 16,
          marginTop: 20,
        }}
      >
        {message}
      </pre>
    </div>
  );
}
