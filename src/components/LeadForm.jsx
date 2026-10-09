


import React from "react";

const LEAD_SOURCES = [
    "Website",
    "Instagram",
    "Facebook",
    "WhatsApp",
    "Phone Call",
    "Referral",
    "Direct Office",
    "Existing Client",
    "Email",
    "Other"
];

const LEAD_STATUSES = [
    "New",
    "Contacted",
    "Requirement Received",
    "Supplier Enquiry",
    "Quotation Prepared",
    "Quotation Sent",
    "Follow-up",
    "Confirmed",
    "Lost"
];

const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    fontSize: "13px",
    color: "#1f2937",
    outline: "none"
};

const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569"
};

export default function LeadForm({
    formData,
    setFormData,
    handleChange,
    handleCreateLead,
    saving,
    onClose,
    cardStyle
}) {

        const updateField = event => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };


    return (
        <div
            style={{
                ...cardStyle,
                padding: "18px",
                marginBottom: "18px"
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px"
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "15px",
                        color: "#1e3a5f"
                    }}
                >
                    New Lead
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        fontSize: "20px",
                        cursor: "pointer",
                        lineHeight: 1
                    }}
                >
                    ×
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(4, minmax(0, 1fr))",
                    gap: "14px"
                }}
            >

                {/* SOURCE */}

                <div>

                    <label style={labelStyle}>
                        Lead Source
                    </label>

                   <select
    name="source"
    value={formData.source}
    onChange={updateField}

                        style={fieldStyle}
                    >
                        {LEAD_SOURCES.map(source => (
                            <option
                                key={source}
                                value={source}
                            >
                                {source}
                            </option>
                        ))}
                    </select>

                </div>


                {/* SOURCE DETAIL */}

                <div>

                    <label style={labelStyle}>
                        Source Detail
                    </label>

                    <input
    name="sourceDetail"
    value={formData.sourceDetail}
    onChange={updateField}
                        placeholder="Optional"
                        style={fieldStyle}
                    />

                </div>


                {/* LEAD TITLE */}

                <div>

                    <div style={labelStyle}>
                        Lead Title
                    </div>

                    <input
                        value={
                            formData.leadTitle || ""
                        }
                        onChange={e =>
                            setFormData({
                                ...formData,
                                leadTitle:
                                    e.target.value
                            })
                        }
                        placeholder="e.g. Kerala Family Holiday"
                        style={fieldStyle}
                    />

                </div>


                {/* NAME */}

                <div>

                    <label style={labelStyle}>
                        Client Name *
                    </label>

                   <input
    name="name"
    value={formData.name}
    onChange={updateField}
                        placeholder="Client / Agency name"
                        style={fieldStyle}
                    />

                </div>


                {/* MOBILE */}

                <div>

                    <label style={labelStyle}>
                        Mobile *
                    </label>

                    <input
    name="mobile"
    value={formData.mobile}
    onChange={updateField}
                        placeholder="Mobile number"
                        style={fieldStyle}
                    />

                </div>


                {/* EMAIL */}

                <div>

                    <label style={labelStyle}>
                        Email
                    </label>

                    <input
    name="email"
    type="email"
    value={formData.email}
    onChange={updateField}
                        placeholder="Email address"
                        style={fieldStyle}
                    />

                </div>


                {/* DESTINATION */}

                <div>

                    <label style={labelStyle}>
                        Destination
                    </label>

                    <input
    name="destination"
    value={formData.destination}
    onChange={updateField}
                        placeholder="e.g. Bali"
                        style={fieldStyle}
                    />

                </div>



                {/* PREFERRED MONTH */}

<div>

    <label style={labelStyle}>
        Preferred Month
    </label>

    <input
        type="text"
        name="preferredMonth"
        value={formData.preferredMonth || ""}
        onChange={updateField}
        placeholder="e.g. October 2026"
        style={fieldStyle}
    />

