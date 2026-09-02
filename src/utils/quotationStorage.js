
import { db } from "../firebase";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    deleteDoc
} from "firebase/firestore";


const STORAGE_KEY = "orbitzQuotationDrafts";

const WORKING_COPY_KEY =
    "orbitzWorkingCopy";



export function getDrafts() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    return saved
        ? JSON.parse(saved)
        : [];

}

export function getLatestDraft() {

    const drafts = getDrafts();

    return drafts.length
        ? drafts[0]
        : null;

}

export async function getAllUserProfiles() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );

        return snapshot.docs.map(
            docSnapshot => ({
                uid: docSnapshot.id,
                ...docSnapshot.data()
            })
        );

    } catch (error) {

        console.error(
            "🔥 USER PROFILES LOAD FAILED:",
            error
        );

        return null;

    }

}

export async function updateUserStatus(uid, status) {

    try {

        await setDoc(
            doc(
                db,
                "users",
                uid
            ),
            {
                status
            },
            {
                merge: true
            }
        );

        console.log(
            "🔥 USER STATUS UPDATED:",
            uid,
            status
        );

        return true;

    } catch (error) {

        console.error(
            "🔥 USER STATUS UPDATE FAILED:",
            error
        );

        return false;

    }

}


export async function getUserProfile(uid) {

    try {

        const userRef =
            doc(
                db,
                "users",
                uid
            );

        const snapshot =
            await getDoc(userRef);

        if (!snapshot.exists()) {

            console.warn(
                "USER PROFILE NOT FOUND:",
                uid
            );

            return null;
        }

        return snapshot.data();

    } catch (error) {

        console.error(
            "🔥 USER PROFILE LOAD FAILED:",
            error
        );

        return null;
    }

}


export async function saveDraft(draft) {

    // ==========================================
    // LOCAL STORAGE BACKUP
    // ==========================================

    const drafts = getDrafts();

    const index =
        drafts.findIndex(
            item =>
                item.quotationNo === draft.quotationNo
        );

    if (index >= 0) {

        drafts[index] = draft;

    } else {

        drafts.unshift(draft);

    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(drafts)
    );


    // ==========================================
    // FIRESTORE SHARED STORAGE
    // ==========================================

    try {

        await setDoc(
            doc(
                db,
                "drafts",
                draft.quotationNo
            ),
            draft
        );

        console.log(
            "🔥 DRAFT SAVED TO FIRESTORE:",
            draft.quotationNo
        );

    } catch (error) {

        console.error(
            "🔥 FIRESTORE DRAFT SAVE FAILED:",
            error
        );

        /*
         * LocalStorage has already been updated.
         *
         * Therefore a Firestore failure does NOT
         * destroy the user's local quotation.
         */
    }

}


export async function saveTaxInvoice(invoice) {

    // ==========================================
    // LOCAL STORAGE BACKUP
    // ==========================================

    const invoices =
        JSON.parse(
            localStorage.getItem("taxInvoices") || "[]"
        );

    const index =
        invoices.findIndex(
            item =>
                item.invoiceNo === invoice.invoiceNo
        );

    if (index >= 0) {

        invoices[index] = invoice;

    } else {

        invoices.unshift(invoice);

    }

    localStorage.setItem(
        "taxInvoices",
        JSON.stringify(invoices)
    );


    // ==========================================
    // FIRESTORE SHARED STORAGE
    // ==========================================

    try {

        console.log(
    "===== FIRESTORE TAX INVOICE SAVE CHECK =====",
    {
        dbExists:
            Boolean(db),

        invoiceNo:
            invoice?.invoiceNo,

        invoiceStatus:
            invoice?.status,

        paymentStatus:
            invoice?.paymentStatus
    }
);

        await setDoc(
            doc(
                db,
                "taxInvoices",
                invoice.invoiceNo
            ),
            invoice
        );

        console.log(
            "🔥 TAX INVOICE SAVED TO FIRESTORE:",
            invoice.invoiceNo
        );

    } catch (error) {

        console.error(
            "🔥 TAX INVOICE FIRESTORE SAVE FAILED:",
            error
        );

        /*
         * LocalStorage has already been updated.
         *
         * Therefore a Firestore failure does NOT
         * destroy the user's local tax invoice.
         */
    }

}


