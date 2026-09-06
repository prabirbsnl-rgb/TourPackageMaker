

import jsPDF from "jspdf";

import "../fonts/NotoSans-normal.js";


const orbitzLogo = "/orbitz-logo.png";

async function loadImage(url) {
    return new Promise((resolve, reject) => {

        const img = new Image();

        img.crossOrigin = "Anonymous";

        img.onload = () => resolve(img);

        img.onerror = reject;

        img.src = url;
    });
}

const COLORS = {
    navy: [23, 42, 70],
    teal: [0, 133, 138],
    lightBlue: [238, 244, 247],
    border: [203, 216, 223],
    text: [31, 41, 55],
    white: [255, 255, 255]
};

const PAGE = {
    width: 210,
    height: 297,
    marginLeft: 12,
    marginRight: 12,
    marginTop: 12,
    marginBottom: 12
};

function drawSectionHeader(pdf, title, y) {

    pdf.setFillColor(...COLORS.navy);

    pdf.rect(
        PAGE.marginLeft,
        y,
        PAGE.width -
            PAGE.marginLeft -
            PAGE.marginRight,
        8,
        "F"
    );

    pdf.setTextColor(...COLORS.white);

    pdf.setFont(
    "times",
    "bold"
);

    pdf.setFontSize(9);

    pdf.text(
        title,
        PAGE.marginLeft + 3,
        y + 5.3
    );

    return y + 8;
}

function drawCell(
    pdf,
    x,
    y,
    width,
    height,
    fillColor = null
) {

    if (fillColor) {
        pdf.setFillColor(...fillColor);

        pdf.rect(
            x,
            y,
            width,
            height,
            "F"
        );
    }

    pdf.setDrawColor(...COLORS.border);

    pdf.setLineWidth(0.25);

    pdf.rect(
        x,
        y,
        width,
        height
    );
}

function drawLabel(
    pdf,
    label,
    value,
    x,
    y,
    labelWidth,
    valueWidth,
    height
) {

    drawCell(
        pdf,
        x,
        y,
        labelWidth,
        height,
        COLORS.lightBlue
    );

    drawCell(
        pdf,
        x + labelWidth,
        y,
        valueWidth,
        height,
        COLORS.white
    );

   pdf.setTextColor(0, 0, 0);

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(8);

pdf.text(
    label,
    x + 3,
    y + 5
);

pdf.setFont(
    "times",
    "normal"
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    value || "-",
    x + labelWidth + 3,
    y + 5
);

}


function getShortInvoiceNo(invoiceNo) {
    if (!invoiceNo) return "-";

    const match = String(invoiceNo).match(
        /^(ORB)-\d*(\d{6})$/
    );

    return match
        ? `${match[1]}-${match[2]}`
        : String(invoiceNo);
}


const drawTextWithRupee =
    (
        pdf,
        text,
        x,
        y,
        options = {}
    ) => {

        const value =
            String(text);

        if (!value.includes("₹")) {

           pdf.setFont(
    "times",
    "bold"
);

            pdf.text(
                value,
                x,
                y,
                options
            );

            return;
        }

        const parts =
            value.split("₹");

        const before =
            parts[0];

        const after =
            parts.slice(1).join("₹");

        /*
         * Measure complete text
         * using the appropriate fonts.
         */

        pdf.setFont(
    "times",
    "bold"
);

        const beforeWidth =
            pdf.getTextWidth(
                before
            );

        pdf.setFont(
            "NotoSans",
            "normal"
        );

        const rupeeWidth =
            pdf.getTextWidth(
                "₹"
            );

        pdf.setFont(
    "times",
    "bold"
);

        const afterWidth =
            pdf.getTextWidth(
                after
            );

        const totalWidth =
            beforeWidth +
            rupeeWidth +
            afterWidth;

        let drawX = x;

        if (
            options.align ===
            "center"
        ) {
            drawX =
                x -
                totalWidth / 2;
        } else if (
            options.align ===
            "right"
        ) {
            drawX =
                x -
                totalWidth;
        }

        /*
         * Text before ₹
         */

        if (before) {

           pdf.setFont(
    "times",
    "bold"
);

            pdf.text(
                before,
                drawX,
                y
            );

            drawX +=
                beforeWidth;
        }

        /*
         * ₹ glyph
         */

        pdf.setFont(
            "NotoSans",
            "normal"
        );

        pdf.text(
            "₹",
            drawX,
            y
        );

        drawX +=
            rupeeWidth;

        /*
         * Text after ₹
         */

        if (after) {

            pdf.setFont(
    "times",
    "bold"
);

            pdf.text(
                after,
                drawX,
                y
            );
        }
    };



function drawContactIcon(
    pdf,
    type,
    x,
    y,
    size = 3.2
) {
    pdf.setDrawColor(0, 127, 131);
    pdf.setFillColor(0, 127, 131);
    pdf.setTextColor(0, 127, 131);
    pdf.setLineWidth(0.45);

    /*
     * LOCATION
     */
    if (type === "location") {

        pdf.circle(
            x + size / 2,
            y + size / 2,
            size / 2,
            "S"
        );

        pdf.line(
            x + 0.8,
            y + 2.7,
            x + size / 2,
            y + size + 1
        );

        pdf.line(
            x + size - 0.8,
            y + 2.7,
            x + size / 2,
            y + size + 1
        );

        pdf.circle(
            x + size / 2,
            y + size / 2,
            0.55,
            "F"
        );
    }

    /*
     * PHONE / CALL
     */
    if (type === "phone") {

       pdf.setFont(
    "times",
    "bold"
);

        pdf.setFontSize(8);

        pdf.text(
            "☎",
            x,
            y + 3.5
        );
    }

    /*
     * WHATSAPP
     */
    if (type === "whatsapp") {

        pdf.circle(
            x + 1.8,
            y + 1.8,
            1.7,
            "S"
        );

       pdf.setFont(
    "times",
    "bold"
);

        pdf.setFontSize(5.2);

        pdf.text(
            "☎",
            x + 0.35,
            y + 3.1
        );

        pdf.line(
            x + 0.7,
            y + 3.1,
            x + 0.1,
            y + 4
        );
    }

    /*
     * EMAIL
     */
    if (type === "email") {

        pdf.rect(
            x,
            y + 0.5,
            size + 1,
            size - 1,
            "S"
        );

        pdf.line(
            x,
            y + 0.5,
            x + (size + 1) / 2,
            y + 2.5
        );

        pdf.line(
            x + size + 1,
            y + 0.5,
            x + (size + 1) / 2,
            y + 2.5
        );
    }

    /*
     * WEBSITE
     */
    if (type === "website") {

        pdf.circle(
            x + 1.8,
            y + 1.8,
            1.7,
            "S"
        );

        pdf.line(
            x + 0.2,
            y + 1.8,
            x + 3.4,
            y + 1.8
        );

        pdf.line(
            x + 1.8,
            y + 0.2,
            x + 1.8,
            y + 3.4
        );
    }
}






