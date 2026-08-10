


import { useState, useEffect, useRef } from "react";

import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc =
    new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
    ).toString();

import QuoteForm from "../components/quotation/QuoteForm";
import QuotePreview from "../components/quotation/QuotePreview";

import { defaultCancellationPolicies } from "../data/defaultCancellationPolicies";

import { itineraryTemplates } from "../data/itineraryTemplates";

import { defaultItineraryDay } from "../data/defaultItineraryDay";

import ResumeWorkingCopyModal
from "../components/quotation/ResumeWorkingCopyModal";

import { calculateQuotationTotals }
    from "../utils/quotationCalculator";

import { generateQuotationPdf } from "../pdf/generateQuotationPdf";



import {
    saveDraft,
    getLatestDraft,
    getAllDrafts,
    deleteDraft,
    updateDraftStatus,
    saveWorkingCopy,
    clearWorkingCopy,
    getWorkingCopy
} from "../utils/quotationStorage";

import DraftLibrary
from "../components/quotation/DraftLibrary";

const defaultCommonData = {

   quoteMode: "package",
   showInclusionExclusion: false,
    quotationNo: `ORB-${Date.now()}`,

    clientName: "",
    mobile: "",
    email: "",

    destination: "",
    city: "",
    travelFrom: "",
    travelTo: "",


    totalDays: "",
    totalNights: "",

    adults: 2,
    children: 0,

    specialNotes: "",

useVehicleCosting: false,

vehicleCosts: [
  {
    id: Date.now(),
    vehicle: "",
    cost: ""
  }
],

perAdultCost: 0,
perChildCost: 0,
markupPercent: 15,
gstPercent: 5,

    

    cancellationRefundPolicy: defaultCancellationPolicies.map(policy => ({
    ...policy
})),

  };

  const defaultPackageData = {

    hotelCategory: "3 Star",

    selectedHotels: [],
    customHotels: [],

    sightseeing: [],
    customSightseeing: [],

    transfers: [],
    customTransfers: [],

    meals: [],
    customMeals: [],

    visaRequired: false,
    visaServices: [],
    customVisaServices: [],

    inclusions: [],
    exclusions: []
  };

  const defaultItineraryData = {
    itinerary: [
  {
  day: 1,
  title: "",
  description: "",

  hotelSource: "database",

  hotel: "",
  customHotel: "",

  hotelCategory: "",
  roomType: "",
  mealPlan: "",

  // ---------- Sightseeing ----------
  sightseeing: [],
  customSightseeing: [],
  customSightseeingInput: "",
  sightseeingMode: "chips",
  sightseeingText: "",
  selectedSightseeing: [],

  // ---------- Meals ----------
  meals: [],
  customMeals: [],
  customMealsInput: "",
  mealMode: "chips",
  mealText: "",

  // ---------- Transfers ----------
  transfers: [],
  customTransfers: [],
  customTransfersInput: "",
  transferMode: "chips",
  transferText: ""
}
]
  };




