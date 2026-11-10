


import React, { useEffect, useState } from "react";

import {
    getAllServices,
    createServiceDefinition,
    updateServiceDefinition,
    setServiceActiveStatus,
    getCustomerDetailsFields,
    saveCustomerDetailsFields
} from "../../utils/serviceCatalogueStorage";

function ManageServices({ onBack }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [serviceName, setServiceName] = useState("");
    const [serviceKey, setServiceKey] = useState("");

    const [editingServiceId, setEditingServiceId] = useState(null);

    // Service-specific form field configuration
const [formFields, setFormFields] = useState([]);

const [editingFieldKey, setEditingFieldKey] = useState(null);
const [editedField, setEditedField] = useState({
    label: "",
    type: "text",
    required: false,
    options: "",
});


const [showFormFields, setShowFormFields] = useState(false);

const [statusOptions, setStatusOptions] = useState([]);
const [editingStatusIndex, setEditingStatusIndex] = useState(null);
const [editedStatus, setEditedStatus] = useState("");
const [newStatus, setNewStatus] = useState("");
const [showStatusOptions, setShowStatusOptions] = useState(false);

const [tableColumns, setTableColumns] = useState([]);
const [newColumn, setNewColumn] = useState({
    label: "",
    key: "",
});
const [showTableColumns, setShowTableColumns] = useState(false);

const [editingColumnIndex, setEditingColumnIndex] = useState(null);
const [editedColumnLabel, setEditedColumnLabel] = useState("");


const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: false,
    options: "",
});


// Global optional customer details fields
const [customerDetailsFields, setCustomerDetailsFields] = useState([]);
const [newCustomerDetailsField, setNewCustomerDetailsField] = useState("");
const [showCustomerDetailsFields, setShowCustomerDetailsFields] = useState(false);

const [customerDetailsError, setCustomerDetailsError] = useState("");
const [customerDetailsSuccess, setCustomerDetailsSuccess] = useState("");




    const loadServices = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllServices();
            setServices(data);
        } catch (err) {
            console.error("Failed to load service catalogue:", err);
            setError("Unable to load the Service Catalogue.");
        } finally {
            setLoading(false);
        }
    };


    const loadCustomerDetailsFields = async () => {
    try {
        const fields = await getCustomerDetailsFields();
        setCustomerDetailsFields(fields);
    } catch (err) {
        console.error("Failed to load customer details fields:", err);
        setError("Unable to load customer details fields.");
    }
};



    useEffect(() => {
    loadServices();
    loadCustomerDetailsFields();
}, []);



    const handleCreateService = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!serviceName.trim() || !serviceKey.trim()) {
            setError("Please enter both Service Name and Service Key.");
            return;
        }

        try {
            setSaving(true);

            await createServiceDefinition({
    serviceName: serviceName.trim(),
    serviceKey: serviceKey.trim().toUpperCase(),
    formFields: formFields,
    tableColumns: tableColumns,
   statusOptions: statusOptions
});

            setServiceName("");
            setServiceKey("");
            setFormFields([]);
            setStatusOptions([]);
            setTableColumns([]);
            setSuccess("Service created successfully.");
            setTimeout(() => setSuccess(""), 4000);
            await loadServices();
        } catch (err) {
            console.error("Failed to create service:", err);
            setError(err.message || "Unable to create service.");
        } finally {
            setSaving(false);
        }
    };



    const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceName(service.serviceName);
    setServiceKey(service.serviceKey);
    setFormFields(service.formFields || []);
    setStatusOptions(service.statusOptions || []);
    setTableColumns(service.tableColumns || []);
    setError("");
    setSuccess("");
};


const handleUpdateService = async (event) => {
    event.preventDefault();

    if (!editingServiceId) return;

    setError("");
    setSuccess("");

    if (!serviceName.trim()) {
        setError("Please enter a Service Name.");
        return;
    }

    try {
        setSaving(true);

        await updateServiceDefinition(editingServiceId, {
            serviceName: serviceName.trim(),
            formFields,
            tableColumns,
            statusOptions
        });

        setEditingServiceId(null);
        setServiceName("");
        setServiceKey("");
        setFormFields([]);
        setStatusOptions([]);
        setTableColumns([]);
        setShowFormFields(false);
        setShowStatusOptions(false);
        setShowTableColumns(false);

        setSuccess("Service updated successfully.");
        await loadServices();
    } catch (err) {
        console.error("Failed to update service:", err);
        setError(err.message || "Unable to update service.");
    } finally {
        setSaving(false);
    }
};


    const handleAddFormField = () => {
    const label = newField.label.trim();

    if (!label) {
        setError("Please enter a field label.");
        return;
    }

    const fieldKey = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    if (formFields.some(field => field.key === fieldKey)) {
        setError("A field with this identifier already exists.");
        return;
    }

    const options = newField.type === "dropdown"
        ? newField.options
            .split(",")
            .map(option => option.trim())
            .filter(Boolean)
        : [];

    if (newField.type === "dropdown" && options.length === 0) {
        setError("Please provide at least one dropdown option.");
        return;
    }

    setFormFields(previous => [
        ...previous,
        {
            key: fieldKey,
            label,
            type: newField.type,
            required: newField.required,
            options,
        },
    ]);

    setNewField({
        label: "",
        type: "text",
        required: false,
        options: "",
    });

    setError("");
};



