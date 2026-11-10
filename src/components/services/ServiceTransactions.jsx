



import React, { useEffect, useState } from "react";

import {
    getAllServiceRecords,
    getServiceRecordsByType,
    updateServiceRecord,
    deleteServiceRecord
} from "../../utils/clientServiceStorage";

import {
    getAllServices
} from "../../utils/serviceCatalogueStorage";


import ServiceBooking from "./ServiceBooking";




const filterLabelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#17665c"
};

const filterInputStyle = {
    width: "100%",
    height: "38px",
    padding: "0 10px",
    border: "1px solid #b9d8d0",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "12px",
    boxSizing: "border-box",
    outline: "none"
};

const tableCellStyle = {
    padding: "14px 10px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    whiteSpace: "nowrap",
    textAlign: "center",
    verticalAlign: "middle"
};



const DetailField = ({
    label,
    value,
    background = "#eff6ff"
}) => {
    const valueBackground = {
        "#e3f2ee": "#f2faf7",
        "#f0ebfa": "#faf8fe",
        "#fbf0df": "#fdf9f2"
    }[background] || "#f8fafc";

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(115px, 0.85fr) 12px minmax(0, 1.15fr)",
            alignItems: "stretch",
            gap: "7px",
            minWidth: 0
        }}>
            {/* LABEL CAPSULE */}
            <div style={{
                minHeight: "35px",
                padding: "7px 9px",
                borderRadius: "6px",
                background,
                color: "#475569",
                fontSize: "11px",
                fontWeight: 700,
                lineHeight: 1.4,
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box"
            }}>
                {label}
            </div>

            {/* COLON */}
            <span style={{
                color: "#64748b",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                :
            </span>

            {/* VALUE CAPSULE */}
            <div style={{
                minHeight: "35px",
                padding: "7px 10px",
                borderRadius: "6px",
                background: valueBackground,
                color: "#1e293b",
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1.4,
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                overflowWrap: "anywhere",
                whiteSpace: "pre-wrap",
                minWidth: 0
            }}>
                {value === undefined || value === null || value === ""
                    ? "—"
                    : String(value)}
            </div>
        </div>
    );
};



const detailLabelStyle = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 700,
    marginBottom: "5px"
};

const detailValueStyle = {
    fontSize: "13px",
    color: "#1e293b",
    fontWeight: 600,
    overflowWrap: "anywhere"
};






export default function ServiceTransactions({
    onBack,
    initialSelectedRecordId
}) {
    const [services, setServices] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedServiceType, setSelectedServiceType] = useState("all");
const [selectedStatus, setSelectedStatus] = useState("all");
const [searchTerm, setSearchTerm] = useState("");

const [selectedTransaction, setSelectedTransaction] = useState(null);

