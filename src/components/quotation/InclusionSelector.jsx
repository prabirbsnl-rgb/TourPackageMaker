import { useState } from "react";

export default function InclusionSelector({
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

  return (
    <div style={{ marginTop: "20px" }}>

      <div
        onClick={() =>
          setShowInclusions(
            !showInclusions
          )
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
          📄Inclusions Selected (
          {(packageData.inclusions || []).length}
          )
        </span>

        <span>▼</span>
      </div>

      {showInclusions && (

        <div
          style={{
            border: "1px solid #a3a3a3",
            borderTop: "none",
            padding: "10px"
          }}
        >

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
                      packageData.inclusions || [];

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
                    )
                return;

              setPackageData({
  ...packageData,
  customInclusions: [
    ...(packageData.customInclusions || []),
    customInclusion
  ]
});

              setCustomInclusion("");

            }}
          >
            Add Inclusion
          </button>

          {(packageData.customInclusions || []).map((item, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "8px",
      padding: "8px 10px",
      background: "#f3f4f6",
      borderRadius: "6px",
    }}
  >
    <span>{item}</span>

    <button
      type="button"
      onClick={() => {
        const updated =
          [...(packageData.customInclusions || [])];

        updated.splice(index, 1);

        setPackageData({
          ...packageData,
          customInclusions: updated,
        });
      }}
      style={{
        border: "none",
        background: "transparent",
        color: "red",
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      ✕
    </button>
  </div>
))}

        </div>

      )}

    </div>
  );
}