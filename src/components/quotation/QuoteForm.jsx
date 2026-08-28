

import { useState, useEffect } from "react";
import hotels from "../../data/hotels.json";
import HotelSelector from "./HotelSelector";
import SightseeingSelector from "./SightseeingSelector";
import TransferSelector from "./TransferSelector";
import MealSelector from "./MealSelector";
import VisaSelector from "./VisaSelector";
import ItineraryBuilder from "./ItineraryBuilder";
import InclusionSelector from "./InclusionSelector";
import ExclusionSelector from "./ExclusionSelector";
import CostCalculator from "./CostCalculator";
import CancellationPolicyEditor from "./CancellationPolicyEditor";

import DatePicker from "./DatePicker";

import ItineraryTemplateLibrary
    from "./ItineraryTemplateLibrary";

import SightseeingRichTextEditor from "../SightseeingRichTextEditor";



export default function QuoteForm(props) {
  console.log("QuoteForm props =", props);

  const {
    commonData,
    setCommonData,
    packageData,
    setPackageData,
    saveItineraryAsTemplate,
setSaveItineraryAsTemplate,
    itineraryData,
    setItineraryData,
    activeItineraryTemplate,
    activeItineraryTemplateId,
    setActiveItineraryTemplateId,
    setItineraryTemplateSaveState,
    setIsDraftModified,
    setQuotationSaveState,
    setIsImportingTemplate,
    importingTemplateRef,
setActiveItineraryTemplate,
itineraryTemplateModified,
setItineraryTemplateModified,
itineraryTemplateLabel,
setItineraryTemplateLabel,
resetQuotation,
    applyItineraryTemplate,
    userProfile
} = props;

console.log(
    "ACTIVE TEMPLATE ID IN QUOTEFORM:",
    activeItineraryTemplateId
);

const quoteData = {
    ...(commonData || {}),
    ...(packageData || {}),
    ...(itineraryData || {})
  };

// ===================================
// Cancellation Policy Accordion
// ===================================

const [expandedPolicyId, setExpandedPolicyId] =
  useState(1);

  const [deletePolicyId, setDeletePolicyId] =
    useState(null);

    const [showItineraryTemplateLibrary, setShowItineraryTemplateLibrary] =
    useState(false);

    const [showPdfSectionAdder, setShowPdfSectionAdder] =
    useState(false);

   const [newPdfSectionName, setNewPdfSectionName] =
    useState("");
   
    const [loadedTemplateItinerary, setLoadedTemplateItinerary] =
    useState(null);

    const [loadedTemplateCommonData, setLoadedTemplateCommonData] =
    useState(null);

    const [activeHotelCell, setActiveHotelCell] = useState(null);

    const [activeHotelEditor, setActiveHotelEditor] = useState(null);

    const [showHotelColorPalette, setShowHotelColorPalette] =
     useState(false);






    useEffect(() => {

    if (
        !activeItineraryTemplate ||
        !loadedTemplateItinerary ||
        !loadedTemplateCommonData
    ) {
        return;
    }

    const normalize = (value) => {

        if (value === undefined) {
            return null;
        }

        if (value === null) {
            return null;
        }

        if (Array.isArray(value)) {
            return value.map(normalize);
        }

        if (typeof value === "object") {

            const normalized = {};

            Object.keys(value)
                .sort()
                .forEach(key => {

                    normalized[key] =
                        normalize(value[key]);

                });

            return normalized;
        }

        return value;
    };


    const originalItinerary =
        JSON.stringify(
            normalize(
                loadedTemplateItinerary
            )
        );

    const currentItinerary =
        JSON.stringify(
            normalize(
                itineraryData
            )
        );


    const originalCommonData =
        JSON.stringify(
            normalize(
                loadedTemplateCommonData
            )
        );

    const currentCommonData =
        JSON.stringify(
            normalize(
                commonData
            )
        );

        const originalDay =
    loadedTemplateItinerary?.itinerary?.[0];

const currentDay =
    itineraryData?.itinerary?.[0];

const itineraryDifferences = {};

if (originalDay && currentDay) {

    const allKeys = new Set([
        ...Object.keys(originalDay),
        ...Object.keys(currentDay)
    ]);

    allKeys.forEach(key => {

        const originalValue =
            JSON.stringify(
                originalDay[key]
            );

        const currentValue =
            JSON.stringify(
                currentDay[key]
            );

        if (
            originalValue !==
            currentValue
        ) {
            itineraryDifferences[key] = {
                original:
                    originalDay[key],

                current:
                    currentDay[key]
            };
        }

    });
}

console.log(
    "DAY 1 DIFFERENCES:",
    itineraryDifferences
);


   const itineraryChanged =
    originalItinerary !==
    currentItinerary;

const commonDataChanged =
    originalCommonData !==
    currentCommonData;

console.log(
    "TEMPLATE COMPARISON:",
    {
        itineraryChanged,
        commonDataChanged
    }
);

const hasChanged =
    itineraryChanged ||
    commonDataChanged;


    setItineraryTemplateModified(
        hasChanged
    );

}, [
    itineraryData,
    commonData,
    activeItineraryTemplate,
    loadedTemplateItinerary,
    loadedTemplateCommonData
]);


  function handleAddPolicy() {

  const newPolicy = {

    id: Date.now(),

    title: "",

    text: "",

    isCustom: true

  };

  const updatedPolicies = [

    ...(commonData.cancellationRefundPolicy || []),

    newPolicy

  ];

  setCommonData({

    ...commonData,

    cancellationRefundPolicy: updatedPolicies

  });

  // Automatically open the newly added policy
  setExpandedPolicyId(newPolicy.id);

}

function handleDeletePolicy(policyId) {

  const updatedPolicies =
    commonData.cancellationRefundPolicy.filter(
      policy => policy.id !== policyId
    );

  setCommonData({

    ...commonData,

    cancellationRefundPolicy:
      updatedPolicies

  });

  // If the deleted policy was open,
  // collapse the accordion.

  if (expandedPolicyId === policyId) {

    setExpandedPolicyId(null);

  }

}

function movePolicyUp(policyId) {

  const policies = [
    ...(commonData.cancellationRefundPolicy || [])
  ];

  const index =
    policies.findIndex(
      p => p.id === policyId
    );

  // Already first?
  if (index <= 0) return;

  // Swap with previous
  [
    policies[index - 1],
    policies[index]
  ] = [
    policies[index],
    policies[index - 1]
  ];

  setCommonData({

    ...commonData,

    cancellationRefundPolicy:
      policies

  });

}

function movePolicyDown(policyId) {

  const policies = [
    ...(commonData.cancellationRefundPolicy || [])
  ];

  const index =
    policies.findIndex(
      p => p.id === policyId
    );

  // Already last?
  if (index === policies.length - 1) return;

  // Swap with next
  [
    policies[index],
    policies[index + 1]
  ] = [
    policies[index + 1],
    policies[index]
  ];

  setCommonData({

    ...commonData,

    cancellationRefundPolicy:
      policies

  });

}
  

  const destinationHotels =
  hotels?.[commonData?.destination] || {};

  const allHotels = Object.values(
    destinationHotels
  ).flat();

  const cities = [
    ...new Set(
      allHotels.map(
        (hotel) => hotel.city
      )
    )
  ].sort();

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  };


   // =========================================================
  // PDF THEME — DEFAULT SECTION COLORS
  // =========================================================

  const DEFAULT_PDF_SECTION_COLORS = {

    tourSummary: "#17334F",

    detailedTourItinerary: "#17334F",

    hotelUsed: "#5C3391",

    billing: "#6B2636",

    inclusions: "#2446B5",

    exclusions: "#46556B",

    policy: "#17334F"

  };

  
  

