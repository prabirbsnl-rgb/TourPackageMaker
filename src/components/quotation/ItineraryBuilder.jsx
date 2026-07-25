


  import { useState } from "react";

import hotels from "../../data/hotels.json";

import { sightseeing } from "../../data/sightseeing";



export default function ItineraryBuilder({
  commonData,
  packageData,
  itineraryData,
  setItineraryData
}) {
  
const [openMealSelector, setOpenMealSelector] =
  useState({});

const [openTransferSelector, setOpenTransferSelector] =
  useState({});

  const [openSightseeingSelector, setOpenSightseeingSelector] =
  useState({});

  const addDay = () => {

  const nextDay =
  (itineraryData.itinerary?.length || 0) + 1;

  setItineraryData({
    ...itineraryData,
    itinerary: [
  ...(itineraryData.itinerary || []),
      {
  day: nextDay,
  title: "",
   city: "", 
   customCity: "", 
  description: "",

  hotelSource: "database",

  hotel: "",
  customHotel: "",

  hotelCategory: "",
  roomType: "",
  mealPlan: "",


  sightseeing: [],
  customSightseeing: [],
  customSightseeingInput: "",

  sightseeingMode: "chips",
  sightseeingText: "",

  selectedSightseeing: [],

  
  meals: [],
customMeals: [],
customMealsInput: "",

mealMode: "chips",
mealText: "",

  
transfers: [],
  customTransfers: [],
  customTransfersInput: "",

  transferMode: "chips",
  transferText: "",

  
}
    ]
  });

};

  
  const moveDayUp = (index) => {

  if (index === 0) return;

 const updated = [...(itineraryData.itinerary || [])];

  [updated[index - 1], updated[index]] =
  [updated[index], updated[index - 1]];

  const renumbered =
    updated.map((day, idx) => ({
      ...day,
      day: idx + 1
    }));

  setItineraryData({
  ...itineraryData,
  itinerary: renumbered
});

};

const moveDayDown = (index) => {

  if (
    index === 
  
  (itineraryData.itinerary || []).length - 1
)
   return;

  const updated = [...(itineraryData.itinerary || [])];

  [updated[index], updated[index + 1]] =
  [updated[index + 1], updated[index]];

  const renumbered =
    updated.map((day, idx) => ({
      ...day,
      day: idx + 1
    }));

 setItineraryData({
  ...itineraryData,
    itinerary: renumbered
  });

};

const removeDay = (index) => {

  const updated =
  (itineraryData.itinerary || []).filter(
      (_, i) => i !== index
    );

  const renumbered =
    updated.map((day, idx) => ({
      ...day,
      day: idx + 1
    }));

 setItineraryData({
  ...itineraryData,
    itinerary: renumbered
  });

};

  return (
    <div style={{ marginTop: "20px" }}>

      <h3>🗓 Day Wise Itinerary</h3>

      {(itineraryData.itinerary || []).map(
  (day, index) => {

const itineraryHotels =
  Object.values(
    hotels?.[commonData?.destination] || {}
  ).flat();
  const selectedCity =
  day.customCity?.trim()
    ? day.customCity
    : day.city;
const cities = [
      ...new Set(
        itineraryHotels.map(
          (hotel) => hotel.city
        )
      )
    ].sort();
const filteredHotels =
  itineraryHotels.filter(
    (hotel) =>
      !selectedCity ||
      hotel.city === selectedCity
  );

const sightseeingOptions =
  sightseeing?.[
    commonData?.destination
  ] || [];

 

    return (

         <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px"
            }}
          >

            <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  }}
>

  <h4>
    Day {day.day}
  </h4>

 

  <div>

    <button
      type="button"
      onClick={() =>
        moveDayUp(index)
      }
    >
      ↑
    </button>

    <button
      type="button"
      onClick={() =>
        moveDayDown(index)
      }
      style={{
        marginLeft: "5px"
      }}
    >
      ↓
    </button>

    <button
      type="button"
      onClick={() =>
        removeDay(index)
      }
      style={{
        marginLeft: "5px",
        color: "red"
      }}
    >
      Delete
    </button>

  </div>

</div>

 

            <input
  type="text"
  placeholder="Day Title"
  value={day.title}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].title =
      e.target.value;

    setItineraryData({
  ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  }}
/>

<div
  style={{
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
    color: "#374151"
  }}
>
📝 Day Description
</div>

  <textarea
  placeholder="Day Description"
              value={day.description}
              onChange={(e) => {

                const updated =
                  [...(itineraryData.itinerary || [])];

                updated[index].description =
                  e.target.value;

                setItineraryData({
                    ...itineraryData,
                  itinerary: updated
                });

              }}
              rows={4}
              style={{
                width: "100%",
                padding: "10px"
              }}
            />
 

{/* DAY CITY */}

<select
  value={day.city || ""}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].city =
      e.target.value;

    updated[index].hotel = "";
    updated[index].roomType = "";
    updated[index].mealPlan = "";

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  }}
>
  <option value="">
    Select City
  </option>

  {cities.map((city) => (
    <option
      key={city}
      value={city}
    >
      {city}
    </option>
  ))}
