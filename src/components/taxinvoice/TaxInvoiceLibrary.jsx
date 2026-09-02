

import React from "react";

import {
    deleteTaxInvoice,
    saveTaxInvoice
} from "../../utils/quotationStorage";

import { calculateQuotationTotals }
    from "../../utils/quotationCalculator";



export default function TaxInvoiceLibrary({
    open,
    drafts = [],
    taxInvoices = [],
    onClose,
    onOpen,
    onRefresh
}) {

    const [showImportConfirmed, setShowImportConfirmed] =
    React.useState(() =>
        sessionStorage.getItem(
            "taxInvoiceRestoreOpen"
        ) === "true"
    );

    const [showSearch, setShowSearch] =
    React.useState(false);

const [searchText, setSearchText] =
    React.useState("");

const [searchMonth, setSearchMonth] =
    React.useState("");


    if (!open) {
        return null;
    }

    
    const confirmedDrafts =
        drafts.filter(
            draft =>
                String(draft?.status || "")
                    .toLowerCase() === "confirmed"
        );

        const importedQuotationNos =
    new Set(
        taxInvoices
            .map(
                invoice =>
                    invoice?.sourceDraftQuotationNo ||
                    invoice?.quotationNo ||
                    invoice?.invoiceNo
            )
            .filter(Boolean)
    );


const deletedTaxInvoices =
    JSON.parse(
        localStorage.getItem(
            "deletedTaxInvoices"
        ) || "[]"
    );


const deletedQuotationNos =
    new Set(
        deletedTaxInvoices
            .map(
                invoice =>
                    invoice?.sourceDraftQuotationNo ||
                    invoice?.quotationNo ||
                    invoice?.invoiceNo
            )
            .filter(Boolean)
    );


const availableConfirmedDrafts =
    confirmedDrafts.filter(draft => {

        const quotationNo =
            draft?.quotationNo;

        if (!quotationNo) {
            return false;
        }

        // Must have been deliberately deleted
        if (
            !deletedQuotationNos.has(
                quotationNo
            )
        ) {
            return false;
        }

        // Must not currently exist in
        // Tax Invoice Library
        if (
            importedQuotationNos.has(
                quotationNo
            )
        ) {
            return false;
        }

        return true;

    });
    

        const getTaxInvoiceForDraft = (draft) => {

    return taxInvoices.find(
        invoice =>
            invoice?.sourceDraftQuotationNo ===
            draft?.quotationNo
    );

};

const filteredDrafts =
    confirmedDrafts.filter(draft => {

        const taxInvoice =
            getTaxInvoiceForDraft(draft);

        if (!taxInvoice) {
            return false;
        }
        
        const invoiceNo =
            taxInvoice?.invoiceNo ||
            draft?.quotationNo ||
            "";

        const clientName =
            taxInvoice?.clientName ||
            draft?.clientName ||
            "";

        const destination =
            taxInvoice?.destination ||
            draft?.destination ||
            "";

        const searchableText =
            `${invoiceNo} ${clientName} ${destination}`
                .toLowerCase();

        const matchesText =
            !searchText.trim() ||
            searchableText.includes(
                searchText.trim().toLowerCase()
            );

        if (!matchesText) {
            return false;
        }

        if (!searchMonth) {
            return true;
        }

       const dateSource =
    draft?.confirmedAt ||
    "";

        if (!dateSource) {
            return false;
        }

        const date =
            new Date(dateSource);

        return (
            !Number.isNaN(date.getTime()) &&
            String(
                date.getMonth() + 1
            ).padStart(2, "0") ===
                searchMonth
        );
    });


    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px",
                boxSizing: "border-box"
            }}
        >

            <div
                style={{
                    width: "min(1100px, 100%)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "#f8fafc",
                    borderRadius: "14px",
                    boxShadow:
                        "0 20px 60px rgba(0,0,0,.25)"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        background: "#17334F",
                        color: "#fff",
                        borderTopLeftRadius: "14px",
                        borderTopRightRadius: "14px"
                    }}
                >

                   <div>

    <div
        style={{
            fontSize: "20px",
            fontWeight: 700
        }}
    >
        🧾 Tax Invoice Library
    </div>

    <div
        style={{
            marginTop: "4px",
            fontSize: "12px",
            opacity: 0.85
        }}
    >
        Confirmed quotations & tax invoices
    </div>

</div>