const handleAddCustomerDetailsField = () => {
    const label = newCustomerDetailsField.trim();

    if (!label) {
        setCustomerDetailsError("Please enter a customer field name.");
        setCustomerDetailsSuccess("");
        return;
    }

    const key = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    if (!key) {
        setCustomerDetailsError("Please enter a valid field name.");
        setCustomerDetailsSuccess("");
        return;
    }

    if (customerDetailsFields.some(field =>
        field.key === key ||
        field.label.toLowerCase() === label.toLowerCase()
    )) {
        setCustomerDetailsError("This customer field already exists.");
        setCustomerDetailsSuccess("");
        return;
    }

    setCustomerDetailsFields(previous => [
        ...previous,
        { key, label, type: "text" }
    ]);

    setNewCustomerDetailsField("");
    setCustomerDetailsError("");
    setCustomerDetailsSuccess("");
};


const handleRemoveCustomerDetailsField = (key) => {
    setCustomerDetailsFields(previous =>
        previous.filter(field => field.key !== key)
    );

    setCustomerDetailsError("");
    setCustomerDetailsSuccess("");
};


const handleSaveCustomerDetailsFields = async () => {
    setCustomerDetailsError("");
    setCustomerDetailsSuccess("");

    try {
        setSaving(true);

        await saveCustomerDetailsFields(customerDetailsFields);

        setCustomerDetailsSuccess(
            "Customer details fields saved successfully."
        );

        setTimeout(() => setCustomerDetailsSuccess(""), 4000);

    } catch (err) {
        console.error("Failed to save customer details fields:", err);

        setCustomerDetailsError(
            err.message || "Unable to save customer details fields."
        );

    } finally {
        setSaving(false);
    }
};





const handleAddStatus = () => {
    const status = newStatus.trim();

    if (!status) {
        setError("Please enter a transaction status.");
        return;
    }

    if (statusOptions.some(option => option.toLowerCase() === status.toLowerCase())) {
        setError("This transaction status already exists.");
        return;
    }

    setStatusOptions(previous => [...previous, status]);
    setNewStatus("");
    setError("");
};



const handleEditStatus = (index) => {
    setEditingStatusIndex(index);
    setEditedStatus(statusOptions[index]);
    setError("");
};

const handleSaveEditedStatus = () => {
    const status = editedStatus.trim();

    if (!status) {
        setError("Please enter a transaction status.");
        return;
    }

    if (statusOptions.some((option, index) =>
        index !== editingStatusIndex &&
        option.toLowerCase() === status.toLowerCase()
    )) {
        setError("This transaction status already exists.");
        return;
    }

    setStatusOptions(previous =>
        previous.map((option, index) =>
            index === editingStatusIndex ? status : option
        )
    );

    setEditingStatusIndex(null);
    setEditedStatus("");
    setError("");
};




const handleAddTableColumn = () => {
    const label = newColumn.label.trim();

    if (!label) {
        setError("Please enter a column label.");
        return;
    }

    const key = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    if (tableColumns.some(column => column.key === key)) {
        setError("A column with this identifier already exists.");
        return;
    }

    setTableColumns(previous => [...previous, { key, label }]);
    setNewColumn({ label: "", key: "" });
    setError("");
};



const handleEditColumn = (index) => {
    setEditingColumnIndex(index);
    setEditedColumnLabel(tableColumns[index].label);
    setError("");
};

const handleSaveEditedColumn = () => {
    const label = editedColumnLabel.trim();

    if (!label) {
        setError("Please enter a column label.");
        return;
    }

    setTableColumns(previous =>
        previous.map((column, index) =>
            index === editingColumnIndex
                ? { ...column, label }
                : column
        )
    );

    setEditingColumnIndex(null);
    setEditedColumnLabel("");
    setError("");
};




const handleToggleServiceStatus = async (service) => {
    const action = service.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} "${service.serviceName}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
        setSaving(true);

        await setServiceActiveStatus(service.id, !service.isActive);

        setSuccess(
            `${service.serviceName} ${action}d successfully.`
        );

        await loadServices();
    } catch (err) {
        console.error("Failed to change service status:", err);
        setError(err.message || "Unable to change service status.");
    } finally {
        setSaving(false);
    }
};




const getServiceCardImage = (serviceKey) => {
    const images = {
        FLIGHT_TICKET: "flights.webp",
        VISA_SERVICES: "visa-services.webp",
        PASSPORT_SERVICES: "passport-services.webp",
        TRAIN_TICKET: "train-ticket.webp",
        FOREX: "forex.webp",
        CURRENCY_EXCHANGE: "forex.webp",
        HOTEL_SERVICES: "hotels.webp",
        CRUISE_SERVICES: "cruise.webp",
        TRAVEL_INSURANCE: "travel-insurance.webp",
    };

    const image = images[serviceKey];

    return image
        ? `/images/services/webp/${image}`
        : "/images/services/webp/destinations.webp";
};



