import React, { useMemo, useState } from "react";

const PROPERTY_STRUCTURES = [
  { value: "ROOM_BASED", label: "Room-based" },
  { value: "UNIT_BASED", label: "Unit / Apartment-based" },
  { value: "BED_BASED", label: "Bed / Dormitory-based" },
  { value: "CABIN_BASED", label: "Cabin-based" },
  { value: "TENT_BASED", label: "Tent / Camp-based" },
  { value: "ENTIRE_PROPERTY", label: "Entire-property" },
  { value: "CUSTOM", label: "Custom structure" },
];
// Suggested types not already represented by dedicated Hotel Master categories.
const PREDEFINED_OTHER_TYPES = [
  "Tree House",
  "Houseboat",
  "Floating Stay",
  "Cave Stay",
  "Igloo Stay",
  "Capsule Stay",
  "Canopy Stay",
  "Railway Coach Stay",
  "Converted Heritage Property",
];
const FIELD_TYPES = [
  ["text", "Short text"], ["textarea", "Long text"], ["number", "Number"],
  ["select", "Single select"], ["multiselect", "Multiple select"],
  ["date", "Date"], ["time", "Time"], ["checkbox", "Yes / No"],
];
const makeId = () => `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const input = { width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: 7, padding: "8px 10px", fontSize: 12, color: "#1E293B", background: "#FFF" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5 };
const button = (bg, color, border = "transparent") => ({ border: `1px solid ${border}`, borderRadius: 7, padding: "8px 11px", background: bg, color, fontSize: 11, fontWeight: 800, cursor: "pointer" });

export default function OtherAccommodationTemplateManager({
  templates: controlledTemplates,
  onTemplatesChange,
  selectedTemplateId = "",
  onSelectTemplate,
  theme = { primary: "#665A8D", light: "#F2F0F8", border: "#D2CCE5" },
}) {
  const [localTemplates, setLocalTemplates] = useState([]);
  const templates = Array.isArray(controlledTemplates) ? controlledTemplates : localTemplates;
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState("");
  const [error, setError] = useState("");
  const updateTemplates = (next) => onTemplatesChange ? onTemplatesChange(next) : setLocalTemplates(next);
  const preview = useMemo(() => templates.find((t) => t.id === previewId) || null, [templates, previewId]);

  const newTemplate = () => {
    setEditingId(null); setError("");
    setDraft({ accommodationType: "", isCustomType: false, structure: "ROOM_BASED", description: "", fields: [] });
  };
  const editTemplate = (item) => {
    setEditingId(item.id); setError("");
    setDraft({ ...item, fields: (item.fields || []).map((f) => ({ ...f, optionsText: (f.options || []).join("\n") })) });
  };
  const updateField = (id, key, value) => setDraft((d) => ({ ...d, fields: d.fields.map((f) => f.id === id ? { ...f, [key]: value } : f) }));
  const save = () => {
    const name = draft?.accommodationType?.trim();
    if (!name) return setError("Enter an accommodation type name.");
    if (templates.some((t) => t.id !== editingId && t.accommodationType.toLowerCase() === name.toLowerCase())) return setError("This accommodation type already exists.");
    if ((draft.fields || []).some((f) => !f.label?.trim())) return setError("Every dynamic field needs a label.");
    const saved = {
      ...draft, id: editingId || `other-template-${Date.now()}`, accommodationType: name,
      fields: draft.fields.map(({ optionsText, ...f }) => ({
        ...f,
        name: f.name?.trim() || f.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
        options: ["select", "multiselect"].includes(f.type) ? (optionsText || "").split("\n").map((x) => x.trim()).filter(Boolean) : [],
      })),
    };
    updateTemplates(editingId ? templates.map((t) => t.id === editingId ? saved : t) : [...templates, saved]);
    if (onSelectTemplate) onSelectTemplate(saved.id);
    setDraft(null); setEditingId(null); setError(""); setPreviewId("");
  };
  const remove = (id) => {
    if (!window.confirm("Delete this accommodation template?")) return;
    updateTemplates(templates.filter((t) => t.id !== id));
    if (selectedTemplateId === id && onSelectTemplate) onSelectTemplate("");
    if (previewId === id) setPreviewId("");
  };

  return <>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "9px 11px", border: `1px solid ${theme.border}`, borderRadius: 9, background: theme.light }}>
      <div style={{ flex: "1 1 180px", minWidth: 150 }}>
        <div style={{ fontSize: 11, color: theme.primary, fontWeight: 800 }}>OTHER ACCOMMODATION TYPE</div>
        <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{templates.length} reusable template{templates.length === 1 ? "" : "s"} available</div>
      </div>
      <select aria-label="Select accommodation template" style={{ ...input, flex: "1 1 190px", width: "auto", maxWidth: 300 }} value={selectedTemplateId} onChange={(e) => onSelectTemplate?.(e.target.value)}>
        <option value="">Select accommodation type</option>
        {templates.map((t) => <option key={t.id} value={t.id}>{t.accommodationType}</option>)}
      </select>
      <button type="button" style={button("#FFF", theme.primary, theme.border)} onClick={() => { setIsOpen(true); setDraft(null); }}>MANAGE TEMPLATES</button>
      <button type="button" style={button(theme.primary, "#FFF")} onClick={() => { setIsOpen(true); newTemplate(); }}>+ ADD TYPE</button>
    </div>

    {isOpen && <div role="dialog" aria-modal="true" aria-label="Accommodation template management" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onMouseDown={(e) => { if (e.target === e.currentTarget) { setIsOpen(false); setDraft(null); } }}>
      <div style={{ width: "min(900px, 100%)", maxHeight: "90vh", overflow: "auto", background: "#FFF", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.25)", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div><div style={{ color: theme.primary, fontWeight: 900, fontSize: 15 }}>ACCOMMODATION TEMPLATE MANAGEMENT</div><div style={{ color: "#64748B", fontSize: 11, marginTop: 3 }}>Create reusable types and configure their registration fields.</div></div>
          <button type="button" aria-label="Close template manager" style={button("#FFF", "#475569", "#CBD5E1")} onClick={() => { setIsOpen(false); setDraft(null); }}>CLOSE ✕</button>
        </div>
        {draft && <section style={{ border: "1px solid #D8DEE8", borderRadius: 9, padding: 13, marginBottom: 14, background: "#FBFCFE" }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 10 }}>{editingId ? "EDIT TEMPLATE" : "NEW ACCOMMODATION TEMPLATE"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
            <div>
              <label style={label}>Accommodation Type *</label>
              <select
                style={input}
                value={draft.isCustomType ? "__CUSTOM__" : draft.accommodationType}
                onChange={(e) => setDraft((d) => ({
                  ...d,
                  isCustomType: e.target.value === "__CUSTOM__",
                  accommodationType: e.target.value === "__CUSTOM__" ? "" : e.target.value,
                }))}
              >
                <option value="">Select accommodation type</option>
                {PREDEFINED_OTHER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                <option value="__CUSTOM__">Other – Enter custom type</option>
              </select>
              {draft.isCustomType && (
                <input
                  style={{ ...input, marginTop: 7 }}
                  value={draft.accommodationType}
                  onChange={(e) => setDraft((d) => ({ ...d, accommodationType: e.target.value }))}
                  placeholder="Enter custom accommodation type"
                />
              )}
            </div>
            <div><label style={label}>Property Structure *</label><select style={input} value={draft.structure} onChange={(e) => setDraft((d) => ({ ...d, structure: e.target.value }))}>{PROPERTY_STRUCTURES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={label}>Description / Note</label><textarea style={{ ...input, minHeight: 48 }} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 8px" }}><strong style={{ fontSize: 12 }}>DYNAMIC REGISTRATION FIELDS</strong><button type="button" style={button("#FFF", theme.primary, theme.border)} onClick={() => setDraft((d) => ({ ...d, fields: [...d.fields, { id: makeId(), label: "", type: "text", required: false, optionsText: "" }] }))}>+ ADD TEMPLATE FIELD</button></div>
          {draft.fields.map((f, i) => <div key={f.id} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 10, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><strong style={{ fontSize: 11 }}>FIELD {i + 1}</strong><button type="button" style={{ ...button("#FFF7F6", "#B42318", "#F1C4C0"), padding: "5px 8px" }} onClick={() => setDraft((d) => ({ ...d, fields: d.fields.filter((x) => x.id !== f.id) }))}>REMOVE</button></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
              <div><label style={label}>Field Label *</label><input style={input} value={f.label} onChange={(e) => updateField(f.id, "label", e.target.value)} placeholder="e.g. Number of cabins" /></div>
              <div><label style={label}>Field Type</label><select style={input} value={f.type} onChange={(e) => updateField(f.id, "type", e.target.value)}>{FIELD_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700 }}><input type="checkbox" checked={!!f.required} onChange={(e) => updateField(f.id, "required", e.target.checked)} /> Required</label>
              {["select", "multiselect"].includes(f.type) && <div style={{ gridColumn: "1 / -1" }}><label style={label}>Options (one per line)</label><textarea style={{ ...input, minHeight: 55 }} value={f.optionsText || ""} onChange={(e) => updateField(f.id, "optionsText", e.target.value)} placeholder={"Option 1\nOption 2"} /></div>}
            </div>
          </div>)}
          {error && <div role="alert" style={{ color: "#B42318", fontSize: 11, fontWeight: 700, marginTop: 9 }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}><button type="button" style={button("#FFF", "#475569", "#CBD5E1")} onClick={() => { setDraft(null); setEditingId(null); setError(""); }}>CANCEL</button><button type="button" style={button(theme.primary, "#FFF")} onClick={save}>SAVE TEMPLATE</button></div>
        </section>}
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>CREATED TEMPLATES ({templates.length})</div>
        {templates.length === 0 ? <div style={{ padding: 18, border: "1px dashed #CBD5E1", borderRadius: 8, color: "#64748B", fontSize: 12, textAlign: "center" }}>No templates created yet. Use + ADD TYPE above to create your first accommodation type.</div> : templates.map((t) => <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 9, border: "1px solid #E2E8F0", borderRadius: 8, padding: 10, marginBottom: 7 }}>
          <div style={{ flex: "1 1 180px" }}><div style={{ fontSize: 12, fontWeight: 800 }}>{t.accommodationType}</div><div style={{ fontSize: 10, color: "#64748B", marginTop: 3 }}>{PROPERTY_STRUCTURES.find((s) => s.value === t.structure)?.label || "Custom structure"} · {(t.fields || []).length} fields</div></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button type="button" style={button("#F7F5FB", theme.primary, theme.border)} onClick={() => setPreviewId(previewId === t.id ? "" : t.id)}>PREVIEW</button><button type="button" style={button("#FFF", "#334155", "#CBD5E1")} onClick={() => editTemplate(t)}>EDIT</button><button type="button" style={button("#FFF7F6", "#B42318", "#F1C4C0")} onClick={() => remove(t.id)}>DELETE</button><button type="button" style={button(theme.primary, "#FFF")} onClick={() => { onSelectTemplate?.(t.id); setIsOpen(false); }}>USE TEMPLATE</button></div>
          {preview?.id === t.id && <div style={{ flexBasis: "100%", padding: 9, background: "#F8FAFC", borderRadius: 7, fontSize: 11 }}><strong>Fields:</strong> {(t.fields || []).length ? t.fields.map((f) => `${f.label}${f.required ? " *" : ""}`).join(" · ") : "No additional fields configured."}</div>}
        </div>)}
        <div style={{ color: "#64748B", fontSize: 10, marginTop: 12 }}>UI-only mode: templates remain in React memory and reset when the page is refreshed. Admin and Staff have identical actions.</div>
      </div>
    </div>}
  </>;
}
