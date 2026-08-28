


  import { useState } from "react";

import hotels from "../../data/hotels.json";

import { sightseeing } from "../../data/sightseeing";

import { defaultItineraryDay } from "../../data/defaultItineraryDay";

import ItineraryTemplateLibrary
    from "./ItineraryTemplateLibrary";

import SightseeingRichTextEditor from "../SightseeingRichTextEditor";


export default function ItineraryBuilder({
  commonData,
  packageData,
  itineraryData,
  setItineraryData
}) {

  const [showTemplateLibrary, setShowTemplateLibrary] =
    useState(false);
  
const [openMealSelector, setOpenMealSelector] =
  useState({});

const [openTransferSelector, setOpenTransferSelector] =
  useState({});

  const [openSightseeingSelector, setOpenSightseeingSelector] =
  useState({});

  const [openDayDescription, setOpenDayDescription] =
  useState({});

  const [openDayNote, setOpenDayNote] =
  useState({});

  const [openDaySightseeing, setOpenDaySightseeing] =
  useState({});





  const addDay = () => {

console.log("====== ADD DAY CLICKED ======");

  const nextDay =
  (itineraryData.itinerary?.length || 0) + 1;

console.log("Current Length:", itineraryData.itinerary.length);
    console.log("Next Day:", nextDay);

  setItineraryData({
    ...itineraryData,
    itinerary: [
  ...(itineraryData.itinerary || []),
      {
    ...defaultItineraryDay,
    day: nextDay
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

    
    <div
  style={{
    marginTop: "20px",
    width: "100%"
  }}
>

  {/* =========================================================
      DAY WISE ITINERARY SECTION HEADER
  ========================================================= */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "0 0 10px 0",
      marginBottom: "14px",
      borderBottom: "3px solid #1e3a8a",
      color: "#1e3a8a",
      fontSize: "20px",
      fontWeight: 800
    }}
  >
    <span
      style={{
        fontSize: "18px"
      }}
    >
      🗺️
    </span>

    <span>
      Day Wise Itinerary
    </span>
  </div>
      
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
    border: "1px solid #d6dce5",
    padding: "10px 12px",
    marginBottom: "10px",
    borderRadius: "8px",
    background: "#ffffff",
    boxSizing: "border-box",
    borderBottom: "4px solid #1e3a8a"
  }}
>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "30px",
    marginBottom: "8px"
  }}
>

  {/* DAY NUMBER + EDITABLE TITLE */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flex: 1
    }}
  >

   <h4
  style={{
    margin: 0,
    padding: "7px 18px",
    borderRadius: "999px",
    background: "#6b214f",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    lineHeight: "1.2",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "58px",
    boxShadow: "0 1px 3px rgba(107, 33, 79, 0.20)"
  }}
>
  Day {day.day}
</h4>

    <input
      type="text"
      placeholder="Day Title"
      value={day.title || ""}
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
        flex: 1,
        padding: "6px 9px",
        fontSize: "13px",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "5px",
        minWidth: 0
      }}
    />

  </div>


  {/* DAY CONTROLS */}
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "5px"
  }}
