import { useState } from "react";

export default function MealSelector({
  packageData,
  setPackageData
}) {

const [customMeal, setCustomMeal] =
useState("");

const [openMeals, setOpenMeals] =
useState(false);

const mealOptions = [
"Breakfast",
"Lunch",
"Dinner",
"Daily Breakfast",
"Breakfast & Dinner",
"Breakfast + Lunch + Dinner",
"All Inclusive"
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
      setOpenMeals(!openMeals)
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
      🍽 Meals Selected (
      {(packageData.meals || []).length}
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

  {openMeals && (

    <div
      style={{
        border: "1px solid #a3a3a3",
        borderTop: "none",
        padding: "12px"
      }}
    >

      {mealOptions.map(
        (meal) => (

          <label
            key={meal}
            style={{
              display: "block",
              marginBottom: "8px"
            }}
          >

            <input
              type="checkbox"
              checked={
                packageData.meals?.includes(
                  meal
                ) || false
              }
              onChange={(e) => {

                const current =
                  packageData.meals || [];

                setPackageData({
                  ...packageData,
                  meals:
                    e.target.checked
                      ? [
                          ...current,
                          meal
                        ]
                      : current.filter(
                          (m) =>
                            m !== meal
                        )
                });

              }}
            />

            {" "}
            {meal}

          </label>

        )
      )}

      <hr
        style={{
          margin: "15px 0"
        }}
      />

      <h4>
        Custom Meal
      </h4>

      <input
        type="text"
        placeholder="Enter custom meal"
        value={customMeal}
        onChange={(e) =>
          setCustomMeal(
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
            !customMeal.trim()
          )
            return;

          setPackageData({
            ...packageData,
            customMeals: [
              ...(packageData.customMeals || []),
              customMeal
            ]
          });

          setCustomMeal("");

        }}
      >
        Add Meal
      </button>

      {(packageData.customMeals || [])
        .length > 0 && (

        <>
          <h4
            style={{
              marginTop: "15px"
            }}
          >
            Custom Meals
          </h4>

          <ul>

            {(packageData.customMeals || []).map(
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
                        customMeals:
                          packageData.customMeals.filter(
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
