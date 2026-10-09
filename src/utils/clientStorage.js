


import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";

import { db } from "../firebase";

const CLIENTS_COLLECTION = "clients";

const CLIENT_ID_PREFIX = "ORB-CL-";

function formatClientId(number) {
    return (
        CLIENT_ID_PREFIX +
        String(number).padStart(4, "0")
    );
}

async function getNextClientId() {
    const clientsRef =
        collection(db, CLIENTS_COLLECTION);

    const snapshot =
        await getDocs(clientsRef);

    let highestNumber = 0;

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

        const clientId =
            data.clientId || "";

        if (
            clientId.startsWith(
                CLIENT_ID_PREFIX
            )
        ) {
            const number = parseInt(
                clientId.replace(
                    CLIENT_ID_PREFIX,
                    ""
                ),
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

    return formatClientId(
        highestNumber + 1
    );
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

export async function createClient(
    clientData
) {
    const clientId =
        await getNextClientId();

    const clientsRef =
        collection(db, CLIENTS_COLLECTION);

    const docRef =
        await addDoc(
            clientsRef,
            {
                ...clientData,
                clientId,
                createdAt:
                    new Date().toISOString(),
                updatedAt:
                    new Date().toISOString()
            }
        );

    return {
    ...clientData,
    id: docRef.id,
    clientId
};
}

export async function updateClient(
    firestoreId,
    clientData
) {
    const clientRef =
        doc(
            db,
            CLIENTS_COLLECTION,
            firestoreId
        );

    await updateDoc(
        clientRef,
        {
            ...clientData,
            updatedAt:
                new Date().toISOString()
        }
    );
}

export async function deleteClient(
    firestoreId
) {
    const clientRef =
        doc(
            db,
            CLIENTS_COLLECTION,
            firestoreId
        );

    await deleteDoc(clientRef);
}