</select>
<input
  type="text"
  placeholder="Or enter custom city"
  value={day.customCity || ""}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].customCity =
      e.target.value;

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  }}
/>

<h5>Hotel Type</h5>


<select
  value={day.hotelSource || "database"}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].hotelSource =
  e.target.value;

updated[index].hotel = "";
updated[index].customHotel = "";
updated[index].roomType = "";
updated[index].mealPlan = "";

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  }}
>
  <option value="database">
    Hotel Database
  </option>

  <option value="custom">
    Custom Hotel
  </option>
</select>



{day.hotelSource !== "custom" && (

<select
  value={day.hotel}

onChange={(e) => {

    const selectedHotel =
      e.target.value;

    const updated =
      [...(itineraryData.itinerary || [])];
    updated[index].hotel =
      selectedHotel;

    const hotelObj =
  itineraryHotels.find(
    (hotel) =>
      hotel.hotelName === selectedHotel
  );

updated[index].roomType =
  hotelObj?.roomType || "";

updated[index].mealPlan =
  hotelObj?.mealPlan || "";
    setItineraryData({
  ...itineraryData,
  itinerary: updated
});

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  }}
>

  <option value="">
    Select Hotel
  </option>

  {filteredHotels.map((hotel) => (

  <option
    key={hotel.hotelName}
    value={hotel.hotelName}
  >
    {hotel.hotelName}
  </option>

))}

</select>
)}
{/* OPTIONAL HOTEL CATEGORY */}

<input
  type="text"
   placeholder="e.g. 3 Star, 4 Star, Deluxe Camp"
  value={day.hotelCategoryLabel || ""}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].hotelCategoryLabel =
      e.target.value;

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  }}
/>

