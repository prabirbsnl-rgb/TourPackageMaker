



import React, { useState } from "react";

const SafariLodgeAccommodationForm = ({
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
  const [unitNameInputs, setUnitNameInputs] = useState({});

  const primary = theme?.primary || "#A65B32";

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
    border: `1px solid ${theme?.border || "#E8C9B8"}`,
    borderRadius: "7px",
    background: theme?.light || "#FAF1EC",
    fontSize: "13px",
    outline: "none",
  };

  const update = (id, field, value) => {
    onChange(id, field, value);
  };

  const addUnitName = (unit) => {
    const name = (unitNameInputs[unit.id] || "").trim();

    if (!name) return;

    const existingNames = unit.roomNames || [];

    if (
      existingNames.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    ) {
      return;
    }

    update(unit.id, "roomNames", [...existingNames, name]);

    setUnitNameInputs((prev) => ({
      ...prev,
      [unit.id]: "",
    }));
  };

  const removeUnitName = (unit, name) => {
    update(
      unit.id,
      "roomNames",
      (unit.roomNames || []).filter((item) => item !== name)
    );
  };

  const renderUnitInventory = (unit) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>Lodge Unit Inventory Entry</label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
          gap: "12px",
          alignItems: "start",
        }}
      >
        <select
          value={unit.roomEntryMode || "NAMES"}
          onChange={(e) => {
            const mode = e.target.value;

            update(unit.id, "roomEntryMode", mode);
            update(unit.id, "roomNames", []);
            update(unit.id, "roomCount", "");

            setUnitNameInputs((prev) => ({
              ...prev,
              [unit.id]: "",
            }));
          }}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="NAMES">Unit Names / Numbers</option>
          <option value="COUNT">Enter Unit Count</option>
        </select>

        <div
          style={{
            border: `1px solid ${theme?.border || "#E8C9B8"}`,
            borderRadius: "8px",
            padding: "9px",
            background: theme?.light || "#FAF1EC",
            minWidth: 0,
          }}
        >
          {unit.roomEntryMode !== "COUNT" ? (
            <>
              <div style={{ display: "flex", gap: "7px" }}>
                <input
                  type="text"
                  value={unitNameInputs[unit.id] || ""}
                  placeholder="Enter unit name or number"
                  onChange={(e) =>
                    setUnitNameInputs((prev) => ({
                      ...prev,
                      [unit.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUnitName(unit);
                    }
                  }}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                />

                <button
                  type="button"
                  onClick={() => addUnitName(unit)}
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

              {(unit.roomNames || []).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "7px",
                    marginTop: "8px",
                  }}
                >
                  {unit.roomNames.map((name, index) => (
                    <span
                      key={`${unit.id}-${index}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "6px 9px",
                        borderRadius: "6px",
                        background: theme?.light || light || "#F5F7FA",
                        border: `1px solid ${theme?.border || "#E8C9B8"}`,
                        color: "#444444",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {name}

                      <button
                        type="button"
                        onClick={() => removeUnitName(unit, name)}
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
                Unit count is calculated automatically.
              </div>
            </>
          ) : (
            <>
              <input
                type="number"
                min="0"
                step="1"
                value={unit.roomCount || ""}
                placeholder="Enter total number of units"
                onChange={(e) =>
                  update(unit.id, "roomCount", e.target.value)
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
                Enter the total number of units directly.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const lodgeUnitTypes = [
    "Standard Room",
    "Deluxe Room",
    "Luxury Suite",
    "Family Suite",
    "Private Cottage",
    "Chalet",
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
    roomCategories.map((unit, index) => {
      const isExpanded = expandedId === unit.id;
      const count =
        unit.roomEntryMode === "COUNT"
          ? Number(unit.roomCount) || 0
          : (unit.roomNames || []).length;

      return (
        <div
          key={unit.id}
         style={{
  border: `1px solid ${theme?.border || "#E8C9B8"}`,
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
              background: theme?.light || "#FAF1EC",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              justifyConunit: "space-between",
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
                {unit.lodgeUnitType === "Other"
                  ? unit.customLodgeUnitType || "Other Lodge Unit"
                  : unit.lodgeUnitType || `Lodge Unit ${index + 1}`}
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
                {count} UNITS
              </div>
            </div>

            <div
  style={{
    display: "flex",
    gap: "7px",
    marginLeft: "auto",
    flexShrink: 0,
  }}
>
              <button
                type="button"
                onClick={() =>
                  onExpandedChange(isExpanded ? null : unit.id)
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${theme?.border || "#E8C9B8"}`,
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
                onClick={() => onRemove(unit.id)}
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
                  <label style={labelStyle}>Lodge Unit Type</label>

                  {SearchDropdown && (
                    <SearchDropdown
                      value={unit.lodgeUnitType || ""}
                      options={lodgeUnitTypes}
                      onChange={(value) =>
                        update(unit.id, "lodgeUnitType", value)
                      }
                      placeholder="Select lodge unit type"
                      theme={theme}
                    />
                  )}

                  {unit.lodgeUnitType === "Other" && (
                    <input
                      value={unit.customLodgeUnitType || ""}
                      placeholder="Enter custom lodge unit type"
                      onChange={(e) =>
                        update(unit.id, "customLodgeUnitType", e.target.value)
                      }
                      style={{ ...inputStyle, marginTop: "8px" }}
                    />
                  )}
                </div>

                {renderUnitInventory(unit)}
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
                  <label style={labelStyle}>Bedrooms per Unit</label>
                  <input
                    type="number"
                    min="0"
                    value={unit.bedroomsPerUnit || ""}
                    placeholder="Enter number of bedrooms"
                    onChange={(e) =>
                      update(unit.id, "bedroomsPerUnit", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Bed Configuration</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={unit.bedConfiguration || []}
                      options={bedOptions}
                      onChange={(value) =>
                        update(unit.id, "bedConfiguration", value)
                      }
                      placeholder="Select bed configuration"
                      theme={theme}
                    />
                  )}
                </div>

                {(unit.bedConfiguration || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Bed Configuration</label>
                    <input
                      value={unit.customBedConfiguration || ""}
                      placeholder="Enter bed configuration"
                      onChange={(e) =>
                        update(
                          unit.id,
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
                    value={unit.maximumAdults || ""}
                    placeholder="Enter maximum adults"
                    onChange={(e) =>
                      update(unit.id, "maximumAdults", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Maximum Children</label>
                  <input
                    type="number"
                    min="0"
                    value={unit.maximumChildren || ""}
                    placeholder="Enter maximum children"
                    onChange={(e) =>
                      update(unit.id, "maximumChildren", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Extra Bed Availability</label>
                  <select
                    value={unit.extraBedAvailable || ""}
                    onChange={(e) =>
                      update(unit.id, "extraBedAvailable", e.target.value)
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
                  <label style={labelStyle}>Bathroom Type</label>
                  <select
                    value={unit.bathroomType || ""}
                    onChange={(e) =>
                      update(unit.id, "bathroomType", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Select bathroom arrangement</option>
                    <option value="Ensuite">Ensuite</option>
                    <option value="Shared Bathroom">Shared Bathroom</option>
                    <option value="Outdoor Bathroom">Outdoor Bathroom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {unit.bathroomType === "Other" && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Bathroom Type</label>
                    <input
                      value={unit.customBathroomType || ""}
                      placeholder="Enter bathroom type"
                      onChange={(e) =>
                        update(unit.id, "customBathroomType", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Meal Arrangements</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={unit.mealPlans || []}
                      options={mealOptions}
                      onChange={(value) =>
                        update(unit.id, "mealPlans", value)
                      }
                      placeholder="Select meal arrangements"
                      theme={theme}
                    />
                  )}
                </div>

                {(unit.mealPlans || []).includes("Custom") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Custom Meal Arrangement</label>
                    <input
                      value={unit.customMealPlan || ""}
                      placeholder="Describe meal arrangement"
                      onChange={(e) =>
                        update(unit.id, "customMealPlan", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Unit Amenities</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={unit.amenities || []}
                      options={amenityOptions}
                      onChange={(value) =>
                        update(unit.id, "amenities", value)
                      }
                      placeholder="Select unit amenities"
                      theme={theme}
                    />
                  )}
                </div>

                {(unit.amenities || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Lodge Unit Amenities</label>
                    <input
                      value={unit.customAmenities || ""}
                      placeholder="Enter additional unit amenities"
                      onChange={(e) =>
                        update(unit.id, "customAmenities", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              <div style={{ ...fieldStyle, marginTop: "15px" }}>
                <label style={labelStyle}>Unit Photos</label>
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

                    update(unit.id, "photos", [
                      ...(unit.photos || []),
                      ...photos,
                    ]);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />

                {(unit.photos || []).length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    {unit.photos.map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          width: "105px",
                          border: `1px solid ${theme?.border || "#E8C9B8"}`,
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
                              unit.id,
                              "photos",
                              (unit.photos || []).filter(
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
                <label style={labelStyle}>Unit Description</label>
                <textarea
                  rows={3}
                  value={unit.description || ""}
                  placeholder="Describe this lodge unit category and its features"
                  onChange={(e) =>
                    update(unit.id, "description", e.target.value)
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
        background: theme?.light || "#FAF1EC",
        border: `1px solid ${theme?.border || "#E8C9B8"}`,
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
          No lodge unit categories added yet.
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
        + ADD LODGE UNIT CATEGORY
      </button>
    </div>
  );
};

export default SafariLodgeAccommodationForm;
