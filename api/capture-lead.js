


import {
    cert,
    getApps,
    initializeApp
} from "firebase-admin/app";

import {
    getFirestore,
    FieldValue
} from "firebase-admin/firestore";


// =========================================================
// FIREBASE ADMIN INITIALIZATION
// =========================================================

const serviceAccount =
    JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    );

const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential:
                cert(serviceAccount)
        });

const db =
    getFirestore(firebaseAdminApp);


// =========================================================
// HELPERS
// =========================================================

function sendJson(
    res,
    statusCode,
    data
) {

    res
        .status(statusCode)
        .setHeader(
            "Content-Type",
            "application/json"
        )
        .json(data);

}


function cleanValue(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();

}


function cleanNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// =========================================================
// LEAD ID GENERATOR
// =========================================================

async function generateLeadId() {

    const counterRef =
        db.collection("counters")
            .doc("leadId");

    /*
     * Read existing Leads before starting the
     * transaction.
     *
     * This matches the existing Lead Management
     * numbering logic.
     */
    let existingMaxNumber = 0;

    try {

        const leadsSnapshot =
            await db
                .collection("leads")
                .get();

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
                 * Old timestamp-style IDs are ignored.
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
        await db.runTransaction(
            async transaction => {

                const counterSnapshot =
                    await transaction.get(
                        counterRef
                    );

                let currentNumber =
                    existingMaxNumber;

                if (
                    counterSnapshot.exists
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
                            FieldValue
                                .serverTimestamp()
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

// =========================================================
// WEBSITE LEAD CAPTURE
// =========================================================

export default async function handler(
    req,
    res
) {

    // -----------------------------------------------------
    // METHOD
    // -----------------------------------------------------

    if (
        req.method !== "POST"
    ) {

        return sendJson(
            res,
            405,
            {
                success: false,
                error:
                    "Method not allowed."
            }
        );

    }


    // -----------------------------------------------------
    // SECURITY TOKEN
    // -----------------------------------------------------

    const suppliedToken =
        req.headers[
            "x-orbitz-lead-token"
        ];

    const expectedToken =
        process.env
            .LEAD_CAPTURE_SECRET;

    if (
        !expectedToken ||
        suppliedToken !==
            expectedToken
    ) {

        return sendJson(
            res,
            401,
            {
                success: false,
                error:
                    "Unauthorized."
            }
        );

    }


    // -----------------------------------------------------
    // REQUEST DATA
    // -----------------------------------------------------

    const body =
        req.body || {};


    // -----------------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------------

    const name =
        cleanValue(
            body.name
        );

    const mobile =
        cleanValue(
            body.mobile
        );

    if (
        !name ||
        !mobile
    ) {

        return sendJson(
            res,
            400,
            {
                success: false,
                error:
                    "Name and mobile are required."
            }
        );

    }


       // -----------------------------------------------------
    // DUPLICATE PROTECTION
    // -----------------------------------------------------

    const submissionId =
        cleanValue(
            body.submissionId
        );

    if (submissionId) {

        const existingLeadSnapshot =
            await db
                .collection("leads")
                .where(
                    "websiteSubmissionId",
                    "==",
                    submissionId
                )
                .limit(1)
                .get();

        if (
            !existingLeadSnapshot.empty
        ) {

            const existingLeadDoc =
                existingLeadSnapshot
                    .docs[0];

            const existingLeadData =
                existingLeadDoc.data();

            return sendJson(
                res,
                200,
                {
                    success: true,

                    duplicate: true,

                    leadId:
                        existingLeadData
                            .leadId || "",

                    leadDocId:
                        existingLeadDoc.id,

                    message:
                        "Lead already captured."
                }
            );

        }

    }


    // -----------------------------------------------------
    // GENERATE ORBITZ LEAD ID
    // -----------------------------------------------------

    const leadId =
        await generateLeadId();


    // -----------------------------------------------------
    // FIRESTORE LEAD DOCUMENT
    // -----------------------------------------------------

    const leadRef =
        db.collection("leads")
            .doc();


    const leadData = {

        // Orbitz Lead identity
        leadId,

        // Website source
        source:
            "Website",

        sourceDetail:
            "Website Query Form",

        createdFrom:
            "website",

        // Lead title
        leadTitle:
            [
                cleanValue(
                    body.destination
                ),
                "Holiday",
                name
            ]
                .filter(Boolean)
                .join(" – "),

        // Client details
        name,

        mobile,

        email:
            cleanValue(
                body.email
            ),

        // Travel details
destination:
    cleanValue(
        body.destination
    ),

preferredMonth:
    cleanValue(
        body.preferredMonth
    ),

travellers:
    cleanValue(
        body.travellers
    ),

travelFrom:
    cleanValue(
        body.travelFrom
    ),

travelTo:
    cleanValue(
        body.travelTo
    ),

adults:
    cleanNumber(
        body.adults
    ),

children:
    cleanNumber(
        body.children
    ),

        // Requirement
        requirement:
            cleanValue(
                body.requirement
            ),

        // New website lead
        status:
            "New",

        // Attribution
        campaign:
            cleanValue(
                body.campaign
            ),

        utmSource:
            cleanValue(
                body.utmSource
            ),

        utmMedium:
            cleanValue(
                body.utmMedium
            ),

        utmCampaign:
            cleanValue(
                body.utmCampaign
            ),

        // Optional website reference
               websiteSubmissionId:
            submissionId,

        // Empty CRM relationship fields
        clientId:
            "",

        enquiryId:
            "",

        // Staff assignment initially empty
        assignedTo:
            "",

        // Follow-up initially empty
        nextFollowUp:
            "",

        notes:
            "",

        // Audit fields
        createdBy:
            "website",

        createdByName:
            "Website Query Form",

        createdAt:
            FieldValue
                .serverTimestamp(),

        updatedAt:
            FieldValue
                .serverTimestamp()

    };


    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

    await leadRef.set(
        leadData
    );


    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return sendJson(
        res,
        201,
        {
            success: true,

            leadId,

            leadDocId:
                leadRef.id,

            message:
                "Lead captured successfully."
        }
    );

}