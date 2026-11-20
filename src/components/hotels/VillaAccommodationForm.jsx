



import React, { useState } from "react";

const VillaAccommodationForm = ({
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
  const [villaNameInputs, setVillaNameInputs] = useState({});

  const primary = theme?.primary || "#7041A6";

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

  const addVillaName = (villa) => {
    const name = (villaNameInputs[villa.id] || "").trim();

    if (!name) return;

    const existingNames = villa.roomNames || [];

    if (
      existingNames.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    ) {
      return;
    }

    update(villa.id, "roomNames", [...existingNames, name]);

    setVillaNameInputs((prev) => ({
      ...prev,
      [villa.id]: "",
    }));
  };

  const removeVillaName = (villa, name) => {
    update(
      villa.id,
      "roomNames",
      (villa.roomNames || []).filter((item) => item !== name)
    );
  };

  const renderVillaInventory = (villa) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>Villa Inventory Entry</label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
          gap: "12px",
          alignItems: "start",
        }}
      >
        <select
          value={villa.roomEntryMode || "NAMES"}
          onChange={(e) => {
            const mode = e.target.value;

            update(villa.id, "roomEntryMode", mode);
            update(villa.id, "roomNames", []);
            update(villa.id, "roomCount", "");

            setVillaNameInputs((prev) => ({
              ...prev,
              [villa.id]: "",
            }));
          }}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="NAMES">Villa Names / Numbers</option>
          <option value="COUNT">Enter Villa Count</option>
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
          {villa.roomEntryMode !== "COUNT" ? (
            <>
              <div style={{ display: "flex", gap: "7px" }}>
                <input
                  type="text"
                  value={villaNameInputs[villa.id] || ""}
                  placeholder="Enter villa name or number"
                  onChange={(e) =>
                    setVillaNameInputs((prev) => ({
                      ...prev,
                      [villa.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVillaName(villa);
                    }
                  }}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                />

                <button
                  type="button"
                  onClick={() => addVillaName(villa)}
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

              {(villa.roomNames || []).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "7px",
                    marginTop: "8px",
                  }}
                >
                  {villa.roomNames.map((name, index) => (
                    <span
                      key={`${villa.id}-${index}`}
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
                        onClick={() => removeVillaName(villa, name)}
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
                Villa count is calculated automatically.
              </div>
            </>
          ) : (
            <>
              <input
                type="number"
                min="0"
                step="1"
                value={villa.roomCount || ""}
                placeholder="Enter total number of villas"
                onChange={(e) =>
                  update(villa.id, "roomCount", e.target.value)
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
                Enter the total number of villas directly.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const villaTypes = [
    "Private Pool Villa",
    "Garden Villa",
    "Family Villa",
    "Beach Villa",
    "Duplex Villa",
    "Luxury Villa",
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
    roomCategories.map((villa, index) => {
      const isExpanded = expandedId === villa.id;
      const count =
        villa.roomEntryMode === "COUNT"
          ? Number(villa.roomCount) || 0
          : (villa.roomNames || []).length;

      return (
        <div
          key={villa.id}
          
style={{
  border: `1px solid ${theme?.border || "#D8C7EA"}`,
  borderLeft: `4px solid ${primary}`,
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
                {villa.villaType === "Other"
                  ? villa.customVillaType || "Other Villa"
                  : villa.villaType || `Villa Category ${index + 1}`}
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
                {count} VILLAS
              </div>
            </div>

            <div style={{ display: "flex", gap: "7px" }}>
              <button
                type="button"
                onClick={() =>
                  onExpandedChange(isExpanded ? null : villa.id)
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
                onClick={() => onRemove(villa.id)}
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
                  <label style={labelStyle}>Villa Type</label>

                  {SearchDropdown && (
                    <SearchDropdown
                      value={villa.villaType || ""}
                      options={villaTypes}
                      onChange={(value) =>
                        update(villa.id, "villaType", value)
                      }
                      placeholder="Select villa type"
                      theme={theme}
                    />
                  )}

                  {villa.villaType === "Other" && (
                    <input
                      value={villa.customVillaType || ""}
                      placeholder="Enter custom villa type"
                      onChange={(e) =>
                        update(villa.id, "customVillaType", e.target.value)
                      }
                      style={{ ...inputStyle, marginTop: "8px" }}
                    />
                  )}
                </div>

                {renderVillaInventory(villa)}
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
                  <label style={labelStyle}>Bedrooms per Villa</label>
                  <input
                    type="number"
                    min="0"
                    value={villa.bedroomsPerVilla || ""}
                    placeholder="Enter number of bedrooms"
                    onChange={(e) =>
                      update(villa.id, "bedroomsPerVilla", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Bed Configuration</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={villa.bedConfiguration || []}
                      options={bedOptions}
                      onChange={(value) =>
                        update(villa.id, "bedConfiguration", value)
                      }
                      placeholder="Select bed configuration"
                      theme={theme}
                    />
                  )}
                </div>

                {(villa.bedConfiguration || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Bed Configuration</label>
                    <input
                      value={villa.customBedConfiguration || ""}
                      placeholder="Enter bed configuration"
                      onChange={(e) =>
                        update(
                          villa.id,
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
                    value={villa.maximumAdults || ""}
                    placeholder="Enter maximum adults"
                    onChange={(e) =>
                      update(villa.id, "maximumAdults", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Maximum Children</label>
                  <input
                    type="number"
                    min="0"
                    value={villa.maximumChildren || ""}
                    placeholder="Enter maximum children"
                    onChange={(e) =>
                      update(villa.id, "maximumChildren", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Extra Bed Availability</label>
                  <select
                    value={villa.extraBedAvailable || ""}
                    onChange={(e) =>
                      update(villa.id, "extraBedAvailable", e.target.value)
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
                  <label style={labelStyle}>Pool Type</label>
                  <select
                    value={villa.poolType || ""}
                    onChange={(e) =>
                      update(villa.id, "poolType", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Select pool type</option>
                    <option value="No Pool">No Pool</option>
                    <option value="Private Pool">Private Pool</option>
                    <option value="Shared Pool">Shared Pool</option>
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Meal Arrangements</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={villa.mealPlans || []}
                      options={mealOptions}
                      onChange={(value) =>
                        update(villa.id, "mealPlans", value)
                      }
                      placeholder="Select meal arrangements"
                      theme={theme}
                    />
                  )}
                </div>

                {(villa.mealPlans || []).includes("Custom") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Custom Meal Arrangement</label>
                    <input
                      value={villa.customMealPlan || ""}
                      placeholder="Describe meal arrangement"
                      onChange={(e) =>
                        update(villa.id, "customMealPlan", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Villa Amenities</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={villa.amenities || []}
                      options={amenityOptions}
                      onChange={(value) =>
                        update(villa.id, "amenities", value)
                      }
                      placeholder="Select villa amenities"
                      theme={theme}
                    />
                  )}
                </div>

                {(villa.amenities || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Villa Amenities</label>
                    <input
                      value={villa.customAmenities || ""}
                      placeholder="Enter additional amenities"
                      onChange={(e) =>
                        update(villa.id, "customAmenities", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              <div style={{ ...fieldStyle, marginTop: "15px" }}>
                <label style={labelStyle}>Villa Photos</label>
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

                    update(villa.id, "photos", [
                      ...(villa.photos || []),
                      ...photos,
                    ]);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />

                {(villa.photos || []).length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    {villa.photos.map((photo) => (
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
                              villa.id,
                              "photos",
                              (villa.photos || []).filter(
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
                <label style={labelStyle}>Villa Description</label>
                <textarea
                  rows={3}
                  value={villa.description || ""}
                  placeholder="Describe this villa category and its features"
                  onChange={(e) =>
                    update(villa.id, "description", e.target.value)
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
          No villa categories added yet.
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
        + ADD VILLA CATEGORY
      </button>
    </div>
  );
};

export default VillaAccommodationForm;
