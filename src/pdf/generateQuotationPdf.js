import jsPDF from "jspdf";
import { PAGE, SPACING, LAYOUT } from "./pdfTheme";
import orbitzLogo from "../assets/orbitz-logo.png";
import webIcon from "../assets/web.png";
import phoneIcon from "../assets/phone.png";
import locationIcon from "../assets/location.png";

import {
  drawRibbon,
  drawSectionHeading,
  drawLabelValue,
  drawDescription,
  drawWrappedLines,
  buildHangingLines,
  drawHangingLines,
  drawHangingParagraph,
  drawLabeledWrappedParagraph,
  buildWrappedDescriptionLines,
  drawSummaryRow2,
  drawSummaryRow3,
  drawGreyCostRow,
  drawBlueCostRow,
  drawGreyCostRowCompact,
  drawBlueCostRowCompact,
  measureDescriptionPreview,
  DESCRIPTION_INSET,
  drawCalloutBox,
  sanitizePdfText,
  drawBillingCard,
  buildWrappedPolicyLines,
} from "./pdfHelpers";

function formatPdfDate(dateInput) {
  if (!dateInput) return "-";

  const d = new Date(dateInput);

  const day = d.getDate();

  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const month = d.toLocaleString("en-GB", {
    month: "short",
  });

  const year = d.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
}

function getDuration(from, to) {

  if (!from || !to) return "-";

  const start = new Date(from);
  const end = new Date(to);

  const diff =
    Math.round(
      (end - start) /
      (1000 * 60 * 60 * 24)
    );

  return `${diff} N / ${diff + 1} D`;
}
function shortQuotationNo(qtn) {

  if (!qtn) return "-";

  const digits = qtn.replace(/\D/g, "");

  return `ORB-${digits.slice(-6)}`;
}
async function loadImage(url) {
  return new Promise((resolve, reject) => {

    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.onload = () => resolve(img);

    img.onerror = reject;

    img.src = url;

  });
}

const MIN_POLICY_SECTION_START_SPACE =
    PAGE.height * 0.28;

    const FOOTER_REQUIRED_HEIGHT = 28; // tune later (40–50 mm)

