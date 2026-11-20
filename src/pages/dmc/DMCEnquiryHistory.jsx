



import React, { useEffect, useState } from "react";
import {
  getDMCEnquiriesForSupplier,
  markDMCQuotationReceived,
} from "../../utils/dmcEnquiryStorage";

const QUOTATION_CHANNELS = ["WhatsApp", "Email", "Phone", "Other"];

const formatDate = (value) => {
  if (!value) return "—";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN");
};

const getKey = (key) =>
  String(key).replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();

const normalizedKey = (key) =>
  String(key).replace(/[\s_-]/g, "").toLowerCase();

const isEmpty = (value) =>
  value === null || value === undefined || value === "";

const displayValue = (value) => {
  if (value === null || value === undefined) return "—";

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  const text = String(value).trim();

  // Convert ISO date YYYY-MM-DD to DD-MM-YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-");
    return `${day}-${month}-${year}`;
  }

  return String(value);
};


const TRAVEL_ORDER = [
  "touristDestination",
  "travelStartDate",
  "travelEndDate",
  "duration",
  "adults",
  "children",
  "childAges",
  "roomCount",
  "roomConfiguration",
  "accommodation",
  "mealPlan",
  "vehicle",
  "transfers",
  "sightseeing",
  "activities",
  "guide",
  "budget",
  "inclusions",
  "exclusions",
  "additionalInstructions",
];




function QuerySection({ title, fields }) {
  const entries = Object.entries(fields || {}).filter(
    ([, item]) => item && !isEmpty(item.value)
  );

  if (!entries.length) return null;

  return (
    <section style={{ marginBottom: 22 }}>
      <h4 style={{
        margin: "0 0 12px",
        padding: "8px 12px",
        background: "linear-gradient(100deg, #DFEBFC, #D3E4FA)",
        borderLeft: "5px solid #D6A84F",
        borderRadius: 7,
        color: "#173B70",
        fontSize: 15,
        fontWeight: 900,
        letterSpacing: ".3px",
        textAlign: "left"
      }}>
        {title}
      </h4>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 10
      }}>
        {entries.map(([key, item]) => (
          <div key={key} style={{
            padding: "13px 12px",
            border: "1px solid #B9C9E0",
            borderRadius: 11,
            background: "linear-gradient(145deg, #F2F6FD, #FFFFFF)",
            minHeight: 76,
            boxSizing: "border-box"
          }}>
            
<div style={{
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 6,
  lineHeight: 1.5,
  minWidth: 0
}}>

  <span 
  style={{
  fontSize: 12,
  color: "#52657D",
  fontWeight: 700,
  whiteSpace: "nowrap"
}}
  >
    {item.label || getKey(key)}:
  </span>

 <span style={{
  fontSize: 14,
  color: "#087E8B",
  fontWeight: 900,
  overflowWrap: "normal",
  wordBreak: "normal",
  whiteSpace: "normal"
}}>
    {displayValue(item.value)}
  </span>
</div>

          </div>
        ))}
      </div>
    </section>
  );
}






