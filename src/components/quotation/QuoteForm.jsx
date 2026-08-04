

import { useState } from "react";
import hotels from "../../data/hotels.json";
import HotelSelector from "./HotelSelector";
import SightseeingSelector from "./SightseeingSelector";
import TransferSelector from "./TransferSelector";
import MealSelector from "./MealSelector";
import VisaSelector from "./VisaSelector";
import ItineraryBuilder from "./ItineraryBuilder";
import InclusionSelector from "./InclusionSelector";
import ExclusionSelector from "./ExclusionSelector";
import CostCalculator from "./CostCalculator";
import CancellationPolicyEditor from "./CancellationPolicyEditor";


export default function QuoteForm(props) {
  console.log("QuoteForm props =", props);

  const {
    commonData,
    setCommonData,
    packageData,
    setPackageData,
    itineraryData,
    setItineraryData
  } = props;


const quoteData = {
    ...(commonData || {}),
    ...(packageData || {}),
    ...(itineraryData || {})
  };

// ===================================
// Cancellation Policy Accordion
// ===================================

const [expandedPolicyId, setExpandedPolicyId] =
  useState(1);

  const [deletePolicyId, setDeletePolicyId] =
    useState(null);

  function handleAddPolicy() {

  const newPolicy = {

    id: Date.now(),

    title: "",

    text: "",

    isCustom: true

  };

  const updatedPolicies = [

    ...(commonData.cancellationRefundPolicy || []),

    newPolicy

  ];

  setCommonData({

    ...commonData,

    cancellationRefundPolicy: updatedPolicies

  });

  // Automatically open the newly added policy
  setExpandedPolicyId(newPolicy.id);

}

function handleDeletePolicy(policyId) {

  const updatedPolicies =
    commonData.cancellationRefundPolicy.filter(
      policy => policy.id !== policyId
    );

  setCommonData({

    ...commonData,

    cancellationRefundPolicy:
      updatedPolicies

  });

  // If the deleted policy was open,
  // collapse the accordion.

  if (expandedPolicyId === policyId) {

    setExpandedPolicyId(null);

  }

}

function movePolicyUp(policyId) {

  const policies = [
    ...(commonData.cancellationRefundPolicy || [])
  ];

  const index =
    policies.findIndex(
      p => p.id === policyId
    );

  // Already first?
  if (index <= 0) return;

  // Swap with previous
  [
    policies[index - 1],
    policies[index]
  ] = [
    policies[index],
    policies[index - 1]
  ];

  setCommonData({

    ...commonData,

    cancellationRefundPolicy:
      policies

  });

}

function movePolicyDown(policyId) {

  const policies = [
    ...(commonData.cancellationRefundPolicy || [])
  ];

  const index =
    policies.findIndex(
      p => p.id === policyId
    );

  // Already last?
  if (index === policies.length - 1) return;

  // Swap with next
  [
    policies[index],
    policies[index + 1]
  ] = [
    policies[index + 1],
    policies[index]
  ];

  setCommonData({

    ...commonData,

    cancellationRefundPolicy:
      policies

  });

}
  

  const destinationHotels =
  hotels?.[commonData?.destination] || {};

  const allHotels = Object.values(
    destinationHotels
  ).flat();

  const cities = [
    ...new Set(
      allHotels.map(
        (hotel) => hotel.city
      )
    )
  ].sort();

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  };

  

return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        DMC Quotation Form
      </h2>

      {/* QUOTATION MODE */}

<h3>Quotation Type</h3>


<select
 value={commonData?.quoteMode || ""}
  onChange={(e) =>
    setCommonData({
      ...commonData,
      quoteMode: e.target.value
    })
  }
  style={inputStyle}
>
<option value="package">
    General Package Details
  </option>

  <option value="itinerary">
    Day Wise Itinerary
  </option>
</select>
{commonData?.quoteMode === "itinerary" && (

  <label
    style={{
      display: "block",
      marginBottom: "15px"
    }}
  >
    <input
      type="checkbox"
      checked={
        commonData?.showInclusionExclusion || false
      }
      onChange={(e) =>
        setCommonData({
          ...commonData,
          showInclusionExclusion:
            e.target.checked
        })
      }
    />

    {" "}
    Include Inclusions & Exclusions
  </label>

)}

  

       {/* CLIENT DETAILS */}
      <h3>📋Client Details</h3>

      <input
        placeholder="Client Name"
        value={commonData?.clientName}
        onChange={(e) =>
          setCommonData({
  ...commonData,
  clientName: e.target.value
})
        }
        style={inputStyle}
      />

      <input
        placeholder="Mobile Number"
        value={commonData?.mobile}
        onChange={(e) =>
          setCommonData({
  ...commonData,
            mobile: e.target.value
          })
        }
        style={inputStyle}
      />

      <input
        placeholder="Email"
        value={commonData?.email}
        onChange={(e) =>
          setCommonData({
  ...commonData,
            email: e.target.value
          })
        }
        style={inputStyle}
      />

      {/* TOUR DETAILS */}
     <h3>
  🌍 Tour Details
