


import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const HOTEL_PROPERTIES_COLLECTION = "hotelProperties";
const HOTEL_PROPERTY_HISTORY_COLLECTION = "hotelPropertyChangeHistory";
const HOTEL_PROPERTY_COUNTER_COLLECTION = "systemCounters";
const HOTEL_PROPERTY_COUNTER_DOC = "hotelPropertyId";
const HOTEL_PROPERTY_ID_PREFIX = "ORB-HOT-";

const formatHotelPropertyId = (number) =>
  `${HOTEL_PROPERTY_ID_PREFIX}${String(number).padStart(4, "0")}`;

function preparePhotoMetadata(value) {
  if (!Array.isArray(value)) return value;

  return value.map((photo) => {
    if (!photo || typeof photo !== "object") return photo;

    const { id, name, ...rest } = photo;
    const safeRest = { ...rest };

   delete safeRest.url;
delete safeRest.previewUrl;
delete safeRest.file;
delete safeRest.blob;

    return {
      ...safeRest,
      ...(id ? { id } : {}),
      ...(name ? { name } : {}),
      imageStoragePending: !safeRest.driveFileId,
    };
  });
}

function removeUndefinedValues(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedValues);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [
          key,
          removeUndefinedValues(entryValue),
        ])
    );
  }

  return value;
}

function preparePropertyData(propertyData) {
  const prepared = { ...propertyData };

  if (Array.isArray(prepared.photos)) {
    prepared.photos = preparePhotoMetadata(prepared.photos);
  }

  if (Array.isArray(prepared.roomCategories)) {
    prepared.roomCategories = prepared.roomCategories.map((unit) => {
      const preparedUnit = { ...unit };

      if (Array.isArray(preparedUnit.photos)) {
        preparedUnit.photos = preparePhotoMetadata(preparedUnit.photos);
      }

      return preparedUnit;
    });
  }

  return removeUndefinedValues(prepared);
}

/**
 * Combines the existing Hotel Master form states into one property payload.
 */
export function buildHotelPropertyPayload({
  formData = {},
  accommodationCategory,
  roomCategories = [],
} = {}) {
  if (!accommodationCategory?.id || !accommodationCategory?.label) {
    throw new Error("Please select an accommodation category.");
  }

  const otherData =
    accommodationCategory.id === "OTHER"
      ? formData.otherAccommodation || {}
      : {};

  return preparePropertyData({
    ...formData,

    // OTHER category keeps these fields inside otherAccommodation.
    // Promote the common property details for listing and validation.
    propertyName:
      formData.propertyName || otherData.propertyName || "",

    displayName:
      formData.displayName || otherData.displayName || "",

    propertyDescription:
      formData.propertyDescription || otherData.description || "",

    categoryId: accommodationCategory.id,
    categoryLabel: accommodationCategory.label,

    propertyScope: String(formData.propertyScope || "").toLowerCase(),

    roomCategories: Array.isArray(roomCategories)
      ? roomCategories
      : [],
  });
}


/**
 * Initialize the sequential Property ID counter once.
 */
export async function initializeHotelPropertyIdCounter() {
  const propertiesSnapshot = await getDocs(
    collection(db, HOTEL_PROPERTIES_COLLECTION)
  );

  let highestNumber = 0;

  propertiesSnapshot.forEach((propertyDoc) => {
    const propertyId = propertyDoc.data().propertyId || "";

    if (propertyId.startsWith(HOTEL_PROPERTY_ID_PREFIX)) {
      const number = Number.parseInt(
        propertyId.slice(HOTEL_PROPERTY_ID_PREFIX.length),
        10
      );

      if (Number.isInteger(number) && number > highestNumber) {
        highestNumber = number;
      }
    }
  });

  const counterRef = doc(
    db,
    HOTEL_PROPERTY_COUNTER_COLLECTION,
    HOTEL_PROPERTY_COUNTER_DOC
  );

  return runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);

    if (counterSnapshot.exists()) {
      return {
        success: true,
        alreadyInitialized: true,
        lastNumber: counterSnapshot.data().lastNumber,
      };
    }

    const now = new Date().toISOString();

    transaction.set(counterRef, {
      lastNumber: highestNumber,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      alreadyInitialized: false,
      lastNumber: highestNumber,
    };
  });
}