>

  {/* =========================
      MOVE DAY UP
  ========================= */}
  <button
    type="button"
    onClick={() =>
      moveDayUp(index)
    }
    title="Move Day Up"
    style={{
      width: "28px",
      height: "28px",
      padding: 0,
      border: "1px solid #94a3b8",
      borderRadius: "5px",
      background: "#f8fafc",
      color: "#1e3a8a",
      fontSize: "17px",
      fontWeight: 800,
      lineHeight: "26px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    ↑
  </button>


  {/* =========================
      MOVE DAY DOWN
  ========================= */}
  <button
    type="button"
    onClick={() =>
      moveDayDown(index)
    }
    title="Move Day Down"
    style={{
      width: "28px",
      height: "28px",
      padding: 0,
      border: "1px solid #94a3b8",
      borderRadius: "5px",
      background: "#f8fafc",
      color: "#1e3a8a",
      fontSize: "17px",
      fontWeight: 800,
      lineHeight: "26px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    ↓
  </button>


  {/* =========================
      DELETE DAY
  ========================= */}
  <button
    type="button"
    onClick={() =>
      removeDay(index)
    }
    title="Delete Day"
    style={{
      height: "28px",
      padding: "0 12px",
      border: "1px solid #e11d48",
      borderRadius: "999px",
      background: "#e11d48",
      color: "#ffffff",
      fontSize: "11px",
      fontWeight: 800,
      cursor: "pointer",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    Delete
  </button>

</div>

</div>
            

   

{/* =========================================================
    DAY DESCRIPTION — COMPACT
========================================================= */}

<div
  style={{
    marginTop: "6px",
    marginBottom: "6px",
    padding: "7px 9px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    background: "#f8fafc"
  }}
>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px"
    }}
  >

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        minWidth: 0,
        flex: 1
      }}
    >

      <span
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#374151",
          whiteSpace: "nowrap"
        }}
      >
        📝 Day Description
      </span>

      {!openDayDescription[index] && (
        <span
          style={{
            fontSize: "12px",
            color: "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {day.description?.trim()
            ? day.description.trim()
            : "No description added"}
        </span>
      )}

    </div>

    <button
      type="button"
      onClick={() => {

        setOpenDayDescription({
          ...openDayDescription,
          [index]:
            !openDayDescription[index]
        });

      }}
      style={{
        padding: "4px 9px",
        fontSize: "11px",
        fontWeight: 700,
        border: "1px solid #cbd5e1",
        borderRadius: "5px",
        background: "#ffffff",
        color: "#1e3a8a",
        cursor: "pointer",
        whiteSpace: "nowrap"
      }}
    >
      {openDayDescription[index]
        ? "Close"
        : "Edit"}
    </button>

  </div>


  {/* =======================================================
      RICH TEXT EDITOR — ONLY WHEN EDITING
  ======================================================= */}

  {openDayDescription[index] && (

    <div
      style={{
        marginTop: "7px"
      }}
    >

      <SightseeingRichTextEditor

        key={`day-description-${index}-${day.day || index}`}

        value={
          day.descriptionRichText ||
          day.description ||
          ""
        }

        onChange={(html) => {

          const updated = [
            ...(itineraryData.itinerary || [])
          ];

          /*
           * Convert Tiptap HTML to plain text.
           * Keep day.description for compatibility
           * with the existing PDF/data logic.
           */

          const temp =
            document.createElement("div");

          temp.innerHTML =
            html;

          const plainText =
            temp.innerText
              .replace(/\r\n/g, "\n");

          updated[index] = {
            ...updated[index],

            descriptionRichText:
              html,

            description:
              plainText
          };

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}

        preserveLineBreaks={true}

      />

    </div>

  )}

</div>


 
 {/* =========================================================
    OPTIONAL NOTE — COMPACT
========================================================= */}

<div
  style={{
    marginTop: "6px",
    marginBottom: "6px"
  }}
>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "6px 9px",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      background: "#ffffff"
    }}
  >

    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "13px",
        fontWeight: 700,
        color: "#374151",
        cursor: "pointer"
      }}
    >

      <input
        type="checkbox"
        checked={day.noteEnabled || false}
        onChange={(e) => {

          const updated = [
            ...(itineraryData.itinerary || [])
          ];

          updated[index].noteEnabled =
            e.target.checked;

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}
      />

      <span>
        📝 Optional Note
      </span>

    </label>


    {day.noteEnabled && (

      <button
        type="button"
        onClick={() => {

          setOpenDayNote({
            ...openDayNote,
            [index]:
              !openDayNote[index]
          });

        }}
        style={{
          padding: "4px 9px",
          fontSize: "11px",
          fontWeight: 700,
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          background: "#ffffff",
          color: "#1e3a8a",
          cursor: "pointer",
          whiteSpace: "nowrap"
        }}
      >
        {openDayNote[index]
          ? "Close"
          : "Edit"}
      </button>

    )}

  </div>


  {/* =======================================================
      NOTE PREVIEW
  ======================================================= */}

  {day.noteEnabled &&
   !openDayNote[index] &&
   (
      <div
        style={{
          marginTop: "4px",
          paddingLeft: "30px",
          fontSize: "12px",
          color: "#64748b",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {day.noteText?.trim()
          ? day.noteText.trim()
          : "No note added"}
      </div>
  )}


  {/* =======================================================
      NOTE RICH TEXT EDITOR
  ======================================================= */}

  {day.noteEnabled &&
   openDayNote[index] && (

    <div
      style={{
        marginTop: "7px"
      }}
    >

      <SightseeingRichTextEditor

        key={`day-note-${index}-${day.day || index}`}

        value={
          day.noteRichText ||
          day.noteText ||
          ""
        }

        onChange={(html) => {

          const updated = [
            ...(itineraryData.itinerary || [])
          ];

          const temp =
            document.createElement("div");

          temp.innerHTML =
            html;

          const plainText =
            temp.innerText
              .replace(/\r\n/g, "\n");

          updated[index] = {
            ...updated[index],

            noteRichText:
              html,

            noteText:
              plainText
          };

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}

        preserveLineBreaks={true}

      />

    </div>

  )}

</div>



{/* =========================================================
    CITY & HOTEL — COMPACT TWO-ROW LAYOUT
========================================================= */}

<div
  style={{
    marginTop: "10px",
    padding: "10px 12px 10px 12px",
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    background: "#f8fafc",
    boxSizing: "border-box",
   borderBottom: "3px solid #7fb8b0"
  }}
>

  {/* ---------------------------------------------------------
      SUB-SECTION HEADING
  --------------------------------------------------------- */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      marginBottom: "7px",
      paddingBottom: "5px",
      borderBottom: "1px solid #cfe3df",
      color: "#287c73",
      fontSize: "13px",
      fontWeight: 800
    }}
  >
    <span style={{ fontSize: "14px" }}>
      📍
    </span>

    <span>
      City & Hotel
    </span>
  </div>


  {/* =========================================================
      ROW 1 — CITY
  ========================================================= */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1fr)",
      gap: "8px",
      alignItems: "center",
      marginBottom: "7px"
    }}
  >

    <label
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "#475569",
        textAlign: "right",
        paddingRight: "2px"
      }}
    >
      City
    </label>


    {/* SELECT CITY */}

    <select
      value={day.city || ""}
      onChange={(e) => {

        const updated =
          [...(itineraryData.itinerary || [])];

        updated[index] = {
          ...updated[index],

          city: e.target.value,
          customCity: "",

          hotel: "",
          roomType: "",
          mealPlan: ""
        };

        console.log(
          "CITY AFTER CHANGE:",
          updated[index]
        );

        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}
      style={{
        width: "100%",
        padding: "6px 8px",
        fontSize: "12px",
        boxSizing: "border-box"
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


    {/* CUSTOM CITY */}

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
        padding: "6px 8px",
        fontSize: "12px",
        boxSizing: "border-box"
      }}
    />

  </div>


  {/* =========================================================
      ROW 2 — HOTEL
  ========================================================= */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1fr)",
      gap: "8px",
      alignItems: "center",
      marginBottom: "4px"
    }}
  >

    <label
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "#475569",
        textAlign: "right",
        paddingRight: "2px"
      }}
    >
      Hotel
    </label>


    {/* -------------------------------------------------------
        HOTEL TYPE
    ------------------------------------------------------- */}

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
        padding: "6px 8px",
        fontSize: "12px",
        boxSizing: "border-box"
      }}
    >

      <option value="database">
        Hotel Database
      </option>

      <option value="custom">
        Custom Hotel
      </option>

    </select>


    {/* -------------------------------------------------------
        DATABASE MODE — HOTEL
    ------------------------------------------------------- */}

    {day.hotelSource !== "custom" ? (

      <select
        value={day.hotel || ""}
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
                hotel.hotelName ===
                selectedHotel
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
          padding: "6px 8px",
          fontSize: "12px",
          boxSizing: "border-box"
        }}
      >

        <option value="">
          Select Hotel
        </option>

        {filteredHotels.map(
          (hotel) => (

            <option
              key={hotel.hotelName}
              value={hotel.hotelName}
            >
              {hotel.hotelName}
            </option>

          )
        )}

      </select>

    ) : (

      /* -----------------------------------------------------
         CUSTOM HOTEL MODE — CATEGORY
      ----------------------------------------------------- */

      <input
        type="text"
        placeholder="e.g. 3 Star, 4 Star, Deluxe Camp"
        value={
          day.hotelCategoryLabel || ""
        }
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
          padding: "6px 8px",
          fontSize: "12px",
          boxSizing: "border-box"
        }}
      />

    )}

  </div>


  {/* =========================================================
      DATABASE MODE — CATEGORY
      Third item stays on the same row.
  ========================================================= */}

  {day.hotelSource !== "custom" && (

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1fr)",
        gap: "8px",
        alignItems: "center",
        marginTop: "-4px"
      }}
    >

      <span />

      <span
        style={{
          fontSize: "11px",
          color: "#64748b",
          textAlign: "right",
          paddingRight: "2px"
        }}
      >
        Category
      </span>

      <input
        type="text"
        placeholder="e.g. 3 Star, 4 Star, Deluxe Camp"
        value={
          day.hotelCategoryLabel || ""
        }
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
          padding: "6px 8px",
          fontSize: "12px",
          boxSizing: "border-box"
        }}
      />

    </div>

  )}


  {/* =========================================================
      CUSTOM HOTEL MODE
  ========================================================= */}

  {day.hotelSource === "custom" && (

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px minmax(0, 1fr) auto",
        gap: "8px",
        alignItems: "center",
        marginTop: "2px"
      }}
    >

      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#64748b",
          textAlign: "right",
          paddingRight: "2px"
        }}
      >
        Custom Hotel
      </label>

      <input
        type="text"
        placeholder="Enter custom hotel name"
        value={
          day.customHotel || ""
        }
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
          width: "100%",
          padding: "6px 8px",
          fontSize: "12px",
          boxSizing: "border-box"
        }}
      />

      <button
        type="button"
        onClick={() => {

          const updated =
            [...(itineraryData.itinerary || [])];

          updated[index].customHotel =
            "";

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}
        style={{
          background: "#ffffff",
          color: "#ef4444",
          border: "1px solid #ef4444",
          borderRadius: "5px",
          padding: "4px 7px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "11px"
        }}
      >
        ❌
      </button>

    </div>

  )}