export default function DMCQuotationGenerator() {

    const [showDraftLibrary, setShowDraftLibrary] =
    useState(false);

    const [revisionHistoryDraft, setRevisionHistoryDraft] =
    useState(null);

    const [viewingRevision, setViewingRevision] =
    useState(null);

    const [viewingRevisionCurrentNo, setViewingRevisionCurrentNo] =
    useState(0);

    const [viewingRevisionModified, setViewingRevisionModified] =
    useState(false);

    const [revisionHistoryReturnQuotationNo, setRevisionHistoryReturnQuotationNo] =
    useState(null);

    const [historyOpenedFromLibrary, setHistoryOpenedFromLibrary] =
    useState(false);

    const [resumeModalOpen, setResumeModalOpen] =
    useState(false);

    const pdfViewerRef = useRef(null);

    const autoSaveTimer = useRef(null);

    const autoSaveEnabled = useRef(true);

    const [reviewPdfOpen, setReviewPdfOpen] =
    useState(false);

    const [pdfViewerMode, setPdfViewerMode] =
    useState("review");

    const [reviewDraft, setReviewDraft] =
    useState(null);

    const [reviewPdfUrl, setReviewPdfUrl] = useState(null);

    const [pdfPageCount, setPdfPageCount] = useState(0);

    const [pdfPageWidth, setPdfPageWidth] = useState(800);

    const [pdfZoom, setPdfZoom] = useState(1);

    const [pdfFitMode, setPdfFitMode] = useState(false);

    const [editingDraft, setEditingDraft] = useState(null);

    const [workingCopy, setWorkingCopy] =
    useState(null);

    const [isDraftModified, setIsDraftModified] = useState(false);

    const workingCopyLoaded = useRef(false);

    const [drafts, setDrafts] = useState(getAllDrafts());

    const [showPreview, setShowPreview] =
    useState(false);

    const [previewMinimized, setPreviewMinimized] =
    useState(false);

    const [quotationSaveState, setQuotationSaveState] =
    useState("new");

    const [commonData, setCommonData] =
useState(() => ({

    ...defaultCommonData,

    quotationNo: `ORB-${Date.now()}`,

    vehicleCosts: [
        {
            id: Date.now(),
            vehicle: "",
            cost: ""
        }
    ],

    cancellationRefundPolicy:
        defaultCancellationPolicies.map(
            policy => ({
                ...policy
            })
        )

}));

const [currentRevision, setCurrentRevision] =
    useState(0);

    const [revisionHistory, setRevisionHistory] =
    useState([]);

 const [packageData, setPackageData] =
    useState(() => ({

        ...defaultPackageData

    }));

  const [itineraryData, setItineraryData] =
    useState(() => ({

        ...defaultItineraryData

    }));

     
const updatePackageData = (value) => {

    setPackageData(value);

    setIsDraftModified(true);

    setQuotationSaveState("modified");

    if (viewingRevision) {
        setViewingRevisionModified(true);
    }

};

const updateCommonData = (value) => {

    setCommonData(value);

    setIsDraftModified(true);

    setQuotationSaveState("modified");

    if (viewingRevision) {
        setViewingRevisionModified(true);
    }

};

const updateItineraryData = (value) => {

    setItineraryData(value);

    setIsDraftModified(true);

    setQuotationSaveState("modified");

    if (viewingRevision) {
        setViewingRevisionModified(true);
    }

};

    const handleStatusChange = (
    quotationNo,
    status
) => {

    

    updateDraftStatus(
        quotationNo,
        status
    );

    refreshDrafts();

};

const handleReviewPdf = async (draft) => {

     setPdfViewerMode("review");

    setReviewDraft(draft);

    setReviewPdfOpen(true);

    // Temporary
    const blob = await handleGeneratePdf(


        draft.commonData,

        draft.packageData,

        draft.itineraryData,

         "preview"

    );

    const url = URL.createObjectURL(blob);

    setReviewPdfUrl(url);

    console.log(blob);

};

const handlePdfPreview = async () => {

    setPdfZoom(1);

    setPdfFitMode(false);

    setPdfPageCount(0);

    if (pdfViewerRef.current) {

    const availableWidth =
        pdfViewerRef.current.clientWidth - 24;

    setPdfPageWidth(
        Math.max(
            600,
            Math.min(
                availableWidth,
                900
            )
        )
    );

}

    const blob = await handleGeneratePdf(

        commonData,

        packageData,

        itineraryData,

        "preview"

    );

    const url = URL.createObjectURL(blob);

    setPdfZoom(1);
setPdfFitMode(false);

    setReviewPdfUrl(url);

    requestAnimationFrame(() => {

    if (pdfViewerRef.current) {

        pdfViewerRef.current.scrollTop = 0;
        pdfViewerRef.current.scrollLeft = 0;

    }

});

    setReviewDraft({

        quotationNo: commonData.quotationNo,

        clientName: commonData.clientName,

        destination: commonData.destination,

        commonData,

        packageData,

        itineraryData

    });

    setPdfViewerMode("preview");

    setReviewPdfOpen(true);

};

const handleGeneratePdf = async (

    commonData,

    packageData,

    itineraryData,

      mode = "download"

) => {

    const quoteData = {

        ...commonData,

        ...packageData,

        ...itineraryData

    };

    const {

        subtotal,

        gstAmount,

        grandTotal,

        grandTotalUsd

    } = calculateQuotationTotals({

        commonData,

        usdRate: quoteData.usdRate

    });

   return await generateQuotationPdf({

    ...quoteData,

    applyGst: commonData.applyGst,

    gstPercent: commonData.gstPercent,

    subtotal,

    gstAmount,

    grandTotal,

    grandTotalUsd,

    mode

});

};

  const handleSaveDraft = () => {

    if (autoSaveTimer.current) {

    clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = null;

}

const isSavedDraftEdit =
    Boolean(editingDraft);

const nextRevision =
    isSavedDraftEdit
        ? (currentRevision || 0) + 1
        : 0;

        const isViewingRevisionEdit =
          Boolean(
        viewingRevision &&
        viewingRevisionModified
    );

    const isFirstSave =
    !editingDraft;

    saveDraft({

    quotationNo:
    commonData.quotationNo,

    displayQuotationNo:
    `ORB-${commonData.quotationNo.replace("ORB-", "").slice(-6)}`,

    destination:
        commonData.customDestination?.trim()
            || commonData.destination,

    clientName:
        commonData.clientName,

    savedAt:
        new Date().toISOString(),

    status: "Draft",

       originalData:
    editingDraft?.originalData
        ? structuredClone(
            editingDraft.originalData
        )
        : {
            commonData:
                structuredClone(commonData),

            packageData:
                structuredClone(packageData),

            itineraryData:
                structuredClone(itineraryData)
        },

...(isSavedDraftEdit
    ? {
        revisionNo: nextRevision,

        revisionHistory: [
    ...(editingDraft?.revisionHistory || revisionHistory || []),

            {
                revisionNo: nextRevision,
                savedAt:
                    new Date().toISOString(),

                commonData:
                    structuredClone(commonData),

                packageData:
                    structuredClone(packageData),

                itineraryData:
                    structuredClone(itineraryData)
            }
        ]
    }
    : {}),

commonData,

packageData,

itineraryData

});

if (isSavedDraftEdit) {

    setCurrentRevision(nextRevision);

    setRevisionHistory(prev => [
        ...prev,

        {
            revisionNo: nextRevision,
            savedAt: new Date().toISOString(),

            commonData:
                structuredClone(commonData),

            packageData:
                structuredClone(packageData),

            itineraryData:
                structuredClone(itineraryData)
        }
    ]);

}

setIsDraftModified(false);
refreshDrafts();
setIsDraftModified(false);
setQuotationSaveState("saved");

setViewingRevision(null);
setViewingRevisionModified(false);
setViewingRevisionCurrentNo(0);

if (isSavedDraftEdit) {

    setEditingDraft({
        ...(editingDraft || {}),
        quotationNo: commonData.quotationNo,

        originalData:
    editingDraft?.originalData
        ? structuredClone(
            editingDraft.originalData
        )
        : {
            commonData:
                structuredClone(commonData),

            packageData:
                structuredClone(packageData),

            itineraryData:
                structuredClone(itineraryData)
        },

        revisionNo: nextRevision,

        revisionHistory: [
            ...(editingDraft?.revisionHistory || revisionHistory || []),
            {
                revisionNo: nextRevision,
                savedAt: new Date().toISOString(),

                commonData:
                    structuredClone(commonData),

                packageData:
                    structuredClone(packageData),

                itineraryData:
                    structuredClone(itineraryData)
            }
        ]
    });

} else {

    // First save remains a normal saved quotation.
    // It is NOT considered an "existing draft" being edited.
    setEditingDraft(null);

}

clearWorkingCopy();
setWorkingCopy(null);
setResumeModalOpen(false);
alert("Draft saved successfully.");

};

const handleOpenLastDraft = () => {

    const draft =
        getLatestDraft();

    if (!draft) {

        alert("No draft found.");

        return;

    }

    setCommonData(
        draft.commonData
    );

    setPackageData(
        draft.packageData
    );

    setItineraryData(
        draft.itineraryData
    );

    alert("Draft loaded successfully.");

};

function refreshDrafts() {

    setDrafts(getAllDrafts());

}

const handleOpenDraftLibrary =
    () => {

    setShowDraftLibrary(true);

};

const handleRevisionHistory = (draft) => {

    console.log(
        "REVISION HISTORY DRAFT:",
        draft
    );

    console.log(
        "ORIGINAL DATA FROM DRAFT:",
        draft?.originalData
    );

    setHistoryOpenedFromLibrary(true);

    setRevisionHistoryReturnQuotationNo(
        draft.quotationNo
    );

    setRevisionHistoryDraft(draft);
};

const handleViewRevision = (
    revision,
    openedFromLibrary
) => {

    setViewingRevision(revision);

    setCommonData(
        structuredClone(revision.commonData)
    );

    setPackageData(
        structuredClone(revision.packageData)
    );

    setItineraryData(
        structuredClone(revision.itineraryData)
    );

    // Keep the original saved quotation as the editing draft
    // so Return to Current knows what to restore.
    if (revisionHistoryDraft) {

        setEditingDraft(
            structuredClone(revisionHistoryDraft)
        );

        setCurrentRevision(
            revisionHistoryDraft.revisionNo || 0
        );

        setViewingRevisionCurrentNo(
            revisionHistoryDraft.revisionNo || 0
        );

    }

    setIsDraftModified(false);

    setQuotationSaveState("library");

setRevisionHistoryDraft(null);

if (openedFromLibrary) {
    setShowDraftLibrary(false);
}

setHistoryOpenedFromLibrary(false);

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

};

const handleDuplicateDraft = (draft) => {

    // Create a deep copy
    const copy = structuredClone(draft);

    // Generate a NEW quotation number
    copy.commonData = {
    ...copy.commonData,
    quotationNo: `ORB-${Date.now()}`
};

// Update draft metadata
copy.savedAt = new Date().toISOString();
copy.status = "Draft";

    // Load into the editor
    setCommonData(copy.commonData);
    setPackageData(copy.packageData);
    setItineraryData(copy.itineraryData);
    setIsDraftModified(true);

    setViewingRevision(null);
    setViewingRevisionCurrentNo(0);
    setHistoryOpenedFromLibrary(false);
    setRevisionHistoryDraft(null);

    // Close the library
    setShowDraftLibrary(false);
    alert(
    "Quotation duplicated successfully.\n\nA new quotation has been opened in the editor.\nSave it when you're ready."
);

};

const handleOpenDraft = (draft) => {

    // Close Review PDF if open
    if (reviewPdfUrl) {

        URL.revokeObjectURL(reviewPdfUrl);

    }

    setReviewPdfUrl(null);

    setReviewPdfOpen(false);

    setIsDraftModified(false);

    setQuotationSaveState("library");

    setViewingRevision(null);
    setViewingRevisionCurrentNo(0);
    setHistoryOpenedFromLibrary(false);
    setRevisionHistoryDraft(null);

    setCurrentRevision(
    draft.revisionNo || 0
);

setRevisionHistory(
    draft.revisionHistory || []
);

    // Close Draft Library
    setShowDraftLibrary(false);

    // Load quotation
    setCommonData(
        draft.commonData
    );

    setPackageData(
        draft.packageData
    );

    setItineraryData(
        draft.itineraryData
    );

   setEditingDraft(draft);

window.scrollTo({

    top: 0,

    behavior: "smooth"

});

};

const handleDeleteDraft = (quotationNo) => {

    deleteDraft(quotationNo);

refreshDrafts();

};

const handleDeleteRevision = (revision) => {

    if (!revisionHistoryDraft) {
        return;
    }

    const confirmed = window.confirm(
        `Delete Revision ${revision.revisionNo}?\n\n` +
        `This revision will be permanently removed from the revision history.`
    );

    if (!confirmed) {
        return;
    }

    const allRevisions =
        revisionHistoryDraft.revisionHistory || [];

    const remainingRevisions =
        allRevisions.filter(
            item =>
                item.revisionNo !==
                revision.revisionNo
        );

        console.log(
    "Deleting revision:",
    revision.revisionNo
);

console.log(
    "Remaining revisions:",
    remainingRevisions
);

console.log(
    "Original data:",
    revisionHistoryDraft.originalData
);


    const isCurrentRevision =
        revision.revisionNo ===
        revisionHistoryDraft.revisionNo;

    /*
     * -----------------------------------------
     * CASE 1 — deleting an older revision
     * -----------------------------------------
     */

    if (!isCurrentRevision) {

        const updatedDraft = {
            ...structuredClone(revisionHistoryDraft),
            revisionHistory:
                remainingRevisions
        };

        saveDraft(updatedDraft);

        setRevisionHistoryDraft(updatedDraft);

        setRevisionHistory(
            remainingRevisions
        );

        refreshDrafts();

        return;
    }

    /*
     * -----------------------------------------
     * CASE 2 — deleting CURRENT revision
     * -----------------------------------------
     */

    const sortedRemaining =
        [...remainingRevisions].sort(
            (a, b) =>
                b.revisionNo -
                a.revisionNo
        );

    const previousRevision =
        sortedRemaining[0];

    /*
     * If another revision remains,
     * roll back to that revision.
     */

    if (previousRevision) {

        const updatedDraft = {

            ...structuredClone(
                revisionHistoryDraft
            ),

            commonData:
                structuredClone(
                    previousRevision.commonData
                ),

            packageData:
                structuredClone(
                    previousRevision.packageData
                ),

            itineraryData:
                structuredClone(
                    previousRevision.itineraryData
                ),

            revisionNo:
                previousRevision.revisionNo,

            revisionHistory:
                remainingRevisions
        };

        saveDraft(updatedDraft);

        setCommonData(
            structuredClone(
                previousRevision.commonData
            )
        );

        setPackageData(
            structuredClone(
                previousRevision.packageData
            )
        );

        setItineraryData(
            structuredClone(
                previousRevision.itineraryData
            )
        );

        setCurrentRevision(
            previousRevision.revisionNo
        );

        setEditingDraft(
            updatedDraft
        );

        setRevisionHistory(
            remainingRevisions
        );

        setRevisionHistoryDraft(
            updatedDraft
        );

        setViewingRevision(null);

        setViewingRevisionModified(false);

        setViewingRevisionCurrentNo(
            previousRevision.revisionNo
        );

        refreshDrafts();

        return;
    }

   /*
 * -----------------------------------------
 * CASE 3 — no revisions remain
 * → restore ORIGINAL DRAFT
 * -----------------------------------------
 */

const original =
    revisionHistoryDraft.originalData;

if (!original) {

    alert(
        "The original saved quotation data is not available for this older draft. " +
        "Please use a quotation created after the Original Draft snapshot was added."
    );

    return;
}

const updatedDraft = {

    ...structuredClone(
        revisionHistoryDraft
    ),

    commonData:
        structuredClone(
            original.commonData
        ),

    packageData:
        structuredClone(
            original.packageData
        ),

    itineraryData:
        structuredClone(
            original.itineraryData
        ),

    clientName:
        original.commonData.clientName,

    destination:
        original.commonData.customDestination?.trim()
            || original.commonData.destination
            || "",

    revisionNo: undefined,

    revisionHistory: []
};

saveDraft(updatedDraft);

console.log(
    "DRAFT AFTER FINAL REVISION DELETE:",
    getAllDrafts().find(
        draft =>
            draft.quotationNo ===
            revisionHistoryDraft.quotationNo
    )
);

// Clear revision state
setRevisionHistory([]);

setCurrentRevision(0);

setViewingRevision(null);

setViewingRevisionModified(false);

setViewingRevisionCurrentNo(0);

// Close Revision History
setRevisionHistoryDraft(null);

/*
 * If History was opened from the Editor:
 * restore Original Draft into the editor.
 *
 * If History was opened from Library:
 * leave the editor untouched.
 * The Library remains open and the user
 * can click Open if they want the quotation
 * in the editor.
 */

if (!historyOpenedFromLibrary) {

    setCommonData(
        structuredClone(
            original.commonData
        )
    );

    setPackageData(
        structuredClone(
            original.packageData
        )
    );

    setItineraryData(
        structuredClone(
            original.itineraryData
        )
    );

    setEditingDraft(null);
}

setHistoryOpenedFromLibrary(false);

refreshDrafts();

};

const handleResumeWorkingCopy = () => {

    setCommonData(
        workingCopy.commonData
    );

    setPackageData(
        workingCopy.packageData
    );

    setItineraryData(
        workingCopy.itineraryData
    );

    setIsDraftModified(true);

    setResumeModalOpen(false);

};

const handleDiscardWorkingCopy = () => {

    clearWorkingCopy();

    setWorkingCopy(null);

    setResumeModalOpen(false);

};

const resetQuotation = () => {

    setCommonData({

        ...defaultCommonData,

        quotationNo: `ORB-${Date.now()}`,

        vehicleCosts: [
            {
                id: Date.now(),
                vehicle: "",
                cost: ""
            }
        ],

        cancellationRefundPolicy:
            defaultCancellationPolicies.map(
                policy => ({
                    ...policy
                })
            )

    });

    setPackageData({

        ...defaultPackageData

    });

    setItineraryData({

        ...defaultItineraryData

    });

    setIsDraftModified(false);

    setQuotationSaveState("new");

    setEditingDraft(null);

    setViewingRevision(null);
    setViewingRevisionCurrentNo(0);
    setHistoryOpenedFromLibrary(false);
    setRevisionHistoryDraft(null);

    // Close Review PDF if open
    if (reviewPdfUrl) {

        URL.revokeObjectURL(reviewPdfUrl);

    }

    setReviewPdfUrl(null);

    setReviewPdfOpen(false);

};

const handleEditQuotation = (draft) => {

    setReviewPdfOpen(false);

    if (reviewPdfUrl) {

        URL.revokeObjectURL(reviewPdfUrl);

    }

    setReviewPdfUrl(null);

    setWorkingCopy(null);

    setResumeModalOpen(false);

    loadDraft(draft);

};


  const applyItineraryTemplate = (
    tripData
) => {

  const {

    destination,

    totalNights,

    totalDays

} = tripData;

  
const key = `${totalNights}N${totalDays}D`;



    

    const template =
        itineraryTemplates[destination]?.[key];

    if (!template) return;

// Don't overwrite an existing itinerary



    setItineraryData(prev => ({

        ...prev,

        itinerary: template.map((templateDay, index) => {

            const existing = {

    ...defaultItineraryDay,

    ...(prev.itinerary[index] || {})

};

            return {

    ...existing,

    day: index + 1,

    title: templateDay.title,

    description: templateDay.description,

    mealMode: "text",

    mealText: templateDay.meals,

    ...(templateDay.showCity && {
        city: templateDay.city
    })

};

        })

    }));

};


useEffect(() => {

    if (workingCopyLoaded.current) return;

    workingCopyLoaded.current = true;

    const saved = getWorkingCopy();

    if (!saved) return;

    setWorkingCopy(saved);

    setResumeModalOpen(true);

}, []);

function hasMeaningfulData() {
    
console.log(itineraryData.itinerary[0]);
    
    return (

        commonData.clientName.trim() !== "" ||

        commonData.destination.trim() !== "" ||

        commonData.mobile.trim() !== "" ||

        commonData.email.trim() !== "" ||

        commonData.specialNotes.trim() !== "" ||

        packageData.selectedHotels.length > 0 ||

        packageData.customHotels.length > 0 ||

        packageData.sightseeing.length > 0 ||

        packageData.customSightseeing.length > 0 ||

        packageData.transfers.length > 0 ||

        packageData.customTransfers.length > 0 ||

        itineraryData.itinerary.some(day =>

    (day.title || "").trim() !== "" ||

    (day.city || "").trim() !== "" ||

    (day.customCity || "").trim() !== "" ||

   (day.description || "").trim() !== "" ||

   (day.noteText || "").trim() !== "" ||

   (day.hotel || "").trim() !== "" ||

   (day.customHotel || "").trim() !== "" ||

   (day.sightseeingText || "").trim() !== "" ||

   (day.mealText || "").trim() !== "" ||

   (day.transferText || "").trim() !== ""

)
    );

}

useEffect(() => {

    console.log("editingDraft =", editingDraft);

}, [editingDraft]);


useEffect(() => {

    if (autoSaveTimer.current) {

        clearTimeout(autoSaveTimer.current);

    }

   autoSaveTimer.current = setTimeout(() => {

    console.log(
        "Meaningful:",
        hasMeaningfulData()
    );

    if (hasMeaningfulData()) {

        console.log("Saving working copy");

        saveWorkingCopy({

            commonData,
            packageData,
            itineraryData,

            savedAt: new Date().toISOString()

        });

    } else {

        console.log("Clearing working copy");

        clearWorkingCopy();

    }

}, 3000);

    return () => {

        if (autoSaveTimer.current) {

            clearTimeout(autoSaveTimer.current);

        }

    };

}, [

    commonData,
    packageData,
    itineraryData

]);

useEffect(() => {

    const updatePdfWidth = () => {

        if (!pdfViewerRef.current) return;

        const availableWidth =
            pdfViewerRef.current.clientWidth - 24;

        setPdfPageWidth(
            Math.max(
                600,
                Math.min(
                    availableWidth,
                    900
                )
            )
        );

    };

    updatePdfWidth();

    window.addEventListener(
        "resize",
        updatePdfWidth
    );

    const observer =
        new ResizeObserver(() => {
            updatePdfWidth();
        });

    if (pdfViewerRef.current) {

        observer.observe(
            pdfViewerRef.current
        );

    }

    return () => {

        window.removeEventListener(
            "resize",
            updatePdfWidth
        );

        observer.disconnect();

    };

}, [reviewPdfOpen]);

return (

    <>

        {editingDraft && (

            <div
                style={{
                    background: "#eff6ff",
                    border: "1px solid #3b82f6",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    marginBottom: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >

                <div>

                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "#1d4ed8"
                        }}
                    >
                        ✏ Editing Existing Draft
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "#4b5563",
                            marginTop: "4px"
                        }}
                    >
                        {editingDraft.displayQuotationNo}
                        {" • "}
                        {editingDraft.destination || "No Destination"}
                    </div>

                </div>

                
                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#2563eb"
                    }}
                >
                    Status: {editingDraft.status}
                </div>

            </div>

        )}

       {editingDraft && (
    <div
        style={{
            marginBottom: "6px",
            padding: "7px 10px",
            background: viewingRevision
                ? "#fff7ed"
                : "#f0fdf4",
            border: viewingRevision
                ? "1px solid #fed7aa"
                : "1px solid #bbf7d0",
            borderRadius: "6px",
            color: viewingRevision
                ? "#c2410c"
                : "#15803d",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
        }}
    >

        <div>
            {viewingRevision
    ? (
        viewingRevisionModified
            ? (
                <>
    ✏ Modified from Revision{" "}
    {viewingRevision.revisionNo}
    {" • "}
    Current saved Revision{" "}
    {viewingRevisionCurrentNo}
    {" • "}
    Next Save → Revision{" "}
    {viewingRevisionCurrentNo + 1}
</>
            )
            : (
                <>
                    👁 Viewing Revision{" "}
                    {viewingRevision.revisionNo}
                    {" • "}
                    Current saved revision:{" "}
                    {viewingRevisionCurrentNo}
                </>
            )
    )
                : (
    (editingDraft.revisionNo || currentRevision || 0) > 0
        ? (
            <>
                🟢 Current Revision{" "}
                {editingDraft.revisionNo || currentRevision}
            </>
          )
        : null
 )}
        </div>

        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0
    }}
