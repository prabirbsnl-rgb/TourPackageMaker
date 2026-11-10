



import React, { useEffect, useState } from "react";

import {
    getClients,
    createClient
} from "../../utils/clientStorage";


import {
    createServiceRecord,
    updateServiceRecord
} from "../../utils/clientServiceStorage";


import {
    getCustomerDetailsFields
} from "../../utils/serviceCatalogueStorage";



function ServiceBooking({
    service,
    onBack,
    editingRecord = null,
    onSaved,
    onBookingSaved,
    onViewSavedBooking
}) {


        const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(true);

    const [clientNameSearch, setClientNameSearch] = useState("");
    const [mobileSearch, setMobileSearch] = useState("");

    const [selectedClient, setSelectedClient] = useState(null);
    const [showNewClientModal, setShowNewClientModal] = useState(false);


    // SERVICE BOOKING FORM STATE
const [bookingMode, setBookingMode] = useState(null);

const [customerForm, setCustomerForm] = useState({
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
});


const [customerDetailsFields, setCustomerDetailsFields] = useState([]);

const [serviceFormData, setServiceFormData] = useState({});
const [transactionStatus, setTransactionStatus] = useState("");
const [savingBooking, setSavingBooking] = useState(false);
const [savedBooking, setSavedBooking] = useState(null);






    useEffect(() => {
        let active = true;

        async function loadClients() {
            try {
                setClientsLoading(true);

                const savedClients = await getClients();

                if (active) {
                    setClients(savedClients);
                }
            } catch (error) {
                console.error("Failed to load clients:", error);
            } finally {
                if (active) {
                    setClientsLoading(false);
                }
            }
        }

        loadClients();

        return () => {
            active = false;
        };
    }, []);



    // LOAD ADMIN-CONFIGURED CUSTOMER DETAILS FIELDS
useEffect(() => {
    let active = true;

    async function loadCustomerFields() {
        try {
            const fields = await getCustomerDetailsFields();

            if (active) {
                setCustomerDetailsFields(fields);
            }
        } catch (error) {
            console.error(
                "Failed to load customer details fields:",
                error
            );
        }
    }

    loadCustomerFields();

    return () => {
        active = false;
    };
}, []);





    // LOAD EXISTING SERVICE RECORD FOR EDITING
useEffect(() => {
    if (!editingRecord || clientsLoading) return;

    const client =
        clients.find(
            item =>
                item.id === editingRecord.clientDocId ||
                item.clientId === editingRecord.clientId
        ) || {
            id: editingRecord.clientDocId,
            clientId: editingRecord.clientId,
            clientName: editingRecord.clientName || "",
            contactPerson: editingRecord.contactPerson || "",
            mobile: editingRecord.mobile || "",
            email: editingRecord.email || ""
        };

    setSelectedClient(client);

    setCustomerForm({
    ...client,
    ...(editingRecord.customerData || {}),

    ...Object.fromEntries(
    customerDetailsFields.map(field => [
        field.key,
        editingRecord.customerData?.[field.key] ??
        client[field.key] ??
        ""
    ])
),

    clientId: editingRecord.clientId || "",
    clientName: editingRecord.clientName || "",
    contactPerson: editingRecord.contactPerson || "",
    mobile: editingRecord.mobile || "",
    email: editingRecord.email || "",

    clientType:
        editingRecord.customerData?.clientType ||
        client.clientType ||
        "Individual",

    city:
        editingRecord.customerData?.city ||
        client.city ||
        "",

    address:
        editingRecord.customerData?.address ||
        client.address ||
        "",

    source:
        editingRecord.customerData?.source ||
        client.source ||
        "",

    status:
        editingRecord.customerData?.status ||
        client.status ||
        "Active",

    notes:
        editingRecord.customerData?.notes ||
        client.notes ||
        ""
});


    const savedFormData = editingRecord.formData || {};

const initialServiceData = {};

// Restore all previously saved service fields
Object.assign(initialServiceData, savedFormData);

// Populate current configured fields and defaults
(service?.formFields || []).forEach(field => {
    initialServiceData[field.key] =
        savedFormData[field.key] ??
        editingRecord[field.key] ??
        (field.type === "checkbox" ? false : "");
});


// Restore common or dynamically generated Booking Status
initialServiceData[bookingStatusField.key] =
    savedFormData[bookingStatusField.key] ??
    editingRecord[bookingStatusField.key] ??
    "";

setServiceFormData(initialServiceData);

    setTransactionStatus(
        editingRecord.transactionStatus || ""
    );

    setBookingMode("edit");

}, [
    editingRecord,
    clients,
    clientsLoading,
    service,
    customerDetailsFields
]);




    // OPEN BOOKING FOR AN EXISTING CLIENT
function openExistingClientBooking(client) {
    setSelectedClient(client);

    setCustomerForm({
        clientId: client.clientId || "",
        clientName: client.clientName || "",
        contactPerson: client.contactPerson || "",
        mobile: client.mobile || "",
        email: client.email || "",
        clientType: client.clientType || "Individual",
        city: client.city || "",
        address: client.address || "",
        source: client.source || "",
        status: client.status || "Active",
        notes: client.notes || "",

...Object.fromEntries(
    customerDetailsFields.map(field => [
        field.key,
        client[field.key] ?? ""
    ])
)
    });

    const initialServiceData = {};

    (service?.formFields || []).forEach(field => {
        initialServiceData[field.key] =
            field.type === "checkbox" ? false : "";
    });

    setServiceFormData(initialServiceData);
    setTransactionStatus(service?.statusOptions?.[0] || "");
    setBookingMode("existing");
}

// OPEN BOOKING FOR A NEW CLIENT
function openNewClientBooking() {
    setSelectedClient(null);

    setCustomerForm({
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
       notes: "",

...Object.fromEntries(
    customerDetailsFields.map(field => [
        field.key,
        ""
    ])
)
    });

    const initialServiceData = {};

    (service?.formFields || []).forEach(field => {
        initialServiceData[field.key] =
            field.type === "checkbox" ? false : "";
    });

    setServiceFormData(initialServiceData);
    setTransactionStatus(service?.statusOptions?.[0] || "");
    setBookingMode("new");
}



// SAVE CLIENT AND SERVICE BOOKING
async function handleSaveBooking(event) {
    event.preventDefault();

    if (savingBooking) return;

    if (!customerForm.clientName.trim()) {
        alert("Client / Agency Name is required.");
        return;
    }

   const validationFields = [
    ...(service.formFields || [])
];

if (
    !validationFields.some(field =>
        /booking\s*status/i.test(field.label || "") ||
        /booking.?status/i.test(field.key || "")
    )
) {
    validationFields.push(bookingStatusField);
}

const missingFields = validationFields.filter(field =>
    field.required &&
    (
        serviceFormData[field.key] === undefined ||
        serviceFormData[field.key] === null ||
        String(serviceFormData[field.key]).trim() === ""
    )
);

    if (missingFields.length > 0) {
        alert(
            "Please complete the required fields: " +
            missingFields.map(field => field.label).join(", ")
        );
        return;
    }

    setSavingBooking(true);

    let client = selectedClient;
    let newClientCreated = false;

    try {
        // CREATE CLIENT FIRST, ONLY FOR NEW CUSTOMERS
        if (bookingMode === "new") {
            client = await createClient({
                ...customerForm,
                clientName: customerForm.clientName.trim()
            });

            newClientCreated = true;

            setClients(previous => [
                client,
                ...previous
            ]);

            setSelectedClient(client);
            setBookingMode("existing");

            setCustomerForm(previous => ({
                ...previous,
                clientId: client.clientId
            }));
        }

        if (!client?.id || !client?.clientId) {
            throw new Error("Client information is incomplete.");
        }

        // CREATE LINKED SERVICE TRANSACTION
        const serviceRecordData = {
            clientId: client.clientId,
            clientDocId: client.id,
            customerData: {
    ...customerForm
},

            serviceType: service.serviceName,
            serviceKey: service.serviceKey,
            serviceName: service.serviceName,

            clientName: client.clientName,
contactPerson: customerForm.contactPerson || client.contactPerson || "",
mobile: customerForm.mobile || client.mobile || "",
email: customerForm.email || client.email || "",

clientType: customerForm.clientType || client.clientType || "Individual",
city: customerForm.city || client.city || "",
address: customerForm.address || client.address || "",
source: customerForm.source || client.source || "",
customerStatus: customerForm.status || client.status || "Active",
customerNotes: customerForm.notes || client.notes || "",

            ...serviceFormData,

            formData: {
                ...serviceFormData
            },

            transactionStatus: transactionStatus
        };

        if (editingRecord) {
    await updateServiceRecord(
        editingRecord.id,
        serviceRecordData
    );

    alert(
        "Service booking updated successfully.\n\n" +
        "Client ID: " + client.clientId +
        "\nService Record ID: " + editingRecord.serviceRecordId
    );

    if (onSaved) {
        await onSaved();
    }

} else {
    const savedRecord = await createServiceRecord(
    serviceRecordData
);

setSavedBooking({
    ...savedRecord,
    clientId: client.clientId,
    clientName: client.clientName,
    serviceName: service.serviceName
});

if (onBookingSaved) {
    onBookingSaved(savedRecord);
}
}

        setBookingMode(null);
        setSelectedClient(null);

    } catch (error) {
        console.error("Failed to save service booking:", error);

        if (newClientCreated) {
            alert(
                "The customer was successfully created in Client Master, " +
                "but the service booking could not be saved.\n\n" +
                "Client ID: " + client.clientId +
                "\nPlease select this existing client and retry the booking.\n\n" +
                "Error: " + error.message
            );
        } else {
            alert(
                "Unable to save the service booking.\n\n" +
                (error.message || "Please try again.")
            );
        }
    } finally {
        setSavingBooking(false);
    }
}



    if (!service) {
        return null;
    }



        const filteredClients = clients.filter(client => {
        const nameQuery = clientNameSearch.trim().toLowerCase();
        const mobileQuery = mobileSearch.trim().replace(/\s+/g, "");

        const nameMatches = !nameQuery ||
            (client.clientName || "")
                .toLowerCase()
                .includes(nameQuery);

        const mobileMatches = !mobileQuery ||
            (client.mobile || "")
                .replace(/\s+/g, "")
                .includes(mobileQuery);

        return nameMatches && mobileMatches;
    });




    // SERVICE-SPECIFIC BOOKING HEADER IMAGES

const serviceHeaderImage = (() => {
    const name = (service.serviceName || "").toLowerCase();

    if (name.includes("flight")) {
        return "/images/services/webp/flights.webp";
    }

    if (name.includes("visa")) {
        return "/images/services/webp/visa-services.webp";
    }

    if (name.includes("hotel")) {
        return "/images/services/webp/hotels.webp";
    }

   if (name.includes("train") || name.includes("rail")) {
    return "/images/services/webp/train-ticket.webp";
}

    if (name.includes("forex") || name.includes("currency")) {
        return "/images/services/webp/forex.webp";
    }

    if (name.includes("cruise")) {
        return "/images/services/webp/cruise.webp";
    }

    if (name.includes("passport")) {
        return "/images/services/webp/passport-services.webp";
    }

    if (name.includes("insurance")) {
        return "/images/services/webp/travel-insurance.webp";
    }

    return "/images/services/webp/flights.webp";
})();




// SEPARATE BOOKING STATUS FROM SERVICE DETAILS GRID

const existingBookingStatusField = (service.formFields || []).find(field =>
    /booking\s*status/i.test(field.label || "") ||
    /booking.?status/i.test(field.key || "")
);

const bookingStatusField = existingBookingStatusField || {
    key: "bookingStatus",
    label: "Booking Status",
    type: "dropdown",
    required: true,
    options: [
    "Pending",
    "Confirmed",
    "Cancelled",
    "Refunded",
    ...(service.serviceKey === "HOTEL_SERVICES"
        ? ["Voucher Issued"]
        : []),
    ...(service.serviceKey === "TRAIN_TICKET"
        ? ["Ticketed"]
        : []),
    ...(service.serviceKey === "VISA_SERVICES"
        ? [
            "Documents Pending",
            "Submitted",
            "Approved",
            "Rejected"
        ]
        : []),
        ...(service.serviceKey === "FOREX"
    ? ["Processed"]
    : []),
    ...(service.serviceKey === "CRUISE_SERVICES"
    ? ["Voucher Issued"]
    : [])
        
]
};






    return (
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #dbeafe",
                borderRadius: "14px",
                padding: "24px",
                marginTop: "20px",
                boxShadow: "0 6px 20px rgba(30,64,175,0.06)",
            }}
        >
          


