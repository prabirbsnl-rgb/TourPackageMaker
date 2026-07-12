import { useState } from "react";

export default function TransferSelector({
  packageData,
  setPackageData
}){

const [customTransfer, setCustomTransfer] =
useState("");

const [openTransfers, setOpenTransfers] =
useState(false);

const transferOptions = [
"Airport Arrival Transfer",
"Airport Departure Transfer",
"Private Sedan",
"Private SUV",
"SIC Transfer",
"Intercity Transfer",
"Ferry Transfer",
"Speedboat Transfer"
];

return (
<div
style={{
marginBottom: "20px"
}}
>

```
  <div
    onClick={() =>
      setOpenTransfers(
        !openTransfers
      )
    }
    style={{
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #a3a3a3",
      background: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      boxSizing: "border-box"
    }}
  >
    <span>
      🚐 Transfers Selected (
      {(packageData.transfers || []).length}
      )
    </span>

    <span
      style={{
        fontSize: "16px"
      }}
    >
      ▼
    </span>
  </div>

  {openTransfers && (

    <div
      style={{
        border: "1px solid #a3a3a3",
        borderTop: "none",
        padding: "12px"
      }}
    >

      {transferOptions.map(
        (transfer) => (

          <label
            key={transfer}
            style={{
              display: "block",
              marginBottom: "8px"
            }}
          >

            <input
              type="checkbox"
              checked={
                packageData.transfers?.includes(
                  transfer
                ) || false
              }
              onChange={(e) => {

                const current =
                  packageData.transfers || [];

                setPackageData({
                  ...packageData,
                  transfers:
                    e.target.checked
                      ? [
                          ...current,
                          transfer
                        ]
                      : current.filter(
                          (t) =>
                            t !== transfer
                        )
                });

              }}
            />

            {" "}
            {transfer}

          </label>

        )
      )}

      <hr
        style={{
          margin: "15px 0"
        }}
      />

      <h4>
        Custom Transfer
      </h4>

      <input
        type="text"
        placeholder="Enter custom transfer"
        value={customTransfer}
        onChange={(e) =>
          setCustomTransfer(
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
            !customTransfer.trim()
          )
            return;

          setPackageData({
            ...packageData,
            customTransfers: [
              ...(packageData.customTransfers || []),
              customTransfer
            ]
          });

          setCustomTransfer("");

        }}
      >
        Add Transfer
      </button>

      {(packageData.customTransfers || [])
        .length > 0 && (

        <>
          <h4
            style={{
              marginTop: "15px"
            }}
          >
            Custom Transfers
          </h4>

          <ul>

            {(packageData.customTransfers || []).map(
              (
                item,
                index
              ) => (

                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
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
                        customTransfers:
                          packageData.customTransfers.filter(
                            (_, i) =>
                              i !== index
                          )
                      });

                    }}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      cursor: "pointer"
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

    </div>

  )}

</div>


);
}