>

    {viewingRevision && (
        <button
            onClick={() => {

                if (editingDraft) {

                    setCommonData(
                        structuredClone(
                            editingDraft.commonData
                        )
                    );

                    setPackageData(
                        structuredClone(
                            editingDraft.packageData
                        )
                    );

                    setItineraryData(
                        structuredClone(
                            editingDraft.itineraryData
                        )
                    );

                    setCurrentRevision(
                        editingDraft.revisionNo || 0
                    );

                }

                setViewingRevision(null);

                setViewingRevisionCurrentNo(0);

                setIsDraftModified(false);

                setQuotationSaveState("library");

            }}
            style={{
                height: "28px",
                padding: "0 10px",
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700,
                color: "#374151",
                whiteSpace: "nowrap"
            }}
        >
            ↩ Return to Current
        </button>
    )}

    <button
        onClick={() => {

            if (editingDraft) {

                setRevisionHistoryDraft(
                    structuredClone(editingDraft)
                );

            }

        }}
        style={{
            height: "28px",
            padding: "0 10px",
            border: "1px solid #d1d5db",
            background: "#fff",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 700,
            color: "#374151",
            whiteSpace: "nowrap"
        }}
    >
        🕒 Revision History
    </button>

</div>

    </div>
)}

        <div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "12px"
    }}
