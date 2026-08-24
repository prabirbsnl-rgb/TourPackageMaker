

import { useState } from "react";
import { sightseeing } from "../../data/sightseeing";

export default function SightseeingSelector({
  commonData,
  packageData,
  setPackageData
}) {

const [customPlace, setCustomPlace] =
useState("");

const [openSightseeing, setOpenSightseeing] =
useState(false);

const items =
  sightseeing[
    commonData?.destination
  ] || [];

return (
<div
style={{
marginBottom: "20px"
}}
>

```
  <div
    onClick={() =>
      setOpenSightseeing(
        !openSightseeing
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
      🎯 Sightseeing Selected (
      {(packageData.sightseeing || []).length}
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

  {openSightseeing && (

    <div
      style={{
        border: "1px solid #a3a3a3",
        borderTop: "none",
        padding: "12px"
      }}
    >

      {items.map((place) => (

        <label
          key={place}
          style={{
            display: "block",
            marginBottom: "8px"
          }}
        >

          <input
            type="checkbox"
            checked={
              packageData.sightseeing?.includes(
                place
              ) || false
            }
            onChange={(e) => {

              const selected =
                packageData.sightseeing || [];

              if (e.target.checked) {

                setPackageData({
                    ...packageData,
                  sightseeing: [
                    ...selected,
                    place
                  ]
                });

              } else {

                setPackageData({
                     ...packageData,
                  sightseeing:
                    selected.filter(
                      (p) =>
                        p !== place
                    )
                });

              }

            }}
          />

          {" "}
          {place}

        </label>

      ))}

      <hr
        style={{
          margin: "20px 0"
        }}
      />

      <h4>
        Custom Sightseeing
      </h4>

      <input
        type="text"
        placeholder="Enter sightseeing"
        value={customPlace}
        onChange={(e) =>
          setCustomPlace(
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
            !customPlace.trim()
          )
            return;

          setPackageData({
               ...packageData,
            customSightseeing: [
              ...(packageData.customSightseeing || []),
              customPlace
            ]
          });

          setCustomPlace("");

        }}
      >
        Add Sightseeing
      </button>

      {(packageData.customSightseeing || [])
        .length > 0 && (

        <>
          <h4
            style={{
              marginTop: "15px"
            }}
          >
            Custom Sightseeing
          </h4>

          <ul>

            {(packageData.customSightseeing || []).map(
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
                        customSightseeing:
                          packageData.customSightseeing.filter(
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
