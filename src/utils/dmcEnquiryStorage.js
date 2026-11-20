



import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

const DMC_ENQUIRIES_COLLECTION = "dmcEnquiries";
const DMC_ENQUIRY_COUNTERS_COLLECTION = "dmcEnquiryCounters";

const SENT_STATUS = "Sent – Awaiting Reply";
const QUOTATION_RECEIVED_STATUS = "Quotation Received";

const QUOTATION_CHANNELS = [
  "WhatsApp",
  "Email",
  "Phone",
  "Other",
];

const cleanText = (value) => String(value ?? "").trim();

const cleanObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [
        key,
        typeof item === "string" ? item.trim() : item,
      ])
      .filter(
        ([, item]) =>
          item !== "" &&
          item !== null &&
          item !== undefined
      )
  );
};

/**
 * Permanently records an enquiry after staff confirms
 * that it was actually sent to the DMC.
 */
export async function recordSentDMCEnquiry(enquiryData) {
  if (!enquiryData || typeof enquiryData !== "object") {
    throw new Error("Enquiry details are required.");
  }

  const supplierDocId = cleanText(enquiryData.supplierDocId);
  const supplierId = cleanText(enquiryData.supplierId);
  const dmcName = cleanText(enquiryData.dmcName);
  const destination = cleanText(enquiryData.destination);
  const market = cleanText(enquiryData.market);
  const generatedMessage = cleanText(enquiryData.generatedMessage);
  const deliveryChannel = cleanText(enquiryData.deliveryChannel);
  const sentBy = cleanText(enquiryData.sentBy);

  if (!supplierDocId) {
    throw new Error("Selected DMC document ID is required.");
  }

  if (!supplierId) {
    throw new Error("DMC Supplier ID is required.");
  }

  if (!dmcName) {
    throw new Error("DMC company name is required.");
  }

  if (!destination) {
    throw new Error("Enquiry destination is required.");
  }

  if (!generatedMessage) {
    throw new Error("Generated enquiry message is required.");
  }

  if (!["WhatsApp", "Email"].includes(deliveryChannel)) {
    throw new Error("Delivery channel must be WhatsApp or Email.");
  }

  if (!sentBy) {
    throw new Error("Staff identity is required to record a sent enquiry.");
  }

  const counterRef = doc(
    db,
    DMC_ENQUIRY_COUNTERS_COLLECTION,
    supplierDocId
  );

  const enquiryRef = doc(
    collection(db, DMC_ENQUIRIES_COLLECTION)
  );

  return runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);

    const previousNumber = counterSnapshot.exists()
      ? Number(counterSnapshot.data().lastNumber) || 0
      : 0;

    const queryNumber = previousNumber + 1;

    const enquiryRecord = {
      enquiryId: enquiryRef.id,

      supplierDocId,
      supplierId,
      dmcName,

      destination,
      market,
      area: cleanText(enquiryData.area),

      queryNumber,
      queryLabel: `QUERY ${String(queryNumber).padStart(2, "0")}`,

      customerDetails: cleanObject(enquiryData.customerDetails),

      travelRequirements: cleanObject(
        enquiryData.travelRequirements
      ),

      customRequirements: Array.isArray(
        enquiryData.customRequirements
      )
        ? enquiryData.customRequirements
            .map((item) => ({
              label: cleanText(item?.label),
              value: cleanText(item?.value),
            }))
            .filter((item) => item.label && item.value)
        : [],

      supplierSnapshot: cleanObject(
        enquiryData.supplierSnapshot
      ),

      generatedMessage,

      deliveryChannel,

      status: SENT_STATUS,

      sentBy,
      sentAt: serverTimestamp(),

      createdAt: serverTimestamp(),
      createdBy: cleanText(enquiryData.createdBy) || sentBy,
    };

    transaction.set(counterRef, {
      supplierDocId,
      supplierId,
      lastNumber: queryNumber,
      updatedAt: serverTimestamp(),
    });

    transaction.set(enquiryRef, enquiryRecord);

    return {
      success: true,
      enquiryId: enquiryRef.id,
      queryNumber,
      queryLabel: enquiryRecord.queryLabel,
      destination,
      status: SENT_STATUS,
    };
  });
}

/**
 * Retrieves only the enquiries belonging to one DMC.
 * Results are sorted by sequential QUERY number.
 */
export async function getDMCEnquiriesForSupplier(supplierDocId) {
  const safeSupplierDocId = cleanText(supplierDocId);

  if (!safeSupplierDocId) {
    throw new Error("DMC document ID is required to load history.");
  }

  const enquiriesQuery = query(
    collection(db, DMC_ENQUIRIES_COLLECTION),
    where("supplierDocId", "==", safeSupplierDocId)
  );

  const snapshot = await getDocs(enquiriesQuery);

  return snapshot.docs
    .map((enquiryDoc) => ({
      id: enquiryDoc.id,
      ...enquiryDoc.data(),
    }))
    .sort(
      (a, b) =>
        (Number(a.queryNumber) || 0) -
        (Number(b.queryNumber) || 0)
    );
}

/**
 * Records quotation receipt.
 * Original enquiry details and generated message remain unchanged.
 */
export async function markDMCQuotationReceived(
  enquiryId,
  quotationData
) {
  const safeEnquiryId = cleanText(enquiryId);

  const receivedBy = cleanText(quotationData?.receivedBy);

  const quotationChannel = cleanText(
    quotationData?.quotationChannel
  );

  const quotationNotes = cleanText(
    quotationData?.quotationNotes
  );

  const quotationCurrency = cleanText(
    quotationData?.quotationCurrency
  );

  const rawAmount = cleanText(
    quotationData?.quotationAmount
  );

  if (!safeEnquiryId) {
    throw new Error("Enquiry ID is required.");
  }

  if (!receivedBy) {
    throw new Error("Staff identity is required.");
  }

  if (!QUOTATION_CHANNELS.includes(quotationChannel)) {
    throw new Error("Select a valid quotation receipt channel.");
  }

  const updates = {
    status: QUOTATION_RECEIVED_STATUS,
    quotationReceivedAt: serverTimestamp(),
    quotationReceivedBy: receivedBy,
    quotationChannel,
  };

  if (rawAmount) {
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(
        "Quotation amount must be a valid non-negative number."
      );
    }

    updates.quotationAmount = amount;
  }

  if (quotationCurrency) {
    updates.quotationCurrency = quotationCurrency;
  }

  if (quotationNotes) {
    updates.quotationNotes = quotationNotes;
  }

  await updateDoc(
    doc(db, DMC_ENQUIRIES_COLLECTION, safeEnquiryId),
    updates
  );

  return {
    success: true,
    status: QUOTATION_RECEIVED_STATUS,
  };
}