const [editingRecord, setEditingRecord] = useState(null);




    useEffect(() => {
        loadWorkspaceData();
    }, []);

    const loadWorkspaceData = async () => {
        try {
            setLoading(true);
            setError("");

            const [serviceData, transactionData] =
                await Promise.all([
                    getAllServices(),
                    getAllServiceRecords()
                ]);

            setServices(serviceData || []);

const loadedTransactions = transactionData || [];
setTransactions(loadedTransactions);

if (initialSelectedRecordId) {
    const matchingRecord = loadedTransactions.find(
        record => record.id === initialSelectedRecordId
    );

    if (matchingRecord) {
        setSelectedTransaction(matchingRecord);
    }
}

        } catch (err) {
            console.error(
                "Failed to load Service Transactions:",
                err
            );

            setError(
                "Unable to load Service Transactions. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };



    const filteredTransactions = transactions.filter(record => {
    const matchesService =
        selectedServiceType === "all" ||
        record.serviceType === selectedServiceType;

    const matchesStatus =
        selectedStatus === "all" ||
        record.transactionStatus === selectedStatus;

    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
        !search ||
        [
            record.serviceRecordId,
            record.clientId,
            record.clientName,
            record.contactPerson,
            record.mobile
        ].some(value =>
            String(value || "").toLowerCase().includes(search)
        );

    return matchesService && matchesStatus && matchesSearch;
});

const availableStatuses = [
    ...new Set(
        transactions
            .map(record => record.transactionStatus)
            .filter(Boolean)
    )
];




const getServiceHeaderImage = (serviceName = "") => {
    const name = serviceName.toLowerCase();

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
};



// EDIT EXISTING SERVICE TRANSACTION
if (editingRecord) {
    const serviceDefinition = services.find(service =>
        service.serviceKey === editingRecord.serviceKey
    ) || services.find(service =>
        service.serviceName === (
            editingRecord.serviceName || editingRecord.serviceType
        )
    );

    if (!serviceDefinition) {
        return (
            <div style={{ padding: "25px", color: "#b91c1c" }}>
                Unable to find the service configuration for this transaction.
                <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    style={{ marginLeft: "12px" }}
                >
                    Back
                </button>
            </div>
        );
    }

    return (
        <ServiceBooking
            service={serviceDefinition}
            editingRecord={editingRecord}
           onBack={() => {
    setEditingRecord(null);
    setSelectedTransaction(editingRecord);
}}
            onSaved={async () => {
                await loadWorkspaceData();
                setEditingRecord(null);
            }}
        />
    );
}





// SELECTED TRANSACTION DETAILS
if (selectedTransaction) {
    const record = selectedTransaction;

    const serviceDefinition = services.find(service =>
        service.serviceKey === record.serviceKey
    ) || services.find(service =>
        service.serviceName === (record.serviceName || record.serviceType)
    );

    const savedFormData = record.formData || {};

const configuredFields = serviceDefinition?.formFields || [];

const displayedFields = [
    ...configuredFields
];

const existingFieldKeys = new Set(
    displayedFields.map(field => field.key)
);

// Include saved fields that are not in the service configuration
Object.keys(savedFormData).forEach(key => {
    if (!existingFieldKeys.has(key)) {
        displayedFields.push({
            key,
            label: key === "bookingStatus"
                ? "Booking Status"
                : key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, char => char.toUpperCase()),
            type: "text"
        });
    }
});

// Include Booking Status if stored directly on the record
if (
    record.bookingStatus &&
    !displayedFields.some(field => field.key === "bookingStatus")
) {
    displayedFields.push({
        key: "bookingStatus",
        label: "Booking Status",
        type: "text"
    });
}


// Include Transaction Status
if (
    record.transactionStatus &&
    !displayedFields.some(field => field.key === "transactionStatus")
) {
    displayedFields.push({
        key: "transactionStatus",
        label: "Transaction Status",
        type: "text"
    });
}



    const serviceName =
        record.serviceName || record.serviceType || "Service";



        const getServiceReference = (serviceName = "", serviceRecordId = "") => {
    const name = serviceName.toLowerCase();

    let prefix = "SRV";

    if (name.includes("flight")) prefix = "FLGT";
    else if (name.includes("visa")) prefix = "VISA";
    else if (name.includes("hotel")) prefix = "HTL";
    else if (name.includes("train") || name.includes("rail")) prefix = "TRN";
    else if (name.includes("forex") || name.includes("currency")) prefix = "FRX";
    else if (name.includes("cruise")) prefix = "CRZ";
    else if (name.includes("passport")) prefix = "PPT";
    else if (name.includes("insurance")) prefix = "INS";

    const sequence = serviceRecordId.match(/(\d+)$/)?.[1] || "0000";

    return `${prefix}-${sequence}`;
};



const formatServiceDate = (value) => {
    if (!value) return "—";

    const dateString = String(value);

    // Handle YYYY-MM-DD without timezone conversion
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return dateString;
};





    return (
        <div style={{
            width: "100%",
            padding: "20px",
            boxSizing: "border-box"
        }}>

            {/* SERVICE-SPECIFIC HEADER */}
            <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "18px",
                minHeight: "150px",
                padding: "22px 28px",
                marginBottom: "22px",
                overflow: "hidden",
                background: "linear-gradient(110deg,#8ccaff,#d9edff 55%,#eff8ff)",
                border: "1px solid #8bc9ff",
                borderRadius: "13px",
                isolation: "isolate"
            }}>

                <img
                    src={getServiceHeaderImage(serviceName)}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "58%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        opacity: 1,
                        pointerEvents: "none",
                        zIndex: -2
                    }}
                />

                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg,#8fcaff 0%,rgba(169,215,255,.98) 32%,rgba(190,225,255,.88) 48%,rgba(210,235,255,.25) 70%,rgba(255,255,255,.02) 100%)",
                    pointerEvents: "none",
                    zIndex: -1
                }} />

                <div style={{
                    position: "relative",
                    zIndex: 1
                }}>
                    <div style={{
                        fontSize: "25px",
                        fontWeight: 800,
                        color: "#174c83"
                    }}>
                        {serviceName}
                    </div>

                    <div style={{
                        marginTop: "7px",
                        fontSize: "13px",
                        color: "#315b80",
                        fontWeight: 600
                    }}>
                        Service Transaction Details
                    </div>

                    <div style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#174c83"
                    }}>
                        {record.serviceRecordId}
                    </div>
                </div>
            </div>

            {/* NAVIGATION AND STATUS */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "20px"
            }}>
                <button
                    type="button"
                    onClick={() => setSelectedTransaction(null)}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        border: "1px solid #bfdbfe",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        cursor: "pointer",
                        fontWeight: 600
                    }}
                >
                    ← Back to Transactions
                </button>




                <div style={{
                    padding: "8px 15px",
                    borderRadius: "20px",
                    background: "#dcfce7",
                    color: "#166534",
                    fontSize: "12px",
                    fontWeight: 700
                }}>
                    {record.transactionStatus || "Status Not Set"}
                </div>
            </div>

            
{/* CUSTOMER DETAILS */}
<div style={{
    background: "#ffffff",
    border: "1px solid #b9ddd4",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "20px"
}}>
    <div style={{
        padding: "13px 18px",
        background: "linear-gradient(105deg,#a9d9d2,#cce8e2 55%,#eff8f5)",
        color: "#17665c",
        fontSize: "15px",
        fontWeight: 800,
        textAlign: "left"
    }}>
        Customer Details
    </div>

    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        gap: "13px 22px",
        padding: "20px",
        alignItems: "center"
    }}>
       <DetailField
    label="Client ID"
    value={record.clientId}
    background="#e3f2ee"