return (

    <div
        style={{
            background: "#fff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
        }}
    >

        {/* ============================== */}
        {/* QUOTATION MODE / TEMPLATE TOOLBAR */}
        {/* ============================== */}

        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        flexWrap: "nowrap",
        minWidth: 0,
        marginTop: "2px",
        marginBottom: "4px",
        boxSizing: "border-box"
    }}
>

            {/* QUOTATION TYPE */}

            <h3
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",

                    height: "40px",
                    boxSizing: "border-box",

                    margin: "0",
                    padding: "0 14px",

                    background: "#ecfdf5",
                    border: "1px solid #bbf7d0",
                    borderRadius: "999px",

                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#166534",

                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap"
                }}
            >
                QUOTATION TYPE
            </h3>


            {/* QUOTATION MODE */}

            <select
                value={commonData?.quoteMode || ""}
                onChange={(e) =>
                    setCommonData({
                        ...commonData,
                        quoteMode: e.target.value
                    })
                }
                style={{
                    ...inputStyle,

                    width: "235px",
                    maxWidth: "100%",

                    height: "40px",
                    minHeight: "40px",

                    boxSizing: "border-box",

                    margin: "0",
                    padding: "0 12px",

                    borderRadius: "8px",

                    display: "block",
                    flexShrink: 0
                }}
            >
                <option value="package">
                    General Package Details
                </option>

                <option value="itinerary">
                    Day Wise Itinerary
                </option>
            </select>


            {/* TEMPLATE LIBRARY */}

            {commonData?.quoteMode === "itinerary" && (

                <button
                    type="button"
                    onClick={() =>
                        setShowItineraryTemplateLibrary(true)
                    }
                    style={{
                        width: "180px",
                        height: "40px",
                        minHeight: "40px",

                        boxSizing: "border-box",

                        margin: "0",
                        padding: "0 14px",

                        background: "#f8fafc",
                        color: "#334155",

                        border: "1px solid #94a3b8",
                        borderRadius: "8px",

                        cursor: "pointer",

                        fontWeight: 700,
                        fontSize: "12px",

                        whiteSpace: "nowrap",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        flexShrink: 0,

                        boxShadow:
                            "0 1px 2px rgba(15, 23, 42, 0.05)"
                    }}
                >
                    📚 Itinerary Template Library
                </button>

            )}


            {/* WORKING TEMPLATE */}

            {commonData?.quoteMode === "itinerary" &&
                activeItineraryTemplate && (

                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",

                        minHeight: "40px",
                        boxSizing: "border-box",

                        padding: "0 12px",
                        background:
                            itineraryTemplateModified
                                ? "#fff7ed"
                                : "#eff6ff",

                        border:
                            itineraryTemplateModified
                                ? "1px solid #fdba74"
                                : "1px solid #93c5fd",

                        borderRadius: "8px",

                        color:
                            itineraryTemplateModified
                                ? "#c2410c"
                                : "#1e3a8a",

                        fontSize: "12px",
                        fontWeight: 700,

                       whiteSpace: "nowrap",
maxWidth: "420px",
overflow: "hidden",
textOverflow: "ellipsis",
flexShrink: 1
                    }}
                >
                    📌 Working on Template:{" "}
                    {activeItineraryTemplate ||
                        "Untitled Template"}

                    {itineraryTemplateLabel?.trim()
                        ? ` – ${itineraryTemplateLabel.trim()}`
                        : ""}
                </div>

            )}


            {/* START FRESH */}

            {commonData?.quoteMode === "itinerary" &&
                activeItineraryTemplate && (

                <button
                    type="button"
                    onClick={() => {

                        const proceed =
                            window.confirm(
                                "Start a fresh quotation? The current template work will be cleared."
                            );

                        if (!proceed) return;

                        resetQuotation({
                            preserveItineraryMode: true
                        });

                    }}
                    style={{
                        height: "40px",
                        minHeight: "40px",

                        boxSizing: "border-box",

                        padding: "0 14px",

                        background: "#374151",
                        color: "#fff",

                        border: "none",
                        borderRadius: "8px",

                        cursor: "pointer",

                        fontSize: "12px",
                        fontWeight: 700,

                        whiteSpace: "nowrap",
                        flexShrink: 0
                    }}
                >
                    🆕 Start Fresh
                </button>

            )}

        </div>


{/* =========================================================
    PDF THEME
========================================================= */}

<div
  style={{
    marginTop: "14px",
    marginBottom: "18px",
    padding: "12px 14px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    boxShadow: "0 2px 7px rgba(30, 41, 59, 0.05)",
    boxSizing: "border-box",
    width: "100%"
  }}
>

  {/* =========================
      HEADER
  ========================= */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "9px",
      marginBottom: "10px",
      borderBottom: "1px solid #e2e8f0"
    }}
  >

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px"
      }}
    >

      <span
        style={{
          fontSize: "17px"
        }}
      >
        🎨
      </span>

      <span
        style={{
          fontSize: "15px",
          fontWeight: 800,
          color: "#334155"
        }}
      >
        PDF THEME
      </span>

    </div>


    {/* THEME SELECTOR */}

    <select
      value={
        commonData?.pdfTheme?.name ||
        "Default"
      }
      onChange={(e) => {

  const selectedTheme =
    e.target.value;

  setCommonData({

    ...commonData,

    pdfTheme: {

      ...commonData.pdfTheme,

      name:
        selectedTheme,

      sections:
        Object.fromEntries(

          Object.entries(
            DEFAULT_PDF_SECTION_COLORS
          ).map(
            ([key, color]) => [

              key,

              {
                enabled:
                  commonData?.pdfTheme
                    ?.sections?.[key]
                    ?.enabled !== false,

                color
              }

            ]
          )

        )

    }

  });

}}
      style={{
        height: "32px",
        padding: "4px 30px 4px 9px",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
        background: "#fff",
        fontSize: "13px",
        fontWeight: 600,
        color: "#334155",
        cursor: "pointer"
      }}
    >

      <option value="Default">
        Default
      </option>

      <option value="Custom">
        Custom
      </option>

    </select>

  </div>


  {/* =========================
      SECTION COLORS
  ========================= */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "8px"
    }}
  >

    {/* TOUR SUMMARY */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        🌍 Tour Summary
      </span>

      <input
        type="color"

        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.tourSummary
    : (
        commonData?.pdfTheme?.sections
          ?.tourSummary?.color ||
        DEFAULT_PDF_SECTION_COLORS.tourSummary
      )
}
        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

                tourSummary: {
                  ...commonData.pdfTheme.sections.tourSummary,
                  color: e.target.value
                }
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer",
          background: "#fff"
        }}
      />

    </div>


    {/* ITINERARY */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        🗺️ Detailed Tour Summary
      </span>

      <input
        type="color"

        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.detailedTourItinerary
    : (
        commonData?.pdfTheme?.sections
  ?.detailedTourItinerary?.color ||
        DEFAULT_PDF_SECTION_COLORS.detailedTourItinerary
      )
}
        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

               detailedTourItinerary: {
  ...commonData.pdfTheme.sections.detailedTourItinerary,
  color: e.target.value
}
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      />

    </div>


    {/* DAY HEADER */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "7px 9px",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    background: "#f8fafc"
  }}
