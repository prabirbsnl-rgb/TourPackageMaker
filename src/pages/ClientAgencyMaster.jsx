


import React, {
    useEffect,
    useMemo,
    useState
} from "react";


import {
    getClients,
    getClientChangeHistory,
    deleteClientHistoryRecord,
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


import {
    getAllServiceRecords
} from "../utils/clientServiceStorage";




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
    clientToEdit,
    currentUser,
    userProfile
}) {

    const [clients, setClients] = useState([]);

    const [clientHistory, setClientHistory] = useState([]);

    const [leads, setLeads] = useState([]);

    const [quotations, setQuotations] = useState([]);


    const [serviceRecords, setServiceRecords] =
    useState([]);

    const [selectedService, setSelectedService] = useState("all");

const [selectedClientHistory, setSelectedClientHistory] =
    useState(null);


    const [historyToDelete, setHistoryToDelete] =
    useState(null);

const [isDeletingHistory, setIsDeletingHistory] =
    useState(false);


    const selectedHistoryRecords = selectedClientHistory
    ? clientHistory
        .filter(
            history =>
                history.clientDocId === selectedClientHistory.id
        )
        .sort((a, b) => {
            const dateA = a.changedAt?.toDate
                ? a.changedAt.toDate()
                : new Date(a.changedAt);

            const dateB = b.changedAt?.toDate
                ? b.changedAt.toDate()
                : new Date(b.changedAt);

            return dateB - dateA;
        })
    : [];



    

    useEffect(() => {
    let active = true;

    async function loadClients() {
    try {
        const [savedClients, savedHistory] =
            await Promise.all([
                getClients(),
                getClientChangeHistory()
            ]);

        if (active) {
            setClients(savedClients);
            setClientHistory(savedHistory);
        }

    } catch (error) {
        console.error(
            "Failed to load Client Master data:",
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




useEffect(() => {
  let active = true;

  async function loadServiceRecords() {
    try {
      const savedRecords = await getAllServiceRecords();



if (active) {
    setServiceRecords(savedRecords || []);
}
    } catch (error) {
      console.error("Failed to load service records:", error);
    }
  }

  loadServiceRecords();

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


        const [pendingClientUpdate, setPendingClientUpdate] =
    useState(null);



        useEffect(() => {
    if (!clientToEdit) {
        return;
    }

    setEditingClient({
        ...clientToEdit
    });
}, [clientToEdit]);




   const filteredClients = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let serviceFilteredClients = clients;

    if (selectedService === "travelPackage") {
        const travelPackageClientIds = new Set(
            leads
                .filter(lead => lead.clientId || lead.clientDocId)
                .flatMap(lead => [
                    lead.clientId,
                    lead.clientDocId
                ].filter(Boolean))
        );

        serviceFilteredClients = clients.filter(client =>
            travelPackageClientIds.has(client.clientId) ||
            travelPackageClientIds.has(client.id)
        );

    } else if (selectedService !== "all") {
        const serviceClientIds = new Set(
            serviceRecords
                .filter(record =>
                    record.serviceType === selectedService
                )
                .flatMap(record => [
                    record.clientId,
                    record.clientDocId
                ].filter(Boolean))
        );

        serviceFilteredClients = clients.filter(client =>
            serviceClientIds.has(client.clientId) ||
            serviceClientIds.has(client.id)
        );
    }

    if (!search) {
        return serviceFilteredClients;
    }

    return serviceFilteredClients.filter(client =>
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

}, [clients, leads, serviceRecords, selectedService, searchText]);




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

    if (!editingClient.clientName.trim()) {
        alert("Client / Agency Name is required.");
        return;
    }

    try {


        // DUPLICATE MOBILE NUMBER VALIDATION
const enteredMobile = (editingClient.mobile || "").trim();

if (enteredMobile) {
    const duplicateClient = clients.find(client =>
        client.clientId !== editingClient.clientId &&
        (client.mobile || "").trim() === enteredMobile
    );

    if (duplicateClient) {
        alert(
            `This mobile number is already registered to another client.\n\n` +
            `Client ID: ${duplicateClient.clientId}\n` +
            `Client Name: ${duplicateClient.clientName}\n\n` +
            `Please verify the number before saving.`
        );

        return;
    }
}


        // EXISTING CLIENT — PREPARE CHANGE PREVIEW
        if (editingClient.clientId) {

            const existingClient = clients.find(
                client =>
                    client.clientId === editingClient.clientId
            );

            if (!existingClient) {
                alert("Existing client record not found.");
                return;
            }

            const ignoredFields = [
                "id",
                "clientId",
                "createdAt",
                "updatedAt"
            ];

            const changedFields = [];

            Object.keys(editingClient).forEach(key => {

                if (ignoredFields.includes(key)) return;

                const oldValue = existingClient[key] ?? "";
                const newValue = editingClient[key] ?? "";

                if (
                    JSON.stringify(oldValue) !==
                    JSON.stringify(newValue)
                ) {
                    changedFields.push({
                        field: key,
                        oldValue,
                        newValue
                    });
                }
            });

            if (changedFields.length > 0) {

                setPendingClientUpdate({
                    client: { ...editingClient },
                    changedFields
                });

                return;
            }

            setEditingClient(null);
            return;
        }

        // NEW CLIENT
        const newClient = await createClient(editingClient);

        setClients(previous => [
            newClient,
            ...previous
        ]);

        setEditingClient(null);

    } catch (error) {

        console.error(
            "Failed to save client:",
            error
        );

        alert("Unable to save client. Please try again.");
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
    error.message ||
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

        // Create an independent Lead.
        // Do NOT automatically associate it with Client Master.

        const newLead = await createLead({
            ...leadFormData
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



    const SERVICE_FILTERS = [
    { value: "all", label: "All Clients" },
    { value: "travelPackage", label: "Travel Package" },
    { value: "Flight Ticket", label: "Flight Ticket" },
    { value: "Visa Services", label: "Visa Services" },
    { value: "Hotel Services", label: "Hotel Services" },
    { value: "Passport Services", label: "Passport Services" },
    { value: "Train Ticket", label: "Train Ticket" },
    { value: "Forex", label: "Forex / Currency Exchange" },
    { value: "Cruise Services", label: "Cruise Services" },
    { value: "Travel Insurance", label: "Travel Insurance" }
];



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
        flexWrap: "wrap",
        gap: "14px",
        padding: "16px 20px",
        marginBottom: "20px",
        minHeight: "82px",
        background: "linear-gradient(105deg, #a9d9d2 0%, #cce8e2 45%, #eff8f5 100%)",
        border: "1px solid #b9ddd4",
        borderRadius: "12px",
        boxShadow: "0 3px 9px rgba(23, 102, 92, 0.08)",
        boxSizing: "border-box",
    }}
>
    {/* PAGE TITLE */}

    <div>
        <h1
            style={{
                margin: 0,
                fontSize: "23px",
                fontWeight: 900,
                color: "#17665c",
                letterSpacing: "-0.3px",
            }}
        >
            Client Master
        </h1>

        <p
            style={{
                margin: "5px 0 0",
                fontSize: "12px",
                fontWeight: 500,
                color: "#426f68",
            }}
        >
            Central database for clients.
        </p>
    </div>

    {/* PAGE ACTIONS */}

    <div
        style={{
            display: "flex",
            gap: "9px",
            alignItems: "center",
            flexWrap: "wrap",
        }}
    >
        <button
            type="button"
            onClick={onBackToWorkspace}
            style={{
                background: "linear-gradient(135deg, #e4edf8, #d2e2f4)",
                color: "#23466f",
                border: "1px solid #b5cce8",
                borderRadius: "8px",
                padding: "9px 15px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "11px",
            }}
        >
            ← Back to Workspace
        </button>

        <button
            type="button"
            onClick={openNewClient}
            style={{
    background: "linear-gradient(105deg, #a9d9d2 0%, #cce8e2 55%, #eff8f5 100%)",
    color: "#17665c",
    border: "1px solid #9bcfc3",
    borderRadius: "8px",
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "11px",
    boxShadow: "0 2px 5px rgba(23, 102, 92, 0.10)",
}}
        >
            + Add Client
        </button>
    </div>
</div>




           
{/* SERVICE FILTER */}

<div
    style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        marginBottom: "18px",
        padding: "13px 16px",
        background: "linear-gradient(105deg, #a9d9d2 0%, #cce8e2 45%, #eff8f5 100%)",
        border: "1px solid #b9ddd4",
        borderRadius: "10px",
        boxShadow: "0 3px 7px rgba(23, 102, 92, 0.08)",
        boxSizing: "border-box"
    }}
>
    <label
        style={{
            fontSize: "11px",
            fontWeight: 900,
            color: "#17665c",
            whiteSpace: "nowrap",
            letterSpacing: "0.35px"
        }}
    >
        VIEW CLIENTS BY SERVICE
    </label>

    <select
        value={selectedService}
        onChange={e => setSelectedService(e.target.value)}
        style={{
            ...fieldStyle,
            width: "260px",
            height: "38px",
            fontWeight: 700,
            fontSize: "12px",
            color: "#23466f",
            background: "#ffffff",
            border: "1px solid #b5cce8",
            borderRadius: "8px",
            padding: "7px 11px",
            boxSizing: "border-box"
        }}
    >
        {SERVICE_FILTERS.map(service => (
            <option key={service.value} value={service.value}>
                {service.label}
            </option>
        ))}
    </select>
</div>





            {/* MAIN LIST */}


           {true && (



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
        padding: "12px 16px",
        background: "linear-gradient(105deg, #a9d9d2 0%, #cce8e2 45%, #eff8f5 100%)",
        borderBottom: "1px solid #b9ddd4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        minHeight: "60px",
        boxSizing: "border-box",
    }}
>
    <div
        style={{
            fontSize: "14px",
            fontWeight: 900,
            color: "#17665c",
            textAlign: "left",
            letterSpacing: "0.1px",
        }}
    >
        {
            SERVICE_FILTERS.find(
                service => service.value === selectedService
            )?.label === "Travel Package"
                ? "Travel Package Clients"
                : SERVICE_FILTERS.find(
                    service => service.value === selectedService
                )?.label || "Clients"
        }
    </div>

    <input
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Search client, mobile, email..."
        style={{
            ...fieldStyle,
            width: "280px",
            height: "36px",
            padding: "7px 11px",
            border: "1px solid #b9ddd4",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#23466f",
            fontSize: "12px",
            boxSizing: "border-box",
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
    "120px 1.5fr 1.2fr 125px 1.3fr 110px 90px 180px",
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
                       (client, index) => (

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
    display: "grid",
    gridTemplateColumns:
       "120px 1.5fr 1.2fr 125px 1.3fr 110px 90px 180px",
    gap: "10px",
    padding: "13px 16px",
    minHeight: "54px",
    boxSizing: "border-box",
    borderBottom: "1px solid #dce8f6",
    alignItems: "center",
    cursor: "pointer",
    background: index % 2 === 0
        ? "linear-gradient(100deg, #edf5ff, #f8fbff)"
        : "linear-gradient(100deg, #ffffff, #f1f6ff)",
    transition: "background 0.2s ease",
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

                                <div>
    <span
        style={{
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: "20px",
            background: client.status === "Active"
                ? "#dcfce7"
                : "#f1f5f9",
            color: client.status === "Active"
                ? "#15803d"
                : "#64748b",
            fontSize: "10px",
            fontWeight: 900,
            border: client.status === "Active"
                ? "1px solid #bbf7d0"
                : "1px solid #e2e8f0",
            whiteSpace: "nowrap",
        }}
    >
        {client.status}
    </span>
</div>

                                                                <div
                                    style={{
                                        display: "flex",
                                        gap: "5px",
                                        alignItems: "center"
                                    }}
                                >


                                    {clientHistory.some(
    history =>
        history.clientDocId === client.id
) && (
    <button
        type="button"
        onClick={e => {
            e.stopPropagation();
            setSelectedClientHistory(client);
        }}
        style={{
            border: "1px solid #c4b5fd",
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            color: "#6d28d9",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 800,
            whiteSpace: "nowrap"
        }}
    >
        History
    </button>
)}

                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            openEditClient(
                                                client
                                            );
                                        }}
                                        style={{
    border: "1px solid #b5cce8",
    background: "linear-gradient(135deg, #e4efff, #d4e5fa)",
    color: "#164da5",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
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
    border: "1px solid #fecaca",
    background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
    color: "#be123c",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
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

)}




{/* ALL CLIENTS VIEW */}

{selectedService === "all" && (
    <div
        style={{
            background: "#fff",
            border: "1px solid #dbe3ea",
            borderRadius: "10px",
            overflow: "hidden"
        }}
    >
        {/* HEADER */}

        <div
            style={{
                padding: "14px 16px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
            }}
        >
            <div
                style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#334155"
                }}
            >
                All Clients — Complete Customer Database
            </div>

            <div
                style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b"
                }}
            >
                {filteredClients.length} Clients
            </div>
        </div>

        {/* TABLE HEADER */}

        {filteredClients.length > 0 && (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
    "120px 1.5fr 130px 1.5fr 100px 90px",
                    gap: "10px",
                    padding: "10px 16px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#64748b",
                    textTransform: "uppercase"
                }}
            >
                <div>Client ID</div>
                <div>Client Name</div>
                <div>Mobile</div>
                <div>Email</div>
                
                <div>Records</div>
                <div>Status</div>
            </div>
        )}

        {/* CLIENT ROWS */}

        {filteredClients.length === 0 ? (
            <div
                style={{
                    padding: "55px 20px",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#64748b"
                }}
            >
                No clients found.
            </div>
        ) : (
            filteredClients.map(client => {
    const clientRecords = serviceRecords.filter(record =>
        (
            record.clientDocId &&
            record.clientDocId === client.id
        ) ||

        (
            record.clientId &&
            record.clientId === client.clientId
        )
    );

    const relatedTravelPackageRecords = leads.filter(lead =>
        (
            lead.clientDocId &&
            lead.clientDocId === client.id
        ) ||
        (
            lead.clientId &&
            lead.clientId === client.clientId
        )
    );

    const totalRecords =
        clientRecords.length +
        relatedTravelPackageRecords.length;

    return (
                    <div
                        key={client.id || client.clientId}
                        onClick={() => setSelectedClient(client)}
                        style={{
                            display: "grid",
                           gridTemplateColumns:
    "120px 1.5fr 130px 1.5fr 100px 90px",
                            gap: "10px",
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                            alignItems: "center",
                            cursor: "pointer"
                        }}
                    >
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: 700
                            }}
                        >
                            {client.clientId || "—"}
                        </div>

                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: 800,
                                color: "#172033"
                            }}
                        >
                            {client.clientName || "—"}
                        </div>

                        <div style={{ fontSize: "11px", color: "#334155" }}>
                            {client.mobile || "—"}
                        </div>

                        <div style={{ fontSize: "11px", color: "#334155" }}>
                            {client.email || "—"}
                        </div>

                        

                        <div style={{ fontSize: "11px", color: "#334155" }}>
                            {totalRecords}
                        </div>

                        <div
                            style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color:
                                    client.status === "Active"
                                        ? "#047857"
                                        : "#64748b"
                            }}
                        >
                            {client.status || "—"}
                        </div>
                    </div>
                );
            })
        )}
    </div>
)}





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


        serviceRecords={serviceRecords.filter(record =>
        (
            selectedClient.id &&
            record.clientDocId === selectedClient.id
        ) ||
        (
            selectedClient.clientId &&
            record.clientId === selectedClient.clientId
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


            {pendingClientUpdate && (
    <div
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.55)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}
    >
        <div
            style={{
                width: "650px",
                maxWidth: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 15px 45px rgba(0,0,0,0.2)"
            }}
        >
            <h3 style={{ marginTop: 0, color: "#17365d" }}>
                Confirm Customer Details Update
            </h3>

            <p style={{ fontSize: "13px", color: "#64748b" }}>
                The following customer information has changed.
                Previous details will be preserved in Customer Change History.
            </p>

            <div style={{ overflowX: "auto" }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px"
                }}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            {["Field", "Previous Value", "New Value"].map(label => (
                                <th
                                    key={label}
                                    style={{
                                        padding: "11px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #dbe3ea"
                                    }}
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {pendingClientUpdate.changedFields.map((field, index) => (
                            <tr key={field.field}>
                                <td style={{ padding: "11px", fontWeight: 700 }}>
                                    {field.field
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, char => char.toUpperCase())}
                                </td>

                                <td style={{ padding: "11px", color: "#b45309" }}>
                                    {String(field.oldValue || "—")}
                                </td>

                                <td style={{ padding: "11px", color: "#15803d" }}>
                                    {String(field.newValue || "—")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px"
            }}>
                <button
                    type="button"
                    onClick={() => setPendingClientUpdate(null)}
                    style={{
                        padding: "10px 17px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        background: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 700
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={async () => {
    try {
        const pending = pendingClientUpdate;

if (
    !currentUser?.uid ||
    !userProfile?.username ||
    !userProfile?.role
) {
    alert(
        "Unable to verify your staff identity. Please log in again and retry."
    );
    return;
}

        const result = await updateClient(
            pending.client.id,
            {
                ...pending.client
            },
            {
                uid: currentUser?.uid || "",
                username: userProfile?.username || "Unknown",
                role: userProfile?.role || "unknown",
                reason: "Client details updated from Client Agency Master"
            }
        );


                // Refresh customer history immediately after update
        const updatedHistory = await getClientChangeHistory();
        setClientHistory(updatedHistory);


        

        setClients(previous =>
            previous.map(client =>
                client.clientId === pending.client.clientId
                    ? {
                        ...client,
                        ...pending.client
                    }
                    : client
            )
        );

        setPendingClientUpdate(null);
        setEditingClient(null);

        alert("Client details updated successfully.");

    } catch (error) {
        console.error("Customer update failed:", error);
        alert("Unable to update customer details. Please try again.");
    }
}}
                    style={{
                        padding: "10px 17px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#0f766e",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 700
                    }}
                >
                    Confirm Update
                </button>
            </div>
        </div>
    </div>
)}



{/* =====================================
    CUSTOMER HISTORY MODAL
===================================== */}

{selectedClientHistory && (

    <div
        onClick={() => setSelectedClientHistory(null)}
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px"
        }}
    >

        <div
            onClick={e => e.stopPropagation()}
            style={{
                width: "100%",
maxWidth: "1050px",
maxHeight: "82vh",
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column"
            }}
        >

            {/* PREMIUM GRADIENT HEADER */}

            <div
                style={{
                    background: "linear-gradient(120deg, #064e3b, #0f766e, #14b8a6)",
                    padding: "22px 25px",
                    color: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >

                <div>
                    <div style={{
                        fontSize: "18px",
                        fontWeight: 900
                    }}>
                        Customer History
                    </div>

                    <div style={{
                        fontSize: "12px",
                        opacity: 0.9,
                        marginTop: "5px"
                    }}>
                        {selectedClientHistory.clientName}
                        {" · "}
                        {selectedClientHistory.clientId}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setSelectedClientHistory(null)}
                    style={{
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        borderRadius: "8px",
                        width: "34px",
                        height: "34px",
                        cursor: "pointer",
                        fontSize: "19px",
                        fontWeight: 700
                    }}
                >
                    ×
                </button>

            </div>

            {/* HISTORY CONTENT */}

            <div style={{
                padding: "22px",
                overflowY: "auto",
                flex: 1
            }}>

                {selectedHistoryRecords.length === 0 ? (

                    <div style={{
                        textAlign: "center",
                        padding: "35px",
                        color: "#64748b"
                    }}>
                        No customer history available.
                    </div>

                ) : (

                    selectedHistoryRecords.map(history => (

                        <div
                            key={history.id}
                            style={{
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    padding: "11px 15px",
    marginBottom: "9px",
    background: "linear-gradient(135deg, #ffffff, #f8fbff)"
}}
                        >

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginBottom: "12px"
                            }}>

                                <div style={{
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#0f766e"
                                }}>
                                    {history.changedAt?.toDate
                                        ? history.changedAt.toDate().toLocaleString("en-IN")
                                        : new Date(history.changedAt).toLocaleString("en-IN")}
                                </div>

                                {userProfile?.role === "admin" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setHistoryToDelete(history)
                                        }
                                        style={{
                                            border: "1px solid #fecaca",
                                            background: "#fff1f2",
                                            color: "#be123c",
                                            borderRadius: "6px",
                                            padding: "5px 9px",
                                            cursor: "pointer",
                                            fontSize: "10px",
                                            fontWeight: 800
                                        }}
                                    >
                                        Delete History
                                    </button>

                                )}

                            </div>

                            {history.changedFields?.map((field, index) => (

                                <div
                                    key={index}
                                    style={{
                                        marginBottom: "12px"
                                    }}
                                >

                                    <div style={{
                                        fontSize: "12px",
                                        fontWeight: 800,
                                        color: "#334155",
                                        marginBottom: "7px",
                                        textTransform: "capitalize"
                                    }}>
                                        {field.field}
                                    </div>

                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "10px"
                                    }}>

                                        <div style={{
                                            padding: "7px 10px",
                                            background: "#fff1f2",
                                            borderRadius: "7px",
                                            fontSize: "11px",
                                            color: "#9f1239",
                                            overflowWrap: "anywhere"
                                        }}>
                                            <div style={{
                                                fontSize: "8px",
                                                fontWeight: 800,
                                                marginBottom: "3px"
                                            }}>
                                                PREVIOUS VALUE
                                            </div>
                                            {String(field.oldValue ?? "—")}
                                        </div>

                                        <div style={{
                                            padding: "7px 10px",
                                            background: "#ecfdf5",
                                            borderRadius: "7px",
                                            fontSize: "11px",
                                            color: "#047857",
                                            overflowWrap: "anywhere"
                                        }}>
                                            <div style={{
                                                fontSize: "8px",
                                                fontWeight: 800,
                                                marginBottom: "3px"
                                            }}>
                                                UPDATED VALUE
                                            </div>
                                            {String(field.newValue ?? "—")}
                                        </div>

                                    </div>

                                </div>

                            ))}

                            <div style={{
                                borderTop: "1px solid #e2e8f0",
                                paddingTop: "9px",
                                marginTop: "9px",
                                fontSize: "10px",
                                color: "#64748b"
                            }}>
                                Changed by:{" "}
                                <strong>
                                    {history.changedBy?.username || "Unknown"}
                                </strong>
                                {" · "}
                                {history.changedBy?.role || "Unknown"}
                            </div>

                        </div>

                    ))

                )}

            </div>

            {/* FOOTER */}

            <div style={{
                padding: "13px 22px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end"
            }}>
                <button
                    type="button"
                    onClick={() => setSelectedClientHistory(null)}
                    style={{
                        padding: "9px 18px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        background: "#ffffff",
                        color: "#334155",
                        cursor: "pointer",
                        fontWeight: 800
                    }}
                >
                    Close
                </button>
            </div>

        </div>

    </div>

)}


