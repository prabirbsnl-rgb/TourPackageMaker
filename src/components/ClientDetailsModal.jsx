


import React, {
    useEffect,
    useState
} from "react";

import {
    generateQuotationPdf
} from "../pdf/generateQuotationPdf";



export default function ClientDetailsModal({
    client,
    leads = [],
    serviceRecords = [],
    quotations = [],
    onClose,
    onEdit,
    onDelete,
    onCreateLead,
    onOpenLead,
    showDelete = false
}) {

        const [previewQuotation, setPreviewQuotation] =
        useState(null);

    const [previewPdfUrl, setPreviewPdfUrl] =
        useState(null);

    const [previewLoading, setPreviewLoading] =
        useState(false);


        const [expandedQuotationNo, setExpandedQuotationNo] =
    useState(null);



            async function handlePreviewQuotation(
        quotation
    ) {
        if (!quotation) {
            return;
        }


       
setPreviewQuotation(quotation);
        setPreviewLoading(true);

        try {
         const quoteData = {
    ...(quotation.commonData || {}),
    ...(quotation.packageData || {}),
    ...(quotation.itineraryData || {}),
    savedAt: quotation.savedAt
};

const pdfBlob =
    await generateQuotationPdf({
        ...quoteData,

        hotelUsedEnabled:
            quotation.commonData?.hotelUsedEnabled,

        hotelUsed:
            quotation.commonData?.hotelUsed,

        pdfTheme:
            quotation.commonData?.pdfTheme,

        mode: "preview"
    });

            const pdfUrl =
                URL.createObjectURL(pdfBlob);

            setPreviewPdfUrl(pdfUrl);
        } catch (error) {
            console.error(
                "Failed to generate quotation preview:",
                error
            );

            alert(
                "Unable to generate quotation preview. Please try again."
            );

            setPreviewQuotation(null);
        } finally {
            setPreviewLoading(false);
        }
    }


        useEffect(() => {
        return () => {
            if (previewPdfUrl) {
                URL.revokeObjectURL(
                    previewPdfUrl
                );
            }
        };
    }, [previewPdfUrl]);


    const serviceAssociations = [
    ...(leads.length > 0 ? ["Travel Package"] : []),
    ...new Set(
        serviceRecords.map(record => record.serviceType)
    )
];


const transactionHistory = [
    ...leads.map(lead => ({
        id: lead.id,
        recordId: lead.leadId || "—",
        serviceType: "Travel Package",
        recordDate: lead.createdAt || null,
        description:
            lead.leadTitle ||
            lead.destination ||
            "Travel Package",
        source: "lead",
        originalRecord: lead
    })),

    ...serviceRecords.map(record => ({
        id: record.id,
        recordId: record.serviceRecordId || "—",
        serviceType: record.serviceType,
        recordDate: record.serviceDate || record.createdAt || null,
        description:
            record.serviceDetails
                ? Object.entries(record.serviceDetails)
                    .filter(([, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                    )
                    .map(([key, value]) => `${key}: ${value}`)
                    .slice(0, 3)
                    .join(" | ")
                : "Service transaction",
        source: "service",
        originalRecord: record
    }))
];



    if (!client) {
        return null;
    }

    return (
    <>
        <div
            style={{
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1100
}}
            onClick={onClose}
        >
            <div
                style={{
    width: "100%",
    maxWidth: "1450px",
    height: "90vh",
    maxHeight: "90vh",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
}}
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER */}
                <div
                    style={{
                        padding: "17px 22px",
                        borderBottom:
                            "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                       backgroundImage:
    "linear-gradient(90deg, rgba(4,35,91,0.78), rgba(4,65,135,0.12)), url('/images/client-details/client-details-header.jpg')",
backgroundSize: "100% 100%",
backgroundPosition: "center center",
backgroundRepeat: "no-repeat",
minHeight: "76px"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px"
                        }}
                    >
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "11px",
                                background: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "21px"
                            }}
                        >
                            👤
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 800,
                                    color: "#ffffff"
                                }}
                            >
                                Client Details
                            </div>

                            <div
                                style={{
                                    marginTop: "2px",
                                    fontSize: "11px",
                                    color: "#e2efff"
                                }}
                            >
                                🆔{" "}
                                {client.clientId ||
                                    "—"}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        {onEdit && (
                            <button
                                type="button"
                                onClick={() =>
                                    onEdit(client)
                                }
                                style={{
                                    border: "none",
                                    borderRadius: "7px",
                                    background:
                                        "#0f766e",
                                    color: "#fff",
                                    padding:
                                        "8px 13px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor:
                                        "pointer"
                                }}
                            >
                                ✏️ Edit
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: "34px",
                                height: "34px",
                                border:
                                    "1px solid #dbe3ea",
                                borderRadius: "8px",
                                background:
                                    "#ffffff",
                                color: "#475569",
                                fontSize: "19px",
                                cursor: "pointer"
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div
                    style={{
                        padding: "22px",
                        overflowY: "auto"
                    }}
                >
                    
{/* PREMIUM CLIENT IDENTITY */}

<div
    style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    padding: "10px 14px",
    marginBottom: "20px",
    background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
    border: "1px solid #d5e3f5",
    borderRadius: "13px",
    boxShadow: "0 3px 9px rgba(24, 126, 145, 0.08)"
}}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: 0
        }}
    >
        <div
            style={{
                width: "48px",
                height: "48px",
                flexShrink: 0,
                borderRadius: "13px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#087e75",
                fontSize: "21px",
                boxShadow: "0 4px 10px rgba(30, 78, 150, 0.18)"
            }}
        >
            👤
        </div>

        <div style={{ minWidth: 0 }}>
            <div
                style={{
                    fontSize: "19px",
                    fontWeight: 900,
                    color: "#12345b",
                    lineHeight: 1.35,
                    wordBreak: "break-word"
                }}
            >
                {client.clientName || "—"}
            </div>

            <div
                style={{
                    marginTop: "5px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#385d7c"
                }}
            >
                {client.clientType || "Client"} Profile
            </div>
        </div>
    </div>

    <div
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 14px",
            borderRadius: "30px",
            background:
                client.status === "Inactive"
                    ? "#f1f5f9"
                    : "#e5f8ef",
            border:
                client.status === "Inactive"
                    ? "1px solid #dbe3ec"
                    : "1px solid #b7e8cc",
            color:
                client.status === "Inactive"
                    ? "#64748b"
                    : "#15803d",
            fontSize: "11px",
            fontWeight: 900,
            whiteSpace: "nowrap"
        }}
    >
        <span
            style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background:
                    client.status === "Inactive"
                        ? "#94a3b8"
                        : "#16a34a"
            }}
        />

        {client.status === "Inactive" ? "Inactive" : "Active"}
    </div>