>
  <span
    style={{
      fontSize: "12px",
      fontWeight: 600,
      color: "#334155"
    }}
  >
    🗓️ Day Header
  </span>

  <input
    type="color"
    value={
      commonData?.pdfTheme?.sections
        ?.dayHeader?.color ||
      "#2F8F91"
    }
    onChange={(e) => {

      setCommonData({
        ...commonData,

        pdfTheme: {
          ...commonData.pdfTheme,

          name: "Custom",

          sections: {
            ...commonData.pdfTheme.sections,

            dayHeader: {
              ...commonData.pdfTheme.sections?.dayHeader,
              color: e.target.value
            }
          }
        }

      });

    }}
    style={{
      width: "30px",
      height: "25px",
      padding: "1px",
      border: "1px solid #cbd5e1",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  />
</div>


    {/* HOTEL USED */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        🏨 Hotel Used
      </span>

      <input
        type="color"

        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.hotelUsed
    : (
        commonData?.pdfTheme?.sections
          ?.hotelUsed?.color ||
        DEFAULT_PDF_SECTION_COLORS.hotelUsed
      )
}
        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

                hotelUsed: {
                  ...commonData.pdfTheme.sections.hotelUsed,
                  color: e.target.value
                }
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      />

    </div>


    {/* BILLING */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        💰 Billing
      </span>

      <input
        type="color"
        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.billing
    : (
        commonData?.pdfTheme?.sections
          ?.billing?.color ||
        DEFAULT_PDF_SECTION_COLORS.billing
      )
}
        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

                billing: {
                  ...commonData.pdfTheme.sections.billing,
                  color: e.target.value
                }
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      />

    </div>


    {/* INCLUSIONS */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        ✅ Inclusions
      </span>

      <input
        type="color"

        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.inclusions
    : (
        commonData?.pdfTheme?.sections
          ?.inclusions?.color ||
        DEFAULT_PDF_SECTION_COLORS.inclusions
      )
}
        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

                inclusions: {
                  ...commonData.pdfTheme.sections.inclusions,
                  color: e.target.value
                }
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      />

    </div>


    {/* EXCLUSIONS */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        ❌ Exclusions
      </span>

      <input
        type="color"

        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.exclusions
    : (
        commonData?.pdfTheme?.sections
          ?.exclusions?.color ||
        DEFAULT_PDF_SECTION_COLORS.exclusions
      )
}
        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

                exclusions: {
                  ...commonData.pdfTheme.sections.exclusions,
                  color: e.target.value
                }
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      />

    </div>


    {/* POLICY */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "7px 9px",
        border: "1px solid #e2e8f0",
        borderRadius: "7px",
        background: "#f8fafc"
      }}
    >

      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155"
        }}
      >
        📜 Policy
      </span>

      <input
        type="color"

        value={
  commonData?.pdfTheme?.name === "Default"
    ? DEFAULT_PDF_SECTION_COLORS.policy
    : (
        commonData?.pdfTheme?.sections
          ?.policy?.color ||
        DEFAULT_PDF_SECTION_COLORS.policy
      )
}

        onChange={(e) => {

          setCommonData({
            ...commonData,

            pdfTheme: {
              ...commonData.pdfTheme,

              name: "Custom",

              sections: {
                ...commonData.pdfTheme.sections,

                policy: {
                  ...commonData.pdfTheme.sections.policy,
                  color: e.target.value
                }
              }
            }

          });

        }}
        style={{
          width: "30px",
          height: "25px",
          padding: "1px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      />

    </div>

  </div>


{/* =========================================================
    CUSTOM PDF SECTIONS
========================================================= */}

{Object.entries(
  commonData?.pdfTheme?.sections || {}
)
  .filter(
    ([, section]) =>
      section?.custom === true
  )
  .map(
    ([sectionKey, section]) => (

      <div
        key={sectionKey}
        style={{
          background: "#f8fafc",
          border: "1px solid #dbe3ec",
          borderRadius: "8px",
          padding: "10px 12px",
          boxSizing: "border-box",
          width: "100%"
        }}
      >

        {/* =================================================
            CUSTOM SECTION HEADER ROW
        ================================================= */}

        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px"
          }}
        >

          {/* -----------------------------------------------
              SECTION NAME
          ----------------------------------------------- */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              minWidth: 0,
              flex: 1
            }}
          >

            <span
              style={{
                fontSize: "12px",
                color: "#334155",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              📄{" "}
              {section.label || sectionKey}
            </span>

          </div>


          {/* -----------------------------------------------
              COLOR + DELETE
          ----------------------------------------------- */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "5px",
              flexShrink: 0
            }}
          >

            {/* COLOR PICKER */}

            <input
              type="color"
              value={
                section.color ||
                "#64748B"
              }
              onChange={(e) => {

                setCommonData({

                  ...commonData,

                  pdfTheme: {

                    ...(commonData.pdfTheme || {}),

                    name: "Custom",

                    sections: {

                      ...(commonData
                        .pdfTheme
                        ?.sections || {}),

                      [sectionKey]: {

                        ...section,

                        color:
                          e.target.value

                      }

                    }

                  }

                });

              }}
              style={{
                width: "30px",
                height: "25px",
                padding: "1px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "5px",
                cursor: "pointer",
                display: "block"
              }}
            />


            {/* DELETE BUTTON */}

            <button
              type="button"
              onClick={() => {

                const confirmed =
                  window.confirm(
                    `Remove "${section.label || sectionKey}" from PDF Theme?`
                  );

                if (!confirmed) {
                  return;
                }

                const updatedSections = {
                  ...(commonData?.pdfTheme?.sections || {})
                };

                delete updatedSections[
                  sectionKey
                ];

                setCommonData({

                  ...commonData,

                  pdfTheme: {

                    ...(commonData.pdfTheme || {}),

                    name: "Custom",

                    sections:
                      updatedSections

                  }

                });

              }}
              title="Remove section"
              style={{
                width: "24px",
                height: "24px",
                padding: 0,
                border:
                  "1px solid #fecaca",
                borderRadius: "5px",
                background: "#fff",
                color: "#dc2626",
                fontSize: "15px",
                fontWeight: 700,
                lineHeight: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>

          </div>

        </div>


        {/* =================================================
            CUSTOM SECTION CONTENT
        ================================================= */}

        <SightseeingRichTextEditor
  key={`pdf-custom-section-${sectionKey}`}
  value={
    section.content || ""
  }
  onChange={(html) => {

    setCommonData({

      ...commonData,

      pdfTheme: {

        ...(commonData.pdfTheme || {}),

        name: "Custom",

        sections: {

          ...(commonData
            .pdfTheme
            ?.sections || {}),

          [sectionKey]: {

            ...section,

            content:
              html

          }

        }

      }

    });

  }}

  preserveLineBreaks={true}

  compact={true}
/>

      </div>

    )
  )}


 {/* =========================
    ADD SECTION
========================= */}

<div
  style={{
    marginTop: "10px"
  }}
>

  {/* ADD BUTTON */}

  <div
    style={{
      display: "flex",
      justifyContent: "flex-end"
    }}
  >

    <button
      type="button"
      onClick={() => {

        setShowPdfSectionAdder(
          !showPdfSectionAdder
        );

        setNewPdfSectionName("");

      }}
      style={{
        border: "1px dashed #94a3b8",
        background: "#f8fafc",
        color: "#334155",
        borderRadius: "6px",
        padding: "6px 11px",
        fontSize: "12px",
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      ＋ Add Section
    </button>

  </div>


  {/* ADD SECTION FORM */}

  {showPdfSectionAdder && (

    <div
      style={{
        marginTop: "8px",
        padding: "9px 10px",
        border:
          "1px solid #cbd5e1",
        borderRadius: "8px",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        gap: "7px"
      }}
    >

      <input
        type="text"
        value={
          newPdfSectionName
        }
        onChange={(e) =>
          setNewPdfSectionName(
            e.target.value
          )
        }
        placeholder="Enter section name"
        autoFocus
        style={{
          flex: 1,
          height: "31px",
          padding:
            "5px 9px",
          border:
            "1px solid #cbd5e1",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#334155",
          outline: "none"
        }}
      />


      <button
        type="button"
        onClick={() => {

          const sectionName =
            newPdfSectionName
              .trim();

          if (!sectionName) {
            return;
          }

          const sectionKey =
            sectionName
              .toLowerCase()
              .replace(
                /[^a-z0-9]+/g,
                "_"
              )
              .replace(
                /^_+|_+$/g,
                ""
              );

          if (!sectionKey) {
            return;
          }

          const existingSections =
            commonData
              ?.pdfTheme
              ?.sections || {};

          if (
            existingSections[
              sectionKey
            ]
          ) {

            alert(
              "A PDF section with this name already exists."
            );

            return;
          }

          setCommonData({

            ...commonData,

            pdfTheme: {

              ...(commonData.pdfTheme || {}),

              name: "Custom",

              sections: {

                ...existingSections,

                [sectionKey]: {

  label:
    sectionName,

  color:
    "#64748B",

  custom: true,

  content:
    ""

}

              }

            }

          });

          setNewPdfSectionName(
            ""
          );

          setShowPdfSectionAdder(
            false
          );

        }}
        style={{
          height: "31px",
          padding:
            "5px 12px",
          border: "none",
          borderRadius: "6px",
          background:
            "#334155",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        Add
      </button>


      <button
        type="button"
        onClick={() => {

          setShowPdfSectionAdder(
            false
          );

          setNewPdfSectionName(
            ""
          );

        }}
        style={{
          height: "31px",
          padding:
            "5px 9px",
          border:
            "1px solid #cbd5e1",
          borderRadius: "6px",
          background: "#fff",
          color: "#64748b",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        Cancel
      </button>

    </div>

  )}

</div>

</div>




 {/* =========================================================
    TOUR SUMMARY
========================================================= */}

<div
  style={{
    marginTop: "14px",
    marginBottom: "26px",
    padding: "14px 16px",
    background: "#f8fbff",
    border: "1px solid #bfdbfe",
    borderBottom: "4px solid #1e3a8a",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(30, 64, 96, 0.06)",
    boxSizing: "border-box",
    width: "100%"
  }}
>

  {/* =========================
      TOUR SUMMARY HEADER
  ========================= */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      paddingBottom: "9px",
      marginBottom: "12px",
      borderBottom: "2px solid #dbeafe"
    }}
  >

    <span
      style={{
        fontSize: "18px",
        lineHeight: 1
      }}
    >
      🌍
    </span>

    <span
      style={{
        fontSize: "16px",
        fontWeight: 800,
        color: "#1e3a8a",
        letterSpacing: "0.2px"
      }}
    >
      TOUR SUMMARY
    </span>

    <span
      style={{
        fontSize: "12px",
        color: "#64748b",
        fontWeight: 500
      }}
    >
      Client & Trip Information
    </span>

  </div>


<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 1fr) minmax(170px, 0.75fr) minmax(280px, 1.25fr)",
    gap: "10px",
    marginBottom: "10px"
  }}
>
      <input
        placeholder="Client Name"
        value={commonData?.clientName}
        onChange={(e) =>
          setCommonData({
  ...commonData,
  clientName: e.target.value
})
        }
        style={{
  ...inputStyle,
  marginBottom: 0,
  boxSizing: "border-box"
}}
      />

      <input
        placeholder="Mobile Number"
        value={commonData?.mobile}
        onChange={(e) =>
          setCommonData({
  ...commonData,
            mobile: e.target.value
          })
        }
        style={{
  ...inputStyle,
  marginBottom: 0,
  boxSizing: "border-box"
}}
      />

      <input
        placeholder="Email"
        value={commonData?.email}
        onChange={(e) =>
          setCommonData({
  ...commonData,
            email: e.target.value
          })
        }
        style={{
  ...inputStyle,
  marginBottom: 0,
  boxSizing: "border-box"
}}
      />
</div>



{/* =====================================================
    DESTINATION + CUSTOM DESTINATION + TRAVEL DATES
===================================================== */}

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 1fr) minmax(230px, 1fr) minmax(150px, 0.7fr) minmax(150px, 0.7fr)",
    gap: "8px",
    marginBottom: "10px",
    alignItems: "center"
  }}
>

  {/* DESTINATION */}

  <select
    value={commonData?.destination || ""}
    onChange={(e) => {

      setCommonData({
        ...commonData,
        destination: e.target.value,
        customDestination: "",
        city: ""
      });

      setPackageData({
        ...packageData,

        selectedHotels: [],

        sightseeing: [],
        customSightseeing: [],

        transfers: [],
        customTransfers: [],

        meals: [],
        customMeals: [],

        visaServices: [],
        customVisaServices: []
      });

      setItineraryData({
        ...itineraryData,
        itinerary: [
          {
            day: 1,
            title: "",
            city: "",
            description: "",

            hotelSource: "database",

            hotel: "",
            customHotel: "",
            hotelDisplayCategory: "",

            hotelCategory: "",
            roomType: "",
            mealPlan: "",

            sightseeing: [],
            meals: [],
            transfers: []
          }
        ]
      });

    }}
    style={{
      ...inputStyle,
      marginBottom: 0,
      boxSizing: "border-box",
      width: "100%"
    }}
  >

    <option value="">
      Select Destination
    </option>

    <optgroup label="Domestic">
      <option value="Kashmir">Kashmir</option>
      <option value="Kerala">Kerala</option>
      <option value="Goa">Goa</option>
      <option value="Rajasthan">Rajasthan</option>
      <option value="Sikkim">Sikkim</option>
      <option value="Andaman">Andaman</option>
      <option value="Ladakh">Ladakh</option>
      <option value="Madhya Pradesh">
        Madhya Pradesh
      </option>
    </optgroup>

    <optgroup label="International">
      <option value="Sri Lanka">Sri Lanka</option>
      <option value="Thailand">Thailand</option>
      <option value="Dubai">Dubai</option>
      <option value="Singapore">Singapore</option>
      <option value="Malaysia">Malaysia</option>
      <option value="Bali">Bali</option>
      <option value="Vietnam">Vietnam</option>
      <option value="Maldives">Maldives</option>
    </optgroup>

  </select>


  {/* CUSTOM DESTINATION */}

  <input
    type="text"
    placeholder="Custom Destination (Optional)"
    value={
      commonData?.customDestination || ""
    }
    onChange={(e) =>
      setCommonData({
        ...commonData,
        customDestination:
          e.target.value,
        destination: "",
        city: ""
      })
    }
    style={{
      ...inputStyle,
      marginBottom: 0,
      boxSizing: "border-box",
      width: "100%"
    }}
  />


  {/* TRAVEL FROM */}

  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "5px",
    minWidth: 0
  }}