{/* COMPACT SERVICE HEADER */}
<div
    style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px",
        minHeight: "150px",
        padding: "22px 28px",
        marginBottom: "22px",
        overflow: "hidden",
        background: "linear-gradient(110deg, #8ccaff, #d9edff 55%, #eff8ff)",
        border: "1px solid #8bc9ff",
        borderRadius: "13px",
        isolation: "isolate",
    }}
>
    {/* FULL HEADER BACKGROUND IMAGE */}
    <img
       src={serviceHeaderImage}
        alt=""
        aria-hidden="true"
      style={{
    position: "absolute",
    right: 0,
    top: 0,
    width: "58%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    transform: "none",
    opacity: 1,
    pointerEvents: "none",
    zIndex: -2,
}}
    />

    {/* BLUE SKY GRADIENT OVERLAY */}
    <div
        style={{
            position: "absolute",
            inset: 0,
            background:
    "linear-gradient(90deg, #8fcaff 0%, rgba(169,215,255,0.98) 32%, rgba(190,225,255,0.88) 48%, rgba(210,235,255,0.25) 70%, rgba(255,255,255,0.02) 100%)",
            pointerEvents: "none",
            zIndex: -1,
        }}
    />

    {/* AIRCRAFT ICON */}
    <div
        style={{
            width: "52px",
            height: "52px",
            minWidth: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.85)",
            color: "#1764bd",
            fontSize: "29px",
            position: "relative",
            zIndex: 1,
        }}
    >
        {service.serviceName?.toLowerCase().includes("flight")
            ? "✈"
            : "✦"}
    </div>

    {/* HEADER TEXT */}
    <div
        style={{
            flex: 1,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "0 10px",
            textShadow: "0 1px 2px rgba(255,255,255,0.55)",
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1.5px",
                color: "#315477",
                marginBottom: "7px",
            }}
        >
            ORBITZ HOLIDAYS · NEW BOOKING
        </div>

        <h2
            style={{
                margin: 0,
                fontSize: "27px",
                fontWeight: 900,
                color: "#104b9e",
            }}
        >
            {service.serviceName}
        </h2>

        <div
            style={{
                marginTop: "8px",
                fontSize: "14px",
                color: "#315477",
                fontWeight: 500,
            }}
        >
            Select a client to continue with this booking.
        </div>
    </div>

    {/* NEW BOOKING BADGE */}
    <div
        style={{
    padding: "10px 17px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.9)",
    color: "#1453a5",
    fontSize: "12px",
    fontWeight: 900,
    whiteSpace: "nowrap",
    position: "relative",
    zIndex: 1,
    alignSelf: "flex-end",
    marginBottom: "12px",
}}
    >
        NEW BOOKING
    </div>