</div>



                   {/* PREMIUM SERVICE ASSOCIATIONS */}

{(() => {
   
const serviceMeta = [
    {
       name: "Travel Package",
icon: "🌍",
image: "/images/client-details/travel-package.jpg"
    },
    {
        name: "Flight Ticket",
        icon: "✈️",
        image: "/images/client-details/service-flight-ticket.jpg"
    },
    {
        name: "Visa Services",
        icon: "🛂",
        image: "/images/client-details/visa-services.jpg"
    },
    {
        name: "Hotel Services",
        icon: "🏨",
        image: "/images/client-details/hotel-services.jpg"
    },
    {
        name: "Train Ticket",
        icon: "🚆",
        image: "/images/client-details/train-ticket.jpg"
    },
    {
        name: "Forex",
        icon: "💱",
        image: "/images/client-details/forex-currency-exchange.jpg"
    },
    {
        name: "Cruise Services",
        icon: "🚢",
        image: "/images/client-details/cruise-services.jpg"
    },
    {
        name: "Passport Services",
        icon: "🛃",
        image: "/images/client-details/passport-services.jpg"
    },
    {
        name: "Travel Insurance",
        icon: "🛡️",
        image: "/images/client-details/travel-insurance.jpg"
    }
];


    const associatedServices = serviceMeta
        .map(service => {
            const records = service.name === "Travel Package"
                ? leads
                : serviceRecords.filter(record =>
                    record.serviceType === service.name ||
                    (
                        service.name === "Forex" &&
                        record.serviceType === "Forex / Currency Exchange"
                    )
                );

            return {
                ...service,
                records,
                count: records.length
            };
        })
        .filter(service => service.count > 0);

    return (
        <div style={{
            background: "linear-gradient(135deg, #f8fbff, #eef5ff)",
            border: "1px solid #d5e3f5",
            borderRadius: "13px",
            padding: "18px 20px",
            marginBottom: "20px"
        }}>
            {/* SERVICE ASSOCIATIONS GRADIENT HEADER */}

<div
    style={{
        minHeight: "60px",
        padding: "8px 14px",
        marginBottom: "12px",
        borderRadius: "11px",
        background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 3px 9px rgba(24,126,145,0.08)"
    }}
>
    <div
        style={{
            width: "36px",
            height: "36px",
            flexShrink: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "19px",
            color: "#087e75"
        }}
    >
        ◈
    </div>

    <div
        style={{
            borderLeft: "2px solid rgba(255,255,255,0.9)",
            paddingLeft: "13px"
        }}
    >
        <div
            style={{
                fontSize: "14px",
                fontWeight: 900,
                color: "#12345b"
            }}
        >
            Service Associations
        </div>

        <div
            style={{
                fontSize: "10px",
                color: "#385d7c",
                marginTop: "3px"
            }}
        >
            Services linked to this client
        </div>
    </div>
</div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(245px, 1fr))",
                gap: "12px"
            }}>
                {associatedServices.map(service => (
                    <div
                        key={service.name}
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px",
                            background: "#ffffff",
                            border: "1px solid #9de7d3",
                            borderRadius: "11px",
                            boxShadow: "0 3px 10px rgba(15, 118, 110, 0.07)"
                        }}
                    >
                        <div style={{
                            width: "76px",
                            height: "62px",
                            flexShrink: 0,
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "30px"
                        }}>
                            {service.image ? (
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : service.icon}
                        </div>

                        <div style={{ minWidth: 0 }}>
                            <div style={{
                                fontSize: "12px",
                                fontWeight: 800,
                                color: "#142d50"
                            }}>
                                {service.name}
                            </div>

                            <div style={{
                                fontSize: "11px",
                                color: "#0f766e",
                                marginTop: "5px",
                                fontWeight: 700
                            }}>
                                {service.count} {service.count === 1 ? "Record" : "Records"}
                            </div>
                        </div>

                        <div style={{
                            position: "absolute",
                            top: "7px",
                            right: "7px",
                            width: "21px",
                            height: "21px",
                            borderRadius: "50%",
                            background: "#10b981",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 900
                        }}>
                            ✓
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
})()}


                    

{/* CUSTOMER INFORMATION — UNIFIED COMPACT PANEL */}

<div
    style={{
        padding: "20px",
marginBottom: "20px",
background: "linear-gradient(145deg, #ffffff, #f5f9ff)",
border: "1px solid #d7e4f5",
borderRadius: "14px",
boxShadow: "0 4px 16px rgba(30, 64, 120, 0.05)"
    }}
>

    {/* CLIENT INFORMATION GRADIENT HEADER */}

<div
    style={{
        minHeight: "60px",
        padding: "8px 14px",
        marginBottom: "15px",
        borderRadius: "11px",
        background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 3px 9px rgba(24,126,145,0.08)"
    }}