>

  <span
    style={{
      fontSize: "12px",
      fontWeight: 700,
      color: "#374151",
      whiteSpace: "nowrap"
    }}
  >
    From
  </span>

  <DatePicker
      value={
        commonData?.travelFrom || ""
      }
      placeholder="From"
      onChange={(travelFrom) => {

        setCommonData({
          ...commonData,
          travelFrom
        });

      }}
    />

  </div>


  {/* TRAVEL TO */}

  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "5px",
    minWidth: 0
  }}
>

  <span
    style={{
      fontSize: "12px",
      color: "#64748b",
      fontWeight: 700,
      whiteSpace: "nowrap"
    }}
  >
    →
  </span>

  <span
    style={{
      fontSize: "12px",
      fontWeight: 700,
      color: "#374151",
      whiteSpace: "nowrap"
    }}
  >
    To
  </span>

  <DatePicker
      value={
        commonData?.travelTo || ""
      }
      placeholder="To"
      minDate={
        commonData?.travelFrom || ""
      }
      initialViewDate={
        commonData?.travelFrom ||
        commonData?.travelTo ||
        ""
      }
      onChange={(travelTo) => {

        let totalDays = "";
        let totalNights = "";

        if (
          commonData.travelFrom &&
          travelTo
        ) {

          const from =
            new Date(
              commonData.travelFrom
            );

          const to =
            new Date(travelTo);

          const diffDays =
            Math.ceil(
              (to - from) /
              (1000 * 60 * 60 * 24)
            ) + 1;

          totalDays =
            diffDays;

          totalNights =
            Math.max(
              diffDays - 1,
              0
            );
        }

        const updatedCommonData = {
          ...commonData,
          travelTo,
          totalDays,
          totalNights
        };

        setCommonData(
          updatedCommonData
        );

        applyItineraryTemplate(
          updatedCommonData
        );

      }}
    />

  </div>

