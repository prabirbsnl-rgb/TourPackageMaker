


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

import TaxInvoiceLibrary from "../components/taxinvoice/TaxInvoiceLibrary";

import TaxInvoiceEditor from "../components/taxinvoice/TaxInvoiceEditor";


import {
    saveDraft,
    getLatestDraft,
    getAllDrafts,
     getTaxInvoices,
      saveTaxInvoice,
    getAllDraftsFromFirestore,
    migrateLocalDraftsToFirestore,
    deleteDraft,
    updateDraftStatus,
    saveWorkingCopy,
    clearWorkingCopy,
    getWorkingCopy,
    saveTemplateToFirestore
    
} from "../utils/quotationStorage";

import DraftLibrary
from "../components/quotation/DraftLibrary";

import {
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

import {
    db,
    auth
} from "../firebase";



const STORAGE_KEY = "orbitz_itinerary_templates";

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


    // =====================================================
// PDF THEME
// =====================================================

pdfTheme: {
  name: "Default",

  sections: {
    tourSummary: {
      enabled: true,
      color: "#17334F"
    },

    itinerary: {
      enabled: true,
      color: "#17334F"
    },

    hotelUsed: {
      enabled: true,
      color: "#5C3391"
    },

    billing: {
      enabled: true,
      color: "#6B2636"
    },
    
inclusions: {
  enabled: true,
  color: "#2446B5"
},

exclusions: {
  enabled: true,
  color: "#46556B"
},

    policy: {
      enabled: true,
      color: "#17334F"
    }
  }
},

    // =====================================================
// HOTEL USED
// =====================================================

hotelUsedEnabled: false,

hotelUsed: [
    {
        id: Date.now(),

        nightsRichText: "",
        nights: "",

        cityRichText: "",
        city: "",

        hotelNameRichText: "",
        hotelName: "",

        roomRichText: "",
        room: ""
    }
],



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




export default function DMCQuotationGenerator({
    userProfile
}) {

    const [showDraftLibrary, setShowDraftLibrary] =
    useState(false);

    const [showTaxInvoiceLibrary, setShowTaxInvoiceLibrary] =
    useState(false);

    const [taxInvoiceDraft, setTaxInvoiceDraft] =
    useState(null);

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

   const [saveItineraryAsTemplate, setSaveItineraryAsTemplate] =
    useState(false);

    const [showSaveDestinationModal, setShowSaveDestinationModal] =
    useState(false);

    const [saveDestinationChoice, setSaveDestinationChoice] =
    useState(null);

    const [templateSaveMode, setTemplateSaveMode] =
    useState(null);

    const [itineraryTemplateLabel, setItineraryTemplateLabel] =
    useState("");

    const [activeItineraryTemplate, setActiveItineraryTemplate] =
    useState(null);

    const [activeItineraryTemplateId, setActiveItineraryTemplateId] =
    useState(null);

    const [itineraryTemplateModified, setItineraryTemplateModified] =
    useState(false);

    const [itineraryTemplateSaveState, setItineraryTemplateSaveState] =
    useState("none");

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

    const [isImportingTemplate, setIsImportingTemplate] =
    useState(false);

    const importingTemplateRef = useRef(false);

    const [showEmailOptions, setShowEmailOptions] = useState(false);

   const [taxInvoices, setTaxInvoices] =
    useState([]);


   useEffect(() => {

    setTaxInvoices(
        getTaxInvoices()
    );

}, []);


    const [commonData, setCommonData] = useState(() => ({

    
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

useEffect(() => {

    console.log(
        "CURRENT COMMON DATA:",
        commonData
    );

}, [commonData]);


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

     console.log(
        "UPDATE PACKAGE DATA → DRAFT MODIFICATION CHECK",
        {
            importing:
                importingTemplateRef.current
        }
    );

    setPackageData(value);

    if (!importingTemplateRef.current) {

    

    console.trace();

    setIsDraftModified(true);

    setQuotationSaveState("modified");

    if (viewingRevision) {
        setViewingRevisionModified(true);
    }

}

};

const updateCommonData = (value) => {

    console.log(
        "UPDATE COMMON DATA → DRAFT MODIFICATION CHECK",
        {
            importing:
                importingTemplateRef.current,

            quoteMode:
                value?.quoteMode,

            value
        }
    );

    const onlyQuoteModeChanged =
        commonData?.quoteMode !== value?.quoteMode &&
        Object.keys(commonData || {}).every(key => {

            if (key === "quoteMode") {
                return true;
            }

            return (
                JSON.stringify(commonData?.[key]) ===
                JSON.stringify(value?.[key])
            );

        });

    if (
        !importingTemplateRef.current &&
        !onlyQuoteModeChanged
    ) {

       

        setIsDraftModified(true);

        setQuotationSaveState("modified");

        if (viewingRevision) {
            setViewingRevisionModified(true);
        }

    }

    setCommonData(value);

};

const updateItineraryData = (value) => {

     console.log(
        "UPDATE ITINERARY DATA → DRAFT MODIFICATION CHECK",
        {
            importing:
                importingTemplateRef.current
        }
    );


    setItineraryData(value);

    if (!importingTemplateRef.current) {

    

    console.trace();

    setIsDraftModified(true);

    setQuotationSaveState("modified");

    if (viewingRevision) {
        setViewingRevisionModified(true);
    }

}

};

    const handleStatusChange = async (
    quotationNo,
    status
) => {

    console.log(
        "🔥 HANDLE STATUS CHANGE:",
        quotationNo,
        status
    );


    await updateDraftStatus(
        quotationNo,
        status
    );


    // ==========================================
    // AUTO CREATE PENDING TAX INVOICE
    // ==========================================

    if (
        String(status).toLowerCase() ===
        "confirmed"
    ) {

        try {

            const confirmedDrafts =
                await getAllDraftsFromFirestore();

            const confirmedDraft =
                confirmedDrafts.find(
                    draft =>
                        draft?.quotationNo ===
                        quotationNo
                );


                console.log(
    "===== CONFIRMED DRAFT RATE CHECK =====",
    {
        quotationNo,

        confirmedDraftTotal:
            confirmedDraft?.totalAmountPayable,

        commonDataTotal:
            confirmedDraft?.commonData?.totalAmountPayable,

        perAdultCost:
            confirmedDraft?.commonData?.perAdultCost,

        perChildCost:
            confirmedDraft?.commonData?.perChildCost,

        adults:
            confirmedDraft?.commonData?.adults,

        children:
            confirmedDraft?.commonData?.children
    }
);



            if (confirmedDraft) {

                const existingTaxInvoices =
                    getTaxInvoices();

                const alreadyImported =
                    existingTaxInvoices.some(
                        invoice =>
                            invoice?.sourceDraftQuotationNo ===
                            quotationNo
                    );


                if (!alreadyImported) {

                    const sourceCommonData =
                        confirmedDraft?.commonData || {};

                        const autoTaxInvoiceQuotationTotals =
    calculateQuotationTotals({
        commonData: sourceCommonData,
        usdRate: 86
    });

    
    console.log(
    "===== AUTO QUOTATION TOTAL DEBUG =====",
    {
        quotationNo,
        perAdultCost:
            sourceCommonData?.perAdultCost,
        perChildCost:
            sourceCommonData?.perChildCost,
        adults:
            sourceCommonData?.adults,
        children:
            sourceCommonData?.children,
        markupPercent:
            sourceCommonData?.markupPercent,
        applyGst:
            sourceCommonData?.applyGst,
        gstPercent:
            sourceCommonData?.gstPercent,
        totalCost:
            autoTaxInvoiceQuotationTotals?.totalCost,
        gstAmount:
            autoTaxInvoiceQuotationTotals?.gstAmount,
        markupAmount:
            autoTaxInvoiceQuotationTotals?.markupAmount,
        suggestedTotalAmount:
            autoTaxInvoiceQuotationTotals?.suggestedTotalAmount
    }
);


const sourceTotalAmount =
    Number(
        confirmedDraft?.totalAmountPayable
    ) || 0;

const commonDataTotalAmount =
    Number(
        sourceCommonData?.totalAmountPayable
    ) || 0;

const calculatedQuotationAmount =
    Number(
        autoTaxInvoiceQuotationTotals?.grandTotal
    ) || 0;

const autoTaxInvoiceCustomerAmount =
    sourceTotalAmount > 0
        ? sourceTotalAmount
        : commonDataTotalAmount > 0
            ? commonDataTotalAmount
            : calculatedQuotationAmount;


            console.log(
    "===== AUTO TAX INVOICE RATE DEBUG =====",
    {
        quotationNo,

        perAdultCost:
            sourceCommonData?.perAdultCost,

        perChildCost:
            sourceCommonData?.perChildCost,

        adults:
            sourceCommonData?.adults,

        children:
            sourceCommonData?.children,

        markupPercent:
            sourceCommonData?.markupPercent,

        applyGst:
            sourceCommonData?.applyGst,

        gstPercent:
            sourceCommonData?.gstPercent,

        sourceTotalAmount,

        commonDataTotalAmount,

        calculatedQuotationAmount,

        autoTaxInvoiceCustomerAmount
    }
);



                    const taxInvoiceData = {

                        invoiceNo:
                            confirmedDraft?.quotationNo ||
                            quotationNo,

                        quotationNo:
                            confirmedDraft?.quotationNo ||
                            quotationNo,

                        displayQuotationNo:
                            confirmedDraft?.displayQuotationNo ||
                            "",

                        sourceDraftQuotationNo:
                            confirmedDraft?.quotationNo ||
                            quotationNo,


                       totalAmountPayable:
    autoTaxInvoiceCustomerAmount,


                        commonData:
                            structuredClone(
                                confirmedDraft?.commonData || {}
                            ),

                        packageData:
                            structuredClone(
                                confirmedDraft?.packageData || {}
                            ),

                        itineraryData:
                            structuredClone(
                                confirmedDraft?.itineraryData || {}
                            ),


                        clientName:
                            sourceCommonData.clientName ||
                            "",

                        mobile:
                            sourceCommonData.mobile ||
                            "",

                        email:
                            sourceCommonData.email ||
                            "",

                        customerAddress:
                            sourceCommonData.customerAddress ||
                            sourceCommonData.address ||
                            sourceCommonData.city ||
                            "",

                        customerGstinPan:
                            sourceCommonData.customerGstinPan ||
                            sourceCommonData.customerGstin ||
                            sourceCommonData.customerPan ||
                            "",


                        destination:
                            sourceCommonData.customDestination?.trim() ||
                            sourceCommonData.destination ||
                            "",

                        travelFrom:
                            sourceCommonData.travelFrom ||
                            "",

                        travelTo:
                            sourceCommonData.travelTo ||
                            "",

                        travelDates:
                            (
                                sourceCommonData.travelFrom ||
                                sourceCommonData.travelTo
                            )
                                ? `${sourceCommonData.travelFrom || ""} – ${sourceCommonData.travelTo || ""}`
                                : "",

                        passengerName:
                            sourceCommonData.clientName ||
                            "",

                        pax:
                            (
                                Number(
                                    sourceCommonData.adults || 0
                                ) +
                                Number(
                                    sourceCommonData.children || 0
                                )
                            ) || "",


                        placeOfSupply:
                            sourceCommonData.placeOfSupply ||
                            sourceCommonData.city ||
                            "",

                        invoiceDate:
                            sourceCommonData.invoiceDate ||
                            "",

                        dueDate:
                            sourceCommonData.dueDate ||
                            "",

                        bookingReference:
                            confirmedDraft?.displayQuotationNo ||
                            confirmedDraft?.quotationNo ||
                            "",


                        supplierGstin:
                            sourceCommonData.supplierGstin ??
                            "19AYTPS0423N1ZO",

                        supplierPan:
                            sourceCommonData.supplierPan ??
                            "AYTPS0423N",


                        status:
                            "Pending",

                        confirmedAt:
                            confirmedDraft?.confirmedAt ||
                            new Date().toISOString(),

                        createdAt:
                            "",

                        updatedAt:
                            new Date().toISOString()

                    };


                    await saveTaxInvoice(
                        taxInvoiceData
                    );

                    setTaxInvoices(
    getTaxInvoices()
);

                    console.log(
                        "🔥 AUTO TAX INVOICE CREATED:",
                        taxInvoiceData
                    );

                }

            }

        } catch (error) {

            console.error(
                "🔥 AUTO TAX INVOICE CREATION FAILED:",
                error
            );

        }

    }


    await refreshDrafts();

};

const handleReviewPdf = async (draft) => {


    console.log(
    "===== REVIEW DRAFT BILLING =====",
    {
        totalAmountPayable:
            draft?.commonData?.totalAmountPayable,

        packageCostDescription:
            draft?.commonData?.packageCostDescription,

        subtotal:
            draft?.commonData?.subtotal,

        applyGst:
            draft?.commonData?.applyGst,

        gstPercent:
            draft?.commonData?.gstPercent
    }
);

     setPdfViewerMode("review");

    setReviewDraft(draft);

    setReviewPdfOpen(true);



    console.log(
    "DRAFT PDF DATA CHECK:",
    {
        totalAmountPayable:
            draft?.commonData?.totalAmountPayable,

        packageCostDescription:
            draft?.commonData?.packageCostDescription,

        totalCost:
            draft?.commonData?.totalCost,

        gstAmount:
            draft?.commonData?.gstAmount,

        markupPercent:
            draft?.commonData?.markupPercent
    }
);


   
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

    displayQuotationNo:
        `ORB-${commonData.quotationNo
            .replace("ORB-", "")
            .slice(-6)}`,

    clientName: commonData.clientName,

    destination:
        commonData.customDestination?.trim()
        || commonData.destination,

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

    console.log(
    "PDF PAYABLE CHECK:",
    {
        commonDataPayable:
            commonData?.totalAmountPayable,

        quoteDataPayable:
            quoteData?.totalAmountPayable,

        packageDescription:
            quoteData?.packageCostDescription
    }
);


    const {

        subtotal,

        gstAmount,

        grandTotal,

        grandTotalUsd

    } = calculateQuotationTotals({

        commonData,

        usdRate: quoteData.usdRate

    });


    console.log("PDF FINAL CALC:", {
    subtotal,
    gstAmount,
    grandTotal,
    grandTotalUsd
});

   return await generateQuotationPdf({

    ...quoteData,

    // =====================================================
    // HOTEL USED
    // =====================================================

    hotelUsedEnabled:
        commonData?.hotelUsedEnabled,

    hotelUsed:
        commonData?.hotelUsed,

    // =====================================================


     // =====================================================
    // PDF THEME
    // =====================================================

    pdfTheme:
        commonData?.pdfTheme,

    // =====================================================


    applyGst:
        commonData.applyGst,

    gstPercent:
        commonData.gstPercent,

    subtotal,

    gstAmount,

    grandTotal,

    grandTotalUsd,

    mode

});

};

const saveCurrentItineraryAsTemplate = () => {

    if (
        !itineraryData ||
        !Array.isArray(itineraryData.itinerary) ||
        itineraryData.itinerary.length === 0
    ) {
        console.error(
            "Cannot save template: itinerary is empty."
        );

        alert(
            "Cannot save template because the itinerary is empty."
        );

        return false;
    }

    const destination =
        commonData?.customDestination?.trim() ||
        commonData?.destination ||
        "Custom Destination";

    const totalDays =
        Number(commonData?.totalDays || 0);

    const totalNights =
        Number(commonData?.totalNights || 0);

    const now =
        new Date().toISOString();

    const isUpdating =
        templateSaveMode === "update" &&
        !!activeItineraryTemplateId;

    console.log(
        "TEMPLATE SAVE CHECK:",
        {
            templateSaveMode,
            activeItineraryTemplateId,
            isUpdating
        }
    );

    const template = {

        id:
            isUpdating
                ? activeItineraryTemplateId
                : `IT-${Date.now()}`,

        name:
            `${destination} ${totalNights}N/${totalDays}D`,

        label:
            itineraryTemplateLabel?.trim() || "",

        destination,

        totalDays,

        totalNights,

        createdAt:
            now,

        updatedAt:
            now,

        usageCount: 0,

        isMaster: false,

        commonData:
            structuredClone(commonData),

        packageData:
            structuredClone(packageData),

        itineraryData:
            structuredClone(itineraryData)

    };

    try {

        const existing =
            localStorage.getItem(
                STORAGE_KEY
            );

        const parsedTemplates =
            existing
                ? JSON.parse(existing)
                : [];

        const templates =
            Array.isArray(parsedTemplates)
                ? parsedTemplates
                : [];

        let updatedTemplates;

        if (isUpdating) {

            let foundExistingTemplate = false;

            updatedTemplates =
                templates.map(item => {

                    if (
                        item.id !==
                        activeItineraryTemplateId
                    ) {
                        return item;
                    }

                    foundExistingTemplate = true;

                    return {

                        ...item,

                        ...template,

                        id:
                            item.id,

                        // Preserve original creation date.
                        createdAt:
                            item.createdAt ||
                            now,

                        // Preserve existing usage count.
                        usageCount:
                            item.usageCount || 0

                    };

                });

            if (!foundExistingTemplate) {

                console.warn(
                    "Template ID not found. Saving as new template:",
                    activeItineraryTemplateId
                );

                updatedTemplates = [
                    template,
                    ...templates
                ];

            }

        } else {

            updatedTemplates = [
                template,
                ...templates
            ];

        }

        localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
        updatedTemplates
    )
);

// ==========================================
// FIRESTORE SHARED TEMPLATE STORAGE
// ==========================================

saveTemplateToFirestore(template);

setItineraryTemplateSaveState("saved");


        console.log(
            "TEMPLATE SAVED SUCCESSFULLY:",
            template
        );

        // If this was Save as New,
        // make the newly created template active.
       
        if (!isUpdating) {

    setActiveItineraryTemplateId(
        template.id
    );

    setActiveItineraryTemplate(
        template.name ||
        "Untitled Template"
    );

    

    setCommonData({
    ...commonData,
    quoteMode: "itinerary"
});

    setItineraryTemplateLabel(
        template.label || ""
    );

}

console.log(
    "NEW TEMPLATE ACTIVE:",
    {
        id: template.id,
        name: template.name,
        label: template.label
    }
);

        return true;

    } catch (error) {

        console.error(
            "Failed to save itinerary template:",
            error
        );

        alert(
            "Unable to save the template. Please check the browser console."
        );

        return false;

    }

};

 const handleSaveDraft = async ({
    showSuccessAlert = true,
    closeAfterSave = true
} = {}) => {

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


      
        


    await saveDraft({

        quotationNo:
            commonData.quotationNo,

        displayQuotationNo:
            `ORB-${commonData.quotationNo.replace(
                "ORB-",
                ""
            ).slice(-6)}`,

        destination:
            commonData.customDestination?.trim()
                || commonData.destination,

        clientName:
            commonData.clientName,

        savedAt:
            new Date().toISOString(),

        status:
            "Draft",

        originalData:
            editingDraft?.originalData
                ? structuredClone(
                    editingDraft.originalData
                )
                : {
                  commonData:
    structuredClone(
        commonData
    ),

                    packageData:
                        structuredClone(
                            packageData
                        ),

                    itineraryData:
                        structuredClone(
                            itineraryData
                        )
                },

        ...(isSavedDraftEdit
            ? {
                revisionNo:
                    nextRevision,

                revisionHistory: [
                    ...(
                        editingDraft?.revisionHistory
                        ||
                        revisionHistory
                        ||
                        []
                    ),

                    {
                        revisionNo:
                            nextRevision,

                        savedAt:
                            new Date().toISOString(),

                        commonData:
    structuredClone(
        commonData
    ),

                        packageData:
                            structuredClone(
                                packageData
                            ),

                        itineraryData:
                            structuredClone(
                                itineraryData
                            )
                    }
                ]
            }
            : {}),

      commonData:
    structuredClone(
        commonData
    ),

        packageData:
            structuredClone(
                packageData
            ),

        itineraryData:
            structuredClone(
                itineraryData
            )

    });

    if (isSavedDraftEdit) {

        setCurrentRevision(
            nextRevision
        );

        setRevisionHistory(prev => [
            ...prev,

            {
                revisionNo:
                    nextRevision,

                savedAt:
                    new Date().toISOString(),

                commonData:
    structuredClone(
        commonData
    ),

                packageData:
                    structuredClone(
                        packageData
                    ),

                itineraryData:
                    structuredClone(
                        itineraryData
                    )
            }
        ]);

    }

    setIsDraftModified(false);

    refreshDrafts();

    setQuotationSaveState(
        "saved"
    );

    setViewingRevision(null);

    setViewingRevisionModified(false);

    setViewingRevisionCurrentNo(0);

    if (isSavedDraftEdit) {

        setEditingDraft({

            ...(editingDraft || {}),

            quotationNo:
                commonData.quotationNo,

            originalData:
                editingDraft?.originalData
                    ? structuredClone(
                        editingDraft.originalData
                    )
                    : {
                        commonData:
    structuredClone(
        commonData
    ),

                        packageData:
                            structuredClone(
                                packageData
                            ),

                        itineraryData:
                            structuredClone(
                                itineraryData
                            )
                    },

            revisionNo:
                nextRevision,

            revisionHistory: [
                ...(
                    editingDraft?.revisionHistory
                    ||
                    revisionHistory
                    ||
                    []
                ),

                {
                    revisionNo:
                        nextRevision,

                    savedAt:
                        new Date().toISOString(),

                   commonData:
    structuredClone(
        commonData
    ),

                    packageData:
                        structuredClone(
                            packageData
                        ),

                    itineraryData:
                        structuredClone(
                            itineraryData
                        )
                }
            ]

        });

    } else {

        // First save remains a normal saved quotation.
        // It is NOT considered an existing draft being edited.

        setEditingDraft(null);

    }

    if (closeAfterSave) {

        clearWorkingCopy();

        setWorkingCopy(null);

        setResumeModalOpen(false);

    }

    if (showSuccessAlert) {

        alert(
            "Draft saved successfully."
        );

    }

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

async function refreshDrafts() {

    const localDrafts =
        getAllDrafts();

    // Show local data immediately
    setDrafts(localDrafts);

    // Then try shared Firestore data
    const firestoreDrafts =
        await getAllDraftsFromFirestore();

    if (firestoreDrafts !== null) {

        setDrafts(
            firestoreDrafts
        );

    }

}

const handleOpenDraftLibrary =
    () => {

    setShowDraftLibrary(true);

};

const handleRevisionHistory = (draft) => {

    

    

    setHistoryOpenedFromLibrary(true);

    setRevisionHistoryReturnQuotationNo(
        draft.quotationNo
    );

    setRevisionHistoryDraft(draft);
};

const handleViewOriginalDraft = () => {

    if (
        !revisionHistoryDraft ||
        !revisionHistoryDraft.originalData
    ) {
        return;
    }

    const original =
        revisionHistoryDraft.originalData;

    // Keep the saved quotation available
    // for Return to Current.
    const savedDraft =
        structuredClone(
            revisionHistoryDraft
        );

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

    // Mark this specifically as Original Draft
   setViewingRevision({

    isOriginalDraft: true,

    revisionNo: 0,

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

    // Keep the current saved quotation available
    // while viewing the Original Draft.
    currentSavedDraft:
        structuredClone(
            savedDraft
        )
});

    // Keep current saved quotation
    // available for Return to Current.
   setEditingDraft(null);

    setCurrentRevision(
        savedDraft.revisionNo || 0
    );

    setViewingRevisionCurrentNo(
        savedDraft.revisionNo || 0
    );

    setViewingRevisionModified(false);

    setIsDraftModified(false);

    setQuotationSaveState("library");

    // Close Revision History
    setRevisionHistoryDraft(null);

    // IMPORTANT:
    // Close Library as well.
    setShowDraftLibrary(false);

    setHistoryOpenedFromLibrary(false);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

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

    // Create a deep copy of the quotation data
    const copy = structuredClone(draft);

    // Generate a NEW quotation number
    const newQuotationNo =
        `ORB-${Date.now()}`;

    // Preserve the quotation's current displayed data,
    // but make it a completely independent new quotation.
    copy.commonData = {
        ...copy.commonData,
        quotationNo: newQuotationNo
    };

    // New quotation metadata
    copy.quotationNo = newQuotationNo;

    copy.displayQuotationNo =
        `ORB-${newQuotationNo
            .replace("ORB-", "")
            .slice(-6)}`;

    copy.savedAt =
        new Date().toISOString();

    copy.status = "Draft";

    // ------------------------------------------------
    // IMPORTANT:
    // A duplicate starts completely fresh.
    // No revision number.
    // No revision history.
    // Its current data becomes its Original Draft.
    // ------------------------------------------------

    copy.revisionNo = undefined;

    copy.revisionHistory = [];

    copy.originalData = {
        commonData:
            structuredClone(
                copy.commonData
            ),

        packageData:
            structuredClone(
                copy.packageData
            ),

        itineraryData:
            structuredClone(
                copy.itineraryData
            )
    };

    // Load duplicate into editor
    setCommonData(
        structuredClone(
            copy.commonData
        )
    );

    setPackageData(
        structuredClone(
            copy.packageData
        )
    );

    setItineraryData(
        structuredClone(
            copy.itineraryData
        )
    );

    // IMPORTANT:
    // This is a NEW quotation, not an edit
    // of the quotation it was duplicated from.
    setEditingDraft(null);

    setCurrentRevision(0);

    setRevisionHistory([]);

    setIsDraftModified(true);

    // Clear revision-viewing state
    setViewingRevision(null);

    setViewingRevisionModified(false);

    setViewingRevisionCurrentNo(0);

    setHistoryOpenedFromLibrary(false);

    setRevisionHistoryDraft(null);

    // Close Library
    setShowDraftLibrary(false);

    alert(
        "Quotation duplicated successfully.\n\n" +
        "A new quotation has been opened in the editor.\n" +
        "It has no revision history.\n\n" +
        "Save it when you're ready."
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

const handleDeleteDraft = async (quotationNo) => {

    await deleteDraft(quotationNo);

    await refreshDrafts();

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

const resetQuotation = ({
    preserveItineraryMode = false
} = {}) => {

    setCommonData({

        ...defaultCommonData,

        quoteMode:
    preserveItineraryMode
        ? "itinerary"
        : defaultCommonData.quoteMode,

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

    // Keep Itinerary mode when
    // Start Fresh is used from a template.
    if (preserveItineraryMode) {

        setCommonData(prev => ({
            ...prev,
            quoteMode: "itinerary"
        }));

    }


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

    setActiveItineraryTemplate(null);

setActiveItineraryTemplateId(null);

setItineraryTemplateSaveState("none");

setItineraryTemplateLabel("");
setSaveDestinationChoice(null);
setShowSaveDestinationModal(false);
setTemplateSaveMode(null);

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

        (String(commonData?.clientName || "").trim() !== "") ||

(String(commonData?.destination || "").trim() !== "") ||

(String(commonData?.mobile || "").trim() !== "") ||

(String(commonData?.email || "").trim() !== "") ||

(String(commonData?.specialNotes || "").trim() !== "") ||

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

    if (
        !userProfile ||
        userProfile.status !== "active"
    ) {
        return;
    }

    const loadSharedDrafts =
        async () => {

            await migrateLocalDraftsToFirestore();

            await refreshDrafts();

        };

    loadSharedDrafts();

}, [userProfile]);



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

       {(editingDraft || viewingRevision) && (

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
    ? viewingRevision.isOriginalDraft
        ? (
            <>
                👁 Viewing Original Draft
            </>
        )
        : (
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

               const currentDraft =
    editingDraft ||
    revisionHistoryDraft ||
    viewingRevision?.currentSavedDraft;

if (currentDraft) {

    setCommonData(
        structuredClone(
            currentDraft.commonData
        )
    );

    setPackageData(
        structuredClone(
            currentDraft.packageData
        )
    );

    setItineraryData(
        structuredClone(
            currentDraft.itineraryData
        )
    );

    setCurrentRevision(
        currentDraft.revisionNo || 0
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

    const currentDraft =
        editingDraft ||
        revisionHistoryDraft ||
        viewingRevision?.currentSavedDraft;

    if (currentDraft) {

        // This History window was opened
        // from the Editor.
        setHistoryOpenedFromLibrary(false);

        setRevisionHistoryDraft(
            structuredClone(currentDraft)
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
    type="button"
    onClick={() =>
        setShowSaveDestinationModal(true)
    }
    style={{
        background: "#7c3aed",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 600
    }}
>
    💾 Save Quotation
</button>


<button
    type="button"
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
    type="button"
    onClick={() =>
        setShowTaxInvoiceLibrary(true)
    }
    style={{
        background: "#17334F",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 600
    }}
>
    🧾 Tax Invoice Library
</button>

<button
    type="button"
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





</div>


{/* ===================================================== */}
{/* PROMINENT SAVE STATUS */}
{/* ===================================================== */}

<div
    style={{
        width: "100%",
        boxSizing: "border-box",
        marginTop: "10px",
        marginBottom: "0px",
        padding: "8px 16px",

        background: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",

        display: "flex",
        alignItems: "center",
        gap: "20px",

        flexWrap: "wrap"
    }}
>

    {/* STATUS TITLE */}

    <div
        style={{
            fontSize: "13px",
            fontWeight: 800,
            color: "#1f2937",
            whiteSpace: "nowrap",
            flexShrink: 0
        }}
    >
        💾 QUOTATION STATUS
    </div>


    {/* STATUS DETAILS */}

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            fontSize: "13px",
            fontWeight: 700,
            flexShrink: 0
        }}
    >

        {/* DRAFT STATUS */}

        <div>

            <span
                style={{
                    color: "#374151"
                }}
            >
                Draft:
            </span>{" "}

            {quotationSaveState === "saved" ||
            (
                quotationSaveState === "library" &&
                !isDraftModified
            ) ? (

                <span
                    style={{
                        color: "#15803d"
                    }}
                >
                    ✓ SAVED
                </span>

            ) : quotationSaveState === "new" ? (

                <span
                    style={{
                        color: "#d97706"
                    }}
                >
                    ⚠️ NOT SAVED
                </span>

            ) : (

                <span
                    style={{
                        color: "#d97706"
                    }}
                >
                    ⚠️ UNSAVED CHANGES
                </span>

            )}

        </div>


        {/* TEMPLATE STATUS */}

        <div>

            <span
                style={{
                    color: "#374151"
                }}
            >
                Template:
            </span>{" "}

            {itineraryTemplateSaveState === "saved" ? (

                <span
                    style={{
                        color: "#15803d"
                    }}
                >
                    ✓ SAVED
                </span>

            ) : itineraryTemplateSaveState === "loaded" ? (

                <span
                    style={{
                        color: "#2563eb"
                    }}
                >
                    ✓ LOADED
                </span>

            ) : (

                <span
                    style={{
                        color: "#6b7280"
                    }}
                >
                    —
                </span>

            )}

        </div>

    </div>


    {/* ================================================= */}
    {/* CURRENT QUOTATION IDENTITY */}
    {/* ================================================= */}

    <div
        style={{
           marginLeft: "4px",

            display: "inline-flex",
            alignItems: "center",

            minHeight: "30px",
            boxSizing: "border-box",

            padding: "5px 12px",

            background: "#f1f5f9",
            border: "1px solid #dbe3ec",
            borderRadius: "999px",

            whiteSpace: "nowrap",

            lineHeight: 1.25,

            boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.04)"
        }}
    >

        <span
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#334155"
            }}
        >
            {commonData?.quotationNo
                ? `ORB-${commonData.quotationNo
                    .replace("ORB-", "")
                    .slice(-6)}`
                : "-"
            }
        </span>

        <span
            style={{
                fontSize: "11px",
                marginLeft: "9px",
                color: "#64748b",
                fontWeight: 600
            }}
        >
            {commonData?.clientName?.trim()
                || "No client"}

            {" • "}

            {commonData?.customDestination?.trim()
                || commonData?.destination?.trim()
                || "No destination"}
        </span>

    </div>

</div>


   <QuoteForm
    commonData={commonData}
    setCommonData={updateCommonData}

    userProfile={userProfile}

    packageData={packageData}
    setPackageData={updatePackageData}

    itineraryData={itineraryData}
    setItineraryData={updateItineraryData}

    applyItineraryTemplate={applyItineraryTemplate}

    saveItineraryAsTemplate={
    saveItineraryAsTemplate
}

setSaveItineraryAsTemplate={
    setSaveItineraryAsTemplate
}

activeItineraryTemplate={
    activeItineraryTemplate
}

activeItineraryTemplateId={
    activeItineraryTemplateId
}

setItineraryTemplateSaveState={
    setItineraryTemplateSaveState
}

setIsDraftModified={
    setIsDraftModified
}

setQuotationSaveState={
    setQuotationSaveState
}

setActiveItineraryTemplateId={
    setActiveItineraryTemplateId
}

setActiveItineraryTemplate={
    setActiveItineraryTemplate
}

itineraryTemplateModified={
    itineraryTemplateModified
}

setItineraryTemplateModified={
    setItineraryTemplateModified
}

itineraryTemplateLabel={
    itineraryTemplateLabel
}

setItineraryTemplateLabel={
    setItineraryTemplateLabel
}

resetQuotation={
    resetQuotation
}

setIsImportingTemplate={
    setIsImportingTemplate
}

importingTemplateRef={
    importingTemplateRef
}

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
    userProfile={userProfile}
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


<TaxInvoiceLibrary
    open={showTaxInvoiceLibrary}
    drafts={drafts}
    taxInvoices={taxInvoices}

    onRefresh={() => {

        const refreshedInvoices =
            getTaxInvoices();

        console.log(
            "🔥 TAX INVOICES AFTER REFRESH:",
            refreshedInvoices
        );

        setTaxInvoices(
            refreshedInvoices
        );

    }}

    onOpen={(draft, existingTaxInvoice) => {


          console.log(
        "===== TAX LIBRARY DRAFT SOURCE =====",
        JSON.stringify(
            draft,
            null,
            2
        )
    );

        // ==========================================
// OPEN EXISTING TAX INVOICE
// ==========================================

if (existingTaxInvoice) {


    console.log(
    "===== TAX INVOICE OPEN DATA =====",
    JSON.stringify(
        existingTaxInvoice,
        null,
        2
    )
);


    setTaxInvoiceDraft(
        structuredClone(existingTaxInvoice)
    );

    setShowTaxInvoiceLibrary(false);

    console.log(
        "===== EXISTING TAX INVOICE OPENED =====",
        existingTaxInvoice
    );

    return;
}


   const sourceData = {

    commonData:
        draft?.commonData ||
        draft?.originalData?.commonData ||
        {},

    packageData:
        draft?.packageData ||
        draft?.originalData?.packageData ||
        {},

    itineraryData:
        draft?.itineraryData ||
        draft?.originalData?.itineraryData ||
        {}

};


   // ==========================================
// COPIED QUOTATION DATA
// ==========================================

const sourceCommonData =
    sourceData.commonData || {};

const sourcePackageData =
    sourceData.packageData || {};

const sourceItineraryData =
    sourceData.itineraryData || {};


    const taxInvoiceQuotationTotals =
    calculateQuotationTotals({
        commonData:
            sourceData.commonData || {},
        usdRate: 86
    });

const sourceTotalAmount =
    Number(
        sourceData?.commonData?.totalAmountPayable
    ) || 0;

const calculatedQuotationAmount =
    Number(
        taxInvoiceQuotationTotals?.grandTotal
    ) || 0;

const taxInvoiceCustomerAmount =
    sourceTotalAmount > 0
        ? sourceTotalAmount
        : calculatedQuotationAmount;


const taxInvoiceData = {

    // ==========================================
    // SOURCE REFERENCE
    // ==========================================

    invoiceNo:
    draft?.quotationNo || "",

    quotationNo:
        draft?.quotationNo || "",

    displayQuotationNo:
        draft?.displayQuotationNo || "",

    sourceDraftQuotationNo:
        draft?.quotationNo || "",

    totalAmountPayable:
        taxInvoiceCustomerAmount,
    // ==========================================
    // ORIGINAL QUOTATION DATA
    // ==========================================

    commonData:
        structuredClone(
            sourceCommonData
        ),

    packageData:
        structuredClone(
            sourcePackageData
        ),

    itineraryData:
        structuredClone(
            sourceItineraryData
        ),


    // ==========================================
    // CUSTOMER DATA
    // ==========================================

    clientName:
        sourceCommonData.clientName || "",

    mobile:
        sourceCommonData.mobile || "",

    email:
        sourceCommonData.email || "",

    customerAddress:
        sourceCommonData.customerAddress ||
        sourceCommonData.address ||
        sourceCommonData.city ||
        "",

    customerGstinPan:
        sourceCommonData.customerGstinPan ||
        sourceCommonData.customerGstin ||
        sourceCommonData.customerPan ||
        "",


    // ==========================================
    // TRAVEL DATA
    // ==========================================

    destination:
        sourceCommonData.customDestination?.trim() ||
        sourceCommonData.destination ||
        "",

    travelFrom:
        sourceCommonData.travelFrom || "",

    travelTo:
        sourceCommonData.travelTo || "",

    travelDates:
        (
            sourceCommonData.travelFrom ||
            sourceCommonData.travelTo
        )
            ? `${sourceCommonData.travelFrom || ""} – ${sourceCommonData.travelTo || ""}`
            : "",

    passengerName:
        sourceCommonData.clientName || "",

    pax:
        (
            Number(sourceCommonData.adults || 0) +
            Number(sourceCommonData.children || 0)
        ) || "",


    // ==========================================
    // INVOICE DATA
    // ==========================================

    placeOfSupply:
        sourceCommonData.placeOfSupply ||
        sourceCommonData.city ||
        "",

    invoiceDate:
        sourceCommonData.invoiceDate || "",

    dueDate:
        sourceCommonData.dueDate || "",

    bookingReference:
        draft?.displayQuotationNo ||
        draft?.quotationNo ||
        "",


    // ==========================================
    // SUPPLIER DATA
    // ==========================================

    supplierGstin:
        sourceCommonData.supplierGstin ??
        "19AYTPS0423N1ZO",

    supplierPan:
        sourceCommonData.supplierPan ??
        "AYTPS0423N",


    // ==========================================
    // TAX INVOICE STATUS
    // ==========================================

    status: "Draft",

    createdAt:
        new Date().toISOString(),

    updatedAt:
        new Date().toISOString()

};


console.log(
    "===== FINAL TAX INVOICE DATA =====",
    JSON.stringify(
        taxInvoiceData,
        null,
        2
    )
);


console.log(
    "===== RATE SOURCE CHECK =====",
    {
        draftTotalAmount:
            draft?.totalAmountPayable,

        commonDataTotal:
            sourceCommonData?.totalAmountPayable,

        quotationGrandTotal:
            taxInvoiceQuotationTotals?.grandTotal,

        calculatedTaxInvoiceAmount:
            taxInvoiceCustomerAmount,

        finalRateValue:
            taxInvoiceData?.totalAmountPayable
    }
);


console.log(
    "===== WHERE IS TOTAL AMOUNT PAYABLE? =====",
    {
        sourceDataTotal:
            sourceData?.totalAmountPayable,

        sourceCommonDataTotal:
            sourceData?.commonData?.totalAmountPayable,

        sourcePackageDataTotal:
            sourceData?.packageData?.totalAmountPayable,

        draftTotal:
            draft?.totalAmountPayable,

        draftCommonDataTotal:
            draft?.commonData?.totalAmountPayable,

        taxInvoiceTotal:
            taxInvoiceData?.totalAmountPayable,

        taxInvoiceCommonDataTotal:
            taxInvoiceData?.commonData?.totalAmountPayable
    }
);







    setTaxInvoiceDraft(
        taxInvoiceData
    );

    setShowTaxInvoiceLibrary(
        false
    );

    
}}


    onClose={() =>
        setShowTaxInvoiceLibrary(false)
    }
/>


<TaxInvoiceEditor
    invoice={taxInvoiceDraft}

    onSave={async (savedInvoice) => {

    try {

        await saveTaxInvoice(savedInvoice);

        const refreshedInvoices =
            getTaxInvoices();

        setTaxInvoices(
            refreshedInvoices
        );

        setTaxInvoiceDraft(
            structuredClone(savedInvoice)
        );

        console.log(
            "===== TAX INVOICE SAVED =====",
            savedInvoice
        );

        alert(
            "Tax Invoice saved successfully."
        );

    } catch (error) {

        console.error(
            "===== TAX INVOICE SAVE FAILED =====",
            error
        );

        alert(
            "Tax Invoice could not be saved."
        );

    }

}}


    onClose={() => {

    setTaxInvoiceDraft(null);

    setShowTaxInvoiceLibrary(true);

}}
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

    <>

        {/* ORIGINAL DRAFT */}

        <div
            style={{
                border: "2px solid #16a34a",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
                background: "#f0fdf4"
            }}
        >

            <div>

                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#166534"
                    }}
                >
                    🟢 Original Draft
                </div>

                <div
                    style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#6b7280"
                    }}
                >
                    Original saved quotation
                </div>

            </div>

            <button
                onClick={() => {

                    handleViewOriginalDraft();

                }}
                style={{
                    background: "#16a34a",
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

        </div>


        {/* REVISION HISTORY LABEL */}

        <div
            style={{
                margin: "4px 0 10px",
                paddingBottom: "6px",
                borderBottom: "1px solid #e5e7eb",
                fontSize: "12px",
                fontWeight: 700,
                color: "#6b7280"
            }}
        >
            Revision History
        </div>


        {/* REVISIONS */}

        {
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


                        <div
                            style={{
                                display: "flex",
                                alignItems: "center"
                            }}
                        >

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
        handleDeleteRevision(
            revision
        );
    }}

    disabled={
        userProfile?.role !== "admin"
    }

    style={{
        background:
            userProfile?.role === "admin"
                ? "#dc2626"
                : "#9CA3AF",

        color: "#fff",
        border: "none",
        padding: "7px 10px",
        borderRadius: "6px",

        cursor:
            userProfile?.role === "admin"
                ? "pointer"
                : "not-allowed",

        fontSize: "12px",
        fontWeight: 600,
        marginLeft: "6px",

        opacity:
            userProfile?.role === "admin"
                ? 1
                : 0.6
    }}

    title={
        userProfile?.role === "admin"
            ? `Delete Revision ${revision.revisionNo}`
            : "Only Admin can delete revisions"
    }
>
    🗑
</button>
                        </div>

                    </div>

                ))

        }

    </>

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

    setRevisionHistoryDraft(null);

    if (historyOpenedFromLibrary) {

        // History was opened directly from Library
        setShowDraftLibrary(true);

    } else {

        // History was opened from Editor
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
    type="button"
    onClick={async () => {

        if (!reviewDraft) return;

        const clientName =
            reviewDraft.clientName?.trim()
            || "there";

        const destination =
            reviewDraft.destination?.trim()
            || reviewDraft.commonData?.customDestination?.trim()
            || reviewDraft.commonData?.destination?.trim()
            || "your destination";

        const quotationNo =
            reviewDraft.displayQuotationNo
            || (
                reviewDraft.commonData?.quotationNo
                    ? `ORB-${reviewDraft.commonData.quotationNo
                        .replace("ORB-", "")
                        .slice(-6)}`
                    : ""
            );

        // ---------------------------------------
        // CLIENT MOBILE
        // ---------------------------------------

        const rawMobile =
            reviewDraft.commonData?.mobile?.trim()
            || "";

        let mobile =
            rawMobile.replace(/\D/g, "");

        if (mobile.length === 10) {
            mobile = `91${mobile}`;
        }

        // ---------------------------------------
        // WHATSAPP MESSAGE
        // ---------------------------------------

        const message =
            `Dear ${clientName},\n\n` +
            `Greetings from Orbitz Holidays!\n\n` +
            `Please find your quotation ` +
            `${quotationNo ? `(${quotationNo}) ` : ""}` +
            `for ${destination}.\n\n` +
            `We look forward to helping you plan your journey.\n\n` +
            `Regards,\n` +
            `Orbitz Holidays\n` +
            `Anywhere, Anytime, Around the World`;

        // ---------------------------------------
        // GENERATE FINAL PDF
        // ---------------------------------------

        try {

            const blob =
    await handleGeneratePdf(
        reviewDraft.commonData,
        reviewDraft.packageData,
        reviewDraft.itineraryData,
        "preview"
    );

            // ---------------------------------------
            // DOWNLOAD PDF
            // ---------------------------------------

            const pdfUrl =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = pdfUrl;

            link.download =
                `${quotationNo || "Orbitz-Quotation"}.pdf`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(pdfUrl);

        } catch (error) {

            console.error(
                "WHATSAPP PDF GENERATION FAILED:",
                error
            );

            alert(
                "Unable to generate the quotation PDF."
            );

            return;
        }

        // ---------------------------------------
        // OPEN CLIENT WHATSAPP
        // ---------------------------------------

        const whatsappUrl =
            mobile.length >= 10
                ? `https://web.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`
                : `https://web.whatsapp.com/`;

        window.open(
            whatsappUrl,
            "_blank",
            "noopener,noreferrer"
        );

    }}
    style={{
        height: "34px",
        padding: "0 12px",
        background: "#ecfdf5",
        color: "#166534",
        border: "1px solid #86efac",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    }}
>
    📱 WhatsApp
</button>

<div
    style={{
        position: "relative",
        display: "inline-flex"
    }}
>

    {/* EMAIL BUTTON */}

    <button
        type="button"
        onClick={() =>
            setShowEmailOptions(prev => !prev)
        }
        style={{
            height: "34px",
            padding: "0 12px",
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #93c5fd",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap"
        }}
    >
        ✉️ Email ▾
    </button>


    {/* EMAIL OPTIONS */}

    {showEmailOptions && (

        <div
            style={{
                position: "absolute",
                top: "40px",
                left: 0,
                minWidth: "190px",
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                boxShadow:
                    "0 8px 20px rgba(0,0,0,.15)",
                padding: "5px",
                zIndex: 10000
            }}
        >

            {/* GMAIL */}

            <button
                type="button"
                onClick={async () => {

                    setShowEmailOptions(false);

                    if (!reviewDraft) return;

                    const clientName =
                        reviewDraft.clientName?.trim()
                        || "there";

                    const destination =
                        reviewDraft.destination?.trim()
                        || reviewDraft.commonData?.customDestination?.trim()
                        || reviewDraft.commonData?.destination?.trim()
                        || "your destination";

                    const quotationNo =
                        reviewDraft.displayQuotationNo
                        || (
                            reviewDraft.commonData?.quotationNo
                                ? `ORB-${reviewDraft.commonData.quotationNo
                                    .replace("ORB-", "")
                                    .slice(-6)}`
                                : ""
                        );

                    const email =
                        reviewDraft.commonData?.email?.trim()
                        || "";

                    const subject =
                        `Quotation ${quotationNo} – ${destination}`;

                    const body =
                        `Dear ${clientName},\n\n` +
                        `Greetings from Orbitz Holidays!\n\n` +
                        `Please find your quotation ` +
                        `${quotationNo ? `(${quotationNo}) ` : ""}` +
                        `for ${destination} attached for your reference.\n\n` +
                        `We look forward to helping you plan your journey.\n\n` +
                        `Regards,\n` +
                        `Orbitz Holidays\n` +
                        `Anywhere, Anytime, Around the World`;

                    try {

                        const blob =
                            await handleGeneratePdf(
                                reviewDraft.commonData,
                                reviewDraft.packageData,
                                reviewDraft.itineraryData,
                                "preview"
                            );

                        const pdfUrl =
                            URL.createObjectURL(blob);

                        const link =
                            document.createElement("a");

                        link.href = pdfUrl;

                        link.download =
                            `${quotationNo || "Orbitz-Quotation"}.pdf`;

                        document.body.appendChild(link);

                        link.click();

                        document.body.removeChild(link);

                        URL.revokeObjectURL(pdfUrl);

                    } catch (error) {

                        console.error(
                            "EMAIL PDF GENERATION FAILED:",
                            error
                        );

                        alert(
                            "Unable to generate the quotation PDF."
                        );

                        return;
                    }

                    const gmailUrl =
                        `https://mail.google.com/mail/?view=cm&fs=1` +
                        `&to=${encodeURIComponent(email)}` +
                        `&su=${encodeURIComponent(subject)}` +
                        `&body=${encodeURIComponent(body)}`;

                    window.open(
                        gmailUrl,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }}
                style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#374151"
                }}
            >
                📧 Gmail
            </button>


            {/* DEFAULT EMAIL APP */}

            <button
                type="button"
                onClick={async () => {

                    setShowEmailOptions(false);

                    if (!reviewDraft) return;

                    const clientName =
                        reviewDraft.clientName?.trim()
                        || "there";

                    const destination =
                        reviewDraft.destination?.trim()
                        || reviewDraft.commonData?.customDestination?.trim()
                        || reviewDraft.commonData?.destination?.trim()
                        || "your destination";

                    const quotationNo =
                        reviewDraft.displayQuotationNo
                        || (
                            reviewDraft.commonData?.quotationNo
                                ? `ORB-${reviewDraft.commonData.quotationNo
                                    .replace("ORB-", "")
                                    .slice(-6)}`
                                : ""
                        );

                    const email =
                        reviewDraft.commonData?.email?.trim()
                        || "";

                    const subject =
                        `Quotation ${quotationNo} – ${destination}`;

                    const body =
                        `Dear ${clientName},\n\n` +
                        `Greetings from Orbitz Holidays!\n\n` +
                        `Please find your quotation ` +
                        `${quotationNo ? `(${quotationNo}) ` : ""}` +
                        `for ${destination} attached for your reference.\n\n` +
                        `We look forward to helping you plan your journey.\n\n` +
                        `Regards,\n` +
                        `Orbitz Holidays\n` +
                        `Anywhere, Anytime, Around the World`;

                    try {

                        const blob =
                            await handleGeneratePdf(
                                reviewDraft.commonData,
                                reviewDraft.packageData,
                                reviewDraft.itineraryData,
                                "preview"
                            );

                        const pdfUrl =
                            URL.createObjectURL(blob);

                        const link =
                            document.createElement("a");

                        link.href = pdfUrl;

                        link.download =
                            `${quotationNo || "Orbitz-Quotation"}.pdf`;

                        document.body.appendChild(link);

                        link.click();

                        document.body.removeChild(link);

                        URL.revokeObjectURL(pdfUrl);

                    } catch (error) {

                        console.error(
                            "EMAIL PDF GENERATION FAILED:",
                            error
                        );

                        alert(
                            "Unable to generate the quotation PDF."
                        );

                        return;
                    }

                    const mailtoUrl =
                        `mailto:${encodeURIComponent(email)}` +
                        `?subject=${encodeURIComponent(subject)}` +
                        `&body=${encodeURIComponent(body)}`;

                    window.location.href =
                        mailtoUrl;

                }}
                style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#374151"
                }}
            >
                💻 Default Email App
            </button>

        </div>

    )}

</div>

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

{showSaveDestinationModal && (
    <div
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
        }}
    >
        <div
            style={{
                width: "420px",
                maxWidth: "90%",
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #d1d5db",
                boxShadow:
                    "0 20px 50px rgba(0,0,0,0.25)",
                padding: "24px"
            }}
        >

            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "8px",
                    color: "#111827"
                }}
            >
                {saveDestinationChoice === "template"
    ? "📚 Save to Template Library"
    : saveDestinationChoice === "both"
        ? "💾📚 Save to Draft + Template"
        : "💾 Save Quotation"}

            </h3>

            <p
                style={{
                    marginTop: 0,
                    marginBottom: "20px",
                    color: "#6b7280",
                    fontSize: "14px"
                }}
            >
                Where would you like to save this quotation?
            </p>

