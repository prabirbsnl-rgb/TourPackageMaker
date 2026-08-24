

import { useState } from "react";

import SightseeingRichTextEditor from "../SightseeingRichTextEditor";



export default function ExclusionSelector({
  commonData,
  packageData,
  setPackageData
}) {
  

  const [customExclusion, setCustomExclusion] =
    useState("");

  const [showExclusions, setShowExclusions] =
    useState(false);

  const exclusionOptions = [
    "Airfare",
    "Lunch",
    "Dinner",
    "Personal Expenses",
    "Tips",
    "Porter Charges",
    "Laundry",
    "Visa Fees",
    "Travel Insurance",
    "Anything Not Mentioned"
  ];

  const isItineraryMode =
    commonData?.quoteMode === "itinerary";

    const exclusionMode =
  packageData?.exclusionMode || "chips";

  return (
    <div style={{ marginTop: "20px" }}>

      {/* =========================
          EXCLUSION HEADER
      ========================= */}

      <div
        onClick={() =>
          setShowExclusions(!showExclusions)
        }
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #a3a3a3",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
          boxSizing: "border-box"
        }}
      >
        <span>
          ❌ Exclusions Selected (
          {(packageData?.exclusions || []).length}
          )
        </span>

        <span>▼</span>
      </div>

      {showExclusions && (

        <div
          style={{
            border: "1px solid #a3a3a3",
            borderTop: "none",
            padding: "10px"
          }}
        >

          {/* =========================================
              ITINERARY MODE ONLY
              EXCLUSION DISPLAY MODE
          ========================================= */}

          {isItineraryMode && (

            <div
              style={{
                display: "flex",
                gap: "18px",
                marginBottom: "12px"
              }}
            >

              <label>
                <input
                  type="radio"
                 checked={(packageData.exclusionMode || "chips") === "chips"}
                  onChange={() =>
  setPackageData({
    ...packageData,
    exclusionMode: "chips"
  })
}
                />
                {" "}
                Chips
              </label>

              <label>
                <input
                  type="radio"
                  checked={(packageData.exclusionMode || "chips") === "text"}
                 onChange={() =>
  setPackageData({
    ...packageData,
    exclusionMode: "text"
  })
}
                />
                {" "}
                Custom Text
              </label>

            </div>

          )}

          {/* =========================================
              CHIPS MODE
              OR ALWAYS IN GENERAL MODE
          ========================================= */}

          {(!isItineraryMode ||
            exclusionMode === "chips") && (

            <>

              {/* =========================
                  DROPDOWN EXCLUSIONS
              ========================= */}

              {exclusionOptions.map((item) => (

                <label
                  key={item}
                  style={{
                    display: "block",
                    marginBottom: "8px"
                  }}
                >

                  <input
                    type="checkbox"
                    checked={
                      packageData?.exclusions?.includes(
                        item
                      ) || false
                    }
                    onChange={(e) => {

                      const current =
                        packageData?.exclusions || [];

                      setPackageData({
                        ...packageData,

                        exclusions:
                          e.target.checked
                            ? [
                                ...current,
                                item
                              ]
                            : current.filter(
                                (i) =>
                                  i !== item
                              )
                      });

                    }}
                  />

                  {" "}
                  {item}

                </label>

              ))}

              <hr />

              {/* =========================
                  EXISTING CUSTOM EXCLUSION
              ========================= */}

              <h4>
                Custom Exclusion
              </h4>

              <input
                type="text"
                value={customExclusion}
                placeholder="Add exclusion"
                onChange={(e) =>
                  setCustomExclusion(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  boxSizing: "border-box"
                }}
              />

              <button
                type="button"
                onClick={() => {

                  if (
                    !customExclusion.trim()
                  ) {
                    return;
                  }

                  setPackageData({
                    ...packageData,

                    customExclusions: [
                      ...(packageData.customExclusions || []),
                      customExclusion.trim()
                    ]
                  });

                  setCustomExclusion("");

                }}
              >
                Add Exclusion
              </button>

              {/* =========================
                  EXISTING CUSTOM EXCLUSIONS
              ========================= */}

              {(packageData.customExclusions || [])
                .map((item, index) => (

                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "8px",
                      padding: "8px 10px",
                      background: "#f3f4f6",
                      borderRadius: "6px"
                    }}
                  >

                    <span>
                      {item}
                    </span>

                    <button
                      type="button"
                      onClick={() => {

                        const updated = [
                          ...(packageData.customExclusions || [])
                        ];

                        updated.splice(index, 1);

                        setPackageData({
                          ...packageData,
                          customExclusions:
                            updated
                        });

                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "red",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      ✕
                    </button>

                  </div>

                ))}

            </>

          )}

          {/* =========================================
              ITINERARY MODE
              CUSTOM TEXT MODE
          ========================================= */}

          {isItineraryMode &&
            exclusionMode === "text" && (

            <div
              style={{
                marginTop: "8px"
              }}
            >

              <h4
                style={{
                  marginBottom: "8px"
                }}
              >
                Custom Text
              </h4>

              <SightseeingRichTextEditor
    value={
        packageData?.customExclusionRichText || ""
    }
    onChange={(html) =>
        setPackageData({
            ...packageData,
            customExclusionRichText:
                html
        })
    }
    preserveLineBreaks={true}
/>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#6b7280"
                }}
              >
                Paste the complete exclusion content
                here. Line breaks and the original text
                structure will be preserved for PDF
                rendering.
              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
}