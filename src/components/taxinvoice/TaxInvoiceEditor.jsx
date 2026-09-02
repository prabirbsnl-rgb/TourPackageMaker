

import React from "react";

export default function TaxInvoiceEditor({
    invoice,
    onClose,
    onSave,
    onSaveAndSend
}) {

        const [invoiceData, setInvoiceData] =
        React.useState(invoice);

        const [serviceData, setServiceData] =
    React.useState(() => ({
       description:
    invoice?.commonData?.customDestination?.trim()
        ? `${invoice.commonData.customDestination.trim()} Package`
        : invoice?.commonData?.destination
            ? `${invoice.commonData.destination} Package`
            : "Tour Package",
        hsnSac: "",
        qty: 1,

        // Prefill ONLY from confirmed draft
        rate:
    invoice?.totalAmountPayable ??
    invoice?.commonData?.totalAmountPayable ??
    "",

        // User must choose/enter this
        taxPercent: 5,

      // Manual adjustment
discountOtherCharges:
    invoice?.serviceData?.discountOtherCharges ??
    invoice?.discountOtherCharges ??
    "",

// Saved payment amount
advancePaid:
    invoice?.serviceData?.advancePaid ??
    invoice?.advancePaid ??
    "",

       // GST treatment
taxTreatment: "inclusive",

// Payment mode selection
paymentModes: {
    bank: false,
    upi: false,
    cash: false,
    card: false
}
    }));


    React.useEffect(() => {
    setInvoiceData(invoice);
}, [invoice]);



React.useEffect(() => {

    if (!invoice) return;

    setServiceData(prev => ({
        ...prev,

        advancePaid:
            invoice?.serviceData?.advancePaid ??
            invoice?.advancePaid ??
            "",

        discountOtherCharges:
            invoice?.serviceData?.discountOtherCharges ??
            invoice?.discountOtherCharges ??
            ""

    }));

}, [invoice]);



  React.useEffect(() => {

    if (!invoice) return;

    const invoiceRate =
        Number(
            invoice?.totalAmountPayable
        ) || 0;

    const commonDataRate =
        Number(
            invoice?.commonData?.totalAmountPayable
        ) || 0;

    const quotationRate =
        invoiceRate > 0
            ? invoiceRate
            : commonDataRate > 0
                ? commonDataRate
                : 0;

    setServiceData(prev => ({
        ...prev,

      rate:
    prev.taxTreatment === "inclusive" &&
    Number(prev.taxPercent) > 0
        ? quotationRate /
          (1 + Number(prev.taxPercent) / 100)
        : quotationRate,

        paymentModes: {
            bank: false,
            upi: false,
            cash: false,
            card: false
        },

        upi: ""
    }));

}, [
    invoice,
    serviceData.taxTreatment,
    serviceData.taxPercent
]);






React.useEffect(() => {

    if (!invoice) return;

    const destination =
        invoice?.commonData?.customDestination?.trim()
            || invoice?.commonData?.destination
            || "";

    setServiceData(prev => ({
        ...prev,

        description:
            destination
                ? `${destination} Package`
                : "Tour Package"
    }));

}, [invoice]);



React.useEffect(() => {

    if (serviceData.taxTreatment === "none") {

        setServiceData(prev => ({
            ...prev,
            taxPercent: 0
        }));

        return;
    }

    if (
        serviceData.taxTreatment === "inclusive" ||
        serviceData.taxTreatment === "exclusive"
    ) {

        setServiceData(prev => {

            if (Number(prev.taxPercent) === 0) {

                return {
                    ...prev,
                    taxPercent: 5
                };

            }

            return prev;

        });
    }

}, [serviceData.taxTreatment]);








if (!invoice) {
    return null;
}


const grossQuotedAmount =
    Number(
        invoice?.totalAmountPayable ??
        invoice?.commonData?.totalAmountPayable ??
        0
    ) || 0;


   


const taxPercent =
    Number(serviceData.taxPercent) || 0;

const qty =
    Number(serviceData.qty) || 1;

    const rate =
    Number(serviceData.rate) || 0;

   

const discountOtherCharges =
    Number(
        serviceData.discountOtherCharges
    ) || 0;

const advancePaid =
    Number(serviceData.advancePaid) || 0;


   const sourceQuotedAmount =
    rate * qty;



/* =========================================
   TAX INVOICE CALCULATION
========================================= */

let taxableValue = 0;
let taxAmount = 0;
let lineAmount = 0;


/* =========================================
   GST INCLUSIVE
========================================= */

if (
    serviceData.taxTreatment === "inclusive"
) {

    taxableValue =
        sourceQuotedAmount;

    taxAmount =
        taxableValue *
        taxPercent /
        100;

    lineAmount =
        taxableValue +
        taxAmount;


/* =========================================
   GST EXCLUSIVE
========================================= */

} else if (
    serviceData.taxTreatment === "exclusive"
) {

    taxableValue =
        sourceQuotedAmount;

    taxAmount =
        taxableValue *
        taxPercent /
        100;

    lineAmount =
        taxableValue +
        taxAmount;


/* =========================================
   NO GST / EXEMPT
========================================= */

} else {

    taxableValue =
        sourceQuotedAmount;

    taxAmount = 0;

    lineAmount =
        taxableValue;
}


/* =========================================
   TOTALS
========================================= */

const totalTax =
    taxAmount;

const grandTotal =
    Math.max(
        0,
        taxableValue +
        totalTax -
        discountOtherCharges
    );

const balanceDue =
    Math.max(
        0,
        grandTotal -
        advancePaid
    );



    const numberToIndianWords = (number) => {

    const n = Math.round(
        Number(number) || 0
    );

    if (n === 0) {
        return "ZERO";
    }

    const ones = [
        "",
        "ONE",
        "TWO",
        "THREE",
        "FOUR",
        "FIVE",
        "SIX",
        "SEVEN",
        "EIGHT",
        "NINE",
        "TEN",
        "ELEVEN",
        "TWELVE",
        "THIRTEEN",
        "FOURTEEN",
        "FIFTEEN",
        "SIXTEEN",
        "SEVENTEEN",
        "EIGHTEEN",
        "NINETEEN"
    ];

    const tens = [
        "",
        "",
        "TWENTY",
        "THIRTY",
        "FORTY",
        "FIFTY",
        "SIXTY",
        "SEVENTY",
        "EIGHTY",
        "NINETY"
    ];

    const twoDigits = (num) => {

        if (num < 20) {
            return ones[num];
        }

        return (
            tens[Math.floor(num / 10)] +
            (
                num % 10
                    ? " " + ones[num % 10]
                    : ""
            )
        );
    };

    const convert = (num) => {

        let result = "";

        if (num >= 10000000) {

            result +=
                convert(
                    Math.floor(
                        num / 10000000
                    )
                ) +
                " CRORE ";

            num %= 10000000;
        }

        if (num >= 100000) {

            result +=
                convert(
                    Math.floor(
                        num / 100000
                    )
                ) +
                " LAKH ";

            num %= 100000;
        }

        if (num >= 1000) {

            result +=
                convert(
                    Math.floor(
                        num / 1000
                    )
                ) +
                " THOUSAND ";

            num %= 1000;
        }

        if (num >= 100) {

            result +=
                ones[
                    Math.floor(num / 100)
                ] +
                " HUNDRED ";

            num %= 100;
        }

        if (num > 0) {
            result += twoDigits(num);
        }

        return result.trim();
    };

    return convert(n);
};



const amountInWords =
    balanceDue <= 0
        ? "PAID IN FULL"
        : `RUPEES ${numberToIndianWords(
            balanceDue
        )} ONLY`;




    const formatInvoiceDate = (date) => {

    if (!date) return "";

    const [year, month, day] =
        String(date).split("-");

    if (!year || !month || !day) {
        return date;
    }

    return `${day}-${month}-${year}`;
};



    const invoiceLabelStyle = {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    boxSizing: "border-box",
    fontSize: "10px",
    fontWeight: 700,
    color: "#1f2937",
    background: "#eef4f7",
    borderRight: "1px solid #d5e0e6"
};

const invoiceValueStyle = {
    display: "flex",
    alignItems: "center",
    padding: "4px 8px",
    boxSizing: "border-box",
    background: "#fff",
    borderRight: "1px solid #d5e0e6"
};

const invoiceValueBoxStyle = {
    width: "100%",
    height: "25px",
    padding: "3px 6px",
    boxSizing: "border-box",
    border: "1px solid #cbd8df",
    borderRadius: "2px",
    background: "#fff",
    fontSize: "10px",
    color: "#1f2937",
    outline: "none"
};


const supplierFixedValueStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "9px",
    color: "#1f2937",
    padding: 0,
    boxSizing: "border-box"
};


    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                background: "#eef2f7",
                overflowY: "auto",
                padding: "24px",
                boxSizing: "border-box"
            }}
        >

            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto"
                }}
            >

                {/* EDITOR HEADER */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "18px"
                    }}
                >

                    <div>
                        <div
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#17334F"
                            }}
                        >
                            Tax Invoice Editor
                        </div>

                        <div
                            style={{
                                marginTop: "3px",
                                fontSize: "12px",
                                color: "#64748b"
                            }}
                        >
                            {invoice.displayQuotationNo ||
                                invoice.quotationNo}
                        </div>
                    </div>



                    <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
    }}