>

    

</div>

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
    }}
>

    {/* ========================= */}
    {/* PREVIEW TOOLS */}
    {/* ========================= */}

    <button
        onClick={() => setShowPreview(true)}
        style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600
        }}
    >
        👁 Live Preview
    </button>

    <button
        onClick={handlePdfPreview}
        style={{
            background: "#0f766e",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600
        }}
    >
        📄 PDF Preview
    </button>


    {/* DIVIDER */}

    <div
        style={{
            width: "1px",
            height: "30px",
            background: "#d1d5db",
            margin: "0 4px"
        }}
    />


    {/* ========================= */}
    {/* DRAFT MANAGEMENT */}
    {/* ========================= */}

   <button
    onClick={handleSaveDraft}

    disabled={
        quotationSaveState === "saved" ||
        (
            quotationSaveState === "library" &&
            !isDraftModified
        )
    }

    style={{
        background:
            quotationSaveState === "saved" ||
            (
                quotationSaveState === "library" &&
                !isDraftModified
            )
                ? "#15803d"
                : "#f59e0b",

        color: "#fff",

        border: "none",

        padding: "10px 18px",

        borderRadius: "8px",

        cursor:
            quotationSaveState === "saved" ||
            (
                quotationSaveState === "library" &&
                !isDraftModified
            )
                ? "default"
                : "pointer",

        fontWeight: 600,

        opacity:
            quotationSaveState === "saved" ||
            (
                quotationSaveState === "library" &&
                !isDraftModified
            )
                ? 0.85
                : 1
    }}
