



import React, { useState } from "react";

const SafariCampAccommodationForm = ({
  roomCategories = [],
  onAdd,
  onChange,
  onRemove,
  expandedId,
  onExpandedChange,
  theme,
  SearchDropdown,
  MultiSelectDropdown,
}) => {
  const [tentNameInputs, setTentNameInputs] = useState({});

  const primary = theme?.primary || "#47734A";

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  };

  const labelStyle = {
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: `1px solid ${theme?.border || "#D8C7EA"}`,
    borderRadius: "7px",
    background: theme?.light || "#F4EFFA",
    fontSize: "13px",
    outline: "none",
  };

  const update = (id, field, value) => {
    onChange(id, field, value);
  };

  const addTentName = (tent) => {
    const name = (tentNameInputs[tent.id] || "").trim();

    if (!name) return;

    const existingNames = tent.roomNames || [];

    if (
      existingNames.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    ) {
      return;
    }

    update(tent.id, "roomNames", [...existingNames, name]);

    setTentNameInputs((prev) => ({
      ...prev,
      [tent.id]: "",
    }));
  };

  const removeTentName = (tent, name) => {
    update(
      tent.id,
      "roomNames",
      (tent.roomNames || []).filter((item) => item !== name)
    );
  };

  const renderTentInventory = (tent) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>Tent Inventory Entry</label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
          gap: "12px",
          alignItems: "start",
        }}
      >
        <select
          value={tent.roomEntryMode || "NAMES"}
          onChange={(e) => {
            const mode = e.target.value;

            update(tent.id, "roomEntryMode", mode);
            update(tent.id, "roomNames", []);
            update(tent.id, "roomCount", "");

            setTentNameInputs((prev) => ({
              ...prev,
              [tent.id]: "",
            }));
          }}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="NAMES">Tent Names / Numbers</option>
          <option value="COUNT">Enter Tent Count</option>
        </select>

        <div
          style={{
            border: `1px solid ${theme?.border || "#D8C7EA"}`,
            borderRadius: "8px",
            padding: "9px",
            background: theme?.light || "#F4EFFA",
            minWidth: 0,
          }}
        >
          {tent.roomEntryMode !== "COUNT" ? (
            <>
              <div style={{ display: "flex", gap: "7px" }}>
                <input
                  type="text"
                  value={tentNameInputs[tent.id] || ""}
                  placeholder="Enter tent name or number"
                  onChange={(e) =>
                    setTentNameInputs((prev) => ({
                      ...prev,
                      [tent.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTentName(tent);
                    }
                  }}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                />

                <button
                  type="button"
                  onClick={() => addTentName(tent)}
                  style={{
                    padding: "0 15px",
                    border: "none",
                    borderRadius: "7px",
                    background: primary,
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Add
                </button>
              </div>

              {(tent.roomNames || []).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "7px",
                    marginTop: "8px",
                  }}
                >
                  {tent.roomNames.map((name, index) => (
                    <span
                      key={`${tent.id}-${index}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "6px 9px",
                        borderRadius: "6px",
                        background: theme?.light || light || "#F5F7FA",
                        border: `1px solid ${theme?.border || "#D8C7EA"}`,
                        color: "#444444",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {name}

                      <button
                        type="button"
                        onClick={() => removeTentName(tent, name)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#A33A3A",
                          cursor: "pointer",
                          fontWeight: 700,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "11px",
                  color: "#777777",
                }}
              >
                Tent count is calculated automatically.
              </div>
            </>
          ) : (
            <>
              <input
                type="number"
                min="0"
                step="1"
                value={tent.roomCount || ""}
                placeholder="Enter total number of tents"
                onChange={(e) =>
                  update(tent.id, "roomCount", e.target.value)
                }
                style={inputStyle}
              />

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "11px",
                  color: "#777777",
                }}
              >
                Enter the total number of tents directly.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const tentTypes = [
    "Luxury Safari Tent",
    "Standard Safari Tent",
    "Family Safari Tent",
    "Meru Tent",
    "Mobile Tent",
    "Premium Safari Tent",
    "Other",
  ];

  const bedOptions = [
    "Single Bed",
    "Twin Beds",
    "Double Bed",
    "Queen Bed",
    "King Bed",
    "Hollywood Twin",
    "Bunk Bed",
    "Sofa Bed",
    "Other",
  ];

  const mealOptions = [
    "EP - Room Only",
    "CP - Breakfast",
    "MAP - Breakfast + Lunch or Dinner",
    "AP - Breakfast + Lunch + Dinner",
    "Custom",
  ];

  const amenityOptions = [
    "Air Conditioning",
    "Free Wi-Fi",
    "Television",
    "Private Kitchen",
    "Living Room",
    "Dining Area",
    "Private Balcony",
    "Garden",
    "Refrigerator",
    "Washing Machine",
    "Private Parking",
    "Other",
  ];

  const renderCards = () =>
    roomCategories.map((tent, index) => {
      const isExpanded = expandedId === tent.id;
      const count =
        tent.roomEntryMode === "COUNT"
          ? Number(tent.roomCount) || 0
          : (tent.roomNames || []).length;

      return (
        <div
          key={tent.id}
          
style={{
  border: `1px solid ${theme?.border || "#D8C7EA"}`,
  borderLeft: `5px solid ${primary}`,
  borderRadius: "9px",
  marginBottom: "12px",
  overflow: "visible",
  background: "#FFFFFF",
}}

        >
          <div
            style={{
              padding: "10px 12px",
              background: theme?.light || "#F4EFFA",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: primary,
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                {String(index + 1).padStart(2, "0")}.{" "}
                {tent.tentType === "Other"
                  ? tent.customTentType || "Other Tent"
                  : tent.tentType || `Tent Category ${index + 1}`}
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: "6px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  border: `1px solid ${primary}`,
                  color: primary,
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {count} TENTS
              </div>
            </div>

            <div style={{ display: "flex", gap: "7px" }}>
              <button
                type="button"
                onClick={() =>
                  onExpandedChange(isExpanded ? null : tent.id)
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${theme?.border || "#D8C7EA"}`,
                  background: "#FFFFFF",
                  color: primary,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </button>

              <button
                type="button"
                onClick={() => onRemove(tent.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #F2B8B8",
                  background: "#FFF5F5",
                  color: "#B42318",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>

          {isExpanded && (
            <div style={{ padding: "15px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1fr) minmax(0, 2.5fr)",
                  gap: "14px",
                  alignItems: "start",
                }}
              >
                <div style={fieldStyle}>
                  <label style={labelStyle}>Tent Type</label>

                  {SearchDropdown && (
                    <SearchDropdown
                      value={tent.tentType || ""}
                      options={tentTypes}
                      onChange={(value) =>
                        update(tent.id, "tentType", value)
                      }
                      placeholder="Select tent type"
                      theme={theme}
                    />
                  )}

                  {tent.tentType === "Other" && (
                    <input
                      value={tent.customTentType || ""}
                      placeholder="Enter custom tent type"
                      onChange={(e) =>
                        update(tent.id, "customTentType", e.target.value)
                      }
                      style={{ ...inputStyle, marginTop: "8px" }}
                    />
                  )}
                </div>

                {renderTentInventory(tent)}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  marginTop: "15px",
                }}
              >
                <div style={fieldStyle}>
                  <label style={labelStyle}>Beds per Tent</label>
                  <input
                    type="number"
                    min="0"
                    value={tent.bedsPerTent || ""}
                    placeholder="Enter number of beds"
                    onChange={(e) =>
                      update(tent.id, "bedsPerTent", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Bed Configuration</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={tent.bedConfiguration || []}
                      options={bedOptions}
                      onChange={(value) =>
                        update(tent.id, "bedConfiguration", value)
                      }
                      placeholder="Select bed configuration"
                      theme={theme}
                    />
                  )}
                </div>

                {(tent.bedConfiguration || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Bed Configuration</label>
                    <input
                      value={tent.customBedConfiguration || ""}
                      placeholder="Enter bed configuration"
                      onChange={(e) =>
                        update(
                          tent.id,
                          "customBedConfiguration",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Maximum Adults</label>
                  <input
                    type="number"
                    min="0"
                    value={tent.maximumAdults || ""}
                    placeholder="Enter maximum adults"
                    onChange={(e) =>
                      update(tent.id, "maximumAdults", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Maximum Children</label>
                  <input
                    type="number"
                    min="0"
                    value={tent.maximumChildren || ""}
                    placeholder="Enter maximum children"
                    onChange={(e) =>
                      update(tent.id, "maximumChildren", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Extra Bed Availability</label>
                  <select
                    value={tent.extraBedAvailable || ""}
                    onChange={(e) =>
                      update(tent.id, "extraBedAvailable", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Select availability</option>
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                    <option value="On Request">On Request</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Private Bathroom</label>
                  <select
                    value={tent.privateBathroom || ""}
                    onChange={(e) =>
                      update(tent.id, "privateBathroom", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Select bathroom arrangement</option>
                    <option value="No Bathroom">No Bathroom</option>
                    <option value="Ensuite">Ensuite (Private Bathroom)</option>
                    <option value="Shared">Shared Bathroom</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Meal Arrangements</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={tent.mealPlans || []}
                      options={mealOptions}
                      onChange={(value) =>
                        update(tent.id, "mealPlans", value)
                      }
                      placeholder="Select meal arrangements"
                      theme={theme}
                    />
                  )}
                </div>

                {(tent.mealPlans || []).includes("Custom") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Custom Meal Arrangement</label>
                    <input
                      value={tent.customMealPlan || ""}
                      placeholder="Describe meal arrangement"
                      onChange={(e) =>
                        update(tent.id, "customMealPlan", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Tent Amenities</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={tent.amenities || []}
                      options={amenityOptions}
                      onChange={(value) =>
                        update(tent.id, "amenities", value)
                      }
                      placeholder="Select tent amenities"
                      theme={theme}
                    />
                  )}
                </div>

                {(tent.amenities || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Tent Amenities</label>
                    <input
                      value={tent.customAmenities || ""}
                      placeholder="Enter additional amenities"
                      onChange={(e) =>
                        update(tent.id, "customAmenities", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              <div style={{ ...fieldStyle, marginTop: "15px" }}>
                <label style={labelStyle}>Tent Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const photos = files.map((file) => ({
                      id: `${Date.now()}-${Math.random()}`,
                      name: file.name,
                      url: URL.createObjectURL(file),
                    }));

                    update(tent.id, "photos", [
                      ...(tent.photos || []),
                      ...photos,
                    ]);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />

                {(tent.photos || []).length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    {tent.photos.map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          width: "105px",
                          border: `1px solid ${theme?.border || "#D8C7EA"}`,
                          borderRadius: "7px",
                          padding: "5px",
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          style={{
                            width: "100%",
                            height: "65px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                        <div
                          style={{
                            fontSize: "10px",
                            overflowWrap: "anywhere",
                            marginTop: "4px",
                          }}
                        >
                          {photo.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(photo.url);
                            update(
                              tent.id,
                              "photos",
                              (tent.photos || []).filter(
                                (item) => item.id !== photo.id
                              )
                            );
                          }}
                          style={{
                            marginTop: "4px",
                            border: "none",
                            background: "transparent",
                            color: "#B42318",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...fieldStyle, marginTop: "15px" }}>
                <label style={labelStyle}>Tent Description</label>
                <textarea
                  rows={3}
                  value={tent.description || ""}
                  placeholder="Describe this tent category and its features"
                  onChange={(e) =>
                    update(tent.id, "description", e.target.value)
                  }
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );
    });

  return (
    <div
      style={{
        padding: "16px",
        background: theme?.light || "#F4EFFA",
        border: `1px solid ${theme?.border || "#D8C7EA"}`,
        borderRadius: "9px",
      }}
    >
      {roomCategories.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#64748B",
            fontSize: "13px",
          }}
        >
          No tent categories added yet.
        </div>
      ) : (
        renderCards()
      )}

      <button
        type="button"
        onClick={onAdd}
        style={{
          width: "100%",
          padding: "11px",
          border: `1px dashed ${primary}`,
          borderRadius: "7px",
          background: "#FFFFFF",
          color: primary,
          fontSize: "12px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        + ADD TENT CATEGORY
      </button>
    </div>
  );
};

export default SafariCampAccommodationForm;