>

     {/* SAVE */}


                    <button
    type="button"
    onClick={() => onSave?.({
    ...invoiceData,

    serviceData:
        structuredClone(serviceData),

    // ==========================================
    // CALCULATED INVOICE VALUES
    // ==========================================

    grossQuotedAmount:
        grossQuotedAmount,

    sourceQuotedAmount:
        sourceQuotedAmount,

    taxableValue:
        taxableValue,

    taxAmount:
        taxAmount,

    totalTax:
        totalTax,

    grandTotal:
        grandTotal,

    advancePaid:
        advancePaid,

    balanceDue:
        balanceDue,

    amountInWords:
        amountInWords,

   // ==========================================
// PAYMENT STATUS
// ==========================================

paymentStatus:
    balanceDue <= 0
        ? "Paid in Full"
        : `Due ₹${balanceDue.toLocaleString()}`,

// ==========================================
// INVOICE STATUS
// ==========================================

status:
    "Completed",

createdAt:
    invoiceData?.createdAt ||
    new Date().toISOString(),

updatedAt:
    new Date().toISOString()
})}

    style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#17334F",
    color: "#fff",
    border: "1px solid #17334F",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    boxShadow: "0 2px 6px rgba(23, 51, 79, 0.16)",
    transition: "all 0.2s ease"
}}
>
    💾 Save
