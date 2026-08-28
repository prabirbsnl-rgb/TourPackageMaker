

import { useState } from "react";

import SightseeingRichTextEditor from "../SightseeingRichTextEditor";






export default function InclusionSelector({
  commonData,
  packageData,
  setPackageData
}) {

  const [customInclusion, setCustomInclusion] =
    useState("");

  const [showInclusions, setShowInclusions] =
    useState(false);

  const inclusionOptions = [
    "Accommodation",
    "Daily Breakfast",
    "Airport Transfers",
    "Sightseeing Tours",
    "Private Vehicle",
    "Tour Guide",
    "Entrance Tickets",
    "Travel Insurance",
    "Visa Assistance",
    "GST Included"
  ];

  const isItinerary =
    commonData?.quoteMode === "itinerary";

  const inclusionMode =
    packageData?.inclusionMode || "chips";

  return (
    <div style={{ marginTop: "20px" }}>

      <div
        onClick={() =>
          setShowInclusions(!showInclusions)
        }
        style={{
  width: "100%",
  minHeight: "42px",
  padding: "7px 12px",
  boxSizing: "border-box",
  background: "#faf8fb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  color: "#72527f",
  fontSize: "13px",
  fontWeight: 700
}}
      >
        <span>
          📄 Inclusions Selected (
          {(packageData.inclusions || []).length}
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
    background: "#eee7f5",
    color: "#72527f",
    fontSize: "15px",
    fontWeight: 800,
    lineHeight: "1",
    flexShrink: 0
  }}
>
  {showInclusions ? "▲" : "▼"}
</span>
      </div>

      {showInclusions && (

 <div
  style={{
      padding: "8px 12px 10px",
      boxSizing: "border-box",
      background: "#fff"
    }}
  >

          {/* ================================================= */}
          {/* ITINERARY MODE — MODE SELECTOR */}
          {/* ================================================= */}

          {isItinerary && (
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
                    inclusionMode: "chips"
                  })
                }
                style={{
                 padding: "5px 12px",
                 borderRadius: "999px",
                 fontSize: "11px",
                  border:
                    inclusionMode === "chips"
                      ? "1px solid #2563eb"
                      : "1px solid #d1d5db",
                  background:
                    inclusionMode === "chips"
                      ? "#eff6ff"
                      : "#fff",
                  color:
                    inclusionMode === "chips"
                      ? "#1d4ed8"
                      : "#374151",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Chips
              </button>

              <button
                type="button"
                onClick={() =>
                  setPackageData({
                    ...packageData,
                    inclusionMode: "text"
                  })
                }
                style={{
                  padding: "5px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  border:
                    inclusionMode === "text"
                      ? "1px solid #2563eb"
                      : "1px solid #d1d5db",
                  background:
                    inclusionMode === "text"
                      ? "#eff6ff"
                      : "#fff",
                  color:
                    inclusionMode === "text"
                      ? "#1d4ed8"
                      : "#374151",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Custom Text
              </button>

            </div>
          )}

          {/* ================================================= */}
          {/* CUSTOM TEXT — ITINERARY MODE ONLY */}
          {/* ================================================= */}

          {isItinerary &&
            inclusionMode === "text" && (
              <div>

                <h4
  style={{
    margin: "2px 0 6px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    color: "#72527f",
    textAlign: "left"
  }}
>
  Custom Inclusion Text
</h4>

                <SightseeingRichTextEditor
    value={
        packageData?.customInclusionRichText || ""
    }
    onChange={(html) =>
        setPackageData({
            ...packageData,
            customInclusionRichText:
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
                  Paste directly from your source PDF.
                  Line breaks and marker structure will
                  be preserved for the PDF output.
                </div>

              </div>
            )}

         
         
            {/* ================================================= */}
          {/* EXISTING CHIP MODE */}
          {/* ================================================= */}

          {(!isItinerary ||
            inclusionMode === "chips") && (
            <>

            <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "14px",
    rowGap: "0"
  }}
>
  {inclusionOptions.map(
    (item) => (
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
                        packageData.inclusions?.includes(
                          item
                        ) || false
                      }
                      onChange={(e) => {

                        const current =
                          packageData.inclusions ||
                          [];

                        setPackageData({
                          ...packageData,
                          inclusions:
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

                )
                           )}
            </div>

            <hr />

            <h4
  style={{
    margin: "7px 0 6px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    color: "#72527f",
    textAlign: "left"
  }}
>
  Custom Inclusion
</h4>

              <input
                type="text"
                value={customInclusion}
                placeholder="Add inclusion"
                onChange={(e) =>
                  setCustomInclusion(
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
  border: "1px solid #cbd5e1",
  borderRadius: "6px"
}}
              />

              <button
                type="button"
                onClick={() => {

                  if (
                    !customInclusion.trim()
                  ) {
                    return;
                  }

                  setPackageData({
                    ...packageData,
                    customInclusions: [
                      ...(packageData.customInclusions ||
                        []),
                      customInclusion
                    ]
                  });

                  setCustomInclusion("");

                }}

                style={{
  display: "block",
  width: "fit-content",
  margin: "0",
  padding: "4px 11px",
  border: "1px solid #b99ac4",
  borderRadius: "6px",
  background: "#f5edf7",
  color: "#72527f",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left"
}}
  >
                + Add Inclusion
              </button>



             <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: "3px"
  }}
>

              {(packageData.customInclusions ||
                []).map((item, index) => (

                <div
                  key={index}
                  style={{
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  marginTop: "5px",
  marginRight: "5px",
  padding: "4px 7px",
  background: "#f5edf7",
  border: "1px solid #d8c5df",
  borderRadius: "999px",
 fontSize: "10.5px",
lineHeight: "14px",
fontWeight: 600,
color: "#5f3d6d",
  maxWidth: "100%"
}}
                >

                  <span>{item}</span>

                  <button
                    type="button"
                    onClick={() => {

                      const updated = [
                        ...(packageData.customInclusions ||
                          [])
                      ];

                      updated.splice(
                        index,
                        1
                      );

                      setPackageData({
                        ...packageData,
                        customInclusions:
                          updated
                      });

                    }}
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "red",
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

        </div>
        
      )}

    </div>
    
  );
}