</div>





                {/* TRAVEL FROM */}

                <div>

                    <label style={labelStyle}>
                        Travel From
                    </label>

                    <input
    type="date"
    name="travelFrom"
    value={formData.travelFrom}
    onChange={updateField}
                        style={fieldStyle}
                    />

                </div>


                {/* TRAVEL TO */}

                <div>

                    <label style={labelStyle}>
                        Travel To
                    </label>

                    <input
    type="date"
    name="travelTo"
    value={formData.travelTo}
    onChange={updateField}
                        style={fieldStyle}
                    />

                </div>


                {/* ADULTS */}

                <div>

                    <label style={labelStyle}>
                        Adults
                    </label>

                    <input
    type="number"
    name="adults"
    value={formData.adults}
    onChange={updateField}
                        style={fieldStyle}
                    />

                </div>


                {/* CHILDREN */}

                <div>

                    <label style={labelStyle}>
                        Children
                    </label>

                    <input
    type="number"
    name="children"
    value={formData.children}
    onChange={updateField}
                        style={fieldStyle}
                    />

                </div>


                {/* BUDGET */}

                <div>

                    <label style={labelStyle}>
                        Estimated Budget
                    </label>

                    <input
    name="budget"
    value={formData.budget}
    onChange={updateField}
                        placeholder="Optional"
                        style={fieldStyle}
                    />

                </div>


                {/* ASSIGNED */}

                <div>

                    <label style={labelStyle}>
                        Assigned To
                    </label>

                   <input
    name="assignedTo"
    value={formData.assignedTo}
    onChange={updateField}
                        placeholder="Orbitz staff"
                        style={fieldStyle}
                    />

                </div>


                {/* STATUS */}

                <div>

                    <label style={labelStyle}>
                        Status
                    </label>

                    <select
    name="status"
    value={formData.status}
    onChange={updateField}
                        style={fieldStyle}
                    >
                        {LEAD_STATUSES.map(status => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </select>

                </div>


                {/* FOLLOW UP */}

                <div>

                    <label style={labelStyle}>
                        Next Follow-up
                    </label>

                    <input
    type="date"
    name="nextFollowUp"
    value={formData.nextFollowUp}
    onChange={updateField}
                        style={fieldStyle}
                    />

                </div>


                {/* CAMPAIGN */}

                <div>

                    <label style={labelStyle}>
                        Campaign
                    </label>

                    <input
    name="campaign"
    value={formData.campaign}
    onChange={updateField}
                        placeholder="Optional"
                        style={fieldStyle}
                    />

                </div>


                {/* REQUIREMENT */}

                <div
                    style={{
                        gridColumn: "span 2"
                    }}
                >

                    <label style={labelStyle}>
                        Requirement
                    </label>

                    <textarea
    name="requirement"
    value={formData.requirement}
    onChange={updateField}
                        placeholder="Travel requirement"
                        rows={3}
                        style={{
                            ...fieldStyle,
                            resize: "vertical"
                        }}
                    />

                </div>


                {/* NOTES */}

                <div
                    style={{
                        gridColumn: "span 2"
                    }}
                >

                    <label style={labelStyle}>
                        Notes
                    </label>

                    <textarea
    name="notes"
    value={formData.notes}
    onChange={updateField}
                        placeholder="Internal notes"
                        rows={3}
                        style={{
                            ...fieldStyle,
                            resize: "vertical"
                        }}
                    />

                </div>

            </div>


            {/* FORM ACTIONS */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "16px"
                }}
            >

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        background: "#e2e8f0",
                        color: "#334155",
                        border: "none",
                        borderRadius: "7px",
                        padding: "9px 16px",
                        cursor: "pointer",
                        fontWeight: 600
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    disabled={saving}
                    onClick={handleCreateLead}
                    style={{
                        background: "#0f766e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        padding: "9px 18px",
                        cursor: saving
                            ? "default"
                            : "pointer",
                        fontWeight: 700,
                        opacity: saving
                            ? 0.7
                            : 1
                    }}
                >
                    {saving
                        ? "Saving..."
                        : "Save Lead"}
                </button>

            </div>

        </div>
    );
}