</button>

   {/* BACK */}

                    <button
                        type="button"
                        onClick={onClose}
                        style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#ffffff",
    color: "#17334F",
    border: "1px solid #c8d5df",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    boxShadow: "0 2px 5px rgba(23, 51, 79, 0.08)",
    transition: "all 0.2s ease"
}}
                    >
                       ← Back
                    </button>

</div>
                </div>


                {/* TEMPORARY EDITOR SURFACE */}

               <div
    style={{
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
        zoom: 1.19,
        background: "#fff",
        boxSizing: "border-box",
        padding: "32px 34px",
        boxShadow:
            "0 4px 20px rgba(15,23,42,.10)",
        color: "#1f2937",
        fontFamily: "Arial, sans-serif"
    }}
>

    {/* =========================================
        TAX INVOICE HEADER
    ========================================= */}

    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: "14px",
            borderBottom: "2px solid #17334F"
        }}
    >

       
{/* =========================================
    ORBITZ BRANDING
========================================= */}

<div
    style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
    }}
>
    <img
        src="/orbitz-logo.png"
        alt="Orbitz Holidays"
        style={{
            width: "115px",
            height: "auto",
            objectFit: "contain",
            display: "block"
        }}
    />

    <div
        style={{
            marginTop: "4px",
            fontSize: "11px",
            color: "#17334F",
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            whiteSpace: "nowrap"
        }}
    >
        Anywhere, Anytime, Around the World
    </div>
</div>

        {/* INVOICE TITLE */}

       <div
    style={{
        textAlign: "right"
    }}
>
    <div
        style={{
            fontSize: "25px",
            fontWeight: 800,
            color: "#17334F",
            letterSpacing: "1px"
        }}
    >
        TAX INVOICE
    </div>

    <div
        style={{
            marginTop: "5px",
            fontSize: "11px",
            color: "#64748b"
        }}
    >
        Invoice No.{" "}
        <strong style={{ color: "#1f2937" }}>
            {invoice.displayQuotationNo ||
                invoice.quotationNo ||
                "—"}
        </strong>
    </div>
</div>
 </div>


{/* =========================================
    COMPANY CONTACT STRIP
========================================= */}

<div
   style={{
    marginTop: "6px",
    width: "100%",
    padding: "7px 6px",
    boxSizing: "border-box",
    background: "#e8f1f4",
    borderTop: "1px solid #c7d9df",
    borderBottom: "1px solid #c7d9df",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "0",
    fontSize: "8px",
    fontWeight: 600,
    color: "#17324d",
    whiteSpace: "nowrap",
    overflow: "hidden"
}}
>
    <span
    style={{
        flex: "1.7 1 0",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    }}
>
    <span
        style={{
            marginRight: "4px",
            color: "#007f83",
            fontSize: "11px",
            fontWeight: 700
        }}
    >
        ⌖
    </span>
    B-7/37(S), Central Park, Kalyani, West Bengal - 741235
</span>

   <span
    style={{
        color: "#9fb4bc",
        flexShrink: 0,
        fontSize: "9px"
    }}
>
    |
</span>

    <span
    style={{
        flex: "0.75 1 0",
        minWidth: 0,
        textAlign: "center"
    }}
>
        <span
            style={{
                marginRight: "4px",
                color: "#007f83",
fontSize: "11px",
fontWeight: 700
            }}
        >
            ☎
        </span>
        +91 98304 89892
    </span>

   <span
    style={{
        color: "#9fb4bc",
        flexShrink: 0,
        fontSize: "9px"
    }}
>
    |
</span>

   <span
    style={{
        flex: "0.75 1 0",
        minWidth: 0,
        textAlign: "center"
    }}
>
        <span
            style={{
                marginRight: "4px",
                color: "#007f83",
fontSize: "11px",
fontWeight: 700
            }}
        >
            ☎
        </span>
        +91 93308 44031
    </span>

   <span
    style={{
        color: "#9fb4bc",
        flexShrink: 0,
        fontSize: "9px"
    }}
>
    |
</span>

    <span
    style={{
        flex: "1.05 1 0",
        minWidth: 0,
        textAlign: "center",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }}
>
        <span
            style={{
                marginRight: "4px",
               color: "#007f83",
fontSize: "11px",
fontWeight: 700
            }}
        >
            ✉
        </span>
        info@orbitzholidays.com
    </span>

 <span
    style={{
        color: "#9fb4bc",
        flexShrink: 0,
        fontSize: "9px"
    }}
>
    |
</span>

   <span
    style={{
        flex: "0.85 1 0",
        minWidth: 0,
        textAlign: "center",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }}
>
        <span
            style={{
                marginRight: "4px",
               color: "#007f83",
fontSize: "11px",
fontWeight: 700
            }}
        >
            ◉
        </span>
        www.orbitzholidays.com
    </span>