</div>




{/* =========================================================
    SIGHTSEEING SUBSECTION CARD
========================================================= */}

<div
  style={{
    marginTop: "12px",
    marginBottom: "12px",
    padding: "10px 12px 12px 12px",
    background: "#f8fbff",
    border: "1px solid #dbe3ea",
    borderRadius: "9px",
    borderBottom: "3px solid #7fb8b0",
    boxSizing: "border-box",
    width: "100%"
  }}
>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    paddingBottom: "6px",
    borderBottom: "1px solid #d7e1e8",
    color: "#287c73",
    fontSize: "13px",
    fontWeight: 800
  }}
>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px"
      }}
    >
      <span
        style={{
          fontSize: "14px"
        }}
      >
        🎯
      </span>

      <span>
        Sightseeing
      </span>
    </div>


    <button
      type="button"
      onClick={() => {

        setOpenDaySightseeing({
          ...openDaySightseeing,
          [index]:
            !openDaySightseeing[index]
        });

      }}
      style={{
  padding: "5px 14px",
  minWidth: "58px",
  height: "28px",
  border: "1px solid #dc2626",
  borderRadius: "999px",
  background: "#dc2626",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  lineHeight: "1"
}}
    >
      {openDaySightseeing[index]
        ? "Close"
        : "Edit"}
    </button>

  </div>


  {/* ---------------------------------------------------------
      MODE SELECTOR
      Keep it visible because it is a primary control.
  --------------------------------------------------------- */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      marginTop: "6px",
      fontSize: "12px"
    }}
  >

    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer"
      }}
    >

      <input
        type="radio"
        checked={
          (day.sightseeingMode || "chips") ===
          "chips"
        }
        onChange={() => {

          const updated = [
            ...(itineraryData.itinerary || [])
          ];

          updated[index].sightseeingMode =
            "chips";

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}
      />

      Chips

    </label>


    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer"
      }}
    >

      <input
        type="radio"
        checked={
          (day.sightseeingMode || "chips") ===
          "text"
        }
        onChange={() => {

          const updated = [
            ...(itineraryData.itinerary || [])
          ];

          updated[index].sightseeingMode =
            "text";

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}
      />

      Custom Text

    </label>

  </div>

{openDaySightseeing[index] && (
  <>



{(day.sightseeingMode || "chips") === "chips" && (

  <div
    style={{
      width: "100%",
      marginBottom: "8px"
    }}
  >

    {/* =====================================================
        SIGHTSEEING SELECTOR + CUSTOM SIGHTSEEING
        SINGLE COMPACT ROW
    ===================================================== */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%"
      }}
    >

      {/* -------------------------------------------------
          SELECT SIGHTSEEING
      ------------------------------------------------- */}

      <div
        onClick={() =>
          setOpenSightseeingSelector({
            ...openSightseeingSelector,
            [index]:
              !openSightseeingSelector[index]
          })
        }
        style={{
          flex: "1 1 0",
          minWidth: 0,
          height: "34px",
          padding: "7px 10px",
          border: "1px solid #a3a3a3",
          borderRadius: "6px",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxSizing: "border-box",
          fontSize: "12px"
        }}
      >

        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {(day.sightseeing || []).length > 0
            ? `Sightseeing Selected (${day.sightseeing.length})`
            : "Select Sightseeing"}
        </span>

        <span
          style={{
            fontSize: "13px",
            marginLeft: "6px",
            flexShrink: 0
          }}
        >
          ▼
        </span>

      </div>


      {/* -------------------------------------------------
          CUSTOM SIGHTSEEING
      ------------------------------------------------- */}

      <input
        type="text"
        placeholder="Custom Sightseeing"
        value={
          day.customSightseeingInput || ""
        }
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
          flex: "0 1 34%",
          minWidth: "120px",
          height: "34px",
          padding: "7px 9px",
          border: "1px solid #a3a3a3",
          borderRadius: "6px",
          boxSizing: "border-box",
          fontSize: "12px"
        }}
      />


      {/* -------------------------------------------------
          ADD BUTTON
      ------------------------------------------------- */}

      <button
        type="button"
        onClick={() => {

          if (
            !day.customSightseeingInput?.trim()
          ) {
            return;
          }

          const updated =
            [...(itineraryData.itinerary || [])];

          updated[index].customSightseeing = [

            ...(updated[index]
              .customSightseeing || []),

            updated[index]
              .customSightseeingInput
              .trim()

          ];

          // ---------- EXISTING OBJECT ARRAY ----------

          const value =
            updated[index]
              .customSightseeingInput
              .trim();

          if (value !== "") {

            const selected =
              updated[index]
                .selectedSightseeing || [];

            const exists =
              selected.some(
                item =>
                  item.name === value
              );

            if (!exists) {

              updated[index]
                .selectedSightseeing = [

                ...selected,

                {
                  id:
                    Date.now() +
                    Math.random(),

                  name:
                    value,

                  source:
                    "manual",

                  description:
                    "",

                  expanded:
                    false
                }

              ];

            }

          }

          // ------------------------------------------

          updated[index]
            .customSightseeingInput = "";

          setItineraryData({
            ...itineraryData,
            itinerary: updated
          });

        }}
        style={{
          flexShrink: 0,
          height: "34px",
          padding: "6px 10px",
          border: "1px solid #287c73",
          borderRadius: "6px",
          background: "#287c73",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap"
        }}
      >
        ＋ Add
      </button>

    </div>


    {/* =====================================================
        EXISTING SIGHTSEEING DROPDOWN
        LOGIC UNCHANGED
    ===================================================== */}

    {openSightseeingSelector[index] && (

      <div
        style={{
          marginTop: "4px",
          padding: "8px 10px",
          border: "1px solid #a3a3a3",
          borderRadius: "6px",
          background: "#fff",
          maxHeight: "180px",
          overflowY: "auto"
        }}
      >

        {sightseeingOptions.map((spot) => (

          <label
            key={spot}
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "12px"
            }}
          >

            <input
              type="checkbox"
              checked={
                day.sightseeing?.includes(
                  spot
                ) || false
              }
              onChange={(e) => {

                const updated =
                  [...(itineraryData.itinerary || [])];

                const current =
                  updated[index]
                    .sightseeing || [];

                const selected =
                  updated[index]
                    .selectedSightseeing || [];

                updated[index].sightseeing =
                  e.target.checked
                    ? [...current, spot]
                    : current.filter(
                        (s) =>
                          s !== spot
                      );

                if (e.target.checked) {

                  const exists =
                    selected.some(
                      (item) =>
                        item.name === spot
                    );

                  if (!exists) {

                    updated[index]
                      .selectedSightseeing = [

                      ...selected,

                      {
                        id:
                          Date.now() +
                          Math.random(),

                        name:
                          spot,

                        source:
                          "chip",

                        description:
                          "",

                        expanded:
                          false
                      }

                    ];

                  }

                } else {

                  updated[index]
                    .selectedSightseeing =
                    selected.filter(
                      (item) =>
                        item.name !== spot
                    );

                }

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


    {/* =====================================================
        SELECTED SIGHTSEEING
        EXISTING SECTION CONTINUES BELOW
    ===================================================== */}

    {(day.selectedSightseeing || []).length > 0 && (

<div
  style={{
    marginTop: 15,
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 6
  }}
>

  {/* =====================================================
    SELECTED SIGHTSEEING — SUBSECTION HEADER
===================================================== */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "8px",
    marginTop: "6px",
    marginBottom: "6px",
    paddingBottom: "5px",
    borderBottom: "1px solid #e5e7eb",
    color: "#8B1E3F",
    fontSize: "12px",
    fontWeight: 700
  }}
>
  <span
    style={{
      fontSize: "13px",
      color: "#A52A4A"
    }}
  >
    ☷
  </span>

  <span>
    Selected Sightseeing
  </span>
</div>

  {(day.selectedSightseeing || []).map(
    (item) => (

      <div
  key={item.id}
  style={{
    borderBottom: "1px solid #e5e7eb",
    padding: "4px 0",
    marginBottom: "0",
    background: "transparent"
  }}
>

        <div
  style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "6px",
  width: "100%",
  minHeight: "28px",
  boxSizing: "border-box"
}}
>

  <div
style={{
  flex: 1,
  minWidth: 0,
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  lineHeight: "1.3"
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

 <div
 style={{
  display: "flex",
  alignItems: "center",
  gap: "5px",
  flexShrink: 0,
  width: "58px",
  marginRight: "50%"
}}
>

  <button
  type="button"
  onClick={() => {

    const updated = [...(itineraryData.itinerary || [])];

    updated[index].selectedSightseeing =
      updated[index].selectedSightseeing.map(
        s =>
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
  style={{
    padding: "3px 7px",
    fontSize: "11px",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    whiteSpace: "nowrap"
  }}
>
  {item.expanded
    ? "Close"
    : item.description?.trim()
      ? "Edit"
      : "Add"}
</button>

  {/* DELETE */}
  <button
    type="button"
    onClick={() => {

  const updated =
    [...(itineraryData.itinerary || [])];

  const removedItem =
    updated[index].selectedSightseeing.find(
      s => s.id === item.id
    );

  /*
   * Remove from Selected Sightseeing list
   */
  updated[index].selectedSightseeing =
    updated[index].selectedSightseeing.filter(
      s => s.id !== item.id
    );

  /*
   * If this was a chip item,
   * also remove it from the main
   * sightseeing selection array.
   */
  if (
    removedItem?.source === "chip"
  ) {

    updated[index].sightseeing =
      (updated[index].sightseeing || [])
        .filter(
          name =>
            name !== removedItem.name
        );
  }

  /*
   * If this was a manually added item,
   * also remove it from customSightseeing.
   */
  if (
    removedItem?.source === "manual"
  ) {

    updated[index].customSightseeing =
      (updated[index].customSightseeing || [])
        .filter(
          name =>
            name !== removedItem.name
        );
  }

  setItineraryData({
    ...itineraryData,
    itinerary: updated
  });

}}
    style={{
      width: "24px",
      height: "24px",
      padding: 0,
      border: "1px solid #f1a1b2",
      borderRadius: "5px",
      background: "#fff",
      color: "#be123c",
      fontSize: "11px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
    title="Remove sightseeing"
  >
    ×
  </button>

</div>

</div>
          
{item.expanded && (

<div
  style={{
    marginTop: "6px",
    marginLeft: "12px",
    marginRight: "12px",
    marginBottom: "4px"
  }}
>

  <SightseeingRichTextEditor
  key={`sightseeing-description-${item.id}`}

  value={
    item.descriptionRichText ||
    item.description ||
    ""
  }

  onChange={(html) => {

    const updated = [
      ...(itineraryData.itinerary || [])
    ];

    /*
     * Convert the Tiptap HTML to plain text.
     * Existing PDF/data logic can continue using
     * item.description.
     */
    const temp =
      document.createElement("div");

    temp.innerHTML =
      html;

    const plainText =
      temp.innerText
        .replace(/\r\n/g, "\n");

    updated[index].selectedSightseeing =
      updated[index].selectedSightseeing.map(
        s =>
          s.id === item.id
            ? {
                ...s,

                /*
                 * Rich version
                 */
                descriptionRichText:
                  html,

                /*
                 * Existing plain-text field
                 */
                description:
                  plainText
              }
            : s
      );

    setItineraryData({
      ...itineraryData,
      itinerary: updated
    });

  }}
  preserveLineBreaks={true}

  compact={true}

/>

</div>

)}
        </div>

        
      

    )
  )}

</div>

)}

</div>
)}

{(day.sightseeingMode || "chips") === "text" && (

  <SightseeingRichTextEditor
    key={`${index}-${day.day || index}`}

    value={
      day.sightseeingRichText ||
      day.sightseeingText ||
      ""
    }

    onChange={(html) => {

      const updated = [
        ...(itineraryData.itinerary || [])
      ];

      updated[index].sightseeingRichText =
        html;

      const temp =
        document.createElement("div");

      temp.innerHTML =
        html;

      updated[index].sightseeingText =
        temp.innerText
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n");

      setItineraryData({
        ...itineraryData,
        itinerary: updated
      });

    }}

    preserveLineBreaks={true}
  />

)}

  </>
)}
</div>




{/* =========================================================
    MEALS + TRANSFERS — TWO COLUMN ROW
========================================================= */}

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "12px",
    marginTop: "10px",
    marginBottom: "10px",
    alignItems: "start"
  }}
>

<div
  style={{
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#f8fafc",
    boxSizing: "border-box"
  }}
>


<h4
  style={{
    margin: "0 0 8px 0",
    paddingBottom: "7px",
    borderBottom: "1px solid #dbe3ea",
    color: "#287c73",
    fontSize: "13px",
    fontWeight: 800,
    textAlign: "left"
  }}
>
  🍴 Meals
</h4>

<div
  style={{
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "7px",
  fontSize: "12px",
  color: "#64748b"
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
  padding: "7px 9px",
  height: "32px",
  border: "1px solid #a3a3a3",
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  boxSizing: "border-box",
  fontSize: "12px",
  color: "#64748b"
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


{day.mealMode === "chips" &&
  (day.meals || []).length > 0 && (

  <div
    style={{
      marginTop: "6px",
      marginBottom: "6px",
      width: "100%",
      textAlign: "left"
    }}
  >

    {day.meals.map((meal, i) => (

      <div
        key={`${meal}-${i}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          width: "100%",
          boxSizing: "border-box",
          marginBottom: "3px",
          fontSize: "11px",
          color: "#475569",
          textAlign: "left"
        }}
      >

        <span
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "left"
          }}
        >
          • {meal}
        </span>


        <button
          type="button"
          style={{
            border: "1px solid #ef4444",
            background: "#ffffff",
            color: "#ef4444",
            borderRadius: "5px",
            width: "24px",
            height: "24px",
            padding: "0",
            fontSize: "12px",
            lineHeight: "22px",
            cursor: "pointer",
            flexShrink: 0
          }}

          onClick={() => {

            const updated =
              [...(itineraryData.itinerary || [])];

            updated[index].meals =
              updated[index].meals.filter(
                (_, idx) => idx !== i
              );

            setItineraryData({
              ...itineraryData,
              itinerary: updated
            });

          }}
        >
          ×
        </button>

      </div>

    ))}

  </div>

)}

{day.mealMode === "text" && (

  <div
    style={{
      marginTop: "6px",
      height: "95px",
      overflow: "hidden"
    }}
  >

    <SightseeingRichTextEditor
      key={`meal-text-${index}-${day.day || index}`}

      value={
        day.mealRichText ||
        day.mealText ||
        ""
      }

      onChange={(html) => {

        const updated = [
          ...(itineraryData.itinerary || [])
        ];

        const temp =
          document.createElement("div");

        temp.innerHTML =
          html;

        const plainText =
          temp.innerText
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");

        updated[index] = {
          ...updated[index],

          mealRichText:
            html,

          mealText:
            plainText
        };

        setItineraryData({
          ...itineraryData,
          itinerary: updated
        });

      }}

      preserveLineBreaks={true}
    />

  </div>

)}





<div
  style={{
   display:
  (day.mealMode || "chips") === "chips"
    ? "flex"
    : "none",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px"
  }}
>

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
  flex: 1,
  minWidth: 0,
  padding: "7px 9px",
  fontSize: "12px",
  boxSizing: "border-box"
}}
/>

<button
  type="button"
  style={{
  padding: "7px 12px",
  border: "1px solid #0f766e",
  borderRadius: "6px",
  background: "#0f766e",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap"
}}
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
+ Add
</button>

</div>
{(day.customMeals || []).length > 0 && (

<div
  style={{
  marginTop: "8px",
  width: "100%",
  textAlign: "left"
}}
>

{day.customMeals.map((meal, i) => (

<div
key={i}
style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6px",
  width: "100%",
  boxSizing: "border-box",
  marginBottom: "3px",
  fontSize: "11px",
  color: "#475569",
  textAlign: "left"
}}
>

<span
  style={{
    flex: 1,
    minWidth: 0
  }}
>
  • {meal}
</span>

<button
type="button"
style={{
  border: "1px solid #ef4444",
  background: "#ffffff",
  color: "#ef4444",
  borderRadius: "5px",
  width: "24px",
  height: "24px",
  padding: "0",
  fontSize: "12px",
  lineHeight: "22px",
  cursor: "pointer",
  flexShrink: 0
}}

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
×
</button>

</div>

))}

</div>

)}

</div>



<div
  style={{
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#f8fafc",
    boxSizing: "border-box"
  }}
>

 <h4
  style={{
    margin: "0 0 8px 0",
    paddingBottom: "7px",
    borderBottom: "1px solid #dbe3ea",
    color: "#287c73",
    fontSize: "13px",
    fontWeight: 800,
    textAlign: "left"
  }}
>
  🚐 Transfers
</h4>

<div
  style={{
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "7px",
  fontSize: "12px",
  color: "#64748b"
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
  padding: "7px 9px",
  height: "32px",
  border: "1px solid #a3a3a3",
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  boxSizing: "border-box",
  fontSize: "12px",
  color: "#64748b"
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


{(day.transferMode || "chips") === "chips" &&
  (day.transfers || []).length > 0 && (

  <div
    style={{
      marginTop: "6px",
      marginBottom: "6px",
      width: "100%",
      textAlign: "left"
    }}
  >

    {day.transfers.map((transfer, i) => (

      <div
        key={`${transfer}-${i}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          width: "100%",
          boxSizing: "border-box",
          marginBottom: "3px",
          fontSize: "11px",
          color: "#475569",
          textAlign: "left"
        }}
      >

        <span
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "left"
          }}
        >
          • {transfer}
        </span>

        <button
          type="button"
          style={{
            border: "1px solid #ef4444",
            background: "#ffffff",
            color: "#ef4444",
            borderRadius: "5px",
            width: "24px",
            height: "24px",
            padding: "0",
            fontSize: "12px",
            lineHeight: "22px",
            cursor: "pointer",
            flexShrink: 0
          }}
          onClick={() => {

            const updated =
              [...(itineraryData.itinerary || [])];

            updated[index].transfers =
              updated[index].transfers.filter(
                (_, idx) => idx !== i
              );

            setItineraryData({
              ...itineraryData,
              itinerary: updated
            });

          }}
        >
          ×
        </button>

      </div>

    ))}

  </div>

)}


{(day.transferMode || "chips") === "text" && (

  <div
    style={{
      marginTop: "6px",
      height: "95px",
      overflow: "hidden"
    }}
  >

    <SightseeingRichTextEditor

    key={`transfer-text-${index}-${day.day || index}`}

    value={
        day.transferRichText ||
        day.transferText ||
        ""
    }

    onChange={(html) => {

        const updated = [
            ...(itineraryData.itinerary || [])
        ];

        const temp =
            document.createElement("div");

        temp.innerHTML =
            html;

        const plainText =
            temp.innerText
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n");

        updated[index] = {
            ...updated[index],

            /*
             * Rich formatted version
             */
            transferRichText:
                html,

            /*
             * Existing compatibility field
             */
            transferText:
                plainText
        };

        setItineraryData({
            ...itineraryData,
            itinerary: updated
        });

    }}

    preserveLineBreaks={true}
/>
 </div>
)}

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px"
  }}
>

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
  flex: 1,
  minWidth: 0,
  padding: "7px 9px",
  fontSize: "12px",
  boxSizing: "border-box"
}}
  />

  <button
    type="button"
    style={{
  padding: "7px 12px",
  border: "1px solid #0f766e",
  borderRadius: "6px",
  background: "#0f766e",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap"
}}
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
   + Add
  </button>

