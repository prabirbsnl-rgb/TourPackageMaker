import React, { useMemo, useState } from "react";
import OtherAccommodationTemplateManager from "./OtherAccommodationTemplateManager";

const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: 7, padding: "9px 10px", fontSize: 12, color: "#1E293B", background: "#FFF" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5 };
const commonFields = [
  { name: "propertyName", label: "Property / Accommodation Name", type: "text", required: true },
  { name: "displayName", label: "Display Name", type: "text" },
  { name: "description", label: "Property Description", type: "textarea" },
  { name: "totalUnits", label: "Total Units / Inventory", type: "number", min: 1 },
];

function MultiSelectField({ field, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];
  const options = field.options || [];
  const toggle = (option) => onChange(
    selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
  );
  const selectedSummary = selected.join(", ");
  const hoverSummary = selected.length
    ? `${selected.length} selected: ${selectedSummary}`
    : `No ${field.label} selected`;

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <button
        type="button"
        title={hoverSummary}
        aria-label={`${field.label}: ${hoverSummary}`}
        onClick={() => setOpen((current) => !current)}
        style={{
          ...inputStyle,
          minHeight: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          textAlign: "left",
          cursor: "pointer",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <span style={{
          color: selected.length ? "#1E293B" : "#64748B",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          minWidth: 0,
        }}>
          {selected.length ? selectedSummary : `Select ${field.label}`}
        </span>
        <span aria-hidden="true" style={{ flexShrink: 0 }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", zIndex: 20, top: "calc(100% + 4px)", left: 0, right: 0, maxHeight: 190, overflowY: "auto", padding: 7, border: "1px solid #CBD5E1", borderRadius: 7, background: "#FFF", boxShadow: "0 8px 20px rgba(15,23,42,.12)" }}>
          {options.length ? options.map((option) => (
            <label key={option} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 5px", fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
              {option}
            </label>
          )) : <div style={{ padding: 8, color: "#64748B", fontSize: 11 }}>No options configured.</div>}
        </div>
      )}
    </div>
  );
}