{(saveDestinationChoice === "template" ||
saveDestinationChoice === "both") && (
    <div
        style={{
            marginBottom: "16px",
            padding: "12px",
            background: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "8px"
        }}
    >

        <div
            style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "6px"
            }}
        >
            Template Label / Version
        </div>

        <input
            type="text"
            placeholder="e.g. Premium, Family, Honeymoon"
            value={itineraryTemplateLabel || ""}
            onChange={(e) =>
                setItineraryTemplateLabel(
                    e.target.value
                )
            }
            style={{
                width: "100%",
                padding: "9px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
            }}
        />

        {activeItineraryTemplateId && (
            <div
                style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e5e7eb"
                }}
            >

                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: "8px"
                    }}
                >
                    Save template as:
                </div>

                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        marginBottom: "8px",
                        fontSize: "13px",
                        color: "#374151",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="radio"
                        name="templateSaveMode"
                        value="update"
                        checked={
                            templateSaveMode === "update"
                        }
                        onChange={() =>
                            setTemplateSaveMode("update")
                        }
                    />

                    <span>
                        <strong>
                            Update Existing Template
                        </strong>

                        <br />

                        <span
                            style={{
                                color: "#6b7280",
                                fontSize: "12px"
                            }}
                        >
                            Update the imported template and keep
                            its existing template ID.
                        </span>
                    </span>
                </label>

                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#374151",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="radio"
                        name="templateSaveMode"
                        value="new"
                        checked={
                            templateSaveMode === "new"
                        }
                        onChange={() =>
                            setTemplateSaveMode("new")
                        }
                    />

                    <span>
                        <strong>
                            Save as New Template
                        </strong>

                        <br />

                        <span
                            style={{
                                color: "#6b7280",
                                fontSize: "12px"
                            }}
                        >
                            Keep the original template unchanged
                            and create a separate template.
                        </span>
                    </span>
                </label>

            </div>
        )}

    </div>
)}
            {!saveDestinationChoice && (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        }}
    >
                <button
                    type="button"
                    onClick={() => {
    const proceed = window.confirm(
        "Save this quotation to the Draft Library?"
    );

    if (!proceed) {
        return;
    }

    setSaveDestinationChoice(null);
    setTemplateSaveMode(null);
    setShowSaveDestinationModal(false);

    handleSaveDraft();
}}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "#15803d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 700,
                        textAlign: "left"
                    }}
                >
                    💾 Save to Draft Library
                </button>

                <button
                    type="button"
                    onClick={() => {

    setSaveDestinationChoice("template");

    setTemplateSaveMode(
        activeItineraryTemplateId
            ? "update"
            : "new"
    );

}}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "#1e3a8a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 700,
                        textAlign: "left"
                    }}
                >
                    📚 Save to Template Library
                </button>

                <button

                    type="button"