/>

{Object.entries({
    clientName: record.clientName || "",
    contactPerson: record.contactPerson || "",
    mobile: record.mobile || "",
    email: record.email || "",
    clientType: record.clientType || "",
    city: record.city || "",
    address: record.address || "",
    source: record.source || "",
    status: record.customerStatus || "",
    notes: record.customerNotes || "",
    ...(record.customerData || {})
})
    .filter(([key]) => key !== "clientId")
    .map(([key, value]) => {
        const labels = {
            clientName: "Customer Name",
            contactPerson: "Contact Person",
            mobile: "Mobile Number",
            email: "Email Address",
            clientType: "Client Type",
            city: "City",
            address: "Address",
            source: "Source",
            status: "Customer Status",
            notes: "Customer Notes"
        };

        const label = labels[key] || key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, char => char.toUpperCase());

        return (
            <DetailField
                key={key}
                label={label}
                value={value}
                background="#e3f2ee"
            />
        );
    })}

<DetailField
    label="Service Reference"
    value={getServiceReference(serviceName, record.serviceRecordId)}
    background="#e3f2ee"
/>
    </div>
</div>


{/* SERVICE BOOKING DETAILS */}
<div style={{
    background: "#ffffff",
    border: "1px solid #d8cef0",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "20px"
}}>
    <div style={{
        padding: "13px 18px",
        background: "linear-gradient(105deg,#c5b8e8 0%,#e0d9f2 48%,#f7f4fc 100%)",
        color: "#51417c",
        fontSize: "15px",
        fontWeight: 800,
        textAlign: "left"
    }}>
        {serviceName} Details
    </div>

    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        gap: "13px 22px",
        padding: "20px",
        alignItems: "center"
    }}>
        {displayedFields.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: "13px" }}>
                No configured booking fields found for this service.
            </div>
        ) : (
            displayedFields.map(field => {
    const value =
        savedFormData[field.key] ??
        record[field.key];

    let displayValue = value;

    if (field.type === "date") {
        displayValue = formatServiceDate(value);
    } else if (field.type === "checkbox") {
        displayValue = value === true ? "Yes" :
            value === false ? "No" : "—";
    } else if (Array.isArray(value)) {
        displayValue = value.join(", ");
    }

    return (
        <DetailField
            key={field.key}
            label={field.label}
            value={displayValue}
            background="#f0ebfa"
        />
    );
})
        )}
    </div>
