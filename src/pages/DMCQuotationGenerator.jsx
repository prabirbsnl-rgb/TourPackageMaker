


import { useState, useEffect, useRef } from "react";

import QuoteForm from "../components/quotation/QuoteForm";
import QuotePreview from "../components/quotation/QuotePreview";

import { defaultCancellationPolicies } from "../data/defaultCancellationPolicies";

import { itineraryTemplates } from "../data/itineraryTemplates";

import { defaultItineraryDay } from "../data/defaultItineraryDay";

import ResumeWorkingCopyModal
from "../components/quotation/ResumeWorkingCopyModal";


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

    const [resumeModalOpen, setResumeModalOpen] =
    useState(false);

    const autoSaveTimer = useRef(null);

    const autoSaveEnabled = useRef(true);

    const [workingCopy, setWorkingCopy] =
    useState(null);

    const [isDraftModified, setIsDraftModified] = useState(false);

    const workingCopyLoaded = useRef(false);

    const [drafts, setDrafts] = useState(getAllDrafts());

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

 const [packageData, setPackageData] =
    useState(() => ({

        ...defaultPackageData

    }));

  const [itineraryData, setItineraryData] =
    useState(() => ({

        ...defaultItineraryData

    }));

    const handleStatusChange = (
    quotationNo,
    status
) => {

    console.log("Status change:", quotationNo, status);

    updateDraftStatus(
        quotationNo,
        status
    );

    refreshDrafts();

};

  const handleSaveDraft = () => {

    if (autoSaveTimer.current) {

    clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = null;

}

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

    commonData,

    packageData,

    itineraryData

});

refreshDrafts();

    
setIsDraftModified(false);
clearWorkingCopy();
setWorkingCopy(null);
setResumeModalOpen(false);
alert("Draft saved successfully.");
resetQuotation();

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

    // Close the library
    setShowDraftLibrary(false);
    alert(
    "Quotation duplicated successfully.\n\nA new quotation has been opened in the editor.\nSave it when you're ready."
);

};

const handleOpenDraft = (draft) => {

    setCommonData(
        draft.commonData
    );

    setPackageData(
        draft.packageData
    );

    setItineraryData(
        draft.itineraryData
    );

    setShowDraftLibrary(false);

};

const handleDeleteDraft = (quotationNo) => {

    deleteDraft(quotationNo);

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

return (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "450px 1fr",
      gap: "24px",
      minHeight: "100vh",
      background: "#f3f4f6",
      padding: "20px"
    }}
  >

    <QuoteForm
      commonData={commonData}
      setCommonData={setCommonData}

      packageData={packageData}
      setPackageData={setPackageData}

      itineraryData={itineraryData}
      setItineraryData={setItineraryData}

      applyItineraryTemplate={applyItineraryTemplate}
    />

    <QuotePreview
      commonData={commonData}
      packageData={packageData}
      itineraryData={itineraryData}
       handleSaveDraft={handleSaveDraft}
       handleOpenLastDraft={handleOpenLastDraft}
       handleOpenDraftLibrary={handleOpenDraftLibrary}
       isDraftModified={isDraftModified}
    />

  <DraftLibrary
    open={showDraftLibrary}
    drafts={drafts}
    onOpen={handleOpenDraft}
    onDuplicate={handleDuplicateDraft}
    onDelete={handleDeleteDraft}
    onStatusChange={handleStatusChange}
    onClose={() =>
        setShowDraftLibrary(false)
    }
/>

<ResumeWorkingCopyModal

    open={resumeModalOpen}

    workingCopy={workingCopy}

    onResume={handleResumeWorkingCopy}

    onDiscard={handleDiscardWorkingCopy}

/>

  </div>
);
}