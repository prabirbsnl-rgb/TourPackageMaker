


import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";



const CLIENTS_COLLECTION = "clients";

const CLIENT_ID_PREFIX = "ORB-CL-";

const CLIENT_ID_COUNTER_COLLECTION = "systemCounters";
const CLIENT_ID_COUNTER_DOC = "clientId";

function formatClientId(number) {
    return (
        CLIENT_ID_PREFIX +
        String(number).padStart(4, "0")
    );
}

async function getNextClientId() {

    const counterRef = doc(
        db,
        CLIENT_ID_COUNTER_COLLECTION,
        CLIENT_ID_COUNTER_DOC
    );

    return await runTransaction(db, async transaction => {

        const counterSnapshot =
            await transaction.get(counterRef);

        if (!counterSnapshot.exists()) {
            throw new Error(
                "CLIENT_ID_COUNTER_NOT_INITIALIZED"
            );
        }

        const currentNumber =
            Number(counterSnapshot.data().lastNumber) || 0;

        const nextNumber = currentNumber + 1;

        transaction.update(counterRef, {
            lastNumber: nextNumber,
            updatedAt: new Date().toISOString()
        });

        return formatClientId(nextNumber);
    });
}



export async function initializeClientIdCounter() {

    // Read all existing clients
    const clientsRef = collection(
        db,
        CLIENTS_COLLECTION
    );

    const snapshot = await getDocs(clientsRef);

    // Find the highest existing Client ID number
    let highestNumber = 0;

    snapshot.forEach(docSnap => {

        const data = docSnap.data();
        const clientId = data.clientId || "";

        if (clientId.startsWith(CLIENT_ID_PREFIX)) {

            const number = parseInt(
                clientId.replace(CLIENT_ID_PREFIX, ""),
                10
            );

            if (
                !Number.isNaN(number) &&
                number > highestNumber
            ) {
                highestNumber = number;
            }
        }
    });

    // Initialize only if the counter does not already exist
    const counterRef = doc(
        db,
        CLIENT_ID_COUNTER_COLLECTION,
        CLIENT_ID_COUNTER_DOC
    );

    return await runTransaction(db, async transaction => {

        const counterSnapshot =
            await transaction.get(counterRef);

        if (counterSnapshot.exists()) {
            return {
                success: true,
                alreadyInitialized: true,
                lastNumber: counterSnapshot.data().lastNumber
            };
        }

        transaction.set(counterRef, {
            lastNumber: highestNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return {
            success: true,
            alreadyInitialized: false,
            lastNumber: highestNumber
        };
    });
}




export async function getClients() {
    const clientsRef =
        collection(db, CLIENTS_COLLECTION);

    const clientsQuery =
        query(
            clientsRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );

    const snapshot =
        await getDocs(clientsQuery);

    return snapshot.docs.map(
    docSnap => ({
        ...docSnap.data(),
        id: docSnap.id
    })
);
}



export async function getClientChangeHistory() {

    const historyRef = collection(
        db,
        "clientChangeHistory"
    );

    const historyQuery = query(
        historyRef,
        orderBy("changedAt", "desc")
    );

    const snapshot = await getDocs(historyQuery);

    return snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        id: docSnap.id
    }));
}


export async function deleteClientHistoryRecord(historyId) {

    if (!historyId) {
        throw new Error("History record ID is required.");
    }

    const historyRef = doc(
        db,
        "clientChangeHistory",
        historyId
    );

    await deleteDoc(historyRef);

    return {
        success: true,
        historyId
    };
}