function DynamicField({ field, value, onChange }) {
  const common = { style: inputStyle, value: value ?? "", onChange: (e) => onChange(e.target.value), required: !!field.required };
  if (field.type === "textarea") return <textarea {...common} rows={2} />;
  if (field.type === "select") return <select {...common}><option value="">Select {field.label}</option>{(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  if (field.type === "multiselect") return <MultiSelectField field={field} value={value} onChange={onChange} />;
  if (field.type === "checkbox") return <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> Yes</label>;
  return <input {...common} type={field.type === "number" ? "number" : ["date", "time"].includes(field.type) ? field.type : "text"} min={field.type === "number" ? 0 : undefined} />;
}

export default function OtherAccommodationForm({
  templates: controlledTemplates,
  onTemplatesChange,
  value = {},
  onChange,
  theme = { primary: "#665A8D", light: "#F2F0F8", border: "#D2CCE5" },
}) {
  const [localTemplates, setLocalTemplates] = useState([]);
  const templates = Array.isArray(controlledTemplates) ? controlledTemplates : localTemplates;
  const [selectedTemplateId, setSelectedTemplateId] = useState(value.templateId || "");
  const [localValues, setLocalValues] = useState(value || {});
  const [customFields, setCustomFields] = useState(value.customFields || []);
  const [showCustomFieldEditor, setShowCustomFieldEditor] = useState(false);
  const [customDraft, setCustomDraft] = useState({ label: "", type: "text", required: false, optionsText: "" });
  const [error, setError] = useState("");
  const data = onChange ? value : localValues;
  const setData = (next) => { if (onChange) onChange(next); else setLocalValues(next); };
  const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId) || null, [templates, selectedTemplateId]);

  const inventoryNoun = useMemo(() => {
    const type = (selectedTemplate?.accommodationType || "").toLowerCase();
    const structure = selectedTemplate?.structure || "";

    // Use the accommodation type where it gives a clearer label; otherwise use its structure.
    if (type.includes("villa")) return "Villa";
    if (type.includes("tree house")) return "Tree House";
    if (type.includes("houseboat") || type.includes("floating")) return "Stay";
    if (type.includes("safari camp") || type.includes("tent")) return "Tent";
    if (type.includes("cabin")) return "Cabin";
    if (type.includes("homestay") || type.includes("guest house") || type.includes("hostel")) return "Room";

    const structureLabels = {
      ROOM_BASED: "Room",
      UNIT_BASED: "Unit",
      BED_BASED: "Bed",
      CABIN_BASED: "Cabin",
      TENT_BASED: "Tent",
      ENTIRE_PROPERTY: "Property",
      CUSTOM: "Entry",
    };
    return structureLabels[structure] || "Unit";
  }, [selectedTemplate]);

  const selectTemplate = (id) => {
    setSelectedTemplateId(id);
    setData({ ...data, templateId: id, accommodationType: templates.find((t) => t.id === id)?.accommodationType || "", structure: templates.find((t) => t.id === id)?.structure || "" });
  };
  const setFieldValue = (name, fieldValue) => setData({ ...data, [name]: fieldValue });

  const addCustomField = () => {
  if (!customDraft.label.trim()) {
    return setError("Enter a custom field label.");
  }

  const id = `custom-${Date.now()}`;

  const options = ["select", "multiselect"].includes(customDraft.type)
    ? customDraft.optionsText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  const newField = {
    id,
    name: `custom_${id}`,
    label: customDraft.label.trim(),
    type: customDraft.type,
    required: !!customDraft.required,
    options,
  };

  const nextFields = [...customFields, newField];

  setCustomFields(nextFields);
  setData({
    ...data,
    customFields: nextFields,
  });

  setCustomDraft({
    label: "",
    type: "text",
    required: false,
    optionsText: "",
  });

  setError("");
  setShowCustomFieldEditor(false);
};

  const updateCustomFields = (next) => { setCustomFields(next); setData({ ...data, customFields: next }); };

  // Simple individual inventory entries; these are separate from the total inventory count.
  const units = Array.isArray(data.units) ? data.units : [];
  const addUnit = () => {
    const nextUnits = [...units, { id: `unit-${Date.now()}`, name: "" }];
    setData({ ...data, units: nextUnits });
  };
  const updateUnit = (id, name) => {
    setData({ ...data, units: units.map((unit) => unit.id === id ? { ...unit, name } : unit) });
  };
  const removeUnit = (id) => {
    setData({ ...data, units: units.filter((unit) => unit.id !== id) });
  };

  return <div style={{ display: "grid", gap: 12 }}>
    <OtherAccommodationTemplateManager templates={templates} onTemplatesChange={onTemplatesChange || setLocalTemplates} selectedTemplateId={selectedTemplateId} onSelectTemplate={selectTemplate} theme={theme} />
    {!selectedTemplate ? <div style={{ border: "1px dashed #CBD5E1", borderRadius: 9, padding: 20, textAlign: "center", color: "#64748B", fontSize: 12 }}>Select an existing accommodation type or create a new template to display its property registration fields.</div> : <>
      <div style={{ border: `1px solid ${theme.border}`, background: theme.light, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", maxWidth: "100%", padding: "6px 38px 6px 10px", borderRadius: "6px", background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.primary} 62%, ${theme.light} 100%)`, color: "#FFFFFF", fontSize: 13, fontWeight: 800, lineHeight: 1.25 }}>
            {selectedTemplate.accommodationType}
          </div>
          <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>Structure: {selectedTemplate.structure?.replaceAll("_", " ")}</div>
        </div>
        <span style={{ fontSize: 10, color: "#64748B", whiteSpace: "nowrap" }}>{(selectedTemplate.fields || []).length + commonFields.length + customFields.length} registration fields</span>
      </div>
      <section style={{ border: `1px solid ${theme.border}`, background: theme.light, borderRadius: 9, padding: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: theme.primary, marginBottom: 10 }}>PROPERTY DETAILS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 11 }}>
          {commonFields.filter((f) => ["propertyName", "displayName", "totalUnits"].includes(f.name)).map((f) => <div key={f.name}><label style={labelStyle}>{f.label}{f.required ? " *" : ""}</label><DynamicField field={f} value={data[f.name]} onChange={(v) => setFieldValue(f.name, v)} />{f.name === "totalUnits" && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, padding: "5px 8px", borderRadius: 6, background: "#FFFFFF", border: `1px solid ${theme.border}`, fontSize: 11, color: theme.primary, fontWeight: 700 }}>Individual entries added: <strong style={{ fontSize: 12 }}>{units.length}</strong></div>}</div>)}
          {(selectedTemplate.fields || []).map((f) => <div key={f.id}><label style={labelStyle}>{f.label}{f.required ? " *" : ""}</label><DynamicField field={f} value={data[f.name]} onChange={(v) => setFieldValue(f.name, v)} /></div>)}
          {customFields.map((f) => <div key={f.id}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><label style={labelStyle}>{f.label}{f.required ? " *" : ""}</label><button type="button" onClick={() => updateCustomFields(customFields.filter((x) => x.id !== f.id))} style={{ border: 0, background: "transparent", color: "#B42318", fontSize: 10, cursor: "pointer" }}>Remove</button></div><DynamicField field={f} value={data[f.name]} onChange={(v) => setFieldValue(f.name, v)} /></div>)}
        </div>
        <div style={{ marginTop: 11 }}>
          <label style={labelStyle}>Property Description</label>
          <DynamicField field={commonFields.find((f) => f.name === "description")} value={data.description} onChange={(v) => setFieldValue("description", v)} />
        </div>
        <div style={{ marginTop: 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div style={{ fontSize: 11, color: "#64748B" }}>Add fields specific to this property registration only.</div><button type="button" onClick={() => { setShowCustomFieldEditor((v) => !v); setError(""); }} style={{ border: `1px solid ${theme.border}`, borderRadius: 7, padding: "8px 11px", background: theme.light, color: theme.primary, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>+ ADD PROPERTY-SPECIFIC FIELD</button></div>
        {showCustomFieldEditor && <div style={{ marginTop: 10, padding: 11, border: "1px solid #E2E8F0", borderRadius: 8, background: "#FAFBFC" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}><div><label style={labelStyle}>Field Label *</label><input style={inputStyle} value={customDraft.label} onChange={(e) => setCustomDraft({ ...customDraft, label: e.target.value })} /></div><div><label style={labelStyle}>Field Type</label><select style={inputStyle} value={customDraft.type} onChange={(e) => setCustomDraft({ ...customDraft, type: e.target.value })}>{[["text","Short text"],["textarea","Long text"],["number","Number"],["select","Single select"],["multiselect","Multiple select"],["date","Date"],["time","Time"],["checkbox","Yes / No"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div><label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700 }}><input type="checkbox" checked={customDraft.required} onChange={(e) => setCustomDraft({ ...customDraft, required: e.target.checked })} /> Required</label></div>{["select","multiselect"].includes(customDraft.type) && <div style={{ marginTop: 8 }}><label style={labelStyle}>Options (one per line)</label><textarea style={{ ...inputStyle, minHeight: 55 }} value={customDraft.optionsText} onChange={(e) => setCustomDraft({ ...customDraft, optionsText: e.target.value })} /></div>}<div style={{ display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 9 }}><button type="button" onClick={() => setShowCustomFieldEditor(false)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>CANCEL</button><button type="button" onClick={addCustomField} style={{ ...inputStyle, width: "auto", background: theme.primary, color: "#FFF", borderColor: theme.primary, cursor: "pointer" }}>ADD PROPERTY FIELD</button></div>{error && <div style={{ color: "#B42318", fontSize: 11, marginTop: 7 }}>{error}</div>}</div>}
      </section>
      <section style={{ border: `1px solid ${theme.border}`, background: theme.light, borderRadius: 9, padding: 13 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 9 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: theme.primary }}>{`INDIVIDUAL ${inventoryNoun.toUpperCase()}${inventoryNoun.endsWith("s") ? "ES" : "S"}`}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Optionally list individual names or numbers for this property.</div>
          </div>
          <button type="button" onClick={addUnit} style={{ border: `1px solid ${theme.border}`, borderRadius: 7, padding: "8px 11px", background: theme.light, color: theme.primary, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{`+ ADD ${inventoryNoun.toUpperCase()}`}</button>
        </div>
        {units.length === 0 ? (
          <div style={{ padding: "12px 10px", border: "1px dashed #CBD5E1", borderRadius: 7, color: "#64748B", fontSize: 11, textAlign: "center" }}>No individual units added. You can add them if needed.</div>
        ) : (
          <div style={{ display: "grid", gap: 7 }}>
            {units.map((unit, index) => (
              <div key={unit.id} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textAlign: "center" }}>{index + 1}.</div>
                <input
                  style={inputStyle}
                  value={unit.name || ""}
                  onChange={(e) => updateUnit(unit.id, e.target.value)}
                  placeholder={`Enter ${inventoryNoun.toLowerCase()} name or number`}
                  aria-label={`${inventoryNoun} ${index + 1} name`}
                />
                <button type="button" onClick={() => removeUnit(unit.id)} style={{ border: 0, background: "transparent", color: "#B42318", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "7px 4px" }}>REMOVE</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9, padding: "5px 9px", borderRadius: 6, background: "#FFFFFF", border: `1px solid ${theme.border}`, color: theme.primary, fontSize: 11, fontWeight: 700 }}>{units.length} individual {units.length === 1 ? "entry" : "entries"} added</div>
        {data.totalUnits !== undefined && data.totalUnits !== "" && Number(data.totalUnits) > units.length && (
          <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9, padding: "10px 12px", borderRadius: 7, background: "#FFF4E5", border: "1px solid #F2C078", borderLeft: "4px solid #D97706", color: "#8A3B08", fontSize: 12, fontWeight: 700 }}>
            <span aria-hidden="true" style={{ fontSize: 15 }}>!</span>
            <span>{units.length} of {Number(data.totalUnits)} units have been individually listed.</span>
          </div>
        )}
      </section>
    </>}
    <div style={{ fontSize: 10, color: "#64748B" }}>UI-only mode. Template and property values are held in page memory; Firestore and image handling will be added in a later phase. Admin and Staff have identical permissions.</div>
  </div>;
}