</div>


{/* RECORD INFORMATION */}
<div style={{
    background: "#ffffff",
    border: "1px solid #ecd8b8",
    borderRadius: "12px",
    overflow: "hidden"
}}>
    <div style={{
        padding: "13px 18px",
        background: "linear-gradient(105deg,#e9c69b 0%,#f3dfc4 48%,#fcf7ef 100%)",
        color: "#805b2e",
        fontSize: "15px",
        fontWeight: 800,
        textAlign: "left"
    }}>
        Record Information
    </div>


    


    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        gap: "13px 22px",
        padding: "20px",
        alignItems: "center"
    }}>
        <DetailField
            label="Service Record ID"
            value={record.serviceRecordId}
            background="#fbf0df"
        />

        <DetailField
            label="Created"
            value={record.createdAt?.toDate
                ? record.createdAt.toDate().toLocaleString("en-IN")
                : "—"}
            background="#fbf0df"
        />

        <DetailField
            label="Last Updated"
            value={record.updatedAt?.toDate
                ? record.updatedAt.toDate().toLocaleString("en-IN")
                : "—"}
            background="#fbf0df"
        />
    </div>
</div>

{/* EDIT BOOKING ACTION */}
<div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "18px",
        paddingRight: "2px"
    }}
>
    <button
        type="button"
        onClick={() => {
            setEditingRecord(record);
            setSelectedTransaction(null);
        }}
        style={{
            padding: "9px 20px",
            borderRadius: "8px",
            border: "1px solid #a7d7c5",
            background: "#ecfdf5",
            color: "#047857",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "12px"
        }}
    >
        Edit Booking
    </button>