</div>
{(day.customTransfers || []).length > 0 && (

<div
  style={{
    marginTop: "8px",
    width: "100%",
    textAlign: "left"
  }}
>

  {day.customTransfers.map((item, i) => (

    <div
      key={i}
      style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6px",
  width: "100%",
  boxSizing: "border-box",
  marginBottom: "3px",
  fontSize: "11px",
  color: "#475569",
  textAlign: "left"
}}
    >

      <span
  style={{
    flex: 1,
    minWidth: 0
  }}
>
  • {item}
</span>

      <button
        type="button"
        style={{
  border: "1px solid #ef4444",
  background: "#ffffff",
  color: "#ef4444",
  borderRadius: "5px",
  width: "24px",
  height: "24px",
  padding: "0",
  fontSize: "12px",
  lineHeight: "22px",
  cursor: "pointer",
  flexShrink: 0
}}

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
        ×
      </button>

    </div>

  ))}

</div>

)}

 </div>

  </div>

   </div>

   );

  }
)}

<div
  style={{
    textAlign: "left"
  }}
>
  <button
  type="button"
  onClick={addDay}
  style={{
  marginTop: "8px",
  marginBottom: "12px",
  padding: "7px 16px",
  border: "1px solid #4F46A5",
  borderRadius: "999px",
  background: "#4F46A5",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
  lineHeight: "1"
}}
>
  + Add Day
</button>
</div>

<ItineraryTemplateLibrary
  open={showTemplateLibrary}
  onClose={() =>
    setShowTemplateLibrary(false)
  }
  onSelectTemplate={(template) => {

    console.log(
      "Selected itinerary template:",
      template
    );

    setShowTemplateLibrary(false);

  }}
/>

</div>
);
}