>
    {quotationSaveState === "saved"
    ? "✓ Saved"
    : quotationSaveState === "library"
        ? (
            isDraftModified
                ? "💾 Save Changes"
                : "✓ Saved"
        )
        : quotationSaveState === "modified"
            ? (
                editingDraft
                    ? "💾 Save Changes"
                    : "💾 Save Draft"
            )
            : "💾 Save Draft"}
</button>

    <button
        onClick={handleOpenDraftLibrary}
        style={{
            background: "#6b7280",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600
        }}
    >
        📂 Draft Library
    </button>

    <button
        onClick={() => {

            if (isDraftModified) {

                const proceed = window.confirm(
                    "You have unsaved changes. Start a new quotation anyway?"
                );

                if (!proceed) return;

            }

            resetQuotation();

        }}
        style={{
            background: "#374151",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600
        }}
    >
        🆕 New Quotation
    </button>

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginLeft: "auto",
        paddingLeft: "16px"
    }}
>

    <div
    style={{
        minWidth: "220px",
        textAlign: "right",
        lineHeight: 1.35
    }}
>

    <div
        style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#374151"
        }}
    >
        {commonData?.quotationNo || "-"}
    </div>

    <div
        style={{
            fontSize: "12px",
            marginTop: "2px",
            fontWeight: 600,
            color:
                quotationSaveState === "saved"
                    ? "#15803d"
                    : quotationSaveState === "modified"
                        ? "#b45309"
                        : quotationSaveState === "library"
                            ? "#2563eb"
                            : "#6b7280"
        }}
    >
        {quotationSaveState === "saved"
            ? "✓ Saved"
            : quotationSaveState === "modified"
                ? "⚠️ Unsaved Changes"
                : quotationSaveState === "library"
                    ? "📂 Working on Saved Draft"
                    : "🆕 New Quotation"}
    </div>

    <div
    style={{
        fontSize: "12px",
        color: "#1f2937",
        fontWeight: 700,
        marginTop: "4px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }}
>
        {commonData?.clientName || "No client"}
        {" • "}
        {commonData?.customDestination?.trim()
            || commonData?.destination
            || "No destination"}
    </div>

</div>

</div>
</div>



   <QuoteForm
    commonData={commonData}
    setCommonData={updateCommonData}

    packageData={packageData}
    setPackageData={updatePackageData}

    itineraryData={itineraryData}
    setItineraryData={updateItineraryData}

    applyItineraryTemplate={applyItineraryTemplate}
/>

    {showPreview && (

    <div
       style={{
    position: "fixed",

    left: previewMinimized ? "auto" : "50%",
    top: previewMinimized ? "auto" : "50%",

    right: previewMinimized ? "20px" : "auto",
    bottom: previewMinimized ? "20px" : "auto",

    transform: previewMinimized
        ? "none"
        : "translate(-50%, -50%)",

    width: previewMinimized
        ? "260px"
        : "920px",

    maxWidth: "96vw",

    height: previewMinimized
        ? "48px"
        : "90vh",

    background: "#f3f4f6",

    border: "1px solid #d1d5db",

    borderRadius: "16px",

    boxShadow: "0 24px 80px rgba(0,0,0,.30)",

    zIndex: 3000,

    overflow: "hidden",

    display: "flex",

    flexDirection: "column",

    transition: "all .25s ease"
}}
    >

        {/* Header */}

        <div
            style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "12px 16px",

    background: "#1d4ed8",

    color: "#fff",

    fontWeight: 700,

    minHeight: "48px",

    boxSizing: "border-box",

    flexShrink: 0,

    borderBottom: "1px solid rgba(255,255,255,.18)"
}}
        >

            <span
    style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
    }}
