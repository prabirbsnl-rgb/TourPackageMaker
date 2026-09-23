

import { useEffect, useState } from "react";

import {
    createLead,
    getAllLeads,
    updateLead,
    deleteLead
} from "../utils/leadStorage";


import {
    getDraftByLeadDocId,
    unlinkDraftFromLead,
    getAllDraftsFromFirestore
} from "../utils/quotationStorage";


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


const emptyLead = {
    source: "Website",
    sourceDetail: "",
    leadTitle: "",
    name: "",
    mobile: "",
    email: "",

    destination: "",
    travelFrom: "",
    travelTo: "",

    adults: 2,
    children: 0,

    budget: "",
    requirement: "",

    campaign: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",

    assignedTo: "",

    status: "New",

    nextFollowUp: "",

    notes: ""
};


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




function LeadEditForm({
    editingLead,
    setEditingLead,
    updatingLead,
    handleUpdateLead
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
            }}
        >

            <div>
    <div style={labelStyle}>
        Lead Title
    </div>

    <input
        value={
            editingLead.leadTitle || ""
        }
        onChange={(e) =>
            setEditingLead({
                ...editingLead,
                leadTitle:
                    e.target.value
            })
        }
        placeholder="e.g. Kerala Family Holiday"
        style={fieldStyle}
    />
