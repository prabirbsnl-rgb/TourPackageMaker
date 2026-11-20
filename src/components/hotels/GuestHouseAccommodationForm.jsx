



import React, { useState } from "react";

const GuestHouseAccommodationForm = ({
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
  const [roomNameInputs, setRoomNameInputs] = useState({});

  const primary = theme?.primary || "#397A9C";

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
    border: `1px solid ${theme?.border || "#C2DCE9"}`,
    borderRadius: "7px",
    background: theme?.light || "#EDF5F9",
    fontSize: "13px",
    outline: "none",
  };

  const update = (id, field, value) => {
    onChange(id, field, value);
  };

  const addRoomName = (room) => {
    const name = (roomNameInputs[room.id] || "").trim();

    if (!name) return;

    const existingNames = room.roomNames || [];

    if (
      existingNames.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    ) {
      return;
    }

    update(room.id, "roomNames", [...existingNames, name]);

    setRoomNameInputs((prev) => ({
      ...prev,
      [room.id]: "",
    }));
  };

  const removeRoomName = (room, name) => {
    update(
      room.id,
      "roomNames",
      (room.roomNames || []).filter((item) => item !== name)
    );
  };

  const renderUnitInventory = (room) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>Guest House Room Inventory Entry</label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
          gap: "12px",
          alignItems: "start",
        }}
      >
        <select
          value={room.roomEntryMode || "NAMES"}
          onChange={(e) => {
            const mode = e.target.value;

            update(room.id, "roomEntryMode", mode);
            update(room.id, "roomNames", []);
            update(room.id, "roomCount", "");

            setRoomNameInputs((prev) => ({
              ...prev,
              [room.id]: "",
            }));
          }}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="NAMES">Room Names / Numbers</option>
          <option value="COUNT">Enter Room Count</option>
        </select>

        <div
          style={{
            border: `1px solid ${theme?.border || "#C2DCE9"}`,
            borderRadius: "8px",
            padding: "9px",
            background: theme?.light || "#EDF5F9",
            minWidth: 0,
          }}
        >
          {room.roomEntryMode !== "COUNT" ? (
            <>
              <div style={{ display: "flex", gap: "7px" }}>
                <input
                  type="text"
                  value={roomNameInputs[room.id] || ""}
                  placeholder="Enter room name or number"
                  onChange={(e) =>
                    setRoomNameInputs((prev) => ({
                      ...prev,
                      [room.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRoomName(room);
                    }
                  }}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                />

                <button
                  type="button"
                  onClick={() => addRoomName(room)}
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

              {(room.roomNames || []).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "7px",
                    marginTop: "8px",
                  }}
                >
                  {room.roomNames.map((name, index) => (
                    <span
                      key={`${room.id}-${index}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "6px 9px",
                        borderRadius: "6px",
                        background: theme?.light || light || "#F5F7FA",
                        border: `1px solid ${theme?.border || "#C2DCE9"}`,
                        color: "#444444",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {name}

                      <button
                        type="button"
                        onClick={() => removeRoomName(room, name)}
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
                Room count is calculated automatically.
              </div>
            </>
          ) : (
            <>
              <input
                type="number"
                min="0"
                step="1"
                value={room.roomCount || ""}
                placeholder="Enter total number of rooms"
                onChange={(e) =>
                  update(room.id, "roomCount", e.target.value)
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
                Enter the total number of rooms directly.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const roomTypes = [
    "Standard Room",
    "Deluxe Room",
    "Super Deluxe Room",
    "Family Room",
    "Suite",
    "Dormitory",
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
    roomCategories.map((room, index) => {
      const isExpanded = expandedId === room.id;
      const count =
        room.roomEntryMode === "COUNT"
          ? Number(room.roomCount) || 0
          : (room.roomNames || []).length;

      return (
        <div
          key={room.id}
          style={{
            border: `1px solid ${theme?.border || "#C2DCE9"}`,
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
              background: theme?.light || "#EDF5F9",
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
                {room.roomType === "Other"
                  ? room.customRoomType || "Other Room Type"
                  : room.roomType || `Room ${index + 1}`}
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
                {count} ROOMS
              </div>
            </div>

            <div style={{ display: "flex", gap: "7px" }}>
              <button
                type="button"
                onClick={() =>
                  onExpandedChange(isExpanded ? null : room.id)
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${theme?.border || "#C2DCE9"}`,
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
                onClick={() => onRemove(room.id)}
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
                  <label style={labelStyle}>Room Type</label>

                  {SearchDropdown && (
                    <SearchDropdown
                      value={room.roomType || ""}
                      options={roomTypes}
                      onChange={(value) =>
                        update(room.id, "roomType", value)
                      }
                      placeholder="Select room type"
                      theme={theme}
                    />
                  )}

                  {room.roomType === "Other" && (
                    <input
                      value={room.customRoomType || ""}
                      placeholder="Enter custom room type"
                      onChange={(e) =>
                        update(room.id, "customRoomType", e.target.value)
                      }
                      style={{ ...inputStyle, marginTop: "8px" }}
                    />
                  )}
                </div>

                {renderUnitInventory(room)}
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
                  <label style={labelStyle}>Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={room.bedrooms || ""}
                    placeholder="Enter number of bedrooms"
                    onChange={(e) =>
                      update(room.id, "bedrooms", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Bed Configuration</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={room.bedConfiguration || []}
                      options={bedOptions}
                      onChange={(value) =>
                        update(room.id, "bedConfiguration", value)
                      }
                      placeholder="Select bed configuration"
                      theme={theme}
                    />
                  )}
                </div>

                {(room.bedConfiguration || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Bed Configuration</label>
                    <input
                      value={room.customBedConfiguration || ""}
                      placeholder="Enter bed configuration"
                      onChange={(e) =>
                        update(
                          room.id,
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
                    value={room.maximumAdults || ""}
                    placeholder="Enter maximum adults"
                    onChange={(e) =>
                      update(room.id, "maximumAdults", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Maximum Children</label>
                  <input
                    type="number"
                    min="0"
                    value={room.maximumChildren || ""}
                    placeholder="Enter maximum children"
                    onChange={(e) =>
                      update(room.id, "maximumChildren", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Extra Bed Availability</label>
                  <select
                    value={room.extraBedAvailable || ""}
                    onChange={(e) =>
                      update(room.id, "extraBedAvailable", e.target.value)
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
                    value={room.bathroomType || ""}
                    onChange={(e) =>
                      update(room.id, "bathroomType", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Select bathroom type</option>
                    <option value="Attached">Attached</option>
                    <option value="Shared">Shared</option>
                    <option value="Common">Common</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {room.bathroomType === "Other" && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Bathroom Type</label>
                    <input
                      value={room.customBathroomType || ""}
                      placeholder="Enter bathroom type"
                      onChange={(e) =>
                        update(room.id, "customBathroomType", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Meal Arrangements</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={room.mealPlans || []}
                      options={mealOptions}
                      onChange={(value) =>
                        update(room.id, "mealPlans", value)
                      }
                      placeholder="Select meal arrangements"
                      theme={theme}
                    />
                  )}
                </div>

                {(room.mealPlans || []).includes("Custom") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Custom Meal Arrangement</label>
                    <input
                      value={room.customMealPlan || ""}
                      placeholder="Describe meal arrangement"
                      onChange={(e) =>
                        update(room.id, "customMealPlan", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={fieldStyle}>
                  <label style={labelStyle}>Room Amenities</label>
                  {MultiSelectDropdown && (
                    <MultiSelectDropdown
                      values={room.amenities || []}
                      options={amenityOptions}
                      onChange={(value) =>
                        update(room.id, "amenities", value)
                      }
                      placeholder="Select room amenities"
                      theme={theme}
                    />
                  )}
                </div>

                {(room.amenities || []).includes("Other") && (
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Other Room Amenities</label>
                    <input
                      value={room.customAmenities || ""}
                      placeholder="Enter additional room amenities"
                      onChange={(e) =>
                        update(room.id, "customAmenities", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              <div style={{ ...fieldStyle, marginTop: "15px" }}>
                <label style={labelStyle}>Room Photos</label>
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

                    update(room.id, "photos", [
                      ...(room.photos || []),
                      ...photos,
                    ]);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />

                {(room.photos || []).length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    {room.photos.map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          width: "105px",
                          border: `1px solid ${theme?.border || "#C2DCE9"}`,
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
                              room.id,
                              "photos",
                              (room.photos || []).filter(
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
                <label style={labelStyle}>Room Description</label>
                <textarea
                  rows={3}
                  value={room.description || ""}
                  placeholder="Describe this room category and its features"
                  onChange={(e) =>
                    update(room.id, "description", e.target.value)
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
        background: theme?.light || "#EDF5F9",
        border: `1px solid ${theme?.border || "#C2DCE9"}`,
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
          No room categories added yet.
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
        + ADD ROOM CATEGORY
      </button>
    </div>
  );
};

export default GuestHouseAccommodationForm;