/** Retrieve all registered properties. */
export async function getHotelProperties() {
  const propertiesQuery = query(
    collection(db, HOTEL_PROPERTIES_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(propertiesQuery);

  return snapshot.docs.map((propertyDoc) => ({
    ...propertyDoc.data(),
    id: propertyDoc.id,
  }));
}




/** Create a property and reserve its permanent sequential Property ID. */

export async function createHotelProperty(propertyData, createdBy = null) {
  if (!propertyData || typeof propertyData !== "object") {
    throw new Error("Property details are required.");
  }

  const propertyName = String(propertyData.propertyName || "").trim();

  if (!propertyName) {
    throw new Error("Property Name is required.");
  }

  if (!propertyData.categoryId || !propertyData.categoryLabel) {
    throw new Error("Accommodation category is required.");
  }

  const propertyScope = String(propertyData.propertyScope || "").toLowerCase();

  if (!["domestic", "international"].includes(propertyScope)) {
    throw new Error("Property scope must be Domestic or International.");
  }

  if (!propertyData.country || !propertyData.city) {
    throw new Error("Country and City are required.");
  }

  if (propertyScope === "domestic" && !propertyData.stateProvince) {
    throw new Error("State / UT is required for domestic properties.");
  }

  const propertyRef = doc(collection(db, HOTEL_PROPERTIES_COLLECTION));

  const counterRef = doc(
    db,
    HOTEL_PROPERTY_COUNTER_COLLECTION,
    HOTEL_PROPERTY_COUNTER_DOC
  );

  const historyRef = doc(
    collection(db, HOTEL_PROPERTY_HISTORY_COLLECTION)
  );

  return runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);

    if (!counterSnapshot.exists()) {
      throw new Error("HOTEL_PROPERTY_ID_COUNTER_NOT_INITIALIZED");
    }

    const currentNumber = Number(counterSnapshot.data().lastNumber) || 0;
    const nextNumber = currentNumber + 1;
    const propertyId = formatHotelPropertyId(nextNumber);
    const now = new Date().toISOString();

    const safePropertyData = preparePropertyData(propertyData);

    const newProperty = {
      ...safePropertyData,
      propertyName,
      propertyScope,
      propertyId,
      status: safePropertyData.status || "Active",
      createdAt: now,
      updatedAt: now,
      createdBy: createdBy || null,
      updatedBy: createdBy || null,
    };

    transaction.update(counterRef, {
      lastNumber: nextNumber,
      updatedAt: now,
    });

    transaction.set(propertyRef, newProperty);

    transaction.set(historyRef, {
      action: "CREATE",
      propertyDocId: propertyRef.id,
      propertyId,
      propertyName,
      categoryId: newProperty.categoryId,
      changedBy: createdBy || null,
      changedAt: serverTimestamp(),
    });

    return {
      ...newProperty,
      id: propertyRef.id,
    };
  });
}

/** Update property details while preserving permanent identity fields. */
export async function updateHotelProperty(
  firestoreId,
  propertyData,
  changedBy = null
) {
  if (!firestoreId) {
    throw new Error("Property document ID is required.");
  }

  const propertyRef = doc(
    db,
    HOTEL_PROPERTIES_COLLECTION,
    firestoreId
  );

  const historyRef = doc(
    collection(db, HOTEL_PROPERTY_HISTORY_COLLECTION)
  );

  return runTransaction(db, async (transaction) => {
    const propertySnapshot = await transaction.get(propertyRef);

    if (!propertySnapshot.exists()) {
      throw new Error("Property record not found.");
    }

    const previousData = propertySnapshot.data();
    const safeUpdates = preparePropertyData(propertyData || {});

    [
      "id",
      "propertyId",
      "createdAt",
      "createdBy",
      "categoryId",
      "categoryLabel",
      "propertyScope",
    ].forEach((field) => {
      delete safeUpdates[field];
    });

    if (
      safeUpdates.propertyName !== undefined &&
      !String(safeUpdates.propertyName).trim()
    ) {
      throw new Error("Property Name cannot be empty.");
    }

    const changedFields = Object.keys(safeUpdates)
      .filter(
        (field) =>
          JSON.stringify(previousData[field] ?? null) !==
          JSON.stringify(safeUpdates[field] ?? null)
      )
      .map((field) => ({
        field,
        oldValue: previousData[field] ?? null,
        newValue: safeUpdates[field] ?? null,
      }));

    if (changedFields.length === 0) {
      return { success: true, changedFields: [] };
    }

    const now = new Date().toISOString();

    transaction.update(propertyRef, {
      ...safeUpdates,
      updatedAt: now,
      updatedBy: changedBy || null,
    });

    transaction.set(historyRef, {
      action: "UPDATE",
      propertyDocId: firestoreId,
      propertyId: previousData.propertyId || null,
      propertyName: previousData.propertyName || null,
      changedFields: changedFields.map((change) => change.field),
      changedBy: changedBy || null,
      changedAt: serverTimestamp(),
    });

    return { success: true, changedFields };
  });
}


/** Permanently delete a property and retain its deletion audit record. */
export async function deleteHotelProperty(
  firestoreId,
  deletedBy = null
) {
  if (!firestoreId) {
    throw new Error("Property document ID is required.");
  }

  const propertyRef = doc(
    db,
    HOTEL_PROPERTIES_COLLECTION,
    firestoreId
  );

  const historyRef = doc(
    collection(db, HOTEL_PROPERTY_HISTORY_COLLECTION)
  );

  return runTransaction(db, async (transaction) => {
    const propertySnapshot = await transaction.get(propertyRef);

    if (!propertySnapshot.exists()) {
      throw new Error("Property record not found.");
    }

    const previousData = propertySnapshot.data();

    transaction.delete(propertyRef);

    transaction.set(historyRef, {
      action: "DELETE",
      propertyDocId: firestoreId,
      propertyId: previousData.propertyId || null,
      propertyName: previousData.propertyName || null,
      deletedFields: Object.keys(previousData),
      changedBy: deletedBy || null,
      changedAt: serverTimestamp(),
    });

    return {
      success: true,
      propertyId: previousData.propertyId || null,
    };
  });
}

/** Retrieve the property audit trail. */
export async function getHotelPropertyChangeHistory() {
  const historyQuery = query(
    collection(db, HOTEL_PROPERTY_HISTORY_COLLECTION),
    orderBy("changedAt", "desc")
  );

  const snapshot = await getDocs(historyQuery);

  return snapshot.docs.map((historyDoc) => ({
    ...historyDoc.data(),
    id: historyDoc.id,
  }));
}