>
    <div
        style={{
            width: "36px",
            height: "36px",
            flexShrink: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "19px",
            color: "#087e75"
        }}
    >
        👤
    </div>

    <div
        style={{
            borderLeft: "2px solid rgba(255,255,255,0.9)",
            paddingLeft: "13px"
        }}
    >
        <div
            style={{
                fontSize: "14px",
                fontWeight: 900,
                color: "#12345b"
            }}
        >
            Client Information
        </div>

        <div
            style={{
                fontSize: "10px",
                color: "#385d7c",
                marginTop: "3px"
            }}
        >
            Customer contact and profile details
        </div>
    </div>
</div>


    {/* CUSTOMER DETAILS — HORIZONTAL ROW */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
alignItems: "stretch",
gap: "10px",
paddingBottom: "18px"
        }}
    >
        {[
            ["📞", "Mobile", client.mobile],
            ["✉️", "Email", client.email],
            ["🏷️", "Client Type", client.clientType],
            ["📍", "City", client.city],
            ["🗃️", "Source", client.source],
            ["👤", "Contact Person", client.contactPerson]
        ].map(([icon, label, value], index) => (
            <div
                key={label}
                style={{
                    minWidth: 0,
padding: "13px 10px",
border: "1px solid #e0e9f5",
borderRadius: "10px",
background: "#ffffff",
boxShadow: "0 2px 7px rgba(30, 64, 120, 0.035)"
                }}
            >
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        marginBottom: "8px"
                    }}
                >
                    {icon} {label}
                </div>

                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#172033",
                        wordBreak: "break-word"
                    }}
                >
                    {value || "—"}
                </div>
            </div>
        ))}
    </div>

    {/* PREMIUM ADDRESS AND NOTES */}

<div style={{
    borderTop: "1px solid #e0e9f5",
    paddingTop: "16px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px"
}}>
    <div style={{
        padding: "15px",
        border: "1px solid #e0e9f5",
        borderRadius: "10px",
        background: "#ffffff",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start"
    }}>
        <div style={{ fontSize: "21px" }}>🏠</div>

        <div>
            <div style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#526b8c",
                marginBottom: "7px"
            }}>
                Address
            </div>

            <div style={{
                fontSize: "12px",
                color: "#243b5b",
                lineHeight: 1.6,
                wordBreak: "break-word"
            }}>
                {client.address || "No address added"}
            </div>
        </div>
    </div>

    <div style={{
        padding: "15px",
        border: "1px solid #e0e9f5",
        borderRadius: "10px",
        background: "#ffffff",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start"
    }}>
        <div style={{ fontSize: "21px" }}>📝</div>

        <div>
            <div style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#526b8c",
                marginBottom: "7px"
            }}>
                Notes
            </div>

            <div style={{
                fontSize: "12px",
                color: "#243b5b",
                lineHeight: 1.6,
                wordBreak: "break-word"
            }}>
                {client.notes || "No notes added"}
            </div>
        </div>
    </div>
</div>
</div>




{/* PREMIUM SERVICE & TRANSACTION HISTORY */}

{(() => {
    
const serviceMeta = [
    {
        name: "Flight Ticket",
        aliases: ["Flight Ticket"],
        icon: "✈️",
        image: "/images/client-details/service-flight-ticket-large.jpg"
    },
    {
        name: "Visa Services",
        aliases: ["Visa Services"],
        icon: "🛂",
        image: "/images/client-details/visa-services.jpg"
    },
    {
        name: "Hotel Services",
        aliases: ["Hotel Services"],
        icon: "🏨",
        image: "/images/client-details/hotel-services.jpg"
    },
    {
        name: "Train Ticket",
        aliases: ["Train Ticket"],
        icon: "🚆",
        image: "/images/client-details/train-ticket.jpg"
    },
    {
        name: "Forex / Currency Exchange",
        aliases: ["Forex", "Forex / Currency Exchange"],
        icon: "💱",
        image: "/images/client-details/forex-currency-exchange.jpg"
    },
    {
        name: "Cruise Services",
        aliases: ["Cruise Services"],
        icon: "🚢",
        image: "/images/client-details/cruise-services.jpg"
    },
    {
        name: "Passport Services",
        aliases: ["Passport Services"],
        icon: "🛃",
        image: "/images/client-details/passport-services.jpg"
    },
    {
        name: "Travel Insurance",
        aliases: ["Travel Insurance"],
        icon: "🛡️",
        image: "/images/client-details/travel-insurance.jpg"
    }
];


    const directServices = serviceMeta
        .map(service => ({
            ...service,
            records: serviceRecords.filter(record =>
                service.aliases.includes(record.serviceType)
            )
        }))
        .filter(service => service.records.length > 0);

    const formatDate = value => {
        if (!value) return "—";

        const date = typeof value.toDate === "function"
            ? value.toDate()
            : new Date(value);

        return Number.isNaN(date.getTime())
            ? "—"
            : date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
    };

    const getRecordDetails = record => {
    const data = record.formData || record.serviceDetails || {};

    const excludedKeys = [
        "id",
        "clientId",
        "clientDocId",
        "clientName",
        "serviceType",
        "serviceKey",
        "serviceName",
        "serviceRecordId",
        "transactionStatus",
        "createdAt",
        "updatedAt",
        "formData"
    ];

    const labelMap = {
        airline: "Airline",
        pnr_booking_reference: "PNR",
        ticket_number: "Ticket Number",
        journey_from: "From",
        journey_to: "To",
        departure_date: "Departure",
        return_date: "Return",
        passenger_count: "Passengers",
        booking_status: "Booking Status"
    };

    const entries = Object.entries(data)
        .filter(([key, value]) =>
            !excludedKeys.includes(key) &&
            value !== null &&
            value !== undefined &&
            value !== ""
        );

    const priority = [
        "airline",
        "pnr_booking_reference",
        "journey_from",
        "journey_to",
        "departure_date",
        "return_date",
        "passenger_count",
        "booking_status"
    ];

    entries.sort(([a], [b]) => {
        const aIndex = priority.indexOf(a);
        const bIndex = priority.indexOf(b);

        return (aIndex === -1 ? 999 : aIndex) -
               (bIndex === -1 ? 999 : bIndex);
    });

    return entries
        .slice(0, 4)
        .map(([key, value]) => {
            const label = labelMap[key] ||
                key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, char => char.toUpperCase());

            return `${label}: ${value}`;
        })
        .join(" • ") || "Service transaction";
};




    return (
        <div style={{
            border: "1px solid #d7e3f5",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "20px",
            background: "linear-gradient(145deg, #ffffff, #f8fbff)"
        }}>

            {/* SERVICE HISTORY GRADIENT HEADER */}

<div
    style={{
        minHeight: "60px",
        padding: "8px 14px",
        marginBottom: "12px",
        borderRadius: "11px",
        background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        boxShadow: "0 3px 9px rgba(24,126,145,0.08)"
    }}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
        }}
    >
        <div
            style={{
                width: "36px",
                height: "36px",
                flexShrink: 0,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#087e75",
                fontSize: "21px"
            }}
        >
            ◷
        </div>

        <div
            style={{
                borderLeft: "2px solid rgba(255,255,255,0.9)",
                paddingLeft: "13px"
            }}
        >
            <div
                style={{
                    fontSize: "14px",
                    fontWeight: 900,
                    color: "#12345b"
                }}
            >
                Service & Transaction History
            </div>

            <div
                style={{
                    fontSize: "10px",
                    color: "#385d7c",
                    marginTop: "3px"
                }}
            >
                Direct service transactions and records
            </div>
        </div>
    </div>

    <div
        style={{
            padding: "8px 12px",
            borderRadius: "22px",
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.9)",
            color: "#17447c",
            fontSize: "10px",
            fontWeight: 900,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 5px rgba(30,64,120,0.06)"
        }}
    >
        Total Records: {transactionHistory.length}
    </div>