onClick={() => {

    setSaveDestinationChoice("both");

    setTemplateSaveMode(
        activeItineraryTemplateId
            ? "update"
            : "new"
    );

}}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "#7f1d1d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 700,
                        textAlign: "left"
                    }}
                >
                    💾📚 Save to Both
                </button>

            </div>
)}

            {saveDestinationChoice === "template" ||
saveDestinationChoice === "both" ? (
    <button
        type="button"
        onClick={() => {

            if (
                saveDestinationChoice === "both"
            ) {
                handleSaveDraft({
                    showSuccessAlert: false,
                    closeAfterSave: false
                });

                saveCurrentItineraryAsTemplate();

                alert(
                    "Quotation saved to Draft Library and Template Library."
                );
            } else {
                saveCurrentItineraryAsTemplate();

                alert(
                    "Quotation saved to Template Library."
                );
            }

            setSaveDestinationChoice(null);
            setTemplateSaveMode(null);
            setShowSaveDestinationModal(false);

        }}
        style={{
            width: "100%",
            marginTop: "14px",
            padding: "12px 16px",
            background: "#15803d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 700
        }}
    >
        ✓ Confirm Save
    </button>
) : null}

            <button
                type="button"
                onClick={() => {

    if (
        saveDestinationChoice === "template" ||
        saveDestinationChoice === "both"
    ) {

        // Return to the first save-choice screen
        setSaveDestinationChoice(null);
        setTemplateSaveMode(null);

    } else {

        // Cancel from the first screen
        setSaveDestinationChoice(null);
        setTemplateSaveMode(null);
        setShowSaveDestinationModal(false);

    }

}}
                style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "10px",
                    background: "#fff",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600
                }}
            >
                Cancel
            </button>

        </div>
    </div>
)}

 </>

);
  
}