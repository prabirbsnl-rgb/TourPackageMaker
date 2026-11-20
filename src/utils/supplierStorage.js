






import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";

const SUPPLIERS_COLLECTION = "suppliers";
const SUPPLIER_HISTORY_COLLECTION = "supplierChangeHistory";

const SUPPLIER_COUNTER_COLLECTION = "systemCounters";
const SUPPLIER_COUNTER_DOC = "supplierId";

const SUPPLIER_ID_PREFIX = "ORB-SUP-";

function formatSupplierId(number) {
  return SUPPLIER_ID_PREFIX + String(number).padStart(4, "0");
}



// Initialize the Supplier ID counter.
// Run this once before creating the first supplier.

export async function initializeSupplierIdCounter() {
  const suppliersSnapshot = await getDocs(
    collection(db, SUPPLIERS_COLLECTION)
  );

  let highestNumber = 0;

  suppliersSnapshot.forEach((docSnap) => {
    const supplierId = docSnap.data().supplierId || "";

    if (supplierId.startsWith(SUPPLIER_ID_PREFIX)) {
      const number = parseInt(
        supplierId.slice(SUPPLIER_ID_PREFIX.length),
        10
      );

      if (!Number.isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  });

  const counterRef = doc(
    db,
    SUPPLIER_COUNTER_COLLECTION,
    SUPPLIER_COUNTER_DOC
  );

  return await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);

    if (snapshot.exists()) {
      return {
        success: true,
        alreadyInitialized: true,
        lastNumber: snapshot.data().lastNumber
      };
    }

    transaction.set(counterRef, {
      lastNumber: highestNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      alreadyInitialized: false,
      lastNumber: highestNumber
    };
  });
}

// Retrieve all supplier records.
export async function getSuppliers() {
  const suppliersQuery = query(
    collection(db, SUPPLIERS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(suppliersQuery);

  return snapshot.docs.map((docSnap) => ({
    ...docSnap.data(),
    id: docSnap.id
  }));
}

// Retrieve supplier change history.
export async function getSupplierChangeHistory() {
  const historyQuery = query(
    collection(db, SUPPLIER_HISTORY_COLLECTION),
    orderBy("changedAt", "desc")
  );

  const snapshot = await getDocs(historyQuery);

  return snapshot.docs.map((docSnap) => ({
    ...docSnap.data(),
    id: docSnap.id
  }));
}

// Create a supplier with a permanent sequential Supplier ID.
export async function createSupplier(supplierData) {
  const companyName = (supplierData.companyName || "").trim();

  if (!companyName) {
    throw new Error("Supplier company name is required.");
  }

  if (
    !Array.isArray(supplierData.categories) ||
    supplierData.categories.length === 0
  ) {
    throw new Error("Select at least one supplier category.");
  }

  const supplierRef = doc(
    collection(db, SUPPLIERS_COLLECTION)
  );

  const counterRef = doc(
    db,
    SUPPLIER_COUNTER_COLLECTION,
    SUPPLIER_COUNTER_DOC
  );

  return await runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);

    if (!counterSnapshot.exists()) {
      throw new Error("SUPPLIER_ID_COUNTER_NOT_INITIALIZED");
    }

    const currentNumber =
      Number(counterSnapshot.data().lastNumber) || 0;

    const nextNumber = currentNumber + 1;
    const supplierId = formatSupplierId(nextNumber);

    const now = new Date().toISOString();

    const newSupplier = {
      ...supplierData,
      companyName,
      categories: [...new Set(supplierData.categories)],
      supplierId,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    transaction.update(counterRef, {
      lastNumber: nextNumber,
      updatedAt: now
    });

    transaction.set(supplierRef, newSupplier);

    return {
      ...newSupplier,
      id: supplierRef.id
    };
  });
}