</div>


{savedBooking ? (
    <div
        style={{
            marginTop: "22px",
            padding: "30px",
            border: "1px solid #bbdfce",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f0faf5, #f7fbff)",
            textAlign: "center"
        }}
    >
        <div style={{ fontSize: "36px", color: "#15803d" }}>
            ✓
        </div>

        <h3 style={{ color: "#166534", margin: "8px 0" }}>
            Service Booking Saved Successfully
        </h3>

        <p style={{ color: "#64748b", fontSize: "13px" }}>
            Your {savedBooking.serviceName} booking has been saved.
        </p>

        <div style={{
            margin: "20px auto",
            padding: "15px",
            maxWidth: "420px",
            background: "#ffffff",
            border: "1px solid #dbe7f5",
            borderRadius: "9px",
            textAlign: "left",
            fontSize: "13px",
            lineHeight: 2
        }}>
            <div><strong>Client ID:</strong> {savedBooking.clientId}</div>
            <div><strong>Service Record ID:</strong> {savedBooking.serviceRecordId}</div>
        </div>

        <div style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "20px"
        }}>
            <button
                type="button"
                onClick={() => onViewSavedBooking?.()}
                style={{
                    padding: "11px 20px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: 800,
                    cursor: "pointer"
                }}
            >
                View This Booking →
            </button>

            <button
                type="button"
                onClick={() => {
                    setSavedBooking(null);
                    setBookingMode("new");
                    setSelectedClient(null);
                    setCustomerForm({
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
                    });
                    setServiceFormData({});
                    setTransactionStatus("");
                    setClientNameSearch("");
                    setMobileSearch("");
                }}
                style={{
                    padding: "11px 20px",
                    border: "1px solid #15803d",
                    borderRadius: "8px",
                    background: "#e8f6ee",
                    color: "#166534",
                    fontWeight: 800,
                    cursor: "pointer"
                }}
            >
                + Add Another Booking
            </button>
        </div>
    </div>

) : (
    <>
        {/* CLIENT SEARCH PANEL */}


{bookingMode === null && (
    <div
    style={{
        marginTop: "22px",
        padding: "20px 22px",
        background: "linear-gradient(145deg, #f8fbff, #f2f7ff)",
        border: "1px solid #d7e6fa",
        borderRadius: "12px",
    }}
>
    
{/* CLIENT PANEL HEADER */}
<div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        minHeight: "58px",
        padding: "9px 13px",
        marginBottom: "16px",
        background: "linear-gradient(105deg, #8fc5f5 0%, #b2d6f7 35%, #d2e7fb 68%, #e8f3ff 100%)",
        border: "1px solid #a9cef3",
        borderRadius: "9px",
        boxShadow: "0 3px 7px rgba(22, 77, 165, 0.10)",
        boxSizing: "border-box",
    }}
>
    <div>
        <h3
            style={{
                margin: 0,
                color: "#164da5",
                fontSize: "16px",
                fontWeight: 900,
                letterSpacing: "0.1px",
                textAlign: "left",
            }}
        >
            Select Client
        </h3>

        <p
            style={{
                margin: "3px 0 0",
                fontSize: "11px",
                fontWeight: 500,
                color: "#526b8a",
                textAlign: "left",
            }}
        >
            Search for an existing client or add a new client.
        </p>
    </div>

    <button
        type="button"
        onClick={openNewClientBooking}
        style={{
            padding: "9px 16px",
            background: "linear-gradient(135deg, #164da5, #2874c7)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(22,77,165,0.16)",
        }}
    >
       + Add New Client for This Booking
    </button>
</div>


    {/* SEARCH FIELDS */}
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
        }}
    >

            <div>
                <label
                    style={{
    display: "block",
    textAlign: "left",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#334155",
}}
                >
                    Search by Client Name
                </label>

                <input
                    type="text"
                    value={clientNameSearch}
                    onChange={(e) => setClientNameSearch(e.target.value)}
                    placeholder="Enter client name..."
                    style={{
    width: "100%",
    boxSizing: "border-box",
    height: "42px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    fontSize: "13px",
    background: "#ffffff",
    boxShadow: "0 1px 3px rgba(30,64,110,0.04)",
}}
                />
            </div>

            <div>
                <label
                    style={{
    display: "block",
    textAlign: "left",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#334155",
}}
                >
                    Search by Mobile Number
                </label>

                <input
                    type="text"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    placeholder="Enter mobile number..."
                    style={{
    width: "100%",
    boxSizing: "border-box",
    height: "42px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    fontSize: "13px",
    background: "#ffffff",
    boxShadow: "0 1px 3px rgba(30,64,110,0.04)",
}}
                />
            </div>
        </div>

       
{/* SEARCH RESULTS */}
<div style={{ marginTop: "22px" }}>

    {/* EXISTING CLIENTS HEADING */}
    <div
        style={{
            padding: "12px 16px",
            marginBottom: "12px",
            borderRadius: "9px",
            textAlign: "left",
            background:
                "linear-gradient(90deg, #164da5 0%, #367bc5 38%, #b8d9f5 75%, #f4f9ff 100%)",
            border: "1px solid #c5ddf5",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.7px",
                color: "#ffffff",
                textAlign: "left",
width: "100%",
            }}
        >
            EXISTING CLIENTS
        </div>
    </div>

    {clientsLoading ? (
        <p style={{ fontSize: "13px", color: "#64748b" }}>
            Loading clients...
        </p>
    ) : filteredClients.length > 0 ? (

       <div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
        gap: "10px",
        alignItems: "stretch",
    }}