</h3>

      <select
  value={commonData?.destination || ""}
  onChange={(e) => {

  setCommonData({
    ...commonData,
    destination: e.target.value,
    customDestination: "",   // Clear custom destination
    city: "",
  });




  setPackageData({
    ...packageData,

    selectedHotels: [],
   
    sightseeing: [],
    customSightseeing: [],

    transfers: [],
    customTransfers: [],

    meals: [],
    customMeals: [],

    visaServices: [],
    customVisaServices: []
  });

  setItineraryData({
    ...itineraryData,
    itinerary: [
      {
        day: 1,
        title: "",
         city: "",
        description: "",

        hotelSource: "database",

        hotel: "",
        customHotel: "",
        hotelDisplayCategory: "",

        hotelCategory: "",
        roomType: "",
        mealPlan: "",

        sightseeing: [],
        meals: [],
        transfers: []
      }
    ]
  });

}}
  style={inputStyle}
>
  <option value="">Select Destination</option>

  <optgroup label="Domestic">
  <option value="Kashmir">Kashmir</option>
  <option value="Kerala">Kerala</option>
  <option value="Goa">Goa</option>
  <option value="Rajasthan">Rajasthan</option>
  <option value="Sikkim">Sikkim</option>
  <option value="Andaman">Andaman</option>
  <option value="Ladakh">Ladakh</option>
  <option value="Madhya Pradesh">Madhya Pradesh</option>
</optgroup>

  <optgroup label="International">
    <option value="Sri Lanka">Sri Lanka</option>
    <option value="Thailand">Thailand</option>
    <option value="Dubai">Dubai</option>
    <option value="Singapore">Singapore</option>
    <option value="Malaysia">Malaysia</option>
    <option value="Bali">Bali</option>
    <option value="Vietnam">Vietnam</option>
    <option value="Maldives">Maldives</option>
  </optgroup>
</select>

<input
  type="text"
  placeholder="Custom Destination (Optional)"
 value={commonData?.customDestination || ""}

onChange={(e) =>
  setCommonData({
    ...commonData,
    customDestination: e.target.value,
    destination: "",        // Reset dropdown to "Select Destination"
    city: "",
  })
}
  style={{
    width: "100%",
    marginTop: "10px",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  }}
/>


      <div style={{ marginBottom: "15px" }}>

  <label
    style={{
      display: "block",
      marginBottom: "6px",
      fontWeight: "600"
    }}
  >
    📅 Travel Dates
  </label>

  <div
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "center"
    }}
  >

    <input
      type="date"
      value={commonData?.travelFrom || ""}
      onChange={(e) =>
        setCommonData({
          ...commonData,
          travelFrom: e.target.value
        })
      }
      style={{
        ...inputStyle,
        flex: 1,
        marginBottom: 0
      }}
    />

    <span>→</span>

    <input
      type="date"
      value={commonData?.travelTo || ""}
      onChange={(e) => {

        const travelTo = e.target.value;

        let totalDays = "";
        let totalNights = "";

        if (
          commonData.travelFrom &&
          travelTo
        ) {

          const from =
            new Date(commonData.travelFrom);

          const to =
            new Date(travelTo);

          const diffDays =
            Math.ceil(
              (to - from) /
              (1000 * 60 * 60 * 24)
            ) + 1;

          totalDays = diffDays;
          totalNights =
            Math.max(diffDays - 1, 0);
        }

        setCommonData({
          ...commonData,
          travelTo,
          totalDays,
          totalNights
        });

      }}
      style={{
        ...inputStyle,
        flex: 1,
        marginBottom: 0
      }}
    />

  </div>

</div>

<h3 style={{ marginTop: "20px" }}>
  🕒 Tour Duration
</h3>

<div
  style={{
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#f9fafb",
    fontWeight: "600",
    textAlign: "center"
  }}
>
  {commonData?.totalDays || 0}
  {" "}
  Days
  {" "}
  /
  {" "}
  {commonData?.totalNights || 0}
  {" "}
  Nights
</div>
     <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "15px"
  }}
>
   <div style={{ flex: 1 }}>
    <label
      style={{
        display: "block",
        marginBottom: "4px",
        fontSize: "14px",
        fontWeight: "600"
      }}
    >
      Adult Pax
    </label>

  <input
    type="number"
    value={commonData?.adults}
    onChange={(e) =>
      setCommonData({
        ...commonData,
        adults: e.target.value
      })
    }
     style={inputStyle}
    />
    </div>
    <div style={{ flex: 1 }}>
    <label
      style={{
        display: "block",
        marginBottom: "4px",
        fontSize: "14px",
        fontWeight: "600"
      }}
    >
      Child Pax
    </label>

  <input
    type="number"
    value={commonData?.children}
    onChange={(e) =>
      setCommonData({
        ...commonData,
        children: e.target.value
      })
    }
    style={inputStyle}
    />
     </div>

