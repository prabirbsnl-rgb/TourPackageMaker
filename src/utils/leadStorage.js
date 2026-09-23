


import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    runTransaction
} from "firebase/firestore";

import { db } from "../firebase";

const LEADS_COLLECTION = "leads";



async function generateLeadId() {

    const counterRef =
        doc(
            db,
            "counters",
            "leadId"
        );

    /*
     * Read existing Leads BEFORE starting the
     * transaction.
     *
     * This is only used when the counter document
     * does not exist yet.
     */
    let existingMaxNumber = 0;

    try {

        const leadsSnapshot =
            await getDocs(
                collection(
                    db,
                    LEADS_COLLECTION
                )
            );

        leadsSnapshot.forEach(
            leadDoc => {

                const existingLeadId =
                    String(
                        leadDoc.data()
                            ?.leadId || ""
                    );

                const match =
                    existingLeadId.match(
                        /^ORB-LD-(\d+)$/
                    );

                if (!match) {
                    return;
                }

                const number =
                    Number(
                        match[1]
                    );

                /*
                 * Recognize only the new short
                 * sequential numbering range.
                 *
                 * Old timestamp-style IDs such as
                 * ORB-LD-1789980490283 are ignored.
                 */
                if (
                    Number.isFinite(number) &&
                    number <= 999999 &&
                    number > existingMaxNumber
                ) {

                    existingMaxNumber =
                        number;

                }

            }
        );

    } catch (error) {

        console.error(
            "Unable to inspect existing Lead IDs:",
            error
        );

        throw error;
    }


    /*
     * Atomically reserve the next Lead number.
     */
    const nextNumber =
        await runTransaction(
            db,
            async (transaction) => {

                const counterSnapshot =
                    await transaction.get(
                        counterRef
                    );

                let currentNumber =
                    existingMaxNumber;

                if (
                    counterSnapshot.exists()
                ) {

                    currentNumber =
                        Number(
                            counterSnapshot
                                .data()
                                ?.currentNumber || 0
                        );

                }

                const nextNumber =
                    currentNumber + 1;

                transaction.set(
                    counterRef,
                    {
                        currentNumber:
                            nextNumber,

                        updatedAt:
                            serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );

                return nextNumber;

            }
        );

    return (
        "ORB-LD-" +
        String(nextNumber)
            .padStart(4, "0")
    );
}



/*
=====================================================
CREATE LEAD
=====================================================
*/

export async function createLead(leadData) {

    const generatedLeadId =
        await generateLeadId();

    const lead = {
        leadId:
            generatedLeadId,
        
        source: leadData.source || "Other",
sourceDetail: leadData.sourceDetail || "",

createdFrom:
    leadData.createdFrom ||
    "lead-management",

leadTitle: leadData.leadTitle || "",


        name: leadData.name || "",
        mobile: leadData.mobile || "",
        email: leadData.email || "",

        destination: leadData.destination || "",
        travelFrom: leadData.travelFrom || "",
        travelTo: leadData.travelTo || "",

        adults: Number(leadData.adults || 0),
        children: Number(leadData.children || 0),

        budget: leadData.budget || "",
        requirement: leadData.requirement || "",

        campaign: leadData.campaign || "",
        utmSource: leadData.utmSource || "",
        utmMedium: leadData.utmMedium || "",
        utmCampaign: leadData.utmCampaign || "",

        assignedTo: leadData.assignedTo || "",

        status: leadData.status || "New",

        nextFollowUp: leadData.nextFollowUp || "",

        notes: leadData.notes || "",

        clientId: leadData.clientId || "",
        enquiryId: leadData.enquiryId || "",

        createdBy: leadData.createdBy || "",
        createdByName: leadData.createdByName || "",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(
        collection(db, LEADS_COLLECTION),
        lead
    );

    return {
        id: docRef.id,
        ...lead
    };
}


/*
=====================================================
GET ALL LEADS
=====================================================
*/

export async function getAllLeads() {

    const snapshot = await getDocs(
        collection(db, LEADS_COLLECTION)
    );

    const leads = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));

    return leads.sort((a, b) => {

        const aTime =
            a.createdAt?.toMillis?.() || 0;

        const bTime =
            b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
    });
}


/*
=====================================================
UPDATE LEAD
=====================================================
*/

export async function updateLead(
    leadId,
    updates
) {

    const leadRef =
        doc(db, LEADS_COLLECTION, leadId);

    await updateDoc(
        leadRef,
        {
            ...updates,
            updatedAt: serverTimestamp()
        }
    );
}


/*
=====================================================
DELETE LEAD
=====================================================
*/

export async function deleteLead(
    leadId
) {

    const leadRef =
        doc(db, LEADS_COLLECTION, leadId);

    await deleteDoc(leadRef);
}