>
            {filteredClients.map((client, index) => (
                <div
                    key={client.clientId || client.id || client._id || index}
                    style={{
    display: "flex",
justifyContent: "space-between",
alignItems: "center",
flexWrap: "wrap",
gap: "10px",
padding: "12px 14px",
minHeight: "66px",
boxSizing: "border-box",
    borderRadius: "9px",
                        border: selectedClient === client
                            ? "1px solid #86bda0"
                            : "1px solid #dbe7f5",
                        background: selectedClient === client
                            ? "#e4f5eb"
                            : index % 2 === 0
                                ? "linear-gradient(100deg, #e7f2ff, #f5f9ff)"
                                : "linear-gradient(100deg, #f0edff, #faf9ff)",
                        boxShadow: "0 1px 3px rgba(30,64,110,0.05)",
                        transition: "background 0.2s ease",
                    }}
                >
                    {/* CLIENT INFORMATION */}
                    <div>
                       
{/* CLIENT INFORMATION — SINGLE LINE */}
<div
    style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "9px",
        flex: 1,
        minWidth: 0,
    }}
>
    <span
        style={{
            fontSize: "13px",
            fontWeight: 800,
            color: "#1e3a70",
        }}
    >
        {client.clientName}
    </span>

    <span style={{ color: "#94a3b8", fontSize: "12px" }}>•</span>

    <span style={{ fontSize: "11px", color: "#64748b" }}>
        ID: {client.clientId || client.id || client._id || "—"}
    </span>

    <span style={{ color: "#94a3b8", fontSize: "12px" }}>•</span>

    <span style={{ fontSize: "12px", color: "#475569" }}>
        Mobile: {client.mobile || "—"}
    </span>
</div>

                    </div>

                    {/* SELECT CLIENT BUTTON */}
                    <button
                        type="button"
                        onClick={() => openExistingClientBooking(client)}
                        style={{
    padding: "6px 11px",
    minWidth: "96px",
    height: "30px",
    border: "none",
    borderRadius: "6px",
    background: selectedClient === client
        ? "#15803d"
        : "#164da5",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
}}
                    >
                        {selectedClient === client
                            ? "✓ Selected"
                            : "Select Client"}
                    </button>
                </div>
            ))}
        </div>

    ) : (
        <div
            style={{
                padding: "24px",
                textAlign: "center",
                background: "#f8fbff",
                border: "1px dashed #cbd5e1",
                borderRadius: "9px",
            }}
        >
            <div style={{ fontSize: "13px", color: "#64748b" }}>
                No matching clients found.
            </div>

            <div
                style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#94a3b8",
                }}
            >
                Try another name or mobile number, or add a new client.
            </div>
        </div>
    )}