>
    <span>👁</span>

    <span>Live Preview</span>

    <span
        style={{
            fontSize: "11px",
            fontWeight: 500,
            opacity: 0.8,
            marginLeft: "4px"
        }}
    >
        • React View
    </span>
</span>

            <div
    style={{
        display: "flex",
        gap: "10px"
    }}
>

    <button
        onClick={() =>
            setPreviewMinimized(
                !previewMinimized
            )
        }
        style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px"
        }}
    >
        {previewMinimized ? "▢" : "🗕"}
    </button>

    <button
        onClick={() =>
            setShowPreview(false)
        }
        style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px"
        }}
    >
        ✕
    </button>

</div>

        </div>

        {!previewMinimized && (

    <div
       style={{
    flex: 1,

    overflow: "auto",

    padding: "24px",

    display: "flex",

    justifyContent: "center",

    alignItems: "flex-start",

    background: "#eef2f7"
}}
    >

        <div
    style={{
        width: "100%",
        maxWidth: "920px"
    }}
>

        <QuotePreview
            commonData={commonData}
            packageData={packageData}
            itineraryData={itineraryData}
            onGeneratePdf={handleGeneratePdf}
            handleSaveDraft={handleSaveDraft}
            handleOpenLastDraft={handleOpenLastDraft}
            handleOpenDraftLibrary={handleOpenDraftLibrary}
            isDraftModified={isDraftModified}
        />

    </div>
</div>
)}

    </div>

)}

  <DraftLibrary
    open={showDraftLibrary}
    drafts={drafts}
    onReviewPdf={handleReviewPdf}
    onOpen={handleOpenDraft}
    onDuplicate={handleDuplicateDraft}
    onDelete={handleDeleteDraft}
    onStatusChange={handleStatusChange}
    onRevisionHistory={handleRevisionHistory}
    onClose={() =>
        setShowDraftLibrary(false)
    }
