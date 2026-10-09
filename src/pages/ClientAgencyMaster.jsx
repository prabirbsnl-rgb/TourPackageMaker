


import React, {
    useEffect,
    useMemo,
    useState
} from "react";


import {
    getClients,
    createClient,
    updateClient,
    deleteClient
} from "../utils/clientStorage";


import {
    getAllLeads,
    createLead
} from "../utils/leadStorage";


import ClientDetailsModal from "../components/ClientDetailsModal";


import LeadForm from "../components/LeadForm";

import {
    getAllDraftsFromFirestore
} from "../utils/quotationStorage";






const CLIENT_TYPES = [
    "Individual",
    "Agency",
    "Corporate"
];

const CLIENT_STATUSES = [
    "Active",
    "Inactive"
];

const emptyClient = {
    clientId: "",
    clientName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    clientType: "Individual",
    city: "",
    address: "",
    source: "",
    status: "Active",
    notes: ""
};



export default function ClientAgencyMaster({
    onBackToWorkspace,
    onOpenLead,
    onEditClient,
    clientToEdit
}) {

    const [clients, setClients] = useState([]);

    const [leads, setLeads] = useState([]);

    const [quotations, setQuotations] = useState([]);


    

    

    useEffect(() => {
    let active = true;

    async function loadClients() {
        try {
            const savedClients =
                await getClients();

            if (active) {
                setClients(savedClients);
            }
        } catch (error) {
            console.error(
                "Failed to load clients:",
                error
            );
        }
    }

    loadClients();

    return () => {
        active = false;
    };
}, []);



useEffect(() => {
    let active = true;

    async function loadQuotations() {
        try {
            const savedQuotations =
                await getAllDraftsFromFirestore();

           if (active) {
    

    setQuotations(
        savedQuotations || []
    );
}
        } catch (error) {
            console.error(
                "Failed to load quotations:",
                error
            );
        }
    }

    loadQuotations();

    return () => {
        active = false;
    };
}, []);



useEffect(() => {
    let active = true;

    async function loadLeads() {
        try {
            const savedLeads =
                await getAllLeads();

            if (active) {
                setLeads(savedLeads);
            }
        } catch (error) {
            console.error(
                "Failed to load leads:",
                error
            );
        }
    }

    loadLeads();

    return () => {
        active = false;
    };
}, []);





    const [searchText, setSearchText] =
        useState("");

    const [selectedClient, setSelectedClient] =
        useState(null);


        const [leadFormData, setLeadFormData] =
    useState({
        source: "Direct Office",
        sourceDetail: "",
        leadTitle: "",
        name: "",
        mobile: "",
        email: "",
        destination: "",
        travelFrom: "",
        travelTo: "",
        adults: "",
        children: "",
        budget: "",
        assignedTo: "",
        status: "New",
        nextFollowUp: "",
        campaign: "",
        requirement: "",
        notes: ""
    });

const [showLeadForm, setShowLeadForm] =
    useState(false);

const [savingLead, setSavingLead] =
    useState(false);



    const [editingClient, setEditingClient] =
        useState(null);


        useEffect(() => {
    if (!clientToEdit) {
        return;
    }

    setEditingClient({
        ...clientToEdit
    });
}, [clientToEdit]);




    const filteredClients =
        useMemo(() => {

            const search =
                searchText
                    .trim()
                    .toLowerCase();

            if (!search) {
                return clients;
            }

            return clients.filter(client =>
                [
                    client.clientId,
                    client.clientName,
                    client.contactPerson,
                    client.mobile,
                    client.email,
                    client.city,
                    client.clientType
                ]
                    .filter(Boolean)
                    .some(value =>
                        String(value)
                            .toLowerCase()
                            .includes(search)
                    )
            );

        }, [clients, searchText]);


    function openNewClient() {

        setEditingClient({
            ...emptyClient
        });

        setSelectedClient(null);
    }


    function openEditClient(client) {



         console.log(
        "OPEN EDIT CLIENT DEBUG:",
        {
            firestoreId: client?.id,
            clientId: client?.clientId,
            clientName: client?.clientName
        }
    );




        setEditingClient({
            ...client
        });

        setSelectedClient(null);
    }


   async function handleSaveClient() {


     console.log(
        "CLIENT SAVE DEBUG:",
        {
            firestoreId: editingClient?.id,
            clientId: editingClient?.clientId,
            clientName: editingClient?.clientName
        }
    );




    if (
        !editingClient.clientName.trim()
    ) {

        alert(
            "Client / Agency Name is required."
        );

        return;
    }

    try {

        if (editingClient.clientId) {

            await updateClient(
                editingClient.id,
                {
                    ...editingClient
                }
            );

            setClients(previous =>
                previous.map(client =>
                    client.clientId ===
                    editingClient.clientId
                        ? {
                            ...client,
                            ...editingClient
                        }
                        : client
                )
            );

        } else {

            const newClient =
                await createClient(
                    editingClient
                );

            setClients(previous => [
                newClient,
                ...previous
            ]);

        }

        setEditingClient(null);

    } catch (error) {

        console.error(
            "Failed to save client:",
            error
        );

        alert(
            "Unable to save client. Please try again."
        );
    }
}


    async function handleDeleteClient(client) {

    const confirmed =
        window.confirm(
            `Delete "${client.clientName}" from Client / Agency Master?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteClient(
            client.id
        );

        setClients(previous =>
            previous.filter(
                item =>
                    item.clientId !==
                    client.clientId
            )
        );

        setSelectedClient(null);

    } catch (error) {

        console.error(
            "Failed to delete client:",
            error
        );

        alert(
            "Unable to delete client. Please try again."
        );
    }
}


function handleLeadFormChange(event) {
    const { name, value } = event.target;

    setLeadFormData(previous => ({
        ...previous,
        [name]: value
    }));
}


async function handleCreateLeadFromClient() {
    if (!leadFormData.name.trim()) {
        alert("Client Name is required.");
        return;
    }

    if (!leadFormData.mobile.trim()) {
        alert("Mobile number is required.");
        return;
    }

    if (!selectedClient) {
        alert("No Client selected.");
        return;
    }

    try {
        setSavingLead(true);

        const newLead = await createLead({
            ...leadFormData,
            clientId: selectedClient.clientId,
            clientDocId: selectedClient.id,
            clientRelationshipType: "existing"
        });

        setLeads(previous => [
            newLead,
            ...previous
        ]);

        setShowLeadForm(false);

        setLeadFormData({
            source: "Direct Office",
            sourceDetail: "",
            leadTitle: "",
            name: "",
            mobile: "",
            email: "",
            destination: "",
            travelFrom: "",
            travelTo: "",
            adults: "",
            children: "",
            budget: "",
            assignedTo: "",
            status: "New",
            nextFollowUp: "",
            campaign: "",
            requirement: "",
            notes: ""
        });

    } catch (error) {
        console.error(
            "Failed to create lead:",
            error
        );

        alert(
            "Unable to create Lead. Please try again."
        );
    } finally {
        setSavingLead(false);
    }
}




    const labelStyle = {
        display: "block",
        marginBottom: "5px",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase"
    };

    const fieldStyle = {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "7px",
        padding: "9px 10px",
        fontSize: "12px",
        color: "#334155",
        outline: "none",
        background: "#fff"
    };


    return (
        <div
            style={{
                minHeight:
                    "calc(100vh - 58px)",
                background: "#f5f7fa",
                padding:
                    "28px 32px 40px",
                boxSizing: "border-box"
            }}
        >

            {/* PAGE HEADER */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px"
                }}
            >

                <div>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#172033"
                        }}
                    >
                        Client / Agency Master
                    </h1>

                    <p
                        style={{
                            margin:
                                "6px 0 0",
                            fontSize: "13px",
                            color: "#64748b"
                        }}
                    >
                        Central database for
                        clients and agencies.
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "8px"
                    }}
                >

                    <button
                        type="button"
                        onClick={
                            onBackToWorkspace
                        }
                        style={{
                            background:
                                "#e2e8f0",
                            color:
                                "#334155",
                            border: "none",
                            borderRadius:
                                "8px",
                            padding:
                                "9px 14px",
                            cursor:
                                "pointer",
                            fontWeight: 700,
                            fontSize: "12px"
                        }}
                    >
                        ← Back to Workspace
                    </button>

                    <button
                        type="button"
                        onClick={
                            openNewClient
                        }
                        style={{
                            background:
                                "#0f766e",
                            color: "#fff",
                            border: "none",
                            borderRadius:
                                "8px",
                            padding:
                                "9px 14px",
                            cursor:
                                "pointer",
                            fontWeight: 700,
                            fontSize: "12px"
                        }}
                    >
                        + Add Client
                    </button>

                </div>

            </div>


            {/* MAIN LIST */}

            <div
                style={{
                    background: "#fff",
                    border:
                        "1px solid #dbe3ea",
                    borderRadius: "10px",
                    overflow: "hidden"
                }}
            >

                {/* LIST HEADER */}

                <div
                    style={{
                        padding:
                            "14px 16px",
                        borderBottom:
                            "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: "12px"
                    }}
                >

                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color:
                                "#334155"
                        }}
                    >
                        Clients & Agencies
                    </div>

                    <input
                        value={searchText}
                        onChange={e =>
                            setSearchText(
                                e.target.value
                            )
                        }
                        placeholder="Search client, mobile, email..."
                        style={{
                            ...fieldStyle,
                            width: "280px"
                        }}
                    />

                </div>


                {/* TABLE HEADER */}

                {filteredClients.length >
                    0 && (
                    <div
                        style={{
                            display: "grid",
                          gridTemplateColumns:
    "120px 1.5fr 1.2fr 125px 1.3fr 110px 90px 125px",
                            gap: "10px",
                            padding:
                                "10px 16px",
                            background:
                                "#f8fafc",
                            borderBottom:
                                "1px solid #e2e8f0",
                            fontSize: "9px",
                            fontWeight: 800,
                            color:
                                "#64748b",
                            textTransform:
                                "uppercase"
                        }}
                    >
                        <div>Client ID</div>
<div>Client / Agency</div>
<div>Contact Person</div>
<div>Mobile</div>
<div>Email</div>
<div>Type</div>
<div>Status</div>
<div>Action</div>
                    </div>
                )}


                {/* LIST */}

                {filteredClients.length ===
                0 ? (

                    <div
                        style={{
                            padding:
                                "55px 20px",
                            textAlign:
                                "center"
                        }}
                    >

                        <div
                            style={{
                                fontSize:
                                    "14px",
                                fontWeight:
                                    700,
                                color:
                                    "#334155",
                                marginBottom:
                                    "5px"
                            }}
                        >
                            No clients or agencies yet
                        </div>

                        <div
                            style={{
                                fontSize:
                                    "12px",
                                color:
                                    "#94a3b8"
                            }}
                        >
                            Click
                            {" "}
                            <strong>
                                + Add Client
                            </strong>
                            {" "}
                            to create the first record.
                        </div>

                    </div>

                ) : (

                    filteredClients.map(
                        client => (

                            <div
                                key={
                                    client.clientId
                                }
                                onClick={() =>
                                    setSelectedClient(
                                        client
                                    )
                                }
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
    "120px 1.5fr 1.2fr 125px 1.3fr 110px 90px 125px",
                                    gap: "10px",
                                    padding:
                                        "12px 16px",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                    alignItems:
                                        "center",
                                    cursor:
                                        "pointer"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize:
                                            "11px",
                                        color:
                                            "#64748b",
                                        fontWeight:
                                            700
                                    }}
                                >
                                    {
                                        client.clientId
                                    }
                                </div>

                                <div
    style={{
        fontSize: "12px",
        fontWeight: 800,
        color: "#172033"
    }}
>
    {client.clientName}
</div>







                                <div
                                    style={{
                                        fontSize:
                                            "12px",
                                        color:
                                            "#334155"
                                    }}
                                >
                                    {
                                        client.contactPerson ||
                                        "—"
                                    }
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            "11px",
                                        color:
                                            "#334155"
                                    }}
                                >
                                    {
                                        client.mobile ||
                                        "—"
                                    }
                                </div>


<div
    style={{
        fontSize: "11px",
        color: "#334155"
    }}
>
    {client.email || "—"}
</div>


                                <div
                                    style={{
                                        fontSize:
                                            "11px",
                                        color:
                                            "#334155"
                                    }}
                                >
                                    {
                                        client.clientType
                                    }
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                        color:
                                            client.status ===
                                            "Active"
                                                ? "#047857"
                                                : "#64748b"
                                    }}
                                >
                                    {
                                        client.status
                                    }
                                </div>

                                                                <div
                                    style={{
                                        display: "flex",
                                        gap: "5px",
                                        alignItems: "center"
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            openEditClient(
                                                client
                                            );
                                        }}
                                        style={{
                                            border:
                                                "1px solid #dbe3ea",
                                            background:
                                                "#f8fafc",
                                            color:
                                                "#334155",
                                            borderRadius:
                                                "6px",
                                            padding:
                                                "5px 7px",
                                            cursor:
                                                "pointer",
                                            fontSize:
                                                "10px",
                                            fontWeight:
                                                700
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDeleteClient(
                                                client
                                            );
                                        }}
                                        style={{
                                            border:
                                                "1px solid #fecaca",
                                            background:
                                                "#fff7f7",
                                            color:
                                                "#dc2626",
                                            borderRadius:
                                                "6px",
                                            padding:
                                                "5px 7px",
                                            cursor:
                                                "pointer",
                                            fontSize:
                                                "10px",
                                            fontWeight:
                                                700
                                        }}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>






            {/* CLIENT DETAILS DRAWER */}

           {selectedClient && (
   <ClientDetailsModal
    client={selectedClient}
    leads={leads.filter(lead =>
        (
            selectedClient.clientDocId &&
            lead.clientDocId ===
                selectedClient.clientDocId
        ) ||
        (
            selectedClient.clientId &&
            lead.clientId ===
                selectedClient.clientId
        )
    )}

       quotations={quotations.filter(quotation => {
    if (!quotation) {
        return false;
    }

    const relatedLeads =
        leads.filter(lead =>
            (
                selectedClient.clientDocId &&
                lead.clientDocId ===
                    selectedClient.clientDocId
            ) ||
            (
                selectedClient.clientId &&
                lead.clientId ===
                    selectedClient.clientId
            )
        );

    const relatedLeadIds =
        relatedLeads.map(
            lead => lead.leadId
        );

    const relatedLeadDocIds =
        relatedLeads.map(
            lead => lead.id
        );

    return (
        (
            selectedClient.clientId &&
            quotation.clientId ===
                selectedClient.clientId
        ) ||
        (
            quotation.leadId &&
            relatedLeadIds.includes(
                quotation.leadId
            )
        ) ||
        (
            quotation.leadDocId &&
            relatedLeadDocIds.includes(
                quotation.leadDocId
            )
        )
    );
})}
    
    onClose={() =>
        setSelectedClient(null)
    }
    onEdit={client => {
        openEditClient(client);
    }}

   onOpenLead={lead => {
    setSelectedClient(null);
    onOpenLead(lead);
}}


    onDelete={handleDeleteClient}
   

    onCreateLead={() => {
    setLeadFormData({
        source: "Direct Office",
        sourceDetail: "",
        leadTitle: "",
        name: selectedClient.clientName || "",
        mobile: selectedClient.mobile || "",
        email: selectedClient.email || "",
        destination: "",
        travelFrom: "",
        travelTo: "",
        adults: "",
        children: "",
        budget: "",
        assignedTo: "",
        status: "New",
        nextFollowUp: "",
        campaign: "",
        requirement: "",
        notes: ""
    });

    setShowLeadForm(true);
}}

 showDelete={true}

/>

)}


{showLeadForm && selectedClient && (
    <LeadForm
        formData={leadFormData}
        setFormData={setLeadFormData}
        handleChange={handleLeadFormChange}
        handleCreateLead={handleCreateLeadFromClient}
        saving={savingLead}
        onClose={() => {
            setShowLeadForm(false);
        }}
        cardStyle={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "calc(100vw - 48px)",
            maxWidth: "1100px",
            maxHeight: "90vh",
            overflowY: "auto",
            zIndex: 1100,
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.22)"
        }}
    />
)}


            {/* ADD / EDIT DRAWER */}

            {editingClient && (

                <div
                    style={{
                        position:
                            "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "420px",
                        maxWidth:
                            "90vw",
                        background:
                            "#fff",
                        boxShadow:
                            "-8px 0 30px rgba(15, 23, 42, 0.16)",
                        borderLeft:
                            "1px solid #dbe3ea",
                        zIndex: 1001,
                        display:
                            "flex",
                        flexDirection:
                            "column"
                    }}
                >

                    <div
                        style={{
                            minHeight:
                                "58px",
                            padding:
                                "10px 16px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between",
                            borderBottom:
                                "1px solid #e2e8f0",
                            background:
                                "#f8fafc"
                        }}
                    >

                        <div
                            style={{
                                fontSize:
                                    "15px",
                                fontWeight:
                                    800,
                                color:
                                    "#172033"
                            }}
                        >
                            {
                                editingClient.clientId
                                    ? "Edit Client"
                                    : "Add Client"
                            }
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setEditingClient(
                                    null
                                )
                            }
                            style={{
                                width:
                                    "30px",
                                height:
                                    "30px",
                                border:
                                    "none",
                                borderRadius:
                                    "7px",
                                background:
                                    "#e2e8f0",
                                color:
                                    "#334155",
                                cursor:
                                    "pointer",
                                fontSize:
                                    "18px"
                            }}
                        >
                            ×
                        </button>

                    </div>


                    <div
                        style={{
                            flex: 1,
                            overflowY:
                                "auto",
                            padding:
                                "18px"
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "flex",
                                flexDirection:
                                    "column",
                                gap:
                                    "12px"
                            }}
                        >

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Client / Agency Name *
                                </label>

                                <input
                                    value={
                                        editingClient.clientName ||
                                        ""
                                    }
                                    onChange={e =>
                                        setEditingClient({
                                            ...editingClient,
                                            clientName:
                                                e.target.value
                                        })
                                    }
                                    placeholder="e.g. ABC Travels"
                                    style={
                                        fieldStyle
                                    }
                                />
                            </div>


                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Contact Person
                                </label>

                                <input
                                    value={
                                        editingClient.contactPerson ||
                                        ""
                                    }
                                    onChange={e =>
                                        setEditingClient({
                                            ...editingClient,
                                            contactPerson:
                                                e.target.value
                                        })
                                    }
                                    style={
                                        fieldStyle
                                    }
                                />
                            </div>


                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap:
                                        "12px"
                                }}
                            >

                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Mobile
                                    </label>

                                    <input
                                        value={
                                            editingClient.mobile ||
                                            ""
                                        }
                                        onChange={e =>
                                            setEditingClient({
                                                ...editingClient,
                                                mobile:
                                                    e.target.value
                                            })
                                        }
                                        style={
                                            fieldStyle
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            editingClient.email ||
                                            ""
                                        }
                                        onChange={e =>
                                            setEditingClient({
                                                ...editingClient,
                                                email:
                                                    e.target.value
                                            })
                                        }
                                        style={
                                            fieldStyle
                                        }
                                    />
                                </div>

                            </div>


                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap:
                                        "12px"
                                }}
                            >

                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Client Type
                                    </label>

                                    <select
                                        value={
                                            editingClient.clientType ||
                                            "Individual"
                                        }
                                        onChange={e =>
                                            setEditingClient({
                                                ...editingClient,
                                                clientType:
                                                    e.target.value
                                            })
                                        }
                                        style={
                                            fieldStyle
                                        }
                                    >
                                        {
                                            CLIENT_TYPES.map(
                                                type => (
                                                    <option
                                                        key={
                                                            type
                                                        }
                                                        value={
                                                            type
                                                        }
                                                    >
                                                        {
                                                            type
                                                        }
                                                    </option>
                                                )
                                            )
                                        }
                                    </select>
                                </div>


                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Status
                                    </label>

                                    <select
                                        value={
                                            editingClient.status ||
                                            "Active"
                                        }
                                        onChange={e =>
                                            setEditingClient({
                                                ...editingClient,
                                                status:
                                                    e.target.value
                                            })
                                        }
                                        style={
                                            fieldStyle
                                        }
                                    >
                                        {
                                            CLIENT_STATUSES.map(
                                                status => (
                                                    <option
                                                        key={
                                                            status
                                                        }
                                                        value={
                                                            status
                                                        }
                                                    >
                                                        {
                                                            status
                                                        }
                                                    </option>
                                                )
                                            )
                                        }
                                    </select>
                                </div>

                            </div>


                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    City
                                </label>

                                <input
                                    value={
                                        editingClient.city ||
                                        ""
                                    }
                                    onChange={e =>
                                        setEditingClient({
                                            ...editingClient,
                                            city:
                                                e.target.value
                                        })
                                    }
                                    style={
                                        fieldStyle
                                    }
                                />
                            </div>


                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Address
                                </label>

                                <textarea
                                    value={
                                        editingClient.address ||
                                        ""
                                    }
                                    onChange={e =>
                                        setEditingClient({
                                            ...editingClient,
                                            address:
                                                e.target.value
                                        })
                                    }
                                    rows={3}
                                    style={{
                                        ...fieldStyle,
                                        resize:
                                            "vertical"
                                    }}
                                />
                            </div>


                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Source
                                </label>

                                <input
                                    value={
                                        editingClient.source ||
                                        ""
                                    }
                                    onChange={e =>
                                        setEditingClient({
                                            ...editingClient,
                                            source:
                                                e.target.value
                                        })
                                    }
                                    placeholder="e.g. Lead, Referral, Direct Office"
                                    style={
                                        fieldStyle
                                    }
                                />
                            </div>


                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Notes
                                </label>

                                <textarea
                                    value={
                                        editingClient.notes ||
                                        ""
                                    }
                                    onChange={e =>
                                        setEditingClient({
                                            ...editingClient,
                                            notes:
                                                e.target.value
                                        })
                                    }
                                    rows={4}
                                    style={{
                                        ...fieldStyle,
                                        resize:
                                            "vertical"
                                    }}
                                />
                            </div>


                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "flex-end",
                                    gap:
                                        "8px",
                                    paddingTop:
                                        "4px",
                                    paddingBottom:
                                        "10px"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingClient(
                                            null
                                        )
                                    }
                                    style={{
                                        background:
                                            "#e2e8f0",
                                        color:
                                            "#334155",
                                        border:
                                            "none",
                                        borderRadius:
                                            "7px",
                                        padding:
                                            "9px 16px",
                                        cursor:
                                            "pointer",
                                        fontWeight:
                                            700
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleSaveClient
                                    }
                                    style={{
                                        background:
                                            "#0f766e",
                                        color:
                                            "#fff",
                                        border:
                                            "none",
                                        borderRadius:
                                            "7px",
                                        padding:
                                            "9px 16px",
                                        cursor:
                                            "pointer",
                                        fontWeight:
                                            700
                                    }}
                                >
                                    Save Client
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}