</div>


        {/* SELECTED CLIENT */}
        {selectedClient && (
            <div
                style={{
                    marginTop: "18px",
                    padding: "15px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "9px",
                }}
            >
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#15803d",
                        marginBottom: "7px",
                    }}
                >
                    ✓ SELECTED CLIENT
                </div>

                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#166534",
                    }}
                >
                    {selectedClient.clientName}
                </div>

                <div
                    style={{
                        marginTop: "4px",
                        fontSize: "12px",
                        color: "#475569",
                    }}
                >
                    {selectedClient.mobile}
                </div>

                              <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    style={{
                        marginTop: "10px",
                        padding: "6px 12px",
                        background: "#ffffff",
                        border: "1px solid #bbf7d0",
                        borderRadius: "6px",
                        color: "#166534",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Change Client
                </button>
            </div>
               )}
    </div>
)}



{/* SERVICE BOOKING FORM */}
{bookingMode !== null && (
    <form
        onSubmit={handleSaveBooking}
        style={{
            marginTop: "22px",
            padding: "22px",
            background: "#f8fbff",
            border: "1px solid #d7e6fa",
            borderRadius: "12px",
        }}
    >
       
{/* PREMIUM FORM HEADER */}

<div
    style={{
        minHeight: "64px",
        padding: "10px 15px",
        marginBottom: "16px",
        borderRadius: "11px",
        background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        boxShadow: "0 3px 9px rgba(24,126,145,0.08)"
    }}
>
    <div
        style={{
            borderLeft: "3px solid rgba(255,255,255,0.95)",
            paddingLeft: "13px"
        }}
    >
        <h3
            style={{
                margin: 0,
                color: "#12345b",
                fontSize: "16px",
                fontWeight: 900
            }}
        >
            {editingRecord
    ? "Edit Service Booking"
    : bookingMode === "new"
        ? "New Client & Booking Details"
        : "Client & Booking Details"}
        </h3>

        <p
            style={{
                margin: "4px 0 0",
                color: "#385d7c",
                fontSize: "10px",
                fontWeight: 500
            }}
        >
            Complete the customer and {service.serviceName} details.
        </p>
    </div>

    <span
        style={{
            padding: "8px 13px",
            background: "rgba(255,255,255,0.88)",
            color: "#17447c",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: "22px",
            fontSize: "10px",
            fontWeight: 900,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 5px rgba(30,64,120,0.06)"
        }}
    >
        {bookingMode === "new" ? "NEW CLIENT" : "EXISTING CLIENT"}
    </span>
</div>


        {/* CUSTOMER DETAILS */}
        <div 
        style={{
    padding: "14px",
    background: "#ffffff",
    border: "1px solid #dbe7f5",
    borderRadius: "11px",
    marginBottom: "16px",
}}
        >
            {/* CUSTOMER DETAILS GRADIENT HEADER */}

<div
    style={{
        minHeight: "46px",
        padding: "7px 12px",
        marginBottom: "13px",
        borderRadius: "9px",
        background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 7px rgba(24,126,145,0.06)"
    }}
>
    <div
        style={{
            borderLeft: "3px solid rgba(255,255,255,0.95)",
            paddingLeft: "11px",
            fontSize: "13px",
            fontWeight: 900,
            color: "#12345b"
        }}
    >
        Customer Details
    </div>
</div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "11px",
alignItems: "start",
            }}>
                {[
                    { key: "clientName", label: "Client / Agency Name", required: true },
                    { key: "contactPerson", label: "Contact Person" },
                    { key: "mobile", label: "Mobile", type: "tel" },
                    { key: "email", label: "Email", type: "email" },
                    { key: "city", label: "City" },
                    { key: "source", label: "Source" },
                ].map(field => (
                    <div key={field.key}>
                        <label 
                       style={{
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#334b6b",
}}
                        >
                            {field.label}{field.required ? " *" : ""}
                        </label>
                        <input
                            type={field.type || "text"}
                            required={field.required || false}
                            value={customerForm[field.key]}
                            readOnly={bookingMode === "existing"}
                            onChange={e => setCustomerForm(prev => ({
                                ...prev,
                                [field.key]: e.target.value,
                            }))}
                            style={{
    width: "100%",
    boxSizing: "border-box",
    height: "36px",
    padding: "7px 10px",
    border: "1px solid #cbdced",
    borderRadius: "8px",
    background: bookingMode === "existing" ? "#f1f5f9" : "#ffffff",
    color: "#243b5a",
    fontSize: "12px",
    outline: "none",
}}
                        />
                    </div>
                ))}

                <div>
                    <label 
                    style={{
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#334b6b",
    textAlign: "left",
}}
                    >
                        Client Type
                    </label>
                    <select
                        value={customerForm.clientType}
                        disabled={bookingMode === "existing"}
                        onChange={e => setCustomerForm(prev => ({
                            ...prev,
                            clientType: e.target.value,
                        }))}
                        style={{
    width: "100%",
    boxSizing: "border-box",
    height: "36px",
    padding: "7px 10px",
    border: "1px solid #cbdced",
    borderRadius: "8px",
    background: bookingMode === "existing" ? "#f1f5f9" : "#ffffff",
    color: "#243b5a",
    fontSize: "12px",
}}
                    >
                        {["Individual", "Agency", "Corporate"].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label 
                    style={{
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#334b6b",
    textAlign: "left",
}}
                    >
                        Client Status
                    </label>
                    <select
                        value={customerForm.status}
                        disabled={bookingMode === "existing"}
                        onChange={e => setCustomerForm(prev => ({
                            ...prev,
                            status: e.target.value,
                        }))}
                        style={{
    width: "100%",
    boxSizing: "border-box",
    height: "36px",
    padding: "7px 10px",
    border: "1px solid #cbdced",
    borderRadius: "8px",
    background: bookingMode === "existing" ? "#f1f5f9" : "#ffffff",
    color: "#243b5a",
    fontSize: "12px",
}}
                    >
                        {["Active", "Inactive"].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            
{/* ADDRESS */}

<div
    style={{
        marginTop: "12px",
        width: "100%",
    }}
>
    <label
        style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#334b6b",
            textAlign: "left",
        }}
    >
        Address
    </label>

    <textarea
        rows={2}
        value={customerForm.address}
        readOnly={bookingMode === "existing"}
        onChange={e => setCustomerForm(prev => ({
            ...prev,
            address: e.target.value,
        }))}
        style={{
            width: "100%",
            boxSizing: "border-box",
            minHeight: "48px",
            padding: "8px 10px",
            border: "1px solid #cbdced",
            borderRadius: "8px",
            background: bookingMode === "existing" ? "#f1f5f9" : "#ffffff",
            color: "#243b5a",
            fontSize: "12px",
            resize: "vertical",
        }}
    />
