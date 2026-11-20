



import React, { useState } from "react";

const HomestayAccommodationForm = ({
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

  const primary = theme?.primary || "#B7791F";
  const light = theme?.light || "#FBF5E9";
  const border = theme?.border || "#E9D5A9";

  const roomTypes = [
    "Standard Room",
    "Deluxe Room",
    "Super Deluxe Room",
    "Family Room",
    "Traditional Room",
    "Cottage",
    "Suite",
    "Other",
  ];

  const bedOptions = [
    "Single Bed",
    "Twin Beds",
    "Double Bed",
    "Queen Bed",
    "King Bed",
    "Bunk Bed",
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
    "Attached Bathroom",
    "Balcony",
    "Refrigerator",
    "Tea / Coffee Maker",
    "Wardrobe",
    "Work Desk",
    "Room Heater",
    "Kitchen Access",
    "Other",
  ];

  const inputStyle = {
    width: "100%",
    height: "42px",
    boxSizing: "border-box",
    padding: "0 11px",
    border: `1px solid ${border}`,
    borderRadius: "7px",
    background: light,
    fontSize: "13px",
    outlineColor: primary,
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  };

  const update = (roomId, field, value) => {
    onChange(roomId, field, value);
  };

  const renderInput = (
    room,
    field,
    label,
    type = "text",
    placeholder = ""
  ) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={room[field] ?? ""}
        placeholder={placeholder}
        onChange={(e) => update(room.id, field, e.target.value)}
        style={inputStyle}
      />
    </div>
  );

  const addRoomName = (room) => {
    const name = (roomNameInputs[room.id] || "").trim();
    if (!name) return;

    const existing = room.roomNames || [];

    if (
      existing.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    ) {
      return;
    }

    update(room.id, "roomNames", [...existing, name]);

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



  const renderRoomNames = (room) => (
 <div style={fieldStyle}>
    <label style={labelStyle}>Room Inventory Entry</label>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
        gap: "12px",
        alignItems: "start",
      }}
    >
      {/* Left: Entry Method */}
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
        style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
      >
        <option value="NAMES">Room Names / Numbers</option>
        <option value="COUNT">Enter Room Count</option>
      </select>

      {/* Right: Consistent Inventory Tray */}
      <div
        style={{
          border: `1px solid ${theme?.border || "#E9D5A9"}`,
          borderRadius: "8px",
          padding: "9px",
          background: theme?.light || "#FBF5E9",
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
                      border: `1px solid ${theme?.border || "#E9D5A9"}`,
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

            <div style={{ marginTop: "6px", fontSize: "11px", color: "#777777" }}>
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
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#777777" }}>
              Enter the total number of rooms directly.
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);



  const renderPhotos = (room) => {
    const photos = room.photos || [];

    const addPhotos = (event) => {
      const files = Array.from(event.target.files || []);

      const newPhotos = files.map((file) => ({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        url: URL.createObjectURL(file),
      }));

      update(room.id, "photos", [...photos, ...newPhotos]);
      event.target.value = "";
    };

    const removePhoto = (photoId) => {
      const photo = photos.find((item) => item.id === photoId);
      if (photo?.url) URL.revokeObjectURL(photo.url);

      update(
        room.id,
        "photos",
        photos.filter((item) => item.id !== photoId)
      );
    };

    return (
      <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Room Photos (Optional)</label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={addPhotos}
          style={{ ...inputStyle, padding: "7px" }}
        />

        {photos.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  width: "105px",
                  padding: "6px",
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  background: "#FFFFFF",
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    width: "100%",
                    height: "72px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />

                <div
                  title={photo.name}
                  style={{
                    margin: "5px 0",
                    fontSize: "10px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {photo.name}
                </div>

                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    type="button"
                    onClick={() => window.open(photo.url, "_blank")}
                    style={{
                      flex: 1,
                      padding: "4px",
                      border: `1px solid ${border}`,
                      borderRadius: "4px",
                      background: light,
                      color: primary,
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    style={{
                      padding: "4px 6px",
                      border: "1px solid #E8BDBD",
                      borderRadius: "4px",
                      background: "#FFF3F3",
                      color: "#B42318",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "16px",
        border: `1px solid ${border}`,
        borderRadius: "10px",
        background: "#FFFFFF",
      }}
    >
      {roomCategories.length === 0 ? (
        <div
          style={{
            padding: "25px 15px",
            textAlign: "center",
            background: light,
            borderRadius: "8px",
            color: "#526273",
            fontSize: "13px",
          }}
        >
          No homestay room categories added yet.
          <div style={{ marginTop: "7px" }}>
            Add your first guest room category below.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {roomCategories.map((room, index) => {
            const isExpanded = expandedId === room.id;
            const count = (room.roomNames || []).length;

            const title =
              room.roomType === "Other"
                ? room.customRoomType || "Custom Room Type"
                : room.roomType || `Room Category ${index + 1}`;

            return (
              <div
                key={room.id}
                
style={{
  border: `1px solid ${border}`,
  borderLeft: `5px solid ${primary}`,
  borderRadius: "9px",
}}

              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "11px 13px",
                    background: light,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: primary,
                        fontWeight: 800,
                        fontSize: "13px",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}. {title}
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
                      {room.roomEntryMode === "COUNT"
  ? `${Number(room.roomCount) || 0} ROOMS`
  : `${(room.roomNames || []).length} ROOMS`}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "7px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        onExpandedChange(isExpanded ? null : room.id)
                      }
                      style={{
                        padding: "6px 11px",
                        border: `1px solid ${border}`,
                        borderRadius: "6px",
                        background: "#FFFFFF",
                        color: primary,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      {isExpanded ? "Collapse" : "Edit"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(room.id)}
                      style={{
                        padding: "6px 11px",
                        border: "1px solid #E8BDBD",
                        borderRadius: "6px",
                        background: "#FFF3F3",
                        color: "#B42318",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "11px",
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
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "14px",
                      }}
                    >
                                          <div
  style={{
    gridColumn: "1 / -1",
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
        onChange={(value) => update(room.id, "roomType", value)}
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

  {renderRoomNames(room)}
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

                      {renderInput(
                        room,
                        "maximumAdults",
                        "Maximum Adults",
                        "number",
                        "Enter maximum adults"
                      )}

                      {renderInput(
                        room,
                        "maximumChildren",
                        "Maximum Children",
                        "number",
                        "Enter maximum children"
                      )}

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
                            placeholder="Enter additional amenities"
                            onChange={(e) =>
                              update(room.id, "customAmenities", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </div>
                      )}

                      {renderPhotos(room)}

                      <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Room Description</label>
                        <textarea
                          rows={3}
                          value={room.roomDescription || ""}
                          placeholder="Describe this room category and its features"
                          onChange={(e) =>
                            update(room.id, "roomDescription", e.target.value)
                          }
                          style={{
                            ...inputStyle,
                            height: "auto",
                            minHeight: "75px",
                            padding: "10px 11px",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        style={{
          marginTop: "15px",
          padding: "10px 16px",
          border: "none",
          borderRadius: "7px",
          background: primary,
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        + Add Homestay Room Category
      </button>
    </div>
  );
};

export default HomestayAccommodationForm;