const handleEditField = (field) => {
    setEditingFieldKey(field.key);
    setEditedField({
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options?.join(", ") || "",
    });
    setError("");
};



const handleSaveEditedField = () => {
    const label = editedField.label.trim();

    if (!label) {
        setError("Please enter a field label.");
        return;
    }

    const options = editedField.type === "dropdown"
        ? editedField.options.split(",").map(option => option.trim()).filter(Boolean)
        : [];

    if (editedField.type === "dropdown" && options.length === 0) {
        setError("Please provide at least one dropdown option.");
        return;
    }

    setFormFields(previous =>
        previous.map(field =>
            field.key === editingFieldKey
                ? {
                    ...field,
                    label,
                    type: editedField.type,
                    required: editedField.required,
                    options,
                }
                : field
        )
    );

    setEditingFieldKey(null);
    setEditedField({
        label: "",
        type: "text",
        required: false,
        options: "",
    });
    setError("");
};





    return (
        <div style={{
    display: "block",
    width: "100%",
    textAlign: "left",
}}>
            

            {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
            {success && <p style={{ color: "#15803d" }}>{success}</p>}

          <form
    onSubmit={editingServiceId ? handleUpdateService : handleCreateService}
    style={{
    maxWidth: "none",
width: "100%",
margin: "0",
    background: "linear-gradient(145deg, #ffffff, #f2f7ff)",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    padding: "9px 15px",
    boxShadow: "0 4px 14px rgba(30,64,175,0.05)",
    boxSizing: "border-box",
}}
>
    {/* SECTION HEADING */}
    <div 
    style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "10px",
    marginBottom: "10px",
    padding: "9px 11px",
    background: "linear-gradient(100deg, #dbeafe 0%, #eff6ff 55%, #f8fbff 100%)",
    border: "1px solid #c9ddfb",
    borderRadius: "8px",
    textAlign: "left",
    width: "100%",
    boxSizing: "border-box",
}}
    >
        <div style={{
            width: "4px",
            height: "38px",
            
            borderRadius: "5px",
            background: "linear-gradient(180deg, #174ea6, #3895e8)",
            flexShrink: 0,
        }} />

        <div>
            <h3 style={{
                margin: 0,
                fontSize: "16px",
                textAlign: "left",
                fontWeight: 800,
                color: "#164da5",
            }}>
                {editingServiceId ? "Edit Service Configuration" : "Basic Information"}
            </h3>

            <p style={{
                margin: "3px 0 0",
                fontSize: "11px",
                textAlign: "left",
                color: "#64748b",
            }}>
                Define the service identity and catalogue details.
            </p>
        </div>
    </div>

    {/* INPUT FIELDS */}
    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px 14px",
        alignItems: "start",
    }}>
        <label style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "6px",
            minWidth: 0,
            textAlign: "left",
        }}>
            <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#334155",
                textAlign: "left",
            }}>
                Service Name <span style={{ color: "#dc2626" }}>*</span>
            </span>

            <input
                type="text"
                value={serviceName}
                onChange={(event) => setServiceName(event.target.value)}
                placeholder="e.g. Travel Insurance"
                required
                style={{
                    width: "100%",
                    height: "40px",
                    boxSizing: "border-box",
                    padding: "0 11px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "7px",
                    background: "#ffffff",
                    color: "#172033",
                    fontSize: "12px",
                    outlineColor: "#1675dc",
                }}
            />
        </label>

        <label style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "6px",
            minWidth: 0,
            textAlign: "left",
        }}>
            <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#334155",
                textAlign: "left",
            }}>
                Service Key <span style={{ color: "#dc2626" }}>*</span>
            </span>

            <input
                type="text"
                readOnly={!!editingServiceId}
                value={serviceKey}
                onChange={(event) => setServiceKey(
                    event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9_]/g, "_")
                )}
                placeholder="e.g. TRAVEL_INSURANCE"
                required
                style={{
                    width: "100%",
                    height: "40px",
                    boxSizing: "border-box",
                    padding: "0 11px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "7px",
                    background: "#ffffff",
                    color: "#172033",
                    fontSize: "12px",
                    outlineColor: "#1675dc",
                }}
            />

            <span style={{
                fontSize: "10px",
                color: "#94a3b8",
            }}>
                Permanent internal identifier.
            </span>
        </label>
    </div>

    {/* ACTION */}
    <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "15px",
        paddingTop: "12px",
        borderTop: "1px solid #dbeafe",
    }}>
        <button
            type="submit"
            disabled={saving}
            style={{
                border: "none",
                borderRadius: "7px",
                padding: "9px 18px",
                background: saving ? "#94a3b8" : "#1675dc",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 3px 9px rgba(22,117,220,0.18)",
            }}
        >
            {saving
    ? "SAVING..."
    : editingServiceId
        ? "UPDATE SERVICE"
        : "+ CREATE SERVICE"}
        </button>

        {editingServiceId && (
    <button
        type="button"
        disabled={saving}
        onClick={() => {
            setEditingServiceId(null);
            setServiceName("");
            setServiceKey("");
            setFormFields([]);
            setStatusOptions([]);
            setTableColumns([]);
            setError("");
            setSuccess("");
        }}
        style={{
            border: "1px solid #cbd5e1",
            borderRadius: "7px",
            padding: "9px 18px",
            background: "#ffffff",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 800,
            cursor: saving ? "not-allowed" : "pointer",
        }}
    >
        CANCEL EDIT
    </button>
)}


    </div>