export function getTaxInvoices() {

    return JSON.parse(
        localStorage.getItem("taxInvoices") || "[]"
    );

}


export async function loadTaxInvoicesFromFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "taxInvoices"
                )
            );

        const invoices =
            snapshot.docs.map(
                docSnap => docSnap.data()
            );

        console.log(
            "🔥 TAX INVOICES LOADED FROM FIRESTORE:",
            invoices.length
        );

        /*
         * Keep Firestore as the shared source,
         * while maintaining a local cache.
         */
        localStorage.setItem(
            "taxInvoices",
            JSON.stringify(invoices)
        );

        return invoices;

    } catch (error) {

        console.error(
            "🔥 TAX INVOICES FIRESTORE LOAD FAILED:",
            error
        );

        /*
         * If Firestore is temporarily unavailable,
         * retain the existing local invoices.
         */
        return getTaxInvoices();

    }

}



export async function deleteTaxInvoice(invoiceId) {

    // ==========================================
    // GET CURRENT INVOICE BEFORE DELETION
    // ==========================================

    const invoices = getTaxInvoices();

    const invoiceToDelete =
        invoices.find(
            invoice =>
                invoice?.invoiceNo === invoiceId
        );


    // ==========================================
    // REMEMBER DELETED TAX INVOICE
    // ==========================================

    if (invoiceToDelete) {

        const deletedInvoices =
            JSON.parse(
                localStorage.getItem(
                    "deletedTaxInvoices"
                ) || "[]"
            );

        const alreadyTracked =
            deletedInvoices.some(
                invoice =>
                    invoice?.invoiceNo ===
                    invoiceId
            );

        if (!alreadyTracked) {

            deletedInvoices.unshift({

                invoiceNo:
                    invoiceToDelete.invoiceNo,

                quotationNo:
                    invoiceToDelete.quotationNo ||
                    "",

                sourceDraftQuotationNo:
                    invoiceToDelete.sourceDraftQuotationNo ||
                    invoiceToDelete.quotationNo ||
                    "",

                displayQuotationNo:
                    invoiceToDelete.displayQuotationNo ||
                    "",

                deletedAt:
                    new Date().toISOString(),

                status:
                    invoiceToDelete.status ||
                    "Pending"

            });

            localStorage.setItem(
                "deletedTaxInvoices",
                JSON.stringify(
                    deletedInvoices
                )
            );

        }

    }


    // ==========================================
    // LOCAL STORAGE
    // ==========================================

    const updatedInvoices =
        invoices.filter(
            invoice =>
                invoice?.invoiceNo !== invoiceId
        );

    localStorage.setItem(
        "taxInvoices",
        JSON.stringify(updatedInvoices)
    );


    // ==========================================
    // FIRESTORE
    // ==========================================

    try {

        await deleteDoc(
            doc(
                db,
                "taxInvoices",
                invoiceId
            )
        );

        console.log(
            "🔥 TAX INVOICE DELETED FROM FIRESTORE:",
            invoiceId
        );

    } catch (error) {

        console.error(
            "🔥 TAX INVOICE FIRESTORE DELETE FAILED:",
            error
        );

    }

}


export function getAllDrafts() {

    const drafts = getDrafts();

    drafts.sort((a, b) => {

        return new Date(b.savedAt) - new Date(a.savedAt);

    });

    return drafts;

}

export async function getAllDraftsFromFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "drafts"
                )
            );

        const drafts =
            snapshot.docs.map(
                docSnapshot =>
                    docSnapshot.data()
            );

        drafts.sort((a, b) => {

            return (
                new Date(b.savedAt) -
                new Date(a.savedAt)
            );

        });

        console.log(
            "🔥 DRAFTS LOADED FROM FIRESTORE:",
            drafts.length
        );

        return drafts;

    } catch (error) {

        console.error(
            "🔥 FIRESTORE DRAFT LOAD FAILED:",
            error
        );

        return null;

    }

}