export async function generateTaxInvoicePdf(invoice) {

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const logoImage =
        await loadImage(orbitzLogo);

    let y = PAGE.marginTop;

    /*
     * =====================================
     * TAX INVOICE HEADER
     * =====================================
     */

    pdf.addImage(
        logoImage,
        "PNG",
        PAGE.marginLeft,
        y,
        45,
        16
    );

    pdf.setTextColor(...COLORS.navy);

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(7);

pdf.text(
    "Anywhere, Anytime, Around the World",
    PAGE.marginLeft + 3,
    y + 18
);

    pdf.setTextColor(...COLORS.navy);

   pdf.setFont(
    "times",
    "bold"
);

    pdf.setFontSize(18);

    pdf.text(
        "TAX INVOICE",
        PAGE.width -
            PAGE.marginRight,
        y + 7,
        {
            align: "right"
        }
    );

    y += 22;


/*
 * =====================================
 * HEADER DIVIDER
 * =====================================
 */

pdf.setDrawColor(
    ...COLORS.navy
);

pdf.setLineWidth(0.5);

pdf.line(
    PAGE.marginLeft,
    y,
    PAGE.width - PAGE.marginRight,
    y
);

y += 3;


/*
 * =====================================
 * COMPANY CONTACT STRIP
 * EDITOR-STYLE SINGLE ROW
 * =====================================
 */

const infoStripHeight = 10;

const infoStripX =
    PAGE.marginLeft;

const infoStripWidth =
    PAGE.width -
    PAGE.marginLeft -
    PAGE.marginRight;


/*
 * Background
 */

pdf.setFillColor(
    232,
    241,
    244
);

pdf.rect(
    infoStripX,
    y,
    infoStripWidth,
    infoStripHeight,
    "F"
);


/*
 * Border
 */

pdf.setDrawColor(
    199,
    217,
    223
);

pdf.setLineWidth(0.25);

pdf.rect(
    infoStripX,
    y,
    infoStripWidth,
    infoStripHeight
);

/*
 * =====================================
 * CONTACT INFORMATION
 * =====================================
 */

const contactItems = [
    {
        label: "Address:",
        value:
            " B-7/37(S), Central Park, Kalyani, West Bengal - 741235"
    },
    {
        label: "Call:",
        value:
            " +91 98304 89892"
    },
    {
        label: "WhatsApp:",
        value:
            " +91 93308 44031"
    },
    {
        label: "Mail:",
        value:
            " info@orbitzholidays.com"
    },
    {
    label: "Web:",
    value:
        " www.orbitzholidays.com"
}
];


/*
 * =====================================
 * FONT SIZE
 * =====================================
 */

let contactFontSize = 6.8;

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(
    contactFontSize
);


/*
 * Calculate total width
 */

const separatorText =
    "   |   ";

let totalWidth = 0;

contactItems.forEach(
    (item, index) => {

        pdf.setFont(
    "times",
    "normal"
);

        totalWidth +=
            pdf.getTextWidth(
                item.label
            );

        totalWidth +=
            pdf.getTextWidth(
                item.value
            );

        if (
            index <
            contactItems.length - 1
        ) {
            totalWidth +=
                pdf.getTextWidth(
                    separatorText
                );
        }
    }
);

/*
 * =====================================
 * CONTACT STRIP WIDTH LIMIT
 * =====================================
 */

const maxContactWidth =
    infoStripWidth - 6;


/*
 * =====================================
 * AUTOMATIC FONT FIT
 * =====================================
 */

while (
    totalWidth > maxContactWidth &&
    contactFontSize > 5.4
) {

    contactFontSize -= 0.1;

    pdf.setFont(
    "times",
    "normal"
);

    pdf.setFontSize(
        contactFontSize
    );

    totalWidth = 0;

    contactItems.forEach(
        (item, index) => {

            totalWidth +=
                pdf.getTextWidth(
                    item.label
                );

            totalWidth +=
                pdf.getTextWidth(
                    item.value
                );

            if (
                index <
                contactItems.length - 1
            ) {

                totalWidth +=
                    pdf.getTextWidth(
                        separatorText
                    );
            }
        }
    );
}


/*
 * =====================================
 * DRAW SINGLE LINE
 * =====================================
 */

let contactX =
    infoStripX +
    (
        infoStripWidth -
        totalWidth
    ) / 2;


contactItems.forEach(
    (item, index) => {

        /*
         * LABEL
         */

        pdf.setFont(
    "times",
    "normal"
);

        pdf.setFontSize(
            contactFontSize
        );

        pdf.setTextColor(
            0,
            133,
            138
        );

        /*
         * Simulate bold while retaining
         * NotoSans ₹/Unicode support.
         */

        pdf.text(
            item.label,
            contactX,
            y + 5.9
        );

        pdf.text(
            item.label,
            contactX + 0.08,
            y + 5.9
        );


        contactX +=
            pdf.getTextWidth(
                item.label
            );


       /*
 * VALUE
 */

pdf.setFont(
    "times",
    "normal"
);

pdf.setTextColor(
    23,
    50,
    77
);

/*
 * Draw twice with tiny offset
 * to simulate bold.
 */

pdf.text(
    item.value,
    contactX,
    y + 5.9
);

pdf.text(
    item.value,
    contactX + 0.08,
    y + 5.9
);

contactX +=
    pdf.getTextWidth(
        item.value
    );


        /*
         * SEPARATOR
         */

        if (
            index <
            contactItems.length - 1
        ) {

            pdf.setTextColor(
                150,
                175,
                183
            );

            pdf.text(
                separatorText,
                contactX,
                y + 5.9
            );

            contactX +=
                pdf.getTextWidth(
                    separatorText
                );
               }
    }
);


/*
 * =====================================
 * NEXT SECTION
 * =====================================
 */

y +=
    infoStripHeight +
    4;




/*
 * =====================================
 * INVOICE DETAILS
 * =====================================
 */

    y = drawSectionHeader(
        pdf,
        "INVOICE DETAILS",
        y
    );

    const contentWidth =
        PAGE.width -
        PAGE.marginLeft -
        PAGE.marginRight;

    const halfWidth =
        contentWidth / 2;

    const labelWidth = 28;

    drawLabel(
    pdf,
    "Invoice No.",
    getShortInvoiceNo(
        invoice?.invoiceNo ||
        invoice?.quotationNo
    ),

        PAGE.marginLeft,
        y,
        labelWidth,
        halfWidth - labelWidth,
        8
    );

    drawLabel(
        pdf,
        "Invoice Date",
        invoice?.invoiceDate
    ? invoice.invoiceDate.split("-").reverse().join("-")
    : "-",
        PAGE.marginLeft +
            halfWidth,
        y,
        labelWidth,
        halfWidth - labelWidth,
        8
    );

    y += 7;

  


drawLabel(
    pdf,
    "Place of Supply",
     invoice?.placeOfSupply || "-",
    PAGE.marginLeft,
    y,
    labelWidth,
    halfWidth - labelWidth,
    8
);

    drawLabel(
        pdf,
        "Due Date",
        invoice?.dueDate
    ? invoice.dueDate.split("-").reverse().join("-")
    : "-",
        PAGE.marginLeft +
            halfWidth,
        y,
        labelWidth,
        halfWidth - labelWidth,
        8
    );

    y += 9;





    /*
 * =====================================
 * SUPPLIER & CUSTOMER
 * =====================================
 */

y += 2;

y = drawSectionHeader(
    pdf,
    "SERVICE PROVIDER & CUSTOMER",
    y
);

const supplierCustomerHeight = 33;

const supplierWidth = contentWidth / 2;
const customerWidth = contentWidth / 2;

/*
 * SUPPLIER
 */

drawCell(
    pdf,
    PAGE.marginLeft,
    y,
    supplierWidth,
    supplierCustomerHeight,
    [238, 244, 247]
);

pdf.setTextColor(0, 0, 0);

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(9);

pdf.text(
    "ORBITZ HOLIDAYS",
    PAGE.marginLeft + 4,
   y + 6
);

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(7.5);

pdf.text(
    "GSTIN: 19AYTPS0423N1ZO",
    PAGE.marginLeft + 4,
  y + 11
);

pdf.text(
    "PAN: AYTPS0423N",
    PAGE.marginLeft + 4,
    y + 16
);

pdf.text(
    "B-7/37(S), Central Park, Kalyani,",
    PAGE.marginLeft + 4,
    y + 21
);

pdf.text(
    "West Bengal – 741235",
    PAGE.marginLeft + 4,
    y + 26
);

/*
 * CUSTOMER
 */

const customerX =
    PAGE.marginLeft +
    supplierWidth;

drawCell(
    pdf,
    customerX,
    y,
    customerWidth,
    supplierCustomerHeight,
    COLORS.white
);

const customerLabelWidth = 32;
const customerValueX =
    customerX +
    customerLabelWidth +
    3;

pdf.setFontSize(7.5);

pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "Customer Name:",
    customerX + 4,
    y + 6
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    invoice?.clientName ||
        invoice?.commonData?.clientName ||
        "-",
    customerValueX,
    y + 6
);


pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "GSTIN / PAN:",
    customerX + 4,
    y + 11
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    invoice?.customerGstinPan ||
        invoice?.commonData?.customerGstinPan ||
        invoice?.commonData?.customerGstin ||
        invoice?.commonData?.customerPan ||
        "-",
    customerValueX,
    y + 11
);


pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "Billing Address:",
    customerX + 4,
    y + 16
);

pdf.setFont(
    "times",
    "normal"
);

const billingAddress =
    invoice?.customerAddress ||
    invoice?.commonData?.customerAddress ||
    invoice?.commonData?.city ||
    "-";

const billingLines =
    pdf.splitTextToSize(
        billingAddress,
        customerWidth -
            customerLabelWidth -
            8
    );

pdf.text(
    billingLines.slice(0, 2),
    customerValueX,
    y + 16
);


pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "Mobile:",
    customerX + 4,
    y + 26
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    invoice?.mobile ||
        invoice?.commonData?.mobile ||
        "-",
    customerValueX,
    y + 26
);


pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "Email:",
    customerX + 4,
    y + 31
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    invoice?.email ||
        invoice?.commonData?.email ||
        "-",
    customerValueX,
    y + 31
);

y += supplierCustomerHeight + 4;


/*
 * =====================================
 * TRAVEL / BOOKING REFERENCE
 * =====================================
 */

y = drawSectionHeader(
    pdf,
    "TRAVEL / BOOKING REFERENCE",
    y
);

const travelColumns = [
    32,
    48,
    40,
    50,
    16
];

const travelTableX =
    PAGE.marginLeft;

const travelHeaderHeight = 7;
const travelValueHeight = 8;

const travelHeaders = [
    "Booking / Ref.",
    "Passenger(s)",
    "Destination",
    "Travel Dates",
    "Pax"
];

/*
 * HEADER ROW
 */

let travelX = travelTableX;

travelHeaders.forEach(
    (header, index) => {

        drawCell(
            pdf,
            travelX,
            y,
            travelColumns[index],
            travelHeaderHeight,
            COLORS.lightBlue
        );

       pdf.setTextColor(0, 0, 0);

        pdf.setFont(
    "times",
    "bold"
);

        pdf.setFontSize(7.5);

        pdf.text(
            header,
            travelX +
                travelColumns[index] / 2,
            y + 5.2,
            {
                align: "center"
            }
        );

        travelX +=
            travelColumns[index];
    }
);

y += travelHeaderHeight;


/*
 * VALUE ROW
 */

const bookingReference =
    invoice?.displayQuotationNo ||
    invoice?.quotationNo ||
    invoice?.commonData?.quotationNo ||
    "-";

const passengerName =
    invoice?.passengerName ||
    invoice?.clientName ||
    invoice?.commonData?.clientName ||
    "-";

const destination =
    invoice?.destination ||
    invoice?.commonData?.customDestination ||
    invoice?.commonData?.destination ||
    "-";