</div>

            <div>
                <label style={labelStyle}>
                    Name *
                </label>
                <input
                    value={editingLead.name || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            name: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Mobile *
                </label>
                <input
                    value={editingLead.mobile || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            mobile: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Email
                </label>
                <input
                    value={editingLead.email || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            email: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Source
                </label>
                <select
                    value={editingLead.source || "Website"}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            source: e.target.value
                        })
                    }
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

            <div>
                <label style={labelStyle}>
                    Source Detail
                </label>
                <input
                    value={editingLead.sourceDetail || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            sourceDetail: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Destination
                </label>
                <input
                    value={editingLead.destination || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            destination: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>


                        <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                }}
            >
                <div>
                    <label style={labelStyle}>
                        Preferred Month
                    </label>
                    <input
                        type="text"
                        value={
                            editingLead.preferredMonth || ""
                        }
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                preferredMonth:
                                    e.target.value
                            })
                        }
                        placeholder="e.g. October 2026"
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Travellers
                    </label>
                    <input
                        type="text"
                        value={
                            editingLead.travellers || ""
                        }
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                travellers:
                                    e.target.value
                            })
                        }
                        placeholder="e.g. 2 travellers"
                        style={fieldStyle}
                    />
                </div>
            </div>


            

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                }}
            >
                <div>
                    <label style={labelStyle}>
                        Travel From
                    </label>
                    <input
                        type="date"
                        value={editingLead.travelFrom || ""}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                travelFrom: e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Travel To
                    </label>
                    <input
                        type="date"
                        value={editingLead.travelTo || ""}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                travelTo: e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                }}
            >
                <div>
                    <label style={labelStyle}>
                        Adults
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={editingLead.adults ?? 0}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                adults: Number(e.target.value)
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Children
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={editingLead.children ?? 0}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                children: Number(e.target.value)
                            })
                        }
                        style={fieldStyle}
                    />
                </div>
            </div>

            <div>
                <label style={labelStyle}>
                    Status
                </label>
                <select
                    value={editingLead.status || "New"}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            status: e.target.value
                        })
                    }
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

            <div>
                <label style={labelStyle}>
                    Assigned To
                </label>
                <input
                    value={editingLead.assignedTo || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            assignedTo: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Budget
                </label>
                <input
                    value={editingLead.budget || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            budget: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>


            <div>
    <label style={labelStyle}>
        Campaign
    </label>
    <input
        value={editingLead.campaign || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                campaign: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>

<div>
    <label style={labelStyle}>
        UTM Source
    </label>
    <input
        value={editingLead.utmSource || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                utmSource: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>

<div>
    <label style={labelStyle}>
        UTM Medium
    </label>
    <input
        value={editingLead.utmMedium || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                utmMedium: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>

<div>
    <label style={labelStyle}>
        UTM Campaign
    </label>
    <input
        value={editingLead.utmCampaign || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                utmCampaign: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>


            <div>
                <label style={labelStyle}>
                    Next Follow-up
                </label>
                <input
                    type="date"
                    value={editingLead.nextFollowUp || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            nextFollowUp: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Requirement
                </label>
                <textarea
                    value={editingLead.requirement || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            requirement: e.target.value
                        })
                    }
                    rows={4}
                    style={{
                        ...fieldStyle,
                        resize: "vertical"
                    }}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Notes
                </label>
                <textarea
                    value={editingLead.notes || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            notes: e.target.value
                        })
                    }
                    rows={4}
                    style={{
                        ...fieldStyle,
                        resize: "vertical"
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    paddingTop: "4px",
                    paddingBottom: "10px"
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        setEditingLead(null)
                    }
                    style={{
                        background: "#e2e8f0",
                        color: "#334155",
                        border: "none",
                        borderRadius: "7px",
                        padding: "9px 16px",
                        cursor: "pointer",
                        fontWeight: 700
                    }}
                >
                    Cancel
                </button>

                <button
    type="button"
    disabled={updatingLead}
    onClick={handleUpdateLead}
    style={{
        background: "#0f766e",
        color: "#fff",
        border: "none",
        borderRadius: "7px",
        padding: "9px 16px",
        cursor: updatingLead
            ? "default"
            : "pointer",
        fontWeight: 700,
        opacity: updatingLead ? 0.7 : 1
    }}
>
    {updatingLead
        ? "Saving..."
        : "Save Changes"}
</button>
            </div>
        </div>
    );
}





export default function LeadManagement({
    userProfile,
    onBackToWorkspace
}) {

    const [leads, setLeads] = useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [formData, setFormData] =
        useState(emptyLead);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

        const [searchText, setSearchText] =
    useState("");

const [sourceFilter, setSourceFilter] =
    useState("All");

const [statusFilter, setStatusFilter] =
    useState("All");

    const [followUpFilter, setFollowUpFilter] =
    useState("All");

    const [selectedLead, setSelectedLead] =
    useState(null);

    const [editingLead, setEditingLead] =
    useState(null);

const [updatingLead, setUpdatingLead] =
    useState(false);


    const [leadQuotationMap, setLeadQuotationMap] =
    useState({});

    /*
    =====================================================
    LOAD LEADS
    =====================================================
    */

    const loadLeads = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getAllLeads();

            setLeads(data);

        } catch (err) {

            console.error(
                "Lead loading failed:",
                err
            );

            setError(
                "Unable to load leads."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadLeads();

    }, []);



    useEffect(() => {

    const loadLeadQuotationMap = async () => {

        try {

            const drafts =
                await getAllDraftsFromFirestore();

            if (!Array.isArray(drafts)) {

                setLeadQuotationMap({});
                return;

            }

            const map = {};

            drafts.forEach(draft => {

                if (
                    draft?.leadId &&
                    draft?.quotationNo
                ) {

                    map[draft.leadId] =
                        draft.quotationNo;

                }

            });

            setLeadQuotationMap(map);

        } catch (error) {

            console.error(
                "Failed to load Lead quotation links:",
                error
            );

            setLeadQuotationMap({});

        }

    };

    loadLeadQuotationMap();

}, []);




    /*
    =====================================================
    FORM HANDLERS
    =====================================================
    */

    const handleChange = (field, value) => {

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

    };


    const resetForm = () => {

        setFormData({
            ...emptyLead,
            assignedTo:
                userProfile?.username ||
                userProfile?.displayName ||
                ""
        });

    };


    /*
    =====================================================
    CREATE LEAD
    =====================================================
    */

    const handleCreateLead = async () => {

        if (!formData.name.trim()) {

            setError(
                "Client name is required."
            );

            return;
        }

        if (!formData.mobile.trim()) {

            setError(
                "Mobile number is required."
            );

            return;
        }

        try {

            setSaving(true);
            setError("");

            await createLead({

    ...formData,

    createdBy:
        userProfile?.uid ||
        "",

    createdByName:
        userProfile?.username ||
        userProfile?.displayName ||
        userProfile?.email ||
        ""

});

            resetForm();

            setShowForm(false);

            await loadLeads();

        } catch (err) {

            console.error(
                "Lead creation failed:",
                err
            );

            setError(
                "Unable to save lead. Please try again."
            );

        } finally {

            setSaving(false);

        }
    };


    const handleUpdateLead = async () => {

    if (!editingLead) return;

    if (!editingLead.name?.trim()) {
        setError("Client name is required.");
        return;
    }

    if (!editingLead.mobile?.trim()) {
        setError("Mobile number is required.");
        return;
    }

    try {

        setUpdatingLead(true);
        setError("");

        const {
            id,
            createdAt,
            updatedAt,
            ...updates
        } = editingLead;

        await updateLead(id, {
            ...updates,
            adults: Number(editingLead.adults || 0),
            children: Number(editingLead.children || 0)
        });

        await loadLeads();

        setSelectedLead({
            ...editingLead,
            adults: Number(editingLead.adults || 0),
            children: Number(editingLead.children || 0)
        });

        setEditingLead(null);

    } catch (err) {

        console.error(
            "Lead update failed:",
            err
        );

        setError(
            "Unable to update lead. Please try again."
        );

    } finally {

        setUpdatingLead(false);

    }
};


const handleDeleteLead = async (lead) => {

    if (!lead?.id) {
        return;
    }

    const leadLabel =
        [
            lead.leadId,
            lead.name
        ]
            .filter(Boolean)
            .join(" — ");

    try {

        setError("");

        // ------------------------------------------
        // FIND LINKED QUOTATION FIRST
        // ------------------------------------------

        const linkedDraft =
            await getDraftByLeadDocId(
                lead.id
            );

        // ------------------------------------------
        // CLEAR CONFIRMATION MESSAGE
        // ------------------------------------------

        const confirmationMessage =
            linkedDraft?.quotationNo
                ? (
                    `Delete Lead ${leadLabel || "this lead"}?\n\n` +
                    `This Lead has a linked quotation:\n` +
                    `${linkedDraft.quotationNo}\n\n` +
                    `The quotation will remain in Draft Library, but its Lead relationship will be removed.`
                )
                : (
                    `Delete Lead ${leadLabel || "this lead"}?\n\n` +
                    `This Lead has no linked quotation.\n\n` +
                    `Only the Lead will be deleted.`
                );

        const confirmed =
            window.confirm(
                confirmationMessage
            );

        if (!confirmed) {
            return;
        }

        // ------------------------------------------
        // UNLINK QUOTATION
        // ------------------------------------------

        if (linkedDraft?.quotationNo) {

            await unlinkDraftFromLead(
                linkedDraft.quotationNo
            );

        }

        // ------------------------------------------
        // DELETE LEAD
        // ------------------------------------------

        await deleteLead(
            lead.id
        );

        // ------------------------------------------
        // REFRESH LEAD LIST
        // ------------------------------------------

        await loadLeads();

        if (
            selectedLead?.id ===
            lead.id
        ) {
            setSelectedLead(null);
            setEditingLead(null);
        }

    } catch (error) {

        console.error(
            "Lead deletion failed:",
            error
        );

        setError(
            "Unable to delete Lead. Please try again."
        );

    }

};





const getFollowUpStatus = (dateValue) => {

    if (!dateValue) {
        return "none";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followUpDate =
        new Date(dateValue + "T00:00:00");

    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) {
        return "overdue";
    }

    if (
        followUpDate.getTime() ===
        today.getTime()
    ) {
        return "today";
    }

    return "upcoming";
};




    const filteredLeads = leads.filter(lead => {

    const search =
        searchText.trim().toLowerCase();

    const matchesSearch =
        !search ||
        [
            lead.name,
            lead.mobile,
            lead.email,
            lead.destination,
            lead.leadId
        ]
            .filter(Boolean)
            .some(value =>
                String(value)
                    .toLowerCase()
                    .includes(search)
            );

    const matchesSource =
        sourceFilter === "All" ||
        lead.source === sourceFilter;

    const matchesStatus =
        statusFilter === "All" ||
        lead.status === statusFilter;

    const followUpStatus =
        getFollowUpStatus(
            lead.nextFollowUp
        );

    const matchesFollowUp =
        followUpFilter === "All" ||
        (followUpFilter === "Today" &&
            followUpStatus === "today") ||
        (followUpFilter === "Overdue" &&
            followUpStatus === "overdue") ||
        (followUpFilter === "Upcoming" &&
            followUpStatus === "upcoming") ||
        (followUpFilter === "No Follow-up" &&
            followUpStatus === "none");

    return (
        matchesSearch &&
        matchesSource &&
        matchesStatus &&
        matchesFollowUp
    );
});

    /*
    =====================================================
    STYLES
    =====================================================
    */

   


    const cardStyle = {
        background: "#fff",
        border: "1px solid #dbe3ea",
        borderRadius: "10px",
        boxSizing: "border-box"
    };


    return (
        <div
            style={{
                minHeight: "calc(100vh - 58px)",
                background: "#f5f7fa",
                padding: "24px 32px 40px",
                boxSizing: "border-box"
            }}
        >

            {/* PAGE HEADER */}

           <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "20px",
        flexWrap: "wrap"
    }}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
        }}
    >

        <button
            type="button"
            onClick={onBackToWorkspace}
            style={{
                background: "#334155",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "9px 14px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px",
                whiteSpace: "nowrap"
            }}
        >
            ← Back
        </button>

        <div>

            <h1
                style={{
                    margin: 0,
                    fontSize: "23px",
                    fontWeight: 700,
                    color: "#172033"
                }}
            >
                Lead Management
            </h1>

            <p
                style={{
                    margin: "5px 0 0",
                    fontSize: "13px",
                    color: "#64748b"
                }}
            >
                Central record of Orbitz business enquiries.
            </p>

        </div>

    </div>


    <button
        type="button"
        onClick={() => {

            setError("");

            resetForm();

            setShowForm(true);

        }}
        style={{
            background: "#0f766e",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13px"
        }}
    >
        + New Lead
    </button>