</div>

{/* NOTES */}

<div
    style={{
        marginTop: "11px",
        width: "100%",
    }}
>
    <label
        style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#334b6b",
            textAlign: "left",
        }}
    >
        Notes
    </label>

    <textarea
        rows={2}
        value={customerForm.notes}
        readOnly={bookingMode === "existing"}
        onChange={e => setCustomerForm(prev => ({
            ...prev,
            notes: e.target.value,
        }))}
        style={{
            width: "100%",
            boxSizing: "border-box",
            minHeight: "48px",
            padding: "8px 10px",
            border: "1px solid #cbdced",
            borderRadius: "8px",
            background: bookingMode === "existing" ? "#f1f5f9" : "#ffffff",
            color: "#243b5a",
            fontSize: "12px",
            resize: "vertical",
        }}
    />
</div>



{/* ADMIN-CONFIGURED OPTIONAL CUSTOMER FIELDS */}

{customerDetailsFields.map(field => (
    <div
        key={field.key}
        style={{
            marginTop: "11px",
            width: "100%",
        }}
    >
        <label style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#334b6b",
            textAlign: "left",
        }}>
            {field.label}
        </label>

        <input
            type={field.type || "text"}
            value={customerForm[field.key] ?? ""}
            onChange={event => setCustomerForm(previous => ({
                ...previous,
                [field.key]: event.target.value,
            }))}
            style={{
                width: "100%",
                boxSizing: "border-box",
                height: "36px",
                padding: "7px 10px",
                border: "1px solid #cbdced",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#243b5a",
                fontSize: "12px",
            }}
        />
    </div>
))}

        </div>






        {/* SERVICE-SPECIFIC DETAILS */}
        <div 
        style={{
    padding: "14px",
    background: "#ffffff",
    border: "1px solid #dbe7f5",
    borderRadius: "11px",
    marginBottom: "16px",
}}
        >
            {/* SERVICE DETAILS GRADIENT HEADER */}