</div>



        </div>
    );
}





    return (
        <div
            style={{
                width: "100%",
                padding: "20px",
                boxSizing: "border-box"
            }}
        >
          
{/* PREMIUM ORBITZ SERVICE TRANSACTIONS BANNER */}
<div
    style={{
        position: "relative",
        width: "calc(100% + 40px)",
        minHeight: "190px",
        height: "190px",
        margin: "-20px -20px 22px",
        border: "1px solid #75bfff",
        borderRadius: "15px",
        overflow: "hidden",
        isolation: "isolate",
        background: "linear-gradient(110deg,#48b5f5,#d9f0ff 65%,#eaf7ff)"
    }}
>
    
    

    

    {/* RIGHT SIDE — SEVEN SERVICE PHOTOGRAPHS */}
    <div
        style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "59%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            gridTemplateRows: "repeat(2,minmax(0,1fr))",
            gap: "3px",
            zIndex: 0
        }}
    >
        {[
            {
                src: "hotels.webp",
                position: "center"
            },
            {
                src: "visa-services.webp",
                position: "center"
            },
            {
                src: "cruise.webp",
                position: "center"
            },
            {
                src: "train-ticket.webp",
                position: "center"
            },
            {
                src: "forex.webp",
                position: "center"
            },
            {
                src: "passport-services.webp",
                position: "center"
            },
            {
                src: "travel-insurance.webp",
                position: "center"
            }
        ].map((item, index) => {
            const positions = [
                { gridColumn: "1 / 2", gridRow: "1 / 2" },
                { gridColumn: "2 / 3", gridRow: "1 / 2" },
                { gridColumn: "3 / 5", gridRow: "1 / 2" },
                { gridColumn: "1 / 2", gridRow: "2 / 3" },
                { gridColumn: "2 / 3", gridRow: "2 / 3" },
                { gridColumn: "3 / 4", gridRow: "2 / 3" },
                { gridColumn: "4 / 5", gridRow: "2 / 3" }
            ];

            return (
                <div
                    key={item.src}
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        ...positions[index]
                    }}
                >
                    <img
                        src={`/images/services/webp/${item.src}`}
                        alt=""
                        aria-hidden="true"
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            objectFit: "cover",
                            objectPosition: item.position,
                            transform: "scale(1.02)"
                        }}
                    />

                    {/* DIAGONAL TILE SEPARATOR */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderLeft: "2px solid rgba(255,255,255,0.85)",
                            pointerEvents: "none"
                        }}
                    />
                </div>
            );
        })}
    </div>

   

    {/* GLOBE-INSPIRED LOWER LEFT ACCENT */}
    <div
        style={{
            position: "absolute",
            left: "-55px",
            bottom: "-105px",
            width: "260px",
            height: "155px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center,rgba(0,111,202,0.30),rgba(0,139,219,0.08) 65%,transparent 72%)",
            zIndex: 1,
            pointerEvents: "none"
        }}
    />


    {/* FULL-WIDTH AIRPLANE BACKGROUND BEHIND HEADER TEXT */}
<img
    src="/images/services/webp/flights.webp"
    alt=""
    aria-hidden="true"
    style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "43%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        opacity: 0.62,
        zIndex: 1,
        pointerEvents: "none",
        mixBlendMode: "multiply"
    }}
/>


{/* SOFT BLUE OVERLAY OVER AIRPLANE IMAGE */}
<div
    style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "43%",
        height: "100%",
        background: `
    linear-gradient(
        90deg,
        rgba(190,230,255,0.78) 0%,
        rgba(190,230,255,0.66) 48%,
        rgba(190,230,255,0.38) 82%,
        rgba(190,230,255,0.08) 100%
    )
`,
        zIndex: 2,
        pointerEvents: "none"
    }}
/>




    {/* GOLD TITLE ACCENT */}
    <div
        style={{
            position: "absolute",
            left: "26px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "6px",
            height: "55px",
            borderRadius: "4px",
            background: "#f5b400",
            zIndex: 3
        }}
    />

    {/* TITLE AND SUBTITLE */}
    <div
        style={{
            position: "relative",
            zIndex: 3,
            width: "34%",
            minHeight: "190px",
            padding: "20px 30px 20px 48px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            textAlign: "left"
        }}
    >
        <h2
            style={{
                margin: 0,
                fontSize: "28px",
                lineHeight: 1.2,
                fontWeight: 900,
                color: "#07519a",
                letterSpacing: "-0.6px"
            }}
        >
            Service Transactions
        </h2>

        <p
            style={{
    margin: "11px 0 0",
    fontSize: "14px",
    lineHeight: 1.5,
    fontWeight: 750,
    color: "#123e65",
    textShadow: "0 1px 2px rgba(255,255,255,0.75)"
}}
        >
            Manage and track all direct service bookings.
        </p>
    </div>
