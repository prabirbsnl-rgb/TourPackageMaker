import { useState } from "react";

export default function VisaSelector({
  packageData,
  setPackageData
}) {

  const [customVisa, setCustomVisa] =
    useState("");

  const [showVisa, setShowVisa] =
    useState(false);

  const visaOptions = [
    "Tourist Visa",
    "Business Visa",
    "Visa Processing",
    "Visa Documentation",
    "Priority Visa",
    "Visa Appointment",
    "Travel Insurance"
  ];

  return (
    <div>

      <h3>🛂Visa Requirement</h3>

      <label
        style={{
          display: "block",
          marginBottom: "15px"
        }}
      >
        <input
          type="checkbox"
          checked={packageData?.visaRequired || false}
          onChange={(e) =>
            setPackageData({
              ...packageData,
              visaRequired:
                e.target.checked
            })
          }
        />

        {" "}
        Visa Required
      </label>

      {packageData.visaRequired && (
        <>

          {/* COLLAPSIBLE VISA SERVICES */}

          <div
            style={{
              width: "100%",
              marginBottom: "15px"
            }}
          >

            <div
              onClick={() =>
                setShowVisa(!showVisa)
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border:
                  "1px solid #a3a3a3",
                background: "#fff",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                cursor: "pointer",
                boxSizing:
                  "border-box"
              }}
            >
              <span>
                Visa Services Selected (
                {
                  (
                    packageData.visaServices ||
                    []
                  ).length
                }
                )
              </span>

              <span>
                ▼
              </span>
            </div>

            {showVisa && (

              <div
                style={{
                  padding: "10px",
                  border:
                    "1px solid #a3a3a3",
                  borderTop: "none"
                }}
              >

                {visaOptions.map(
                  (service) => (

                    <label
                      key={service}
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "5px"
                      }}
                    >

                      <input
                        type="checkbox"
                        checked={
                          packageData.visaServices?.includes(
                            service
                          ) || false
                        }
                        onChange={(
                          e
                        ) => {

                          const current =
                            packageData.visaServices ||
                            [];

                          setPackageData({
                            ...packageData,
                            visaServices:
                              e.target
                                .checked
                                ? [
                                    ...current,
                                    service
                                  ]
                                : current.filter(
                                    (
                                      s
                                    ) =>
                                      s !==
                                      service
                                  )
                          });

                        }}
                      />

                      {" "}
                      {service}

                    </label>

                  )
                )}

              </div>

            )}

          </div>

          <hr
            style={{
              margin:
                "15px 0"
            }}
          />

          <h4>
            Custom Visa Service
          </h4>

          <input
            type="text"
            placeholder="Enter custom visa service"
            value={customVisa}
            onChange={(e) =>
              setCustomVisa(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom:
                "10px"
            }}
          />

          <button
            type="button"
            onClick={() => {

              if (
                !customVisa.trim()
              )
                return;

              setPackageData({
                ...packageData,
                customVisaServices:
                  [
                    ...(
                      packageData.customVisaServices ||
                      []
                    ),
                    customVisa
                  ]
              });

              setCustomVisa("");

            }}
          >
            Add Visa Service
          </button>

          {(packageData.customVisaServices ||
            []).length > 0 && (

            <>
              <h4
                style={{
                  marginTop:
                    "15px"
                }}
              >
                Custom Visa Services
              </h4>

              <ul>

                {(
                  packageData.customVisaServices ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => (

                    <li
                      key={
                        index
                      }
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom:
                          "8px"
                      }}
                    >

                      <span>
                        {item}
                      </span>

                      <button
                        type="button"
                        onClick={() => {

                          setPackageData({
                            ...packageData,
                            customVisaServices:
                              packageData.customVisaServices.filter(
                                (
                                  _,
                                  i
                                ) =>
                                  i !==
                                  index
                              )
                          });

                        }}
                        style={{
                          background:
                            "#ef4444",
                          color:
                            "#fff",
                          border:
                            "none",
                          borderRadius:
                            "6px",
                          padding:
                            "4px 8px",
                          cursor:
                            "pointer"
                        }}
                      >
                        ❌
                      </button>

                    </li>

                  )
                )}

              </ul>

            </>

          )}

        </>
      )}

    </div>
  );
}