</div>


            {/* ERROR */}

            {error && (
                <div
                    style={{
                        marginBottom: "14px",
                        padding:
                            "10px 12px",
                        background:
                            "#fef2f2",
                        border:
                            "1px solid #fecaca",
                        color:
                            "#b91c1c",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600
                    }}
                >
                    {error}
                </div>
            )}


            {/* NEW LEAD FORM */}

            {showForm && (

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
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between",
                            marginBottom:
                                "16px"
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
                            onClick={() => {
                                setShowForm(false);
                                setError("");
                            }}
                            style={{
                                border: "none",
                                background:
                                    "transparent",
                                color:
                                    "#64748b",
                                fontSize:
                                    "20px",
                                cursor:
                                    "pointer",
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

                            <label
                                style={labelStyle}
                            >
                                Lead Source
                            </label>

                            <select
                                value={
                                    formData.source
                                }
                                onChange={e =>
                                    handleChange(
                                        "source",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            >

                                {LEAD_SOURCES.map(
                                    source => (
                                        <option
                                            key={source}
                                            value={source}
                                        >
                                            {source}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        {/* SOURCE DETAIL */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Source Detail
                            </label>

                            <input
                                value={
                                    formData.sourceDetail
                                }
                                onChange={e =>
                                    handleChange(
                                        "sourceDetail",
                                        e.target.value
                                    )
                                }
                                placeholder="Optional"
                                style={fieldStyle}
                            />

                        </div>


                        <div>
    <div style={labelStyle}>
        Lead Title
    </div>

    <input
        value={
            formData.leadTitle || ""
        }
        onChange={(e) =>
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

                            <label
                                style={labelStyle}
                            >
                                Client Name *
                            </label>

                            <input
                                value={
                                    formData.name
                                }
                                onChange={e =>
                                    handleChange(
                                        "name",
                                        e.target.value
                                    )
                                }
                                placeholder="Client / Agency name"
                                style={fieldStyle}
                            />

                        </div>


                        {/* MOBILE */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Mobile *
                            </label>

                            <input
                                value={
                                    formData.mobile
                                }
                                onChange={e =>
                                    handleChange(
                                        "mobile",
                                        e.target.value
                                    )
                                }
                                placeholder="Mobile number"
                                style={fieldStyle}
                            />

                        </div>


                        {/* EMAIL */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Email
                            </label>

                            <input
                                type="email"
                                value={
                                    formData.email
                                }
                                onChange={e =>
                                    handleChange(
                                        "email",
                                        e.target.value
                                    )
                                }
                                placeholder="Email address"
                                style={fieldStyle}
                            />

                        </div>


                        {/* DESTINATION */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Destination
                            </label>

                            <input
                                value={
                                    formData.destination
                                }
                                onChange={e =>
                                    handleChange(
                                        "destination",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Bali"
                                style={fieldStyle}
                            />

                        </div>


                        {/* TRAVEL FROM */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Travel From
                            </label>

                            <input
                                type="date"
                                value={
                                    formData.travelFrom
                                }
                                onChange={e =>
                                    handleChange(
                                        "travelFrom",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            />

                        </div>


                        {/* TRAVEL TO */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Travel To
                            </label>

                            <input
                                type="date"
                                value={
                                    formData.travelTo
                                }
                                onChange={e =>
                                    handleChange(
                                        "travelTo",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            />

                        </div>


                        {/* ADULTS */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Adults
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    formData.adults
                                }
                                onChange={e =>
                                    handleChange(
                                        "adults",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            />

                        </div>


                        {/* CHILDREN */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Children
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    formData.children
                                }
                                onChange={e =>
                                    handleChange(
                                        "children",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            />

                        </div>


                        {/* BUDGET */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Estimated Budget
                            </label>

                            <input
                                value={
                                    formData.budget
                                }
                                onChange={e =>
                                    handleChange(
                                        "budget",
                                        e.target.value
                                    )
                                }
                                placeholder="Optional"
                                style={fieldStyle}
                            />

                        </div>


                        {/* ASSIGNED */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Assigned To
                            </label>

                            <input
                                value={
                                    formData.assignedTo
                                }
                                onChange={e =>
                                    handleChange(
                                        "assignedTo",
                                        e.target.value
                                    )
                                }
                                placeholder="Orbitz staff"
                                style={fieldStyle}
                            />

                        </div>


                        {/* STATUS */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Status
                            </label>

                            <select
                                value={
                                    formData.status
                                }
                                onChange={e =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            >

                                {LEAD_STATUSES.map(
                                    status => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        {/* FOLLOW UP */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Next Follow-up
                            </label>

                            <input
                                type="date"
                                value={
                                    formData.nextFollowUp
                                }
                                onChange={e =>
                                    handleChange(
                                        "nextFollowUp",
                                        e.target.value
                                    )
                                }
                                style={fieldStyle}
                            />

                        </div>


                        {/* CAMPAIGN */}

                        <div>

                            <label
                                style={labelStyle}
                            >
                                Campaign
                            </label>

                            <input
                                value={
                                    formData.campaign
                                }
                                onChange={e =>
                                    handleChange(
                                        "campaign",
                                        e.target.value
                                    )
                                }
                                placeholder="Optional"
                                style={fieldStyle}
                            />

                        </div>


                        {/* REQUIREMENT */}

                        <div
                            style={{
                                gridColumn:
                                    "span 2"
                            }}
                        >

                            <label
                                style={labelStyle}
                            >
                                Requirement
                            </label>

                            <textarea
                                value={
                                    formData.requirement
                                }
                                onChange={e =>
                                    handleChange(
                                        "requirement",
                                        e.target.value
                                    )
                                }
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
                                gridColumn:
                                    "span 2"
                            }}
                        >

                            <label
                                style={labelStyle}
                            >
                                Notes
                            </label>

                            <textarea
                                value={
                                    formData.notes
                                }
                                onChange={e =>
                                    handleChange(
                                        "notes",
                                        e.target.value
                                    )
                                }
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
                            justifyContent:
                                "flex-end",
                            gap: "8px",
                            marginTop: "16px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setError("");
                            }}
                            style={{
                                background:
                                    "#e2e8f0",
                                color:
                                    "#334155",
                                border: "none",
                                borderRadius:
                                    "7px",
                                padding:
                                    "9px 16px",
                                cursor:
                                    "pointer",
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={
                                handleCreateLead
                            }
                            style={{
                                background:
                                    "#0f766e",
                                color: "#fff",
                                border: "none",
                                borderRadius:
                                    "7px",
                                padding:
                                    "9px 18px",
                                cursor: saving
                                    ? "default"
                                    : "pointer",
                                fontWeight: 700,
                                opacity:
                                    saving
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

            )}


            {/* LEAD LIST */}

            <div
                style={{
                    ...cardStyle,
                    overflow: "hidden"
                }}
            >

<div
    style={{
        padding: "12px 14px",
        borderBottom: "1px solid #e2e8f0",
        display: "grid",
        gridTemplateColumns:
    "minmax(260px, 1fr) 180px 180px 180px",
        gap: "10px",
        background: "#fbfdff",
        boxSizing: "border-box"
    }}
>

    <input
        type="text"
        value={searchText}
        onChange={e =>
            setSearchText(e.target.value)
        }
        placeholder="Search name, mobile, email, destination or Lead ID..."
        style={fieldStyle}
    />

    <select
        value={sourceFilter}
        onChange={e =>
            setSourceFilter(e.target.value)
        }
        style={fieldStyle}
    >
        <option value="All">
            All Sources
        </option>

        {LEAD_SOURCES.map(source => (
            <option
                key={source}
                value={source}
            >
                {source}
            </option>
        ))}
    </select>

    <select
        value={statusFilter}
        onChange={e =>
            setStatusFilter(e.target.value)
        }
        style={fieldStyle}
    >
        <option value="All">
            All Statuses
        </option>

        {LEAD_STATUSES.map(status => (
            <option
                key={status}
                value={status}
            >
                {status}
            </option>
        ))}
    </select>

        <select
        value={followUpFilter}
        onChange={e =>
            setFollowUpFilter(e.target.value)
        }
        style={fieldStyle}
    >
        <option value="All">
            All Follow-ups
        </option>

        <option value="Today">
            Today
        </option>

        <option value="Overdue">
            Overdue
        </option>

        <option value="Upcoming">
            Upcoming
        </option>

        <option value="No Follow-up">
            No Follow-up
        </option>
    </select>

</div>

                <div
                    style={{
                        padding:
                            "14px 16px",
                        borderBottom:
                            "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center"
                    }}
                >

                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#334155"
                        }}
                    >
                        Leads
                    </div>

                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b"
                        }}
                    >
                       {filteredLeads.length} of {leads.length} lead
{leads.length === 1
    ? ""
    : "s"}
                    </div>

                </div>


                {loading ? (

                    <div
                        style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "13px"
                        }}
                    >
                        Loading leads...
                    </div>

                ) : leads.length === 0 ? (

                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: "13px"
                        }}
                    >
                        No leads yet.
                        <br />
                        Create the first lead using
                        <strong>
                            {" + New Lead"}
                        </strong>.
                    </div>

                ) : (

                    <div
                        style={{
                            overflowX: "auto"
                        }}
                    >

                        <div
                            style={{
                                minWidth:
                                    "900px"
                            }}
                        >

                            {/* TABLE HEADER */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
    "130px 1.4fr 120px 140px 150px 130px 130px 110px 70px",
                                    gap: "10px",
                                    padding:
                                        "10px 14px",
                                    background:
                                        "#f8fafc",
                                    borderBottom:
                                        "1px solid #e2e8f0",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase"
                                }}
                            >

                                <div>Source</div>
                               <div
                                style={{
                                    paddingLeft: "0px",
                                    transform: "translateX(-35px)"
                                        }}
                                        >
                                            Client
                                                </div>
                                <div>Mobile</div>
                                <div>Destination</div>
                                <div>Travel</div>
                                <div>Status</div>
                                <div>Follow-up</div>
                                <div>ASSIGNED</div>

<div
    style={{
        textAlign: "center",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase"
    }}
>
    ACTION
</div>

                            </div>


                          {filteredLeads.map(lead => (

    <div
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        style={{
            display: "grid",
            cursor: "pointer",
                                        gridTemplateColumns:
    "130px 1.4fr 120px 140px 150px 130px 130px 110px 70px",
                                        gap: "10px",
                                        padding:
                                            "11px 14px",
                                        borderBottom:
                                            "1px solid #eef2f7",
                                        alignItems:
                                            "center",
                                        fontSize:
                                            "12px",
                                        color:
                                            "#334155"
                                    }}
                                >

                                   <div
    style={{
        minWidth: 0
    }}
>
    <div>
        {lead.source || "—"}
    </div>

    {lead.sourceDetail && (
        <div
            style={{
                marginTop: "2px",
                fontSize: "10px",
                fontWeight: 600,
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}
            title={lead.sourceDetail}
        >
            {lead.sourceDetail}
        </div>
    )}
</div>

                                   <div
    style={{
        minWidth: 0
    }}
>
    <div
        style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 700
        }}
        title={lead.name || ""}
    >
        {lead.name || "—"}
    </div>

    {lead.leadId && (
        <div
            style={{
                marginTop: "2px",
                fontSize: "10px",
                fontWeight: 500,
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}
            title={[
                lead.leadId,
                leadQuotationMap[lead.leadId]
            ]
                .filter(Boolean)
                .join(" · ")}
        >
            {lead.leadId}

            {leadQuotationMap[lead.leadId] && (
    <>
        {" · "}
        {"ORB-" +
            leadQuotationMap[lead.leadId]
                .slice(-6)}
    </>
)}
        </div>
    )}
</div>
                                    <div>
                                        {lead.mobile ||
                                            "—"}
                                    </div>

                                    <div>
                                        {lead.destination ||
                                            "—"}
                                    </div>

                                    <div>
                                        {lead.travelFrom ||
                                            lead.travelTo
                                            ? `${lead.travelFrom || "—"} → ${lead.travelTo || "—"}`
                                            : "—"}
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                display:
                                                    "inline-block",
                                                padding:
                                                    "4px 7px",
                                                borderRadius:
                                                    "999px",
                                                background:
                                                    "#ecfdf5",
                                                color:
                                                    "#047857",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    700
                                            }}
                                        >
                                            {lead.status ||
                                                "New"}
                                        </span>
                                    </div>

                                  <div
    onClick={(e) => {
        e.stopPropagation();
    }}
    style={{
        fontWeight:
            getFollowUpStatus(
                lead.nextFollowUp
            ) === "overdue" ||
            getFollowUpStatus(
                lead.nextFollowUp
            ) === "today"
                ? 700
                : 400,

        color:
            getFollowUpStatus(
                lead.nextFollowUp
            ) === "overdue"
                ? "#dc2626"
                : getFollowUpStatus(
                      lead.nextFollowUp
                  ) === "today"
                    ? "#d97706"
                    : "#334155",

        cursor: "pointer"
    }}
>
    {lead.nextFollowUp ? (
        <span
            onClick={(e) => {
                e.stopPropagation();

                const input =
                    e.currentTarget
                        .nextElementSibling;

                if (input) {
                    if (input.showPicker) {
                        input.showPicker();
                    } else {
                        input.click();
                    }
                }
            }}
            style={{
                cursor: "pointer"
            }}
        >
            {(() => {
                const [year, month, day] =
                    lead.nextFollowUp.split("-");

                return `${day}/${month}/${year}`;
            })()}
        </span>
    ) : (
        <span
            onClick={(e) => {
                e.stopPropagation();

                const input =
                    e.currentTarget
                        .nextElementSibling;

                if (input) {
                    if (input.showPicker) {
                        input.showPicker();
                    } else {
                        input.click();
                    }
                }
            }}
            style={{
                cursor: "pointer",
                color: "#94a3b8"
            }}
        >
            Set date
        </span>
    )}

    <input
        type="date"
        value={lead.nextFollowUp || ""}
        onChange={async (e) => {

            const newDate =
                e.target.value;

            if (!newDate) return;

            if (
                newDate ===
                lead.nextFollowUp
            ) {
                return;
            }

            try {

                await updateLead(
                    lead.id,
                    {
                        nextFollowUp:
                            newDate
                    }
                );

                setLeads(prev =>
                    prev.map(item =>
                        item.id === lead.id
                            ? {
                                ...item,
                                nextFollowUp:
                                    newDate
                            }
                            : item
                    )
                );

            } catch (error) {

                console.error(
                    "Follow-up update failed:",
                    error
                );

                alert(
                    "Unable to update follow-up date."
                );
            }
        }}
        onClick={(e) =>
            e.stopPropagation()
        }
        style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none"
        }}
    />
</div>

                                    <div>
                                        {lead.assignedTo ||
                                            "—"}
                                    </div>

                                    <div
    style={{
        display: "flex",
        justifyContent: "center"
    }}
>
    <button
        type="button"
        onClick={(e) => {

            e.stopPropagation();

            handleDeleteLead(lead);

        }}
        style={{
            border: "1px solid #fecaca",
            background: "#fff",
            color: "#dc2626",
            borderRadius: "6px",
            padding: "4px 7px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer"
        }}
        title="Delete Lead"
    >
        Delete
    </button>
</div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}
            </div>

            {/* =====================================================
                LEAD DETAIL DRAWER
            ===================================================== */}

            {selectedLead && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "420px",
                        maxWidth: "90vw",
                        background: "#fff",
                        boxShadow:
                            "-8px 0 30px rgba(15, 23, 42, 0.16)",
                        borderLeft:
                            "1px solid #dbe3ea",
                        zIndex: 1000,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >

                    {/* DRAWER HEADER */}

                    <div
                        style={{
                            minHeight: "58px",
                            padding: "10px 16px",
                            boxSizing: "border-box",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom:
                                "1px solid #e2e8f0",
                            background: "#f8fafc"
                        }}
                    >

                        

                        <div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 800,
                                    color: "#172033"
                                }}
                            >
                               {editingLead ? "Edit Lead" : "Lead Details"}
                            </div>

                           {!editingLead && (
    <div
        style={{
            marginTop: "3px",
            fontSize: "10px",
            color: "#64748b"
        }}
    >
        {selectedLead.leadId || "Lead"}
    </div>
)}

                        </div>


                        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px"
    }}
>

    {!editingLead && (
    <button
        type="button"
        onClick={() =>
            setEditingLead({
                ...selectedLead
            })
        }
        style={{
            background: "#0f766e",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            padding: "7px 11px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "11px"
        }}
    >
        ✎ Edit
    </button>
    )}

    <button
        type="button"
        onClick={() => {
            setEditingLead(null);
            setSelectedLead(null);
        }}
        style={{
            width: "30px",
            height: "30px",
            border: "none",
            borderRadius: "7px",
            background: "#e2e8f0",
            color: "#334155",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1
        }}
    >
        ×
    </button>
</div>

                    </div>


                    {/* DRAWER CONTENT */}

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "18px",
                            boxSizing: "border-box"
                        }}
                    >
{editingLead ? (
   <LeadEditForm
    editingLead={editingLead}
    setEditingLead={setEditingLead}
    updatingLead={updatingLead}
    handleUpdateLead={handleUpdateLead}
/>
) : (
  <>
                        {/* CLIENT */}

                        <div
                            style={{
                                marginBottom: "18px"
                            }}
                        >

                            

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase",
                                    marginBottom: "8px"
                                }}
                            >
                                Client
                            </div>

                            <div
                                style={{
                                    fontSize: "17px",
                                    fontWeight: 800,
                                    color: "#172033"
                                }}
                            >
                                {selectedLead.name ||
                                    "—"}
                            </div>


                            {selectedLead.leadTitle && (
    <div
        style={{
            marginTop: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#64748b"
        }}
    >
        {selectedLead.leadTitle}
    </div>
)}


                            <div
                                style={{
                                    marginTop: "5px",
                                    fontSize: "12px",
                                    color: "#475569"
                                }}
                            >
                                {selectedLead.mobile ||
                                    "—"}
                            </div>

                            {selectedLead.email && (
                                <div
                                    style={{
                                        marginTop: "3px",
                                        fontSize: "12px",
                                        color: "#475569"
                                    }}
                                >
                                    {selectedLead.email}
                                </div>
                            )}

                        </div>


                        {/* STATUS */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "12px",
                                marginBottom: "18px"
                            }}
                        >

                            <div>

                                <div
                                    style={labelStyle}
                                >
                                    Source
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#334155"
                                    }}
                                >
                                    {selectedLead.source ||
                                        "—"}
                                </div>

                            </div>


                            <div>

                                <div
                                    style={labelStyle}
                                >
                                    Status
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#047857"
                                    }}
                                >
                                    {selectedLead.status ||
                                        "New"}
                                </div>

                            </div>

                        </div>


                        {/* TRAVEL */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e2e8f0",
                                paddingTop: "16px",
                                marginBottom: "18px"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase",
                                    marginBottom: "10px"
                                }}
                            >
                                Travel Requirement
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: "12px"
                                }}
                            >

                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Destination
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.destination ||
                                            "—"}
                                    </div>

                                </div>


                               <div>

    <div
        style={labelStyle}
    >
        Preferred Month
    </div>

    <div
        style={{
            fontSize: "13px",
            color: "#334155"
        }}
    >
        {selectedLead.preferredMonth ||
            "—"}
    </div>

</div>


<div>

    <div
        style={labelStyle}
    >
        Travellers
    </div>

    <div
        style={{
            fontSize: "13px",
            color: "#334155"
        }}
    >
        {selectedLead.travellers ||
            "—"}
    </div>

</div>


<div>

    <div
        style={labelStyle}
    >
        Pax
    </div>

    <div
        style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#334155"
        }}
    >
        {selectedLead.adults ||
            0}{" "}
        Adult
        {Number(
            selectedLead.adults ||
                0
        ) === 1
            ? ""
            : "s"}
        {" + "}
        {selectedLead.children ||
            0}{" "}
        Child
        {Number(
            selectedLead.children ||
                0
        ) === 1
            ? ""
            : "ren"}
    </div>

</div>


                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Travel From
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.travelFrom ||
                                            "—"}
                                    </div>

                                </div>


                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Travel To
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.travelTo ||
                                            "—"}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* REQUIREMENT */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e2e8f0",
                                paddingTop: "16px",
                                marginBottom: "18px"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase",
                                    marginBottom: "8px"
                                }}
                            >
                                Requirement
                            </div>

                            <div
                                style={{
                                    fontSize: "13px",
                                    lineHeight: 1.6,
                                    color: "#334155",
                                    whiteSpace: "pre-wrap"
                                }}
                            >
                                {selectedLead.requirement ||
                                    "No requirement entered."}
                            </div>

                        </div>


                        {/* OTHER INFORMATION */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e2e8f0",
                                paddingTop: "16px"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase",
                                    marginBottom: "10px"
                                }}
                            >
                                Lead Information
                            </div>


                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: "12px"
                                }}
                            >

                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Assigned To
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.assignedTo ||
                                            "—"}
                                    </div>

                                </div>


                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Budget
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.budget ||
                                            "—"}
                                    </div>

                                </div>




                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Follow-up
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.nextFollowUp ||
                                            "—"}
                                    </div>

                                </div>


                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        Source Detail
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.sourceDetail ||
                                            "—"}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* MARKETING ATTRIBUTION */}