</div>



            {loading ? (
                <p style={{ color: "#64748b" }}>
                    Loading service transactions...
                </p>
            ) : error ? (
                <div style={{ color: "#b91c1c" }}>
                    {error}
                    <button
                        type="button"
                        onClick={loadWorkspaceData}
                        style={{ marginLeft: "10px" }}
                    >
                        Retry
                    </button>
                </div>
          
                             ) : (
                <>
<div
    style={{
        background: "linear-gradient(105deg,#edf8ff 0%,#f0faf8 55%,#f7faff 100%)",
        border: "1px solid #c8e3f2",
        borderRadius: "12px",
        padding: "10px 16px",
        boxSizing: "border-box"
    }}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            minHeight: "34px"
        }}
    >
        {/* TOTAL TRANSACTIONS */}
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px"
        }}>
            <span style={{
                padding: "6px 12px",
                borderRadius: "7px",
                background: "linear-gradient(110deg,#d8eaff,#e9f3ff)",
                border: "1px solid #c3dcfa",
                color: "#24558b",
                fontSize: "11px",
                fontWeight: 800,
                whiteSpace: "nowrap"
            }}>
                Total Transactions
            </span>

            <span style={{
                color: "#64748b",
                fontWeight: 800
            }}>
                :
            </span>

            <strong style={{
                fontSize: "19px",
                color: "#1e40af",
                lineHeight: 1
            }}>
                {transactions.length}
            </strong>
        </div>

        {/* ACTIVE SERVICES */}
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px"
        }}>
            <span style={{
                padding: "6px 12px",
                borderRadius: "7px",
                background: "linear-gradient(110deg,#d9f2eb,#eaf8f3)",
                border: "1px solid #bce3d6",
                color: "#176b5c",
                fontSize: "11px",
                fontWeight: 800,
                whiteSpace: "nowrap"
            }}>
                Active Services
            </span>

            <span style={{
                color: "#64748b",
                fontWeight: 800
            }}>
                :
            </span>

            <strong style={{
                fontSize: "19px",
                color: "#0f766e",
                lineHeight: 1
            }}>
                {services.filter(service => service.isActive).length}
            </strong>
        </div>
    </div>

    <hr
        style={{
            border: 0,
            borderTop: "1px solid #d6e7ee",
            margin: "10px 0"
        }}
    />
</div>


                    <div style={{ marginTop: "4px" }}>

    {/* FILTER PANEL */}
    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
        padding: "16px",
        border: "1px solid #b9ddd4",
        borderRadius: "12px",
        background: "linear-gradient(105deg,#a9d9d2 0%,#cce8e2 45%,#eff8f5 100%)"
    }}>

        <div>
            <label style={filterLabelStyle}>Service</label>
            <select
                value={selectedServiceType}
                onChange={e => setSelectedServiceType(e.target.value)}
                style={filterInputStyle}
            >
                <option value="all">All Services</option>
                {services.map(service => (
                    <option
                        key={service.id}
                        value={service.serviceName}
                    >
                        {service.serviceName}
                    </option>
                ))}
            </select>
        </div>

        <div>
            <label style={filterLabelStyle}>Transaction Status</label>
            <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={filterInputStyle}
            >
                <option value="all">All Statuses</option>
                {availableStatuses.map(status => (
                    <option key={status} value={status}>
                        {status}
                    </option>
                ))}
            </select>
        </div>

        <div>
            <label style={filterLabelStyle}>Search Transactions</label>
            <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Record ID, Client ID, name, mobile..."
                style={filterInputStyle}
            />
        </div>

    </div>

    {/* TRANSACTION COUNT */}
    <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "12px"
    }}>
        <strong style={{ fontSize: "14px", color: "#334155" }}>
            Transaction Records ({filteredTransactions.length})
        </strong>

        <button
            type="button"
            onClick={() => {
                setSelectedServiceType("all");
                setSelectedStatus("all");
                setSearchTerm("");
            }}
            style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px"
            }}
        >
            Clear Filters
        </button>
    </div>

    {/* TRANSACTION TABLE */}
    <div style={{
    width: "100%",
    overflowX: "hidden",
    border: "1px solid #dbe5f0",
    borderRadius: "10px",
    boxSizing: "border-box"
}}>
        <table style={{
           width: "100%",
minWidth: "0",
tableLayout: "fixed",
borderCollapse: "collapse",
fontSize: "12px"
        }}>

            <colgroup>
    <col style={{ width: "15%" }} />
    <col style={{ width: "12%" }} />
    <col style={{ width: "18%" }} />
    <col style={{ width: "12%" }} />
    <col style={{ width: "9%" }} />
    <col style={{ width: "13%" }} />
    <col style={{ width: "9%" }} />
    <col style={{ width: "12%" }} />
