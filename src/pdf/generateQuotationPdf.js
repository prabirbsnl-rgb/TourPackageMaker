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
  drawLabeledWrappedParagraph,
  buildWrappedDescriptionLines,
  drawSummaryRow2,
  drawSummaryRow3,
  drawGreyCostRow,
  drawBlueCostRow,
  drawGreyCostRowCompact,
  drawBlueCostRowCompact,
  measureDescriptionPreview,
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

  return `QTN-${digits.slice(-6)}`;

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

    console.log(
    "NEW ensureSpace",
    currentCursorY
);

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

  // ---------- COMMON FOOTER ----------
  if (quoteData.quoteMode === "itinerary") {

  // Need about 25–30 mm for the thank-you footer
if (cursorY > PAGE.height - 55) {

    pdf.addPage();

    cursorY = PAGE.marginTop;

}

cursorY = drawCommonFooter(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    true
);

} else {

  cursorY = drawCommonFooter(
      pdf,
      quoteData,
      cursorY,
      ensureSpace,
      false
  );

}

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
    quoteData.destination || "-",

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
    formatPdfDate(
      quoteData.travelFrom
    ),

    "Accommodation",
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
    inclusions.join("  •  ");

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
  exclusions.join("  •  ");

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
    "DAY WISE ITINERARY",
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
  sightseeing.length
    ? sightseeing.join("   •   ")
    : "-";

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
    meals.length
      ? meals.join("   •   ")
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
    "COST SUMMARY",
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