export async function migrateLocalDraftsToFirestore() {

    const migrationKey =
        "orbitzDraftsFirestoreMigrationV1";

    // This browser/profile has already completed
    // its initial migration.
    if (
        localStorage.getItem(
            migrationKey
        ) === "done"
    ) {
        return;
    }

    const localDrafts =
        getDrafts();

    if (!localDrafts.length) {

        localStorage.setItem(
            migrationKey,
            "done"
        );

        return;
    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "drafts"
                )
            );

        const firestoreDrafts =
            new Map();

        snapshot.docs.forEach(
            docSnapshot => {

                const data =
                    docSnapshot.data();

                if (data?.quotationNo) {

                    firestoreDrafts.set(
                        data.quotationNo,
                        data
                    );

                }

            }
        );


        for (
            const localDraft
            of localDrafts
        ) {

            if (
                !localDraft?.quotationNo
            ) {
                continue;
            }

            const existing =
                firestoreDrafts.get(
                    localDraft.quotationNo
                );


            // If Firestore doesn't have this
            // quotation, migrate it.
            if (!existing) {

                await setDoc(
                    doc(
                        db,
                        "drafts",
                        localDraft.quotationNo
                    ),
                    localDraft
                );

                continue;
            }


            // If both locations have the same
            // quotation, keep the newer version.
            const localTime =
                new Date(
                    localDraft.savedAt || 0
                ).getTime();

            const firestoreTime =
                new Date(
                    existing.savedAt || 0
                ).getTime();


            if (
                localTime >
                firestoreTime
            ) {

                await setDoc(
                    doc(
                        db,
                        "drafts",
                        localDraft.quotationNo
                    ),
                    localDraft
                );

            }

        }


        localStorage.setItem(
            migrationKey,
            "done"
        );


        console.log(
            "🔥 LOCAL DRAFT MIGRATION COMPLETE:",
            localDrafts.length
        );


    } catch (error) {

        console.error(
            "🔥 LOCAL DRAFT MIGRATION FAILED:",
            error
        );

        /*
         * Do NOT mark the migration complete.
         *
         * This allows us to retry next time if
         * Firestore was temporarily unavailable.
         */
    }

}


export async function deleteDraft(quotationNo) {

    // ==========================================
    // LOCAL STORAGE BACKUP
    // ==========================================

    const drafts = getDrafts();

    const updated = drafts.filter(
        draft =>
            draft.quotationNo !== quotationNo
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
    );


    // ==========================================
    // FIRESTORE DELETE
    // ==========================================

    try {

        await deleteDoc(
            doc(
                db,
                "drafts",
                quotationNo
            )
        );

        console.log(
            "🔥 DRAFT DELETED FROM FIRESTORE:",
            quotationNo
        );

    } catch (error) {

        console.error(
            "🔥 FIRESTORE DRAFT DELETE FAILED:",
            error
        );

    }

}



export async function getAllTemplatesFromFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "templates"
                )
            );

        const templates =
    snapshot.docs.map(
        docSnapshot =>
            docSnapshot.data()
    );

templates.sort((a, b) => {

    return (
        new Date(
            b.updatedAt ||
            b.createdAt ||
            0
        ) -
        new Date(
            a.updatedAt ||
            a.createdAt ||
            0
        )
    );

});

// Keep LocalStorage backup synchronized
localStorage.setItem(
    "orbitz_itinerary_templates",
    JSON.stringify(templates)
);

console.log(
    "🔥 TEMPLATES LOADED FROM FIRESTORE:",
    templates.length
);

return templates;

    } catch (error) {

        console.error(
            "🔥 FIRESTORE TEMPLATE LOAD FAILED:",
            error
        );

        return null;

    }

}


export async function saveTemplateToFirestore(template) {

    try {

        await setDoc(
            doc(
                db,
                "templates",
                template.id
            ),
            template
        );

        console.log(
            "🔥 TEMPLATE SAVED TO FIRESTORE:",
            template.id
        );

        return true;

    } catch (error) {

        console.error(
            "🔥 FIRESTORE TEMPLATE SAVE FAILED:",
            error
        );

        return false;

    }

}

