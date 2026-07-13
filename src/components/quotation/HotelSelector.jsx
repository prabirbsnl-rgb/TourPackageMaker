import { useState } from "react";
import hotels from "../../data/hotels.json";

export default function HotelSelector({
  commonData,
  packageData,
  setPackageData
})
{
  const [customHotel, setCustomHotel] =
    useState("");

  const destinationHotels =
    hotels[commonData.destination] || {};

  const hotelList =
  (
    destinationHotels[
      packageData.hotelCategory
    ] || []
  ).filter(
    (hotel) =>
      hotel.city === commonData.city
  );

  return (
    <div>
      <p>
  Destination: {commonData.destination}
</p>

<p>
  Category: {packageData.hotelCategory}
</p>

<p>
  Hotels Found: {hotelList.length}
</p>
      <h3>Available Hotels</h3>

      {hotelList.length === 0 && (
        <p>No hotels available</p>
      )}

      {hotelList.map((hotel) => (
  <label
    key={hotel.hotelName}
    style={{
      display: "block",
      marginBottom: "10px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "8px"
    }}
  >
    <input
      type="checkbox"
      checked={
        packageData.selectedHotels?.some(
          (h) => h.hotelName === hotel.hotelName
        ) || false
      }
      onChange={(e) => {
        const selected =
          packageData.selectedHotels || [];

        if (e.target.checked) {

  const hotelWithCategory = {
    ...hotel,
    hotelCategory:
      packageData.hotelCategory
  };

  setPackageData({
  ...packageData,
  selectedHotels: [
    ...selected,
    hotelWithCategory
  ]
});

    } else {
          setPackageData({
              ...packageData,
            selectedHotels:
              selected.filter(
                (h) =>
                  h.hotelName !== hotel.hotelName
              )
          });
        }
      }}
    />

    {" "}
    <strong>{hotel.hotelName}</strong>

    <br />

    {hotel.city} | {hotel.roomType}

    <br />

    {hotel.mealPlan}

    <br />

    Selling: ₹{hotel.sellingCost}
  </label>
))}
<hr style={{ margin: "20px 0" }} />

<h3>Custom Hotel</h3>

<input
  type="text"
  placeholder="Enter custom hotel"
  value={customHotel}
  onChange={(e) =>
    setCustomHotel(
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

    if (!customHotel.trim())
      return;

    setPackageData({
      ...packageData,
      customHotels: [
        ...(packageData.customHotels || []),
        {
          hotelName: customHotel,
          city: commonData.city,
          roomType: "Custom",
          mealPlan: "Custom"
        }
      ]
    });

    setCustomHotel("");

  }}
>
  Add Hotel
</button>

{(packageData.customHotels || [])
  .length > 0 && (

  <>
    <h4
      style={{
        marginTop: "15px"
      }}
    >
      Custom Hotels
    </h4>

    <ul>
  {(packageData.customHotels|| []).map(
    (hotel, index) => (
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
          {hotel.hotelName}
        </span>

        <button
          type="button"
          onClick={() => {

            setPackageData({
             ...packageData,
              customHotels:
                packageData.customHotels.filter(
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
);
}