const formatPdfTravelDate = (date) => {

    if (!date) return "";

    const parts =
        String(date).split("-");

    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return String(date);
};

const travelDates =
    invoice?.travelDates
        ? String(invoice.travelDates)
            .split(" – ")
            .map(formatPdfTravelDate)
            .join(" – ")
        : (
            invoice?.commonData?.travelFrom ||
            invoice?.commonData?.travelTo
                ? `${formatPdfTravelDate(
                    invoice?.commonData?.travelFrom
                )} – ${formatPdfTravelDate(
                    invoice?.commonData?.travelTo
                )}`
                : "-"
        );

const pax =
    invoice?.pax ||
    (
        (
            Number(
                invoice?.commonData?.adults || 0
            ) +
            Number(
                invoice?.commonData?.children || 0
            )
        ) || "-"
    );

const travelValues = [
    bookingReference,
    passengerName,
    destination,
    travelDates,
    String(pax)
];

travelX = travelTableX;

travelValues.forEach(
    (value, index) => {

        drawCell(
            pdf,
            travelX,
            y,
            travelColumns[index],
            travelValueHeight,
            COLORS.white
        );

       pdf.setTextColor(0, 0, 0);

       pdf.setFont(
    "times",
    "normal"
);

        pdf.setFontSize(7.5);

        const availableWidth =
            travelColumns[index] - 5;

        const text =
            pdf.splitTextToSize(
                String(value),
                availableWidth
            )[0] || "-";

      pdf.text(
    text,
    travelX +
        travelColumns[index] / 2,
    y + travelValueHeight / 2 + 1.5,
    {
        align: "center"
    }
);

        travelX +=
            travelColumns[index];
    }
);

y += travelValueHeight + 4;

/*
 * =====================================
 * SERVICES / PARTICULARS
 * =====================================
 */

y = drawSectionHeader(
    pdf,
    "SERVICES / PARTICULARS",
    y
);

const serviceColumns = [
    10,  // #
    62,  // Description
    20,  // HSN/SAC
    12,  // Qty
    23,  // Rate
    14,  // Tax %
    22,  // Tax
    23   // Amount
];

const serviceTableX =
    PAGE.marginLeft;

const serviceHeaderHeight = 8;
const serviceRowHeight = 8;

const serviceHeaders = [
    "#",
    "Description of Service / Package",
    "HSN/SAC",
    "Qty",
    "Rate (₹)",
    "Tax %",
    "Tax (₹)",
    "Amount (₹)"
];

/*
 * HEADER ROW
 */

let serviceX = serviceTableX;

serviceHeaders.forEach(
    (header, index) => {

        drawCell(
            pdf,
            serviceX,
            y,
            serviceColumns[index],
            serviceHeaderHeight,
            COLORS.lightBlue
        );

        pdf.setTextColor(
            ...COLORS.text
        );

        pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(7.5);

const headerLines =
    pdf.splitTextToSize(
        header,
        serviceColumns[index] - 4
    );

if (
    header.includes("₹")
) {

    drawTextWithRupee(
        pdf,
        header,
        serviceX +
            serviceColumns[index] / 2,
        y +
            serviceHeaderHeight / 2 +
            1.8,
        {
            align: "center"
        }
    );

} else {

    pdf.setFont(
        "times",
        "bold"
    );

    pdf.text(
        headerLines,
        serviceX +
            serviceColumns[index] / 2,
        y +
            serviceHeaderHeight / 2 +
            1.8,
        {
            align: "center"
        }
    );

    pdf.text(
        headerLines,
        serviceX +
            serviceColumns[index] / 2 +
            0.12,
        y +
            serviceHeaderHeight / 2 +
            1.8,
        {
            align: "center"
        }
    );
}

        serviceX +=
            serviceColumns[index];
    }
);

y += serviceHeaderHeight;


/*
 * PACKAGE VALUES
 */

const packageQty =
    Number(
        invoice?.serviceData?.qty ??
        invoice?.qty ??
        1
    ) || 1;

const packageTaxPercent =
    Number(
        invoice?.serviceData?.taxPercent ??
        invoice?.taxPercent ??
        0
    ) || 0;

const packageTaxableValue =
    Number(
        invoice?.taxableValue
    ) || 0;

const packageTaxAmount =
    Number(
        invoice?.taxAmount
    ) || 0;

const packageAmount =
    Number(
        invoice?.grossQuotedAmount ??
        invoice?.sourceQuotedAmount ??
        (
            packageTaxableValue +
            packageTaxAmount
        )
    ) || 0;

const packageRate =
    packageQty > 0
        ? packageTaxableValue /
          packageQty
        : 0;

const packageDescription =
    invoice?.serviceData?.description ||
    invoice?.description ||
    "Tour Package";

const packageHsnSac =
    invoice?.serviceData?.hsnSac ||
    invoice?.hsnSac ||
    "-";

const packageTaxTreatment =
    invoice?.serviceData?.taxTreatment ||
    invoice?.taxTreatment ||
    "none";

const packageTaxDisplay =
    packageTaxTreatment === "none"
        ? "0%"
        : `${packageTaxPercent}%`;

const packageValues = [
    "1",
    packageDescription,
    packageHsnSac,
    String(packageQty),
    packageRate.toFixed(2),
    packageTaxDisplay,
    packageTaxAmount.toFixed(2),
    packageAmount.toFixed(2)
];


/*
 * PACKAGE ROW
 */

serviceX = serviceTableX;

packageValues.forEach(
    (value, index) => {

        drawCell(
            pdf,
            serviceX,
            y,
            serviceColumns[index],
            serviceRowHeight,
            COLORS.white
        );

       pdf.setTextColor(0, 0, 0);


        pdf.setFont(
    "times",
    "normal"
);

        pdf.setFontSize(7.5);

        const isDescription =
            index === 1;

        const isNumber =
            index === 0 ||
            index >= 3;

        const textLines =
            pdf.splitTextToSize(
                String(value),
                serviceColumns[index] - 5
            );

        pdf.text(
    textLines.slice(0, 2),
    serviceX +
        serviceColumns[index] / 2,
    y +
        serviceRowHeight / 2 +
        1.5,
    {
        align: "center"
    }
);

        serviceX +=
            serviceColumns[index];
    }
);

y += serviceRowHeight;


