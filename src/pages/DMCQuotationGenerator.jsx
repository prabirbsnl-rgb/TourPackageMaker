
import { useState } from "react";

import QuoteForm from "../components/quotation/QuoteForm";
import QuotePreview from "../components/quotation/QuotePreview";

import { defaultCancellationPolicies } from "../data/defaultCancellationPolicies";

import { itineraryTemplates } from "../data/itineraryTemplates";

import { defaultItineraryDay } from "../data/defaultItineraryDay";


import {
    saveDraft,
    getLatestDraft,
    getAllDrafts,
    deleteDraft
} from "../utils/quotationStorage";

import DraftLibrary
from "../components/quotation/DraftLibrary";



export default function DMCQuotationGenerator() {

  const [showDraftLibrary, setShowDraftLibrary] =
    useState(false);

    const [commonData, setCommonData] = useState({
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

    terms: [
      "Rates subject to availability.",
      "Hotels may change without notice.",
      "Booking confirmation against payment.",
      "Cancellation charges apply."
    ],

    cancellationRefundPolicy: defaultCancellationPolicies.map(policy => ({
    ...policy
})),

  });

  const [packageData, setPackageData] = useState({

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
  });

  const [itineraryData, setItineraryData] = useState({

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
  });

  const handleSaveDraft = () => {

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

const handleOpenDraftLibrary =
    () => {

    setShowDraftLibrary(true);

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

    setShowDraftLibrary(false);

    setTimeout(() => {

        setShowDraftLibrary(true);

    }, 0);

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
    />

  <DraftLibrary
    open={showDraftLibrary}
    drafts={getAllDrafts()}
    onOpen={handleOpenDraft}
    onDelete={handleDeleteDraft}
    onClose={() =>
        setShowDraftLibrary(false)
    }
/>

  </div>
);
}