<button
    type="button"
    onClick={() =>
        setShowSearch(prev => !prev)
    }
    style={{
        border: "1px solid rgba(255,255,255,.25)",
        background: "rgba(255,255,255,.10)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        marginLeft: "auto",
        marginRight: "8px"
    }}
>
    🔎 Search
</button>


                   <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
    }}
>

    <button
        type="button"
       onClick={() => {

    setShowImportConfirmed(true);

    sessionStorage.setItem(
        "taxInvoiceRestoreOpen",
        "true"
    );

}}
        style={{
            border: "1px solid rgba(255,255,255,.28)",
            background: "rgba(255,255,255,.10)",
            color: "#fff",
            padding: "8px 13px",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap"
        }}
    >
        ↻ Restore Confirmed
    </button>


    <button
        type="button"
        onClick={onClose}
        style={{
            border: "none",
            background: "rgba(255,255,255,.15)",
            color: "#fff",
            width: "34px",
            height: "34px",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "18px"
        }}
    >
        ×
    </button>

</div>
</div>


                {showSearch && (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            background: "#eef4f7",
            borderBottom: "1px solid #d5e0e6"
        }}
    >

        <input
            type="text"
            value={searchText}
            onChange={e =>
                setSearchText(e.target.value)
            }
            placeholder="Search invoice, customer or destination"
            style={{
                flex: 1,
                height: "32px",
                padding: "5px 9px",
                border: "1px solid #cbd8df",
                borderRadius: "6px",
                fontSize: "11px",
                outline: "none",
                background: "#fff"
            }}
        />

        <select
            value={searchMonth}
            onChange={e =>
                setSearchMonth(e.target.value)
            }
            style={{
                height: "32px",
                padding: "0 8px",
                border: "1px solid #cbd8df",
                borderRadius: "6px",
                fontSize: "11px",
                background: "#fff",
                color: "#17334F",
                cursor: "pointer"
            }}
        >
            <option value="">
                All Months
            </option>

            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>

        <button
            type="button"
            onClick={() => {
                setSearchText("");
                setSearchMonth("");
            }}
            style={{
                height: "32px",
                padding: "0 10px",
                border: "1px solid #cbd8df",
                borderRadius: "6px",
                background: "#fff",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600
            }}
        >
            Clear
        </button>

    </div>
)}


                {/* CONTENT */}

                <div
                    style={{
                        padding: "24px"
                    }}
                >

                    {showImportConfirmed && (
    <div
    style={{
        marginBottom: "26px",
        background:
            "linear-gradient(135deg, #f3fbf7 0%, #ffffff 72%)",
        border:
            "1px solid #cfe8dc",
        borderRadius: "12px",
        padding: "18px",
        boxShadow:
            "0 4px 14px rgba(23,51,79,.06)"
    }}
>

       <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px",
        padding: "0 2px"
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
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e4f5ec",
            color: "#15803d",
            fontSize: "18px",
            fontWeight: 800,
            flexShrink: 0
        }}
    >
        ↻
    </span>

    <div>
        <div
            style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#166534",
                letterSpacing: "-0.15px"
            }}
        >
            Restored Confirmed Quotations
        </div>

        <div
            style={{
                marginTop: "3px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748b"
            }}
        >
            Previously deleted confirmed quotations.
            Import to Tax Invoice Library.
        </div>
    </div>