</form>



{/* FORM FIELDS CONFIGURATION */}
<div
    style={{
        marginTop: "14px",
        border: "1px solid #dbeafe",
        borderRadius: "12px",
        background: "#ffffff",
        overflow: "hidden",
    }}
>
    <button
    type="button"
    onClick={() => setShowFormFields(previous => !previous)}
    style={{
        width: "100%",
        border: "none",
        background: "linear-gradient(100deg, #dbeafe 0%, #eff6ff 55%, #f8fbff 100%)",
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
    }}
>
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
    }}>
        <div style={{
            width: "4px",
            height: "38px",
            borderRadius: "5px",
            background: "linear-gradient(180deg, #174ea6, #3895e8)",
            flexShrink: 0,
        }} />

        <div>
            <div style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#164da5",
            }}>
                Form Fields Configuration
            </div>

            <div style={{
                marginTop: "4px",
                fontSize: "11px",
                color: "#64748b",
            }}>
                Configure the fields required for this service.
            </div>
        </div>
    </div>

    <span style={{
        color: "#1675dc",
        fontSize: "20px",
        fontWeight: 800,
        paddingLeft: "10px",
    }}>
        {showFormFields ? "−" : "+"}
    </span>
</button>

    {showFormFields && (
        <div style={{ padding: "18px" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "12px",
                alignItems: "end",
            }}>
                <label style={{ display: "grid", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>
                        Field Label
                    </span>
                    <input
                        value={newField.label}
                        onChange={event => setNewField(previous => ({
                            ...previous,
                            label: event.target.value,
                        }))}
                        placeholder="e.g. Policy Number"
                        style={{ padding: "9px", border: "1px solid #cbd5e1", borderRadius: "7px" }}
                    />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>
                        Field Type
                    </span>
                    <select
                        value={newField.type}
                        onChange={event => setNewField(previous => ({
                            ...previous,
                            type: event.target.value,
                        }))}
                        style={{ padding: "9px", border: "1px solid #cbd5e1", borderRadius: "7px" }}
                    >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="textarea">Textarea</option>
                        <option value="email">Email</option>
                        <option value="mobile">Mobile Number</option>
                        <option value="checkbox">Checkbox</option>
                    </select>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 0", fontSize: "11px", fontWeight: 700 }}>
                    <input
                        type="checkbox"
                        checked={newField.required}
                        onChange={event => setNewField(previous => ({
                            ...previous,
                            required: event.target.checked,
                        }))}
                    />
                    Required field
                </label>

                <button
                    type="button"
                    onClick={handleAddFormField}
                    style={{
                        padding: "10px 15px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#1675dc",
                        color: "#ffffff",
                        fontWeight: 800,
                        cursor: "pointer",
                    }}
                >
                    + Add Field
                </button>
            </div>

            {newField.type === "dropdown" && (
                <label style={{
                    display: "grid",
                    gap: "6px",
                    marginTop: "14px",
                }}>
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>
                        Dropdown Options (comma separated)
                    </span>
                    <input
                        value={newField.options}
                        onChange={event => setNewField(previous => ({
                            ...previous,
                            options: event.target.value,
                        }))}
                        placeholder="e.g. Individual, Family, Group"
                        style={{ padding: "9px", border: "1px solid #cbd5e1", borderRadius: "7px" }}
                    />
                </label>
            )}

            <div style={{
    marginTop: "18px",
    padding: "14px",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    background: "#ffffff",
}}>
    <h4 style={{
        margin: "0 0 12px",
        fontSize: "13px",
        fontWeight: 800,
        color: "#164da5",
        gridColumn: "1 / -1",
    }}>
        Configured Fields ({formFields.length})
    </h4>

    {formFields.length === 0 ? (
        <p style={{ fontSize: "11px", color: "#94a3b8" }}>
            No custom fields added yet.
        </p>
    ) : (
        <div style={{
            display: "grid",
           gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "10px",
        }}>
            {formFields.map((field, index) => (
                <div
                    key={field.key}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 9px",
                        minWidth: 0,
                        border: "1px solid #dbe3ef",
                        borderRadius: "7px",
                        background: "linear-gradient(145deg, #ffffff, #f6f9ff)",
                        boxSizing: "border-box",
                    }}
                >
                   <div style={{ flex: 1, minWidth: 0 }}>
    {editingFieldKey === field.key ? (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "7px",
        }}>
            <input
                value={editedField.label}
                onChange={event => setEditedField(previous => ({
                    ...previous,
                    label: event.target.value,
                }))}
                placeholder="Field label"
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "6px 8px",
                    border: "1px solid #bfdbfe",
                    borderRadius: "5px",
                    fontSize: "11px",
                }}
            />

            <select
                value={editedField.type}
                onChange={event => setEditedField(previous => ({
                    ...previous,
                    type: event.target.value,
                }))}
                style={{
                    padding: "6px 8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "5px",
                    fontSize: "10px",
                }}
            >
                {["text", "number", "date", "dropdown", "textarea", "email", "mobile", "checkbox"].map(type => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>

            <label style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                color: "#475569",
            }}>
                <input
                    type="checkbox"
                    checked={editedField.required}
                    onChange={event => setEditedField(previous => ({
                        ...previous,
                        required: event.target.checked,
                    }))}
                />
                Required
            </label>

            {editedField.type === "dropdown" && (
                <input
                    value={editedField.options}
                    onChange={event => setEditedField(previous => ({
                        ...previous,
                        options: event.target.value,
                    }))}
                    placeholder="Option 1, Option 2, Option 3"
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "6px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "5px",
                        fontSize: "10px",
                    }}
                />
            )}

            <div style={{
                display: "flex",
                gap: "6px",
                marginTop: "3px",
            }}>
                <button
                    type="button"
                    onClick={handleSaveEditedField}
                    style={{
                        padding: "4px 9px",
                        border: "1px solid #bbf7d0",
                        borderRadius: "5px",
                        background: "#f0fdf4",
                        color: "#15803d",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    SAVE
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setEditingFieldKey(null);
                        setEditedField({
                            label: "",
                            type: "text",
                            required: false,
                            options: "",
                        });
                        setError("");
                    }}
                    style={{
                        padding: "4px 9px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "5px",
                        background: "#fff",
                        color: "#64748b",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    CANCEL
                </button>
            </div>
        </div>
    ) : (
        <>
            <div style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#164da5",
                overflowWrap: "anywhere",
            }}>
                {field.label}
            </div>

            <div style={{
                fontSize: "10px",
                color: "#64748b",
                marginTop: "5px",
            }}>
                {field.type} · {field.required ? "Required" : "Optional"}
                {field.options?.length > 0
                    ? ` · ${field.options.join(", ")}`
                    : ""}
            </div>
        </>
    )}
</div>


{editingFieldKey !== field.key && (
    <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        flexShrink: 0,
    }}>
        <button
            type="button"
            onClick={() => handleEditField(field)}
            style={{
                padding: "4px 9px",
                border: "1px solid #bfdbfe",
                borderRadius: "6px",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
            }}
        >
            EDIT
        </button>

        <button
            type="button"
            onClick={() => {
                setFormFields(previous =>
                    previous.filter((_, fieldIndex) => fieldIndex !== index)
                );
            }}
            style={{
                padding: "4px 9px",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                background: "#fff5f5",
                color: "#b91c1c",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
            }}
        >
            REMOVE
        </button>
    </div>
)}
                </div>
            ))}
        </div>
    )}
