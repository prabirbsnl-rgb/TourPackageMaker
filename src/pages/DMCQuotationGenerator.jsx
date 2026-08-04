
import { useState } from "react";

import QuoteForm from "../components/quotation/QuoteForm";
import QuotePreview from "../components/quotation/QuotePreview";

export default function DMCQuotationGenerator() {

    const [commonData, setCommonData] = useState({
   quoteMode: "package",
   showInclusionExclusion: false,
    quotationNo: `QTN-${Date.now()}`,

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

    cancellationRefundPolicy: [
  {
    id: 1,
    title: "Booking Confirmation",
    text: ""
  },
  {
    id: 2,
    title: "Cancellation Request",
    text: ""
  },
  {
    id: 3,
    title: "Standard Cancellation Charges",
    text: ""
  },
  {
    id: 4,
    title: "Refunds",
    text: ""
  },
  {
    id: 5,
    title: "Force Majeure",
    text: ""
  },
  {
    id: 6,
    title: "Refund Method",
    text: ""
  }
]
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

  console.log("DMCQuotationGenerator");
  console.log("commonData =", commonData);

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
    />

    <QuotePreview
      commonData={commonData}
      packageData={packageData}
      itineraryData={itineraryData}
    />

  </div>
);
}