</div>



   {/* =========================================
    INVOICE DETAILS
========================================= */}

<div
    style={{
        marginTop: "10px",
        border: "1px solid #cbd5e1",
        boxSizing: "border-box"
    }}
>

    {/* DARK SECTION RIBBON */}

    <div
        style={{
            height: "28px",
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            background: "#17334F",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".2px"
        }}
    >
        INVOICE DETAILS
    </div>


    {/* ROW 1 */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "115px 1fr 115px 1fr",
            minHeight: "34px",
            borderTop:
                "1px solid #dbe3ea"
        }}
    >

        {/* INVOICE NO. */}

        <div
            style={invoiceLabelStyle}
        >
            Invoice No.
        </div>

        <div style={invoiceValueStyle}>
    <div
        style={{
            ...invoiceValueBoxStyle,
            display: "flex",
            alignItems: "center"
        }}
    >
        {invoiceData?.displayQuotationNo ||
            invoiceData?.quotationNo ||
            "—"}
    </div>
</div>

        {/* INVOICE DATE */}

        <div
            style={invoiceLabelStyle}
        >
            Invoice Date
        </div>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                boxSizing: "border-box"
            }}
        >
            <input
                type="date"
                value={
                    invoiceData?.invoiceDate || ""
                }
                onChange={(e) =>
                    setInvoiceData({
                        ...invoiceData,
                        invoiceDate:
                            e.target.value
                    })
                }
               style={invoiceValueBoxStyle}
            />
        </div>

    </div>


    {/* ROW 2 */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "115px 1fr 115px 1fr",
            minHeight: "34px",
            borderTop:
                "1px solid #dbe3ea"
        }}
    >

      {/* PLACE OF SUPPLY */}

<div
    style={invoiceLabelStyle}
>
    Place of Supply
</div>

<div style={invoiceValueStyle}>
    <input
        type="text"
        value="KALYANI"
        readOnly
        style={invoiceValueBoxStyle}
    />
</div>


        {/* DUE DATE */}

        <div
            style={invoiceLabelStyle}
        >
            Due Date
        </div>

        <div
           style={invoiceValueBoxStyle}
        >
            <input
                type="date"
                value={
                    invoiceData?.dueDate || ""
                }
                onChange={(e) =>
                    setInvoiceData({
                        ...invoiceData,
                        dueDate:
                            e.target.value
                    })
                }
                style={{
                    width: "100%",
                    height: "25px",
                    border:
                        "1px solid #d1d5db",
                    borderRadius: "3px",
                    padding: "3px 6px",
                    boxSizing: "border-box",
                    fontSize: "10px",
                    outline: "none"
                }}
            />
        </div>

    </div>

</div>


{/* =========================================
    SUPPLIER & CUSTOMER
========================================= */}

<div
    style={{
        marginTop: "10px",
        border: "1px solid #cbd5e1",
        boxSizing: "border-box"
    }}
>

    {/* DARK SECTION RIBBON */}

    <div
        style={{
            height: "28px",
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            background: "#17334F",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".2px"
        }}
    >
        SUPPLIER & CUSTOMER
    </div>


    {/* TWO-COLUMN BODY */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "150px"
        }}
    >

        {/* =====================================
            SUPPLIER
        ===================================== */}

        <div
            style={{
    padding: "8px 10px",
    boxSizing: "border-box",
    background: "#eef4f7",
    borderRight:
        "1px solid #d5e0e6",
    textAlign: "left"
}}
>
            <div
    style={{
        fontSize: "10px",
        lineHeight: "15px",
        color: "#1f2937",
        textAlign: "left"
    }}
>

    <div
        style={{
            fontWeight: 700,
            marginBottom: "4px"
        }}
    >
        ORBITZ HOLIDAYS
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "3px"
        }}
    >
        <span>
            GSTIN:
        </span>

       <input
    type="text"
    value="19AYTPS0423N1ZO"
    readOnly
    style={supplierFixedValueStyle}
/>
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "3px"
        }}
    >
        <span>
            PAN:
        </span>

      <input
    type="text"
    value="AYTPS0423N"
    readOnly
    style={supplierFixedValueStyle}
/>
    </div>

    <div
        style={{
            marginTop: "3px"
        }}
    >
        B-7/37(S), Central Park, Kalyani,
        West Bengal – 741235
    </div>

