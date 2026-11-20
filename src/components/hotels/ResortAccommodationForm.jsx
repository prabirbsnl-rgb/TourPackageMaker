


import React from "react";

const ResortAccommodationForm = ({
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
  const primary = theme?.primary || "#087E8B";
  const light = theme?.light || "#EAF6F6";
  const border = theme?.border || "#B9DEDF";

  const accommodationTypes = [
    "Room",
    "Cottage",
    "Villa",
    "Suite",
    "Tent",
    "Other",
  ];

  const bedOptions = [
    "Single",
    "Twin",
    "Double",
    "Queen",
    "King",
    "Bunk",
    "Other",
  ];

  const poolOptions = [
    "No Pool",
    "Private Pool",
    "Shared Pool",
    "Direct Pool Access",
  ];

  const mealOptions = ["EP", "CP", "MAP", "AP", "Custom"];

  const amenityOptions = [
    "Air Conditioning",
    "Wi-Fi",
    "TV",
    "Balcony",
    "Refrigerator",
    "Kitchen",
    "Other",
  ];

  const inputStyle = {
    width: "100%",
    minHeight: "39px",
    padding: "9px 11px",
    border: `1px solid ${border}`,
    borderRadius: "7px",
    fontSize: "13px",
    boxSizing: "border-box",
    outlineColor: primary,
    background: theme?.light || light || "#F5F7FA",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#465467",
  };

  const fieldStyle = {
    minWidth: 0,
  };

  const update = (roomId, field, value) => {
    onChange(roomId, field, value);
  };

  const renderInput = (room, field, label, type = "text", placeholder = "") => (
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

  const renderCustomText = (room, field, label, placeholder) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={room[field] ?? ""}
        placeholder={placeholder}
        onChange={(e) => update(room.id, field, e.target.value)}
        style={inputStyle}
      />
    </div>
  );

  const renderPhotos = (room) => {
    const photos = room.photos || [];

    const addPhotos = (event) => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

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
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Accommodation Photos (Optional)</label>

        <input
          type="file"
          accept="image/*"
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
              marginTop: "12px",
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  width: "105px",
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  padding: "6px",
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
                  style={{
                    fontSize: "10px",
                    margin: "5px 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={photo.name}
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
          No resort accommodation categories added yet.
          <div style={{ marginTop: "7px" }}>
            Add accommodation categories such as Rooms, Cottages, Villas or
            Tents.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {roomCategories.map((room, index) => {
            const isExpanded = expandedId === room.id;

            const title =
              room.unitName?.trim() ||
              (room.accommodationType === "Other"
                ? room.customAccommodationType
                : room.accommodationType) ||
              `Accommodation Category ${index + 1}`;

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
    background: light,
    border: `1px solid ${primary}`,
    color: primary,
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.3px",
  }}
>
  {room.numberOfUnits || 0} UNITS
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
                      <div style={fieldStyle}>
                        <label style={labelStyle}>Accommodation Type</label>
                        {SearchDropdown && (
                          <SearchDropdown
                            value={room.accommodationType || ""}
                            options={accommodationTypes}
                            onChange={(value) =>
                              update(room.id, "accommodationType", value)
                            }
                            placeholder="Select accommodation type"
                            theme={theme}
                          />
                        )}
                      </div>

                      {room.accommodationType === "Other" &&
                        renderCustomText(
                          room,
                          "customAccommodationType",
                          "Custom Accommodation Type",
                          "Enter accommodation type"
                        )}

                      {renderInput(
                        room,
                        "unitName",
                        "Category / Unit Name",
                        "text",
                        "e.g. Garden Cottage"
                      )}

                      {renderInput(
                        room,
                        "numberOfUnits",
                        "Number of Units",
                        "number",
                        "Enter number of units"
                      )}

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


{(room.bedConfiguration || []).includes("Other") &&
  renderCustomText(
    room,
    "customBedConfiguration",
    "Other Bed Configuration",
    "Enter bed configuration"
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
                        <label style={labelStyle}>Pool Access</label>
                        <select
                          value={room.poolAccess || ""}
                          onChange={(e) =>
                            update(room.id, "poolAccess", e.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="">Select pool access</option>
                          {poolOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={fieldStyle}>
                        <label style={labelStyle}>Meal Plans</label>
                        {MultiSelectDropdown && (
                          <MultiSelectDropdown
                            values={room.mealPlans || []}
                            options={mealOptions}
                            onChange={(value) =>
                              update(room.id, "mealPlans", value)
                            }
                            placeholder="Select meal plans"
                            theme={theme}
                          />
                        )}
                      </div>

                      {(room.mealPlans || []).includes("Custom") &&
                        renderCustomText(
                          room,
                          "customMealPlan",
                          "Custom Meal Plan",
                          "Describe the custom meal plan"
                        )}

                      <div style={fieldStyle}>
                        <label style={labelStyle}>Unit Amenities</label>
                        {MultiSelectDropdown && (
                          <MultiSelectDropdown
                            values={room.amenities || []}
                            options={amenityOptions}
                            onChange={(value) =>
                              update(room.id, "amenities", value)
                            }
                            placeholder="Select unit amenities"
                            theme={theme}
                          />
                        )}
                      </div>

                      {(room.amenities || []).includes("Other") &&
                        renderCustomText(
                          room,
                          "customAmenities",
                          "Other Unit Amenities",
                          "Enter other amenities"
                        )}

                      {renderPhotos(room)}

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>
                          Accommodation Description
                        </label>
                        <textarea
                          rows={3}
                          value={room.description || ""}
                          placeholder="Enter details about this accommodation category"
                          onChange={(e) =>
                            update(room.id, "description", e.target.value)
                          }
                          style={{
                            ...inputStyle,
                            resize: "vertical",
                            minHeight: "75px",
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
        + Add Resort Accommodation Category
      </button>
    </div>
  );
};

export default ResortAccommodationForm;