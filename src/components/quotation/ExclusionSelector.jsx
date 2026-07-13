import { useState } from "react";



export default function ExclusionSelector({
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

  return (
    <div style={{ marginTop: "20px" }}>

      <div
        onClick={() =>
          setShowExclusions(
            !showExclusions
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

          {exclusionOptions.map(
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
                    packageData?.exclusions?.includes(
                      item
                    ) || false
                  }
                  onChange={(e) => {

                    const current = packageData?.exclusions || [];
                    
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

            )
          )}

          <hr />

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
              marginBottom: "10px"
            }}
          />

          <button
            type="button"
            onClick={() => {

              if (
                !customExclusion.trim()
              )
                return;

              setPackageData({
  ...packageData,
  customExclusions: [
    ...(packageData.customExclusions || []),
    customExclusion
  ]
});


              setCustomExclusion("");

            }}
          >
            Add Exclusion
          </button>

          {(packageData.customExclusions || []).map((item, index) => (
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
          [...(packageData.customExclusions || [])];

        updated.splice(index, 1);

        setPackageData({
          ...packageData,
          customExclusions: updated,
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