</div>
        </div>


        {/* =====================================
            CUSTOMER
        ===================================== */}

        <div
            style={{
                padding: "10px",
                boxSizing: "border-box",
                background: "#fff"
            }}
        >

            <div
                style={{
    display: "grid",
    gridTemplateColumns:
        "105px 1fr",
    columnGap: "6px",
    rowGap: "4px",
    alignItems: "center",
    fontSize: "10px"
}}
            >

                {/* CUSTOMER NAME */}

                <div
                   style={{
    fontWeight: 700,
    textAlign: "left"
}}
                >
                    Customer Name:
                </div>

                <input
                    type="text"
                   value={
    invoiceData?.clientName ??
    invoiceData?.commonData?.clientName ??
    ""
}
                    onChange={(e) =>
                        setInvoiceData({
                            ...invoiceData,
                            clientName:
                                e.target.value
                        })
                    }
                    style={invoiceValueBoxStyle}
                />


                {/* GSTIN / PAN */}

                <div
                   style={{
    fontWeight: 700,
    textAlign: "left"
}}
                >
                    GSTIN / PAN:
                </div>

                <input
                    type="text"
                    value={
    invoiceData?.customerGstinPan ??
    invoiceData?.commonData?.customerGstinPan ??
    invoiceData?.commonData?.customerGstin ??
    invoiceData?.commonData?.customerPan ??
    ""
}
                    onChange={(e) =>
                        setInvoiceData({
                            ...invoiceData,
                            customerGstinPan:
                                e.target.value
                        })
                    }
                    placeholder="If applicable"
                    style={invoiceValueBoxStyle}
                />


                {/* BILLING ADDRESS */}

                <div
                    style={{
    fontWeight: 700,
    textAlign: "left"
}}
                >
                    Billing Address:
                </div>

                <input
                    type="text"
                   value={
    invoiceData?.customerAddress ??
    invoiceData?.commonData?.customerAddress ??
    invoiceData?.commonData?.city ??
    ""
}
                    onChange={(e) =>
                        setInvoiceData({
                            ...invoiceData,
                            customerAddress:
                                e.target.value
                        })
                    }
                    placeholder="Enter billing address"
                    style={invoiceValueBoxStyle}
                />


                {/* MOBILE */}

                <div
                    style={{
    fontWeight: 700,
    textAlign: "left"
}}
                >
                    Mobile:
                </div>

                <input
                    type="text"
                    value={
    invoiceData?.mobile ??
    invoiceData?.commonData?.mobile ??
    ""
}
                    onChange={(e) =>
                        setInvoiceData({
                            ...invoiceData,
                            mobile:
                                e.target.value
                        })
                    }
                    style={invoiceValueBoxStyle}
                />


                {/* EMAIL */}

                <div
                   style={{
    fontWeight: 700,
    textAlign: "left"
}}
                >
                    Email:
                </div>

                <input
                    type="email"
                   value={
    invoiceData?.email ??
    invoiceData?.commonData?.email ??
    ""
}
                    onChange={(e) =>
                        setInvoiceData({
                            ...invoiceData,
                            email:
                                e.target.value
                        })
                    }
                    style={invoiceValueBoxStyle}
                />

            </div>

        </div>

    </div>

    </div>

    {/* =========================================
    TRAVEL / BOOKING REFERENCE
========================================= */}

<div
    style={{
        marginTop: "10px",
        border: "1px solid #cbd5e1",
        boxSizing: "border-box"
    }}