</div>


     
  

   <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "minmax(210px, 1.15fr) minmax(125px, 0.55fr) minmax(125px, 0.55fr) minmax(300px, 1.7fr)",
    gap: "10px",
    alignItems: "center",
    marginBottom: "0"
  }}
>

  {/* =========================
    DURATION
========================= */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#fff",
    boxSizing: "border-box",
    minHeight: "42px",
    whiteSpace: "nowrap"
  }}
>

  <span
    style={{
      fontSize: "13px",
      fontWeight: 700,
      color: "#374151"
    }}
  >
    🕒 Duration
  </span>

  <strong
    style={{
      color: "#1e3a8a",
      fontSize: "14px"
    }}
  >
    {commonData?.totalDays || 0}
  </strong>

  <span
    style={{
      fontSize: "13px"
    }}
  >
    Days
  </span>

  <span
    style={{
      color: "#94a3b8"
    }}
  >
    /
  </span>

  <strong
    style={{
      color: "#1e3a8a",
      fontSize: "14px"
    }}
  >
    {commonData?.totalNights || 0}
  </strong>

  <span
    style={{
      fontSize: "13px"
    }}
  >
    Nights
  </span>

</div>


  {/* =========================
      ADULT PAX
  ========================= */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px"
    }}
  >

    <label
      style={{
        fontSize: "14px",
        fontWeight: "600",
        whiteSpace: "nowrap"
      }}
    >
      Adult
    </label>

    <input
      type="number"
      value={commonData?.adults || ""}
      onChange={(e) =>
        setCommonData({
          ...commonData,
          adults: e.target.value
        })
      }
      style={{
        ...inputStyle,
        marginBottom: 0,
        width: "72px",
        boxSizing: "border-box"
      }}
    />

  </div>


  {/* =========================
      CHILD PAX
  ========================= */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px"
    }}
  >

    <label
      style={{
        fontSize: "14px",
        fontWeight: "600",
        whiteSpace: "nowrap"
      }}
    >
      Child
    </label>

    <input
      type="number"
      value={commonData?.children || ""}
      onChange={(e) =>
        setCommonData({
          ...commonData,
          children: e.target.value
        })
      }
      style={{
        ...inputStyle,
        marginBottom: 0,
        width: "72px",
        boxSizing: "border-box"
      }}
    />

  </div>


  {/* =========================
      ACCOMMODATION
  ========================= */}

  {(
    commonData?.quoteMode === "package" ||
    commonData?.quoteMode === "itinerary"
  ) && (
    <input
      type="text"
      placeholder="Accommodation"
      value={packageData.accommodation || ""}
      onChange={(e) =>
        setPackageData({
          ...packageData,
          accommodation: e.target.value
        })
      }
      style={{
        ...inputStyle,
        marginBottom: 0,
        boxSizing: "border-box"
      }}
    />
  )}

</div>


{/* =========================================================
    END TOUR SUMMARY
========================================================= */}

</div>

{commonData?.quoteMode === "package" && (
  <>
    <SightseeingSelector
      commonData={commonData}
      packageData={packageData}
      setPackageData={setPackageData}
    />

    <TransferSelector
      commonData={commonData}
      packageData={packageData}
      setPackageData={setPackageData}
    />

    <MealSelector
      commonData={commonData}
      packageData={packageData}
      setPackageData={setPackageData}
    />

    <VisaSelector
      commonData={commonData}
      packageData={packageData}
      setPackageData={setPackageData}
    />
  </>
)}

{commonData?.quoteMode === "itinerary" && (
  <>
    <div
      style={{
        height: "1px",
        background: "#cbd5e1",
        margin:
          "0 0 18px 0"
      }}
    />

    <ItineraryBuilder
      commonData={commonData}
      packageData={packageData}
      itineraryData={itineraryData}
      setItineraryData={setItineraryData}
    />
  </>
)}