export async function createClient(clientData) {

    const mobile = (clientData.mobile || "").trim();
    const normalizedMobile = mobile.replace(/\D/g, "");

    const clientRef = doc(
        collection(db, CLIENTS_COLLECTION)
    );

    const mobileIndexRef = normalizedMobile
        ? doc(db, "clientMobileIndex", normalizedMobile)
        : null;


        // Check existing Client Master records
if (normalizedMobile) {

    const existingClientsSnapshot = await getDocs(
        collection(db, CLIENTS_COLLECTION)
    );

    const duplicateClient =
        existingClientsSnapshot.docs.find(docSnap => {

            const existingMobile =
                (docSnap.data().mobile || "")
                    .replace(/\D/g, "");

            return existingMobile === normalizedMobile;
        });

    if (duplicateClient) {

        const duplicateData = duplicateClient.data();

        throw new Error(
            `DUPLICATE_MOBILE: This mobile number is already registered to ${duplicateData.clientId} - ${duplicateData.clientName}.`
        );
    }
}




    const clientId = await getNextClientId();

    return await runTransaction(db, async transaction => {

        if (mobileIndexRef) {
            const mobileSnapshot =
                await transaction.get(mobileIndexRef);

            if (mobileSnapshot.exists()) {
                throw new Error(
                    "DUPLICATE_MOBILE: This mobile number is already registered."
                );
            }
        }

        const now = new Date().toISOString();

        const newClient = {
            ...clientData,
            clientId,
            createdAt: now,
            updatedAt: now
        };

        transaction.set(clientRef, newClient);

        if (mobileIndexRef) {
            transaction.set(mobileIndexRef, {
                clientDocId: clientRef.id,
                clientId,
                mobile
            });
        }

        return {
            ...newClient,
            id: clientRef.id
        };
    });
}



export async function updateClient(
    firestoreId,
    clientData,
    changedBy
) {
    const clientRef = doc(
        db,
        CLIENTS_COLLECTION,
        firestoreId
    );

    const historyRef = doc(
        collection(db, "clientChangeHistory")
    );

    return await runTransaction(db, async (transaction) => {

        // READ EXISTING CLIENT
        const clientSnapshot =
            await transaction.get(clientRef);

        if (!clientSnapshot.exists()) {
            throw new Error("Client record not found.");
        }

        const previousData = clientSnapshot.data();

        // NORMALIZE OLD AND NEW MOBILE NUMBERS
        const oldMobile =
            (previousData.mobile || "").trim();

        const newMobile =
            (clientData.mobile ?? previousData.mobile ?? "").trim();

        const oldNormalizedMobile =
            oldMobile.replace(/\D/g, "");

        const newNormalizedMobile =
            newMobile.replace(/\D/g, "");

        // READ ALL CLIENT RECORDS FOR DUPLICATE CHECK
const clientsSnapshot =
    await getDocs(
        collection(db, CLIENTS_COLLECTION)
    );

        if (newNormalizedMobile) {

            const duplicateClient =
                clientsSnapshot.docs.find(docSnap => {

                    if (docSnap.id === firestoreId) {
                        return false;
                    }

                    const existingMobile =
                        (docSnap.data().mobile || "")
                            .replace(/\D/g, "");

                    return existingMobile === newNormalizedMobile;
                });

            if (duplicateClient) {

                const duplicateData =
                    duplicateClient.data();

                throw new Error(
                    `DUPLICATE_MOBILE: This mobile number is already registered to ${duplicateData.clientId} - ${duplicateData.clientName}.`
                );
            }
        }

        // READ MOBILE INDEX DOCUMENTS
        const oldMobileIndexRef = oldNormalizedMobile
            ? doc(db, "clientMobileIndex", oldNormalizedMobile)
            : null;

        const newMobileIndexRef = newNormalizedMobile
            ? doc(db, "clientMobileIndex", newNormalizedMobile)
            : null;

        let oldIndexSnapshot = null;
        let newIndexSnapshot = null;

        if (oldMobileIndexRef) {
            oldIndexSnapshot =
                await transaction.get(oldMobileIndexRef);
        }

        if (
            newMobileIndexRef &&
            newNormalizedMobile !== oldNormalizedMobile
        ) {
            newIndexSnapshot =
                await transaction.get(newMobileIndexRef);
        }

        if (
            newIndexSnapshot?.exists() &&
            newIndexSnapshot.data().clientDocId !== firestoreId
        ) {
            throw new Error(
                "DUPLICATE_MOBILE: This mobile number is already registered."
            );
        }

        // IDENTIFY CHANGED FIELDS
        const ignoredFields = [
            "id",
            "clientId",
            "createdAt",
            "updatedAt"
        ];

        const changedFields = [];

        Object.keys(clientData).forEach(key => {

            if (ignoredFields.includes(key)) return;

            const oldValue = previousData[key] ?? "";
            const newValue = clientData[key] ?? "";

            if (
                JSON.stringify(oldValue) !==
                JSON.stringify(newValue)
            ) {
                changedFields.push({
                    field: key,
                    oldValue,
                    newValue
                });
            }
        });

        // PREPARE UPDATED CLIENT DATA
        const updatedData = { ...clientData };

        ignoredFields.forEach(key => {
            delete updatedData[key];
        });

        updatedData.clientId = previousData.clientId;
        updatedData.createdAt = previousData.createdAt;
        updatedData.updatedAt = new Date().toISOString();

        // ALL TRANSACTION READS ARE COMPLETE.
        // BEGIN WRITING CHANGES.

        transaction.update(clientRef, updatedData);

        // REMOVE OLD MOBILE INDEX IF OWNED BY THIS CLIENT
        if (
            oldMobileIndexRef &&
            oldIndexSnapshot?.exists() &&
            oldIndexSnapshot.data().clientDocId === firestoreId &&
            oldNormalizedMobile !== newNormalizedMobile
        ) {
            transaction.delete(oldMobileIndexRef);
        }

        // SAVE NEW MOBILE INDEX
        if (newMobileIndexRef) {
            transaction.set(newMobileIndexRef, {
                clientDocId: firestoreId,
                clientId: previousData.clientId,
                mobile: newMobile
            });
        }

        // SAVE PERMANENT CHANGE HISTORY
        if (changedFields.length > 0) {

            transaction.set(historyRef, {
                clientDocId: firestoreId,
                clientId: previousData.clientId,
                changedFields,
                changedBy: {
                    uid: changedBy.uid,
                    username: changedBy.username,
                    role: changedBy.role
                },
                changedAt: serverTimestamp(),
                reason: changedBy.reason || ""
            });
        }

        return {
            success: true,
            changedFields
        };

    });
}



