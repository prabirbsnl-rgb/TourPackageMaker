

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
  minHeight: "42px",
  padding: "7px 12px",
  boxSizing: "border-box",
  background: "#fff8fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  color: "#a05268",
  fontSize: "13px",
  fontWeight: 700
}}
      >
        <span>
          ❌ Exclusions Selected (
          {(packageData?.exclusions || []).length}
          )
        </span>

        <span
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    background: "#fdecef",
    color: "#a05268",
    fontSize: "15px",
    fontWeight: 800,
    lineHeight: "1",
    flexShrink: 0
  }}
>
  {showExclusions ? "▲" : "▼"}
</span>
      </div>

      {showExclusions && (

        <div
  style={{
    padding: "8px 12px 10px",
    boxSizing: "border-box",
    background: "#fff"
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
    gap: "6px",
    marginBottom: "9px"
  }}
>

  <button
    type="button"
    onClick={() =>
      setPackageData({
        ...packageData,
        exclusionMode: "chips"
      })
    }
    style={{
      padding: "5px 12px",
      borderRadius: "999px",
      border:
        exclusionMode === "chips"
          ? "1px solid #d6a1af"
          : "1px solid #d1d5db",
      background:
        exclusionMode === "chips"
          ? "#fff1f3"
          : "#fff",
      color:
        exclusionMode === "chips"
          ? "#a05268"
          : "#374151",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "11px"
    }}
  >
    Chips
  </button>


  <button
    type="button"
    onClick={() =>
      setPackageData({
        ...packageData,
        exclusionMode: "text"
      })
    }
    style={{
      padding: "5px 12px",
      borderRadius: "999px",
      border:
        exclusionMode === "text"
          ? "1px solid #d6a1af"
          : "1px solid #d1d5db",
      background:
        exclusionMode === "text"
          ? "#fff1f3"
          : "#fff",
      color:
        exclusionMode === "text"
          ? "#a05268"
          : "#374151",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "11px"
    }}
  >
    Custom Text
  </button>

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

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "14px",
    rowGap: "0"
  }}
>

  {exclusionOptions.map((item) => (

    <label
      key={item}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginBottom: "6px",
        fontSize: "12px",
        lineHeight: "16px",
        color: "#52658a",
        whiteSpace: "nowrap"
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

      {item}

    </label>

  ))}

</div>
              

              <hr />

              {/* =========================
                  EXISTING CUSTOM EXCLUSION
              ========================= */}

             <h4
  style={{
    margin: "7px 0 6px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    color: "#a05268",
    textAlign: "left"
  }}
>
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
  height: "32px",
  padding: "5px 9px",
  marginBottom: "5px",
  boxSizing: "border-box",
  fontSize: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px"
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

                style={{
  display: "block",
  width: "fit-content",
  margin: "0",
  padding: "4px 11px",
  border: "1px solid #d6a1af",
  borderRadius: "6px",
  background: "#fff1f3",
  color: "#a05268",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left"
}}
>
               + Add Exclusion
              </button>

              {/* =========================
                  EXISTING CUSTOM EXCLUSIONS
              ========================= */}

              <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: "3px"
  }}
>

              {(packageData.customExclusions || [])
                .map((item, index) => (

                  <div
                    key={index}
                   style={{
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  marginTop: "5px",
  marginRight: "5px",
  padding: "4px 7px",
  background: "#fff1f3",
  border: "1px solid #e5c0c9",
  borderRadius: "999px",
 fontSize: "10.5px",
lineHeight: "14px",
fontWeight: 600,
color: "#863d52",
  maxWidth: "100%"
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
                        color: "#a05268",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: 0
                      }}
                    >
                      ✕
                    </button>

                  </div>

                ))}
                </div>

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
    margin: "2px 0 6px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    color: "#a05268",
    textAlign: "left"
  }}
>
  Custom Exclusion Text
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
  marginTop: "5px",
  fontSize: "10px",
  lineHeight: "14px",
  color: "#6b7280",
  textAlign: "left"
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