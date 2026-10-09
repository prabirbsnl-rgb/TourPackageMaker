


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
                padding: "24px",
                zIndex: 1100
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "980px",
                    maxHeight: "88vh",
                    background: "#ffffff",
                    borderRadius: "16px",
                    boxShadow:
                        "0 24px 70px rgba(15, 23, 42, 0.24)",
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
                        background:
                            "linear-gradient(135deg, #f8fafc, #ffffff)"
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
                                    color: "#0f172a"
                                }}
                            >
                                Client Details
                            </div>

                            <div
                                style={{
                                    marginTop: "2px",
                                    fontSize: "11px",
                                    color: "#64748b"
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
                    {/* IDENTITY */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: "20px",
                            marginBottom: "18px"
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: "21px",
                                    fontWeight: 800,
                                    color: "#0f172a"
                                }}
                            >
                                {client.clientName ||
                                    "—"}
                            </div>

                            <div
                                style={{
                                    marginTop: "4px",
                                    fontSize: "11px",
                                    color: "#64748b"
                                }}
                            >
                                {client.contactPerson
                                    ? `👤 ${client.contactPerson}`
                                    : "👤 No contact person"}
                            </div>
                        </div>

                        <div
                            style={{
                                padding:
                                    "6px 11px",
                                borderRadius: "20px",
                                background:
                                    client.status ===
                                    "Inactive"
                                        ? "#f1f5f9"
                                        : "#ecfdf5",
                                color:
                                    client.status ===
                                    "Inactive"
                                        ? "#64748b"
                                        : "#15803d",
                                fontSize: "11px",
                                fontWeight: 800,
                                whiteSpace:
                                    "nowrap"
                            }}
                        >
                            {client.status ===
                            "Inactive"
                                ? "⚪ Inactive"
                                : "🟢 Active"}
                        </div>
                    </div>

                    {/* PROFILE */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                            gap: "10px",
                            marginBottom: "16px"
                        }}
                    >
                        {[
                            [
                                "📞",
                                "Mobile",
                                client.mobile
                            ],
                            [
                                "✉️",
                                "Email",
                                client.email
                            ],
                            [
                                "🏷️",
                                "Client Type",
                                client.clientType
                            ],
                            [
                                "📍",
                                "City",
                                client.city
                            ],
                            [
                                "🗃️",
                                "Source",
                                client.source
                            ],
                            [
                                "👤",
                                "Contact Person",
                                client.contactPerson
                            ]
                        ].map(
                            ([icon, label, value]) => (
                                <div
                                    key={label}
                                    style={{
                                        padding:
                                            "12px 13px",
                                        border:
                                            "1px solid #e2e8f0",
                                        borderRadius:
                                            "9px",
                                        background:
                                            "#f8fafc"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                "10px",
                                            color:
                                                "#64748b",
                                            marginBottom:
                                                "5px",
                                            fontWeight:
                                                700
                                        }}
                                    >
                                        {icon}{" "}
                                        {label}
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "12px",
                                            color:
                                                "#172033",
                                            fontWeight:
                                                700,
                                            wordBreak:
                                                "break-word"
                                        }}
                                    >
                                        {value || "—"}
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* ADDRESS + NOTES */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1.4fr 1fr",
                            gap: "10px",
                            marginBottom: "20px"
                        }}
                    >
                        <div
                            style={{
                                padding: "13px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius:
                                    "9px"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color:
                                        "#64748b",
                                    marginBottom:
                                        "6px"
                                }}
                            >
                                🏠 Address
                            </div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    color:
                                        "#334155",
                                    lineHeight: 1.5
                                }}
                            >
                                {client.address ||
                                    "No address added"}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "13px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius:
                                    "9px"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color:
                                        "#64748b",
                                    marginBottom:
                                        "6px"
                                }}
                            >
                                📝 Notes
                            </div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    color:
                                        "#334155",
                                    lineHeight: 1.5
                                }}
                            >
                                {client.notes ||
                                    "No notes added"}
                            </div>
                        </div>
                    </div>




                    {/* RELATED LEADS */}
<div
    style={{
        borderTop:
            "1px solid #e2e8f0",
        paddingTop: "16px"
    }}
>
   <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "10px"
    }}