<div
    style={{
        minHeight: "46px",
        padding: "7px 12px",
        marginBottom: "13px",
        borderRadius: "9px",
        background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 7px rgba(24,126,145,0.06)"
    }}
>
    <div
        style={{
            borderLeft: "3px solid rgba(255,255,255,0.95)",
            paddingLeft: "11px",
            fontSize: "13px",
            fontWeight: 900,
            color: "#12345b"
        }}
    >
        {service.serviceName} Details
    </div>
</div>

            <div style={{
                display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "11px",
alignItems: "start",
            }}>
                {(service.formFields || [])
    .filter(field => field !== bookingStatusField)
    .map(field => (
                    <div key={field.key}>
                        <label 
                        style={{
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#334b6b",
}}
                        >
                            {field.label}{field.required ? " *" : ""}
                        </label>

                        {field.type === "dropdown" ? (
                            <select
                                required={field.required}
                                value={serviceFormData[field.key] ?? ""}
                                onChange={e => setServiceFormData(prev => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                }))}
                                style={{
    width: "100%",
    boxSizing: "border-box",
    height: "36px",
    padding: "7px 10px",
    border: "1px solid #cbdced",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#243b5a",
    fontSize: "12px",
}}
                            >
                                <option value="">Select {field.label}</option>
                                {(field.options || []).map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : field.type === "textarea" ? (
                            <textarea
                                required={field.required}
                                rows={2}
                                value={serviceFormData[field.key] ?? ""}
                                onChange={e => setServiceFormData(prev => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                }))}
                                style={{
    width: "100%",
    boxSizing: "border-box",
    minHeight: "48px",
    padding: "8px 10px",
    border: "1px solid #cbdced",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#243b5a",
    fontSize: "12px",
    resize: "vertical",
}}
                            />
                        ) : field.type === "checkbox" ? (
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                minHeight: "40px",
                                fontSize: "13px",
                            }}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(serviceFormData[field.key])}
                                    onChange={e => setServiceFormData(prev => ({
                                        ...prev,
                                        [field.key]: e.target.checked,
                                    }))}
                                />
                                {field.label}
                            </label>
                        ) : (
                            <input
                                type={
                                    ["text", "number", "date", "email", "mobile"].includes(field.type)
                                        ? (field.type === "mobile" ? "tel" : field.type)
                                        : "text"
                                }
                                required={field.required}
                                value={serviceFormData[field.key] ?? ""}
                                onChange={e => setServiceFormData(prev => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                }))}
                                style={{
    width: "100%",
    boxSizing: "border-box",
    height: "36px",
    padding: "7px 10px",
    border: "1px solid #cbdced",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#243b5a",
    fontSize: "12px",
}}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>

        
{/* BOOKING STATUS + TRANSACTION STATUS */}