/*
 * CUSTOM SERVICE ROWS
 */

const customServices =
    invoice?.serviceData?.customServices || [];

let customServicesTaxableValue = 0;

let customServicesTaxAmount = 0;

customServices.forEach(
    (service, serviceIndex) => {

        const qty =
            Number(service?.qty) || 1;

        const rate =
            Number(service?.rate) || 0;

        const amount =
            Number(service?.amount) || 0;

        const taxPercent =
            Number(service?.taxPercent) || 0;

        let taxableValue = 0;
        let taxAmount = 0;
        let lineAmount = 0;

        /*
         * GST INCLUSIVE
         * Amount is the source value.
         */
        if (
            service?.taxTreatment ===
            "inclusive"
        ) {

            lineAmount = amount;

            taxableValue =
                taxPercent > 0
                    ? lineAmount /
                      (1 + taxPercent / 100)
                    : lineAmount;

            taxAmount =
                lineAmount -
                taxableValue;

        /*
         * GST EXCLUSIVE
         */
        } else if (
            service?.taxTreatment ===
            "exclusive"
        ) {

            taxableValue =
                rate * qty;

            taxAmount =
                taxableValue *
                taxPercent /
                100;

            lineAmount =
                taxableValue +
                taxAmount;

        /*
         * NO GST / EXEMPT
         */
        } else {

            taxableValue =
                rate * qty;

            taxAmount = 0;

            lineAmount =
                taxableValue;
        }


        customServicesTaxableValue +=
    taxableValue;

    customServicesTaxAmount +=
    taxAmount;


        const ratePerUnit =
            qty > 0
                ? taxableValue / qty
                : 0;

        const taxDisplay =
            service?.taxTreatment === "none"
                ? "0%"
                : `${taxPercent}%`;

        const serviceValues = [
            String(serviceIndex + 2),
            service?.description ||
                service?.service ||
                "Custom Service",
            service?.hsnSac || "-",
            String(qty),
            ratePerUnit.toFixed(2),
            taxDisplay,
            taxAmount.toFixed(2),
            lineAmount.toFixed(2)
        ];

        serviceX = serviceTableX;

        serviceValues.forEach(
            (value, index) => {

                drawCell(
                    pdf,
                    serviceX,
                    y,
                    serviceColumns[index],
                    serviceRowHeight,
                    COLORS.white
                );

               pdf.setTextColor(0, 0, 0);

                pdf.setFont(
    "times",
    "normal"
);

                pdf.setFontSize(7.5);

                const textLines =
                    pdf.splitTextToSize(
                        String(value),
                        serviceColumns[index] - 5
                    );

                pdf.text(
                    textLines.slice(0, 2),
                    serviceX +
                        serviceColumns[index] / 2,
                    y +
                        serviceRowHeight / 2 +
                        1.5,
                    {
                        align: "center"
                    }
                );

                serviceX +=
                    serviceColumns[index];
            }
        );

        y += serviceRowHeight;
    }
);


const finalTaxableValue =
    (Number(invoice?.taxableValue) || 0) +
    customServicesTaxableValue;

    const finalTotalTax =
    (Number(invoice?.taxAmount) || 0) +
    customServicesTaxAmount;


y += 2;




/*
 * =====================================
 * TOTALS SUMMARY
 * =====================================
 */

const summaryWidth = 82;
const summaryValueWidth = 28;

const summaryLabelWidth =
    summaryWidth -
    summaryValueWidth;

const summaryX =
    serviceTableX +
    serviceColumns.reduce(
        (sum, width) => sum + width,
        0
    ) -
    summaryWidth;

const summaryRowHeight = 9;

const summaryRowGap = 1;

const summaryBg = [
    242,
    246,
    248
];

/*
 * Move totals closer to
 * the SERVICES table.
 */

/*
 * =====================================
 * SUPPORTING TOTALS STRIP
 * =====================================
 */

const totalsStripWidth =
    serviceColumns.reduce(
        (sum, width) => sum + width,
        0
    );

const totalsStripHeight = 9;

const totalsCellWidth =
    totalsStripWidth / 3;

const totalsStripX =
    serviceTableX;


/*
 * -------------------------------------
 * DISCOUNT / OTHER CHARGES CALCULATION
 * -------------------------------------
 */

const discountOtherCharges =
    Number(
        invoice?.serviceData
            ?.discountOtherCharges
    ) || 0;


/*
 * -------------------------------------
 * STRIP BACKGROUND
 * -------------------------------------
 */

pdf.setFillColor(
    ...summaryBg
);

pdf.setDrawColor(
    ...COLORS.border
);

pdf.setLineWidth(0.35);

pdf.rect(
    totalsStripX,
    y,
    totalsStripWidth,
    totalsStripHeight,
    "FD"
);


/*
 * -------------------------------------
 * INLINE METRIC HELPER
 * -------------------------------------
 */

const drawTotalsMetric =
    (
        label,
        value,
        cellX
    ) => {

       pdf.setFont(
    "times",
    "normal"
);

        pdf.setFontSize(7.2);

        /*
         * Measure label,
         * colon and value.
         */

        const labelWidth =
            pdf.getTextWidth(
                label
            );

        const colonWidth =
            pdf.getTextWidth(
                " : "
            );

        const valueWidth =
            pdf.getTextWidth(
                value
            );

        const groupWidth =
            labelWidth +
            colonWidth +
            valueWidth;

        let metricX =
            cellX +
            (
                totalsCellWidth -
                groupWidth
            ) / 2;

        const metricY =
            y +
            totalsStripHeight / 2 +
            1.5;


        /*
         * LABEL
         */

        pdf.setTextColor(
            ...COLORS.text
        );

        pdf.text(
            label,
            metricX,
            metricY
        );

        pdf.text(
            label,
            metricX + 0.12,
            metricY
        );

        metricX +=
            labelWidth;


        /*
         * COLON
         */

        pdf.text(
            " : ",
            metricX,
            metricY
        );

        metricX +=
            colonWidth;


        /*
         * VALUE
         */

        pdf.setTextColor(
            ...COLORS.navy
        );

        pdf.text(
            value,
            metricX,
            metricY
        );

        pdf.text(
            value,
            metricX + 0.12,
            metricY
        );
    };


/*
 * -------------------------------------
 * INSET DIVIDERS
 * -------------------------------------
 */