</div>



            
{/* TRAVEL PACKAGE */}

{leads.length > 0 && (
    <div
        style={{
            display: "grid",
           gridTemplateColumns: "270px minmax(0, 1fr)",
            marginBottom: "18px",
            border: "1px solid #d8e4f4",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#ffffff"
        }}
    >
        {/* TRAVEL PACKAGE IMAGE PANEL */}

        <div
            style={{
                padding: "12px",
                background: "linear-gradient(135deg, #edf4ff, #ffffff)",
                borderRight: "1px solid #d8e4f4",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0
            }}
        >
            <div
                style={{
                    width: "105px",
                    height: "112px",
                    flexShrink: 0,
                    borderRadius: "9px",
                    overflow: "hidden"
                }}
            >
                <img
                    src="/images/client-details/travel-package.jpg"
                    alt="Travel Package"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                />
            </div>

            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 900,
                        color: "#17345f",
                        lineHeight: 1.4
                    }}
                >
                    Travel Package
                </div>

                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        marginTop: "10px",
                        padding: "6px 9px",
                        borderRadius: "8px",
                        background: "#d9fbf2",
                        border: "1px solid #a8efdf",
                        color: "#087f72",
                        fontSize: "10px",
                        fontWeight: 900
                    }}
                >
                    ◈ {leads.length} Records
                </div>
            </div>
        </div>

        {/* TRAVEL PACKAGE LEAD TABLE */}

        <div
            style={{
                minWidth: 0,
                padding: "12px",
                overflowX: "auto"
            }}
        >
            <div
                style={{
                    minWidth: "470px",
                    border: "1px solid #dce6f4",
                    borderRadius: "9px",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.1fr 1.4fr 1fr",
                        gap: "9px",
                        padding: "11px 12px",
                        background: "linear-gradient(90deg, #e8f0ff, #f4f7ff)",
                        color: "#29446f",
                        fontSize: "9px",
                        fontWeight: 900
                    }}
                >
                    <div>Lead ID</div>
                    <div>Destination / Requirement</div>
                    <div>Created Date</div>
                </div>

                {leads.map(lead => (
                    <div
                        key={lead.id || lead.leadId}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.1fr 1.4fr 1fr",
                            gap: "9px",
                            alignItems: "center",
                            padding: "18px 12px",
                            borderTop: "1px solid #e8eef7",
                            fontSize: "10px"
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 900,
                                color: "#07816f",
                                wordBreak: "break-word"
                            }}
                        >
                            {lead.leadId || "—"}
                        </div>

                        <div
                            style={{
                                color: "#334968",
                                fontWeight: 700,
                                wordBreak: "break-word"
                            }}
                        >
                            {lead.destination ||
                                lead.leadTitle ||
                                lead.requirement ||
                                "Travel Package"}
                        </div>

                        <div style={{ color: "#64748b" }}>
                            {formatDate(lead.createdAt)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)}


            {/* DIRECT SERVICES */}

            {directServices.length > 0 && (
                <>
                    <div style={{
                        fontSize: "13px",
                        fontWeight: 900,
                        color: "#173b78",
                        marginBottom: "12px"
                    }}>
                        Direct Services
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "13px"
                    }}>
                        {directServices.map(service => (
                            <div
                                key={service.name}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "230px minmax(0, 1fr)",
                                    border: "1px solid #d8e4f4",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    background: "#ffffff"
                                }}
                            >
                                {/* SERVICE IMAGE PANEL */}

                                <div style={{
                                    padding: "12px",
                                    background: "linear-gradient(135deg, #edf4ff, #ffffff)",
                                    borderRight: "1px solid #d8e4f4",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    minWidth: 0
                                }}>
                                    <div style={{
                                        width: "105px",
                                        height: "112px",
                                        flexShrink: 0,
                                        borderRadius: "9px",
                                        overflow: "hidden",
                                        background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "34px"
                                    }}>
                                        {service.image ? (
                                            <img
                                                src={service.image}
                                                alt={service.name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : service.icon}
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: "12px",
                                            fontWeight: 900,
                                            color: "#17345f",
                                            lineHeight: 1.4
                                        }}>
                                            {service.name}
                                        </div>

                                        <div style={{
                                            fontSize: "10px",
                                            color: "#647b9d",
                                            marginTop: "5px"
                                        }}>
                                            Direct Service
                                        </div>

                                        <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            marginTop: "10px",
                                            padding: "6px 9px",
                                            borderRadius: "8px",
                                            background: "#d9fbf2",
                                            border: "1px solid #a8efdf",
                                            color: "#087f72",
                                            fontSize: "10px",
                                            fontWeight: 900
                                        }}>
                                            ◈ {service.records.length} Records
                                        </div>
                                    </div>
                                </div>

                                {/* TRANSACTION TABLE */}

                                <div style={{
                                    minWidth: 0,
                                    padding: "12px",
                                    overflowX: "auto"
                                }}>
                                    <div style={{
                                        minWidth: "470px",
                                        border: "1px solid #dce6f4",
                                        borderRadius: "9px",
                                        overflow: "hidden"
                                    }}>
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "1.1fr 1.4fr 1fr 0.9fr",
                                            gap: "9px",
                                            padding: "11px 12px",
                                            background: "linear-gradient(90deg, #e8f0ff, #f4f7ff)",
                                            color: "#29446f",
                                            fontSize: "9px",
                                            fontWeight: 900
                                        }}>
                                            <div>Service Record ID</div>
                                            <div>Details / Reference</div>
                                            <div>Service Date</div>
                                            <div>Status</div>
                                        </div>

                                        {service.records.map(record => (
                                            <div
                                                key={record.id || record.serviceRecordId}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1.1fr 1.4fr 1fr 0.9fr",
                                                    gap: "9px",
                                                    alignItems: "center",
                                                    padding: "12px",
                                                    borderTop: "1px solid #e8eef7",
                                                    fontSize: "10px"
                                                }}
                                            >
                                                <div style={{
                                                    fontWeight: 900,
                                                    color: "#07816f",
                                                    wordBreak: "break-word"
                                                }}>
                                                    ◈ {record.serviceRecordId || "—"}
                                                </div>

                                                <div style={{
                                                    color: "#334968",
                                                    lineHeight: 1.5,
                                                    wordBreak: "break-word"
                                                }}>
                                                    {getRecordDetails(record)}
                                                </div>

                                                <div style={{
                                                    color: "#64748b"
                                                }}>
                                                    {formatDate(record.serviceDate || record.createdAt)}
                                                </div>

                                                <div>
                                                    <span style={{
                                                        display: "inline-block",
                                                        padding: "5px 8px",
                                                        borderRadius: "20px",
                                                        background: "#e3f0ff",
                                                        border: "1px solid #c5e0ff",
                                                        color: "#1555a5",
                                                        fontSize: "9px",
                                                        fontWeight: 900
                                                    }}>
                                                        {record.transactionStatus || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {leads.length === 0 && directServices.length === 0 && (
                <div style={{
                    padding: "25px",
                    textAlign: "center",
                    border: "1px dashed #cbd8e9",
                    borderRadius: "10px",
                    background: "#f8fbff",
                    color: "#71839d",
                    fontSize: "11px"
                }}>
                    No service transactions linked to this client yet.
                </div>
            )}
        </div>
    );
})()}



                   