{/* HISTORY DELETE CONFIRMATION */}

{historyToDelete && (

    <div
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 11000,
            padding: "20px"
        }}
    >

        <div
            style={{
                width: "100%",
                maxWidth: "420px",
                background: "#ffffff",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
            }}
        >

            <div
                style={{
                    background: "linear-gradient(120deg, #064e3b, #0f766e, #14b8a6)",
                    padding: "17px 20px",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: 900
                }}
            >
                Delete Customer History
            </div>

            <div style={{
                padding: "22px",
                fontSize: "13px",
                color: "#475569",
                lineHeight: 1.6
            }}>
                Are you sure you want to permanently delete this history record?

                <div style={{
                    marginTop: "12px",
                    padding: "10px",
                    background: "#fff1f2",
                    borderRadius: "8px",
                    color: "#9f1239",
                    fontSize: "11px"
                }}>
                    This action cannot be undone. The customer record and service transactions will remain unchanged.
                </div>
            </div>

            <div style={{
                padding: "13px 20px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "9px",
                borderTop: "1px solid #e2e8f0"
            }}>

                <button
                    type="button"
                    onClick={() => setHistoryToDelete(null)}
                    disabled={isDeletingHistory}
                    style={{
                        padding: "9px 15px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        background: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 700
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    disabled={isDeletingHistory}
                    onClick={async () => {

    if (
        userProfile?.role !== "admin" ||
        userProfile?.status !== "active"
    ) {
        alert("Only an active Admin can delete customer history.");
        return;
    }

    try {
        setIsDeletingHistory(true);

        await deleteClientHistoryRecord(
            historyToDelete.id
        );

        // Refresh history from Firestore
        const updatedHistory =
            await getClientChangeHistory();

        setClientHistory(updatedHistory);

        setHistoryToDelete(null);

        // Close history modal if no records remain
        const remainingHistory =
            updatedHistory.filter(
                history =>
                    history.clientDocId ===
                    selectedClientHistory?.id
            );

        if (remainingHistory.length === 0) {
            setSelectedClientHistory(null);
        }

        alert("Customer history deleted successfully.");

    } catch (error) {

        console.error(
            "History deletion failed:",
            error
        );

        alert(
            "Unable to delete customer history. Please try again."
        );

    } finally {
        setIsDeletingHistory(false);
    }
}}

                    style={{
                        padding: "9px 15px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#be123c",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 800
                    }}
                >
                    {isDeletingHistory ? "Deleting..." : "Delete Permanently"}
                </button>

            </div>

        </div>

    </div>

)}



        </div>
    );
}