<div
    style={{
        borderTop: "1px solid #e2e8f0",
        paddingTop: "16px",
        marginTop: "18px"
    }}
>

    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b",
            textTransform: "uppercase",
            marginBottom: "10px"
        }}
    >
        Marketing Attribution
    </div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
        }}
    >

        <div>
            <div style={labelStyle}>
                Campaign
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#334155"
                }}
            >
                {selectedLead.campaign || "—"}
            </div>
        </div>

        <div>
            <div style={labelStyle}>
                UTM Source
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#334155"
                }}
            >
                {selectedLead.utmSource || "—"}
            </div>
        </div>

        <div>
            <div style={labelStyle}>
                UTM Medium
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#334155"
                }}
            >
                {selectedLead.utmMedium || "—"}
            </div>
        </div>

        <div>
            <div style={labelStyle}>
                UTM Campaign
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#334155"
                }}
            >
                {selectedLead.utmCampaign || "—"}
            </div>
        </div>

    </div>

</div>



                        {/* NOTES */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e2e8f0",
                                paddingTop: "16px",
                                marginTop: "18px"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase",
                                    marginBottom: "8px"
                                }}
                            >
                                Internal Notes
                            </div>

{/* QUICK ACTIONS */}

<div
    style={{
        borderTop: "1px solid #e2e8f0",
        paddingTop: "16px",
        marginTop: "18px"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b",
            textTransform: "uppercase",
            marginBottom: "10px"
        }}
    >
        Quick Actions
    </div>

    <div
        style={{
            display: "grid",
           gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px"
        }}
    >

        {/* WHATSAPP */}

        <button
            type="button"
            disabled={!selectedLead.mobile}
            onClick={() => {
                const mobile =
                    String(selectedLead.mobile || "")
                        .replace(/\D/g, "");

                if (!mobile) return;

                const whatsappNumber =
                    mobile.length === 10
                        ? `91${mobile}`
                        : mobile;

                window.open(
                    `https://wa.me/${whatsappNumber}`,
                    "_blank"
                );
            }}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 6px",
                cursor: selectedLead.mobile
                    ? "pointer"
                    : "default",
                fontSize: "11px",
                fontWeight: 700,
                opacity: selectedLead.mobile
                    ? 1
                    : 0.45
            }}
        >
            WhatsApp
        </button>

        {/* CALL */}

        <button
            type="button"
            disabled={!selectedLead.mobile}
            onClick={() => {
                if (!selectedLead.mobile) return;

                window.location.href =
                    `tel:${selectedLead.mobile}`;
            }}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 6px",
                cursor: selectedLead.mobile
                    ? "pointer"
                    : "default",
                fontSize: "11px",
                fontWeight: 700,
                opacity: selectedLead.mobile
                    ? 1
                    : 0.45
            }}
        >
            Call
        </button>

        {/* EMAIL */}

       <button
    type="button"
    disabled={!String(selectedLead.email || "").trim()}
    onClick={async () => {

    const email =
        String(
            selectedLead.email || ""
        ).trim();

    if (!email) return;

    try {

        const response =
            await fetch(
                "http://127.0.0.1:38765/prepare-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        email
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Unable to open Gmail."
            );
        }

    } catch (error) {

        console.error(
            "Gmail preparation failed:",
            error
        );

        alert(
            "Unable to open Orbitz Gmail. Please make sure Orbitz Helper is running."
        );
    }
}}
    style={{
        border: "1px solid #dbe3ea",
        background: "#f8fafc",
        color: "#334155",
        borderRadius: "7px",
        padding: "9px 6px",
        cursor: String(selectedLead.email || "").trim()
            ? "pointer"
            : "default",
        fontSize: "11px",
        fontWeight: 700,
        opacity: String(selectedLead.email || "").trim()
            ? 1
            : 0.45
    }}
>
    Email
</button>

        {/* FOLLOW-UP */}

        <button
            type="button"
            onClick={() => {
                setEditingLead({
                    ...selectedLead
                });
            }}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700
            }}
        >
            Follow-up
        </button>

    </div>
</div>

                            <div
                                style={{
                                    fontSize: "13px",
                                    lineHeight: 1.6,
                                    color: "#334155",
                                    whiteSpace: "pre-wrap"
                                }}
                            >
                                {selectedLead.notes ||
                                    "No notes entered."}
                            </div>
 
                        </div>

                        </>  

                         )}   

                    </div>

                </div>
            )}

        </div>
        
    );
}