{/* PREMIUM TOUR PACKAGE WORKSPACE */}

<div
    style={{
        marginTop: "18px",
        padding: "13px",
        border: "1px solid #dce7f5",
        borderRadius: "15px",
        background: "linear-gradient(145deg, #ffffff, #f8fbff)",
        boxShadow: "0 4px 16px rgba(30, 64, 120, 0.06)"
    }}
>
    {/* GRADIENT WORKSPACE HEADER */}

    <div
        style={{
            minHeight: "60px",
            padding: "8px 14px",
            borderRadius: "11px",
            background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
            boxShadow: "0 3px 9px rgba(24, 126, 145, 0.10)"
        }}
    >
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                minWidth: 0
            }}
        >
            <div
    style={{
        width: "36px",
        height: "36px",
        flexShrink: 0,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "21px",
        color: "#087e75",
        boxShadow: "0 2px 5px rgba(20,75,120,0.10)"
    }}
>
    ✈
</div>

            <div
                style={{
                    borderLeft: "2px solid rgba(255,255,255,0.9)",
                    paddingLeft: "14px",
                    minWidth: 0
                }}
            >
                <div
                    style={{
                        fontSize: "15px",
                        fontWeight: 900,
                        color: "#12345b",
                        letterSpacing: "0.1px"
                    }}
                >
                    Tour Package Workspace
                </div>

                <div
                    style={{
                        fontSize: "10px",
                        color: "#385d7c",
                        marginTop: "4px"
                    }}
                >
                    Manage this client's linked travel enquiries
                </div>
            </div>
        </div>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap"
            }}
        >
            <div
                style={{
                    padding: "9px 13px",
                    borderRadius: "25px",
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    color: "#17447c",
                    fontSize: "10px",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 5px rgba(30,64,120,0.06)"
                }}
            >
                {leads.length} {leads.length === 1 ? "Lead" : "Leads"}
            </div>

            {onCreateLead && (
                <button
                    type="button"
                    onClick={() => onCreateLead()}
                    style={{
                        border: "2px solid rgba(255,255,255,0.9)",
                        background: "linear-gradient(135deg, #087d73, #075d59)",
                        color: "#ffffff",
                        borderRadius: "9px",
                        padding: "9px 14px",
                        fontSize: "10px",
                        fontWeight: 900,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: "0 3px 8px rgba(0, 80, 75, 0.18)"
                    }}
                >
                    ＋ Create Travel Enquiry Lead
                </button>
            )}
        </div>
    </div>

    {/* COLUMN HEADINGS */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1.2fr 1fr 1.1fr",
            alignItems: "center",
            gap: "0px",
            margin: "11px 7px 8px",
            padding: "9px 12px",
            borderRadius: "8px",
            background: "linear-gradient(90deg, #e7f0ff, #f0f6ff)",
            color: "#526e94",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.35px",
            textTransform: "uppercase"
        }}
    >
        <div style={{ textAlign: "left" }}>
            🏷️ LEAD REFERENCE
        </div>

        <div style={{ textAlign: "left" }}>
            📍 DESTINATION
        </div>

        <div style={{ textAlign: "center" }}>
            📅 TRAVEL PERIOD
        </div>

       <div
    style={{
        textAlign: "right",
        paddingRight: "12px"
    }}
