import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const destinationColors = {
    Kerala: '#22c55e',
    Kashmir: '#38bdf8',
    Meghalaya: '#10b981',
    Goa: '#f97316',
    Andaman: '#06b6d4',
    Ladakh: '#eab308',
    'Leh Ladakh via Kashmir': '#fffafa',
    Sikkim: '#84cc16',
    Rajasthan: '#f59e0b',
    Singapore: '#ef4444',
    Malaysia: '#8b5cf6',
    Thailand: '#ec4899',
    Dubai: '#facc15',
    Bali: '#fb7185',
    'Sri Lanka': '#14b8a6',
    Maldives: '#0ea5e5',
    Vietnam: '#dc2626'
  };
const badgeColors = {
  'best seller': '#b91c1c',
  'honeymoon special': '#fb7185',
  'luxury retreat': '#a78bfa',
  'family special': '#38bdf8',
  'summer special': '#f97316',
  'early bird offer': '#4ade80',
  'limited offer': '#ef4444',
  'group departure': '#22c55e'
};
const destinationFlags = {
  Kerala: '/flags/india.png',
  Kashmir: '/flags/india.png',
  Goa: '/flags/india.png',
  Rajasthan: '/flags/india.png',
  Andaman: '/flags/india.png',
  Himachal: '/flags/india.png',
  Sikkim: '/flags/india.png',
  Ladakh: '/flags/india.png',
  'Leh Ladakh via Kashmir': '/flags/india.png',
  Darjeeling: '/flags/india.png',

  Thailand: '/flags/thailand.png',
  Bali: '/flags/indonesia.png',
  Vietnam: '/flags/vietnam.png',
  Dubai: '/flags/uae.png',
  Singapore: '/flags/singapore.png',
  Maldives: '/flags/maldives.png',
  Japan: '/flags/japan.png',
  Europe: '/flags/europe.png',
  Switzerland: '/flags/switzerland.png',
  Turkey: '/flags/turkey.png',
  Bhutan: '/flags/bhutan.png',
  Nepal: '/flags/nepal.png',
  Mauritius: '/flags/mauritius.png',
  'Sri Lanka': '/flags/srilanka.png'
};
export default function TourPackageMaker() {
  const packageRef = useRef(null);

  // Reusable heading component
  const Heading = ({ children }) => (
    <strong
      style={{
        color: '#facc15',
        borderBottom: '2px solid #facc15',
        paddingBottom: '4px',
        display: 'inline-block',
        textAlign: 'center'
      }}
    >
      ★ {children} ★
    </strong>
  );

  const domesticDestinations = [
    'Kerala','Kashmir','Meghalaya','Goa','Andaman','Ladakh','Leh Ladakh via Kashmir','Sikkim','Rajasthan'
  ];

  const internationalDestinations = [
    'Singapore','Malaysia','Thailand','Dubai','Bali','Sri Lanka','Maldives','Vietnam'
  ];

  const sightseeingMap = {
    Kerala: ['Munnar','Alleppey','Thekkady','Kovalam','Wayanad','Athirapally'],
    Kashmir: ['Srinagar','Gulmarg','Pahalgam','Sonmarg','Dal Lake','Mughal Gardens'],
    Meghalaya: ['Shillong','Cherrapunji','Dawki','Mawlynnong','Laitlum Canyon','Nohkalikai Falls'],
    Goa: ['Baga Beach','Calangute','Dudhsagar Falls','Fort Aguada','Candolim','Anjuna Beach'],
    Andaman: ['Havelock Island','Neil Island','Cellular Jail','Radhanagar Beach','Ross Island','Baratang Island'],
    Ladakh: ['Pangong Lake','Nubra Valley','Magnetic Hill','Khardung La','Leh Palace','Shanti Stupa'],
    'Leh Ladakh via Kashmir': ['Srinagar','Sonmarg','Drass','Kargil','Leh','Nubra Valley','Pangong Lake','Magnetic Hill','Khardung La'],
    Sikkim: ['Gangtok','Tsomgo Lake','Nathula Pass','Pelling','Lachung','Yumthang Valley'],
    Rajasthan: ['Jaipur','Udaipur','Jaisalmer','Mount Abu','Pushkar','Chittorgarh'],
    Singapore: ['Sentosa','Universal Studios','Marina Bay Sands','Gardens by the Bay','Merlion Park','Night Safari'],
    Malaysia: ['Kuala Lumpur','Genting Highlands','Langkawi','Batu Caves','Petronas Towers','Sunway Lagoon'],
    Thailand: ['Phuket','Krabi','Pattaya','Bangkok','Phi Phi Island','Coral Island'],
    Dubai: ['Burj Khalifa','Desert Safari','Dubai Mall','Palm Jumeirah','Dubai Frame','Marina Cruise'],
    Bali: ['Ubud','Kuta Beach','Nusa Penida','Tanah Lot','Seminyak','Uluwatu Temple'],
    'Sri Lanka': ['Kandy','Bentota','Colombo','Nuwara Eliya','Sigiriya','Galle'],
    Maldives: ['Male City','Water Villa','Private Beaches','Snorkeling','Luxury Resorts','Sunset Cruise'],
    Vietnam: ['Hanoi','Halong Bay','Da Nang','Hoi An','Ho Chi Minh City','Ba Na Hills']
  };

  const destinationImages = {
    Kerala: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=60',
    Kashmir:'https://images.unsplash.com/photo-1614591276564-7b3e69347a48?auto=format&fit=crop&w=1200&q=80',
    Meghalaya: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1400&q=90',
    Goa: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=90',
    Andaman:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60',
    Ladakh: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=60',
    'Leh Ladakh via Kashmir': '/leh-ladakh.png',
    Sikkim: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1200&q=60',
    Rajasthan: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=60',
    Singapore: 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?auto=format&fit=crop&w=1200&q=60',
    Malaysia: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=60',
    Thailand: 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=60',
    Dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=60',
    Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=60',
    'Sri Lanka': 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=1200&q=60',
   Maldives: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1600&auto=format&fit=crop',
    Vietnam: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1400&q=90'
  };
  const [offerBadge, setOfferBadge] = useState('');
  const [destination, setDestination] = useState('Kerala');
  
  
  const normalizeBadge = (text) =>
  (text || '')
    .toString()
    .trim()
    .toLowerCase();
  
  const [days, setDays] = useState('4 Days');
  const [nights, setNights] = useState('3 Nights');
  
   
  const [fromDate, setFromDate] = useState('2026-06-01');
  const [toDate, setToDate] = useState('2026-06-05');
  
const [isFixedDeparture, setIsFixedDeparture] = useState(false);
const [fixedDepartureDate, setFixedDepartureDate] = useState('');
const [fixedDepartureInput, setFixedDepartureInput] = useState('');
const [fixedDepartureDates, setFixedDepartureDates] = useState([]);
  
  const [adultPax, setAdultPax] = useState('2 Adults');
  const [childPax, setChildPax] = useState('0 Child');

  const [showSightseeing, setShowSightseeing] = useState(false);
  
  const [showAdultDropdown, setShowAdultDropdown] = useState(false);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  
  const [showSightseeingDropdown, setShowSightseeingDropdown] = useState(false);

  const [hotelCategory, setHotelCategory] = useState('4★ Hotel');
  const [meals, setMeals] = useState('Breakfast Included');
  const [hideMealsSection, setHideMealsSection] = useState(false);
  const [includes, setIncludes] = useState('Hotel, Transfers, Sightseeing');

  const [includingFlight, setIncludingFlight] = useState(false);
const [excludingFlight, setExcludingFlight] = useState(false);

  const [price, setPrice] = useState('24999');
  const [currency, setCurrency] = useState('₹');

  const [selectedSightseeing, setSelectedSightseeing] = useState([]);
  const [manualSightseeing, setManualSightseeing] = useState('');

  const calculateDuration = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    if (start && end && end >= start) {
      const diff = end - start;
      const totalDays = Math.ceil(diff / (1000*60*60*24)) + 1;
      const totalNights = totalDays - 1;
      setDays(`${totalDays}D`);
      setNights(`${totalNights}N`);
    }
  };

  const sightseeingOptions = sightseeingMap[destination] || ['Sightseeing Included'];

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getFullYear()).slice(-2)}`;
  };

  const inputStyle = {
    width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #d1d5db',marginTop:'8px',marginBottom:'16px',fontSize:'13px'
  };
  const selectWrapperStyle = {
  position: 'relative'
};

const selectArrowStyle = {
  position: 'absolute',
  right: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: '#6b7280',
  fontSize: '12px'
};

const customSelectStyle = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  paddingRight: '36px',
  background: '#fff'
};

  const downloadPNG = async () => {
    const canvas = await html2canvas(packageRef.current,{useCORS:true,scale:2});
    const image = canvas.toDataURL('image/png');
    const link=document.createElement('a');
    link.href=image;
    link.download=`${destination}-tour-package.png`;
    link.click();
  };

  const shareWhatsApp = () => {
    const msg=`Explore ${destination} with Orbitz Holidays! Package Starting From ${price} Per Person.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
  };
  
  const leftLabelStyle = {
    fontWeight: '900',
    fontSize: '15px',
    color: '#111827',
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '0.3px'
  };

  return (
    <div
  style={{
    minHeight:'100vh',
    background:'#111827',
    padding:'24px',
    fontFamily:'Arial',
    overflowX:'hidden'
  }}
>
      <h1 style={{textAlign:'center',color:'#fff',marginBottom:'30px',fontSize:'34px'}}>
        Orbitz Holidays Tour Package Maker
      </h1>

      <div
  style={{
    display:'grid',
    gridTemplateColumns:'420px 1fr',
    gap:'30px',
    alignItems:'start'
  }}
>

        {/* FORM */}
      <div
  style={{
    background:'#fff',
    padding:'25px',
    borderRadius:'20px',
    textAlign:'left',
    height:'100%',
    alignSelf:'stretch'
  }}
     >   
          <label style={leftLabelStyle}>🌍 Destination</label>
          <div style={selectWrapperStyle}>
  <select
    value={destination}
    onChange={(e) => {
  setDestination(e.target.value);

  // reset sightseeing
  setSelectedSightseeing([]);

  // reset manual sightseeing if you have it
  setManualSightseeing("");
}}
    style={customSelectStyle}
  >
    <optgroup label='Domestic'>
      {domesticDestinations.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </optgroup>

    <optgroup label='International'>
      {internationalDestinations.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </optgroup>
  </select>

  <span style={selectArrowStyle}>▼</span>
            
</div>
          <label
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600'
  }}
>
  📅 Date of Journey
</label>

<div
  style={{
    display: 'flex',
    gap: '15px',
    width: '100%',
    flexWrap: 'wrap'
  }}
>

  {/* FROM DATE */}
  <div
  style={{
    flex: 1,
    minWidth: 0
  }}
>
    <p
      style={{
        margin: '0 0 6px 2px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151'
      }}
    >
      From
    </p>

    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type='date'
        value={fromDate}
        onChange={(e) => {
          setFromDate(e.target.value);
          calculateDuration(e.target.value, toDate);
        }}
        style={{
          ...inputStyle,
         paddingRight: '14px',
boxSizing: 'border-box'
        }}
      />

      
    </div>
  </div>

  {/* TO DATE */}
  <div
  style={{
    flex: 1,
    minWidth: 0
  }}
>
    <p
      style={{
        margin: '0 0 6px 2px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151'
      }}
    >
      To
    </p>

    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type='date'
        value={toDate}
        onChange={(e) => {
          setToDate(e.target.value);
          calculateDuration(fromDate, e.target.value);
        }}
        style={{
          ...inputStyle,
          paddingRight: '14px',
boxSizing: 'border-box'
        }}
      />

      
    </div>
  </div>

</div>
       {/* FIXED DEPARTURE */}
{/* FIXED DEPARTURE */}
<div
  style={{
    marginTop: '18px',
    marginBottom: '18px'
  }}
>

  <div
    style={{
      display:'flex',
      alignItems:'center',
      gap:'10px',
      flexWrap:'wrap'
    }}
  >
    <label
      style={{
        display:'flex',
        alignItems:'center',
        gap:'8px',
        fontWeight:'600',
        whiteSpace:'nowrap'
      }}
    >
      <input
        type="checkbox"
        checked={isFixedDeparture}
        onChange={(e) =>
          setIsFixedDeparture(e.target.checked)
        }
      />

      📅 Fixed Departure
    </label>

    {isFixedDeparture && (
      <>
        <input
          type="date"
          value={fixedDepartureInput}
          onChange={(e) =>
            setFixedDepartureInput(e.target.value)
          }
          style={{
            padding:'8px 10px',
            borderRadius:'8px',
            border:'1px solid #d1d5db',
            fontSize:'14px'
          }}
        />

        <button
          type="button"
          onClick={() => {
            if (
              fixedDepartureInput &&
              !fixedDepartureDates.includes(fixedDepartureInput)
            ) {
              setFixedDepartureDates([
                ...fixedDepartureDates,
                fixedDepartureInput
              ]);

              setFixedDepartureInput('');
            }
          }}
          style={{
            padding:'8px 14px',
            border:'none',
            borderRadius:'8px',
            background:'#2563eb',
            color:'#fff',
            cursor:'pointer',
            fontWeight:'600'
          }}
        >
          Add
        </button>
      </>
    )}

  </div>

  {/* DATE TAGS */}
  {fixedDepartureDates.length > 0 && (
    <div
      style={{
        display:'flex',
        flexWrap:'wrap',
        gap:'8px',
        marginTop:'10px'
      }}
    >
      {fixedDepartureDates.map((date,index) => (
  <div
    key={index}
    style={{
      display:'flex',
      alignItems:'center',
      gap:'8px',

      background:'#e0e7ff',
      color:'#1e3a8a',

      padding:'6px 10px',

      borderRadius:'999px',

      fontSize:'12px',

      fontWeight:'600'
    }}
  >
    <span>
      📅 {new Date(date).toLocaleDateString('en-GB')}
    </span>

    <span
      onClick={() => {
        setFixedDepartureDates(
          fixedDepartureDates.filter((_,i) => i !== index)
        );
      }}
      style={{
        cursor:'pointer',
        color:'#dc2626',
        fontWeight:'900',
        fontSize:'14px',
        lineHeight:'1'
      }}
    >
      ✕
    </span>
  </div>
))}
    </div>
  )}

</div>
          <label style={leftLabelStyle}>🧳 Trip Duration</label>
         <div style={{ display:'flex', gap:'15px' }}>

  {/* Nights */}
  <div style={{ width:'100%' }}>
    <div style={selectWrapperStyle}>
      <select
        value={nights}
        onChange={(e) => setNights(e.target.value)}
        style={customSelectStyle}
      >
        {[...Array(20)].map((_, i) => (
          <option key={i + 1}>
            {i + 1}N
          </option>
        ))}
      </select>

      <span style={selectArrowStyle}>▼</span>
    </div>
  </div>

  {/* Days */}
  <div style={{ width:'100%' }}>
    <div style={selectWrapperStyle}>
      <select
        value={days}
        onChange={(e) => setDays(e.target.value)}
        style={customSelectStyle}
      >
        {[...Array(20)].map((_, i) => (
          <option key={i + 1}>
            {i + 1}D
          </option>
        ))}
      </select>

      <span style={selectArrowStyle}>▼</span>
    </div>
  </div>

</div>
         {/* PAX ROW */}
<div style={{ display:'flex', gap:'15px' }}>

  {/* ADULT PAX */}
  <div style={{ width:'100%' }}>
  <label style={leftLabelStyle}>👨Adult PAX</label>

    <div style={selectWrapperStyle}>
      <select
        value={adultPax}
        onChange={(e) => setAdultPax(e.target.value)}
        style={customSelectStyle}
      >
        {[...Array(11)].map((_, i) => (
          <option key={i}>
            {i} Adult{i === 1 ? '' : 's'}
          </option>
        ))}
      </select>

      <span style={selectArrowStyle}>▼</span>
    </div>
  </div>

  {/* CHILD PAX */}
  <div style={{ width:'100%' }}>
   <label style={leftLabelStyle}>🧒 Child PAX</label>

    <div style={selectWrapperStyle}>
      <select
        value={childPax}
        onChange={(e) => setChildPax(e.target.value)}
        style={customSelectStyle}
      >
        {[...Array(11)].map((_, i) => (
          <option key={i}>
            {i} Child{i === 1 ? '' : 'ren'}
          </option>
        ))}
      </select>

      <span style={selectArrowStyle}>▼</span>
    </div>
  </div>

</div>

          <label style={leftLabelStyle}>🏨 Accommodation</label>
          <div style={selectWrapperStyle}>
  <select
    value={hotelCategory}
    onChange={(e) => setHotelCategory(e.target.value)}
    style={customSelectStyle}
  >
    <option>3★ Hotel</option>
    <option>4★ Hotel</option>
    <option>5★ Hotel</option>
    <option>Luxury Resort</option>
    <option>Villa</option>
    <option>Premium Stay</option>
  </select>

  <span style={selectArrowStyle}>▼</span>
</div>

          <label style={leftLabelStyle}>🍽️ Meals</label>
          <div style={selectWrapperStyle}>
  <select
    value={meals}
    onChange={(e) => {
      setMeals(e.target.value);
      setHideMealsSection(e.target.value === 'No Meal');
    }}
    style={customSelectStyle}
  >
    <option>Breakfast Included</option>
    <option>Breakfast + Dinner</option>
    <option>MAP Meal Plan</option>
    <option>AP Meal Plan</option>
    <option>Breakfast + Lunch + Dinner</option>
    <option>All Meals Included</option>
    <option>No Meal</option>
  </select>

  <span style={selectArrowStyle}>▼</span>
</div>
          {/* PACKAGE + SIGHTSEEING SAFE BLOCK */}

<div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

  {/* PACKAGE INCLUDES */}
  <div>
    <label style={leftLabelStyle}>📦 Package Includes</label>

    <input
      value={includes}
      onChange={(e)=>setIncludes(e.target.value)}
      style={inputStyle}
    />
  </div>

  {/* SIGHTSEEING COVERED */}
  <div>
    <label style={leftLabelStyle}>📍 Sightseeing Covered</label>

    <div style={{ marginTop: "15px" }}>
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setShowSightseeing(!showSightseeing)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <span
  style={{
    fontSize: "13px",
    color: "#374151"
  }}
>
  {selectedSightseeing.length > 0
    ? selectedSightseeing.join(", ")
    : "Select Sightseeing"}
</span>

<span
  style={{
    fontSize: "11px",
    color: "#6b7280"
  }}
>
  ▼
</span>
        </div>

        {showSightseeing && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginTop: "6px",
              zIndex: 100,
              maxHeight: "220px",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {sightseeingOptions.map((spot) => (
              <label
                key={spot}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSightseeing.includes(spot)}
                  onChange={() => {
                    if (selectedSightseeing.includes(spot)) {
                      setSelectedSightseeing(
                        selectedSightseeing.filter((s) => s !== spot)
                      );
                    } else {
                      setSelectedSightseeing([...selectedSightseeing, spot]);
                    }
                  }}
                />
                {spot}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>

  <div style={{ marginTop: "15px" }}>
    <label style={leftLabelStyle}>✍️ Add Custom Sightseeing</label>

    <input
      type='text'
      placeholder='Enter sightseeing places manually'
      value={manualSightseeing}
      onChange={(e) => setManualSightseeing(e.target.value)}
      style={inputStyle}
    />
  </div>

</div>

          <label style={leftLabelStyle}>💰 Package Price</label>
      {/* INCLUDING FLIGHT */}  
        <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  }}
>
  <input
  type="checkbox"
  checked={includingFlight}
  onChange={(e) => {
    const checked = e.target.checked;

    setIncludingFlight(checked);

    if (checked) {
      setExcludingFlight(false);
    }
  }}
/>

  <label style={{ fontSize: '13px', fontWeight: '600' }}>
    Including Flight
  </label>
</div>
        {/* EXCLUDING FLIGHT */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  }}
>
  <input
  type="checkbox"
  checked={excludingFlight}
  onChange={(e) => {
    const checked = e.target.checked;

    setExcludingFlight(checked);

    if (checked) {
      setIncludingFlight(false);
    }
  }}
/>

  <label style={{ fontSize: '13px', fontWeight: '600' }}>
    Excluding Flight
  </label>
</div>
        <label
  style={{
    marginTop: '16px',
    display: 'block',
    fontWeight: '600'
  }}
>
  🏷 Offer Badge
</label>

<div style={selectWrapperStyle}>
  <select
    value={offerBadge}
    onChange={(e) => setOfferBadge(e.target.value)}
    style={customSelectStyle}
  >
    <option value=''>None</option>
    <option value='🔥 Best Seller'>🔥 Best Seller</option>
    <option value='💖 Honeymoon Special'>💖 Honeymoon Special</option>
    <option value='👨👩👧 Family Favorite'>👨👩👧 Family Favorite</option>
    <option value='🌴 Summer Escape'>🌴 Summer Escape</option>
    <option value='✨ Luxury Retreat'>✨ Luxury Retreat</option>
  </select>

  <span style={selectArrowStyle}>▼</span>
</div>
          <div style={{ display: 'flex', gap: '12px' }}>
  <div style={selectWrapperStyle}>
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      style={{
        ...customSelectStyle,
        width: '120px',
        marginBottom: 0
      }}
    >
      <option value='₹'>₹ INR</option>
      <option value='$'>$ USD</option>
    </select>

    <span style={selectArrowStyle}>▼</span>
  </div>

  <input
    type='number'
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    style={inputStyle}
  />
</div>
          <button onClick={downloadPNG} style={{width:'100%',padding:'14px',background:'#111827',color:'#fff',border:'none',borderRadius:'12px',marginTop:'20px'}}>Download PNG</button>
          <button onClick={shareWhatsApp} style={{width:'100%',padding:'14px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'12px',marginTop:'12px'}}>Share on WhatsApp</button>
        </div>

        {/* PREVIEW */}
       <div
  ref={packageRef}
  style={{
    position:'relative',
    aspectRatio:'4 / 5',
    width:'100%',
    maxWidth:'1080px',
    minHeight:'1350px',
    margin:'0 auto',
    overflow:'hidden',
    borderRadius:'28px',
    backgroundSize:'cover',
    backgroundPosition:'center',
    padding:'28px',

    background: `
      linear-gradient(
        135deg,
        rgba(17,24,39,0.82),
        rgba(31,41,55,0.72)
      ),
      url(${destinationImages[destination]})
    `
  }}
>
   {offerBadge && (
  <div
    style={{
      position: 'absolute',
      top: '210px',
      right: '22px',
      width: '96px',
      height: '96px',
      borderRadius: '50%',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',

      padding: '10px',
      fontSize: '14px',
      fontWeight: 900,

      boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
      zIndex: 20,

      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.25)',

     color:
  offerBadge?.toLowerCase().includes('best')
    ? '#b91c1c'
    : offerBadge?.toLowerCase().includes('honeymoon')
    ? '#fb7185'
    : offerBadge?.toLowerCase().includes('luxury')
    ? '#a78bfa'
    : offerBadge?.toLowerCase().includes('family')
    ? '#38bdf8'
    : offerBadge?.toLowerCase().includes('summer')
    ? '#f97316'
    : offerBadge?.toLowerCase().includes('early')
    ? '#4ade80'
    : offerBadge?.toLowerCase().includes('limited')
    ? '#ef4444'
    : offerBadge?.toLowerCase().includes('group')
    ? '#22c55e'
    : '#ffffff',
      textShadow: '0 2px 6px rgba(0,0,0,0.6)'
    }}
  >
    {offerBadge}
  </div>
)}
          {/* LOGO */}
          <div style={{textAlign:'center',marginBottom:'15px'}}>
            <img src='/orbitz-logo.jpg' alt='Orbitz Holidays' style={{width:'200px',borderRadius:'22px',boxShadow:'0 10px 25px rgba(0,0,0,0.45)',background:'#ffffff10',padding:'6px'}}/>
          </div>

          {/* SLOGAN */}
          <div
            style={{
              textAlign:'center',
              marginBottom:'22px',
              padding:'10px 18px',
              borderRadius:'16px',
              background:'rgba(17,24,39,0.78)',
              border:'1px solid rgba(255,255,255,0.12)',
              boxShadow:'0 8px 22px rgba(0,0,0,0.28)',
              backdropFilter:'blur(8px)'
            }}
          >
            <div
              style={{
                fontSize:'19px',
                fontStyle:'italic',
                fontWeight:'700',
                letterSpacing:'-0.2px',
                color:'#ffffff',
                fontFamily:'"Segoe Script","Brush Script MT",cursive',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:'2px',
                whiteSpace:'nowrap',
                width:'100%'
              }}
            >
              <span style={{ marginRight:'0px' }}>Anywhere, Anytime, Around the World</span>
              <img
                src='/globe.png'
                alt='Globe'
                style={{
                  width:'34px',
                  height:'34px',
                  objectFit:'contain'
                }}
              />
            </div>
          </div>

          {/* DESTINATION HERO IMAGE */}
<div
  style={{
    position:'relative',
    width:'100%',
    height: window.innerWidth < 768 ? '140px' : '180px',
    borderRadius:'20px',
    overflow:'hidden',
    marginBottom:'10px',
    boxShadow:'0 12px 30px rgba(0,0,0,0.45)'
  }}
>
  <img
    src={destinationImages[destination]}
    alt={destination}
    style={{
      width:'100%',
      height:'100%',
      objectFit:'cover'
    }}
  />

  {/* DARK OVERLAY */}
  <div
    style={{
      position:'absolute',
      inset:0,
      background:
        'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.18), transparent)'
    }}
  />

  {/* DESTINATION CONTENT */}
  <div
    style={{
      position:'absolute',
      left: window.innerWidth < 768 ? '14px' : '20px',
      right: window.innerWidth < 768 ? '14px' : '20px',
      bottom: window.innerWidth < 768 ? '14px' : '18px',
      width:'auto',
      boxSizing:'border-box'
    }}
  >
    <h2
      style={{
        margin:0,
        width:'100%',
        boxSizing:'border-box',
        fontSize:
          window.innerWidth < 768
            ? '26px'
            : '40px',
        color:
          destinationColors[destination] || '#facc15',
        fontWeight:'900',
        letterSpacing:'0.5px',
        textShadow:'0 4px 14px rgba(0,0,0,0.75)',
        display:'flex',
        alignItems:'center',
        gap:
          window.innerWidth < 768
            ? '8px'
            : '12px',
        flexWrap:'wrap',
        lineHeight:'1.15',
        overflowWrap:'break-word'
      }}
    >
      <img
        src={
          domesticDestinations.includes(destination)
            ? '/flags/india.png'
            : destinationFlags[destination]
        }
        alt='flag'
        style={{
          width:
            window.innerWidth < 768
              ? '34px'
              : '48px',

          height:
            window.innerWidth < 768
              ? '24px'
              : '34px',

          objectFit:'cover',
          borderRadius:'6px',
          boxShadow:'0 3px 10px rgba(0,0,0,0.25)',
          flexShrink:0
        }}
      />

      <span style={{ wordBreak:'break-word' }}>
        {destination}
      </span>
    </h2>
  </div>
</div>

{/* DETAILS */}

         

{/* DATE OF JOURNEY */}
{!isFixedDeparture && (
 <div style={{marginBottom:'12px',textAlign:'center'}}>

    <Heading>Date of Journey</Heading>

    <p style={{ color:'#f8fafc' }}>
      {formatDate(fromDate)} To {formatDate(toDate)}
    </p>

  </div>
)}

{/* FIXED DEPARTURE */}
{isFixedDeparture && (
  <div style={{marginBottom:'12px',textAlign:'center'}}>
    <Heading>Fixed Departure</Heading>

    <div
      style={{
        display:'flex',
        flexWrap:'wrap',
        justifyContent:'center',
        gap:'10px',
        marginTop:'12px'
      }}
    >
      {fixedDepartureDates.length > 0 ? (
        fixedDepartureDates.map((date,index) => (
          <div
            key={index}
            style={{
              background:'rgba(255,255,255,0.12)',
              padding:'8px 14px',
              borderRadius:'999px',
              color:'#f8fafc',
              fontSize:'14px',
              fontWeight:'600',
              border:'1px solid rgba(255,255,255,0.15)'
            }}
          >
            📅 {new Date(date).toLocaleDateString('en-GB')}
          </div>
        ))
      ) : (
        <p style={{ color:'#f8fafc' }}>
          Select Departure Date
        </p>
      )}
    </div>

  </div>
)}

{/* TRIP DURATION */}
<div style={{marginBottom:'12px',textAlign:'center'}}>

  <Heading>Trip Duration</Heading>

  <p style={{ color:'#f8fafc' }}>
    {nights} / {days}
  </p>

</div>

{/* PAX */}
{!(parseInt(adultPax) === 0 && parseInt(childPax) === 0) && (
  <div style={{marginBottom:'12px',textAlign:'center'}}>
    <Heading>PAX</Heading>

    <p
      style={{
        color:'#f8fafc',
        fontSize:'16px',
        fontWeight:'600',
        letterSpacing:'0.4px'
      }}
    >
      👨 Adult: {parseInt(adultPax)}
      &nbsp;&nbsp;|&nbsp;&nbsp;
      🧒 Child: {parseInt(childPax)}
    </p>

  </div>
)}
          <div style={{marginBottom:'12px',textAlign:'center'}}>
            <Heading>Accommodation</Heading>

<p
  style={{
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.4px'
  }}
>
  🏨 {hotelCategory}
</p>

</div>
          {!hideMealsSection && (
          <div style={{marginBottom:'12px',textAlign:'center'}}>
            <Heading>Meals</Heading>

<p
  style={{
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.4px'
  }}
>
  🍽️ {meals}
</p>

</div>
)}
         <div style={{marginBottom:'12px',textAlign:'center'}}>
            <Heading>Package Includes</Heading>

<p
  style={{
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.4px',
    lineHeight: '1.6'
  }}
>
  🎒 {includes}
</p>

</div>
          <div style={{marginBottom:'12px',textAlign:'center'}}>
  <Heading>Sightseeing Covered</Heading>

  <div
    style={{
      display:'flex',
      flexWrap:'wrap',
      justifyContent:'center',
      gap:'8px',
      marginTop:'8px'
    }}
  >
    {[
  ...selectedSightseeing,

  ...(
    manualSightseeing
      ? manualSightseeing
          .split(',')
          .map(item => item.trim())
          .filter(item => item !== '')
      : []
  )

].map((item, index) => (
      <div
        key={index}
        style={{
          background: destinationColors[destination] || '#2563eb',
         color:
  destination === 'Leh Ladakh via Kashmir'
    ? '#0ea5e9'
    : '#ffffff',
          padding:'8px 14px',
          borderRadius:'999px',
          fontSize:'13px',
          fontWeight:'600',
          boxShadow:'0 4px 10px rgba(37,99,235,0.35)'
        }}
      >
        {item}
      </div>
    ))}
  </div>
</div>

          {/* PRICE */}
          <div style={{marginTop:'18px',borderTop:'1px solid #374151',paddingTop:'18px',textAlign:'center'}}>
          <p
  style={{
    fontFamily: "'Poppins', sans-serif",
    fontSize: '20px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#f8fafc',
    marginBottom: '10px',
    whiteSpace: 'nowrap',
    background: 'linear-gradient(90deg, #b91c1c, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}
>
  ✨ Package Starting From (Per Pax)
</p>
            {includingFlight && (
 
  <span
    style={{
      background: 'rgba(56, 189, 248, 0.12)',
      padding: '6px 14px',
      borderRadius: '22px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 800,
      color: '#38bdf8',
      fontSize: '15px',
      border: '1px solid rgba(56, 189, 248, 0.35)',
      boxShadow: '0 2px 10px rgba(56, 189, 248, 0.15)'
    }}
  >
   <span style={{ fontSize: '20px' }}>✈️</span>
    Including Flight
  </span>
)}
            {excludingFlight && (
  <span
    style={{
      background: 'rgba(248,113,113,0.12)',
      padding: '6px 14px',
      borderRadius: '22px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 800,
      color: '#f87171',
      fontSize: '15px',
      border: '1px solid rgba(248,113,113,0.35)',
      boxShadow: '0 2px 10px rgba(248,113,113,0.15)',
      marginBottom: '10px'
    }}
  >
    <span style={{ fontSize: '20px' }}>🚫</span>
    Excluding Flight
  </span>
)}
            

            <h1 style={{fontSize:'42px',color:'#facc15'}}>{currency}{price}</h1>

            <p style={{marginTop:'10px',fontSize:'16px',color:'#d1d5db'}}>
              {currency === '₹'
                ? `Approx. $${(Number(price) / 83).toFixed(2)}`
                : `Approx. ₹${(Number(price) * 83).toFixed(0)}`}
            </p>
          </div>

          {/* FOOTER */}
          <div style={{marginTop:'14px',background:'linear-gradient(135deg,#111827,#1f2937,#111827)',border:'1px solid #374151',borderRadius:'16px',padding:'14px',textAlign:'center',boxShadow:'0 8px 24px rgba(0,0,0,0.35)'}}>

            <div style={{color:'#fff',fontSize:'14px',lineHeight:'1.5',marginBottom:'8px'}}>
              📞 +91 9330844031 / +91 9830489892<br/>
              🌐 www.orbitzholidays.com
            </div>

            <div style={{display:'flex',justifyContent:'center',gap:'18px',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}>
                <img src='/facebook.png' style={{width:'24px',height:'24px',borderRadius:'50%'}}/>
                <span>Orbitz Holidays</span>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}>
                <img src='/instagram.png' style={{width:'24px',height:'24px',borderRadius:'50%'}}/>
                <span>Orbitz Holidays</span>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px'}}>
                <img src='/youtube.png' style={{width:'24px',height:'24px',borderRadius:'50%'}}/>
                <span>Orbitz Holidays</span>
              </div>
        
                          </div>
          </div>

          {/* DISCLAIMER */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px 14px',
              marginTop: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <p
              style={{
                color: '#dc2626',
                fontSize: '12px',
                margin: 0,
                textAlign: 'center',
                lineHeight: '1.5',
                fontWeight: '500',
              }}
            >
              <span style={{ fontWeight: '700', fontSize: '15px' }}>*</span>{' '}
              Prices subject to availability at the time of booking. Final rates may vary depending on hotel, transport, season, and package customization.
              {' '}<span style={{ fontWeight: '700', fontSize: '15px' }}>*</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}