export async function deleteClient(firestoreId) {

    if (!firestoreId) {
        throw new Error(
            "Client document ID is required."
        );
    }

    const clientRef = doc(
        db,
        CLIENTS_COLLECTION,
        firestoreId
    );

    // Verify that the client exists.
    const clientSnapshot =
        await getDoc(clientRef);

    if (!clientSnapshot.exists()) {
        throw new Error(
            "Client record not found."
        );
    }

    const clientData =
        clientSnapshot.data();

    const clientId =
        clientData.clientId || "";

    // Check existing Lead and service relationships.
    const relationshipChecks = [

        // Leads linked through Firestore document ID.
        getDocs(
            query(
                collection(db, "leads"),
                where("clientDocId", "==", firestoreId)
            )
        ),

        // Service records linked through document ID.
        getDocs(
            query(
                collection(db, "clientServiceRecords"),
                where("clientDocId", "==", firestoreId)
            )
        )
    ];

    // Also check permanent Client ID relationships.
    if (clientId) {

        relationshipChecks.push(

            getDocs(
                query(
                    collection(db, "leads"),
                    where("clientId", "==", clientId)
                )
            ),

            getDocs(
                query(
                    collection(db, "clientServiceRecords"),
                    where("clientId", "==", clientId)
                )
            )
        );
    }

    const relationshipResults =
        await Promise.all(relationshipChecks);

    const hasRelatedRecords =
        relationshipResults.some(
            snapshot => !snapshot.empty
        );

    if (hasRelatedRecords) {
        throw new Error(
            "This client has related Lead or service records. Permanent deletion is not allowed. Deactivate the client instead."
        );
    }

    // Delete only when no protected relationships exist.
    await deleteDoc(clientRef);
}