>
    ▤ STATUS
</div>
    </div>

    {/* EMPTY STATE */}

    {leads.length === 0 ? (
        <div
            style={{
                margin: "0 7px 3px",
                padding: "12px 14px",
                border: "1px dashed #c7d9ed",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #f3f8ff, #fbfdff)",
                display: "flex",
                alignItems: "center",
                gap: "10px"
            }}
        >
            <div style={{ fontSize: "19px" }}>
                📋
            </div>

            <div>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "#334968"
                    }}
                >
                    No Linked Travel Enquiries
                </div>

                <div
                    style={{
                        fontSize: "10px",
                        color: "#71839d",
                        marginTop: "3px"
                    }}
                >
                    Travel enquiry Leads will appear here after they are linked to this Client.
                </div>
            </div>
        </div>
    ) : (
        /* LEAD ROWS */

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                margin: "0 7px 3px"
            }}
        >
            {leads.map((lead, index) => (
                <div
    key={lead.id}
    style={{
                        width: "100%",
                        minHeight: "58px",
                        padding: "9px 12px",
                        border: "1px solid #cbdff3",
                        borderLeft: "5px solid #0c9689",
                        borderRadius: "9px",
                        background: index % 2 === 0
                            ? "linear-gradient(100deg, #eaf7ff, #f5faff)"
                            : "linear-gradient(100deg, #eaf8f5, #f6fbff)",
                        display: "grid",
                        gridTemplateColumns: "1.05fr 1.2fr 1fr 1.1fr",
                        alignItems: "center",
                        gap: "0px",
                        textAlign: "left",
                        
                        boxShadow: "0 2px 5px rgba(30,64,120,0.035)"
                    }}
                >
                    {/* LEAD REFERENCE */}

                    <div
                        style={{
                            minWidth: 0,
                            paddingRight: "10px",
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "#087e75",
                            wordBreak: "break-word"
                        }}
                    >
                        {lead.leadId || "—"}
                    </div>

                    {/* DESTINATION */}

                    <div
                        style={{
                            minWidth: 0,
                            padding: "5px 12px",
                            borderLeft: "1px solid #c9dced",
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "#173b68",
                            wordBreak: "break-word"
                        }}
                    >
                        {lead.destination ||
                            lead.leadTitle ||
                            lead.requirement ||
                            "—"}
                    </div>

                    {/* TRAVEL PERIOD */}

                    <div
                        style={{
                            minWidth: 0,
                            padding: "5px 10px",
                            borderLeft: "1px solid #c9dced",
                            textAlign: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#334b6b"
                        }}
                    >
                        {lead.preferredMonth || "—"}
                    </div>

                    {/* STATUS AND VIEW ACTION */}

                    <div
    style={{
        minWidth: 0,
        paddingLeft: "10px",
        borderLeft: "1px solid #c9dced",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "14px",
        flexWrap: "nowrap"
    }}
>
                        <span
                            style={{
                                display: "inline-block",
                                padding: "5px 9px",
                                borderRadius: "20px",
                                background: "#dceaff",
                                border: "1px solid #bad5ff",
                                color: "#1751a0",
                                fontSize: "9px",
                                fontWeight: 900,
                                whiteSpace: "nowrap"
                            }}
                        >
                            {lead.status || "New"}
                        </span>

                        <button
    type="button"
    onClick={(e) => {
        e.stopPropagation();
        if (onOpenLead) {
            onOpenLead(lead);
        }
    }}
    style={{
        border: "1px solid #a8ddd5",
        background: "linear-gradient(135deg, #e0f5f1, #c9eee7)",
        borderRadius: "20px",
        padding: "5px 10px",
        fontSize: "9px",
        fontWeight: 900,
        color: "#08766d",
        whiteSpace: "nowrap",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(15,118,110,0.08)"
    }}
>
    View Lead →
</button>
                    </div>
                </div>
            ))}
        </div>
    )}
</div>





{/* PREMIUM RELATED ACTIVITY */}

<div
    style={{
        marginTop: "18px",
        padding: "13px",
        border: "1px solid #dce7f5",
        borderRadius: "15px",
        background: "linear-gradient(145deg, #ffffff, #f8fbff)",
        boxShadow: "0 4px 16px rgba(30, 64, 120, 0.06)"
    }}