</div>
      

      {(
    commonData?.quoteMode === "package" ||
    commonData?.quoteMode === "itinerary"
) && (
  <>
    <input
  type="text"
  placeholder="Accommodation"
  value={packageData.accommodation || ""}
  onChange={(e) =>
    setPackageData({
      ...packageData,
      accommodation: e.target.value
    })
  }
  style={inputStyle}
/>

{commonData?.quoteMode === "package" && (
  <>    
    <SightseeingSelector
  commonData={commonData}

  packageData={packageData}
  setPackageData={setPackageData}
/>

<TransferSelector
  commonData={commonData}

  packageData={packageData}
  setPackageData={setPackageData}
/>


<MealSelector
  commonData={commonData}

  packageData={packageData}
  setPackageData={setPackageData}
/>

<VisaSelector
 commonData={commonData}

  packageData={packageData}
  setPackageData={setPackageData}
/>
</>
)}
  </>
)}

{(
  commonData?.quoteMode === "package" ||
  commonData?.showInclusionExclusion
) && (
  <>
    <InclusionSelector
      commonData={commonData}
      packageData={packageData}
      setPackageData={setPackageData}
    />

    <ExclusionSelector
      commonData={commonData}
      packageData={packageData}
      setPackageData={setPackageData}
    />
  </>
)}
{commonData?.quoteMode === "itinerary" && (
  <ItineraryBuilder
    commonData={commonData}
    packageData={packageData}
    itineraryData={itineraryData}
    setItineraryData={setItineraryData}
  />
)}

<h3
  style={{
    marginTop: "20px",
    marginBottom: "12px"
  }}
>
  Cancellation & Refund Policy
</h3>

<CancellationPolicyEditor
    commonData={commonData}
    setCommonData={setCommonData}
/>



<hr style={{ margin: "20px 0" }} />

<h3>📄 Special Notes (Optional)</h3>

<textarea
  placeholder="Enter notes separated by commas. Example: Honeymoon Cake Included, Early Check-in Requested, Rooms on Higher Floor"
  value={commonData?.specialNotes || ""}
  onChange={(e) =>
    setCommonData({
      ...commonData,
      specialNotes: e.target.value,
    })
  }
  rows={3}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    resize: "vertical",
  }}
/>

      {/* COSTING */}
<h3>💰Costing</h3>

<CostCalculator
  commonData={commonData}
  setCommonData={setCommonData}
/>
{/* VEHICLE COSTING */}

<h3>🚗 Vehicle Costing</h3>

<label
  style={{
    display: "block",
    marginBottom: "10px"
  }}
>
  <input
    type="checkbox"
    checked={commonData?.useVehicleCosting || false}
    onChange={(e) =>
      setCommonData({
        ...commonData,
        useVehicleCosting: e.target.checked,

        ...(e.target.checked
  ? {}
  : {
      vehicleCosts: [
        {
          id: Date.now(),
          vehicle: "",
          cost: ""
        }
      ]
    })
      })
    }
  />
  {" "}
  Use Vehicle Based Costing
</label>

{commonData?.useVehicleCosting && (
  <>
  <h4 style={{ marginBottom: "12px" }}>
      Vehicle Package Costs
    </h4>
    {(commonData.vehicleCosts || []).map((vehicle) => (
      <div
        key={vehicle.id}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          placeholder="Vehicle Name"
          value={vehicle.vehicle}
          onChange={(e) => {
            setCommonData({
              ...commonData,
              vehicleCosts: commonData.vehicleCosts.map(v =>
                v.id === vehicle.id
                  ? { ...v, vehicle: e.target.value }
                  : v
              )
            });
          }}
          style={{
            ...inputStyle,
            flex: 2
          }}
        />

        <input
          type="number"
          placeholder="Package Cost"
          value={vehicle.cost}
          onChange={(e) => {
            setCommonData({
              ...commonData,
              vehicleCosts: commonData.vehicleCosts.map(v =>
                v.id === vehicle.id
                  ? { ...v, cost: e.target.value }
                  : v
              )
            });
          }}
          style={{
            ...inputStyle,
            flex: 1
          }}
        />

        <button
          type="button"
          onClick={() =>
            setCommonData({
              ...commonData,
              vehicleCosts:
                commonData.vehicleCosts.filter(
                  v => v.id !== vehicle.id
                )
            })
          }
        >
          ❌
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={() =>
        setCommonData({
          ...commonData,
          vehicleCosts: [
            ...commonData.vehicleCosts,
            {
              id: Date.now(),
              vehicle: "",
              cost: ""
            }
          ]
        })
      }
    >
      ➕ Add Vehicle
    </button>
  </>
)}

<div
  style={{
    marginTop: "15px",
    padding: "15px",
    background: "#ecfdf5",
    borderRadius: "10px",
    border: "1px solid #10b981"
  }}
>
  <h3 style={{ marginTop: 0 }}>
    Profit Summary
  </h3>

  <p>
  Estimated Profit:
  <strong>
    {" "}
    ₹
    {(
      (
        Number(commonData?.perAdultCost || 0) *
        Number(commonData?.adults || 0) +
        Number(commonData?.perChildCost || 0) *
        Number(commonData?.children || 0)
      ) *
      Number(commonData?.markupPercent || 0) /
      100
    ).toLocaleString()}
  </strong>
</p>
</div>

    </div>
  );
}