<ItineraryTemplateLibrary
    open={showItineraryTemplateLibrary}
    onClose={() =>
        setShowItineraryTemplateLibrary(false)
    }

        userProfile={userProfile}
   onSelectTemplate={(template) => {

    if (!template) {
        return;
    }

    importingTemplateRef.current = true;

    // -----------------------------------
    // 1. Import itinerary
    // -----------------------------------

    let importedItinerary = null;

    if (template.itineraryData) {

        importedItinerary =
            structuredClone(
                template.itineraryData
            );

           

setItineraryData(
            importedItinerary
        );

        // Keep an independent snapshot
        // of the original imported itinerary.
        setLoadedTemplateItinerary(
            structuredClone(
                importedItinerary
            )
        );
    }


    // -----------------------------------
    // 2. Build the new working commonData
    // -----------------------------------

    const updatedCommonData = {

    ...commonData,

    destination:
        template.commonData?.destination ||
        "",

    customDestination:
        template.commonData?.customDestination ||
        "",

    totalDays:
        template.commonData?.totalDays ||
        template.totalDays ||
        0,

    totalNights:
        template.commonData?.totalNights ||
        template.totalNights ||
        0,

    quoteMode:
        "itinerary"
};

importingTemplateRef.current = true;


setCommonData(
    updatedCommonData
);

setLoadedTemplateCommonData(
    structuredClone(
        updatedCommonData
    )
);



setIsDraftModified(false);
setQuotationSaveState("new");



    // -----------------------------------
    // 4. Show active template
    // -----------------------------------
setActiveItineraryTemplate(
    template.label?.trim()
        ? `${template.name} – ${template.label.trim()}`
        : (
            template.name ||
            "Untitled Template"
        )
);

setActiveItineraryTemplateId(
    template.id || null
);

setItineraryTemplateSaveState("loaded");

    setItineraryTemplateModified(
        false
    );


    // -----------------------------------
    // 5. Close template library
    // -----------------------------------
importingTemplateRef.current = false;

    setShowItineraryTemplateLibrary(
        false
    );

}}

/>


{/* =====================================================
    HOTEL USED
===================================================== */}

<div
  style={{
    marginTop: "30px",
    marginBottom: "12px",
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    padding: "12px 14px",
    background: "#f8fafc",
    boxSizing: "border-box",
    borderTop: "3px solid #334155",
    borderBottom: "4px solid #334155"
  }}
>

 {/* ---------------------------------------------------
    HEADER + SHARED TOOLBAR + PDF VISIBILITY
--------------------------------------------------- */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    minHeight: "26px"
  }}
>

  {/* HOTEL USED HEADING */}

  <h3
    style={{
      margin: 0,
      fontSize: "18px",
      fontWeight: 800,
      color: "#1e3a8a",
      letterSpacing: "0.2px",
      whiteSpace: "nowrap"
    }}
  >
    🏨 HOTEL USED
  </h3>


  {/* VERTICAL DIVIDER + SHARED TOOLBAR */}

  {(commonData?.hotelUsed || []).length > 0 && (

    <>
      <div
  style={{
    width: "2px",
    height: "22px",
    background: "#64748b",
    marginLeft: "12px",
    marginRight: "8px"
  }}
/>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "2px 3px",
          background: "#eef2f7",
          border: "1px solid #cbd5e1",
          borderRadius: "5px"
        }}
      >

        {/* BOLD */}

        <button
          type="button"
          title="Bold"
          disabled={!activeHotelEditor}
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() => {

            activeHotelEditor
              ?.chain()
              .focus()
              .toggleBold()
              .run();

          }}
          style={{
            width: "20px",
            height: "20px",
            minWidth: "20px",
            padding: "0",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            background: "#ffffff",
            color: "#334155",
            fontSize: "9px",
            fontWeight: 800,
            cursor: activeHotelEditor
              ? "pointer"
              : "not-allowed",
            opacity: activeHotelEditor
              ? 1
              : 0.5
          }}
        >
          B
        </button>


        {/* ITALIC */}

        <button
          type="button"
          title="Italic"
          disabled={!activeHotelEditor}
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() => {

            activeHotelEditor
              ?.chain()
              .focus()
              .toggleItalic()
              .run();

          }}
          style={{
            width: "20px",
            height: "20px",
            minWidth: "20px",
            padding: "0",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            background: "#ffffff",
            color: "#334155",
            fontSize: "9px",
            fontStyle: "italic",
            cursor: activeHotelEditor
              ? "pointer"
              : "not-allowed",
            opacity: activeHotelEditor
              ? 1
              : 0.5
          }}
        >
          I
        </button>


        {/* UNDERLINE */}

        <button
          type="button"
          title="Underline"
          disabled={!activeHotelEditor}
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() => {

            activeHotelEditor
              ?.chain()
              .focus()
              .toggleUnderline()
              .run();

          }}
          style={{
            width: "20px",
            height: "20px",
            minWidth: "20px",
            padding: "0",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            background: "#ffffff",
            color: "#334155",
            fontSize: "9px",
            textDecoration: "underline",
            cursor: activeHotelEditor
              ? "pointer"
              : "not-allowed",
            opacity: activeHotelEditor
              ? 1
              : 0.5
          }}
        >
          U
        </button>


        {/* TEXT COLOR */}

<div
  style={{
    position: "relative"
  }}
>

  <button
    type="button"
    title="Text Color"
    disabled={!activeHotelEditor}
    onMouseDown={(e) =>
      e.preventDefault()
    }
    onClick={() => {

      if (!activeHotelEditor)
        return;

      setShowHotelColorPalette(
        !showHotelColorPalette
      );

    }}
    style={{
  width: "20px",
  height: "20px",
  minWidth: "20px",
  padding: "0",
  border: "1px solid #cbd5e1",
  borderRadius: "4px",
  background: "#ffffff",
  color: "#000000",
  fontSize: "9px",
  fontWeight: 800,
  lineHeight: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0",
  boxSizing: "border-box",
  cursor: activeHotelEditor
    ? "pointer"
    : "not-allowed",
  opacity: activeHotelEditor
    ? 1
    : 0.5
}}
  >
    A

    <span
  style={{
    display: "block",
    width: "10px",
    height: "2px",
    background: "#111827",
    marginTop: "1px",
    borderRadius: "2px"
  }}
>
</span>

  </button>


  {showHotelColorPalette && (

    <div
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: "4px",
        padding: "5px",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "5px",
        display: "flex",
        gap: "4px",
        zIndex: 1000,
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.15)"
      }}
    >

      {[
        "#000000",
        "#4b5563",
        "#dc2626",
        "#2563eb",
        "#16a34a",
        "#ea580c"
      ].map((color) => (

        <button
          key={color}
          type="button"

          onMouseDown={(e) => {

            e.preventDefault();

            activeHotelEditor
              ?.chain()
              .focus()
              .setColor(color)
              .run();

            setShowHotelColorPalette(
              false
            );

          }}

          style={{
            width: "18px",
            height: "18px",
            minWidth: "18px",
            padding: 0,
            border:
              "1px solid #c7c7c7",
            borderRadius: "50%",
            background: color,
            cursor: "pointer"
          }}

          title={color}
        />

      ))}

    </div>

  )}