</div>


        </div>
    )}
</div>



{/* Transaction Status Configuration */}
<div style={{
    marginTop: "18px",
    border: "1px solid #dbe3ef",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff"
}}>
    <button
    type="button"
    onClick={() => setShowStatusOptions(previous => !previous)}
    style={{
        width: "100%",
        border: "none",
        background: "linear-gradient(100deg, #dbeafe 0%, #eff6ff 55%, #f8fbff 100%)",
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
    }}
>
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
    }}>
        <div style={{
            width: "4px",
            height: "38px",
            borderRadius: "5px",
            background: "linear-gradient(180deg, #174ea6, #3895e8)",
            flexShrink: 0,
        }} />

        <div>
            <div style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#164da5",
            }}>
                Transaction Status Configuration
            </div>

            <div style={{
                marginTop: "4px",
                fontSize: "11px",
                color: "#64748b",
            }}>
                Define the transaction statuses available for this service.
            </div>
        </div>
    </div>

    <span style={{
        color: "#1675dc",
        fontSize: "20px",
        fontWeight: 800,
        paddingLeft: "10px",
    }}>
        {showStatusOptions ? "−" : "+"}
    </span>
</button>

    {showStatusOptions && (
        <div style={{ padding: "18px" }}>
            <p style={{
                margin: "0 0 14px",
                color: "#64748b",
                fontSize: "13px"
            }}>
                Define the transaction statuses available for this service.
            </p>

            <div style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <input
                    type="text"
                    value={newStatus}
                    onChange={event => setNewStatus(event.target.value)}
                    placeholder="Enter status (e.g. Confirmed)"
                    style={{
                        flex: "1",
                        minWidth: "220px",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        fontSize: "14px"
                    }}
                />

                <button
                    type="button"
                    onClick={handleAddStatus}
                    style={{
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#1d4ed8",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    + Add Status
                </button>
            </div>

            {statusOptions.length > 0 && (
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "16px"
                }}>
                    {statusOptions.map((status, index) => (
    <div
        key={`${status}-${index}`}
        style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 10px",
            borderRadius: "9px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
        }}
    >
        {editingStatusIndex === index ? (
            <>
                <input
                    value={editedStatus}
                    onChange={event => setEditedStatus(event.target.value)}
                    style={{
                        width: "125px",
                        minWidth: 0,
                        padding: "5px 7px",
                        border: "1px solid #93c5fd",
                        borderRadius: "5px",
                        fontSize: "11px",
                    }}
                />

                <button
                    type="button"
                    onClick={handleSaveEditedStatus}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #bbf7d0",
                        borderRadius: "5px",
                        background: "#f0fdf4",
                        color: "#15803d",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    SAVE
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setEditingStatusIndex(null);
                        setEditedStatus("");
                        setError("");
                    }}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "5px",
                        background: "#fff",
                        color: "#64748b",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    CANCEL
                </button>
            </>
        ) : (
            <>
                <span style={{
                    color: "#1e40af",
                    fontSize: "11px",
                    fontWeight: 700,
                }}>
                    {status}
                </span>

                <button
                    type="button"
                    onClick={() => handleEditStatus(index)}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #bfdbfe",
                        borderRadius: "5px",
                        background: "#fff",
                        color: "#1d4ed8",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    EDIT
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setStatusOptions(previous =>
                            previous.filter((_, statusIndex) => statusIndex !== index)
                        );
                    }}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #fecaca",
                        borderRadius: "5px",
                        background: "#fff5f5",
                        color: "#b91c1c",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    REMOVE
                </button>
            </>
        )}
    </div>
))}
                </div>
            )}
        </div>
    )}