>

    {/* DARK SECTION RIBBON */}

    <div
        style={{
            height: "28px",
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            background: "#17334F",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".2px"
        }}
    >
        TRAVEL / BOOKING REFERENCE
    </div>


    {/* COLUMN HEADERS */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "115px 1.35fr 1.15fr 1.35fr 65px",
            background: "#dfe9ee",
            minHeight: "27px",
            borderTop:
                "1px solid #cbd5e1"
        }}
    >

        <div
            style={{
                padding: "5px 6px",
                fontSize: "9px",
                fontWeight: 700,
                boxSizing: "border-box"
            }}
        >
            Booking / Ref.
        </div>

        <div
            style={{
                padding: "5px 6px",
                fontSize: "9px",
                fontWeight: 700,
                boxSizing: "border-box"
            }}
        >
            Passenger(s)
        </div>

        <div
            style={{
                padding: "5px 6px",
                fontSize: "9px",
                fontWeight: 700,
                boxSizing: "border-box"
            }}
        >
            Destination
        </div>

        <div
            style={{
                padding: "5px 6px",
                fontSize: "9px",
                fontWeight: 700,
                boxSizing: "border-box"
            }}
        >
            Travel Dates
        </div>

        <div
            style={{
                padding: "5px 6px",
                fontSize: "9px",
                fontWeight: 700,
                textAlign: "center",
                boxSizing: "border-box"
            }}
        >
            Pax
        </div>

    </div>


    {/* VALUES */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "115px 1.35fr 1.15fr 1.35fr 65px",
            minHeight: "31px",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        {/* BOOKING / REF */}

        <div
            style={{
                padding: "3px 6px",
                boxSizing: "border-box",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
    type="text"
    value={
        invoiceData?.displayQuotationNo ||
        invoiceData?.quotationNo ||
        invoiceData?.commonData?.quotationNo ||
        ""
    }
    readOnly
    style={{
        ...invoiceValueBoxStyle,
        height: "24px",
        fontSize: "9px",
        background: "#f8fafc",
        cursor: "default"
    }}
/>
        </div>


        {/* PASSENGER(S) */}

        <div
            style={{
                padding: "3px 6px",
                boxSizing: "border-box",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="text"
                value={
                    invoiceData?.passengerName ??
                    invoiceData?.clientName ??
                    invoiceData?.commonData?.clientName ??
                    ""
                }
                onChange={(e) =>
                    setInvoiceData({
                        ...invoiceData,
                        passengerName:
                            e.target.value
                    })
                }
                placeholder="Passenger name"
                style={{
                    ...invoiceValueBoxStyle,
                    height: "24px",
                    fontSize: "9px"
                }}
            />
        </div>


        {/* DESTINATION */}

        <div
            style={{
                padding: "3px 6px",
                boxSizing: "border-box",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="text"
                value={
                    invoiceData?.destination ??
                    invoiceData?.commonData?.customDestination ??
                    invoiceData?.commonData?.destination ??
                    ""
                }
                onChange={(e) =>
                    setInvoiceData({
                        ...invoiceData,
                        destination:
                            e.target.value
                    })
                }
                placeholder="Destination"
                style={{
                    ...invoiceValueBoxStyle,
                    height: "24px",
                    fontSize: "9px"
                }}
            />
        </div>


        {/* TRAVEL DATES */}

        <div
            style={{
                padding: "3px 6px",
                boxSizing: "border-box",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="text"
              value={
    invoiceData?.travelDates
        ? invoiceData.travelDates
            .split(" – ")
            .map(date => {
                const [year, month, day] =
                    date.split("-");

                return `${day}-${month}-${year}`;
            })
            .join(" – ")
        : (
            invoiceData?.commonData?.travelFrom ||
            invoiceData?.commonData?.travelTo
        )
            ? `${formatInvoiceDate(
                invoiceData?.commonData?.travelFrom
            )} – ${formatInvoiceDate(
                invoiceData?.commonData?.travelTo
            )}`
            : ""
}
                onChange={(e) =>
                    setInvoiceData({
                        ...invoiceData,
                        travelDates:
                            e.target.value
                    })
                }
                placeholder="Travel dates"
                style={{
                    ...invoiceValueBoxStyle,
                    height: "24px",
                    fontSize: "9px"
                }}
            />
        </div>


        {/* PAX */}

        <div
            style={{
                padding: "3px 5px",
                boxSizing: "border-box"
            }}
        >
            <input
                type="text"
                value={
    invoiceData?.pax ??
    (
        (
            Number(
                invoiceData?.commonData?.adults || 0
            ) +
            Number(
                invoiceData?.commonData?.children || 0
            )
        ) || ""
    )
}
                onChange={(e) =>
                    setInvoiceData({
                        ...invoiceData,
                        pax:
                            e.target.value
                    })
                }
                style={{
                    ...invoiceValueBoxStyle,
                    height: "24px",
                    fontSize: "9px",
                    textAlign: "center"
                }}
            />
        </div>

    </div>

</div>


{/* =========================================
    SERVICES / PARTICULARS
========================================= */}

<div
    style={{
        marginTop: "10px",
        border: "1px solid #cbd5e1",
        boxSizing: "border-box",
        background: "#fff"
    }}
>

    {/* DARK SECTION HEADER */}

    <div
        style={{
            height: "28px",
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            background: "#17334F",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700
        }}
    >
        SERVICES / PARTICULARS
    </div>


    {/* TABLE HEADER */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "28px 1.7fr 65px 40px 78px 52px 72px 88px",
            minHeight: "28px",
            background: "#dfe9ee",
            borderTop:
                "1px solid #cbd5e1"
        }}
    >

        {[
            "#",
            "Description of Service / Package",
            "HSN/SAC",
            "Qty",
            "Rate (₹)",
            "Tax %",
            "Tax (₹)",
            "Amount (₹)"
        ].map((label, index) => (

            <div
                key={label}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        index === 0 ||
                        index >= 3
                            ? "center"
                            : "flex-start",
                    padding: "4px 5px",
                    boxSizing: "border-box",
                    borderRight:
                        "1px solid #cbd5e1",
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#17334F"
                }}
            >
                {label}
            </div>

        ))}

    </div>


    {/* SERVICE ROW */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "28px 1.7fr 65px 40px 78px 52px 72px 88px",
            minHeight: "38px",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        {/* NUMBER */}

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            1
        </div>


        {/* DESCRIPTION */}

        <div
            style={{
                padding: "4px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="text"
                value={
                    serviceData.description
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        description:
                            e.target.value
                    })
                }
                style={{
                    ...invoiceValueBoxStyle,
                    height: "27px",
                    fontSize: "9px"
                }}
            />
        </div>


        {/* HSN / SAC */}

        <div
            style={{
                padding: "4px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="text"
                value={
                    serviceData.hsnSac
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        hsnSac:
                            e.target.value
                    })
                }
                style={{
                    ...invoiceValueBoxStyle,
                    height: "27px",
                    fontSize: "9px"
                }}
            />
        </div>


        {/* QTY */}

        <div
            style={{
                padding: "4px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="number"
                min="1"
                value={
                    serviceData.qty
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        qty:
                            e.target.value
                    })
                }
                style={{
    ...invoiceValueBoxStyle,
    width: "100%",
    height: "27px",
    boxSizing: "border-box",
    fontSize: "9px",
    textAlign: "center",
    padding: "4px 3px"
}}
            />
        </div>


        {/* RATE */}

        <div
            style={{
                padding: "4px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="number"
                min="0"
                value={
                    serviceData.rate
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        rate:
                            e.target.value
                    })
                }
                style={{
                    ...invoiceValueBoxStyle,
                    height: "27px",
                    fontSize: "9px",
                    textAlign: "right"
                }}
            />
        </div>


        {/* TAX % */}

        <div
            style={{
                padding: "4px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            <input
                type="number"
                min="0"
                value={
                    serviceData.taxPercent
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        taxPercent:
                            e.target.value
                    })
                }
                placeholder="%"
                style={{
                    ...invoiceValueBoxStyle,
                    height: "27px",
                    fontSize: "9px",
                    textAlign: "center"
                }}
            />
        </div>


        {/* TAX */}

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 5px",
                fontSize: "9px",
                borderRight:
                    "1px solid #d5e0e6"
            }}
        >
            {taxAmount.toFixed(2)}
        </div>


        {/* AMOUNT */}

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 5px",
                fontSize: "9px"
            }}
        >
            {lineAmount.toFixed(2)}
        </div>

    </div>


    {/* TAX TREATMENT */}

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 8px",
            background: "#f5f8fa",
            borderTop:
                "1px solid #d5e0e6",
            fontSize: "9px"
        }}
    >

        <strong>
            Tax Treatment:
        </strong>

        <select
            value={
                serviceData.taxTreatment
            }
            onChange={(e) =>
                setServiceData({
                    ...serviceData,
                    taxTreatment:
                        e.target.value
                })
            }
            style={{
                height: "24px",
                border:
                    "1px solid #cbd8df",
                borderRadius: "2px",
                padding: "2px 6px",
                fontSize: "9px",
                background: "#fff"
            }}
        >

            <option value="inclusive">
                GST Inclusive
            </option>

            <option value="exclusive">
                GST Exclusive
            </option>

            <option value="none">
                No GST / Exempt
            </option>

        </select>

    </div>


    {/* TAXABLE VALUE */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "1fr 180px",
            minHeight: "27px",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                background: "#eef4f7",
                fontSize: "9px",
                fontWeight: 600
            }}
        >
            Taxable Value
        </div>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 7px",
                fontSize: "9px"
            }}
        >
            ₹ {taxableValue.toFixed(2)}
        </div>

    </div>


    {/* TOTAL TAX */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "1fr 180px",
            minHeight: "27px",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                background: "#eef4f7",
                fontSize: "9px",
                fontWeight: 600
            }}
        >
            Total Tax
        </div>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 7px",
                fontSize: "9px"
            }}
        >
            ₹ {totalTax.toFixed(2)}
        </div>

    </div>


    {/* DISCOUNT / OTHER CHARGES */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "1fr 180px",
            minHeight: "27px",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                background: "#eef4f7",
                fontSize: "9px",
                fontWeight: 600
            }}
        >
            Discount / Other Charges
        </div>

        <div
            style={{
                padding: "2px 5px"
            }}
        >

            <input
                type="number"
                min="0"
                value={
                    serviceData.discountOtherCharges
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        discountOtherCharges:
                            e.target.value
                    })
                }
                style={{
                    ...invoiceValueBoxStyle,
                    height: "23px",
                    fontSize: "9px",
                    textAlign: "right"
                }}
            />

        </div>

    </div>


    {/* GRAND TOTAL */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "1fr 180px",
            minHeight: "30px",
            background: "#17334F",
            color: "#fff",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                fontSize: "10px",
                fontWeight: 700
            }}
        >
            GRAND TOTAL
        </div>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 7px",
                fontSize: "10px",
                fontWeight: 700
            }}
        >
            ₹ {grandTotal.toFixed(2)}
        </div>

    </div>


    {/* ADVANCE / PAID */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "1fr 180px",
            minHeight: "27px",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                background: "#eef4f7",
                fontSize: "9px",
                fontWeight: 600
            }}
        >
            Advance / Paid
        </div>

        <div
            style={{
                padding: "2px 5px"
            }}
        >

            <input
                type="number"
                min="0"
                value={
                    serviceData.advancePaid
                }
                onChange={(e) =>
                    setServiceData({
                        ...serviceData,
                        advancePaid:
                            e.target.value
                    })
                }
                style={{
                    ...invoiceValueBoxStyle,
                    height: "23px",
                    fontSize: "9px",
                    textAlign: "right"
                }}
            />

        </div>

    </div>


    {/* BALANCE DUE */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                "1fr 180px",
            minHeight: "30px",
            background: "#00858a",
            color: "#fff",
            borderTop:
                "1px solid #d5e0e6"
        }}
    >

        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                fontSize: "10px",
                fontWeight: 700
            }}
        >
            BALANCE DUE
        </div>

        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 7px",
                fontSize: "10px",
                fontWeight: 700
            }}
        >
            {balanceDue <= 0
                ? "NIL"
                : `₹ ${balanceDue.toFixed(2)}`}
        </div>

    </div>


    {/* AMOUNT IN WORDS */}

    <div
        style={{
            minHeight: "28px",
            display: "flex",
            alignItems: "center",
            padding: "5px 8px",
            boxSizing: "border-box",
            background: "#eef4f7",
            borderTop:
                "1px solid #d5e0e6",
            fontSize: "9px"
        }}
    >

        <strong>
            Amount in Words:
        </strong>

        <span
            style={{
                marginLeft: "8px",
                fontWeight: 500
            }}
        >
            {amountInWords}
        </span>

    </div>