// Update supplier details without changing permanent identity.
export async function updateSupplier(
  firestoreId,
  supplierData,
  changedBy
) {
  if (!firestoreId) {
    throw new Error("Supplier document ID is required.");
  }

  const supplierRef = doc(
    db,
    SUPPLIERS_COLLECTION,
    firestoreId
  );

  const historyRef = doc(
    collection(db, SUPPLIER_HISTORY_COLLECTION)
  );

  return await runTransaction(db, async (transaction) => {
    const supplierSnapshot = await transaction.get(supplierRef);

    if (!supplierSnapshot.exists()) {
      throw new Error("Supplier record not found.");
    }

    const previousData = supplierSnapshot.data();

    const protectedFields = [
      "id",
      "supplierId",
      "createdAt",
      "isActive",
      "updatedAt"
    ];

    const safeUpdates = { ...supplierData };

    protectedFields.forEach((field) => {
      delete safeUpdates[field];
    });

    if (
      safeUpdates.companyName !== undefined &&
      (
        typeof safeUpdates.companyName !== "string" ||
        !safeUpdates.companyName.trim()
      )
    ) {
      throw new Error("Supplier company name cannot be empty.");
    }

    if (safeUpdates.categories !== undefined) {
      if (
        !Array.isArray(safeUpdates.categories) ||
        safeUpdates.categories.length === 0
      ) {
        throw new Error("At least one supplier category is required.");
      }

      safeUpdates.categories = [
        ...new Set(safeUpdates.categories)
      ];
    }

    const changedFields = [];

    Object.keys(safeUpdates).forEach((key) => {
      const oldValue = previousData[key] ?? "";
      const newValue = safeUpdates[key] ?? "";

      if (
        JSON.stringify(oldValue) !== JSON.stringify(newValue)
      ) {
        changedFields.push({
          field: key,
          oldValue,
          newValue
        });
      }
    });

    if (changedFields.length === 0) {
      return {
        success: true,
        changedFields: []
      };
    }

    const now = new Date().toISOString();

    transaction.update(supplierRef, {
      ...safeUpdates,
      updatedAt: now
    });

    transaction.set(historyRef, {
      supplierDocId: firestoreId,
      supplierId: previousData.supplierId,
      changedFields,
      changedBy: changedBy || null,
      changedAt: serverTimestamp()
    });

    return {
      success: true,
      changedFields
    };
  });
}

// Activate or deactivate a supplier.
export async function setSupplierActiveStatus(
  firestoreId,
  isActive,
  changedBy
) {
  if (!firestoreId) {
    throw new Error("Supplier document ID is required.");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("A valid supplier status is required.");
  }

  const supplierRef = doc(
    db,
    SUPPLIERS_COLLECTION,
    firestoreId
  );

  const historyRef = doc(
    collection(db, SUPPLIER_HISTORY_COLLECTION)
  );

  return await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(supplierRef);

    if (!snapshot.exists()) {
      throw new Error("Supplier record not found.");
    }

    const previousData = snapshot.data();

    transaction.update(supplierRef, {
      isActive,
      updatedAt: new Date().toISOString()
    });

    transaction.set(historyRef, {
      supplierDocId: firestoreId,
      supplierId: previousData.supplierId,
      changedFields: [{
        field: "isActive",
        oldValue: previousData.isActive,
        newValue: isActive
      }],
      changedBy: changedBy || null,
      changedAt: serverTimestamp()
    });

    return { success: true, isActive };
  });
}


// Permanently delete one supplier while retaining an audit record.
// Firestore security rules must independently restrict supplier deletes to Admin users.
export async function deleteSupplier(
  firestoreId,
  deletedBy
) {
  if (!firestoreId) {
    throw new Error("Supplier document ID is required.");
  }

  const supplierRef = doc(
    db,
    SUPPLIERS_COLLECTION,
    firestoreId
  );

  const historyRef = doc(
    collection(db, SUPPLIER_HISTORY_COLLECTION)
  );

  return await runTransaction(db, async (transaction) => {
    const supplierSnapshot = await transaction.get(supplierRef);

    if (!supplierSnapshot.exists()) {
      throw new Error("Supplier record not found.");
    }

    const previousData = supplierSnapshot.data();

    transaction.delete(supplierRef);

    transaction.set(historyRef, {
      action: "DELETE",
      supplierDocId: firestoreId,
      supplierId: previousData.supplierId || null,
      companyName: previousData.companyName || null,
      deletedSupplierSnapshot: previousData,
      changedBy: deletedBy || null,
      changedAt: serverTimestamp()
    });

    return {
      success: true,
      supplierId: previousData.supplierId || null
    };
  });
}