export async function deleteTemplateFromFirestore(id) {

    try {

        await deleteDoc(
            doc(
                db,
                "templates",
                id
            )
        );

        console.log(
            "🔥 TEMPLATE DELETED FROM FIRESTORE:",
            id
        );

        return true;

    } catch (error) {

        console.error(
            "🔥 FIRESTORE TEMPLATE DELETE FAILED:",
            error
        );

        return false;

    }

}

export async function migrateLocalTemplatesToFirestore() {

    const saved =
        localStorage.getItem(
            "orbitz_itinerary_templates"
        );

    const templates =
        saved
            ? JSON.parse(saved)
            : [];

    if (
        !Array.isArray(templates) ||
        templates.length === 0
    ) {

        console.log(
            "🔥 NO LOCAL TEMPLATES TO MIGRATE"
        );

        return 0;
    }

    let migratedCount = 0;

    for (const template of templates) {

        if (!template?.id) {
            continue;
        }

        const success =
            await saveTemplateToFirestore(
                template
            );

        if (success) {
            migratedCount++;
        }

    }

    console.log(
        "🔥 LOCAL TEMPLATE MIGRATION COMPLETE:",
        migratedCount
    );

    return migratedCount;

}






export function saveWorkingCopy(data) {

    

    localStorage.setItem(
        WORKING_COPY_KEY,
        JSON.stringify(data)
    );

}

export function getWorkingCopy() {

    const saved = localStorage.getItem(
        WORKING_COPY_KEY
    );

    return saved
        ? JSON.parse(saved)
        : null;

}

export function clearWorkingCopy() {

    localStorage.removeItem(
        WORKING_COPY_KEY
    );

}

export async function updateDraftStatus(

    quotationNo,

    status

) {

    const drafts = getDrafts();

    const index = drafts.findIndex(

        draft =>
            draft.quotationNo === quotationNo

    );


    // ==========================================
    // CONFIRMED DATE
    // ==========================================

    const existingDraft =
        index >= 0
            ? drafts[index]
            : null;

    const isConfirming =
        String(status || "")
            .toLowerCase() === "confirmed";

    const confirmedAt =
        isConfirming
            ? (
                existingDraft?.confirmedAt ||
                new Date().toISOString()
            )
            : existingDraft?.confirmedAt;


    // ==========================================
    // LOCAL STORAGE BACKUP
    // ==========================================

    if (index >= 0) {

        drafts[index] = {

            ...drafts[index],

            status,

            ...(confirmedAt
                ? { confirmedAt }
                : {})

        };

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(drafts)

        );

    }


    // ==========================================
    // FIRESTORE SHARED UPDATE
    // ==========================================

    try {

        const draftRef = doc(

            db,

            "drafts",

            quotationNo

        );


        /*
         * Read the existing Firestore draft first.
         * This makes the status update safe even if
         * the browser's localStorage copy is missing.
         */

        const snapshot =
            await getDoc(draftRef);


        if (!snapshot.exists()) {

            console.warn(

                "🔥 FIRESTORE DRAFT NOT FOUND:",
                quotationNo

            );

            return;

        }


        const firestoreDraft =
            snapshot.data();


        const firestoreConfirmedAt =
            isConfirming
                ? (
                    firestoreDraft?.confirmedAt ||
                    confirmedAt ||
                    new Date().toISOString()
                )
                : firestoreDraft?.confirmedAt;


        await setDoc(

            draftRef,

            {

                ...firestoreDraft,

                status,

                ...(firestoreConfirmedAt
                    ? {
                        confirmedAt:
                            firestoreConfirmedAt
                    }
                    : {})

            }

        );


        console.log(

            "🔥 DRAFT STATUS UPDATED IN FIRESTORE:",

            quotationNo,

            status

        );


        if (isConfirming) {

            console.log(

                "📅 DRAFT CONFIRMED AT:",

                firestoreConfirmedAt

            );

        }


    } catch (error) {

        console.error(

            "🔥 FIRESTORE STATUS UPDATE FAILED:",

            error

        );

    }

}