>
    {/* GRADIENT SECTION HEADER */}

    <div
        style={{
            minHeight: "60px",
            padding: "8px 14px",
            borderRadius: "11px",
            background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            boxShadow: "0 3px 9px rgba(24, 126, 145, 0.10)"
        }}
    >
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}
        >
            <div
                style={{
                    width: "36px",
                    height: "36px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "19px",
                    boxShadow: "0 2px 5px rgba(20,75,120,0.10)"
                }}
            >
                📋
            </div>

            <div
                style={{
                    borderLeft: "2px solid rgba(255,255,255,0.9)",
                    paddingLeft: "13px"
                }}
            >
                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: 900,
                        color: "#12345b"
                    }}
                >
                    Related Activity
                </div>

                <div
                    style={{
                        fontSize: "10px",
                        color: "#385d7c",
                        marginTop: "3px"
                    }}
                >
                    Customer quotations and proposal history
                </div>
            </div>
        </div>

        <div
            style={{
                padding: "8px 12px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.9)",
                color: "#17447c",
                fontSize: "10px",
                fontWeight: 900,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 5px rgba(30,64,120,0.06)"
            }}
        >
            {quotations.length} {quotations.length === 1 ? "Quotation" : "Quotations"}
        </div>
    </div>

    {/* QUOTATIONS SUBSECTION */}

    <div
        style={{
            marginTop: "10px",
            border: "1px solid #dce7f5",
            borderRadius: "9px",
            overflow: "hidden",
            background: "#ffffff"
        }}
    >
        <div
            style={{
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                background: "linear-gradient(90deg, #e7f0ff, #f3f7ff)"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px"
                }}
            >
                <div
                    style={{
                        width: "29px",
                        height: "29px",
                        borderRadius: "7px",
                        background: "linear-gradient(135deg, #d7f4ef, #e8f8f5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        color: "#087e75"
                    }}
                >
                    <span
    style={{
        color: "#087e75",
        fontSize: "19px",
        fontWeight: 900,
        lineHeight: 1
    }}
>
    ▤