<div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "18px",
        alignItems: "start"
    }}
>
    {/* BOOKING STATUS */}

    <div>
        <label
            style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "11px",
                fontWeight: 800,
                color: "#334b6b"
            }}
        >
            {bookingStatusField
                ? `${bookingStatusField.label}${bookingStatusField.required ? " *" : ""}`
                : "Booking Status"}
        </label>

        <select
            required={bookingStatusField?.required || false}
            value={
                bookingStatusField
                    ? serviceFormData[bookingStatusField.key] ?? ""
                    : ""
            }
            onChange={e => {
                if (!bookingStatusField) return;

                setServiceFormData(prev => ({
                    ...prev,
                    [bookingStatusField.key]: e.target.value
                }));
            }}
            disabled={!bookingStatusField}
            style={{
                width: "100%",
                boxSizing: "border-box",
                height: "36px",
                padding: "7px 10px",
                border: "1px solid #cbdced",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#243b5a",
                fontSize: "12px"
            }}
        >
            <option value="">
                Select Booking Status
            </option>

            {(bookingStatusField?.options || []).map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>

    {/* TRANSACTION STATUS */}

    <div>
        <label
            style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "11px",
                fontWeight: 800,
                color: "#334b6b"
            }}
        >
            Transaction Status *
        </label>

        <select
            required
            value={transactionStatus}
            onChange={e => setTransactionStatus(e.target.value)}
            style={{
                width: "100%",
                boxSizing: "border-box",
                height: "36px",
                padding: "7px 10px",
                border: "1px solid #cbdced",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#243b5a",
                fontSize: "12px"
            }}
        >
            <option value="">Select Transaction Status</option>

            {(service.statusOptions || []).map(option => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
</div>


      
{/* PREMIUM FORM ACTIONS */}

<div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        paddingTop: "13px",
        borderTop: "1px solid #e2eaf4"
    }}
>
    {/* CANCEL */}

    <button
        type="button"
       onClick={() => {
    if (editingRecord) {
        onBack?.();
        return;
    }

    setBookingMode(null);
    setSelectedClient(null);
}}
        disabled={savingBooking}
        style={{
            minWidth: "105px",
            height: "38px",
            padding: "0 17px",
            border: "1px solid #b5cce8",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #dceafa, #c8dcf3)",
            color: "#23466f",
            fontSize: "11px",
            fontWeight: 800,
            cursor: savingBooking ? "not-allowed" : "pointer",
            opacity: savingBooking ? 0.6 : 1
        }}
    >
        Cancel
    </button>

    {/* SAVE BOOKING */}

    <button
        type="submit"
        disabled={savingBooking}
        style={{
            minWidth: "145px",
            height: "38px",
            padding: "0 20px",
            border: "1px solid #0f766e",
            borderRadius: "8px",
            background: savingBooking
                ? "#94a3b8"
                : "linear-gradient(135deg, #0f9488, #08766d)",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 900,
            cursor: savingBooking ? "not-allowed" : "pointer",
            boxShadow: "0 3px 8px rgba(15,118,110,0.16)",
            opacity: savingBooking ? 0.8 : 1
        }}
    >
        {savingBooking ? "Saving Booking..." : "Save Booking  →"}
    </button>
</div>

    </form>
)}
 </>
)}


</div>
    );
}

export default ServiceBooking;