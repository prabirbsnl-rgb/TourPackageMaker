


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
  description: "",

  hotelSource: "database",

  hotel: "",
  customHotel: "",

  hotelCategory: "",
  roomType: "",
  mealPlan: "",

  sightseeing: [],
  customSightseeing: "",

  meals: [],
  transfers: []
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
      🎯 Sightseeing Selected (
      {(day.sightseeing || []).length}
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

        updated[index].sightseeing =
          e.target.checked
            ? [...current, spot]
            : current.filter(
                (s) => s !== spot
              );

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
     
     

{/* CUSTOM SIGHTSEEING */}

<input
  type="text"
  placeholder="Add Custom Sightseeing"
  value={day.customSightseeing || ""}
  onChange={(e) => {

    const updated =
      [...(itineraryData.itinerary || [])];

    updated[index].customSightseeing =
      e.target.value;

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  style={{
    width: "100%",
    padding: "10px",
    marginTop: "10px"
  }}
/>

</div>

  )}
</div>

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
      🍽 Meals Selected (
      {(day.meals || []).length}
      )
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
      🚐 Transfers Selected (
      {(day.transfers || []).length}
      )
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