</div>
      </div>

    </>
  )}


  {/* SHOW IN PDF */}

  <label
    style={{
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "7px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }}
  >

    <input
      type="checkbox"

      checked={
        commonData?.hotelUsedEnabled ||
        false
      }

      onChange={(e) => {

        setCommonData({

          ...commonData,

          hotelUsedEnabled:
            e.target.checked

        });

      }}
    />

    Show in PDF

  </label>

</div>


{/* ---------------------------------------------------
    HOTEL TABLE HEADER — ONCE
--------------------------------------------------- */}

{(commonData?.hotelUsed || []).length > 0 && (

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "145px 1fr 1.25fr 1fr",
      gap: "8px",
      marginBottom: "5px",
      paddingBottom: "5px",
      alignItems: "center",
      borderBottom: "1px solid #cbd5e1",
      fontSize: "11px",
      fontWeight: 800,
      color: "#334155",
      letterSpacing: "0.2px"
    }}
  >

    <div>Nights</div>

    <div>City</div>

    <div>Hotel Name</div>

    <div>Room</div>

  </div>

)}


  {/* ---------------------------------------------------
      HOTEL ROWS
  --------------------------------------------------- */}

  {(commonData?.hotelUsed || []).map(
  (hotel, hotelRowIndex) => {

      const updateHotelField = (
        richField,
        plainField,
        html
      ) => {

        const temp =
          document.createElement("div");

        temp.innerHTML =
          html || "";

        const plainText =
          temp.innerText
            .replace(/\r\n/g, "\n");

        setCommonData({

          ...commonData,

          hotelUsed:
            commonData.hotelUsed.map(
              (item) =>
                item.id === hotel.id
                  ? {
                      ...item,

                      [richField]:
                        html,

                      [plainField]:
                        plainText
                    }
                  : item
            )

        });

      };



      return (

        <div
  key={hotel.id}
  style={{
  display: "grid",
  gridTemplateColumns:
    "145px 1fr 1.25fr 1fr",
  gap: "8px",
  marginBottom: "4px",
  padding: "6px 7px",
  alignItems: "start",
  background:
    hotelRowIndex % 2 === 0
      ? "#f8fafc"
      : "#eef2f7",
  borderBottom: "1px solid #dbe3ea",
  borderRadius: "5px",
  boxSizing: "border-box"
}}
>

          {/* =========================================
              NIGHTS
          ========================================= */}

          <div>

            

            <SightseeingRichTextEditor

              key={`hotel-nights-${hotel.id}`}

              value={
                hotel.nightsRichText ||
                hotel.nights ||
                ""
              }

              onChange={(html) => {

                updateHotelField(
                  "nightsRichText",
                  "nights",
                  html
                );

              }}

              preserveLineBreaks={true}

              compact={true}

              onFocus={(editor) => {
  setActiveHotelCell({
    hotelId: hotel.id,
    field: "nights"
  });

  setActiveHotelEditor(editor);
}}

active={
  activeHotelCell?.hotelId === hotel.id &&
  activeHotelCell?.field === "nights"
}
            />

          </div>


          {/* =========================================
              CITY
          ========================================= */}

          <div>

            

            <SightseeingRichTextEditor

              key={`hotel-city-${hotel.id}`}

              value={
                hotel.cityRichText ||
                hotel.city ||
                ""
              }

              onChange={(html) => {

                updateHotelField(
                  "cityRichText",
                  "city",
                  html
                );

              }}

              preserveLineBreaks={true}

              compact={true}

             onFocus={(editor) => {
  setActiveHotelCell({
    hotelId: hotel.id,
    field: "city"
  });

  setActiveHotelEditor(editor);
}}

active={
  activeHotelCell?.hotelId === hotel.id &&
  activeHotelCell?.field === "city"
}
            />

          </div>


          {/* =========================================
              HOTEL NAME
          ========================================= */}

          <div>

           

            <SightseeingRichTextEditor

              key={`hotel-name-${hotel.id}`}

              value={
                hotel.hotelNameRichText ||
                hotel.hotelName ||
                ""
              }

              onChange={(html) => {

                updateHotelField(
                  "hotelNameRichText",
                  "hotelName",
                  html
                );

              }}

              preserveLineBreaks={true}

              compact={true}

              onFocus={(editor) => {
  setActiveHotelCell({
    hotelId: hotel.id,
    field: "hotelName"
  });

  setActiveHotelEditor(editor);
}}

active={
  activeHotelCell?.hotelId === hotel.id &&
  activeHotelCell?.field === "hotelName"
}
            />

          </div>


          {/* =========================================
              ROOM
          ========================================= */}

          <div>

           

            <SightseeingRichTextEditor

              key={`hotel-room-${hotel.id}`}

              value={
                hotel.roomRichText ||
                hotel.room ||
                ""
              }

              onChange={(html) => {

                updateHotelField(
                  "roomRichText",
                  "room",
                  html
                );

              }}

              preserveLineBreaks={true}

              compact={true}

             onFocus={(editor) => {
  setActiveHotelCell({
    hotelId: hotel.id,
    field: "room"
  });

  setActiveHotelEditor(editor);
}}

active={
  activeHotelCell?.hotelId === hotel.id &&
  activeHotelCell?.field === "room"
}
            />

          </div>


         

        </div>

      );

    }
  )}


 {/* =====================================================
    HOTEL ROW ACTIONS
===================================================== */}

<div
  style={{
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: "7px",
  marginTop: "7px",
  padding: "0"
}}
>

  {/* ADD HOTEL */}

  <button
    type="button"
    onClick={() => {

      setCommonData({

        ...commonData,

        hotelUsed: [
          ...(commonData.hotelUsed || []),

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
        ]

      });

    }}
    style={{
  padding: "5px 11px",
  border: "1px solid #6366A8",
  borderRadius: "6px",
  background: "#6366A8",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
  lineHeight: "1"
}}
  >
    + Add Hotel
  </button>


  {/* DELETE LAST ROW */}

  <button
    type="button"
    onClick={() => {

      const hotels =
        commonData.hotelUsed || [];

      if (hotels.length === 0) {
        return;
      }

      setCommonData({

        ...commonData,

        hotelUsed:
          hotels.slice(0, -1)

      });

    }}
    disabled={
      (commonData?.hotelUsed || []).length === 0
    }
    style={{
  padding: "5px 11px",
  border: "1px solid #ef4444",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#ef4444",
  fontSize: "11px",
  fontWeight: 700,
  cursor:
    (commonData?.hotelUsed || []).length === 0
      ? "not-allowed"
      : "pointer",
  whiteSpace: "nowrap",
  lineHeight: "1",
  opacity:
    (commonData?.hotelUsed || []).length === 0
      ? 0.5
      : 1
}}
  >
    − Delete Row
  </button>

</div>
</div>


{/* =====================================================
    COSTING — MOTHER CARD
===================================================== */}

<div
  style={{
    marginTop: "30px",
    marginBottom: "20px",
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    padding: "12px 14px",
    background: "#f8fafc",
    boxSizing: "border-box",
    borderTop: "3px solid #334155",
    borderBottom: "4px solid #334155"
  }}
>

  {/* ---------------------------------------------------
      COSTING HEADER
  --------------------------------------------------- */}

  <h3
    style={{
      margin: "0 0 10px 0",
      fontSize: "18px",
      fontWeight: 800,
      color: "#1e3a8a",
      letterSpacing: "0.2px",
      textAlign: "left"
    }}
  >
    💰 BILLING
  </h3>


  <CostCalculator
  commonData={commonData}
  packageData={packageData}
  itineraryData={itineraryData}
  setCommonData={setCommonData}