</div>




{/* Table Columns Configuration */}
<div style={{
    marginTop: "18px",
    border: "1px solid #dbe3ef",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff"
}}>
    <button
    type="button"
    onClick={() => setShowTableColumns(previous => !previous)}
    style={{
        width: "100%",
        border: "none",
        background: "linear-gradient(100deg, #dbeafe 0%, #eff6ff 55%, #f8fbff 100%)",
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
    }}
>
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
    }}>
        <div style={{
            width: "4px",
            height: "38px",
            borderRadius: "5px",
            background: "linear-gradient(180deg, #174ea6, #3895e8)",
            flexShrink: 0,
        }} />

        <div>
            <div style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#164da5",
            }}>
                Client Master Table Columns Configuration
            </div>

            <div style={{
                marginTop: "4px",
                fontSize: "11px",
                color: "#64748b",
            }}>
                Configure the columns displayed in this service's Client Master transaction history.
            </div>
        </div>
    </div>

    <span style={{
        color: "#1675dc",
        fontSize: "20px",
        fontWeight: 800,
        paddingLeft: "10px",
    }}>
        {showTableColumns ? "−" : "+"}
    </span>
</button>

    {showTableColumns && (
        <div style={{ padding: "18px" }}>
            <p style={{
                margin: "0 0 14px",
                color: "#64748b",
                fontSize: "13px"
            }}>
                Define which columns should appear in this service's transaction history in Client Master.
            </p>

            <div style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <input
                    type="text"
                    value={newColumn.label}
                    onChange={event => setNewColumn({
                        label: event.target.value,
                        key: ""
                    })}
                    placeholder="Enter column label (e.g. Airline)"
                    style={{
                        flex: "1",
                        minWidth: "220px",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        fontSize: "14px"
                    }}
                />

                <button
                    type="button"
                    onClick={handleAddTableColumn}
                    style={{
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#1d4ed8",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    + Add Column
                </button>
            </div>

            {tableColumns.length > 0 && (
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "16px"
                }}>
                    {tableColumns.map((column, index) => (
    <div
        key={`${column.key}-${index}`}
        style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 10px",
            borderRadius: "9px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
        }}
    >
        {editingColumnIndex === index ? (
            <>
                <input
                    value={editedColumnLabel}
                    onChange={event => setEditedColumnLabel(event.target.value)}
                    style={{
                        width: "125px",
                        minWidth: 0,
                        padding: "5px 7px",
                        border: "1px solid #93c5fd",
                        borderRadius: "5px",
                        fontSize: "11px",
                    }}
                />

                <button
                    type="button"
                    onClick={handleSaveEditedColumn}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #bbf7d0",
                        borderRadius: "5px",
                        background: "#f0fdf4",
                        color: "#15803d",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    SAVE
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setEditingColumnIndex(null);
                        setEditedColumnLabel("");
                        setError("");
                    }}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "5px",
                        background: "#fff",
                        color: "#64748b",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    CANCEL
                </button>
            </>
        ) : (
            <>
                <span style={{
                    color: "#1e40af",
                    fontSize: "11px",
                    fontWeight: 700,
                }}>
                    {column.label}
                </span>

                <button
                    type="button"
                    onClick={() => handleEditColumn(index)}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #bfdbfe",
                        borderRadius: "5px",
                        background: "#fff",
                        color: "#1d4ed8",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    EDIT
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setTableColumns(previous =>
                            previous.filter((_, columnIndex) => columnIndex !== index)
                        );
                    }}
                    style={{
                        padding: "4px 7px",
                        border: "1px solid #fecaca",
                        borderRadius: "5px",
                        background: "#fff5f5",
                        color: "#b91c1c",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    REMOVE
                </button>
            </>
        )}
    </div>
))}
                </div>
            )}
        </div>
    )}
