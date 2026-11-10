



import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    runTransaction
} from "firebase/firestore";

import { db } from "../firebase";

const SERVICE_RECORDS_COLLECTION =
    "clientServiceRecords";

const SERVICE_RECORD_COUNTER =
    "serviceRecordId";

const SERVICE_RECORD_ID_PREFIX =
    "ORB-SR-";


/*
=====================================================
SERVICE RECORD ID
=====================================================
*/

async function generateServiceRecordId() {

    const counterRef = doc(
        db,
        "counters",
        SERVICE_RECORD_COUNTER
    );

    const nextNumber = await runTransaction(
        db,
        async (transaction) => {

            const counterSnapshot =
                await transaction.get(counterRef);

            const currentNumber =
                Number(
                    counterSnapshot.data()
                        ?.currentNumber || 0
                );

            const nextNumber =
                currentNumber + 1;

            transaction.set(
                counterRef,
                {
                    currentNumber: nextNumber,
                    updatedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );

            return nextNumber;
        }
    );

    return (
        SERVICE_RECORD_ID_PREFIX +
        String(nextNumber).padStart(4, "0")
    );
}


/*
=====================================================
SORT SERVICE RECORDS
=====================================================
*/

function sortServiceRecords(records) {

    return records.sort((a, b) => {

        const aTime =
            a.createdAt?.toMillis?.() || 0;

        const bTime =
            b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
    });
}


/*
=====================================================
CREATE SERVICE RECORD
=====================================================
*/

export async function createServiceRecord(
    recordData
) {

    if (!recordData.clientId) {
        throw new Error(
            "Client ID is required."
        );
    }

    if (!recordData.clientDocId) {
        throw new Error(
            "Client document ID is required."
        );
    }

    if (!recordData.serviceType) {
        throw new Error(
            "Service type is required."
        );
    }

    const serviceRecordId =
        await generateServiceRecordId();

    const record = {
        ...recordData,

        serviceRecordId,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(
        collection(
            db,
            SERVICE_RECORDS_COLLECTION
        ),
        record
    );

    return {
        ...record,
        id: docRef.id,
        serviceRecordId
    };
}


/*
=====================================================
GET ALL SERVICE RECORDS
=====================================================
*/

export async function getAllServiceRecords() {

    const snapshot = await getDocs(
        collection(
            db,
            SERVICE_RECORDS_COLLECTION
        )
    );

    const records = snapshot.docs.map(
        docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        })
    );

    return sortServiceRecords(records);
}


/*
=====================================================
GET SERVICE RECORDS BY CLIENT
=====================================================
*/

export async function getServiceRecordsByClient(
    clientId
) {

    if (!clientId) {
        return [];
    }

    const recordsQuery = query(
        collection(
            db,
            SERVICE_RECORDS_COLLECTION
        ),
        where("clientId", "==", clientId)
    );

    const snapshot = await getDocs(
        recordsQuery
    );

    const records = snapshot.docs.map(
        docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        })
    );

    return sortServiceRecords(records);
}


/*
=====================================================
GET SERVICE RECORDS BY TYPE
=====================================================
*/

export async function getServiceRecordsByType(
    serviceType
) {

    if (!serviceType) {
        return [];
    }

    const recordsQuery = query(
        collection(
            db,
            SERVICE_RECORDS_COLLECTION
        ),
        where("serviceType", "==", serviceType)
    );

    const snapshot = await getDocs(
        recordsQuery
    );

    const records = snapshot.docs.map(
        docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        })
    );

    return sortServiceRecords(records);
}


/*
=====================================================
UPDATE SERVICE RECORD
=====================================================
*/

export async function updateServiceRecord(
    firestoreId,
    updates
) {

    if (!firestoreId) {
        throw new Error(
            "Service record document ID is required."
        );
    }

    // Keep the original customer and record identity.
    const {
    id,
    serviceRecordId,
    clientId,
    clientDocId,
    serviceType,
    createdAt,
    createdBy,
    ...safeUpdates
} = updates;

    const recordRef = doc(
        db,
        SERVICE_RECORDS_COLLECTION,
        firestoreId
    );

    await updateDoc(
        recordRef,
        {
            ...safeUpdates,
            updatedAt: serverTimestamp()
        }
    );
}


/*
=====================================================
DELETE SERVICE RECORD
=====================================================
*/

export async function deleteServiceRecord(
    firestoreId
) {

    if (!firestoreId) {
        throw new Error(
            "Service record document ID is required."
        );
    }

    const recordRef = doc(
        db,
        SERVICE_RECORDS_COLLECTION,
        firestoreId
    );

    await deleteDoc(recordRef);
}