>
    <div
        style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#334155"
        }}
    >
        🎯 Related Leads
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
        }}
    >
        <div
            style={{
                fontSize: "10px",
                color: "#64748b",
                fontWeight: 700
            }}
        >
            {leads.length}{" "}
            {leads.length === 1
                ? "Lead"
                : "Leads"}
        </div>

       {onCreateLead && (
    <button
            type="button"
           onClick={() => {
    if (onCreateLead) {
        onCreateLead();
    }
}}
            style={{
                border: "1px solid #0f766e",
                background: "#ffffff",
                color: "#0f766e",
                borderRadius: "7px",
                padding: "6px 10px",
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap"
            }}
        >
            ＋ Create New Lead
        </button>
        )}
    </div>
</div>

    {leads.length === 0 ? (
        <div
            style={{
                padding: "18px",
                border:
                    "1px dashed #cbd5e1",
                borderRadius: "9px",
                background: "#f8fafc",
                textAlign: "center",
                fontSize: "11px",
                color: "#64748b"
            }}
        >
            No Leads linked to this Client yet.
        </div>
    ) : (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px"
            }}
        >
           {leads.map(lead => (
    <button
        type="button"
        key={lead.id}
        onClick={() => {
            if (onOpenLead) {
                onOpenLead(lead);
            }
        }}
                    style={{
                        padding: "11px 13px",
                        border:
                            "1px solid #e2e8f0",
                        borderRadius: "9px",
                        background: "#ffffff",
                        display: "grid",
                        gridTemplateColumns:
                            "125px 1.4fr 1fr 120px",
                        gap: "10px",
                        alignItems: "center",
                         cursor: "pointer"
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "10px",
                                color: "#64748b",
                                marginBottom: "3px"
                            }}
                        >
                            🆔 Lead ID
                        </div>

                        <div
                            style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                color: "#0f766e"
                            }}
                        >
                            {lead.leadId ||
                                "—"}
                        </div>
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: "10px",
                                color: "#64748b",
                                marginBottom: "3px"
                            }}
                        >
                            📍 Destination
                        </div>

                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#172033"
                            }}
                        >
                           {lead.destination || "—"}
                        </div>
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: "10px",
                                color: "#64748b",
                                marginBottom: "3px"
                            }}
                        >
                            📅 Travel
                        </div>

                        <div
                            style={{
                                fontSize: "11px",
                                color: "#334155"
                            }}
                        >
                            {lead.preferredMonth ||
                                "—"}
                        </div>
                    </div>

                    <div
                        style={{
                            textAlign: "right"
                        }}
                    >
                        <span
                            style={{
                                display:
                                    "inline-block",
                                padding:
                                    "5px 8px",
                                borderRadius:
                                    "999px",
                                background:
                                    "#f1f5f9",
                                color:
                                    "#475569",
                                fontSize:
                                    "10px",
                                fontWeight:
                                    700
                            }}
                        >
                            🏷️{" "}
                            {lead.status ||
                                "New"}
                        </span>
                    </div>
                </button>
               ))}
        </div>
    )}
</div>


{/* RELATED ACTIVITY */}