</div>


{/* =========================================
    PAYMENT & AUTHORISATION
========================================= */}

<div
    style={{
        marginTop: "8px",
        border: "1px solid #cbd8df",
        boxSizing: "border-box"
    }}
>

    {/* SECTION HEADER */}

    <div
    style={{
        background: "#172a46",
        color: "#fff",
        padding: "5px 9px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.2px",
        textAlign: "left"
    }}
>
    PAYMENT & AUTHORISATION
</div>


    {/* TWO COLUMN BODY */}

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "72px"
        }}
    >

        {/* LEFT — PAYMENT / BANK DETAILS */}

        <div
            style={{
    padding: "6px 9px",
    background: "#f5f8fa",
    borderRight: "1px solid #cbd8df",
    boxSizing: "border-box",
    fontSize: "8px",
    color: "#1f2937",
    lineHeight: "1.35",
    textAlign: "left"
}}
        >

            <div
    style={{
        fontWeight: 700,
        marginBottom: "3px",
        textAlign: "left"
    }}
>
    Payment / Bank Details
</div>

         <div
    style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "2px"
    }}
>
    <strong>
        Mode:
    </strong>

    {[
        ["bank", "Bank"],
        ["upi", "UPI"],
        ["cash", "Cash"],
        ["card", "Card"]
    ].map(([key, label]) => (
        <label
            key={key}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                cursor: "pointer",
                fontWeight: 400
            }}
        >
            <input
                type="checkbox"
                checked={
                    Boolean(
                        serviceData.paymentModes?.[key]
                    )
                }
                onChange={(e) =>
                    setServiceData(prev => ({
                        ...prev,

                        paymentModes: {
                            ...(prev.paymentModes || {}),
                            [key]:
                                e.target.checked
                        }
                    }))
                }
                style={{
                    width: "11px",
                    height: "11px",
                    margin: 0,
                    accentColor: "#008b8f"
                }}
            />

            <span>
                {label}
            </span>
        </label>
    ))}