</colgroup>


           <thead>
    <tr style={{
        background: "#dbeafe",
        color: "#1e3a8a",
        textAlign: "center"
    }}>
                   {[
    "Service Record ID",
    "Client ID",
    "Customer",
    "Service",
    "Mobile",
    "Transaction Status",
    "Created",
    "Action"
].map(heading => (
                        <th key={heading} 
                        style={{
    padding: "14px 10px",
    borderBottom: "1px solid #bfdbfe",
    whiteSpace: "nowrap",
    textAlign: "center",
    verticalAlign: "middle"
}}
                        >
                            {heading}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {filteredTransactions.length === 0 ? (
                    <tr>
                        <td
                            colSpan={8}
                            style={{
                                padding: "28px",
                                textAlign: "center",
                                color: "#64748b"
                            }}
                        >
                            No matching transactions found.
                        </td>
                    </tr>
                ) : (
                    filteredTransactions.map((record, index) => (
                        <tr
                            key={record.id}
                            style={{
                                background: index % 2 === 0
                                    ? "#ffffff"
                                    : "#f0f7ff"
                            }}
                        >
                            <td style={tableCellStyle}>
                                <strong>{record.serviceRecordId || "—"}</strong>
                            </td>

                            <td style={tableCellStyle}>
                                {record.clientId || "—"}
                            </td>

                            <td style={tableCellStyle}>
                                {record.clientName || record.contactPerson || "—"}
                            </td>

                            <td style={tableCellStyle}>
                                {record.serviceName || record.serviceType || "—"}
                            </td>

                            <td style={tableCellStyle}>
                                {record.mobile || "—"}
                            </td>

                            <td style={tableCellStyle}>
                                {record.transactionStatus || "—"}
                            </td>

                            <td style={tableCellStyle}>
                                {record.createdAt?.toDate
                                    ? record.createdAt.toDate().toLocaleDateString("en-IN")
                                    : "—"}
                            </td>

                            <td style={{
    ...tableCellStyle,
    textAlign: "right",
    paddingRight: "16px",
    whiteSpace: "nowrap"
}}>
    <button
        type="button"
        onClick={() => setSelectedTransaction(record)}
        style={{
            padding: "6px 14px",
            border: "1px solid #93c5fd",
            borderRadius: "7px",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer"
        }}
    >
        View
    </button>

    <button
    type="button"
    onClick={async () => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this service transaction?\n\n" +
            "Service Record ID: " + record.serviceRecordId +
            "\nCustomer: " + (record.clientName || "—") +
            "\n\nThe linked Client Master record will NOT be deleted."
        );

        if (!confirmed) return;

        try {
            await deleteServiceRecord(record.id);
            await loadWorkspaceData();

            alert("Service transaction deleted successfully.");
        } catch (error) {
            console.error("Failed to delete service transaction:", error);

            alert(
                "Unable to delete the service transaction.\n\n" +
                (error.message || "Please try again.")
            );
        }
    }}
    style={{
        marginLeft: "7px",
        padding: "6px 14px",
        border: "1px solid #fca5a5",
        borderRadius: "7px",
        background: "#fef2f2",
        color: "#b91c1c",
        fontSize: "11px",
        fontWeight: 700,
        cursor: "pointer"
    }}
>
    Delete
</button>


</td>


                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>

</div>
                </>
            )}
        </div>
    );
}