</div>

            <button
                type="button"
               onClick={() => {

    setShowImportConfirmed(false);

    sessionStorage.removeItem(
        "taxInvoiceRestoreOpen"
    );

}}
                style={{
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid #dc2626",
    background: "#fff",
    color: "#991b1b",
    cursor: "pointer",
    fontSize: "19px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    flexShrink: 0,
    boxShadow:
        "0 2px 5px rgba(185,28,28,.08)"
}}
            >
                ×
            </button>
        </div>


        {availableConfirmedDrafts.length === 0 ? (

            <div
                style={{
                    padding: "18px",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "7px"
                }}
            >
                No confirmed quotations available
                for import.
            </div>

        ) : (

            availableConfirmedDrafts.map(draft => (

                <div
                    key={draft.quotationNo}
                   style={{
    display: "grid",
    gridTemplateColumns:
        "minmax(0, 1fr) 170px",
    alignItems: "center",
    gap: "0",
    padding: "0",
    marginBottom: "6px",
    background: "#ffffff",
    border: "1px solid #d7e7df",
    borderRadius: "8px",
    minHeight: "58px",
    overflow: "hidden"
}}
                >

                   <div
    style={{
        display: "grid",
        gridTemplateColumns:
            "180px minmax(180px, 1fr) 150px",
        alignItems: "center",
        minWidth: 0,
        height: "100%"
    }}
>

                        <div
        style={{
            padding: "0 14px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#17334F",
            borderRight: "1px solid #dbe7e2",
            whiteSpace: "nowrap"
        }}
    >
    {draft.displayQuotationNo ||
        draft.quotationNo}
</div>
                       <div
    style={{
    padding: "0 16px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#1f2937",
    borderRight: "1px solid #dbe7e2",
    whiteSpace: "nowrap"
}}
>
    {draft.clientName ||
        "Unnamed Client"}
</div>

                        <div
    style={{
    padding: "0 16px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#365d78",
    whiteSpace: "nowrap"
}}
>
    {draft.destination || "—"}
</div>

                    </div>


                    <button
                        type="button"
                        onClick={async () => {

    const sourceCommonData =
        draft?.commonData || {};

        const restoredQuotationTotals =
    calculateQuotationTotals({
        commonData: sourceCommonData,
        usdRate: 86
    });

const restoredQuotationAmount =
    Number(
        restoredQuotationTotals?.grandTotal
    ) || 0;

    const taxInvoiceData = {

        invoiceNo:
            draft?.quotationNo || "",

        quotationNo:
            draft?.quotationNo || "",

        displayQuotationNo:
            draft?.displayQuotationNo || "",

        sourceDraftQuotationNo:
            draft?.quotationNo || "",


       totalAmountPayable:
    restoredQuotationAmount,


        commonData:
            structuredClone(
                draft?.commonData || {}
            ),

        packageData:
            structuredClone(
                draft?.packageData || {}
            ),

        itineraryData:
            structuredClone(
                draft?.itineraryData || {}
            ),


        clientName:
            sourceCommonData.clientName ||
            draft?.clientName ||
            "",

        mobile:
            sourceCommonData.mobile ||
            "",

        email:
            sourceCommonData.email ||
            "",

        customerAddress:
            sourceCommonData.customerAddress ||
            sourceCommonData.address ||
            sourceCommonData.city ||
            "",

        customerGstinPan:
            sourceCommonData.customerGstinPan ||
            sourceCommonData.customerGstin ||
            sourceCommonData.customerPan ||
            "",


        destination:
            sourceCommonData.customDestination?.trim() ||
            sourceCommonData.destination ||
            draft?.destination ||
            "",


        travelFrom:
            sourceCommonData.travelFrom ||
            "",

        travelTo:
            sourceCommonData.travelTo ||
            "",

        travelDates:
            (
                sourceCommonData.travelFrom ||
                sourceCommonData.travelTo
            )
                ? `${sourceCommonData.travelFrom || ""} – ${sourceCommonData.travelTo || ""}`
                : "",


        passengerName:
            sourceCommonData.clientName ||
            draft?.clientName ||
            "",

        pax:
            (
                Number(
                    sourceCommonData.adults || 0
                ) +
                Number(
                    sourceCommonData.children || 0
                )
            ) || "",


        placeOfSupply:
            sourceCommonData.placeOfSupply ||
            sourceCommonData.city ||
            "",

        invoiceDate:
            "",

        dueDate:
            "",

        bookingReference:
            draft?.displayQuotationNo ||
            draft?.quotationNo ||
            "",


        supplierGstin:
            sourceCommonData.supplierGstin ??
            "19AYTPS0423N1ZO",

        supplierPan:
            sourceCommonData.supplierPan ??
            "AYTPS0423N",


        // ==========================================
        // NEW INVOICE STATE
        // ==========================================

        status:
            "Pending",

        confirmedAt:
            draft?.confirmedAt || "",

        // IMPORTANT:
        // This is a newly restored invoice.
        // It has NOT been created yet.

        createdAt:
            "",

        updatedAt:
            new Date().toISOString()

    };


    try {

        await saveTaxInvoice(
            taxInvoiceData
        );


        console.log(
            "🔥 CONFIRMED TAX INVOICE RESTORED:",
            taxInvoiceData.invoiceNo
        );


        // Remove it from the deleted/recovery list
        const deletedInvoices =
            JSON.parse(
                localStorage.getItem(
                    "deletedTaxInvoices"
                ) || "[]"
            );


        const remainingDeletedInvoices =
    deletedInvoices.filter(
        invoice =>
            (
                invoice?.sourceDraftQuotationNo ||
                invoice?.quotationNo ||
                invoice?.invoiceNo
            ) !==
            draft?.quotationNo
    );


localStorage.setItem(
    "deletedTaxInvoices",
    JSON.stringify(
        remainingDeletedInvoices
    )
);


// Refresh Tax Invoice Library state
if (onRefresh) {
    onRefresh();
}


alert(
    "Confirmed quotation restored as Pending."
);

} catch (error) {

    console.error(
        "🔥 CONFIRMED TAX INVOICE RESTORE FAILED:",
        error
    );

    alert(
        "Could not restore the confirmed quotation."
    );

}

}}
                       style={{
    minWidth: "170px",
    padding: "9px 14px",
    border: "none",
    borderRadius: "7px",
    background: "#15803d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    boxShadow:
        "0 2px 5px rgba(21,128,61,.14)"
}}
                    >
                       Import to Tax Library
                    </button>

                </div>

            ))

        )}

    </div>
)}