function drawCostSummaryCompact(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  ensureSpace(70);

  cursorY = drawSectionHeading(
    pdf,
    "COST SUMMARY",
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

      cursorY = drawGreyCostRowCompact(
        pdf,
        `Package Cost With (${vehicle.vehicle})`,
        `${rs} ${cost.toLocaleString()}`,
        cursorY
      );

      if (quoteData.applyGst) {

        cursorY = drawGreyCostRowCompact(
          pdf,
          `GST (${quoteData.gstPercent}%)`,
          `${rs} ${gst.toLocaleString()}`,
          cursorY
        );

      }

      cursorY = drawBlueCostRowCompact(
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

cursorY = drawGreyCostRowCompact(
  pdf,
  "Package Cost",
  `${rs} ${subtotal.toLocaleString()}`,
  cursorY
);

if (quoteData.applyGst) {

  cursorY = drawGreyCostRowCompact(
    pdf,
    `GST (${quoteData.gstPercent}%)`,
    `${rs} ${gstAmount.toLocaleString()}`,
    cursorY
  );

}

cursorY = drawBlueCostRowCompact(
  pdf,
  "GRAND TOTAL",
 `${rs} ${grandTotal.toLocaleString()}`,
  cursorY
);

// ---------- USD ----------
if (quoteData.showUsd) {

  const usd =
    Number(quoteData.grandTotalUsd || 0);

  cursorY = drawGreyCostRowCompact(
    pdf,
    "USD Equivalent",
    `$${usd.toFixed(2)}`,
    cursorY
);
}
   
  }

  return cursorY;

}

function drawImportantNotes(
  pdf,
  quoteData,
  cursorY,
  ensureSpace
) {

  ensureSpace(40);

 
cursorY = drawSectionHeading(
    pdf,
    "IMPORTANT NOTES & TERMS",
    cursorY
);

pdf.setFont("times","normal");
pdf.setFontSize(10);
pdf.setTextColor(0,0,0);
if (quoteData.specialNotes?.trim()) {

    pdf.setFont("times","bold");

    pdf.text(
        "Special Notes :",
        LAYOUT.bodyX,
        cursorY
    );

    pdf.setFont("times","normal");

    const specialNotes = quoteData.specialNotes
        .split(",")
        .map(note => note.trim())
        .filter(Boolean)
        .join(" • ");

    const wrapped = pdf.splitTextToSize(
        specialNotes,
        PAGE.width -
        PAGE.marginLeft -
        PAGE.marginRight -
        40
    );

    pdf.text(
        wrapped,
        LAYOUT.bodyX + 32,
        cursorY
    );

    cursorY += wrapped.length * SPACING.lineGap + 4;

}
const terms = (quoteData.terms || []).join(" • ");

if (terms) {

    const wrapped = pdf.splitTextToSize(
        terms,
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

   cursorY += wrapped.length * SPACING.lineGap + 4;
}
  return cursorY;

}

function drawCommonFooter(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  fixedBottom = true
) {

 const footerY = fixedBottom
    ? PAGE.height - 30
    : cursorY + 8;

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
    ensureSpace
) {

    

    const left = 15;

    const cityName = String(
  day.customCity?.trim()
    ? day.customCity
    : (day.city || "-")
);

const hotelName = String(
  day.customHotel?.trim()
    ? day.customHotel
    : (day.hotel || "-")
);

const meals =
  day.mealMode === "text"
    ? (day.mealText?.trim() || "-")
    : (
        [
          ...(day.meals || []),
          ...(day.customMeals || [])
        ].length
          ? [
              ...(day.meals || []),
              ...(day.customMeals || [])
            ].join(" • ")
          : "-"
      );

    pdf.setFont("times", "bold");
    pdf.setFontSize(10);

    pdf.text("City:", left, cursorY);

    pdf.setFont("times", "normal");
    pdf.text(
        cityName || "-",
        left + 28,
        cursorY
    );

    pdf.setFont("times", "bold");
    pdf.text(
        "Hotel:",
        left + 60,
        cursorY
    );

    pdf.setFont("times", "normal");
    pdf.text(
        hotelName || "-",
        left + 78,
        cursorY
    );

    pdf.setFont("times", "bold");
pdf.text(
    "Meal Plan:",
    left,
    cursorY
);

const titleWidth =
    pdf.getTextWidth(
        "Meal Plan: "
    );

pdf.setFont("times", "normal");

const wrapped =
    pdf.splitTextToSize(
        day.mealText,
        PAGE.width -
            PAGE.marginRight -
            (left + titleWidth)
    );

// first line starts beside the colon
pdf.text(
    wrapped[0],
    left + titleWidth,
    cursorY
);

// remaining lines align below the M of Meal Plan
if (wrapped.length > 1) {

    pdf.text(
        wrapped.slice(1),
        left,
        cursorY + 5
    );

}

cursorY +=
    wrapped.length * 5 +
    2;

return cursorY;
}

 function drawSightseeing(
    pdf,
    day,
    cursorY,
    ensureSpace
) {

    const left = 15;

    if (
    day.sightseeingMode === "text" &&
    day.sightseeingText?.trim()
) {

    pdf.setFont("times", "bold");
    pdf.setFontSize(10);

    pdf.text(
        "Sightseeing:",
        left,
        cursorY
    );

    pdf.setFont("times", "normal");

    const startX =
        left +
        pdf.getTextWidth(
            "Sightseeing: "
        );

    const wrapped =
        pdf.splitTextToSize(
            day.sightseeingText,
            PAGE.width -
                PAGE.marginRight -
                startX
        );

    pdf.text(
        wrapped[0],
        startX,
        cursorY
    );

    if (wrapped.length > 1) {

        pdf.text(
            wrapped.slice(1),
            left,
            cursorY + 5
        );

    }

    return (
        cursorY +
        wrapped.length * 5 +
        2
    );

}

    const sightseeing =
    (day.selectedSightseeing || []).filter(Boolean);

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
    sightseeing.length
        ? sightseeing
              .map(s => s?.name || "")
              .filter(Boolean)
              .join(" • ")
        : "-";

        const startX =
            left +
            pdf.getTextWidth(
                "Sightseeing: "
            );

        const wrapped =
            pdf.splitTextToSize(
                text,
                PAGE.width -
                    PAGE.marginRight -
                    startX
            );

            

        pdf.text(
            wrapped,
            startX,
            cursorY
        );

        return (
            cursorY +
            wrapped.length * 5 +
            2
        );

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
            "• ";

        if (item.description?.trim()) {

            pdf.setFont(
                "times",
                "bold"
            );

            pdf.text(
                bullet +
                    item.name +
                    ":",
                left + 5,
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

            const wrapped =
                pdf.splitTextToSize(
                    item.description,
                    PAGE.width -
                        PAGE.marginRight -
                        (left +
                            5 +
                            titleWidth)
                );

            // first line
            pdf.text(
                wrapped[0],
                left +
                    5 +
                    titleWidth,
                cursorY
            );

            // remaining lines align below item name
            if (
                wrapped.length > 1
            ) {

                pdf.text(
                    wrapped.slice(1),
                    left + 7,
                    cursorY + 5
                );

            }

            cursorY +=
                wrapped.length * 5;

        } else {

            pdf.setFont(
                "times",
                "normal"
            );

            pdf.text(
                bullet +
                    item.name,
                left + 5,
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

    const left = 15;

    // ---------- CUSTOM TEXT ----------
    if (
        day.transferMode === "text" &&
        day.transferText?.trim()
    ) {

        pdf.setFont("times", "bold");
        pdf.setFontSize(10);

        pdf.text(
            "Transfers:",
            left,
            cursorY
        );

        pdf.setFont("times", "normal");

        const startX =
            left +
            pdf.getTextWidth(
                "Transfers: "
            );

        const wrapped =
            pdf.splitTextToSize(
                day.transferText,
                PAGE.width -
                    PAGE.marginRight -
                    startX
            );

        return drawLabeledWrappedParagraph(
            pdf,
            "Transfers:",
            wrapped,
            left,
            startX,
            cursorY
        );

    }

    // ---------- CHIP MODE ----------

    const transferText =
        [
            ...(day.transfers || []),
            ...(day.customTransfers || [])
        ].length
            ? [
                ...(day.transfers || []),
                ...(day.customTransfers || [])
              ].join(" • ")
            : "-";

    const maxWidth =
        PAGE.width -
        PAGE.marginRight -
        (left + 36);

    const lines =
        pdf.splitTextToSize(
            transferText,
            maxWidth
        );

    return drawLabeledWrappedParagraph(
        pdf,
        "Transfers:",
        lines,
        left,
        left + 28,
        cursorY
    );

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
cursorY = drawImportantNotes(
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

  console.log("DESCRIPTION =", day.description);
  console.log(day);
  
const preview =
    measureDescriptionPreview(
        pdf,
        day.description
    );

    const sightseeingItems = [
    ...(day.sightseeing || []),
    ...(day.customSightseeing || [])
];

const sightseeingText =
    sightseeingItems.join(" • ");

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
const DAY_START_SPACE =
    10 + preview.firstTwoHeight;

    console.log(
  "DAY START CHECK",
  {
    currentCursor: cursorY,
    required: DAY_START_SPACE,
    pageBottom: PAGE.height - PAGE.marginBottom
  }
);

cursorY = ensureSpace(
    cursorY,
    DAY_START_SPACE
);

cursorY = await drawDayHeader(
    pdf,
    day,
    formatPdfDate(quoteData.travelFrom),
    cursorY,
    ensureSpace
);

    

    console.log("cursorY before description =", cursorY);
    
    

// ---------- draw first two lines ----------

const firstTwo =
    preview.lines.slice(0, 2);

if (firstTwo.length > 0) {

    pdf.setFont("times", "italic");
    pdf.setFontSize(10);

    firstTwo.forEach((line) => {

        pdf.text(
            PAGE.marginLeft,
            cursorY,
            line
        );

        cursorY += preview.lineHeight;

    });

    pdf.setFont("times", "normal");

    cursorY += 2;

}


// ---------- remaining description ----------
console.log({
    totalLines: preview.totalLines,
    lineArrayLength: preview.lines.length,
    preview
});

if (preview.lines.length > 2) {

  console.log({
    totalLines: preview.lines.length,
    startIndex: 2,
    cursorBefore: cursorY
});

    cursorY = drawWrappedLines(
    pdf,
    preview.lines,
    2,
    PAGE.marginLeft,
    cursorY
);

}

// ---------- City row ----------

const CITY_BLOCK_HEIGHT = 10;

await ensureSpace(
    CITY_BLOCK_HEIGHT
);

cursorY = drawCityHotelMeals(
    pdf,
    day,
    cursorY,
    ensureSpace
);
    // ---------- Sightseeing start ----------

if (FIRST_SIGHTSEEING_BLOCK > 0) {

    const SIGHTSEEING_START_SPACE =
        5 + FIRST_SIGHTSEEING_BLOCK;

    await ensureSpace(
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
        transferResult.textX,
        transferResult.cursorY
    );

}

cursorY += 4;

return cursorY;
}