<div
    style={{
        marginTop: "18px",
        borderTop: "1px solid #e2e8f0",
        paddingTop: "16px"
    }}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px"
        }}
    >
        <div
            style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#172033"
            }}
        >
            📋 Related Activity
        </div>

        <div
            style={{
                fontSize: "10px",
                color: "#64748b",
                fontWeight: 700
            }}
        >
            {quotations.length} Quotation
            {quotations.length === 1 ? "" : "s"}
        </div>
    </div>

    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            overflow: "hidden",
            background: "#f8fafc"
        }}
    >
        <div
            style={{
                padding: "10px 13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <span
                    style={{
                        fontSize: "18px"
                    }}
                >
                    📄
                </span>

                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "#172033"
                        }}
                    >
                        Quotations
                    </div>

                    <div
                        style={{
                            marginTop: "2px",
                            fontSize: "10px",
                            color: "#64748b"
                        }}
                    >
                        {quotations.length} quotation
                        {quotations.length === 1
                            ? ""
                            : "s"} linked to this client
                    </div>
                </div>
            </div>
        </div>

        {quotations.length > 0 && (
            <div
                style={{
                    borderTop: "1px solid #e2e8f0",
                    background: "#ffffff"
                }}
            >
               {quotations.map(quotation => (
    <div
        key={
            quotation.id ||
            quotation.quotationNo
        }
        style={{
            borderBottom:
                "1px solid #f1f5f9"
        }}
    >
        <button
            type="button"
            onClick={() =>
                handlePreviewQuotation(
                    quotation
                )
            }
            style={{
                padding: "10px 13px",
                display: "grid",
                gridTemplateColumns:
                    "130px 1fr 120px",
                gap: "10px",
                border: "none",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                alignItems: "center",
                background: "#ffffff"
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#0f766e"
                }}
            >
                {quotation.displayQuotationNo ||
                    quotation.quotationNo ||
                    "—"}
            </div>

            <div
                style={{
                    minWidth: 0
                }}
            >
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#172033"
                    }}
                >
                    {quotation.destination ||
                        "Quotation"}
                </div>

                <div
                    style={{
                        marginTop: "2px",
                        fontSize: "9px",
                        color: "#64748b"
                    }}
                >
                    {quotation.savedAt
                        ? new Date(
                              quotation.savedAt
                          ).toLocaleDateString()
                        : "—"}
                </div>
            </div>

            <div
                style={{
                    textAlign: "right",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#475569"
                }}
            >
                {quotation.status || "Draft"}
            </div>
        </button>

        {Array.isArray(
            quotation.revisionHistory
        ) &&
            quotation.revisionHistory.length >
                1 && (
                <button
                    type="button"
                    onClick={() =>
                        setExpandedQuotationNo(
                            expandedQuotationNo ===
                                quotation.quotationNo
                                ? null
                                : quotation.quotationNo
                        )
                    }
                    style={{
                        width: "100%",
                        border: "none",
                        borderTop:
                            "1px solid #f1f5f9",
                        background: "#f8fafc",
                        padding: "7px 13px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "10px",
                        fontWeight: 800,
                        color: "#475569"
                    }}
                >
                    {expandedQuotationNo ===
                    quotation.quotationNo
                        ? "▼"
                        : "▶"}{" "}
                    Revision History (
                    {
                        quotation
                            .revisionHistory
                            .length
                    }
                    )
                </button>

                
            )}

            {expandedQuotationNo ===
    quotation.quotationNo &&
    Array.isArray(
        quotation.revisionHistory
    ) && (
        <div
            style={{
                background: "#ffffff",
                borderTop:
                    "1px solid #e2e8f0"
            }}
        >
            {quotation.revisionHistory.map(
                revision => (
                    <button
                        type="button"
                        key={
                            revision.revisionNo
                        }
                        onClick={() =>
                            handlePreviewQuotation({
                                ...quotation,

                                revisionNo:
                                    revision.revisionNo,

                                savedAt:
                                    revision.savedAt,

                                commonData:
                                    revision.commonData,

                                packageData:
                                    revision.packageData,

                                itineraryData:
                                    revision.itineraryData
                            })
                        }
                        style={{
                            width: "100%",
                            border: "none",
                            borderBottom:
                                "1px solid #f1f5f9",
                            background:
                                "#ffffff",
                            padding:
                                "8px 13px 8px 28px",
                            display: "grid",
                            gridTemplateColumns:
                                "110px 1fr",
                            gap: "10px",
                            alignItems:
                                "center",
                            textAlign: "left",
                            cursor: "pointer"
                        }}
                    >
                        <div
                            style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                color: "#334155"
                            }}
                        >
                            Revision{" "}
                            {
                                revision.revisionNo
                            }
                        </div>

                        <div
                            style={{
                                fontSize: "10px",
                                color: "#64748b"
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
        )}
    </div>
</div>



                    {/* ADMIN ACTION */}
                    {showDelete &&
                        onDelete && (
                            <div
                                style={{
                                    marginTop: "18px",
                                    paddingTop:
                                        "14px",
                                    borderTop:
                                        "1px solid #e2e8f0",
                                    display: "flex",
                                    justifyContent:
                                        "flex-end"
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        onDelete(
                                            client
                                        )
                                    }
                                    style={{
                                        padding:
                                            "7px 11px",
                                        border:
                                            "1px solid #fecaca",
                                        borderRadius:
                                            "7px",
                                        background:
                                            "#fff",
                                        color:
                                            "#dc2626",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    🗑️ Delete Client
                                </button>
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