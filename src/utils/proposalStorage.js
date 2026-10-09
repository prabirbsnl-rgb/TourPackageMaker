


import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "firebase/storage";

import { db, storage } from "../firebase";



const PROPOSALS_COLLECTION = "proposalLibrary";

/*
 * Proposal Library
 *
 * This collection is independent of Leads.
 *
 * Deleting a Lead must NEVER delete
 * a Proposal Library record.
 */

export async function getProposals() {

    const proposalsRef =
        collection(
            db,
            PROPOSALS_COLLECTION
        );

    const proposalsQuery =
        query(
            proposalsRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );

    const snapshot =
        await getDocs(
            proposalsQuery
        );

    return snapshot.docs.map(
        docSnap => ({
            ...docSnap.data(),
            id: docSnap.id
        })
    );
}



export async function getLeadName(
    leadId
) {
    if (!leadId) {
        return "";
    }

    const leadRef =
        doc(
            db,
            "leads",
            leadId
        );

    const snapshot =
        await getDoc(leadRef);

    if (!snapshot.exists()) {
        return "";
    }

    return snapshot.data()?.name || "";
}



export async function getLeadBusinessId(
    leadId
) {
    if (!leadId) {
        return "";
    }

    const leadRef =
        doc(
            db,
            "leads",
            leadId
        );

    const snapshot =
        await getDoc(leadRef);

    if (!snapshot.exists()) {
        return "";
    }

    return snapshot.data()?.leadId || "";
}







export async function createProposal(
    proposalData
) {

    const proposalsRef =
        collection(
            db,
            PROPOSALS_COLLECTION
        );

    const now =
        new Date().toISOString();

    const docRef =
        await addDoc(
            proposalsRef,
            {
                ...proposalData,

                createdAt:
                    proposalData.createdAt ||
                    now,

                updatedAt:
                    now
            }
        );

    return {
        ...proposalData,

        id:
            docRef.id,

        createdAt:
            proposalData.createdAt ||
            now,

        updatedAt:
            now
    };
}



export async function uploadProposalDocx(
    proposalId,
    blob,
    fileName
) {

    if (
        !proposalId ||
        !blob ||
        !fileName
    ) {
        throw new Error(
            "Proposal DOCX information is incomplete."
        );
    }

    const storagePath =
        `proposal-documents/${proposalId}/${fileName}`;

    const storageRef =
        ref(
            storage,
            storagePath
        );

    await uploadBytes(
        storageRef,
        blob,
        {
            contentType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
    );

    const downloadUrl =
        await getDownloadURL(
            storageRef
        );

    return {
        storagePath,
        fileName,
        downloadUrl
    };
}





export async function updateProposal(
    firestoreId,
    proposalData
) {

    const proposalRef =
        doc(
            db,
            PROPOSALS_COLLECTION,
            firestoreId
        );

    const snapshot =
        await getDoc(
            proposalRef
        );

    if (!snapshot.exists()) {
        return false;
    }

    await updateDoc(
        proposalRef,
        {
            ...proposalData,

            updatedAt:
                new Date().toISOString()
        }
    );

    return true;
}



export async function deleteProposal(
    firestoreId
) {

    const proposalRef =
        doc(
            db,
            PROPOSALS_COLLECTION,
            firestoreId
        );

    await deleteDoc(
        proposalRef
    );
}