</div>




{/* GLOBAL CUSTOMER DETAILS FIELDS */}
<div style={{
    marginTop: "18px",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ffffff",
}}>
    <button
        type="button"
        onClick={() => setShowCustomerDetailsFields(previous => !previous)}
        style={{
            width: "100%",
            border: "none",
            background: "linear-gradient(100deg, #dbeafe 0%, #eff6ff 55%, #f8fbff 100%)",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            textAlign: "left",
            boxSizing: "border-box",
        }}
    >
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
        }}>
            <div style={{
                width: "4px",
                height: "38px",
                borderRadius: "5px",
                background: "linear-gradient(180deg, #174ea6, #3895e8)",
                flexShrink: 0,
            }} />

            <div>
                <div style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#164da5",
                }}>
                    Customer Details Fields Configuration
                </div>

                <div style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    color: "#64748b",
                }}>
                    Manage optional customer fields shared across all services.
                </div>
            </div>
        </div>

        <span style={{
            color: "#1675dc",
            fontSize: "11px",
            fontWeight: 800,
            padding: "6px 10px",
            border: "1px solid #bfdbfe",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.65)",
            whiteSpace: "nowrap",
        }}>
            {showCustomerDetailsFields ? "HIDE −" : "CONFIGURE +"}
        </span>
    </button>




    {showCustomerDetailsFields && (
        <div style={{
            padding: "14px",
            background: "#f8fbff",
            border: "1px solid #dbeafe",
            borderRadius: "9px",
        }}>


            {customerDetailsError && (
    <p style={{
        margin: "0 0 10px",
        padding: "8px 10px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        color: "#b91c1c",
        fontSize: "11px",
        fontWeight: 600,
    }}>
        {customerDetailsError}
    </p>
)}

{customerDetailsSuccess && (
    <p style={{
        margin: "0 0 10px",
        padding: "8px 10px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "6px",
        color: "#15803d",
        fontSize: "11px",
        fontWeight: 600,
    }}>
        {customerDetailsSuccess}
    </p>
)}



            <div style={{
                display: "flex",
                gap: "8px",
                marginBottom: "13px",
            }}>
                <input
                    type="text"
                    value={newCustomerDetailsField}
                    onChange={event => {
    setNewCustomerDetailsField(event.target.value);
    setCustomerDetailsError("");
}}
                    placeholder="e.g. GST Number, PAN Number, Alternate Mobile"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        height: "38px",
                        padding: "0 10px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12px",
                        boxSizing: "border-box",
                    }}
                />

                <button
                    type="button"
                    onClick={handleAddCustomerDetailsField}
                    style={{
                        padding: "0 15px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#1675dc",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                    }}
                >
                    + ADD FIELD
                </button>
            </div>



            {/* EXISTING CUSTOMER FIELDS - REFERENCE ONLY */}
<div style={{
    marginBottom: "14px",
}}>
    <div style={{
        fontSize: "11px",
        fontWeight: 800,
        color: "#164da5",
        marginBottom: "8px",
    }}>
        EXISTING CUSTOMER FIELDS
    </div>

    <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "7px",
    }}>
        {[
            "Client / Agency Name",
            "Contact Person",
            "Mobile",
            "Email",
            "City",
            "Source",
            "Client Type",
            "Client Status",
            "Address",
            "Notes",
        ].map(field => (
            <span
                key={field}
                style={{
                    padding: "7px 10px",
                    background: "#eaf2ff",
                    border: "1px solid #c7dcff",
                    borderRadius: "6px",
                    color: "#334b6b",
                    fontSize: "11px",
                    fontWeight: 700,
                }}
            >
                {field}
            </span>
        ))}
    </div>
</div>

{/* ADMIN-CONFIGURED OPTIONAL CUSTOMER FIELDS */}
<div style={{
    marginBottom: "8px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#164da5",
}}>
    ADDITIONAL CUSTOMER FIELDS
</div>





            {customerDetailsFields.length === 0 ? (
                <p style={{
                    margin: "10px 0",
                    color: "#64748b",
                    fontSize: "11px",
                }}>
                    No additional customer fields configured.
                </p>
            ) : (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                }}>
                    {customerDetailsFields.map(field => (
                        <div
                            key={field.key}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "10px",
                                padding: "9px 11px",
                                background: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                            }}
                        >
                            <span style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#334155",
                            }}>
                                {field.label}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveCustomerDetailsField(field.key)
                                }
                                style={{
                                    padding: "5px 9px",
                                    border: "1px solid #fecaca",
                                    borderRadius: "5px",
                                    background: "#fff5f5",
                                    color: "#b91c1c",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                REMOVE
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid #dbeafe",
            }}>
                <button
                    type="button"
                    onClick={handleSaveCustomerDetailsFields}
                    disabled={saving}
                    style={{
                        padding: "9px 17px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#15803d",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: saving ? "not-allowed" : "pointer",
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving ? "SAVING..." : "SAVE CUSTOMER FIELDS"}
                </button>
            </div>
        </div>
    )}
