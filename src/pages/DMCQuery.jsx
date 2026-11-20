


import React, { useEffect, useMemo, useState } from "react";
import { getSuppliers } from "../utils/supplierStorage";
import { recordSentDMCEnquiry } from "../utils/dmcEnquiryStorage";

const INDIAN_STATES_UTS = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];
const COUNTRIES = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, The Democratic Republic of the", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czechia", "Côte d'Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine, State of", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Réunion", "Saint Barthélemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin (French part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten (Dutch part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Türkiye", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Åland Islands"];
const normalize = (value) => String(value || "").trim().toLowerCase();
const toList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};
const getCoverageRows = (supplier, market) => {
  const source = market === "Domestic" ? supplier.domesticCoverage : supplier.internationalCoverage;
  if (!Array.isArray(source)) return [];
  return source.map((row) => ({
    area: market === "Domestic" ? row.state : row.country,
    destinations: toList(row.destinations),
  })).filter((row) => row.area);
};

export default function DMCQuery({ onSelectDMC, initialSelectedDMC = null, currentUser = null, userProfile = null }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [market, setMarket] = useState("Domestic");
  const [area, setArea] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDMC, setSelectedDMC] = useState(initialSelectedDMC);
  const [enquiryValues, setEnquiryValues] = useState({});
  const [customRequirements, setCustomRequirements] = useState([]);
  const [enquiryPreview, setEnquiryPreview] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState("WhatsApp");
  const [savingSentEnquiry, setSavingSentEnquiry] = useState(false);
  const [sentEnquirySaved, setSentEnquirySaved] = useState(false);
  const [sentEnquiryError, setSentEnquiryError] = useState("");

  useEffect(() => {
    setSelectedDMC(initialSelectedDMC || null);
    setEnquiryValues({});
    setCustomRequirements([]);
    setEnquiryPreview("");
    setDeliveryChannel("WhatsApp");
    setSavingSentEnquiry(false);
    setSentEnquirySaved(false);
    setSentEnquiryError("");
  }, [initialSelectedDMC]);

  const enquiryFieldGroups = [
    {
      title: "CUSTOMER INFORMATION",
      fields: [
        ["customerName", "Customer Name", "text"],
        ["customerMobile", "Mobile / WhatsApp Number", "tel"],
        ["customerEmail", "Email Address", "email"],
      ],
    },
    {
      title: "TOUR REQUIREMENTS",
      fields: [
        ["touristDestination", "Tourist Destination", "text"],
        ["travelStartDate", "Travel Start Date", "date"],
        ["travelEndDate", "Travel End Date", "date"],
        ["duration", "Duration (Nights / Days)", "text"],
        ["adults", "Adults", "number"],
        ["children", "Children", "number"],
        ["childrenAges", "Children Ages", "text"],
      ],
    },
    {
      title: "ACCOMMODATION",
      fields: [
        ["hotelCategory", "Hotel Category / Star Rating", "text"],
        ["roomCount", "Number of Rooms", "number"],
        ["roomConfiguration", "Room Configuration", "text"],
        ["mealPlan", "Meal Plan", "text"],
      ],
    },
    {
      title: "TRANSPORTATION & EXPERIENCES",
      fields: [
        ["vehicle", "Vehicle Requirement", "text"],
        ["transfers", "Airport / Railway Transfers", "text"],
        ["sightseeing", "Sightseeing Requirements", "textarea"],
        ["activities", "Activities / Experiences", "textarea"],
        ["guide", "Guide Requirement", "text"],
      ],
    },
    {
      title: "BUDGET & OTHER INSTRUCTIONS",
      fields: [
        ["budget", "Approximate Budget", "text"],
        ["inclusions", "Required Inclusions", "textarea"],
        ["exclusions", "Exclusions / Not Required", "textarea"],
        ["specialInstructions", "Special Requests / Instructions", "textarea"],
      ],
    },
  ];

  const updateEnquiryValue = (key, value) => {
    setEnquiryValues((current) => ({ ...current, [key]: value }));
    setEnquiryPreview("");
  };

  const buildEnquiryMessage = () => {
    const lines = [];
    const addLine = (label, value) => {
      const cleanValue = String(value ?? "").trim();
      if (cleanValue) lines.push(`${label}: ${cleanValue}`);
    };

    lines.push(`Dear ${selectedDMC?.companyName || "DMC Partner"},`);
    lines.push("");
    lines.push("Greetings from Orbitz Holidays.");
    lines.push("Please share your best quotation for the following travel requirements:");
    lines.push("");

    addLine("Market", market);
    addLine(market === "Domestic" ? "State / Union Territory" : "Country", area);
    enquiryFieldGroups.forEach((group) => {
      group.fields.forEach(([key, label]) => addLine(label, enquiryValues[key]));
    });
    customRequirements.forEach((item) => {
      addLine(item.label, item.value);
    });

    lines.push("");
    lines.push("Kindly share your best rates, availability and inclusions.");
    lines.push("");
    lines.push("Regards,");
    lines.push("Team Orbitz Holidays");

    return lines.join("\n");
  };

  const addCustomRequirement = () => {
    setCustomRequirements((items) => [...items, { id: `${Date.now()}-${items.length}`, label: "", value: "" }]);
    setEnquiryPreview("");
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setLoadError("");
        const records = await getSuppliers();
        if (mounted) setSuppliers(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error("Unable to load DMC suppliers:", error);
        if (mounted) setLoadError(error.message || "Unable to load DMC suppliers.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const activeDMCs = useMemo(() => suppliers.filter((supplier) => {
    const categories = toList(supplier.categories).map(normalize);
    return supplier.isActive === true && categories.includes("dmc");
  }), [suppliers]);

  // Complete geographic choices; destination options remain grounded in registered DMC coverage.
  const availableAreas = market === "Domestic" ? INDIAN_STATES_UTS : COUNTRIES;

  // Destination search works independently. When an area is selected,
  // suggestions are narrowed to destinations registered for that area.
  // With no area selected, show all destinations registered in this market.
  const availableDestinations = useMemo(() => {
    const values = activeDMCs.flatMap((supplier) =>
      getCoverageRows(supplier, market)
        .filter((row) => !area || normalize(row.area) === normalize(area))
        .flatMap((row) => row.destinations)
    );
    return [...new Map(values.map((value) => [normalize(value), value])).values()]
      .sort((a, b) => a.localeCompare(b));
  }, [activeDMCs, market, area]);

  // Match by either selected area OR selected destination.
  // If both are selected, either registered coverage match is sufficient.
  const matchingDMCs = useMemo(() => {
    if (!area && !destination) return [];

    return activeDMCs.filter((supplier) =>
      getCoverageRows(supplier, market).some((row) => {
        const areaMatches = Boolean(area) && normalize(row.area) === normalize(area);
        const destinationQuery = normalize(destination);
        const destinationMatches = Boolean(destinationQuery) &&
          row.destinations.some((item) => normalize(item).includes(destinationQuery));

        return areaMatches || destinationMatches;
      })
    );
  }, [activeDMCs, market, area, destination]);

  function changeMarket(nextMarket) {
    setMarket(nextMarket); setArea(""); setDestination(""); setSelectedDMC(null);
  }
  function changeArea(nextArea) {
    // Keep destination search intact: area and destination are independent OR filters.
    setArea(nextArea); setSelectedDMC(null);
  }

  const styles = {
    page: { width: "100%", background: "transparent", padding: 0, color: "#302638", fontFamily: "inherit", boxSizing: "border-box" },
    shell: { width: "100%", maxWidth: "none", margin: 0 },
    header: { background: "linear-gradient(105deg,#285C68 0%,#347D83 55%,#579B91 100%)", color: "#fff", borderRadius: 13, padding: "16px 20px", boxShadow: "0 5px 16px rgba(40,92,104,.14)", textAlign: "left", width: "100%", boxSizing: "border-box" },
    panel: { marginTop: 13, background: "#fff", border: "1px solid #e5dce7", borderRadius: 12, padding: "12px 16px", boxShadow: "0 4px 14px rgba(49,25,48,.035)", width: "100%", boxSizing: "border-box" },
    label: { display: "block", fontSize: 12, fontWeight: 800, color: "#60435d", marginBottom: 7, textAlign: "left" },
    select: { width: "100%", height: 42, minHeight: 42, boxSizing: "border-box", border: "1px solid #d9cbd8", borderRadius: 8, padding: "8px 10px", background: "#fff", color: "#342b35", outlineColor: "#347D83" },
    button: { border: 0, borderRadius: 8, padding: "9px 13px", background: "linear-gradient(110deg,#285C68,#347D83)", color: "#fff", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" },
    muted: { color: "#766b78", fontSize: 13 },
    tableWrap: { width: "100%", overflowX: "auto", marginTop: 14, border: "1px solid #e6dce6", borderRadius: 10 },
    table: { width: "100%", minWidth: 760, borderCollapse: "separate", borderSpacing: 0, fontSize: 12, textAlign: "left" },
    th: { background: "linear-gradient(100deg,#285C68,#347D83)", color: "#fff", padding: "12px 13px", fontSize: 11, letterSpacing: ".45px", fontWeight: 850, whiteSpace: "nowrap" },
    td: { padding: "12px 13px", borderBottom: "1px solid #eee7ef", color: "#453b48", verticalAlign: "middle" },
    capsule: { display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "5px 10px", background: "#e7f1f1", color: "#285C68", border: "1px solid #c9dfdf", fontSize: 10, fontWeight: 800, marginRight: 5, marginBottom: 4 },
    count: { fontSize: 11, color: "#347D83", fontWeight: 850, borderRadius: 999, padding: "6px 11px", background: "#e7f1f1", border: "1px solid #c9dfdf" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={{ fontSize: 20, fontWeight: 850, textAlign: "left" }}>DMC QUERY</div>
          <div style={{ marginTop: 5, opacity: .94, fontSize: 12, textAlign: "left" }}>Find active DMC partners by their registered destination coverage</div>
        </div>

        <section style={styles.panel}>
          <div style={{ fontSize: 16, fontWeight: 850, marginBottom: 10, textAlign: "left" }}>Destination Search</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, alignItems: "end" }}>
            <div>
              <label style={styles.label}>MARKET</label>
              <select style={styles.select} value={market} onChange={(event) => changeMarket(event.target.value)}>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>{market === "Domestic" ? "STATE / UNION TERRITORY" : "COUNTRY"}</label>
              <select style={styles.select} value={area} onChange={(event) => changeArea(event.target.value)} disabled={loading}>
                <option value="">Select {market === "Domestic" ? "state / UT" : "country"}</option>
                {availableAreas.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>TOURIST DESTINATION</label>
              <input
                style={styles.select}
                type="text"
                list="dmc-query-destination-options"
                value={destination}
                onChange={(event) => { setDestination(event.target.value); setSelectedDMC(null); }}
                placeholder="Choose or type any destination"
                disabled={loading}
              />
              <datalist id="dmc-query-destination-options">
                {availableDestinations.map((item) => <option key={item} value={item} />)}
              </datalist>
            </div>
          </div>
          <div style={{ marginTop: 9, ...styles.muted, textAlign: "left" }}>
            State / Union Territory or Country and Tourist Destination are independent search fields. Choose a destination from all registered suggestions or type a destination manually. When both fields are used, a match in either field is sufficient.
          </div>
        </section>

        <section style={styles.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 16, fontWeight: 850, textAlign: "left" }}>Matching DMC Suppliers</div>
            <div style={styles.count}>
              {(area || destination) ? `${matchingDMCs.length} MATCHING DMC${matchingDMCs.length === 1 ? "" : "S"}` : `${activeDMCs.length} ACTIVE DMC${activeDMCs.length === 1 ? "" : "S"} AVAILABLE`}
            </div>
          </div>

          {loading ? <p style={styles.muted}>Loading DMC suppliers…</p> :
            loadError ? <p style={{ color: "#b42318", fontSize: 13 }}>{loadError}</p> :
            !area && !destination ? <p style={styles.muted}>Select a market and a state / UT or country, or choose a tourist destination, to find matching DMC suppliers.</p> :
            matchingDMCs.length === 0 ? <p style={styles.muted}>No active DMC supplier matches the selected area or tourist destination.</p> :
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead><tr>
                  <th style={styles.th}>SUPPLIER ID</th>
                  <th style={styles.th}>DMC COMPANY</th>
                  <th style={styles.th}>CONTACT PERSON</th>
                  <th style={styles.th}>MOBILE</th>
                  <th style={styles.th}>EMAIL</th>
                  <th style={styles.th}>SERVICES / SPECIALIZATIONS</th>
                  <th style={styles.th}>ACTION</th>
                </tr></thead>
                <tbody>
                  {matchingDMCs.map((supplier, index) => {
                    const tags = [...toList(supplier.services), ...toList(supplier.specializations)];
                    return (
                      <tr key={supplier.id} style={{ background: index % 2 === 0 ? "#f7fbfb" : "#eef5f4" }}>
                        <td style={styles.td}><strong>{supplier.supplierId || "—"}</strong></td>
                        <td style={styles.td}><strong>{supplier.companyName || "—"}</strong></td>
                        <td style={styles.td}>{supplier.contactPerson || supplier.contactName || "—"}</td>
                        <td style={styles.td}>{supplier.mobile || supplier.phone || "—"}</td>
                        <td style={styles.td}>{supplier.email || "—"}</td>
                        <td style={styles.td}>{tags.length ? tags.map((item, i) => <span key={`${item}-${i}`} style={styles.capsule}>{item}</span>) : "—"}</td>
                        <td style={styles.td}><button style={styles.button} onClick={() => { setSelectedDMC(supplier); onSelectDMC?.(supplier); }}>Select DMC</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          }
        </section>

        {selectedDMC && <section style={{ ...styles.panel, borderColor: "#b8d4d4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 850 }}>CUSTOMER QUERY PREPARATION</div>
              <div style={{ ...styles.muted, marginTop: 4 }}>Selected DMC: <strong>{selectedDMC.companyName}</strong> · {selectedDMC.supplierId || "Supplier ID unavailable"}</div>
            </div>
            <span style={styles.count}>REUSABLE MASTER TEMPLATE</span>
          </div>
          <p style={{ ...styles.muted, marginTop: 8, marginBottom: 14 }}>
            Fill only the details required for this enquiry. Blank fields are automatically omitted from the generated message. Your entries apply only to this enquiry; the reusable master structure stays unchanged.
          </p>

          {enquiryFieldGroups.map((group) => (
            <div key={group.title} style={{ marginTop: 15 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".45px", color: "#285C68", borderBottom: "1px solid #dce9e8", paddingBottom: 7, marginBottom: 10 }}>{group.title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 11 }}>
                {group.fields.map(([key, label, type]) => (
                  <label key={key} style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#60435d", textAlign: "left" }}>
                    {label}
                    {type === "textarea" ? (
                      <textarea
                        value={enquiryValues[key] || ""}
                        onChange={(event) => updateEnquiryValue(key, event.target.value)}
                        rows={2}
                        style={{ ...styles.select, height: "auto", minHeight: 68, marginTop: 6, resize: "vertical", fontFamily: "inherit" }}
                        placeholder={`Enter ${label.toLowerCase()} (optional)`}
                      />
                    ) : (
                      <input
                        type={type}
                        min={type === "number" ? "0" : undefined}
                        value={enquiryValues[key] || ""}
                        onChange={(event) => updateEnquiryValue(key, event.target.value)}
                        style={{ ...styles.select, display: "block", marginTop: 6 }}
                        placeholder={type === "date" ? undefined : `Enter ${label.toLowerCase()} (optional)`}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 17 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".45px", color: "#285C68", borderBottom: "1px solid #dce9e8", paddingBottom: 7, marginBottom: 10 }}>ADDITIONAL REQUIREMENTS</div>
            {customRequirements.map((item) => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "minmax(150px,1fr) minmax(180px,2fr) auto", gap: 8, marginBottom: 8 }}>
                <input
                  value={item.label}
                  onChange={(event) => { setCustomRequirements((items) => items.map((entry) => entry.id === item.id ? { ...entry, label: event.target.value } : entry)); setEnquiryPreview(""); }}
                  style={styles.select}
                  placeholder="Requirement title"
                />
                <input
                  value={item.value}
                  onChange={(event) => { setCustomRequirements((items) => items.map((entry) => entry.id === item.id ? { ...entry, value: event.target.value } : entry)); setEnquiryPreview(""); }}
                  style={styles.select}
                  placeholder="Requirement details"
                />
                <button type="button" onClick={() => { setCustomRequirements((items) => items.filter((entry) => entry.id !== item.id)); setEnquiryPreview(""); }} style={{ ...styles.button, background: "#a33d55" }}>Remove</button>
              </div>
            ))}
            <button type="button" style={{ ...styles.button, background: "linear-gradient(110deg,#647b55,#82965f)" }} onClick={addCustomRequirement}>+ Add Requirement</button>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
            <button type="button" style={styles.button} onClick={() => setEnquiryPreview(buildEnquiryMessage())}>Generate Enquiry Content</button>
            <button type="button" style={{ ...styles.button, background: "#6d6170" }} onClick={() => { setEnquiryValues({}); setCustomRequirements([]); setEnquiryPreview(""); }}>Clear Individual Enquiry</button>
          </div>

          {enquiryPreview && (
            <div style={{ marginTop: 16, border: "1px solid #cfe0df", borderRadius: 10, padding: 14, background: "#f6faf9" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#285C68", marginBottom: 9 }}>WHATSAPP / EMAIL PREVIEW</div>
              <textarea readOnly value={enquiryPreview} rows={Math.min(18, Math.max(8, enquiryPreview.split("\n").length))} style={{ ...styles.select, height: "auto", minHeight: 190, background: "#fff", resize: "vertical", fontFamily: "inherit", lineHeight: 1.55 }} />
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 10 }}>
                <button type="button" style={styles.button} onClick={() => navigator.clipboard?.writeText(enquiryPreview)}>Copy WhatsApp Content</button>
                <button type="button" style={{ ...styles.button, background: "#526c83" }} onClick={() => {
                  const recipient = String(selectedDMC?.email || "").trim();

                  // Gmail account index 0 is used. Keep the official Orbitz Holidays
                  // account signed in as the first account in the active browser profile.
                  // If the DMC has no saved email, open the draft with To left blank
                  // so staff can enter the recipient manually.
                  const subject = `DMC Enquiry - ${selectedDMC.companyName || "Orbitz Holidays"}`;
                  const params = new URLSearchParams({
                    view: "cm",
                    fs: "1",
                    su: subject,
                    body: enquiryPreview,
                  });
                  if (recipient) params.set("to", recipient);
                  const gmailComposeUrl = `https://mail.google.com/mail/u/1/?${params.toString()}`;
                  window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
                }}>Open Email Draft</button>
                <button type="button" style={{ ...styles.button, background: "#25865b" }} onClick={() => {
                  const phone = String(selectedDMC.mobile || selectedDMC.phone || "").replace(/[^0-9]/g, "");
                  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(enquiryPreview)}` : `https://wa.me/?text=${encodeURIComponent(enquiryPreview)}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}>Open WhatsApp</button>
              </div>
              <div style={{ marginTop: 16, padding: 14, border: "1px solid #d8e5e5", borderRadius: 10, background: "#fbfdfd" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#285C68", marginBottom: 9 }}>DELIVERY CONFIRMATION</div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#60435d", marginBottom: 8 }}>
                  Delivery channel
                  <select value={deliveryChannel} onChange={(event) => setDeliveryChannel(event.target.value)} disabled={savingSentEnquiry || sentEnquirySaved} style={{ ...styles.select, marginTop: 5 }}>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                  </select>
                </label>
                <button
                  type="button"
                  disabled={savingSentEnquiry || sentEnquirySaved}
                  style={{ ...styles.button, background: sentEnquirySaved ? "#64748b" : "#167A58", opacity: savingSentEnquiry ? 0.7 : 1, cursor: savingSentEnquiry || sentEnquirySaved ? "not-allowed" : "pointer" }}
                  onClick={async () => {
                    const staffIdentity = userProfile?.displayName || userProfile?.name || currentUser?.displayName || currentUser?.email || currentUser?.uid || "";
                    if (!currentUser?.uid) {
                      setSentEnquiryError("Unable to identify the signed-in staff account. Please sign in again and retry.");
                      return;
                    }
                    if (!selectedDMC?.id || !selectedDMC?.supplierId) {
                      setSentEnquiryError("The selected DMC record is missing its permanent supplier reference.");
                      return;
                    }
                    if (!String(enquiryValues.touristDestination || "").trim()) {
                      setSentEnquiryError("Please enter the tourist destination before marking this enquiry as sent.");
                      return;
                    }
                    if (!enquiryPreview.trim()) {
                      setSentEnquiryError("Generate the enquiry message before marking it as sent.");
                      return;
                    }
                    const confirmed = window.confirm(`Confirm that this enquiry was actually sent to ${selectedDMC.companyName} via ${deliveryChannel}?\n\nThis will create a permanent business history record.`);
                    if (!confirmed) return;
                    try {
                      setSavingSentEnquiry(true);
                      setSentEnquiryError("");


                      const querySections = enquiryFieldGroups
  .map((group) => {
    const fields = Object.fromEntries(
      group.fields
        .filter(([key]) => {
          const value = enquiryValues[key];
          return value !== null &&
            value !== undefined &&
            String(value).trim() !== "";
        })
        .map(([key, label]) => [
          key,
          {
            label,
            value: enquiryValues[key],
          },
        ])
    );

    return {
      title: group.title,
      fields,
    };
  })
  .filter((section) => Object.keys(section.fields).length > 0);



                      const result = await recordSentDMCEnquiry({
                        querySections,
                        supplierDocId: selectedDMC.id,
                        supplierId: selectedDMC.supplierId,
                        dmcName: selectedDMC.companyName,
                        destination: String(enquiryValues.touristDestination || "").trim(),
                        market,
                        area,
                        customerDetails: enquiryValues,
                        travelRequirements: enquiryValues,
                        customRequirements,
                        supplierSnapshot: {
                          email: selectedDMC.email || "",
                          mobile: selectedDMC.mobile || selectedDMC.phone || "",
                        },
                        generatedMessage: enquiryPreview,
                        deliveryChannel,
                        sentBy: staffIdentity,
                        createdBy: currentUser.uid,
                      });
                      setSentEnquirySaved(true);
                      window.alert(`${result.queryLabel} · ${result.destination} saved to DMC Query History.`);
                    } catch (error) {
                      console.error("Unable to save sent DMC enquiry:", error);
                      setSentEnquiryError(error?.message || "Unable to save the sent enquiry. Please try again.");
                    } finally {
                      setSavingSentEnquiry(false);
                    }
                  }}
                >
                  {savingSentEnquiry ? "SAVING SENT ENQUIRY..." : sentEnquirySaved ? "SAVED TO DMC HISTORY" : "MARK AS SENT"}
                </button>
                {sentEnquirySaved && <div style={{ ...styles.muted, marginTop: 8, color: "#167A58", fontWeight: 800 }}>This enquiry has been recorded as Sent – Awaiting Reply.</div>}
                {sentEnquiryError && <div role="alert" style={{ marginTop: 8, color: "#b42318", fontSize: 12, fontWeight: 700 }}>{sentEnquiryError}</div>}
              </div>
              <div style={{ ...styles.muted, marginTop: 8 }}>Only populated fields are included. Sending remains under staff review in WhatsApp or Gmail. Mark as Sent only after the message has actually been sent.</div>
            </div>
          )}
        </section>}
      </div>
    </div>
  );
}
