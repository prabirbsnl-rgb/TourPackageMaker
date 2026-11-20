


import React, { useState } from "react";

export default function ServicedApartmentAccommodationForm({
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
  const primary = theme?.primary || "#536477";
  const light = theme?.light || "#F0F3F6";
  const border = theme?.border || "#CCD5DE";
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

  const addName = (apartment) => {
    const value = (nameInputs[apartment.id] || "").trim();
    if (!value) return;
    const names = apartment.roomNames || [];
    if (names.some((name) => String(name).toLowerCase() === value.toLowerCase())) return;
    update(apartment.id, "roomNames", [...names, value]);
    setNameInputs((prev) => ({ ...prev, [apartment.id]: "" }));
  };

  const removeName = (apartment, name) => {
    update(
      apartment.id,
      "roomNames",
      (apartment.roomNames || []).filter((item) => item !== name)
    );
  };

  const renderMultiSelect = (apartment, field, options, placeholder) => {
    if (MultiSelectDropdown) {
      return (
        <MultiSelectDropdown
          value={apartment[field] || []}
          options={options}
          onChange={(value) => update(apartment.id, field, value)}
          placeholder={placeholder}
        />
      );
    }
    return (
      <select
        multiple
        value={apartment[field] || []}
        onChange={(event) =>
          update(
            apartment.id,
            field,
            Array.from(event.target.selectedOptions, (option) => option.value)
          )
        }
        style={{ ...inputStyle, minHeight: "76px" }}
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  };

  const renderCards = () =>
    roomCategories.map((apartment, index) => {
      const isExpanded = expandedId === apartment.id;
      const count =
        apartment.roomEntryMode === "COUNT"
          ? Number(apartment.roomCount) || 0
          : (apartment.roomNames || []).length;

      return (
        <div
          key={apartment.id}
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
                {apartment.apartmentType === "Other"
                  ? apartment.customApartmentType || "Other Apartment"
                  : apartment.apartmentType || `Apartment Category ${index + 1}`}
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
                {count} APARTMENTS
              </div>
            </div>
            <div style={{ display: "flex", gap: "7px", marginLeft: "auto", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => onExpandedChange?.(isExpanded ? null : apartment.id)}
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
                onClick={() => onRemove?.(apartment.id)}
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
            <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
             
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
    <label style={labelStyle}>Apartment Type</label>
    <select
      value={apartment.apartmentType || ""}
      onChange={(e) => update(apartment.id, "apartmentType", e.target.value)}
      style={inputStyle}
    >
      <option value="">Select Apartment Type</option>
      {["Studio", "1 BHK", "2 BHK", "3 BHK", "Penthouse", "Duplex", "Other"].map((v) => (
        <option key={v}>{v}</option>
      ))}
    </select>
  </div>

  <div style={fieldStyle}>
    <label style={labelStyle}>Apartment Inventory Entry</label>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 1fr) minmax(0, 2fr)",
        gap: "12px",
      }}
    >
      <select
        value={apartment.roomEntryMode || "NAMES"}
        onChange={(e) => {
          const mode = e.target.value;
          update(apartment.id, "roomEntryMode", mode);
          update(apartment.id, "roomNames", []);
          update(apartment.id, "roomCount", "");
          setNameInputs((prev) => ({ ...prev, [apartment.id]: "" }));
        }}
        style={inputStyle}
      >
        <option value="NAMES">Apartment Names / Numbers</option>
        <option value="COUNT">Enter Apartment Count</option>
      </select>

      {apartment.roomEntryMode === "COUNT" ? (
        <input
          type="number"
          min="0"
          value={apartment.roomCount || ""}
          onChange={(e) => update(apartment.id, "roomCount", e.target.value)}
          style={inputStyle}
          placeholder="Enter total apartment count"
        />
      ) : (
        <div style={{ display: "flex", gap: "7px" }}>
          <input
            value={nameInputs[apartment.id] || ""}
            onChange={(e) =>
              setNameInputs((prev) => ({
                ...prev,
                [apartment.id]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addName(apartment);
              }
            }}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Enter apartment name or number"
          />
          <button
            type="button"
            onClick={() => addName(apartment)}
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
      )}
    </div>
  </div>
</div>


              {apartment.apartmentType === "Other" && (
                <div style={fieldStyle}>
                  <label style={labelStyle}>Custom Apartment Type</label>
                  <input value={apartment.customApartmentType || ""} onChange={(e) => update(apartment.id, "customApartmentType", e.target.value)} style={inputStyle} placeholder="Enter apartment type" />
                </div>
              )}

             

              {[
                ["Bedrooms", "bedrooms", "number"],
                ["Maximum Adults", "maximumAdults", "number"],
                ["Maximum Children", "maximumChildren", "number"],
              ].map(([label, field, type]) => (
                <div key={field} style={fieldStyle}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} min="0" value={apartment[field] || ""} onChange={(e) => update(apartment.id, field, e.target.value)} style={inputStyle} placeholder={`Enter ${label.toLowerCase()}`} />
                </div>
              ))}

              <div style={fieldStyle}>
                <label style={labelStyle}>Bed Configuration</label>
                {renderMultiSelect(apartment, "bedConfiguration", ["Single", "Twin", "Double", "Queen", "King", "Hollywood Twin", "Bunk", "Sofa", "Other"], "Select bed configuration")}
                {apartment.bedConfiguration?.includes("Other") && (
                  <input value={apartment.customBedConfiguration || ""} onChange={(e) => update(apartment.id, "customBedConfiguration", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter custom bed configuration" />
                )}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Extra Bed Availability</label>
                <select value={apartment.extraBedAvailable || ""} onChange={(e) => update(apartment.id, "extraBedAvailable", e.target.value)} style={inputStyle}>
                  <option value="">Select</option>
                  {["Available", "Not Available", "On Request"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Bathroom Type</label>
                <select value={apartment.bathroomType || ""} onChange={(e) => update(apartment.id, "bathroomType", e.target.value)} style={inputStyle}>
                  <option value="">Select Bathroom Type</option>
                  {["Attached", "Shared", "Multiple Bathrooms", "Other"].map((v) => <option key={v}>{v}</option>)}
                </select>
                {apartment.bathroomType === "Other" && <input value={apartment.customBathroomType || ""} onChange={(e) => update(apartment.id, "customBathroomType", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter bathroom type" />}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Kitchen Type</label>
                <select value={apartment.kitchenType || ""} onChange={(e) => update(apartment.id, "kitchenType", e.target.value)} style={inputStyle}>
                  <option value="">Select Kitchen Type</option>
                  {["Fully Equipped", "Kitchenette", "Shared Kitchen", "No Kitchen", "Other"].map((v) => <option key={v}>{v}</option>)}
                </select>
                {apartment.kitchenType === "Other" && <input value={apartment.customKitchenType || ""} onChange={(e) => update(apartment.id, "customKitchenType", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter kitchen type" />}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Meal Arrangements</label>
                {renderMultiSelect(apartment, "mealPlans", ["EP", "CP", "MAP", "AP", "Custom"], "Select meal arrangements")}
                {apartment.mealPlans?.includes("Custom") && <input value={apartment.customMealPlan || ""} onChange={(e) => update(apartment.id, "customMealPlan", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter custom meal arrangement" />}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Apartment Amenities</label>
                {renderMultiSelect(apartment, "amenities", ["AC", "Wi-Fi", "TV", "Living Room", "Dining Area", "Refrigerator", "Washing Machine", "Private Balcony", "Parking", "Other"], "Select apartment amenities")}
                {apartment.amenities?.includes("Other") && <input value={apartment.customAmenities || ""} onChange={(e) => update(apartment.id, "customAmenities", e.target.value)} style={{ ...inputStyle, marginTop: "7px" }} placeholder="Enter custom amenity" />}
              </div>

              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Apartment Photos</label>
                <input type="file" accept="image/*" multiple onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const existing = apartment.photos || [];
                  const added = files.map((file) => ({ id: `${Date.now()}-${Math.random()}`, name: file.name, url: URL.createObjectURL(file) }));
                  update(apartment.id, "photos", [...existing, ...added]);
                  e.target.value = "";
                }} style={inputStyle} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "9px" }}>
                  {(apartment.photos || []).map((photo) => (
                    <div key={photo.id} style={{ width: "92px", position: "relative" }}>
                      <img src={photo.url} alt={photo.name} style={{ width: "92px", height: "68px", objectFit: "cover", borderRadius: "6px", border: `1px solid ${border}` }} />
                      <button type="button" onClick={() => update(apartment.id, "photos", (apartment.photos || []).filter((item) => item.id !== photo.id))} style={{ position: "absolute", top: "3px", right: "3px", border: 0, borderRadius: "50%", background: "#FFFFFF", color: "#B42318", cursor: "pointer" }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Apartment Description</label>
                <textarea rows={3} value={apartment.description || ""} onChange={(e) => update(apartment.id, "description", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Enter apartment description" />
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
        + ADD APARTMENT CATEGORY
      </button>
    </div>
  );
}