/>

{revisionHistoryDraft && (
    <div
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box"
        }}
    >

        <div
            style={{
                width: "620px",
                maxWidth: "95vw",
                maxHeight: "85vh",
                background: "#fff",
                borderRadius: "14px",
                boxShadow: "0 20px 60px rgba(0,0,0,.25)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    padding: "18px 20px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px"
                }}
            >

                <div>

                    <div
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#111827"
                        }}
                    >
                        🕒 Revision History
                    </div>

                    <div
                        style={{
                            marginTop: "4px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#4b5563"
                        }}
                    >
                        ORB-{revisionHistoryDraft.quotationNo
                            ?.replace("ORB-", "")
                            .slice(-6)}
                        {" • "}
                        {revisionHistoryDraft.clientName
                            || revisionHistoryDraft.commonData?.clientName
                            || "No client"}
                        {" • "}
                        {revisionHistoryDraft.destination
                            || revisionHistoryDraft.commonData?.destination
                            || "No destination"}

                            {" • "}
                        {revisionHistoryDraft.revisionNo > 0
                        ? `Revision ${revisionHistoryDraft.revisionNo}`
                        : "No revisions yet"}
                    </div>

                </div>


                {/* CLOSE */}

                <button
                    onClick={() =>
                        setRevisionHistoryDraft(null)
                    }
                    style={{
                        width: "32px",
                        height: "32px",
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#374151"
                    }}
                >
                    ×
                </button>

            </div>


            {/* HISTORY CONTENT */}

            <div
                style={{
                    padding: "20px",
                    overflowY: "auto",
                    flex: 1
                }}
            >

                {revisionHistoryDraft.revisionHistory?.length > 0 ? (

                    [...revisionHistoryDraft.revisionHistory]
                        .sort(
                            (a, b) =>
                                b.revisionNo -
                                a.revisionNo
                        )
                        .map((revision) => (

                            <div
                                key={revision.revisionNo}
                                style={{
    border:
        revision.revisionNo ===
        revisionHistoryDraft.revisionNo
            ? "2px solid #2563eb"
            : "1px solid #e5e7eb",

    borderRadius: "10px",

    padding: "14px 16px",

    marginBottom: "10px",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "15px",

    background:
        revision.revisionNo ===
        revisionHistoryDraft.revisionNo
            ? "#eff6ff"
            : "#fff"
}}
                            >

                                <div>

                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            color: "#111827"
                                        }}
                                    >
                                        Revision {revision.revisionNo}

                                        {revision.revisionNo ===
                                            revisionHistoryDraft.revisionNo && (
                                            <span
                                                style={{
                                                    marginLeft: "8px",
                                                    fontSize: "11px",
                                                    color: "#16a34a",
                                                    fontWeight: 700
                                                }}
                                            >
                                                ✓ Current
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "4px",
                                            fontSize: "12px",
                                            color: "#6b7280"
                                        }}
                                    >
                                        {new Date(
                                            revision.savedAt
                                        ).toLocaleString()}
                                    </div>

                                </div>


                                <button
    onClick={() => {
        handleViewRevision(
            revision,
            historyOpenedFromLibrary
        );
    }}
                                    style={{
                                        background: "#2563eb",
                                        color: "#fff",
                                        border: "none",
                                        padding: "7px 12px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: 600
                                    }}
                                >
                                    👁 View
                                </button>

                                <button
    onClick={() => {
        handleDeleteRevision(revision);
    }}
    style={{
        background: "#dc2626",
        color: "#fff",
        border: "none",
        padding: "7px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
        marginLeft: "6px"
    }}
    title={`Delete Revision ${revision.revisionNo}`}
>
    🗑
</button>

                            </div>

                        ))

                ) : (

                    <div
                        style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "#6b7280",
                            fontSize: "14px"
                        }}
                    >
                        No revisions yet.
                    </div>

                )}

            </div>

            <div
    style={{
        padding: "12px 20px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "flex-end",
        background: "#f9fafb"
    }}
>
    <button
        onClick={() => {

    setShowDraftLibrary(true);

    setRevisionHistoryDraft(null);

if (openedFromLibrary) {
    setShowDraftLibrary(false);
}

setHistoryOpenedFromLibrary(false);

}}
        style={{
            height: "34px",
            padding: "0 14px",
            border: "1px solid #d1d5db",
            background: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151"
        }}
    >
        Close History
    </button>
</div>

        </div>

        

    </div>
)}

<ResumeWorkingCopyModal

    open={resumeModalOpen}

    workingCopy={workingCopy}

    onResume={handleResumeWorkingCopy}

    onDiscard={handleDiscardWorkingCopy}

/>