</div>

<div style={{ textAlign: "left" }}>
    Bank: HDFC BANK
</div>

<div style={{ textAlign: "left" }}>
    A/c Name: ORBITZ HOLIDAYS
</div>

<div style={{ textAlign: "left" }}>
    A/c No.: 50200073402702
</div>

<div style={{ textAlign: "left" }}>
    IFSC: HDFC0000320
</div>

            <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "left",
        marginTop: "2px"
    }}
>
                <span
                    style={{
                        fontWeight: 700,
                        marginRight: "4px"
                    }}
                >
                    UPI:
                </span>

                <input
                    type="text"
                    value={serviceData.upi}
                    onChange={(e) =>
                        setServiceData(prev => ({
                            ...prev,
                            upi: e.target.value
                        }))
                    }
                    style={{
                        width: "145px",
                        height: "18px",
                        padding: "1px 4px",
                        boxSizing: "border-box",
                        border: "1px solid #cbd8df",
                        borderRadius: "2px",
                        background: "#fff",
                        fontSize: "8px",
                        outline: "none"
                    }}
                />
            </div>

        </div>


        {/* RIGHT — AUTHORISATION */}

       <div
    style={{
        padding: "6px 9px",
        background: "#fff",
        boxSizing: "border-box",
        fontSize: "8px",
        color: "#1f2937",
        lineHeight: "1.4",
        textAlign: "left"
    }}
>

    <div
        style={{
            fontWeight: 700,
            marginBottom: "7px"
        }}
    >
        For ORBITZ HOLIDAYS
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "6px"
        }}
    >
        <span>
            Authorised Signatory:
        </span>

        <span
            style={{
                display: "inline-block",
                width: "105px",
                borderBottom: "1px solid #374151",
                marginLeft: "5px",
                height: "10px"
            }}
        />
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center"
        }}
    >
        <span>
            Customer Acknowledgement:
        </span>

        <span
            style={{
                display: "inline-block",
                width: "95px",
                borderBottom: "1px solid #374151",
                marginLeft: "5px",
                height: "10px"
            }}
        />
    </div>

</div>

    </div>

</div>


<div
    style={{
        marginTop: "7px",
        padding: "6px 9px",
        border: "1px solid #d5e0e6",
        background: "#f5f8fa",
        boxSizing: "border-box"
    }}
>
    <div
        style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#172a46",
            marginBottom: "3px"
        }}
    >
        Declaration
    </div>

    <div
        style={{
            fontSize: "8px",
            lineHeight: "1.35",
            color: "#374151"
        }}
    >
        This voucher confirms the payment received against the
        above-mentioned booking. It is system-generated and valid
        without a physical signature unless otherwise required.
    </div>
</div>

<div
    style={{
        marginTop: "9px",
        paddingTop: "6px",
        paddingBottom: "5px",
        textAlign: "center",
        borderTop: "2px solid #008b8f",
        background: "#f4fafb",
        boxSizing: "border-box"
    }}
>
    <div
        style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#008b8f",
            letterSpacing: "0.2px"
        }}
    >
        Thank you for choosing Orbitz Holidays.
    </div>
</div>



</div>
 </div>
 </div>
 );
}