export async function generateQuotationPdf(quoteData) {

  
  const pdf = new jsPDF({
    
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

   let currentPage = 1;

  const logoImage = await loadImage(orbitzLogo);
  const webImage = await loadImage(webIcon);

const phoneImage = await loadImage(phoneIcon);

const locationImage = await loadImage(locationIcon);

  let cursorY = PAGE.marginTop;

const ensureSpace = (
  currentCursorY,
  requiredHeight
) => {

   

  if (
    currentCursorY + requiredHeight >
    PAGE.height - PAGE.marginBottom
  ) {

    pdf.addPage();

    return PAGE.marginTop;

  }

  return currentCursorY;

};

  // ---------- COMMON HEADER ----------
  cursorY = await drawCommonHeader(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    logoImage,
    webImage,
    phoneImage,
    locationImage
);

  // ---------- DIFFERENT CONTENT ----------
if (quoteData.quoteMode === "itinerary") {

    cursorY = await drawItineraryContent(
        pdf,
        quoteData,
        cursorY,
        ensureSpace
    );

} else {

    cursorY = drawGeneralContentCompact(
        pdf,
        quoteData,
        cursorY,
        ensureSpace
    );

}

// ---------- START POLICY ON A FRESH PAGE IF TOO LITTLE SPACE ----------
const remainingSpace =
    PAGE.height - PAGE.marginBottom - cursorY;

if (remainingSpace < MIN_POLICY_SECTION_START_SPACE) {

    pdf.addPage();

    cursorY = PAGE.marginTop;

}

// ---------- COMMON CANCELLATION POLICY ----------
cursorY = drawCancellationRefundPolicy(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    (y) =>
        drawCommonFooter(
            pdf,
            quoteData,
            y,
            ensureSpace
        )
);

pdf.save("Quotation.pdf");
}

import { COMPANY } from "./headerData";

async function drawCommonHeader(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  logoImage,
  webImage,
  phoneImage,
  locationImage
) {

  const top = PAGE.marginTop;

  // ========= LEFT BLOCK =========

  pdf.addImage(
    logoImage,
    "PNG",
    12,
    top,
    68,
    20
  );

  pdf.setFont("times", "italic");
  pdf.setFontSize(10);
  pdf.setTextColor(0,0,0);

  pdf.text(
    COMPANY.slogan,
    14,
    top + 24
  );

  pdf.setFont("helvetica","bold");
  pdf.setFontSize(9);

  pdf.text(
    COMPANY.services,
    14,
    top + 30
  );

  // ========= RIGHT BLOCK =========

  const rightX = 142;

  pdf.setFont("helvetica","normal");
  pdf.setFontSize(9);

  // Website
  pdf.addImage(
    webImage,
    "PNG",
    rightX,
    top + 6,
    4,
    4
  );

  pdf.text(
    COMPANY.website,
    rightX + 7,
    top + 9
  );

  // Phone
  pdf.addImage(
    phoneImage,
    "PNG",
    rightX,
    top + 15,
    4,
    4
  );

  pdf.text(
    COMPANY.phones,
    rightX + 7,
    top + 18
  );

  // Address
  pdf.addImage(
    locationImage,
    "PNG",
    rightX,
    top + 24,
    4,
    4
  );

  pdf.text(
    COMPANY.address,
    rightX + 7,
    top + 27,
    {
      maxWidth: 50
    }
  );

  // ========= DIVIDER =========

  const dividerY = top + 34;

  pdf.setDrawColor(37,99,235);
  pdf.setLineWidth(0.5);

  pdf.line(
    PAGE.marginLeft,
    dividerY,
    PAGE.width - PAGE.marginRight,
    dividerY
  );

  return dividerY + 8;

}

async function drawContinuationHeader(
  pdf,
  pageNumber,
  logoImage
) {

  let y = PAGE.marginTop;

  // Logo
  pdf.addImage(
    logoImage,
    "PNG",
    PAGE.marginLeft,
    y,
    18,
    5
  );

  // Company Name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(17,24,39);

  pdf.text(
    "Orbitz Holidays",
    PAGE.marginLeft + 22,
    y + 4
  );

  // Page Number
  pdf.text(
    `Page ${pageNumber}`,
    PAGE.width - PAGE.marginRight,
    y + 4,
    { align: "right" }
  );

  // Blue divider
  y += 8;

  pdf.setDrawColor(37,99,235);
  pdf.setLineWidth(0.5);

  pdf.line(
    PAGE.marginLeft,
    y,
    PAGE.width - PAGE.marginRight,
    y
  );

  return y + 6;

}

function drawTourSummary(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  // Make sure there is room for the summary block
  ensureSpace(45);

  // ---------- TOUR SUMMARY ----------
  cursorY = drawSectionHeading(
    pdf,
    "TOUR SUMMARY",
    cursorY
);
pdf.setTextColor(0, 0, 0);
pdf.setFont("times", "normal");
pdf.setFontSize(10);

  cursorY = drawSummaryRow3(
    pdf,

    "Client Name",
    quoteData.clientName || "-",

    "Mobile",
    quoteData.mobile || "-",

    "Email",
    quoteData.email || "-",

    cursorY
);

cursorY = drawSummaryRow2(
    pdf,

    "Destination",
   quoteData.customDestination?.trim()
    ? quoteData.customDestination
    : (quoteData.destination || "-"),

    "Travel Dates",
    `${formatPdfDate(quoteData.travelFrom)} - ${formatPdfDate(quoteData.travelTo)}`,

cursorY
);

cursorY = drawSummaryRow3(
    pdf,

    "Adults",
    quoteData.adults,

    "Children",
    quoteData.children,

    "Duration",
    getDuration(
      quoteData.travelFrom,
      quoteData.travelTo
    ),

    cursorY
);

    cursorY = drawSummaryRow3(
    pdf,

    "Quotation No",
    shortQuotationNo(
      quoteData.quotationNo
    ),

    "Date",
    formatPdfDate(new Date()),

    "Accomm",
    quoteData.accommodation,

    cursorY
);

return cursorY;

}

function drawInclusions(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  
) {

 ensureSpace(55);

  cursorY = drawSectionHeading(
    pdf,
    "INCLUSIONS",
    cursorY
  );
pdf.setTextColor(0, 0, 0);
pdf.setFont("times", "normal");
pdf.setFontSize(10);
  const inclusions = [

  ...(quoteData.inclusions || []),

  ...(quoteData.customInclusions || [])

];

  // ---------- INLINE LIST ----------
 const inclusionText =
    sanitizePdfText(
        inclusions.join("  •  ")
    );

  ensureSpace(12);

  pdf.setFont("times", "normal");
  pdf.setFontSize(10);

  const wrapped = pdf.splitTextToSize(
    inclusionText,
    PAGE.width -
      PAGE.marginLeft -
      PAGE.marginRight -
      8
  );

  pdf.text(
    wrapped,
    LAYOUT.bodyX,
    cursorY
);

 cursorY +=
  wrapped.length *
  SPACING.lineGap
cursorY += SPACING.blockGap;
  return cursorY;

}

function drawExclusions(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  
) {

ensureSpace(55);
  cursorY = drawSectionHeading(
    pdf,
    "EXCLUSIONS",
    cursorY
  );
  pdf.setTextColor(0, 0, 0);
pdf.setFont("times", "normal");
pdf.setFontSize(10);

 const exclusions = [

  ...(quoteData.exclusions || []),

  ...(quoteData.customExclusions || [])

];
  const exclusionText =
    sanitizePdfText(
        exclusions.join("  •  ")
    );

ensureSpace(12);

pdf.setFont("times", "normal");
pdf.setFontSize(10);

const wrapped = pdf.splitTextToSize(
  exclusionText,
  PAGE.width -
    PAGE.marginLeft -
    PAGE.marginRight -
    8
);

pdf.text(
    wrapped,
    LAYOUT.bodyX,
    cursorY
);

cursorY +=
  wrapped.length *
  SPACING.lineGap
cursorY += SPACING.blockGap;

return cursorY;

}

function drawDayWiseHeader(
  pdf,
  cursorY,
  ensureSpace
) {
  ensureSpace(18);

  cursorY = drawSectionHeading(
    pdf,
    "DETAILED TOUR ITINERARY",
    cursorY
  );

  return cursorY;
}



 function drawDayHeader(
    pdf,
    day,
     dayDate,
    cursorY,
    ensureSpace
) {

    

    const left = 15;

    // DAY box
    pdf.setFillColor(230, 230, 230);
    pdf.setDrawColor(180, 180, 180);
    pdf.roundedRect(left, cursorY, 24, 8, 1.5, 1.5, "DF");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
   pdf.setTextColor(0,0,0);

    pdf.text(
        `DAY ${day.day}`,
        left + 3,
        cursorY + 5.3
    );

    // DATE box
    pdf.setFillColor(230,230,230);
    pdf.setDrawColor(180, 180, 180);
    pdf.roundedRect(left + 28, cursorY, 28, 8, 1.5, 1.5, "DF");

    pdf.setFont("helvetica", "normal");

    

pdf.text(
    dayDate || "",
    left + 31,
    cursorY + 5.3
);

    // TITLE box
    pdf.setFillColor(230,230,230);
    pdf.setDrawColor(180, 180, 180);
    pdf.roundedRect(left + 60, cursorY, 120, 8, 1.5, 1.5, "DF");

    pdf.setFont("helvetica", "bold");

    pdf.text(
        day.title || "",
        left + 63,
        cursorY + 5.3
    );

    return cursorY + 14;
}

function drawSightseeingIncluded(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  ensureSpace(20);

  cursorY = drawSectionHeading(
    pdf,
    "SIGHTSEEING INCLUDED",
    cursorY
  );

  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const sightseeing = [

  ...(quoteData.sightseeing || []),

  ...(quoteData.customSightseeing || [])

];

  const text =
  sanitizePdfText(

    sightseeing.length
      ? sightseeing.join("   •   ")
      : "-"

  );

  const wrapped = pdf.splitTextToSize(
    text,
    PAGE.width - PAGE.marginLeft - PAGE.marginRight - 8
  );

  pdf.text(
    wrapped,
    LAYOUT.bodyX,
    cursorY
  );

  cursorY +=
  wrapped.length *
  SPACING.lineGap
  cursorY += SPACING.blockGap;

  return cursorY;

}

function drawTransfersIncluded(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  ensureSpace(20);

  cursorY = drawSectionHeading(
    pdf,
    "TRANSFERS INCLUDED",
    cursorY
  );

  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const transfers = [

    ...(quoteData.transfers || []),

    ...(quoteData.customTransfers || [])

  ];

  const text =
    transfers.length
      ? transfers.join("   •   ")
      : "-";

  const wrapped = pdf.splitTextToSize(
    text,
    PAGE.width -
      PAGE.marginLeft -
      PAGE.marginRight -
      8
  );

  pdf.text(
    wrapped,
    LAYOUT.bodyX,
    cursorY
  );

  cursorY +=
  wrapped.length *
  SPACING.lineGap
  cursorY += SPACING.blockGap;

  return cursorY;

}

function drawMealsIncluded(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  ensureSpace(20);

  cursorY = drawSectionHeading(
    pdf,
    "MEALS INCLUDED",
    cursorY
  );

  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const meals = [

    ...(quoteData.meals || []),

    ...(quoteData.customMeals || [])

  ];

  const text =
    sanitizePdfText(

        meals.length
            ? meals.join("   •   ")
            : "-"

    );

  const wrapped = pdf.splitTextToSize(
    text,
    PAGE.width -
      PAGE.marginLeft -
      PAGE.marginRight -
      8
  );

  pdf.text(
    wrapped,
    LAYOUT.bodyX,
    cursorY
  );

  cursorY +=
  wrapped.length *
 SPACING.lineGap
  cursorY += SPACING.blockGap;

  return cursorY;

}

function drawVisaInformation(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  if (!quoteData.visaRequired) {
    return cursorY;
  }

  ensureSpace(20);

  cursorY = drawSectionHeading(
    pdf,
    "VISA INFORMATION (Visa Assistance Included)",
    cursorY
  );

  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const visaServices = [

    ...(quoteData.visaServices || []),

    ...(quoteData.customVisaServices || [])

  ];

  const text =
    visaServices.length
      ? visaServices.join("   •   ")
      : "-";

  const wrapped = pdf.splitTextToSize(
    text,
    PAGE.width -
      PAGE.marginLeft -
      PAGE.marginRight -
      8
  );

  pdf.text(
    wrapped,
    LAYOUT.bodyX,
    cursorY
  );

 cursorY += wrapped.length * SPACING.lineGap;
cursorY += SPACING.blockGap;

return cursorY;
}

function drawCostSummary(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  ensureSpace(70);

  cursorY = drawSectionHeading(
    pdf,
    " BILLING DETAILS",
    cursorY
  );

  pdf.setFont("times","normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0,0,0);
  const rs = "Rs."


  // -----------------------------
  // VEHICLE COSTING
  // -----------------------------
  if (
    quoteData.useVehicleCosting &&
    quoteData.vehicleCosts?.length > 0
  ) {

    quoteData.vehicleCosts.forEach(vehicle => {

      const cost = Number(vehicle.cost || 0);

      const gst =
        quoteData.applyGst
          ? cost * Number(quoteData.gstPercent || 0) / 100
          : 0;

      const total = cost + gst;

      cursorY = drawGreyCostRow(
        pdf,
        `Package Cost With (${vehicle.vehicle})`,
        `${rs} ${cost.toLocaleString()}`,
        cursorY
      );

      if (quoteData.applyGst) {

        cursorY = drawGreyCostRow(
          pdf,
          `GST (${quoteData.gstPercent}%)`,
          `${rs} ${gst.toLocaleString()}`,
          cursorY
        );

      }

      cursorY = drawBlueCostRow(
        pdf,
        "GRAND TOTAL",
        `${rs} ${total.toLocaleString()}`,
        cursorY
      );

      cursorY += 3;

    });

  }

  // -----------------------------
  // GENERAL PACKAGE
  // -----------------------------
  else {
const subtotal = Number(quoteData.subtotal || 0);

const gstAmount =
  quoteData.applyGst
    ? subtotal * Number(quoteData.gstPercent || 0) / 100
    : 0;

const grandTotal = subtotal + gstAmount;

cursorY = drawGreyCostRow(
  pdf,
  "Package Cost",
  `${rs} ${subtotal.toLocaleString()}`,
  cursorY
);

if (quoteData.applyGst) {

  cursorY = drawGreyCostRow(
    pdf,
    `GST (${quoteData.gstPercent}%)`,
    `${rs} ${gstAmount.toLocaleString()}`,
    cursorY
  );

}

cursorY = drawBlueCostRow(
  pdf,
  "GRAND TOTAL",
 `${rs} ${grandTotal.toLocaleString()}`,
  cursorY
);

// ---------- USD ----------
if (quoteData.showUsd) {

  const usd =
    Number(quoteData.grandTotalUsd || 0);

  cursorY = drawGreyCostRow(
    pdf,
    "USD Equivalent",
    `$${usd.toFixed(2)}`,
    cursorY
  );

}
   
  }

  return cursorY;

}

function measureCostSummaryHeight(quoteData) {

  const HEADING_HEIGHT = 12;
  const ROW_HEIGHT = 7;
  const VEHICLE_GAP = 3;
  const BOTTOM_PADDING = 4;

  let height =
      HEADING_HEIGHT + BOTTOM_PADDING;

  // -----------------------------
  // Vehicle costing
  // -----------------------------
  if (
      quoteData.useVehicleCosting &&
      quoteData.vehicleCosts?.length > 0
  ) {

    console.log("vehicleCosts =", quoteData.vehicleCosts);

      quoteData.vehicleCosts.forEach(() => {

          // Package Cost
          height += ROW_HEIGHT;

          // GST
          if (quoteData.applyGst) {
              height += ROW_HEIGHT;
          }

          // Grand Total
          height += ROW_HEIGHT;

          // Gap after each vehicle block
          height += VEHICLE_GAP;

      });

  }

  // -----------------------------
  // General Package
  // -----------------------------
  else {

      // Package Cost
      height += ROW_HEIGHT;

      // GST
      if (quoteData.applyGst) {
          height += ROW_HEIGHT;
      }

      // Grand Total
      height += ROW_HEIGHT;

      // USD
      if (quoteData.showUsd) {
          height += ROW_HEIGHT;
      }

  }
console.log({
    finalHeight: height,
    useVehicleCosting: quoteData.useVehicleCosting,
    applyGst: quoteData.applyGst,
    showUsd: quoteData.showUsd
});
  return height;

}

function drawCostSummaryCompact(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  // Save starting position
  const startY = cursorY;

  // Measure only
  const measuredY =
    drawCostSummaryCompactInternal(
      pdf,
      quoteData,
      cursorY,
      ensureSpace,
      true
    );

  // Calculate required height
  const CARD_PADDING = 4;

const cardHeight =
    (measuredY - startY) +
    (CARD_PADDING * 2);

  

  // Restore original position
  cursorY = startY;

  // Page break if required
 cursorY = ensureSpace(
    cursorY,
    cardHeight
);

drawBillingCard(
    pdf,
    "BILLING DETAILS",
    PAGE.marginLeft,
    cursorY,
    PAGE.width -
        PAGE.marginLeft -
        PAGE.marginRight,
    cardHeight
);

  // Draw for real
  return drawCostSummaryCompactInternal(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    false
  );

}

function drawCostSummaryCompactInternal(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  measureOnly = false
) {

 

  // Header already drawn by drawBillingCard()
cursorY += SPACING.ribbonGap;

  pdf.setFont("times","normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0,0,0);
  const rs = "Rs."


  // -----------------------------
  // VEHICLE COSTING
  // -----------------------------
  if (
    quoteData.useVehicleCosting &&
    quoteData.vehicleCosts?.length > 0
  ) {

    quoteData.vehicleCosts.forEach(vehicle => {

      const cost = Number(vehicle.cost || 0);

      const gst =
        quoteData.applyGst
          ? cost * Number(quoteData.gstPercent || 0) / 100
          : 0;

      const total = cost + gst;

      if (measureOnly) {

    cursorY += 7;

} else {

      cursorY = drawGreyCostRowCompact(
        pdf,
        `Package Cost With (${vehicle.vehicle})`,
        `${rs} ${cost.toLocaleString()}`,
        cursorY
      );
      }

      if (quoteData.applyGst) {

        if (measureOnly) {

    cursorY += 7;

} else {
        cursorY = drawGreyCostRowCompact(
          pdf,
          `GST (${quoteData.gstPercent}%)`,
          `${rs} ${gst.toLocaleString()}`,
          cursorY
        );
}
      }
if (measureOnly) {

    cursorY += 7;

} else {
      cursorY = drawBlueCostRowCompact(
        pdf,
        "GRAND TOTAL",
        `${rs} ${total.toLocaleString()}`,
        cursorY
      );
}
      cursorY += 3;

    });

  }

  // -----------------------------
  // GENERAL PACKAGE
  // -----------------------------
  else {
const subtotal = Number(quoteData.subtotal || 0);

const gstAmount =
  quoteData.applyGst
    ? subtotal * Number(quoteData.gstPercent || 0) / 100
    : 0;

const grandTotal = subtotal + gstAmount;

if (measureOnly) {

    cursorY += 7;

} else {
cursorY = drawGreyCostRowCompact(
  pdf,
  "Package Cost",
  `${rs} ${subtotal.toLocaleString()}`,
  cursorY
);
}

if (quoteData.applyGst) {

  if (measureOnly) {

    cursorY += 7;

} else {

  cursorY = drawGreyCostRowCompact(
    pdf,
    `GST (${quoteData.gstPercent}%)`,
    `${rs} ${gstAmount.toLocaleString()}`,
    cursorY
  );
}
}
if (measureOnly) {

    cursorY += 7;

} else {
cursorY = drawBlueCostRowCompact(
  pdf,
  "GRAND TOTAL",
 `${rs} ${grandTotal.toLocaleString()}`,
  cursorY
);
}
// ---------- USD ----------
if (quoteData.showUsd) {

  const usd =
    Number(quoteData.grandTotalUsd || 0);

    if (measureOnly) {

    cursorY += 7;

} else {

  cursorY = drawGreyCostRowCompact(
    pdf,
    "USD Equivalent",
    `$${usd.toFixed(2)}`,
    cursorY
);
}
}
   
  }

  return cursorY;

}

function drawSinglePolicy(
    pdf,
    policy,
    cursorY,
    ensureSpace,
    measureOnly = false
) {
    if (!policy.text?.trim()) return cursorY;

    const title = sanitizePdfText(policy.title || "");

    const wrapped = buildWrappedPolicyLines(
        pdf,
        policy.text || ""
    );

    const visibleLineCount =
    wrapped.lines.filter(line => line !== null).length;

const estimatedHeight =
    12 +
    visibleLineCount * wrapped.lineHeight +
    6;

if (measureOnly) {
    return estimatedHeight;
}

    cursorY = ensureSpace(
        cursorY,
        estimatedHeight
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(
        `• ${title}`,
        PAGE.marginLeft,
        cursorY
    );

    cursorY += 5;

    cursorY = drawWrappedLines(
        pdf,
        wrapped.lines,
        0,
        PAGE.marginLeft + DESCRIPTION_INSET,
        cursorY
    );

    
console.log("After policy:", title, cursorY);
    cursorY += 6;

    return cursorY;
}


function drawCancellationRefundPolicy(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
     drawClosing
) {

    const policies =
        quoteData.cancellationRefundPolicy || [];

    if (!policies.length) return cursorY;

    const visiblePolicies = policies.filter(
        p => p.title?.trim() || p.text?.trim()
    );

    if (!visiblePolicies.length) return cursorY;

    cursorY += 20;

    cursorY = ensureSpace(cursorY, 20);

    cursorY = drawSectionHeading(
        pdf,
        "CANCELLATION & REFUND POLICY",
        cursorY,
        ensureSpace
    );

    cursorY += 5;

    // Draw every policy normally
    for (let i = 0; i < visiblePolicies.length; i++) {

    const policy = visiblePolicies[i];

    const isLast =
        i === visiblePolicies.length - 1;

if (isLast) {

    const footerHeight = 24;

    const policyHeight = drawSinglePolicy(
        pdf,
        policy,
        cursorY,
        ensureSpace,
        true
    );

    const remaining =
        PAGE.height -
        PAGE.marginBottom -
        cursorY;

    if (remaining < policyHeight + footerHeight) {

        pdf.addPage();

        cursorY = PAGE.marginTop;

    }

}
    

 cursorY = drawSinglePolicy(
        pdf,
        policy,
        cursorY,
        ensureSpace
         
      );

}


    cursorY = drawClosing(cursorY);

return cursorY;
}

function drawCommonFooter(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  
) {

  console.log("Footer starts at:", cursorY);

 cursorY += 10;

const footerY = cursorY;


  pdf.setDrawColor(37, 99, 235);

pdf.setLineWidth(0.4);

pdf.line(
    PAGE.marginLeft,
    footerY,
    PAGE.width - PAGE.marginRight,
    footerY
);

pdf.setFont("times", "bold");
pdf.setFontSize(13);

pdf.setFont("times", "bold");
pdf.setFontSize(13);

pdf.text(
    "Thank You for Choosing Orbitz Holidays",
    PAGE.width / 2,
    footerY + 10,
    { align: "center" }
);

pdf.setFont("times", "italic");
pdf.setFontSize(11);
pdf.setTextColor(0, 0, 0);

pdf.text(
    "Anywhere, Anytime, Around the World",
    PAGE.width / 2,
    footerY + 17,
    { align: "center" }
);

  pdf.setFont("times", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  return footerY + 20;

}


 function drawCityHotelMeals(
    pdf,
    day,
    cursorY,
    ensureSpace,
    isLastDay = false,
    skipEnsure = false
)
{
  console.log("drawCityHotelMeals START", {
    day: day.dayNumber,
    cursorY,
    mealMode: day.mealMode,
    preview: (day.mealText || "").substring(0, 25)
});

   const left = LAYOUT.col1LabelX;

    const cityName =
    day.customCity?.trim()
        ? day.customCity.trim()
        : (day.city || "").trim();

const hotelName =
    day.customHotel?.trim()
        ? day.customHotel.trim()
        : (day.hotel || "").trim();

const hasCity =
    cityName !== "";

const hasHotel =
    hotelName !== "";

const isCheckoutDay = isLastDay;
    // -----------------------------
    // CITY + HOTEL (ALWAYS INLINE)
    // -----------------------------
if (!isLastDay) {
    
    pdf.setFontSize(10);

   pdf.setFont("times", "bold");
pdf.text("City:", left, cursorY);

   
    const VALUE_X = LAYOUT.col1ValueX;

    pdf.setFont("times", "normal");
    console.log("City Y =", cursorY);
pdf.text(
    cityName || "-",
   left + 15,   // instead of VALUE_X
    cursorY
);

 }

 if (!isLastDay) {

   pdf.setFont("times", "bold");

pdf.text(
    "Hotel:",
    left + 60,
    cursorY
);

pdf.setFont("times", "normal");

const hotelDisplay =
    hotelName
        ? `${hotelName}${
            day.hotelCategoryLabel?.trim()
                ? ` (${day.hotelCategoryLabel})`
                : ""
          }`
        : "-";

pdf.text(
    hotelDisplay,
    left + 73,      // ← keep unchanged
    cursorY
);

}



   // =====================================
// CHIP MODE
// =====================================

if (day.mealMode !== "text") {

    const mealItems = [
    ...(day.meals || []),
    ...(day.customMeals || [])
];

const mealText =
    sanitizePdfText(

        mealItems.length
            ? mealItems.join(" • ")
            : "-"

    );

    pdf.setFont("times", "bold");

    const mealLabelX = isLastDay
        ? LAYOUT.col1LabelX
        : LAYOUT.col3LabelX;

    const mealValueX = isLastDay
        ?  left + 19
        :  left + 140;

    pdf.text(
        isLastDay ? "Meal Plan:" : "Meals:",
        mealLabelX,
        cursorY
    );

    pdf.setFont("times", "normal");

    pdf.text(
        mealText,
        mealValueX,
        cursorY
    );

    // IMPORTANT: keep the original cursor movement
    cursorY += 7;

    return cursorY;
}

    // =====================================
// CUSTOM TEXT MODE
// =====================================



if (isCheckoutDay) {

    cursorY += 2;

} else {

    cursorY += 8;

}

pdf.setFont("times", "bold");
console.log("Meal Label Y =", cursorY);
pdf.text(
    "Meal Plan:",
    left,
    cursorY
);

pdf.setFont("times", "normal");


const VALUE_X = left + 19;



return drawHangingParagraph(
    pdf,
    sanitizePdfText(
        day.mealText || "-"
    ),
    VALUE_X,
    left,
    cursorY
);

}


 function drawSightseeing(
    pdf,
    day,
    cursorY,
    ensureSpace
) {

    const left = LAYOUT.col1LabelX;

    if (
    day.sightseeingMode === "text" &&
   sanitizePdfText(day.sightseeingText)
) {

    pdf.setFont("times", "bold");
    pdf.setFontSize(10);

    pdf.text(
        "Sightseeing:",
        left,
        cursorY
    );

    pdf.setFont("times", "normal");

    
    const startX = LAYOUT.col1ValueX;
       
    const sightseeingText =
    sanitizePdfText(
        day.sightseeingText
    );
    const wrapped =
        pdf.splitTextToSize(
             sightseeingText,
            PAGE.width -
                PAGE.marginRight -
                startX
        );

    pdf.text(
    wrapped[0],
    startX,
    cursorY
);

cursorY += 5;

if (wrapped.length > 1) {

    cursorY = drawWrappedLines(
        pdf,
        wrapped,
        1,
        left,
        cursorY
    );

}

return cursorY + 2;
    
}

    const sightseeing =
    (day.selectedSightseeing || []).filter(Boolean);

const sightseeingText =
    sanitizePdfText(
        day.sightseeingText
    );

const hasSightseeing =
    day.sightseeingMode === "text"
        ? !!sightseeingText
        : sightseeing.length > 0;

if (!hasSightseeing) {

    return cursorY;

}

const hasDescription =
    sightseeing.some(
        item =>
            item &&
            item.description &&
            item.description.trim() !== ""
    );

    pdf.setFont("times", "bold");
    pdf.setFontSize(10);

    // ------------------------------
    // CASE 1 : INLINE
    // ------------------------------
    if (!hasDescription) {

        pdf.text(
            "Sightseeing:",
            left,
            cursorY
        );

        pdf.setFont("times", "normal");

        const text =
    sanitizePdfText(

        sightseeing.length
            ? sightseeing
                  .map(s => s?.name || "")
                  .filter(Boolean)
                  .join(" • ")
            : "-"

    );

        const startX = 43;

        const wrapped =
            pdf.splitTextToSize(
                text,
                PAGE.width -
                    PAGE.marginRight -
                    startX
            );

            

        pdf.text(
    wrapped[0],
    startX,
    cursorY
);

cursorY += 5;

if (wrapped.length > 1) {

    cursorY = drawWrappedLines(
        pdf,
        wrapped,
        1,
        left,
        cursorY
    );

}

return cursorY + 2;

    }

    // ------------------------------
    // CASE 2 : VERTICAL
    // ------------------------------

    pdf.text(
        "Sightseeing:",
        left,
        cursorY
    );

    cursorY += 5;

    sightseeing.forEach(item => {

        const bullet =
            " • ";

        if (item.description?.trim()) {

            pdf.setFont(
                "times",
                "bold"
            );

            pdf.text(
    bullet + item.name + ":",
    left,
    cursorY
);

            const titleWidth =
                pdf.getTextWidth(
                    bullet +
                        item.name +
                        ": "
                );

            pdf.setFont(
                "times",
                "normal"
            );

            const description =
    sanitizePdfText(
        item.description
    );

const wrapped =
    pdf.splitTextToSize(
        description,
        PAGE.width -
            PAGE.marginRight -
            (left +
                2 +
                titleWidth)
    );

            // first line
           pdf.text(
    wrapped[0],
    left +
        titleWidth +
        2,
    cursorY
);

            // remaining lines align below item name

           

cursorY += 5;

if (wrapped.length > 1) {

    cursorY = drawWrappedLines(
        pdf,
        wrapped,
        1,
        left,
        cursorY
    );

}
       } else {

    pdf.setFont(
        "times",
        "bold"
    );

    pdf.text(
        bullet +
            item.name,
        left,
        cursorY
    );

    cursorY += 5;

}
        cursorY += 2;

    });

    return cursorY;

}

 function drawTransfers(
    pdf,
    day,
    cursorY,
    ensureSpace
) {

    const left = LAYOUT.col1LabelX;

    const transferItems = [
    ...(day.transfers || []),
    ...(day.customTransfers || [])
];

const transferText =
    sanitizePdfText(day.transferText);

const hasTransfers =
    day.transferMode === "text"
        ? !!transferText
        : transferItems.length > 0;

if (!hasTransfers) {
    return {
        cursorY,
        remainingLines: [],
        textX: 15
    };
}

    // ---------- CUSTOM TEXT ----------
    if (
    day.transferMode === "text" &&
    transferText
)
     {

        pdf.setFont("times", "bold");
        pdf.setFontSize(10);

        pdf.text(
            "Transfers:",
            left,
            cursorY
        );

        pdf.setFont("times", "normal");

        const VALUE_X = left + 19;

const lines =
    buildHangingLines(
        pdf,
        transferText,
        VALUE_X,
        left
    );

return {
    cursorY: drawHangingLines(
        pdf,
        "Transfers:",
        lines,
        left,
        VALUE_X,
        cursorY
    ),
    remainingLines: [],
    textX: left
};
    }

    // ---------- CHIP MODE ----------

    const VALUE_X = left + 19;

const lines =
    buildHangingLines(
        pdf,
        sanitizePdfText(
            transferItems.join(" • ")
        ),
        VALUE_X,
        left
    );

return {
    cursorY: drawHangingLines(
        pdf,
        "Transfers:",
        lines,
        left,
        VALUE_X,
        cursorY
    ),
    remainingLines: [],
    textX: left
};

}

function drawGeneralContent(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  
) {
cursorY = drawTourSummary(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);

cursorY = drawInclusions(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
   
);

cursorY = drawExclusions(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    
);
cursorY = drawSightseeingIncluded(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawTransfersIncluded(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawMealsIncluded(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawVisaInformation(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawCostSummary(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawImportantNotes(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);


return cursorY;
}

function drawGeneralContentCompact(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  
) {
cursorY = drawTourSummary(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);

cursorY = drawInclusions(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
   
);

cursorY = drawExclusions(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    
);
cursorY = drawSightseeingIncluded(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawTransfersIncluded(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawMealsIncluded(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawVisaInformation(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);
cursorY = drawCostSummaryCompact(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);



return cursorY;
}



async function drawItineraryContent(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {
  cursorY = drawTourSummary(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
);
cursorY = drawInclusions(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);

cursorY = drawExclusions(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);

 cursorY = drawDayWiseHeader(
    pdf,
    cursorY,
    ensureSpace
  );

 

const itinerary = quoteData.itinerary || [];

for (const [index, day] of itinerary.entries()) {

  const baseDate = new Date(quoteData.travelFrom);

baseDate.setDate(
    baseDate.getDate() + index
);

const dayDate =
    formatPdfDate(baseDate);

  
  
const description =
    sanitizePdfText(
        day.description
    );

const preview =
    measureDescriptionPreview(
        pdf,
        description
    );

   const sightseeingItems = [
    ...(day.sightseeing || []),
    ...(day.customSightseeing || [])
];

const sightseeingText =
    sanitizePdfText(
        sightseeingItems.join(" • ")
    );

const sightseeingPreview =
    buildWrappedDescriptionLines(
        pdf,
        sightseeingText
    );

const FIRST_SIGHTSEEING_BLOCK =
    sightseeingPreview.lines.length > 0
        ? sightseeingPreview.lineHeight
        : 0;

// Day ribbon (~10 mm) + first 2 description lines


const hasDescription =
    !!sanitizePdfText(day.description)?.trim();

const DAY_HEADER_HEIGHT = 14;
const CITY_HOTEL_MEAL_HEIGHT = 7;

const DAY_START_SPACE =
    hasDescription
        ? (
            10 +
            preview.firstTwoHeight
          )
        : (
            DAY_HEADER_HEIGHT +
            CITY_HOTEL_MEAL_HEIGHT
          );
    

cursorY = ensureSpace(
    cursorY,
    DAY_START_SPACE
);


cursorY = await drawDayHeader(
    pdf,
    day,
    dayDate,
    cursorY,
    ensureSpace
);
    

    
    
    

// ---------- draw first two lines ----------

const firstTwo =
    preview.lines.slice(0, 2);

if (firstTwo.length > 0) {

    pdf.setFont("times", "italic");
    pdf.setFontSize(10);

    firstTwo.forEach((line) => {

        pdf.text(
           PAGE.marginLeft + DESCRIPTION_INSET,
            cursorY,
            line
        );

        cursorY += preview.lineHeight;

    });

    pdf.setFont("times", "normal");

    }


// ---------- remaining description ----------


if (preview.lines.length > 2) {

  

    cursorY = drawWrappedLines(
    pdf,
    preview.lines,
    2,
   PAGE.marginLeft + DESCRIPTION_INSET,
    cursorY
);
}


// ---------- optional note ----------


if (
    day.noteEnabled &&
    day.noteText?.trim()
) {

  cursorY -= 2;

    // Estimate required height
    const noteLines = pdf.splitTextToSize(
        day.noteText,
        PAGE.width -
        PAGE.marginLeft -
        PAGE.marginRight -
        21
    );

    const noteHeight =
        6 +
        noteLines.length * 4.3 +
        6;

    cursorY = ensureSpace(
        cursorY,
        noteHeight
    );

    cursorY = drawCalloutBox(
        pdf,
        "Note",
        day.noteText,
        cursorY
    );

}



// ---------- Reserve City + Meal block ----------



// ---------- City / Hotel / Meal ----------

cursorY = drawCityHotelMeals(
    pdf,
    day,
    cursorY,
    ensureSpace,
    index === itinerary.length - 1,   // isLastDay
    !hasDescription                    // skipEnsure
);


    // ---------- Sightseeing start ----------

if (FIRST_SIGHTSEEING_BLOCK > 0) {

    const SIGHTSEEING_START_SPACE =
        5 + FIRST_SIGHTSEEING_BLOCK;

   cursorY = await ensureSpace(
    cursorY,
    SIGHTSEEING_START_SPACE
);

}
   // ---------- Sightseeing ----------

cursorY = drawSightseeing(
    pdf,
    day,
    cursorY,
    ensureSpace
);



   // ---------- Transfers ----------

const transferResult =
    drawTransfers(
        pdf,
        day,
        cursorY,
        ensureSpace
    );

cursorY =
    drawWrappedLines(
        pdf,
        transferResult.remainingLines,
        0,
        transferResult.textX,   // use returned indent
        transferResult.cursorY
    );
    
}



cursorY += 4;


cursorY = drawCostSummaryCompact(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
);



return cursorY;

}