const dividerInset = 1.3;

const divider1X =
    totalsStripX +
    totalsCellWidth;

const divider2X =
    totalsStripX +
    totalsCellWidth * 2;

pdf.setDrawColor(
    ...COLORS.border
);

pdf.setLineWidth(0.35);

pdf.line(
    divider1X,
    y + dividerInset,
    divider1X,
    y +
        totalsStripHeight -
        dividerInset
);

pdf.line(
    divider2X,
    y + dividerInset,
    divider2X,
    y +
        totalsStripHeight -
        dividerInset
);


/*
 * -------------------------------------
 * THREE TOTALS
 * -------------------------------------
 */

drawTotalsMetric(
    "Taxable Value",
    finalTaxableValue.toFixed(2),
    totalsStripX
);

drawTotalsMetric(
    "Total Tax",
    finalTotalTax.toFixed(2),
    totalsStripX +
        totalsCellWidth
);

drawTotalsMetric(
    "Discount / Other Charges",
    discountOtherCharges.toFixed(2),
    totalsStripX +
        totalsCellWidth * 2
);

y += totalsStripHeight;



    /*
 * -------------------------------------
 * GRAND TOTAL CALCULATION
 * -------------------------------------
 */

const finalGrandTotal =
    Number(
        invoice?.grandTotal
    ) || (
        finalTaxableValue +
        finalTotalTax -
        discountOtherCharges
    );


    /*
 * -------------------------------------
 * GRAND TOTAL
 * -------------------------------------
 */

y += 1;

const grandTotalRowHeight = 9;

drawCell(
    pdf,
    summaryX,
    y,
    summaryWidth,
    grandTotalRowHeight,
    COLORS.navy
);



/*
 * Inset white divider
 */

const grandTotalDividerX =
    summaryX +
    summaryLabelWidth;

pdf.setDrawColor(
    ...COLORS.white
);

pdf.setLineWidth(0.4);

pdf.line(
    grandTotalDividerX,
    y + 1.4,
    grandTotalDividerX,
    y +
        grandTotalRowHeight -
        1.4
);


/*
 * GRAND TOTAL LABEL
 */

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(8.5);

pdf.setTextColor(
    ...COLORS.white
);

