


import React, { useState } from "react";

export default function HostelAccommodationForm({
  roomCategories = [],
  onAdd,
  onChange,
  onRemove,
  expandedId,
  onExpandedChange,
  theme,
  SearchDropdown,
  MultiSelectDropdown,
}) {
  const primary = theme?.primary || "#B04479";
  const light = theme?.light || "#FAEFF4";
  const border = theme?.border || "#E8C4D5";
  const [nameInputs, setNameInputs] = useState({});

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "38px",
    padding: "8px 10px",
    border: `1px solid ${border}`,
    borderRadius: "6px",
    background: theme?.light || light || "#F5F7FA",
    color: "#263445",
    fontSize: "12px",
    outlineColor: primary,
  };
  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#344054",
    fontSize: "11px",
    fontWeight: 700,
  };
  const fieldStyle = { minWidth: 0, marginBottom: "13px" };
  const update = (id, field, value) => onChange?.(id, field, value);

  const addName = (unit) => {
    const value = (nameInputs[unit.id] || "").trim();
    if (!value) return;
    const names = unit.roomNames || [];
    if (names.some((name) => String(name).toLowerCase() === value.toLowerCase())) return;
    update(unit.id, "roomNames", [...names, value]);
    setNameInputs((prev) => ({ ...prev, [unit.id]: "" }));
  };

  const removeName = (unit, name) => {
    update(unit.id, "roomNames", (unit.roomNames || []).filter((item) => item !== name));
  };

  const renderMultiSelect = (unit, field, options, placeholder) => (
  <MultiSelectDropdown
    values={unit[field] || []}
    options={options}
    onChange={(value) => update(unit.id, field, value)}
    placeholder={placeholder}
    theme={theme}
  />
);



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
            border: `1px solid ${border}`,
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
              background: light,
              borderRadius: "8px 8px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ color: primary, fontSize: "13px", fontWeight: 800 }}>
                {String(index + 1).padStart(2, "0")}.{" "}
                {unit.dormitoryType === "Other"
                  ? unit.customDormitoryType || "Other Hostel Type"
                  : unit.dormitoryType || `Hostel Unit ${index + 1}`}
              </div>
              <div
                style={{
                  display: "inline-flex",
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
                {count} DORMITORIES / ROOMS
              </div>
            </div>

            <div style={{ display: "flex", gap: "7px", marginLeft: "auto", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => onExpandedChange?.(isExpanded ? null : unit.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${border}`,
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
                onClick={() => onRemove?.(unit.id)}
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
            <div
              style={{
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  ...fieldStyle,
                  gridColumn: "1 / -1",
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1fr) minmax(0, 2.5fr)",
                  gap: "14px",
                  alignItems: "start",
                }}
              >
                <div style={fieldStyle}>
                  <label style={labelStyle}>Dormitory / Room Type</label>
                  <select
                    value={unit.dormitoryType || ""}
                    onChange={(e) => update(unit.id, "dormitoryType", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Dormitory / Room Type</option>
                    {["Mixed Dormitory", "Female Dormitory", "Male Dormitory", "Private Room", "Family Room", "Other"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Dormitory / Room Inventory Entry</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
                      gap: "12px",
                    }}
                  >
                    <select
                      value={unit.roomEntryMode || "NAMES"}
                      onChange={(e) => {
                        const mode = e.target.value;
                        update(unit.id, "roomEntryMode", mode);
                        update(unit.id, "roomNames", []);
                        update(unit.id, "roomCount", "");
                        setNameInputs((prev) => ({ ...prev, [unit.id]: "" }));
                      }}
                      style={inputStyle}
                    >
                      <option value="NAMES">Dormitory / Room Names</option>
                      <option value="COUNT">Enter Unit Count</option>
                    </select>

                    {unit.roomEntryMode === "COUNT" ? (
                      <input
                        type="number"
                        min="0"
                        value={unit.roomCount || ""}
                        onChange={(e) => update(unit.id, "roomCount", e.target.value)}
                        style={inputStyle}
                        placeholder="Enter total dormitory / room count"
                      />
                    ) : (
                      <div>
                        <div style={{ display: "flex", gap: "7px" }}>
                          <input
                            value={nameInputs[unit.id] || ""}
                            onChange={(e) => setNameInputs((prev) => ({ ...prev, [unit.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addName(unit);
                              }
                            }}
                            style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                            placeholder="Enter dormitory / room name or number"
                          />
                          <button
                            type="button"
                            onClick={() => addName(unit)}
                            style={{
                              border: 0,
                              borderRadius: "6px",
                              padding: "0 14px",
                              background: primary,
                              color: "#FFFFFF",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {(unit.roomNames || []).map((name) => (
                            <span
                              key={name}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "5px 8px",
                                borderRadius: "5px",
                                background: light,
                                color: primary,
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {name}
                              <button
                                type="button"
                                onClick={() => removeName(unit, name)}
                                aria-label={`Remove ${name}`}
                                style={{ border: 0, background: "transparent", color: "#B42318", cursor: "pointer", fontWeight: 800 }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {unit.dormitoryType === "Other" && (
                <div style={fieldStyle}>
                  <label style={labelStyle}>Custom Dormitory / Room Type</label>
                  <input
                    value={unit.customDormitoryType || ""}
                    onChange={(e) => update(unit.id, "customDormitoryType", e.target.value)}
                    style={inputStyle}
                    placeholder="Enter dormitory / room type"
                  />
                </div>
              )}

              <div style={fieldStyle}>
                <label style={labelStyle}>Beds per Dormitory / Room</label>
<input
  type="number"
  min="1"
  value={unit.bedsPerDormitory || ""}
  onChange={(e) => update(unit.id, "bedsPerDormitory", e.target.value)}
  style={inputStyle}
  placeholder="Enter number of beds"
/>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Bed Configuration</label>
                {renderMultiSelect(unit, "bedConfiguration", ["Single", "Twin", "Double", "Queen", "King", "Hollywood Twin", "Bunk", "Sofa", "Other"], "Select bed configuration")}
                {unit.bedConfiguration?.includes("Other") && (
                  <input value={unit.customBedConfiguration || ""} onChange={(e) => update(unit.id, "customBedConfiguration", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter custom bed configuration" />
                )}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Maximum Adults</label>
                <input type="number" min="0" value={unit.maximumAdults || ""} onChange={(e) => update(unit.id, "maximumAdults", e.target.value)} style={inputStyle} placeholder="Enter maximum adults" />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Maximum Children</label>
                <input type="number" min="0" value={unit.maximumChildren || ""} onChange={(e) => update(unit.id, "maximumChildren", e.target.value)} style={inputStyle} placeholder="Enter maximum children" />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Extra Bed Availability</label>
                <select value={unit.extraBedAvailable || ""} onChange={(e) => update(unit.id, "extraBedAvailable", e.target.value)} style={inputStyle}>
                  <option value="">Select</option>
                  {["Available", "Not Available", "On Request"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Bathroom Type</label>
                <select value={unit.bathroomType || ""} onChange={(e) => update(unit.id, "bathroomType", e.target.value)} style={inputStyle}>
                  <option value="">Select Bathroom Type</option>
                  {["Ensuite", "Shared", "Common", "Other"].map((value) => <option key={value}>{value}</option>)}
                </select>
                {unit.bathroomType === "Other" && (
                  <input value={unit.customBathroomType || ""} onChange={(e) => update(unit.id, "customBathroomType", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter bathroom type" />
                )}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Meal Arrangements</label>
                {renderMultiSelect(unit, "mealPlans", ["EP", "CP", "MAP", "AP", "Custom"], "Select meal arrangements")}
                {unit.mealPlans?.includes("Custom") && (
                  <input value={unit.customMealPlan || ""} onChange={(e) => update(unit.id, "customMealPlan", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter custom meal arrangement" />
                )}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Unit Amenities</label>
                {renderMultiSelect(unit, "amenities", ["AC", "Wi-Fi", "TV", "Balcony", "Living Room", "Dining Area", "Refrigerator", "Parking", "Other"], "Select unit amenities")}
                {unit.amenities?.includes("Other") && (
                  <input value={unit.customAmenities || ""} onChange={(e) => update(unit.id, "customAmenities", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter custom amenity" />
                )}
              </div>

              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Dormitory / Room Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const existing = unit.photos || [];
                    const added = files.map((file) => ({
                      id: `${Date.now()}-${Math.random()}`,
                      name: file.name,
                      url: URL.createObjectURL(file),
                    }));
                    update(unit.id, "photos", [...existing, ...added]);
                    e.target.value = "";
                  }}
                  style={inputStyle}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "9px" }}>
                  {(unit.photos || []).map((photo) => (
                    <div key={photo.id} style={{ width: "92px", position: "relative" }}>
                      <img src={photo.url} alt={photo.name} style={{ width: "92px", height: "68px", objectFit: "cover", borderRadius: "6px", border: `1px solid ${border}` }} />
                      <button
                        type="button"
                        onClick={() => update(unit.id, "photos", (unit.photos || []).filter((item) => item.id !== photo.id))}
                        style={{ position: "absolute", top: "3px", right: "3px", border: 0, borderRadius: "50%", background: "#FFFFFF", color: "#B42318", cursor: "pointer" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Dormitory / Room Description</label>
                <textarea
                  rows={3}
                  value={unit.description || ""}
                  onChange={(e) => update(unit.id, "description", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Enter dormitory / room description"
                />
              </div>
            </div>
          )}
        </div>
      );
    });

  return (
    <div>
      {renderCards()}
      <button
        type="button"
        onClick={onAdd}
        style={{
          padding: "9px 15px",
          border: `1px solid ${primary}`,
          borderRadius: "7px",
          background: primary,
          color: "#FFFFFF",
          fontSize: "12px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        + ADD HOSTEL ACCOMMODATION CATEGORY
      </button>
    </div>
  );
}
