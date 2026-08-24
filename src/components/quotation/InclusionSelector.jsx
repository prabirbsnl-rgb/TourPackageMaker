

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
          padding: "10px 12px",
          border: "1px solid #a3a3a3",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer"
        }}
      >
        <span>
          📄 Inclusions Selected (
          {(packageData.inclusions || []).length}
          )
        </span>

        <span>
          {showInclusions ? "▲" : "▼"}
        </span>
      </div>

      {showInclusions && (

        <div
          style={{
            border: "1px solid #a3a3a3",
            borderTop: "none",
            padding: "10px"
          }}
        >

          {/* ================================================= */}
          {/* ITINERARY MODE — MODE SELECTOR */}
          {/* ================================================= */}

          {isItinerary && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "15px"
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
                  padding: "7px 14px",
                  borderRadius: "18px",
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
                  padding: "7px 14px",
                  borderRadius: "18px",
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

                <h4 style={{ marginBottom: "8px" }}>
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
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#6b7280"
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

              {inclusionOptions.map(
                (item) => (

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

              <hr />

              <h4>
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
                  padding: "10px",
                  marginBottom: "10px"
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
              >
                Add Inclusion
              </button>

              {(packageData.customInclusions ||
                []).map((item, index) => (

                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                    padding: "8px 10px",
                    background: "#f3f4f6",
                    borderRadius: "6px"
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
                      fontSize: "16px"
                    }}
                  >
                    ✕
                  </button>

                </div>

              ))}

            </>
          )}

        </div>
      )}

    </div>
  );
}