pdf.text(
    "Grand Total",
    summaryX +
        summaryLabelWidth -
        4,
    y +
        grandTotalRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

pdf.text(
    "Grand Total",
    summaryX +
        summaryLabelWidth -
        3.86,
    y +
        grandTotalRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

/*
 * GRAND TOTAL AMOUNT
 */

pdf.text(
    finalGrandTotal.toFixed(2),
    summaryX +
        summaryWidth -
        4,
    y +
        grandTotalRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

pdf.text(
    finalGrandTotal.toFixed(2),
    summaryX +
        summaryWidth -
        3.86,
    y +
        grandTotalRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

y += grandTotalRowHeight;

/*
 * -------------------------------------
 * ADVANCE / PAID CALCULATION
 * -------------------------------------
 */

const finalAdvancePaid =
    Number(
        invoice?.serviceData?.advancePaid
    ) || 0;

    /*
 * -------------------------------------
 * ADVANCE / PAID
 * -------------------------------------
 */

y += 1;

drawCell(
    pdf,
    summaryX,
    y,
    summaryWidth,
    summaryRowHeight,
    summaryBg
);

/*
 * Inset vertical divider
 */

const advanceDividerX =
    summaryX +
    summaryLabelWidth;

pdf.setDrawColor(
    ...COLORS.border
);

pdf.setLineWidth(0.35);

pdf.line(
    advanceDividerX,
    y + 1.3,
    advanceDividerX,
    y +
        summaryRowHeight -
        1.3
);

/*
 * Label
 */

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(8);

pdf.setTextColor(
    ...COLORS.text
);

pdf.text(
    "Advance / Paid",
    advanceDividerX - 4,
    y +
        summaryRowHeight / 2 +
        1.5,
    {
        align: "right"
    }
);

pdf.text(
    "Advance / Paid",
    advanceDividerX - 3.88,
    y +
        summaryRowHeight / 2 +
        1.5,
    {
        align: "right"
    }
);

/*
 * Amount
 */

pdf.setTextColor(
    ...COLORS.navy
);

pdf.text(
    finalAdvancePaid.toFixed(2),
    summaryX +
        summaryWidth -
        4,
    y +
        summaryRowHeight / 2 +
        1.5,
    {
        align: "right"
    }
);

pdf.text(
    finalAdvancePaid.toFixed(2),
    summaryX +
        summaryWidth -
        3.88,
    y +
        summaryRowHeight / 2 +
        1.5,
    {
        align: "right"
    }
);

y +=
    summaryRowHeight;

    /*
 * -------------------------------------
 * BALANCE DUE CALCULATION
 * -------------------------------------
 */

const finalBalanceDue =
    Math.max(
        0,
        finalGrandTotal -
        finalAdvancePaid
    );

    /*
 * -------------------------------------
 * BALANCE DUE
 * -------------------------------------
 */

y += 1;

const balanceDueRowHeight = 8;

drawCell(
    pdf,
    summaryX,
    y,
    summaryWidth,
    balanceDueRowHeight,
    COLORS.teal
);


/*
 * Inset white divider
 */

const balanceDueDividerX =
    summaryX +
    summaryLabelWidth;

pdf.setDrawColor(
    ...COLORS.white
);

pdf.setLineWidth(0.4);

pdf.line(
    balanceDueDividerX,
    y + 1.4,
    balanceDueDividerX,
    y +
        balanceDueRowHeight -
        1.4
);



/*
 * BALANCE DUE LABEL
 */

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(8.5);

pdf.setTextColor(
    ...COLORS.white
);

pdf.text(
    "Balance Due",
    summaryX +
        summaryLabelWidth -
        4,
    y +
        balanceDueRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

pdf.text(
    "Balance Due",
    summaryX +
        summaryLabelWidth -
        3.86,
    y +
        balanceDueRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

/*
 * BALANCE DUE AMOUNT
 */

pdf.text(
    finalBalanceDue.toFixed(2),
    summaryX +
        summaryWidth -
        4,
    y +
        balanceDueRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

pdf.text(
    finalBalanceDue.toFixed(2),
    summaryX +
        summaryWidth -
        3.86,
    y +
        balanceDueRowHeight / 2 +
        1.6,
    {
        align: "right"
    }
);

y += balanceDueRowHeight;

y += 1;

/*
 * -------------------------------------
 * AMOUNT IN WORDS
 * -------------------------------------
 */

const amountInWords =
    invoice?.amountInWords ||
    "-";

const amountInWordsHeight = 8;

drawCell(
    pdf,
    serviceTableX,
    y,
    serviceColumns.reduce(
        (sum, width) => sum + width,
        0
    ),
    amountInWordsHeight,
    summaryBg
);

/*
 * -------------------------------------
 * AMOUNT IN WORDS — RIGHT ALIGNED
 * -------------------------------------
 */

const amountWordsRightX =
    summaryX +
    summaryWidth -
    4;

const amountWordsY =
    y +
    amountInWordsHeight / 2 +
    1.5;

const amountWordsLabel =
    "Amount in Words:";

const amountWordsValue =
    String(amountInWords);

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(7.8);

const amountWordsLabelWidth =
    pdf.getTextWidth(
        amountWordsLabel
    );

const amountWordsValueWidth =
    pdf.getTextWidth(
        amountWordsValue
    );

const amountWordsGap =
    2.5;

const totalAmountWordsWidth =
    amountWordsLabelWidth +
    amountWordsGap +
    amountWordsValueWidth;

const amountWordsStartX =
    amountWordsRightX -
    totalAmountWordsWidth;


/*
 * LABEL
 */

pdf.setTextColor(
    ...COLORS.text
);

pdf.text(
    amountWordsLabel,
    amountWordsStartX,
    amountWordsY
);

pdf.text(
    amountWordsLabel,
    amountWordsStartX + 0.12,
    amountWordsY
);


/*
 * VALUE
 */

pdf.setTextColor(
    ...COLORS.navy
);

pdf.text(
    amountWordsValue,
    amountWordsStartX +
        amountWordsLabelWidth +
        amountWordsGap,
    amountWordsY
);

pdf.text(
    amountWordsValue,
    amountWordsStartX +
        amountWordsLabelWidth +
        amountWordsGap +
        0.12,
    amountWordsY
);

y += amountInWordsHeight;

/*
 * -------------------------------------
 * PAYMENT & AUTHORISATION
 * -------------------------------------
 */

y += 2;

const paymentSectionWidth =
    serviceColumns.reduce(
        (sum, width) => sum + width,
        0
    );

const paymentHeaderHeight = 6;

const paymentBodyHeight = 21;

const paymentTotalHeight =
    paymentHeaderHeight +
    paymentBodyHeight;


/*
 * OUTER BORDER
 */

pdf.setDrawColor(
    ...COLORS.border
);

pdf.setLineWidth(
    0.35
);

pdf.rect(
    serviceTableX,
    y,
    paymentSectionWidth,
    paymentTotalHeight
);


/*
 * -------------------------------------
 * HEADER RIBBON
 * -------------------------------------
 */

pdf.setFillColor(
    23,
    42,
    70
);

pdf.rect(
    serviceTableX,
    y,
    paymentSectionWidth,
    paymentHeaderHeight,
    "F"
);

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    8.5
);

pdf.setTextColor(
    ...COLORS.white
);

pdf.text(
    "PAYMENT & AUTHORISATION",
    serviceTableX + 3,
    y + 4.1
);


/*
 * -------------------------------------
 * TWO COLUMN BODY
 * -------------------------------------
 */

const paymentLeftWidth =
    paymentSectionWidth / 2;

const paymentBodyY =
    y +
    paymentHeaderHeight;


/*
 * LEFT BACKGROUND
 */

pdf.setFillColor(
    245,
    248,
    250
);

pdf.rect(
    serviceTableX,
    paymentBodyY,
    paymentLeftWidth,
    paymentBodyHeight,
    "F"
);


/*
 * CENTER DIVIDER
 */

pdf.setDrawColor(
    ...COLORS.border
);

pdf.setLineWidth(
    0.35
);

pdf.line(
    serviceTableX +
        paymentLeftWidth,
    paymentBodyY,
    serviceTableX +
        paymentLeftWidth,
    paymentBodyY +
        paymentBodyHeight
);


/*
 * -------------------------------------
 * LEFT — PAYMENT / BANK DETAILS
 * -------------------------------------
 */

const paymentLeftX =
    serviceTableX + 3;

let paymentTextY =
    paymentBodyY + 3.5;

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    7.2
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    "Payment / Bank Details",
    paymentLeftX,
    paymentTextY
);


/*
 * MODE
 */

paymentTextY += 3;

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    6.8
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    "Mode:",
    paymentLeftX,
    paymentTextY
);


/*
 * PAYMENT MODES
 */

const selectedPaymentModes =
    invoice?.serviceData?.paymentModes ||
    {};

const paymentModes = [
    ["bank", "Bank"],
    ["upi", "UPI"],
    ["cash", "Cash"],
    ["card", "Card"]
];

const checkboxSize = 3;

let paymentModeX =
    paymentLeftX + 10;

const paymentModeY =
    paymentTextY - 2.5;


paymentModes.forEach(
    ([key, label]) => {

        const isSelected =
            Boolean(
                selectedPaymentModes?.[key]
            );


        /*
         * BOX
         */

        pdf.setLineWidth(
            0.3
        );

        if (isSelected) {

            pdf.setFillColor(
                ...COLORS.teal
            );

            pdf.setDrawColor(
                ...COLORS.teal
            );

            pdf.rect(
                paymentModeX,
                paymentModeY,
                checkboxSize,
                checkboxSize,
                "FD"
            );


            /*
             * DRAW WHITE TICK
             */

            pdf.setDrawColor(
                ...COLORS.white
            );

            pdf.setLineWidth(
                0.5
            );

            pdf.line(
                paymentModeX + 0.55,
                paymentModeY + 1.55,
                paymentModeX + 1.25,
                paymentModeY + 2.2
            );

            pdf.line(
                paymentModeX + 1.25,
                paymentModeY + 2.2,
                paymentModeX + 2.55,
                paymentModeY + 0.65
            );

        } else {

            pdf.setFillColor(
                ...COLORS.white
            );

            pdf.setDrawColor(
                ...COLORS.navy
            );

            pdf.rect(
                paymentModeX,
                paymentModeY,
                checkboxSize,
                checkboxSize,
                "FD"
            );
        }


        /*
         * LABEL
         */

        pdf.setFont(
            "times",
            "normal"
        );

        pdf.setFontSize(
            6.8
        );

       pdf.setTextColor(0, 0, 0);

        pdf.text(
            label,
            paymentModeX +
                checkboxSize +
                1.2,
            paymentModeY + 2.5
        );


        paymentModeX +=
            checkboxSize +
            1.2 +
            pdf.getTextWidth(label) +
            4;
    }
);


/*
 * BANK DETAILS
 */

paymentTextY += 3;

pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "Bank:",
    paymentLeftX,
    paymentTextY
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    " HDFC BANK",
    paymentLeftX +
        pdf.getTextWidth("Bank:"),
    paymentTextY
);

paymentTextY += 2.4;

pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "A/c Name:",
    paymentLeftX,
    paymentTextY
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    " ORBITZ HOLIDAYS",
    paymentLeftX +
        pdf.getTextWidth("A/c Name:"),
    paymentTextY
);

paymentTextY += 2.4;

pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "A/c No.:",
    paymentLeftX,
    paymentTextY
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    " 50200073402702",
    paymentLeftX +
        pdf.getTextWidth("A/c No.:"),
    paymentTextY
);

paymentTextY += 2.4;

pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "IFSC:",
    paymentLeftX,
    paymentTextY
);