{day.hotelSource === "custom" && (

<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  }}
>

  <input
    type="text"
    placeholder="Enter custom hotel name"
    value={day.customHotel || ""}
    onChange={(e) => {

      const updated =
        [...(itineraryData.itinerary || [])];

      updated[index].customHotel =
        e.target.value;

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
    style={{
      flex: 1,
      padding: "10px"
    }}
  />

  <button
    type="button"
    onClick={() => {

      const updated =
        [...(itineraryData.itinerary || [])];

      updated[index].customHotel = "";

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
   style={{
  background: "#ffffff",
  color: "#ef4444",
  border: "1px solid #ef4444",
  borderRadius: "6px",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: "700"
}}
  >
    ❌
  </button>

</div>

)}

<h4
  style={{
    margin: "18px 0 8px 0",
    color: "#1f2937",
    fontWeight: 700
  }}
>
🎯 Sightseeing
</h4>

<div
  style={{
    display: "flex",
    gap: 15,
    marginBottom: 8
  }}
>
  <label>
    <input
      type="radio"
      checked={(day.sightseeingMode || "chips") === "chips"
      }
      onChange={() => {

        const updated = [
          ...(itineraryData.itinerary || [])
        ];

        updated[index].sightseeingMode = "chips";

        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}
    />
    Chips
  </label>

  <label>
    <input
      type="radio"
      checked={(day.sightseeingMode || "chips") === "text"}
      onChange={() => {

        const updated = [
          ...(itineraryData.itinerary || [])
        ];

        updated[index].sightseeingMode = "text";

        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}
    />
    Custom Text
  </label>
</div>

{(day.sightseeingMode || "chips") === "chips" && (

<div
  style={{
    width: "100%",
    marginBottom: "10px"
  }}
>
  
  <div
    onClick={() =>
      setOpenSightseeingSelector({
        ...openSightseeingSelector,
        [index]:
          !openSightseeingSelector[index]
      })
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
  {(day.sightseeing || []).length > 0
    ? `Sightseeing Selected (${day.sightseeing.length})`
    : "Select Sightseeing"}
</span>

    <span
      style={{
        fontSize: "16px"
      }}
    >
      ▼
    </span>
  </div>

  {openSightseeingSelector[index] && (

    <div
      style={{
        padding: "10px",
        border: "1px solid #a3a3a3",
        borderTop: "none"
      }}
    >
{sightseeingOptions.map((spot) => (

  <label
    key={spot}
    style={{
      display: "block",
      marginBottom: "5px"
    }}
  >
    <input
      type="checkbox"
      checked={
        day.sightseeing?.includes(spot) || false
      }
      onChange={(e) => {

        const updated =
          [...(itineraryData.itinerary || [])];

        const current =
          updated[index].sightseeing || [];

          const selected =
    updated[index].selectedSightseeing || [];

        updated[index].sightseeing =
          e.target.checked
            ? [...current, spot]
            : current.filter(
                (s) => s !== spot
              );

               // ---------- NEW OBJECT ARRAY ----------

    if (e.target.checked) {

        const exists =
            selected.some(
                (item) =>
                    item.name === spot
            );

        if (!exists) {

            updated[index].selectedSightseeing = [

    ...selected,

    {
        id: Date.now() + Math.random(),
        name: spot,
        source: "chip",
        description: "",
        expanded: false
    }

];

        }

    } else {

        updated[index].selectedSightseeing =
            selected.filter(
                (item) =>
                    item.name !== spot
            );

    }

    // --------------------------------------


        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}
    />

    {" "}
    {spot}

  </label>

))}
 </div>

)}
     

{/* CUSTOM SIGHTSEEING */}

<div style={{ marginTop: "10px" }}>

<input
  type="text"
  placeholder="Custom Sightseeing"
  value={day.customSightseeingInput || ""}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].customSightseeingInput =
      e.target.value;

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "75%",
    padding: "8px"
  }}
/>

<button
  type="button"
  style={{
    marginLeft: "8px"
  }}
  onClick={() => {

    if (!day.customSightseeingInput?.trim())
      return;

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].customSightseeing = [

      ...(updated[index].customSightseeing || []),

      updated[index].customSightseeingInput.trim()

    ];

    // ---------- NEW CODE ----------

const value =
  updated[index].customSightseeingInput.trim();

if (value !== "") {

  const selected =
    updated[index].selectedSightseeing || [];

  const exists =
    selected.some(
      item => item.name === value
    );

  if (!exists) {

    updated[index].selectedSightseeing = [

    ...selected,

    {
        id: Date.now() + Math.random(),
        name: value,
        source: "manual",
        description: "",
        expanded: false
    }

];

  }

}

// ---------- END NEW CODE ----------

    updated[index].customSightseeingInput = "";

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
>
➕ Add
</button>

</div>

{(day.selectedSightseeing || []).length > 0 && (

<div
  style={{
    marginTop: 15,
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 6
  }}
>

  <div
    style={{
      fontWeight: "bold",
      marginBottom: 8
    }}
  >
    Selected Sightseeing
  </div>

  {(day.selectedSightseeing || []).map(
    (item) => (

      <div
        key={item.id}
        style={{
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    background: "#fafafa"
}}
      >

        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>

  <div
    style={{
      fontWeight: 600
    }}
  >
    • {item.name}

    {item.source === "chip" && (
      <span
        style={{
          color: "#999",
          marginLeft: 8,
          fontSize: 12
        }}
      >
        (chip)
      </span>
    )}

    {item.source === "manual" && (
      <span
        style={{
          color: "#999",
          marginLeft: 8,
          fontSize: 12
        }}
      >
        (manual)
      </span>
    )}
  </div>

  <button
    type="button"
    onClick={() => {

      const updated = [...(itineraryData.itinerary || [])];

      updated[index].selectedSightseeing =
        updated[index].selectedSightseeing.map(s =>
          s.id === item.id
            ? {
                ...s,
                expanded: !s.expanded
              }
            : s
        );

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
  >
    {item.description?.trim()
      ? "✏ Edit"
      : "✏ Add"}
  </button>

</div>
          
{item.expanded && (

<div
    style={{
        marginTop: 10,
       
    }}
>

    <textarea

        rows={4}

        value={item.description || ""}

        placeholder="Enter description for this sightseeing..."

        onChange={(e) => {

            const updated = [
                ...(itineraryData.itinerary || [])
            ];

            updated[index].selectedSightseeing =
                updated[index].selectedSightseeing.map(
                    s =>
                        s.id === item.id
                            ? {
                                  ...s,
                                  description:
                                      e.target.value
                              }
                            : s
                );

            setItineraryData({
                ...itineraryData,
                itinerary: updated
            });

        }}

        style={{
            width: "100%",
            padding: "8px",
            boxSizing: "border-box",
            resize: "vertical"
        }}

    />

</div>

)}
        </div>

        
      

    )
  )}

</div>

)}

{(day.customSightseeing || []).length > 0 && (

<div
  style={{
    marginTop: "8px"
  }}
>

{day.customSightseeing.map((item, i) => (

<div
  key={i}
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px"
  }}
>

<span>
• {item}
</span>

<button
type="button"
onClick={() => {

const updated =
[...(itineraryData.itinerary || [])];

updated[index].customSightseeing =
updated[index].customSightseeing.filter(
(_, idx) => idx !== i
);

setItineraryData({
...itineraryData,
itinerary: updated
});

}}
>
❌
</button>

</div>

))}

</div>

)}

</div>
)}

{(day.sightseeingMode || "chips") === "text" && (

<textarea
    value={day.sightseeingText || ""}

    onChange={(e) => {

        const updated = [
            ...(itineraryData.itinerary || [])
        ];

        updated[index].sightseeingText =
            e.target.value;

        setItineraryData({
            ...itineraryData,
            itinerary: updated
        });

    }}

    rows={5}

    placeholder="Enter custom sightseeing details..."

    style={{
        width: "100%",
        padding: "10px",
        resize: "vertical",
        boxSizing: "border-box",
        border: "1px solid #a3a3a3"
    }}

/>

)}

<h4
  style={{
    margin: "18px 0 8px 0",
    color: "#1f2937",
    fontWeight: 700
  }}
>
🍽 Meals
</h4>

<div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 8
  }}
>
  <label>
  <input
    type="radio"
   checked={(day.mealMode || "chips") === "chips"}
    onChange={() => {

      const updated = [
        ...(itineraryData.itinerary || [])
      ];

      updated[index].mealMode = "chips";

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
  />
  Chips
</label>

  <label>
  <input
    type="radio"
    checked={day.mealMode === "text"}
    onChange={() => {

      const updated = [
        ...(itineraryData.itinerary || [])
      ];

      updated[index].mealMode = "text";

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
  />
  Custom Text
</label>

</div>


  
{day.mealMode === "chips" && (
<div
  style={{
    width: "100%",
    marginBottom: "10px"
  }}
>
  <div
    onClick={() =>
      setOpenMealSelector({
        ...openMealSelector,
        [index]:
          !openMealSelector[index]
      })
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
  {(day.meals || []).length > 0
    ? `Meals Selected (${day.meals.length})`
    : "Select Meals"}
</span>

    <span style={{ fontSize: "16px" }}>
      ▼
    </span>
  </div>

  {openMealSelector[index] && (

    <div
      style={{
        padding: "10px",
        border:
          "1px solid #a3a3a3",
        borderTop: "none"
      }}
    >

      {[
  "Breakfast",
  "Lunch",
  "Dinner",
  "CP (Room + Breakfast)",
  "MAP (Breakfast + Dinner)",
  "AP (Breakfast + Lunch + Dinner)"
  ].map((meal) => (

    

        <label
          key={meal}
          style={{
            display: "block",
            marginBottom: "5px"
          }}
        >

          <input
            type="checkbox"
            checked={
              day.meals?.includes(
                meal
              ) || false
            }
            onChange={(e) => {

              const updated =
                [...(itineraryData.itinerary || [])];

              const current =
                updated[index]
                  .meals || [];

              updated[index].meals =
                e.target.checked
                  ? [...current, meal]
                  : current.filter(
                      (m) =>
                        m !== meal
                    );

              setItineraryData({
                 ...itineraryData,
                itinerary: updated
              });

            }}
          />

          {" "}
          {meal}

        </label>

      ))}

    </div>

  )}
</div>
)}

{day.mealMode === "text" && (

<textarea
    value={day.mealText || ""}
    onChange={(e) => {

        const updated = [
            ...(itineraryData.itinerary || [])
        ];

        updated[index].mealText =
            e.target.value;

        setItineraryData({
            ...itineraryData,
            itinerary: updated
        });

    }}

    rows={4}

    placeholder="Enter custom meal details..."

    style={{
        width: "100%",
        padding: "10px",
        resize: "vertical",
        boxSizing: "border-box",
        border: "1px solid #a3a3a3"
    }}

/>

)}

<div style={{ marginTop: "10px" }}>

<input
  type="text"
  placeholder="Custom Meal"
  value={day.customMealsInput || ""}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].customMealsInput =
      e.target.value;

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "75%",
    padding: "8px"
  }}
/>

<button
  type="button"
  style={{ marginLeft: "8px" }}
  onClick={() => {

    if (!day.customMealsInput?.trim())
      return;

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].customMeals = [

      ...(updated[index].customMeals || []),

      updated[index].customMealsInput.trim()

    ];

    updated[index].customMealsInput = "";

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
>
➕ Add
</button>

</div>
{(day.customMeals || []).length > 0 && (

<div style={{ marginTop: "8px" }}>

{day.customMeals.map((meal, i) => (

<div
key={i}
style={{
display: "flex",
justifyContent: "space-between",
marginBottom: "4px"
}}
>

<span>
• {meal}
</span>

<button
type="button"
onClick={() => {

const updated =
[...(itineraryData.itinerary || [])];

updated[index].customMeals =
updated[index].customMeals.filter(
(_, idx) => idx !== i
);

setItineraryData({
...itineraryData,
itinerary: updated
});

}}
>
❌
</button>

</div>

))}

</div>

)}

<h4
  style={{
    margin: "18px 0 8px 0",
    color: "#1f2937",
    fontWeight: 700
  }}
>
🚐 Transfers
</h4>

<div
  style={{
    display: "flex",
    gap: 15,
    marginBottom: 8
  }}
>
  <label>
    <input
      type="radio"
      checked={(day.transferMode || "chips") === "chips"}
      onChange={() => {

        const updated = [
          ...(itineraryData.itinerary || [])
        ];

        updated[index].transferMode = "chips";

        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}
    />
    Chips
  </label>

  <label>
    <input
      type="radio"
      checked={(day.transferMode || "chips") === "text"}
      onChange={() => {

        const updated = [
          ...(itineraryData.itinerary || [])
        ];

        updated[index].transferMode = "text";

        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}
    />
    Custom Text
  </label>
</div>


{(day.transferMode || "chips") === "chips" && (

<div
  style={{
    width: "100%",
    marginBottom: "10px"
  }}
>
  <div
    onClick={() =>
      setOpenTransferSelector({
        ...openTransferSelector,
        [index]:
          !openTransferSelector[index]
      })
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
  {(day.transfers || []).length > 0
    ? `Transfers Selected (${day.transfers.length})`
    : "Select Transfers"}
</span>
    <span style={{ fontSize: "16px" }}>
      ▼
    </span>
  </div>

  {openTransferSelector[index] && (

    <div
      style={{
        padding: "10px",
        border:
          "1px solid #a3a3a3",
        borderTop: "none"
      }}
    >

      {[
        "Airport Pickup",
        "Airport Drop",
        "Private Transfer",
        "Shared Transfer",
        "Intercity Transfer",
        "Speedboat Transfer",
        "Ferry Transfer",
        "Train Transfer",
        "Luxury Vehicle"
      ].map((transfer) => (

        <label
          key={transfer}
          style={{
            display: "block",
            marginBottom: "5px"
          }}
        >

          <input
            type="checkbox"
            checked={
              day.transfers?.includes(
                transfer
              ) || false
            }
            onChange={(e) => {

              const updated =
               [...(itineraryData.itinerary || [])];

              const current =
                updated[index]
                  .transfers || [];

              updated[index]
                .transfers =
                e.target.checked
                  ? [
                      ...current,
                      transfer
                    ]
                  : current.filter(
                      (t) =>
                        t !== transfer
                    );

              setItineraryData({
                    ...itineraryData,
                itinerary: updated
              });

            }}
          />

          {" "}
          {transfer}

        </label>

      ))}

    </div>

  )}
</div>
)}

{(day.transferMode || "chips") === "text" && (

<textarea
    value={day.transferText || ""}

    onChange={(e) => {

        const updated = [
            ...(itineraryData.itinerary || [])
        ];

        updated[index].transferText =
            e.target.value;

        setItineraryData({
            ...itineraryData,
            itinerary: updated
        });

    }}

    rows={5}

    placeholder="Enter custom transfer details..."

    style={{
        width: "100%",
        padding: "10px",
        resize: "vertical",
        boxSizing: "border-box",
        border: "1px solid #a3a3a3"
    }}

/>

)}

<div style={{ marginTop: "10px" }}>

  <input
    type="text"
    placeholder="Custom Transfer"
    value={day.customTransfersInput || ""}
    onChange={(e) => {

      const updated = [...(itineraryData.itinerary || [])];

      updated[index].customTransfersInput =
        e.target.value;

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
    style={{
      width: "75%",
      padding: "8px"
    }}
  />

  <button
    type="button"
    style={{ marginLeft: "8px" }}
    onClick={() => {

      if (!day.customTransfersInput?.trim())
        return;

      const updated = [...(itineraryData.itinerary || [])];

      updated[index].customTransfers = [

        ...(updated[index].customTransfers || []),

        updated[index].customTransfersInput.trim()

      ];

      updated[index].customTransfersInput = "";

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}
  >
    ➕ Add
  </button>

</div>
{(day.customTransfers || []).length > 0 && (

<div style={{ marginTop: "8px" }}>

  {day.customTransfers.map((item, i) => (

    <div
      key={i}
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4px"
      }}
    >

      <span>
        • {item}
      </span>

      <button
        type="button"
        onClick={() => {

          const updated =
            [...(itineraryData.itinerary || [])];

          updated[index].customTransfers =
            updated[index].customTransfers.filter(
              (_, idx) => idx !== i
            );

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}
      >
        ❌
      </button>

    </div>

  ))}

</div>

)}



                    </div>

        );

      }
)}

<button
        type="button"
        onClick={addDay}
      >
        + Add Day
      </button>

    </div>
  );
}