</div>





            {/* EXISTING SERVICES */}


            <div style={{
    marginTop: "20px",
    paddingTop: "17px",
    borderTop: "1px solid #e2e8f0",
}}>

<div style={{
    marginBottom: "13px",
    padding: "11px 15px",
    background: "linear-gradient(100deg, #075985 0%, #0e7490 55%, #14b8a6 100%)",
    border: "1px solid #0e7490",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(8,145,178,0.14)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
}}>
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
    }}>
        <div style={{
            width: "4px",
            height: "38px",
            borderRadius: "5px",
            background: "linear-gradient(180deg, #ffffff, #a5f3fc)",
            flexShrink: 0,
        }} />

        <div>
            <h3 style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 800,
                color: "#ffffff",
            }}>
                Existing Services
            </h3>

            <p style={{
                margin: "4px 0 0",
                fontSize: "11px",
                color: "#e0f2fe",
            }}>
                Registered services in your catalogue.
            </p>
        </div>
    </div>

    <span style={{
        background: "rgba(255,255,255,0.16)",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "20px",
        padding: "5px 11px",
        fontSize: "10px",
        fontWeight: 800,
        whiteSpace: "nowrap",
    }}>
        {services.length} SERVICES
    </span>
</div>

    {loading ? (
        <div style={{
            padding: "22px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "12px",
        }}>
            Loading service catalogue...
        </div>
    ) : services.length === 0 ? (
        <div style={{
            padding: "25px 15px",
            textAlign: "center",
            background: "#f8fbff",
            border: "1px dashed #bfdbfe",
            borderRadius: "10px",
        }}>
            <div style={{
                fontSize: "25px",
                color: "#93c5fd",
                marginBottom: "7px",
            }}>
                +
            </div>

            <div style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#334155",
            }}>
                No services added yet
            </div>

            <p style={{
                margin: "5px 0 0",
                fontSize: "11px",
                color: "#64748b",
            }}>
                Create your first service using the form above.
            </p>
        </div>
    ) : (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "10px",
        }}>
            {services.map(service => (
                <div
                    key={service.id}
                    style={{
    height: "130px",
    minHeight: "130px",
    boxSizing: "border-box",
    padding: "12px 15px",
    display: "flex",
    flexDirection: "column",
    backgroundImage: `
        linear-gradient(90deg,
            rgba(255,255,255,0.78) 0%,
            rgba(255,255,255,0.48) 30%,
            rgba(255,255,255,0.05) 75%,
            rgba(255,255,255,0.00) 100%
        ),
        url("${getServiceCardImage(service.serviceKey)}")
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    border: "1px solid #dbe3ef",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(30,64,175,0.08)",
}}
                >
                    <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    minHeight: "48px",
}}>
    <div 
    style={{
    flex: 1,
    minWidth: 0,
    fontSize: "14px",
    fontWeight: 900,
    lineHeight: 1.3,
    color: "#103b78",
    textShadow: `
        0 1px 2px rgba(255,255,255,1),
        1px 0 2px rgba(255,255,255,0.9),
        -1px 0 2px rgba(255,255,255,0.9)
    `,
    background: "rgba(255,255,255,0.12)",
    padding: "4px 5px",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "none",
}}
    >
        {service.serviceName}
    </div>

    <span style={{
       background: service.isActive
    ? "rgba(187,247,208,0.55)"
    : "rgba(226,232,240,0.55)",
        color: service.isActive ? "#166534" : "#64748b",
        border: service.isActive
            ? "1px solid #86efac"
            : "1px solid #cbd5e1",
        borderRadius: "20px",
        padding: "6px 9px",
        fontSize: "9px",
        fontWeight: 900,
        whiteSpace: "nowrap",
        flexShrink: 0,
    }}>
        {service.isActive ? "ACTIVE" : "INACTIVE"}
    </span>
</div>

                   

                    <div style={{
    display: "flex",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "8px",
    
}}
>
    <button
        type="button"
        disabled={saving}
        onClick={() => handleEditService(service)}
        style={{
    padding: "7px 14px",
    border: "1px solid #2563eb",
    borderRadius: "7px",
    background: "rgba(219,234,254,0.48)",
    color: "#174ea6",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.3px",
    cursor: saving ? "not-allowed" : "pointer",
    boxShadow: "none",
    opacity: saving ? 0.6 : 1,
}}
    >
        EDIT
    </button>

    <button
        type="button"
        disabled={saving}
        onClick={() => handleToggleServiceStatus(service)}
        style={{
    padding: "7px 14px",
    border: service.isActive
        ? "1px solid #fed7aa"
        : "1px solid #86efac",
    borderRadius: "7px",
    background: service.isActive
    ? "rgba(255,237,213,0.48)"
    : "rgba(220,252,231,0.48)",
    color: service.isActive ? "#c2410c" : "#15803d",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.2px",
    cursor: saving ? "not-allowed" : "pointer",
    boxShadow: "none",
    opacity: saving ? 0.6 : 1,
}}
    >
        {service.isActive ? "DEACTIVATE" : "ACTIVATE"}
    </button>
</div>


                </div>
            ))}
        </div>
    )}
</div>
        </div>
    );
}

export default ManageServices;