pdf.setFont(
    "times",
    "normal"
);

pdf.text(
    " HDFC0000320",
    paymentLeftX +
        pdf.getTextWidth("IFSC:"),
    paymentTextY
);

/*
 * UPI
 */

paymentTextY += 2.4;

pdf.setFont(
    "times",
    "bold"
);

pdf.text(
    "UPI:",
    paymentLeftX,
    paymentTextY
);

const invoiceUpi =
    invoice?.serviceData?.upi ||
    "";

pdf.setFont(
    "times",
    "normal"
);

pdf.setTextColor(0, 0, 0);


pdf.text(
    String(invoiceUpi),
    paymentLeftX + 10,
    paymentTextY
);


/*
 * -------------------------------------
 * RIGHT — AUTHORISATION
 * -------------------------------------
 */

const authorisationX =
    serviceTableX +
    paymentLeftWidth +
    3;

let authorisationY =
    paymentBodyY + 3.5;

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    7.2
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    "For ORBITZ HOLIDAYS",
    authorisationX,
    authorisationY
);


/*
 * AUTHORISED SIGNATORY
 */

authorisationY += 6;

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    6.8
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    "Authorised Signatory:",
    authorisationX,
    authorisationY
);

const signatoryLineX =
    authorisationX +
    27;

const signatoryLineWidth =
    30;

pdf.setDrawColor(
    55,
    65,
    81
);

pdf.setLineWidth(
    0.3
);

pdf.line(
    signatoryLineX,
    authorisationY + 0.5,
    signatoryLineX +
        signatoryLineWidth,
    authorisationY + 0.5
);


/*
 * CUSTOMER ACKNOWLEDGEMENT
 */

authorisationY += 6;

pdf.text(
    "Customer Acknowledgement:",
    authorisationX,
    authorisationY
);

const acknowledgementLineX =
    authorisationX +
    36;

const acknowledgementLineWidth =
    25;

pdf.line(
    acknowledgementLineX,
    authorisationY + 0.5,
    acknowledgementLineX +
        acknowledgementLineWidth,
    authorisationY + 0.5
);


/*
 * MOVE BELOW SECTION
 */

y += paymentTotalHeight;


/*
 * -------------------------------------
 * DECLARATION — COMPACT
 * -------------------------------------
 */

y += 2;

const declarationWidth =
    paymentSectionWidth;

const declarationHeight = 8;


/*
 * DECLARATION BOX
 */

drawCell(
    pdf,
    serviceTableX,
    y,
    declarationWidth,
    declarationHeight,
    [245, 248, 250]
);


/*
 * LABEL
 */

const declarationLabel =
    "Declaration:";

const declarationBody =
    "This voucher confirms the payment received against the above-mentioned booking. It is system-generated and valid without a physical signature unless otherwise required.";

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    6.8
);

pdf.setTextColor(
    ...COLORS.navy
);

const declarationLabelWidth =
    pdf.getTextWidth(
        declarationLabel
    );


/*
 * BODY
 */

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(
    6.5
);

pdf.setTextColor(0, 0, 0);

const declarationBodyWidth =
    pdf.getTextWidth(
        declarationBody
    );

const declarationGap =
    2.2;

const declarationTotalWidth =
    declarationLabelWidth +
    declarationGap +
    declarationBodyWidth;

const declarationStartX =
    serviceTableX +
    4;

const declarationY =
    y +
    declarationHeight / 2 +
    1.8;


/*
 * LABEL
 */

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    6.8
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    declarationLabel,
    declarationStartX,
    declarationY
);


/*
 * BODY
 */

pdf.setFont(
    "times",
    "normal"
);

pdf.setFontSize(
    6.5
);

pdf.setTextColor(0, 0, 0);

pdf.text(
    declarationBody,
    declarationStartX +
        declarationLabelWidth +
        declarationGap,
    declarationY
);

y += declarationHeight;


/*
 * -------------------------------------
 * THANK YOU FOOTER
 * -------------------------------------
 */

y += 3;

const thankYouWidth =
    paymentSectionWidth;

const thankYouHeight = 10;


/*
 * FOOTER BACKGROUND
 */

pdf.setFillColor(
    244,
    250,
    251
);

pdf.rect(
    serviceTableX,
    y,
    thankYouWidth,
    thankYouHeight,
    "F"
);


/*
 * TEAL TOP BORDER
 */

pdf.setFillColor(
    ...COLORS.teal
);

pdf.rect(
    serviceTableX,
    y,
    thankYouWidth,
    0.7,
    "F"
);


/*
 * THANK YOU TEXT
 */

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(
    9.5
);

pdf.setTextColor(
    ...COLORS.teal
);

pdf.text(
    "Thank you for choosing Orbitz Holidays.",
    serviceTableX +
        thankYouWidth / 2,
    y + 6.7,
    {
        align: "center"
    }
);

y += thankYouHeight + 4;


   const pdfBlob =
    pdf.output("blob");

pdf.save(
    "Tax-Invoice.pdf"
);

return pdfBlob;

}