<div
    style={{
        background:
            "linear-gradient(135deg, #f8faff 0%, #ffffff 70%)",
        border: "1px solid #cfdcff",
        borderRadius: "12px",
        padding: "18px",
        boxShadow:
            "0 4px 14px rgba(23,51,79,.06)"
    }}
>

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px"
    }}
>
    <span
        style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e8efff",
            color: "#1d4ed8",
            fontSize: "17px",
            fontWeight: 800,
            flexShrink: 0
        }}
    >
        ▣
    </span>

    <div>
        <div
            style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#17334F",
                letterSpacing: "-0.15px"
            }}
        >
            Tax Invoice Library
        </div>

        <div
            style={{
                marginTop: "3px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748b"
            }}
        >
            All confirmed quotations & invoices
        </div>
    </div>
</div>

{confirmedDrafts.length === 0 ? (

                        <div
                            style={{
                                padding: "50px 20px",
                                textAlign: "center",
                                background: "#fff",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius: "10px",
                                color: "#64748b"
                            }}
                        >
                            No confirmed quotations
                            are available for tax invoice.
                        </div>

                                       ) : (

                        <>
                            {/* COLUMN HEADINGS */}

                            <div
                                style={{
    display: "grid",
gridTemplateColumns:
    "88px 105px 85px 98px 92px 108px 100px 90px 88px 92px 50px",
    alignItems: "center",
    minHeight: "42px",
    marginBottom: "8px",
    background: "#f4f7ff",
    border: "1px solid #d8e1f3",
    borderRadius: "8px",
    color: "#17334F",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.55px"
}}
                            >

                             {/* INVOICE NO. */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Invoice No.
</div>


{/* CUSTOMER */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Customer
</div>


{/* DESTINATION */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Destination
</div>


{/* TOTAL AMOUNT */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Total Amount
</div>


{/* AMOUNT PAID */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Amount Paid
</div>


{/* PAYMENT STATUS */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Payment Status
</div>


{/* INVOICE STATUS */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Invoice Status
</div>


{/* CONFIRMED ON */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Confirmed On
</div>


{/* INVOICE CREATED */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Invoice Created
</div>


{/* ACTION */}

<div
    style={{
        padding: "0 5px",
        borderRight: "1px solid #cbd5e1",
        boxSizing: "border-box",
        whiteSpace: "normal",
        lineHeight: "1.25",
        textAlign: "center",
        overflow: "hidden"
    }}
>
    Action
</div>


{/* DELETE */}

<div
    style={{
        padding: "0 3px",
        textAlign: "center",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        overflow: "hidden",
        borderRight: "none"
    }}
>
    Delete
</div>

                               

                            </div>


                           {confirmedDrafts
    .filter(draft => {
        const taxInvoice =
            getTaxInvoiceForDraft(draft);

        if (!taxInvoice) {
            return false;
        }

        // TEXT SEARCH
        const search =
            searchText.trim().toLowerCase();

        if (search) {
            const invoiceNo =
                String(
                    taxInvoice?.invoiceNo ||
                    draft?.quotationNo ||
                    ""
                ).toLowerCase();

            const customer =
                String(
                    draft?.commonData?.customerName ||
                    draft?.commonData?.clientName ||
                    taxInvoice?.customerName ||
                    ""
                ).toLowerCase();

            const destination =
                String(
                    draft?.commonData?.destination ||
                    draft?.commonData?.customDestination ||
                    taxInvoice?.destination ||
                    ""
                ).toLowerCase();

            if (
                !invoiceNo.includes(search) &&
                !customer.includes(search) &&
                !destination.includes(search)
            ) {
                return false;
            }
        }

        // MONTH SEARCH — INVOICE CREATED
if (searchMonth) {
    const dateValue =
        taxInvoice?.createdAt || "";

    if (!dateValue) {
        return false;
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(date.getTime()) ||
        String(
            date.getMonth() + 1
        ).padStart(2, "0") !== searchMonth
    ) {
        return false;
    }
}

        return true;
    })
    .map(draft => {

                                const taxInvoice =
                                    getTaxInvoiceForDraft(draft);

                                    if (!taxInvoice) {
    return null;
}

        const balanceDue =
    Number(
        taxInvoice?.balanceDue
    ) || 0;

const invoiceStatus =
    String(
        taxInvoice?.status || "Pending"
    ).toLowerCase();

const isCompleted =
    invoiceStatus === "completed";


    console.log(
    "===== TAX LIBRARY STATUS CHECK =====",
    {
        invoiceNo:
            taxInvoice?.invoiceNo,

        rawStatus:
            taxInvoice?.status,

        invoiceStatus:
            invoiceStatus,

        isCompleted:
            isCompleted,

        paymentStatus:
            taxInvoice?.paymentStatus,

        balanceDue:
            taxInvoice?.balanceDue
    }
);



const paymentStatus =
    isCompleted
        ? balanceDue <= 0
            ? "Paid in Full"
            : `Due ₹${balanceDue.toLocaleString()}`
        : "Invoice Pending";



const paymentStatusColor =
    !isCompleted
        ? "#b45309"       // Pending
        : Number(
            taxInvoice?.advancePaid ??
            taxInvoice?.serviceData?.advancePaid ??
            0
        ) <= 0
            ? "#b91c1c"   // Not Paid
            : Number(
                taxInvoice?.balanceDue ?? 0
            ) > 0
                ? "#7c3aed" // Due
                : "#15803d"; // Paid in Full


const invoiceStatusColor =
    isCompleted
        ? "#15803d"       // Completed
        : "#b45309";      // Not Generated


   // ==========================================
// CONFIRMED DATE
// ==========================================

const confirmedDate =
    draft?.confirmedAt || "";

const formattedConfirmedDate =
    confirmedDate
        ? new Date(confirmedDate)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
        : "—";


// ==========================================
// INVOICE CREATED DATE
// ==========================================

const invoiceCreatedDate =
    taxInvoice?.createdAt || "";

const formattedInvoiceCreatedDate =
    invoiceCreatedDate
        ? new Date(invoiceCreatedDate)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
        : "—";



    return (
       <div
    key={draft.quotationNo}
    style={{
        display: "grid",
   gridTemplateColumns:
    "88px 105px 85px 98px 92px 108px 100px 90px 88px 92px 50px",
        minHeight: "54px",
        background: "#fff",
        border: "1px solid #dce5ea",
        borderRadius: "7px",
        marginBottom: "6px",
        overflow: "hidden",
        boxShadow:
            "0 2px 6px rgba(23,51,79,.04)"
    }}
>
                               

                                <div
    style={{
        padding: "0 5px",
        fontSize: "12px",
        fontWeight: 700,
        color: "#17334F",
        borderRight: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        overflow: "hidden"
    }}
>
    {taxInvoice?.displayQuotationNo ||
        draft.displayQuotationNo ||
        draft.quotationNo}
</div>

                                  <div
    style={{
    padding: "0 6px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#1f2937",
    borderRight: "1px solid #e2e8f0",
    boxSizing: "border-box",
    lineHeight: "1.25",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
}}
>
    {taxInvoice?.clientName ||
        draft.clientName ||
        "Unnamed Client"}
</div>

                                   <div
   style={{
    padding: "0 6px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#234e70",
    borderRight: "1px solid #e2e8f0",
    boxSizing: "border-box",
    lineHeight: "1.25",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
}}
>
    {taxInvoice?.destination ||
        draft.destination ||
        "—"}
</div>


{/* TOTAL AMOUNT */}

<div
    style={{
        padding: "0 10px",
       
boxSizing: "border-box",
overflow: "hidden",
        fontSize: "12px",
        fontWeight: 700,
        color: "#17334F",
        borderRight: "1px solid #e2e8f0",
        textAlign: "right",
        whiteSpace: "nowrap"
    }}
>
    ₹{Number(
        taxInvoice?.grandTotal ??
        taxInvoice?.totalAmountPayable ??
        0
    ).toLocaleString("en-IN")}
</div>

{/* AMOUNT PAID */}

<div
    style={{
        padding: "0 10px",
        
boxSizing: "border-box",
overflow: "hidden",
        fontSize: "12px",
        fontWeight: 700,
        color: "#15803d",
        borderRight: "1px solid #e2e8f0",
        textAlign: "right",
        whiteSpace: "nowrap"
    }}
>
    ₹{Number(
        taxInvoice?.advancePaid ??
        taxInvoice?.serviceData?.advancePaid ??
        0
    ).toLocaleString("en-IN")}
</div>

{/* PAYMENT STATUS */}

<div
    style={{
        padding: "0 10px",
        whiteSpace: "nowrap",
boxSizing: "border-box",
overflow: "hidden",
        fontSize: "11px",
        fontWeight: 700,
        color: paymentStatusColor,
        borderRight: "1px solid #e2e8f0",
       textAlign: "center"
    }}
>
    {!isCompleted
        ? "Pending"
        : Number(
            taxInvoice?.advancePaid ??
            taxInvoice?.serviceData?.advancePaid ??
            0
        ) <= 0
            ? "Not Paid"
            : Number(
                taxInvoice?.balanceDue ?? 0
            ) <= 0
                ? "Paid in Full"
                : `Due · ₹${Number(
                    taxInvoice?.balanceDue || 0
                ).toLocaleString("en-IN")}`
    }
</div>

{/* INVOICE STATUS */}

<div
    style={{
        padding: "0 10px",
        
boxSizing: "border-box",
overflow: "hidden",
        fontSize: "11px",
        fontWeight: 700,
       color: invoiceStatusColor,
        borderRight: "1px solid #e2e8f0",
        textAlign: "center",
        whiteSpace: "nowrap"
    }}
>
    {isCompleted
        ? "Completed"
        : "Not Generated"}
</div>


                              
{/* CONFIRMED DATE */}

<div
    style={{
    padding: "0 8px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#475569",
    borderRight:
        "1px solid #e2e8f0",
    textAlign: "center",
    whiteSpace: "nowrap"
}}
>
    {formattedConfirmedDate}
</div>


{/* INVOICE CREATED DATE */}

<div
    style={{
    padding: "0 8px",
    fontSize: "11px",
    fontWeight: taxInvoice ? 600 : 500,
    color: taxInvoice
        ? "#475569"
        : "#64748b",
    borderRight:
        "1px solid #e2e8f0",
    textAlign: "center",
    whiteSpace: "nowrap"
}}
>
    {formattedInvoiceCreatedDate}
</div>



                             <div
    style={{
        padding: "0 3px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        overflow: "hidden"
    }}
>
    <button
        type="button"
        onClick={() =>
            onOpen?.(
                draft,
                taxInvoice
            )
        }
        style={{
    background:
        isCompleted
            ? "#0f766e"
            : "#17334F",
    color: "#fff",
    border: "none",
    padding: "6px 7px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden"
}}
    >
       {isCompleted
    ? "Open / Update"
    : "Create Invoice"}
    </button>
</div>

<div
    style={{
        padding: "0 3px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        borderRight: "none"
    }}
>
    <button
        type="button"
     onClick={async () => {

    const invoiceNo =
        taxInvoice?.invoiceNo ||
        draft?.quotationNo;

    console.log(
        "🗑 DELETE REQUEST:",
        invoiceNo
    );

    if (!invoiceNo) {

        console.warn(
            "🗑 DELETE ABORTED: NO INVOICE NUMBER"
        );

        return;
    }

    const confirmed =
        window.confirm(
            taxInvoice?.status === "Completed"
                ? "Delete this completed tax invoice?"
                : "Delete this pending tax invoice?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteTaxInvoice(
            invoiceNo
        );

        console.log(
            "🗑 TAX INVOICE DELETED:",
            invoiceNo
        );

      if (onRefresh) {
    onRefresh();
}

setShowImportConfirmed(false);

sessionStorage.removeItem(
    "taxInvoiceRestoreOpen"
);

    } catch (error) {

        console.error(
            "🗑 TAX INVOICE DELETE FAILED:",
            error
        );

        alert(
            "Tax Invoice could not be deleted."
        );

    }

}}
        style={{
            width: "30px",
            height: "30px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            background: "#fff",
            color: "#b91c1c",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}
        title="Delete tax invoice"
    >
        🗑
    </button>
</div>



                                </div>
                            );

                        })}

                        </>

                    )}
</div>
                </div>

            </div>

        </div>
        
    );
}