</span>
                </div>

                <div>
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "#08766d"
                        }}
                    >
                        Quotations
                    </div>

                    
                </div>
            </div>
        </div>

        {/* EMPTY STATE */}

        {quotations.length === 0 ? (
            <div
                style={{
                    padding: "12px 14px",
                    background: "linear-gradient(90deg, #f3f8ff, #fbfdff)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <span style={{ fontSize: "18px" }}>📄</span>

                <div>
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "#334968"
                        }}
                    >
                        No Quotations Yet
                    </div>

                    <div
                        style={{
                            fontSize: "10px",
                            color: "#71839d",
                            marginTop: "3px"
                        }}
                    >
                        Quotations associated with this client's travel enquiries will appear here.
                    </div>
                </div>
            </div>
        ) : (
            <>
                {/* QUOTATION COLUMN HEADINGS */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "150px minmax(0, 1fr) 130px",
                        gap: "10px",
                        alignItems: "center",
                        padding: "8px 13px",
                        background: "#f4f8fd",
                        color: "#647b9b",
                        fontSize: "9px",
                        fontWeight: 900,
                        letterSpacing: "0.35px",
                        textTransform: "uppercase"
                    }}
                >
                    <div>Quotation Reference</div>
                    <div
    style={{
        textAlign: "left",
        paddingLeft: "12px",
        borderLeft: "1px solid #c9dced"
    }}
>
    DESTINATION / DATE
</div>
                    <div style={{ textAlign: "right" }}>Status</div>
                </div>

                {/* QUOTATION RECORDS */}

                <div
                    style={{
                        background: "#ffffff"
                    }}
                >
                    {quotations.map((quotation, index) => (
                        <div
                            key={
                                quotation.id ||
                                quotation.quotationNo
                            }
                            style={{
                                borderTop: "1px solid #e2eaf4"
                            }}
                        >
                            <div
                                 style={{
                                    width: "100%",
                                    padding: "10px 13px",
                                    display: "grid",
                                   gridTemplateColumns: "150px minmax(0, 1fr) 180px",
                                    gap: "10px",
                                    alignItems: "center",
                                    border: "none",
                                    borderLeft: "4px solid #348caa",
                                    textAlign: "left",
                                    
                                    background: index % 2 === 0
                                        ? "linear-gradient(100deg, #edf6ff, #f8fbff)"
                                        : "linear-gradient(100deg, #eef9f7, #fbfefd)"
                                }}
                            >
                                {/* QUOTATION REFERENCE */}

                                <div
                                    style={{
                                        minWidth: 0,
                                        fontSize: "11px",
                                        fontWeight: 900,
                                        color: "#08766d",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    {quotation.displayQuotationNo ||
                                        quotation.quotationNo ||
                                        "—"}
                                </div>

                                {/* DESTINATION AND DATE */}

                                <div
                                    style={{
                                        minWidth: 0,
                                        paddingLeft: "12px",
                                        borderLeft: "1px solid #c9dced"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 800,
                                            color: "#17345f"
                                        }}
                                    >
                                        {quotation.destination || "Quotation"}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "3px",
                                            fontSize: "9px",
                                            color: "#71839d"
                                        }}
                                    >
                                        {quotation.savedAt
                                            ? new Date(
                                                quotation.savedAt
                                            ).toLocaleDateString()
                                            : "—"}
                                    </div>
                                </div>

                               {/* STATUS AND VIEW QUOTATION */}

<div
    style={{
    paddingLeft: "10px",
    paddingRight: "8px",
    borderLeft: "1px solid #c9dced",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "7px",
    flexWrap: "nowrap",
    minWidth: 0,
    boxSizing: "border-box"
}}
>
    <span
        style={{
            display: "inline-block",
            padding: "5px 10px",
            borderRadius: "20px",
            background: "#e3efff",
            border: "1px solid #c9dcff",
            color: "#2456a0",
            fontSize: "9px",
            fontWeight: 900,
            whiteSpace: "nowrap"
        }}
    >
        {quotation.status || "Draft"}
    </span>

    <button
        type="button"
        onClick={() => handlePreviewQuotation(quotation)}
        style={{
            border: "1px solid #a8ddd5",
            background: "linear-gradient(135deg, #e0f5f1, #c9eee7)",
            borderRadius: "20px",
            padding: "5px 10px",
            fontSize: "9px",
            fontWeight: 900,
            color: "#08766d",
            whiteSpace: "nowrap",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(15,118,110,0.08)"
        }}
    >
        View Quotation →
    </button>
</div>
                            </div>

                            {/* REVISION HISTORY TOGGLE */}

                            {Array.isArray(
                                quotation.revisionHistory
                            ) &&
                                quotation.revisionHistory.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedQuotationNo(
                                                expandedQuotationNo === quotation.quotationNo
                                                    ? null
                                                    : quotation.quotationNo
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            borderTop: "1px solid #e7edf5",
                                            background: "#f4f8fd",
                                            padding: "7px 13px",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            fontSize: "10px",
                                            fontWeight: 800,
                                            color: "#416184"
                                        }}
                                    >
                                        {expandedQuotationNo === quotation.quotationNo
                                            ? "▼"
                                            : "▶"}{" "}
                                        Revision History (
                                        {quotation.revisionHistory.length})
                                    </button>
                                )}

                            {/* REVISION RECORDS */}

                            {expandedQuotationNo === quotation.quotationNo &&
                                Array.isArray(quotation.revisionHistory) && (
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            borderTop: "1px solid #e2eaf4"
                                        }}
                                    >
                                        {quotation.revisionHistory.map(
                                            revision => (
                                                <button
                                                    type="button"
                                                    key={revision.revisionNo}
                                                    onClick={() =>
                                                        handlePreviewQuotation({
                                                            ...quotation,
                                                            revisionNo: revision.revisionNo,
                                                            savedAt: revision.savedAt,
                                                            commonData: revision.commonData,
                                                            packageData: revision.packageData,
                                                            itineraryData: revision.itineraryData
                                                        })
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        border: "none",
                                                        borderBottom: "1px solid #edf1f6",
                                                        background: "linear-gradient(90deg, #f6f9ff, #ffffff)",
                                                        padding: "8px 13px 8px 28px",
                                                        display: "grid",
                                                        gridTemplateColumns: "120px 1fr",
                                                        gap: "10px",
                                                        alignItems: "center",
                                                        textAlign: "left",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: "10px",
                                                            fontWeight: 900,
                                                            color: "#334f72"
                                                        }}
                                                    >
                                                        Revision {revision.revisionNo}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: "10px",
                                                            color: "#647b94"
                                                        }}
                                                    >
                                                        {revision.savedAt
                                                            ? new Date(
                                                                revision.savedAt
                                                            ).toLocaleDateString()
                                                            : "—"}
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
</div>




                    
{/* PREMIUM ADMIN AREA */}

{showDelete && onDelete && (
    <div
        style={{
            marginTop: "18px",
            padding: "13px",
            border: "1px solid #eadde0",
            borderRadius: "14px",
            background: "linear-gradient(145deg, #ffffff, #fffafa)",
            boxShadow: "0 4px 14px rgba(120, 30, 40, 0.045)"
        }}
    >
        {/* ADMIN GRADIENT HEADER */}

        <div
            style={{
                minHeight: "60px",
                padding: "8px 14px",
                borderRadius: "11px",
                background: "linear-gradient(105deg, #35c9c2 0%, #75d8d3 30%, #c8eeec 58%, #eaf5ff 82%, #f5f9ff 100%)",
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}
        >
            <div
                style={{
                    width: "36px",
                    height: "36px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "19px"
                }}
            >
                ⚙
            </div>

            <div
                style={{
                    borderLeft: "2px solid rgba(255,255,255,0.9)",
                    paddingLeft: "13px"
                }}
            >
                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: 900,
                        color: "#12345b"
                    }}
                >
                    Admin Controls
                </div>

                <div
                    style={{
                        fontSize: "10px",
                        color: "#385d7c",
                        marginTop: "3px"
                    }}
                >
                    Administrative actions for this client
                </div>
            </div>
        </div>

        {/* ADMIN ACTION */}

        <div
            style={{
                marginTop: "10px",
                padding: "10px 12px",
                border: "1px solid #f1d5d5",
                borderRadius: "9px",
                background: "linear-gradient(90deg, #fff5f5, #fffafa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap"
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "#9f3030"
                    }}
                >
                    Delete Client Record
                </div>

                <div
                    style={{
                        fontSize: "10px",
                        color: "#987070",
                        marginTop: "3px"
                    }}
                >
                    Permanent administrative action
                </div>
            </div>

            <button
                type="button"
                onClick={() => onDelete(client)}
                style={{
                    padding: "8px 13px",
                    border: "1px solid #efb5b5",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #fff1f1, #ffe3e3)",
                    color: "#bd2929",
                    fontSize: "10px",
                    fontWeight: 900,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 5px rgba(185, 28, 28, 0.07)"
                }}
            >
                🗑 Delete Client
            </button>
        </div>
    </div>
)}

                </div>
            </div>
        </div>

        {previewQuotation && (
    <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(15, 23, 42, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                width: "100%",
                maxWidth: "1100px",
                height: "94vh",
                background: "#e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow:
                    "0 24px 70px rgba(15, 23, 42, 0.35)"
            }}
        >
            <div
                style={{
                    height: "48px",
                    flexShrink: 0,
                    padding: "0 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#ffffff",
                    borderBottom:
                        "1px solid #dbe3ea"
                }}
            >
                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#172033"
                    }}
                >
                    📄 Quotation Preview
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setPreviewQuotation(null);
                        setPreviewPdfUrl(null);
                    }}
                    style={{
                        width: "30px",
                        height: "30px",
                        border: "1px solid #dbe3ea",
                        borderRadius: "7px",
                        background: "#ffffff",
                        color: "#334155",
                        cursor: "pointer",
                        fontSize: "18px",
                        lineHeight: 1
                    }}
                >
                    ×
                </button>
            </div>

            <div
                style={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {previewLoading ? (
                    <div
                        style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#64748b",
                            fontSize: "13px",
                            fontWeight: 700
                        }}
                    >
                        Generating quotation preview...
                    </div>
                ) : previewPdfUrl ? (
                    <iframe
                        title="Quotation PDF Preview"
                        src={previewPdfUrl}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            background: "#e2e8f0"
                        }}
                    />
                ) : null}
            </div>
        </div>
    </div>
)}
</>
    );
}