function DetailSection({ title, data, orderedKeys, excludeKeys = [] }) {
  const entries = Object.entries(data || {}).filter(([key, value]) => {
    const normalized = normalizedKey(key);
    return (
      !isEmpty(value) &&
      !excludeKeys.includes(normalized) &&
      !Array.isArray(value) &&
      typeof value !== "object"
    );
  });

  if (!entries.length) return null;

  const orderedEntries = orderedKeys
    ? [
        ...orderedKeys
          .map((key) =>
            entries.find(([entryKey]) => normalizedKey(entryKey) === normalizedKey(key))
          )
          .filter(Boolean),
        ...entries.filter(
          ([entryKey]) =>
            !orderedKeys.some((key) => normalizedKey(key) === normalizedKey(entryKey))
        ),
      ]
    : entries;

  return (
    <section style={{ marginBottom: 20 }}>
      <h4 style={{
        margin: "0 0 11px",
        color: "#784C83",
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: ".25px",
        textAlign: "left"
      }}>
        {title}
      </h4>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
        gap: 9
      }}>
        {orderedEntries.map(([key, value]) => (
          <div key={key} style={{
            padding: "11px 12px",
            border: "1px solid #d8cbdc",
            borderRadius: 9,
            background: "#fff",
            minHeight: 57,
            boxSizing: "border-box"
          }}>
            <div style={{
              fontSize: 10,
              color: "#66516f",
              fontWeight: 850,
              letterSpacing: ".35px",
              marginBottom: 7
            }}>
              {getKey(key).toUpperCase()}
            </div>
            <div style={{
              fontSize: 13,
              color: "#243342",
              fontWeight: 650,
              overflowWrap: "anywhere",
              lineHeight: 1.45
            }}>
              {displayValue(value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CustomRequirements({ items }) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <section style={{ marginBottom: 20 }}>
      <h4 style={{
        margin: "0 0 11px",
        color: "#784C83",
        fontSize: 13,
        fontWeight: 900,
        textAlign: "left"
      }}>
        CUSTOM REQUIREMENTS
      </h4>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
        gap: 9
      }}>
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} style={{
            padding: "11px 12px",
            border: "1px solid #d8cbdc",
            borderRadius: 9,
            background: "#fff"
          }}>
            <div style={{
              fontSize: 10,
              color: "#66516f",
              fontWeight: 850,
              marginBottom: 7
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: 13,
              color: "#243342",
              fontWeight: 650,
              overflowWrap: "anywhere"
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DMCEnquiryHistory({
  supplier,
  currentUser,
  userProfile,
  onBack,
}) {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [quotationChannel, setQuotationChannel] = useState("WhatsApp");
  const [quotationAmount, setQuotationAmount] = useState("");
  const [quotationCurrency, setQuotationCurrency] = useState("INR");
  const [quotationNotes, setQuotationNotes] = useState("");
  const [savingQuotation, setSavingQuotation] = useState(false);
  const [quotationError, setQuotationError] = useState("");

  const staffIdentity =
    currentUser?.email ||
    userProfile?.email ||
    currentUser?.uid ||
    "";

  const loadHistory = async () => {
    if (!supplier?.id) {
      setError("Supplier record ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const records = await getDMCEnquiriesForSupplier(supplier.id);
      setEnquiries(records || []);

      if (selectedEnquiry) {
        const refreshed = (records || []).find(
          (item) => item.enquiryId === selectedEnquiry.enquiryId
        );
        if (refreshed) setSelectedEnquiry(refreshed);
      }
    } catch (err) {
      console.error("DMC history load failed:", err);
      setError(err.message || "Unable to load enquiry history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // Load when the selected supplier changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier?.id]);

  const handleMarkQuotationReceived = async (event) => {
    event.preventDefault();

    if (!selectedEnquiry?.enquiryId) {
      setQuotationError("Selected enquiry ID is missing.");
      return;
    }
    if (!staffIdentity) {
      setQuotationError("Unable to identify the logged-in staff member.");
      return;
    }

    try {
      setSavingQuotation(true);
      setQuotationError("");

      await markDMCQuotationReceived(selectedEnquiry.enquiryId, {
        receivedBy: staffIdentity,
        quotationChannel,
        quotationAmount,
        quotationCurrency: quotationAmount ? quotationCurrency : "",
        quotationNotes,
      });

      setShowQuotationForm(false);
      setQuotationAmount("");
      setQuotationCurrency("INR");
      setQuotationNotes("");

      await loadHistory();
    } catch (err) {
      console.error("Mark quotation received failed:", err);
      setQuotationError(err.message || "Unable to update quotation status.");
    } finally {
      setSavingQuotation(false);
    }
  };

  const isQuotationReceived =
    selectedEnquiry?.status === "Quotation Received";

  const customerDetails = { ...(selectedEnquiry?.customerDetails || {}) };
  Object.keys(customerDetails).forEach((key) => {
    if (normalizedKey(key) === "touristdestination") {
      delete customerDetails[key];
    }
  });


  const LEGACY_QUERY_GROUPS = [
  {
    title: "CUSTOMER INFORMATION",
    keys: [
      ["customerName", "Customer Name"],
      ["customerMobile", "Mobile / WhatsApp Number"],
      ["customerEmail", "Email Address"],
    ],
    source: "customerDetails",
  },
  {
    title: "TOUR REQUIREMENTS",
    keys: [
      ["touristDestination", "Tourist Destination"],
      ["travelStartDate", "Travel Start Date"],
      ["travelEndDate", "Travel End Date"],
      ["duration", "Duration (Nights / Days)"],
      ["adults", "Adults"],
      ["children", "Children"],
      ["childrenAges", "Children Ages"],
    ],
    source: "travelRequirements",
  },
  {
    title: "ACCOMMODATION",
    keys: [
      ["hotelCategory", "Hotel Category / Star Rating"],
      ["roomCount", "Number of Rooms"],
      ["roomConfiguration", "Room Configuration"],
      ["mealPlan", "Meal Plan"],
    ],
    source: "travelRequirements",
  },
  {
    title: "TRANSPORTATION & EXPERIENCES",
    keys: [
      ["vehicle", "Vehicle Requirement"],
      ["transfers", "Airport / Railway Transfers"],
      ["sightseeing", "Sightseeing Requirements"],
      ["activities", "Activities / Experiences"],
      ["guide", "Guide Requirement"],
    ],
    source: "travelRequirements",
  },
  {
    title: "BUDGET & OTHER INSTRUCTIONS",
    keys: [
      ["budget", "Approximate Budget"],
      ["inclusions", "Required Inclusions"],
      ["exclusions", "Exclusions / Not Required"],
      ["specialInstructions", "Special Requests / Instructions"],
    ],
    source: "travelRequirements",
  },
];

const displayQuerySections = Array.isArray(selectedEnquiry?.querySections)
  ? selectedEnquiry.querySections
  : LEGACY_QUERY_GROUPS.map((group) => {
      const sourceData =
        selectedEnquiry?.[group.source] || {};

      const fields = Object.fromEntries(
        group.keys
          .filter(([key]) => !isEmpty(sourceData[key]))
          .map(([key, label]) => [
            key,
            { label, value: sourceData[key] },
          ])
      );

      return { title: group.title, fields };
    }).filter((section) => Object.keys(section.fields).length > 0);




  return (
    <div style={{
      marginTop: 14,
      padding: 16,
      background: "#fff",
      border: "1px solid #ead5e2",
      borderRadius: 12,
      boxShadow: "0 3px 12px rgba(120,76,131,.06)"
    }}>
      <div style={{ marginBottom: 18, textAlign: "left" }}>
  <div style={{
    fontSize: 13,
    fontWeight: 800,
    color: "#52657D",
    letterSpacing: ".5px",
    marginBottom: 7
  }}>
    DMC QUERY HISTORY
  </div>

  <div style={{
    fontSize: 22,
    fontWeight: 900,
    color: "#173B70",
    letterSpacing: ".2px",
    lineHeight: 1.3
  }}>
    {supplier?.companyName || supplier?.name || "DMC"}
  </div>

  <div style={{
    fontSize: 12,
    fontWeight: 700,
    color: "#718096",
    marginTop: 5
  }}>
    Supplier ID: {supplier?.supplierId || "N/A"}
  </div>
</div>

      {loading ? (
        <div style={{ padding: 20, color: "#526477" }}>
          Loading enquiry history...
        </div>
      ) : error ? (
        <div style={{
          padding: 14,
          color: "#b4233c",
          background: "#fff1f3",
          borderRadius: 8
        }}>
          {error}
        </div>
      ) : enquiries.length === 0 ? (
        <div style={{
          padding: 22,
          textAlign: "center",
          color: "#526477",
          background: "#faf8fb",
          borderRadius: 9
        }}>
          No sent enquiries found for this DMC.
        </div>
      ) : (
        <>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 9,
            marginBottom: 17
          }}>
            {enquiries.map((item) => {
              const isSelected =
                selectedEnquiry?.enquiryId === item.enquiryId;

              return (
                <button
                  key={item.id || item.enquiryId}
                  type="button"
                  onClick={() => {
  setSelectedEnquiry((current) =>
    current?.enquiryId === item.enquiryId ? null : item
  );
  setShowQuotationForm(false);
  setQuotationError("");
}}
                  style={{
                    border: isSelected
                      ? "1px solid #784C83"
                      : "1px solid #d8c9df",
                    background: isSelected ? "#784C83" : "#f2ebf5",
                    color: isSelected ? "#fff" : "#684477",
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 2px 6px rgba(120,76,131,.22)"
                      : "none"
                  }}
                >
                  {item.queryLabel || `QUERY ${String(item.queryNumber || "").padStart(2, "0")}`}
                  {" · "}
                  {item.destination || "Destination"}
                </button>
              );
            })}
          </div>

          {selectedEnquiry && (
            <div style={{
              border: "1px solid #e2d6e5",
              borderRadius: 10,
              padding: 15,
              background: "#fcfafc"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 18
              }}>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#784C83"
                  }}>
                    {selectedEnquiry.queryLabel} · {selectedEnquiry.destination}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "#526477",
                    marginTop: 5
                  }}>
                    Sent: {formatDate(selectedEnquiry.sentAt)}
                  </div>
                </div>

                <div style={{
                  padding: "7px 11px",
                  borderRadius: 20,
                  background: isQuotationReceived ? "#e4f3e9" : "#fff0d5",
                  color: isQuotationReceived ? "#216b42" : "#875400",
                  fontSize: 10,
                  fontWeight: 900
                }}>
                  {selectedEnquiry.status}
                </div>
              </div>

              {displayQuerySections.map((section, index) => (
  <QuerySection
    key={`${section.title}-${index}`}
    title={section.title}
    fields={section.fields}
  />
))}
              <CustomRequirements items={selectedEnquiry.customRequirements} />

              <section style={{ marginTop: 18 }}>
                <h4 style={{
                  margin: "0 0 10px",
                  color: "#784C83",
                  fontSize: 13,
                  fontWeight: 900,
                  textAlign: "left"
                }}>
                  ORIGINAL MESSAGE
                </h4>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.8fr) minmax(220px, 1fr)",
                  gap: 12,
                  alignItems: "stretch"
                }}>
                  <pre style={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 12,
                    lineHeight: 1.65,
                    color: "#263746",
                    background: "#fff",
                    border: "1px solid #d8cbdc",
                    borderRadius: 9,
                    padding: 15,
                    margin: 0,
                    minHeight: 180
                  }}>
                    {selectedEnquiry.generatedMessage
  ? selectedEnquiry.generatedMessage.replace(
      /\b(\d{4})-(\d{2})-(\d{2})\b/g,
      "$3-$2-$1"
    )
  : "No saved message."}
                  </pre>

                  <aside style={{
                    background: "#f4eff6",
                    border: "1px solid #ded0e4",
                    borderRadius: 9,
                    padding: 13
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#784C83",
                      marginBottom: 13
                    }}>
                      ENQUIRY SUMMARY
                    </div>

                    <div style={{ fontSize: 10, color: "#66516f", fontWeight: 800 }}>
                      DELIVERY CHANNEL
                    </div>
                    <div style={{ fontSize: 13, color: "#263746", fontWeight: 700, margin: "4px 0 12px" }}>
                      {selectedEnquiry.deliveryChannel || "—"}
                    </div>

                    <div style={{ fontSize: 10, color: "#66516f", fontWeight: 800 }}>
                      SENT BY
                    </div>
                    <div style={{ fontSize: 12, color: "#263746", fontWeight: 650, overflowWrap: "anywhere", margin: "4px 0 12px" }}>
                      {selectedEnquiry.sentBy || "—"}
                    </div>

                    <div style={{ fontSize: 10, color: "#66516f", fontWeight: 800 }}>
                      SENT DATE
                    </div>
                    <div style={{ fontSize: 12, color: "#263746", fontWeight: 650, margin: "4px 0 14px" }}>
                      {formatDate(selectedEnquiry.sentAt)}
                    </div>

                    {isQuotationReceived ? (
                      <>
                        <div style={{
                          borderTop: "1px solid #d8cbdc",
                          paddingTop: 11,
                          marginTop: 4
                        }}>
                          <div style={{ fontSize: 10, color: "#216b42", fontWeight: 900 }}>
                            QUOTATION RECEIVED
                          </div>
                          <div style={{ fontSize: 12, color: "#263746", fontWeight: 700, marginTop: 5 }}>
                            {formatDate(selectedEnquiry.quotationReceivedAt)}
                          </div>
                          <div style={{ fontSize: 11, color: "#526477", marginTop: 7 }}>
                            Channel: {selectedEnquiry.quotationChannel || "—"}
                          </div>
                          {selectedEnquiry.quotationAmount !== undefined && (
                            <div style={{ fontSize: 12, color: "#263746", fontWeight: 750, marginTop: 7 }}>
                              Amount: {selectedEnquiry.quotationCurrency || "INR"}{" "}
                              {Number(selectedEnquiry.quotationAmount).toLocaleString("en-IN")}
                            </div>
                          )}
                          {selectedEnquiry.quotationNotes && (
                            <div style={{ fontSize: 11, color: "#263746", marginTop: 8, whiteSpace: "pre-wrap" }}>
                              Notes: {selectedEnquiry.quotationNotes}
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: "#526477", marginTop: 8 }}>
                            Recorded by: {selectedEnquiry.quotationReceivedBy || "—"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuotationForm((value) => !value);
                          setQuotationError("");
                        }}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "#784C83",
                          color: "#fff",
                          borderRadius: 7,
                          padding: "10px 9px",
                          fontSize: 10,
                          fontWeight: 900,
                          cursor: "pointer"
                        }}
                      >
                        {showQuotationForm ? "CANCEL" : "MARK QUOTATION RECEIVED"}
                      </button>
                    )}
                  </aside>
                </div>
              </section>

              {showQuotationForm && !isQuotationReceived && (
                <form
                  onSubmit={handleMarkQuotationReceived}
                  style={{
                    marginTop: 14,
                    padding: 15,
                    border: "1px solid #d8c5df",
                    borderRadius: 9,
                    background: "#fff"
                  }}
                >
                  <h4 style={{
                    margin: "0 0 13px",
                    color: "#784C83",
                    fontSize: 13,
                    fontWeight: 900,
                     textAlign: "left"
                  }}>
                    QUOTATION RECEIVED DETAILS
                  </h4>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: 12
                  }}>
                    <label style={{ fontSize: 11, color: "#526477", fontWeight: 800 }}>
                      RECEIVED THROUGH
                      <select
                        value={quotationChannel}
                        onChange={(event) => setQuotationChannel(event.target.value)}
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: 6,
                          padding: 9,
                          border: "1px solid #cfc2d5",
                          borderRadius: 7,
                          background: "#fff",
                          color: "#263746"
                        }}
                      >
                        {QUOTATION_CHANNELS.map((channel) => (
                          <option key={channel} value={channel}>{channel}</option>
                        ))}
                      </select>
                    </label>

                    <label style={{ fontSize: 11, color: "#526477", fontWeight: 800 }}>
                      QUOTATION AMOUNT (OPTIONAL)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quotationAmount}
                        onChange={(event) => setQuotationAmount(event.target.value)}
                        placeholder="Enter amount"
                        style={{
                          display: "block",
                          width: "100%",
                          boxSizing: "border-box",
                          marginTop: 6,
                          padding: 9,
                          border: "1px solid #cfc2d5",
                          borderRadius: 7
                        }}
                      />
                    </label>

                    <label style={{ fontSize: 11, color: "#526477", fontWeight: 800 }}>
                      CURRENCY
                      <select
                        value={quotationCurrency}
                        onChange={(event) => setQuotationCurrency(event.target.value)}
                        disabled={!quotationAmount}
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: 6,
                          padding: 9,
                          border: "1px solid #cfc2d5",
                          borderRadius: 7,
                          background: quotationAmount ? "#fff" : "#f2f2f2",
                          color: "#263746"
                        }}
                      >
                        <option value="INR">INR – Indian Rupee</option>
                        <option value="USD">USD – US Dollar</option>
                        <option value="EUR">EUR – Euro</option>
                        <option value="AED">AED – UAE Dirham</option>
                        <option value="THB">THB – Thai Baht</option>
                      </select>
                    </label>
                  </div>

                  <label style={{
                    display: "block",
                    fontSize: 11,
                    color: "#526477",
                    fontWeight: 800,
                    marginTop: 13
                  }}>
                    STAFF NOTES (OPTIONAL)
                    <textarea
                      rows={3}
                      value={quotationNotes}
                      onChange={(event) => setQuotationNotes(event.target.value)}
                      placeholder="Add quotation details, inclusions, exclusions or remarks..."
                      style={{
                        display: "block",
                        width: "100%",
                        boxSizing: "border-box",
                        marginTop: 6,
                        padding: 10,
                        border: "1px solid #cfc2d5",
                        borderRadius: 7,
                        resize: "vertical",
                        fontFamily: "inherit"
                      }}
                    />
                  </label>

                  {quotationError && (
                    <div style={{
                      marginTop: 10,
                      color: "#b4233c",
                      background: "#fff1f3",
                      borderRadius: 7,
                      padding: 9,
                      fontSize: 11
                    }}>
                      {quotationError}
                    </div>
                  )}

                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 9,
                    marginTop: 13,
                    flexWrap: "wrap"
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuotationForm(false);
                        setQuotationError("");
                      }}
                      disabled={savingQuotation}
                      style={{
                        border: "1px solid #cfc2d5",
                        background: "#fff",
                        color: "#684477",
                        borderRadius: 7,
                        padding: "9px 13px",
                        fontSize: 10,
                        fontWeight: 850,
                        cursor: "pointer"
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={savingQuotation}
                      style={{
                        border: "none",
                        background: savingQuotation ? "#9b89a3" : "#28784c",
                        color: "#fff",
                        borderRadius: 7,
                        padding: "9px 15px",
                        fontSize: 10,
                        fontWeight: 900,
                        cursor: savingQuotation ? "wait" : "pointer"
                      }}
                    >
                      {savingQuotation ? "SAVING..." : "SAVE QUOTATION RECEIVED"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