/>


{/* =====================================================
    VEHICLE COSTING
===================================================== */}

<div
  style={{
    marginTop: "18px",
    paddingTop: "8px",
    borderTop: "1px solid #cbd5e1"
  }}
>

 {/* ---------------------------------------------------
    VEHICLE PACKAGE OPTIONS HEADER
--------------------------------------------------- */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "8px"
  }}
>

  {/* VEHICLE PACKAGE OPTIONS */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px"
    }}
  >

    <span
      style={{
        fontSize: "18px",
        lineHeight: "20px"
      }}
    >
      🚙
    </span>

    <h4
      style={{
        margin: 0,
        fontSize: "15px",
        lineHeight: "20px",
        fontWeight: 800,
        color: "#0f9f9a"
      }}
    >
      Vehicle Package Options
    </h4>

  </div>


  {/* DIVIDER */}

  <div
    style={{
      width: "1px",
      height: "18px",
      background: "#b6d9d7"
    }}
  />


  {/* VEHICLE MODE TOGGLE */}

  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#52658a",
      whiteSpace: "nowrap",
      cursor: "pointer"
    }}
  >

    <input
      type="checkbox"
      checked={
        commonData?.useVehicleCosting ||
        false
      }
      onChange={(e) =>
        setCommonData({
          ...commonData,
          useVehicleCosting:
            e.target.checked
        })
      }
    />

    Use Vehicle Based Costing

  </label>

</div>


  {/* ---------------------------------------------------
      VEHICLE PACKAGE OPTIONS
  --------------------------------------------------- */}

  {commonData?.useVehicleCosting && (
    <>

       {/* TABLE HEADER */}

      {(commonData?.vehicleCosts || []).length > 0 && (

        <div
          style={{
            display: "grid",
           gridTemplateColumns:
           "1fr 0.8fr 1.6fr 32px",
            gap: "10px",
            alignItems: "center",
            marginBottom: "4px",
            padding: "0 4px"
          }}
        >

          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b"
            }}
          >
            Vehicle Name
          </div>

          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b"
            }}
          >
           Package Amount
          </div>

          <div
  style={{
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b"
  }}
>
  Package Description
</div>


          <div />

        </div>

      )}


      {/* VEHICLE ROWS */}

      {(commonData?.vehicleCosts || []).map(
        (vehicle) => (

          <div
            key={vehicle.id}
           style={{
  display: "grid",
 gridTemplateColumns:
  "1fr 0.8fr 1.6fr 32px",
  gap: "8px",
  alignItems: "center",
  marginBottom: "5px"
}}
          >

            {/* VEHICLE NAME */}

            <input
              type="text"
              placeholder="Vehicle Name"
              value={
                vehicle.vehicle || ""
              }
              onChange={(e) => {

                setCommonData({
                  ...commonData,

                  vehicleCosts:
                    commonData.vehicleCosts.map(
                      (v) =>
                        v.id === vehicle.id
                          ? {
                              ...v,
                              vehicle:
                                e.target.value
                            }
                          : v
                    )
                });

              }}
              style={{
                ...inputStyle,
                height: "32px",
                boxSizing: "border-box",
                fontSize: "12px"
              }}
            />


            {/* FINAL PACKAGE PRICE */}

            <input
              type="number"
              placeholder="Package Cost"
              value={
                vehicle.cost ?? ""
              }
              onChange={(e) => {

                setCommonData({
                  ...commonData,

                  vehicleCosts:
                    commonData.vehicleCosts.map(
                      (v) =>
                        v.id === vehicle.id
                          ? {
                              ...v,
                              cost:
                                e.target.value
                            }
                          : v
                    )
                });

              }}
              style={{
                ...inputStyle,
                height: "32px",
                boxSizing: "border-box",
                fontSize: "12px",
                fontWeight: 700,
                border:
                  "1px solid #1e3a8a"
              }}
            />

{/* PACKAGE DESCRIPTION */}

<input
  type="text"
  placeholder="Package Description"
  value={
    vehicle.description || ""
  }
  onChange={(e) => {

    setCommonData({
      ...commonData,

      vehicleCosts:
        commonData.vehicleCosts.map(
          (v) =>
            v.id === vehicle.id
              ? {
                  ...v,
                  description:
                    e.target.value
                }
              : v
        )
    });

  }}
  style={{
    ...inputStyle,
    height: "32px",
    boxSizing: "border-box",
    fontSize: "12px",
    borderRadius: "7px"
  }}
/>

            {/* DELETE */}

            <button
              type="button"
              title="Delete Vehicle"
              onClick={() =>
                setCommonData({
                  ...commonData,

                  vehicleCosts:
                    commonData.vehicleCosts.filter(
                      (v) =>
                        v.id !== vehicle.id
                    )
                })
              }
              style={{
                width: "32px",
                height: "28px",
                padding: 0,
                border:
                  "1px solid #fca5a5",
                borderRadius: "5px",
                background: "#fff",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              ✕
            </button>

          </div>

        )
      )}


      {/* ADD VEHICLE */}

     <div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "4px",
    paddingLeft: "0"
  }}
>

        <button
          type="button"
          onClick={() =>
            setCommonData({
              ...commonData,

              vehicleCosts: [
                ...(commonData.vehicleCosts || []),

                {
  id: Date.now(),
  vehicle: "",
  cost: "",
  description: ""
}
              ]
            })
          }
         style={{
  padding: "5px 13px",
  border: "1px solid #0f9f9a",
  borderRadius: "999px",
  background: "#e6fffb",
  color: "#087f7b",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
  lineHeight: "16px"
}}
        >
          ➕ Add Vehicle
        </button>

      </div>

    </>
  )}

</div>
</div>


{(
  commonData?.quoteMode === "package" ||
  commonData?.quoteMode === "itinerary"
) && (
  <>
    {/* =====================================================
    INCLUSIONS / EXCLUSIONS
===================================================== */}

<div
  style={{
  marginTop: "40px",
  border: "1px solid #cbd5e1",
  borderTop: "2px solid #b276c9",
  borderBottom: "3px solid #b276c9",
  borderRadius: "10px",
  background: "#ffffff",
  overflow: "hidden",
  boxSizing: "border-box"
}}
>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr"
    }}
  >

    {/* INCLUSIONS */}

    <div
      style={{
        minWidth: 0,
        borderRight: "1px solid #d8d1dc"
      }}
    >
      <InclusionSelector
        commonData={commonData}
        packageData={packageData}
        setPackageData={setPackageData}
      />
    </div>


    {/* EXCLUSIONS */}

    <div
      style={{
        minWidth: 0
      }}
    >
      <ExclusionSelector
        commonData={commonData}
        packageData={packageData}
        setPackageData={setPackageData}
      />
    </div>

  </div>

</div>
  </>
)}

{/* =====================================================
    CANCELLATION & REFUND POLICY
===================================================== */}

<div
  style={{
    marginTop: "45px"
  }}
>

  <CancellationPolicyEditor
    commonData={commonData}
    setCommonData={setCommonData}
  />

</div>



<hr style={{ margin: "20px 0" }} />


      

    </div>
  );
}