{reviewPdfOpen && (

    <div
        style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.55)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    padding: "12px",
    boxSizing: "border-box",

    zIndex: 9999,

    overflow: "auto"
}}
    >

        <div
    style={{
         width: "96vw",
    maxWidth: "1500px",

       height: "94vh",
    maxHeight: "94vh",

        background: "#fff",

        borderRadius: "12px",

       padding: "12px 16px",

        boxSizing: "border-box",

        boxShadow: "0 20px 60px rgba(0,0,0,.25)",

        display: "flex",
        flexDirection: "column",

        overflow: "hidden"
    }}
>

          <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "4px",
        minHeight: "30px",
        flexShrink: 0
    }}
>

    {/* TITLE */}

    <h2
        style={{
            margin: 0,
            fontSize: "18px",
            lineHeight: 1.2,
            whiteSpace: "nowrap"
        }}
    >
        {pdfViewerMode === "preview"
            ? "📄 PDF Preview • Current Work"
            : "📄 Final PDF Review"}
    </h2>


    {/* ZOOM CONTROLS — BUILDER ONLY */}

    {pdfViewerMode === "preview" && (

        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0
            }}
        >

            {/* MINUS */}

            <button
                onClick={() => {

                    setPdfFitMode(false);

                    setPdfZoom(
                        Math.max(
                            0.5,
                            pdfZoom - 0.1
                        )
                    );

                }}
                style={{
                    width: "34px",
                    height: "30px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                −
            </button>


            {/* ZOOM PERCENTAGE */}

            <button
                onClick={() => {

                    setPdfZoom(1);
                    setPdfFitMode(false);

                }}
                style={{
                    minWidth: "58px",
                    height: "30px",
                    padding: "0 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151"
                }}
            >
                {Math.round(pdfZoom * 100)}%
            </button>


            {/* PLUS */}

            <button
                onClick={() => {

                    setPdfFitMode(false);

                    setPdfZoom(
                        Math.min(
                            1.5,
                            pdfZoom + 0.1
                        )
                    );

                }}
                style={{
                    width: "34px",
                    height: "30px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                +
            </button>


            {/* FIT */}

            <button
                onClick={() => {

                    if (pdfFitMode) {

                        setPdfZoom(1);
                        setPdfFitMode(false);

                        return;
                    }

                    if (!pdfViewerRef.current) return;

                    const container =
                        pdfViewerRef.current;

                    const availableWidth =
                        container.clientWidth - 24;

                    const availableHeight =
                        container.clientHeight - 24;

                    const A4_RATIO = 210 / 297;

                    const widthFromHeight =
                        availableHeight * A4_RATIO;

                    const fittedWidth =
                        Math.min(
                            availableWidth,
                            widthFromHeight
                        );

                    const fitZoom =
                        fittedWidth / pdfPageWidth;

                    setPdfFitMode(true);

                    setPdfZoom(
                        Math.max(
                            0.5,
                            Math.min(
                                fitZoom,
                                1
                            )
                        )
                    );

                }}
                style={{
                    height: "30px",
                    padding: "0 10px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600
                }}
            >
                {pdfFitMode
                    ? "↗ 100%"
                    : "⛶ Fit"}
            </button>

        </div>

    )}

</div>

{pdfViewerMode === "preview" && (
    <p
        style={{
            marginTop: "-8px",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#6b7280"
        }}
    >
        This is the actual PDF generated from the current quotation.
        Save the quotation when you are satisfied with it.
    </p>
)}

{pdfViewerMode === "review" && (

    <>
           
              </>

)}

            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "8px",
        marginBottom: "8px",
        paddingBottom: "8px",
        borderBottom: "1px solid #e5e7eb"
    }}
>

    <div
    style={{
        display: "flex",
        gap: "10px"
    }}
>

    {pdfViewerMode === "preview" ? (

        <></>

    ) : (

        <>

            <button
                onClick={() =>
                    handleGeneratePdf(
                        reviewDraft.commonData,
                        reviewDraft.packageData,
                        reviewDraft.itineraryData,
                        "download"
                    )
                }
            >
                ⬇ Download PDF
            </button>

            <button>
                🖨 Print
            </button>

            <button
                onClick={() =>
                    handleOpenDraft(reviewDraft)
                }
            >
                ✏ Edit Quotation
            </button>

        </>

    )}

</div>

    <button
        onClick={() => {

            if (reviewPdfUrl) {

    URL.revokeObjectURL(reviewPdfUrl);

}

setReviewPdfUrl(null);

setReviewPdfOpen(false);

 setPdfZoom(1);

setPdfFitMode(false);

document.title = "Orbitz Holidays";

        }}
    >

        ✖ Close

    </button>

</div>

           <div

           ref={pdfViewerRef}
    style={{
    marginTop: "8px",
    flex: 1,
    minHeight: 0,
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    overflow: "auto",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "12px",
    boxSizing: "border-box"
}}
>

    {reviewPdfUrl && (

    <Document
        file={reviewPdfUrl}
        onLoadSuccess={({ numPages }) => {
            setPdfPageCount(numPages);
        }}
        loading={
    <div
        style={{
            minHeight: "240px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: "#6b7280",
            fontSize: "14px"
        }}
    >

        <div
            style={{
                fontSize: "28px"
            }}
        >
            📄
        </div>

        <div>
            Preparing PDF preview...
        </div>

    </div>
}
        error={
            <div
                style={{
                    padding: "20px",
                    color: "#dc2626"
                }}
            >
                Unable to display PDF.
            </div>
        }
    >

       {Array.from(
    new Array(pdfPageCount),
    (_, index) => (

        <div
    key={`pdf_page_${index + 1}`}
     style={{
        background: "#fff",
        marginBottom: "10px",
        boxShadow: "0 3px 12px rgba(0,0,0,.18)",
        lineHeight: 0
    }}
>
            <Page
                pageNumber={index + 1}
                width={pdfPageWidth * pdfZoom}
                renderTextLayer={false}
                renderAnnotationLayer={false}
            />


        </div>

    )
)}

    </Document>

)}

</div>

            
        </div>

    </div>

)}

 </>

);
  
}