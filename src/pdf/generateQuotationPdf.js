


import jsPDF from "jspdf";

import "../fonts/NotoSans-normal";

import { PAGE, SPACING, LAYOUT } from "./pdfTheme";
import orbitzLogo from "../assets/orbitz-logo.png";
import webIcon from "../assets/web.png";
import phoneIcon from "../assets/phone.png";
import locationIcon from "../assets/location.png";

import orbitzTravelHeaderImage
  from "../assets/pdf-header/orbitz-header-travel.png";

  import orbitzHeaderFinalImage
  from "../assets/pdf-header/orbitz-header-final.png";

  import kenyaHeaderImage
  from "../assets/pdf-header/kenya.png";

import {
  getQuotationHeaderImage
} from "./quotationHeaderImages";

import {
  getCurrency,
  DEFAULT_CURRENCY
} from "../config/currencies";

import {
    COLORS,
    RIBBON
} from "./pdfTheme";

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
  buildWrappedRichDescriptionLines,
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


// =========================================================
// PDF THEME COLOR HELPER
// =========================================================

function hexToRgb(hex) {

  if (
    typeof hex !== "string" ||
    !/^#[0-9A-Fa-f]{6}$/.test(hex)
  ) {
    return [
      22,
      52,
      78
    ];
  }

  const cleanHex =
    hex.substring(1);

  return [
    parseInt(
      cleanHex.substring(0, 2),
      16
    ),

    parseInt(
      cleanHex.substring(2, 4),
      16
    ),

    parseInt(
      cleanHex.substring(4, 6),
      16
    )
  ];
}


// =========================================================
// HOTEL USED — DERIVED COLOR FAMILY
// =========================================================

function getHotelUsedColorFamily(
  baseColor
) {

  const [
    r,
    g,
    b
  ] = baseColor;

  // -------------------------------------------------------
  // Mix the base color toward white
  // -------------------------------------------------------

  const mixWithWhite = (
    amount
  ) => [

    Math.round(
      r +
      (255 - r) * amount
    ),

    Math.round(
      g +
      (255 - g) * amount
    ),

    Math.round(
      b +
      (255 - b) * amount
    )

  ];


  // -------------------------------------------------------
  // Darken the base color
  // -------------------------------------------------------

  const darken = (
    amount
  ) => [

    Math.round(
      r * (1 - amount)
    ),

    Math.round(
      g * (1 - amount)
    ),

    Math.round(
      b * (1 - amount)
    )

  ];


  return {

    // Main section ribbon
    section: [
      r,
      g,
      b
    ],

    // Table header — lighter version
    tableHeader:
      mixWithWhite(0.72),

    // Header text — darker version
    headerText:
      darken(0.42),

    // Column divider
    divider:
      mixWithWhite(0.38),

    // Alternating row
    rowBand:
      mixWithWhite(0.90)

  };

}


// =========================================================
// BILLING — DERIVED COLOR FAMILY
// =========================================================

function getBillingColorFamily(
  baseColor
) {

  const [
    r,
    g,
    b
  ] = baseColor;

  const mixWithWhite = (
    amount
  ) => [

    Math.round(
      r +
      (255 - r) * amount
    ),

    Math.round(
      g +
      (255 - g) * amount
    ),

    Math.round(
      b +
      (255 - b) * amount
    )

  ];

  const darken = (
    amount
  ) => [

    Math.round(
      r * (1 - amount)
    ),

    Math.round(
      g * (1 - amount)
    ),

    Math.round(
      b * (1 - amount)
    )

  ];

  return {

    // Main Billing header
    header:
      baseColor,

    // Normal billing row
    background:
      mixWithWhite(0.86),

    // Alternate billing row
    backgroundAlt:
      mixWithWhite(0.93),

    // Row divider
    border:
      mixWithWhite(0.45),

    // Billing row text
    text:
      darken(0.55),

    // Slightly darker supporting text
    label:
      darken(0.40),

    // Card border
    cardBorder:
      mixWithWhite(0.30),

    // Left accent
    accent:
      darken(0.18)

  };

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


function createFinalPhotoHeader(
  sourceImage,
  pdfWidth,
  pdfHeight
) {
  // =========================================================
  // HIGH-RES INTERNAL CANVAS
  //
  // IMPORTANT:
  // pdfWidth/pdfHeight are PDF mm.
  // We create the artwork at 1400 px wide so jsPDF does
  // not have to enlarge a tiny canvas.
  // =========================================================

  const width = 1400;

  const height =
    Math.round(
      width *
      (pdfHeight / pdfWidth)
    );

  const canvas =
    document.createElement("canvas");

  canvas.width =
    width;

  canvas.height =
    height;

  const ctx =
    canvas.getContext("2d");

  // =========================================================
  // DRAW COMPLETE ORIGINAL PHOTO
  //
  // This deliberately keeps the entire original scene:
  // both balloons + both giraffes + complete savanna.
  //
  // A small amount of vertical compression is intentional.
  // =========================================================

  ctx.drawImage(
    sourceImage,
    0,
    0,
    width,
    height
  );


  // =========================================================
// CRISP + VIBRANT PHOTO TREATMENT
// =========================================================

const imageData =
  ctx.getImageData(
    0,
    0,
    width,
    height
  );

const pixels =
  imageData.data;


// ---------------------------------------------------------
// 1. CONTRAST + VIBRANCY
// ---------------------------------------------------------

for (
  let i = 0;
  i < pixels.length;
  i += 4
) {

  // Contrast
  pixels[i] =
    Math.min(
      255,
      Math.max(
        0,
        (pixels[i] - 128) * 1.14 + 128
      )
    );

  pixels[i + 1] =
    Math.min(
      255,
      Math.max(
        0,
        (pixels[i + 1] - 128) * 1.14 + 128
      )
    );

  pixels[i + 2] =
    Math.min(
      255,
      Math.max(
        0,
        (pixels[i + 2] - 128) * 1.14 + 128
      )
    );

  // Saturation / vibrancy
  const avg =
    (
      pixels[i] +
      pixels[i + 1] +
      pixels[i + 2]
    ) / 3;

  pixels[i] =
    Math.min(
      255,
      avg +
        (pixels[i] - avg) * 1.10
    );

  pixels[i + 1] =
    Math.min(
      255,
      avg +
        (pixels[i + 1] - avg) * 1.10
    );

  pixels[i + 2] =
    Math.min(
      255,
      avg +
        (pixels[i + 2] - avg) * 1.10
    );
}

ctx.putImageData(
  imageData,
  0,
  0
);


// =========================================================
// 2. HIGH-PASS SHARPENING
//
// This actually increases edge/detail clarity rather than
// merely increasing contrast.
//
// The original photograph remains the base image.
// =========================================================

const original =
  ctx.getImageData(
    0,
    0,
    width,
    height
  );

const sharp =
  original.data;

const copyCanvas =
  document.createElement("canvas");

copyCanvas.width =
  width;

copyCanvas.height =
  height;

const copyCtx =
  copyCanvas.getContext("2d");

copyCtx.putImageData(
  original,
  0,
  0
);

const blurred =
  document.createElement("canvas");

blurred.width =
  width;

blurred.height =
  height;

const blurCtx =
  blurred.getContext("2d");

blurCtx.filter =
  "blur(1.2px)";

blurCtx.drawImage(
  copyCanvas,
  0,
  0
);

const blurData =
  blurCtx.getImageData(
    0,
    0,
    width,
    height
  );

const blurPixels =
  blurData.data;


// ---------------------------------------------------------
// Sharpen strength
// ---------------------------------------------------------

const sharpenStrength =
  0.65;


for (
  let i = 0;
  i < sharp.length;
  i += 4
) {

  sharp[i] =
    Math.min(
      255,
      Math.max(
        0,
        sharp[i] +
          (
            sharp[i] -
            blurPixels[i]
          ) *
          sharpenStrength
      )
    );

  sharp[i + 1] =
    Math.min(
      255,
      Math.max(
        0,
        sharp[i + 1] +
          (
            sharp[i + 1] -
            blurPixels[i + 1]
          ) *
          sharpenStrength
      )
    );

  sharp[i + 2] =
    Math.min(
      255,
      Math.max(
        0,
        sharp[i + 2] +
          (
            sharp[i + 2] -
            blurPixels[i + 2]
          ) *
          sharpenStrength
      )
    );
}

ctx.putImageData(
  original,
  0,
  0
);

// =========================================================
// PROFESSIONAL NATURAL EDGE FADE
//
// One continuous feather across all four edges.
// No corner-radius masking.
// No rectangular border.
// No triangular corner effect.
// =========================================================

const fadeData =
  ctx.getImageData(
    0,
    0,
    width,
    height
  );

const fadePixels =
  fadeData.data;


// =========================================================
// FEATHER WIDTHS
// =========================================================

const leftFade =
  85;

const rightFade =
  115;

const topFade =
  45;

const bottomFade =
  50;


// =========================================================
// SMOOTHSTEP
// =========================================================

function smoothFade(value) {

  const p =
    Math.max(
      0,
      Math.min(
        1,
        value
      )
    );

  return (
    p * p *
    (3 - 2 * p)
  );
}


// =========================================================
// APPLY CONTINUOUS 2D FEATHER
// =========================================================

for (
  let y = 0;
  y < height;
  y++
) {

  for (
    let x = 0;
    x < width;
    x++
  ) {

    // -------------------------------------------------------
    // Distance from each edge
    // -------------------------------------------------------

    const leftAlpha =
      smoothFade(
        x / leftFade
      );

    const rightAlpha =
      smoothFade(
        (width - x) / rightFade
      );

    const topAlpha =
      smoothFade(
        y / topFade
      );

    const bottomAlpha =
      smoothFade(
        (height - y) / bottomFade
      );


    // -------------------------------------------------------
    // MULTIPLY the edge fades.
    //
    // This is the important change.
    //
    // At a corner, the two adjoining fades naturally combine
    // into one curved/soft transition instead of creating a
    // visible rectangular corner.
    // -------------------------------------------------------

    const alpha =
      leftAlpha *
      rightAlpha *
      topAlpha *
      bottomAlpha;


    const index =
      (y * width + x) * 4 + 3;

    fadePixels[index] =
      Math.round(
        255 * alpha
      );
  }
}

ctx.putImageData(
  fadeData,
  0,
  0
);

  return canvas.toDataURL(
    "image/png"
  );
}



const MIN_POLICY_SECTION_START_SPACE =
    PAGE.height * 0.28;

    const FOOTER_REQUIRED_HEIGHT = 28; // tune later (40–50 mm)

    const SECTION_GAP = 2.5;
    const FIRST_CONTENT_GAP = 2.5;

    const DAY_PANEL_INSET = 2.5;
    const DAY_PANEL_RADIUS = 2.5;

  function addSectionGap(
    cursorY,
    ensureSpace,
    gap = SECTION_GAP
) {

    cursorY =
        ensureSpace(
            cursorY,
            gap
        );

    return cursorY + gap;
}

function drawDayPanelBorder(
    pdf,
    panel,
    contentBottomY
) {

    const left = 15;
    const right = 195;

    const headerRadius = 1.5;

    pdf.setDrawColor(
        ...COLORS.dayPanelBorder
    );

    pdf.setLineWidth(
        0.25
    );

    /*
     * =====================================================
     * DAY FITS ON ONE PAGE
     * =====================================================
     */

    if (
        panel.pageBreaks.length === 0
    ) {

        pdf.setPage(
            panel.startPage
        );

        pdf.line(
            left,
            panel.startY + headerRadius,
            left,
            panel.endY
        );

        pdf.line(
            right,
            panel.startY + headerRadius,
            right,
            panel.endY
        );

        pdf.setLineWidth(
    0.25
);

pdf.line(
    left,
    panel.endY,
    right,
    panel.endY
);

pdf.setLineWidth(
    0.25
);

        return;
    }


   /*
 * =====================================================
 * FIRST PAGE
 * =====================================================
 *
 * End the first-page card segment exactly where the
 * content stopped before the page break.
 */

pdf.setPage(
    panel.startPage
);

pdf.setDrawColor(
    ...COLORS.dayPanelBorder
);

pdf.setLineWidth(
    0.25
);

const firstBreak =
    panel.pageBreaks[0];

const firstPageEndY =
    firstBreak?.endY ??
    panel.endY;

pdf.line(
    left,
    panel.startY + headerRadius,
    left,
    firstPageEndY
);

pdf.line(
    right,
    panel.startY + headerRadius,
    right,
    firstPageEndY
);

    /*
 * =====================================================
 * CONTINUATION PAGES
 * =====================================================
 */

panel.pageBreaks.forEach(
    (breakInfo, index) => {

        const continuationPage =
            breakInfo.page + 1;

        pdf.setPage(
            continuationPage
        );

        const continuationStart =
            breakInfo.nextPageY;

        const isLastContinuationPage =
            index ===
            panel.pageBreaks.length - 1;

        const nextBreak =
    panel.pageBreaks[index + 1];

const continuationEnd =
    isLastContinuationPage
        ? panel.endY
        : nextBreak?.endY;

        /*
         * LEFT
         */
        pdf.line(
            left,
            continuationStart,
            left,
            continuationEnd
        );

        /*
         * RIGHT
         */
        pdf.line(
            right,
            continuationStart,
            right,
            continuationEnd
        );

        /*
         * This is the page on which the Day
         * actually finishes.
         */
        
    }
);


   /*
 * =====================================================
 * FINAL DAY CLOSURE
 * =====================================================
 *
 * The Day's actual ending position is known here.
 * Draw the bottom border directly on the page where
 * the Day finishes.
 */

pdf.setPage(
    panel.endPage
);



pdf.setDrawColor(
    ...COLORS.dayPanelBorder
);



pdf.setDrawColor(
    ...COLORS.dayPanelBorder
);

pdf.setLineWidth(
    1
);

pdf.setLineWidth(
    0.25
);

pdf.line(
    left,
    panel.endY,
    right,
    panel.endY
);

pdf.setLineWidth(
    0.25
);

}

export async function generateQuotationPdf(quoteData) {

      // =========================================================
  // PDF THEME
  // Default = current stable PDF appearance
  // Custom = colors saved with this quotation
  // =========================================================

  const savedPdfTheme =
    quoteData?.pdfTheme || null;

  const isCustomPdfTheme =
    savedPdfTheme?.name === "Custom";

  const DEFAULT_SECTION_COLORS = {

    tourSummary: "#17334F",

    detailedTourItinerary: "#17334F",

    hotelUsed: "#5C3391",

    billing: "#6B2636",

    inclusions: "#2446B5",

    exclusions: "#46556B",

    policy: "#17334F"

  };

  const PDF_SECTION_COLORS = {

    ...DEFAULT_SECTION_COLORS,

    ...(isCustomPdfTheme
      ? {
          tourSummary:
            savedPdfTheme?.sections
              ?.tourSummary?.color ||
            DEFAULT_SECTION_COLORS.tourSummary,

          detailedTourItinerary:
  savedPdfTheme?.sections
    ?.detailedTourItinerary?.color ||
  DEFAULT_SECTION_COLORS
    .detailedTourItinerary,

          hotelUsed:
            savedPdfTheme?.sections
              ?.hotelUsed?.color ||
            DEFAULT_SECTION_COLORS.hotelUsed,

          billing:
            savedPdfTheme?.sections
              ?.billing?.color ||
            DEFAULT_SECTION_COLORS.billing,

          inclusions:
            savedPdfTheme?.sections
              ?.inclusions?.color ||
            DEFAULT_SECTION_COLORS.inclusions,

          exclusions:
            savedPdfTheme?.sections
              ?.exclusions?.color ||
            DEFAULT_SECTION_COLORS.exclusions,

          policy:
            savedPdfTheme?.sections
              ?.policy?.color ||
            DEFAULT_SECTION_COLORS.policy
        }
      : {})

  };

  
  
  const pdf = new jsPDF({
    
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

   const pageState = {
    currentPage: 1,
    activeDayPanel: null
};

  const logoImage = await loadImage(orbitzLogo);

  

  const webImage = await loadImage(webIcon);

const phoneImage = await loadImage(phoneIcon);

const locationImage = await loadImage(locationIcon);

  let cursorY = PAGE.marginTop;


  const addBrandedPage = () => {

    pdf.addPage();

    pageState.currentPage += 1;

    return PAGE.marginTop + 12;
};


let activeDayPanel = null;


 const CONTENT_BOTTOM_Y =
    PAGE.height - 24;

const ensureSpace = (
    currentCursorY,
    requiredHeight
) => {

    console.log(
        "ENSURE SPACE:",
        {
            page:
                pageState.currentPage,

            currentCursorY,

            requiredHeight,

            CONTENT_BOTTOM_Y,

            remaining:
                CONTENT_BOTTOM_Y -
                currentCursorY,

            willBreak:
                currentCursorY +
                requiredHeight >
                CONTENT_BOTTOM_Y
        }
    );

    if (
        currentCursorY + requiredHeight >
        CONTENT_BOTTOM_Y
    ) {
        

    const previousPage =
        pageState.currentPage;

    const newY =
        addBrandedPage();

    if (
        pageState.activeDayPanel
    ) {

        pageState.activeDayPanel.pageBreaks.push({
    page: previousPage,
    endY: currentCursorY,
    nextPageY: newY
});
    }

    return newY;
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
    ensureSpace,
    pageState,
    CONTENT_BOTTOM_Y,
    PDF_SECTION_COLORS
);

} else {

    cursorY = drawGeneralContentCompact(
        pdf,
        quoteData,
        cursorY,
        ensureSpace
    );

}

// ---------- CANCELLATION POLICY ----------

cursorY += 8;

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
        ),
    hexToRgb(
        quoteData?.pdfTheme?.sections?.policy?.color ||
        "#1E3A8A"
    )
);

console.log(
    "AFTER POLICY:",
    "page:",
    pageState.currentPage,
    "cursorY:",
    cursorY
);


function drawInternalPageHeader(
    pdf,
    logoImage
) {

    // =====================================================
    // INTERNAL PAGE LOGO
    //
    // Preserve the exact natural aspect ratio of the
    // Orbitz logo. Do NOT force a fixed height.
    // =====================================================

    const logoWidth =
        28;

    const sourceWidth =
        logoImage.naturalWidth ||
        logoImage.width;

    const sourceHeight =
        logoImage.naturalHeight ||
        logoImage.height;

    const logoHeight =
        logoWidth *
        (
            sourceHeight /
            sourceWidth
        );

    pdf.addImage(
        logoImage,
        "PNG",
        PAGE.marginLeft,
        4,
        logoWidth,
        logoHeight
    );


    // Divider
    pdf.setDrawColor(190, 200, 215);
    pdf.setLineWidth(0.10);

    pdf.line(
        PAGE.marginLeft,
        17,
        PAGE.width - PAGE.marginRight,
        17
    );

}

// =====================================
// PAGE NUMBERING
// =====================================

const totalPages = pdf.getNumberOfPages();

for (let page = 1; page <= totalPages; page++) {

    pdf.setPage(page);

    

    // Skip the cover page
if (page > 1) {

    drawInternalPageHeader(
        pdf,
        logoImage
    );

}

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);
    pdf.text(
        `Page ${page} of ${totalPages}`,
        PAGE.width - PAGE.marginRight,
        PAGE.height - 8,
        {
            align: "right"
        }
    );

}

if (quoteData.mode === "preview") {

    return pdf.output("blob");

}

pdf.save("Quotation.pdf");

}

import { COMPANY } from "./headerData";




function createTransparentLogo(
  logoImage
) {

  const canvas =
    document.createElement("canvas");

  const width =
    logoImage.naturalWidth ||
    logoImage.width;

  const height =
    logoImage.naturalHeight ||
    logoImage.height;

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d");

  ctx.drawImage(
    logoImage,
    0,
    0
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      width,
      height
    );

  const pixels =
    imageData.data;

  // Remove only near-white pixels.
  // Actual Orbitz colours remain untouched.
  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (
      r > 242 &&
      g > 242 &&
      b > 242
    ) {
      pixels[i + 3] = 0;
    }
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  return canvas.toDataURL(
    "image/png"
  );
}






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

  
// =========================================================
// ORBITZ TRAVEL PHOTO HEADER
// =========================================================

const headerImage =
  await loadImage(
    kenyaHeaderImage
  );


// =========================================================
// LOCKED HEADER GEOMETRY
// =========================================================

const headerWidth =
  PAGE.width -
  PAGE.marginLeft -
  PAGE.marginRight;

const headerHeight =
  56;


// =========================================================
// CREATE PHOTO HEADER
// =========================================================

const photoHeader =
  createFinalPhotoHeader(
    headerImage,
    headerWidth,
    headerHeight
  );


// =========================================================
// PLACE PHOTO
// =========================================================

pdf.addImage(
  photoHeader,
  "PNG",
  PAGE.marginLeft,
  top,
  headerWidth,
  headerHeight
);

// =========================================================
// EXISTING TRANSPARENT LOGO CODE
// =========================================================

const transparentLogo =
  createTransparentLogo(
    logoImage
  );


// =========================================================
// VERY SUBTLE BRANDING GLOW
//
// Soft radial light behind the logo + slogan.
// No rectangle, no border, no visible panel.
// =========================================================

const haloCanvas =
  document.createElement("canvas");

haloCanvas.width = 700;
haloCanvas.height = 230;

const haloCtx =
  haloCanvas.getContext("2d");

const haloGradient =
  haloCtx.createRadialGradient(
    300,
    105,
    20,
    300,
    105,
    330
  );

haloGradient.addColorStop(
  0,
  "rgba(255,255,255,0.06)"
);

haloGradient.addColorStop(
  0.35,
  "rgba(255,255,255,0.04)"
);

haloGradient.addColorStop(
  0.65,
  "rgba(255,255,255,0.015)"
);

haloGradient.addColorStop(
  1,
  "rgba(255,255,255,0)"
);

haloCtx.fillStyle =
  haloGradient;

haloCtx.fillRect(
  0,
  0,
  haloCanvas.width,
  haloCanvas.height
);

const brandingGlow =
  haloCanvas.toDataURL(
    "image/png"
  );

pdf.addImage(
  brandingGlow,
  "PNG",
  7,
  top + 1,
  92,
  30
);

// =========================================================
// LOGO
// =========================================================
  

const logoWidth =
  66;

const logoSourceWidth =
  logoImage.naturalWidth ||
  logoImage.width;

const logoSourceHeight =
  logoImage.naturalHeight ||
  logoImage.height;

const logoHeight =
  logoWidth *
  (
    logoSourceHeight /
    logoSourceWidth
  );

pdf.addImage(
  transparentLogo,
  "PNG",
  12,
  top + 2,
  logoWidth,
  logoHeight
);


// =========================================================
// SLOGAN
//
// Move slightly right and down so it clears HOLIDAYS.
// =========================================================

pdf.setFont(
  "times",
  "italic"
);

pdf.setFontSize(
  9.5
);

pdf.setTextColor(
  0,
  0,
  0
);

pdf.text(
  COMPANY.slogan,
  18,
  top + 27
);


// =========================================================
// SERVICES
//
// Keep low inside the grass area.
// =========================================================

pdf.setFont(
  "helvetica",
  "bold"
);

pdf.setFontSize(
  8.5
);

pdf.text(
  COMPANY.services,
  14,
  top + 52
);


// =========================================================
// RIGHT INFORMATION BLOCK
// =========================================================

const rightX =
  142;

pdf.setFont(
  "helvetica",
  "normal"
);

pdf.setFontSize(
  8.5
);

pdf.setTextColor(
  0,
  0,
  0
);


// ---------------------------------------------------------
// WEBSITE
// ---------------------------------------------------------

pdf.addImage(
  webImage,
  "PNG",
  rightX,
  top + 31,
  4,
  4
);

pdf.text(
  COMPANY.website,
  rightX + 7,
  top + 34
);


// ---------------------------------------------------------
// PHONE
// ---------------------------------------------------------

pdf.addImage(
  phoneImage,
  "PNG",
  rightX,
  top + 39,
  4,
  4
);

pdf.text(
  COMPANY.phones,
  rightX + 7,
  top + 42
);


// ---------------------------------------------------------
// ADDRESS
// ---------------------------------------------------------

pdf.addImage(
  locationImage,
  "PNG",
  rightX,
  top + 47,
  4,
  4
);

pdf.text(
  COMPANY.address,
  rightX + 7,
  top + 50,
  {
    maxWidth: 50
  }
);


  // =========================================================
// HEADER DIVIDER
// =========================================================

const dividerY =
  top + headerHeight;

pdf.setDrawColor(
  37,
  99,
  235
);

pdf.setLineWidth(0.5);

pdf.line(
  PAGE.marginLeft,
  dividerY,
  PAGE.width - PAGE.marginRight,
  dividerY
);

return dividerY + 8;
}




function drawTourSummary(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  sectionColor
) {

  // Make sure there is room for the summary block
  ensureSpace(45);


  // ---------- TOUR SUMMARY ----------

  cursorY = drawSectionHeading(
  pdf,
  "TOUR SUMMARY",
  cursorY,
  sectionColor
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

    "Invoice No",
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

function drawItineraryInclusionExclusion(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  inclusionColor,
  exclusionColor
) {

      // =========================================================
  // THEME COLORS
  // =========================================================

  const inclusionBase =
    Array.isArray(inclusionColor)
      ? inclusionColor
      : [30, 64, 175];

  const exclusionBase =
    Array.isArray(exclusionColor)
      ? exclusionColor
      : [71, 85, 105];

  const mixWithWhite = (
    color,
    amount
  ) => [
    Math.round(
      color[0] +
      (255 - color[0]) * amount
    ),
    Math.round(
      color[1] +
      (255 - color[1]) * amount
    ),
    Math.round(
      color[2] +
      (255 - color[2]) * amount
    )
  ];

  const inclusionBorder =
    mixWithWhite(
      inclusionBase,
      0.45
    );

  const exclusionBorder =
    mixWithWhite(
      exclusionBase,
      0.45
    );

  // =========================================================
  // ITINERARY MODE ONLY
  // INCLUSION + EXCLUSION TWO-COLUMN BLOCK
  // =========================================================

  const inclusions = [
    ...(quoteData.inclusions || []),
    ...(quoteData.customInclusions || [])
  ].filter(Boolean);

  const exclusions = [
    ...(quoteData.exclusions || []),
    ...(quoteData.customExclusions || [])
  ].filter(Boolean);

  const inclusionMode =
    quoteData.inclusionMode || "chips";

  const exclusionMode =
    quoteData.exclusionMode || "chips";

  const customInclusionRichText =
    quoteData.customInclusionRichText ||
    "";

const customExclusionRichText =
    quoteData.customExclusionRichText ||
    "";

const customInclusionText =
    quoteData.inclusionText ||
    quoteData.customInclusionText ||
    "";

const customExclusionText =
    quoteData.exclusionText ||
    quoteData.customExclusionText ||
    "";

  // ---------------------------------------------------------
  // CHECK WHETHER EACH SIDE HAS CONTENT
  // ---------------------------------------------------------

  const hasInclusion =
    inclusionMode === "text"
      ? !!(
          customInclusionRichText.trim() ||
          customInclusionText.trim()
        )
      : inclusions.length > 0;

const hasExclusion =
    exclusionMode === "text"
      ? !!(
          customExclusionRichText.trim() ||
          customExclusionText.trim()
        )
      : exclusions.length > 0;

  if (!hasInclusion && !hasExclusion) {
    return cursorY;
  }

  // ---------------------------------------------------------
  // LAYOUT
  // ---------------------------------------------------------

  const pageWidth =
    PAGE.width -
    PAGE.marginLeft -
    PAGE.marginRight;

  const columnGap = 8;

  const columnWidth =
    (pageWidth - columnGap) / 2;

  const leftX = 15;

  const rightX =
    leftX +
    columnWidth +
    columnGap;

const dividerX =
    leftX +
    columnWidth +
    columnGap / 2;

  const ribbonHeight =
    RIBBON.height;

    console.log(
    "INCLUSION/EXCLUSION RIBBON HEIGHT:",
    ribbonHeight
);

  const contentTopGap = 5;

  const lineHeight =
    SPACING.lineGap;

  const textWidth =
    columnWidth - 3;

    // ---------------------------------------------------------
// INCLUSION / EXCLUSION CARD
// ---------------------------------------------------------

const cardRadius = 2;

const cardFill = [
    248,
    250,
    252
];

const cardBorder = [
    220,
    225,
    232
];

  // ---------------------------------------------------------
  // BUILD SOURCE LINES
  // ---------------------------------------------------------

  const buildChipLines = (items) => {
    return items.map(
      (item) =>
        "• " +
        sanitizePdfText(
          String(item)
        )
    );
  };

  const buildCustomTextLines = (
    richText,
    plainText,
    availableWidth
) => {

    /*
     * Rich-text Custom Text
     */
    if (
        richText?.trim()
    ) {

        return buildWrappedRichDescriptionLines(
            pdf,
            richText,
            0,
            availableWidth
        ).lines;
    }

    /*
     * Existing plain-text fallback
     */
    const lines =
        String(plainText || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .map((line) =>
                sanitizePdfText(line)
            );

    while (
        lines.length > 0 &&
        lines[lines.length - 1].trim() === ""
    ) {
        lines.pop();
    }

    return lines;
};

  const inclusionSourceLines =
    inclusionMode === "text"
      ? buildCustomTextLines(
          customInclusionRichText,
          customInclusionText,
          textWidth
        )
      : buildChipLines(
          inclusions
        );

const exclusionSourceLines =
    exclusionMode === "text"
      ? buildCustomTextLines(
          customExclusionRichText,
          customExclusionText,
          textWidth
        )
      : buildChipLines(
          exclusions
        );

  // ---------------------------------------------------------
  // PREPARE ROWS
  // ---------------------------------------------------------

  const prepareRows = (
    sourceLines
) => {

    return sourceLines.map(
        (sourceLine) => {

            /*
             * -------------------------------------------------
             * RICH-TEXT LINE
             *
             * buildWrappedRichDescriptionLines()
             * already performed wrapping, so do not wrap
             * these lines again with splitTextToSize().
             * -------------------------------------------------
             */
            if (
                Array.isArray(sourceLine)
            ) {

                return {
                    lines: [
                        sourceLine
                    ],
                    height: lineHeight
                };
            }


            /*
             * -------------------------------------------------
             * PLAIN-TEXT LINE
             * -------------------------------------------------
             */

            if (
                String(sourceLine).trim() === ""
            ) {

                return {
                    lines: [""],
                    height: lineHeight
                };
            }

            const wrapped =
                pdf.splitTextToSize(
                    sourceLine,
                    textWidth
                );

            return {
                lines: wrapped,
                height:
                    wrapped.length *
                    lineHeight
            };
        }
    );
};

const getRowHeight = (
    leftRow,
    rightRow
) => {

    return Math.max(
        leftRow?.height || 0,
        rightRow?.height || 0
    );
};

  const leftRows =
    prepareRows(
      inclusionSourceLines
    );

  const rightRows =
    prepareRows(
      exclusionSourceLines
    );

  const totalRows =
    Math.max(
      leftRows.length,
      rightRows.length
    );

    

  // ---------------------------------------------------------
  // DRAW RIBBONS
  // ---------------------------------------------------------

  // ---------------------------------------------------------
// DRAW RIBBONS
// Same ribbon silhouette as Billing / Section headings
// ---------------------------------------------------------

const drawRibbons = (y) => {

    const ribbonRadius = 1.5;

    // ---------------------------------------------------------
    // CONTINUOUS HEADER RIBBON
    // ---------------------------------------------------------

    const totalRibbonWidth =
        columnWidth * 2 +
        columnGap;

    const halfRibbonWidth =
        totalRibbonWidth / 2;

    const splitX =
        leftX +
        halfRibbonWidth;


    // ---------------------------------------------------------
    // BASE — BLUE
    // Rounded TOP corners
    // ---------------------------------------------------------

    pdf.setFillColor(
    ...inclusionBase
);

    pdf.setDrawColor(
    ...inclusionBorder
);

    pdf.setLineWidth(
        0.35
    );

    pdf.roundedRect(
        leftX,
        y,
        totalRibbonWidth,
        ribbonHeight,
        ribbonRadius,
        ribbonRadius,
        "F"
    );


    // ---------------------------------------------------------
    // RIGHT HALF — SLATE
    // Preserve existing two-color design
    // ---------------------------------------------------------

    pdf.setFillColor(
    ...exclusionBase
);

    pdf.roundedRect(
        splitX,
        y,
        halfRibbonWidth,
        ribbonHeight,
        ribbonRadius,
        ribbonRadius,
        "F"
    );


    // ---------------------------------------------------------
    // REMOVE INNER LEFT ROUNDING OF RIGHT HALF
    // ---------------------------------------------------------

    pdf.rect(
        splitX,
        y,
        ribbonRadius + 0.2,
        ribbonHeight,
        "F"
    );


    // ---------------------------------------------------------
    // SQUARE OFF BOTH BOTTOM CORNERS
    //
    // This is the important part.
    // It makes the bottom edge behave like the
    // Billing / Section heading ribbons.
    // ---------------------------------------------------------

    // Left half
   pdf.setFillColor(
    ...inclusionBase
);

    pdf.rect(
        leftX,
        y + ribbonHeight - ribbonRadius,
        halfRibbonWidth,
        ribbonRadius,
        "F"
    );

    // Right half
    pdf.setFillColor(
    ...exclusionBase
);

    pdf.rect(
        splitX,
        y + ribbonHeight - ribbonRadius,
        halfRibbonWidth,
        ribbonRadius,
        "F"
    );

// ---------------------------------------------------------
// THEMED RIBBON BORDERS
// ---------------------------------------------------------

pdf.setLineWidth(0.35);

// LEFT — INCLUSIONS
pdf.setDrawColor(
    ...inclusionBorder
);

// Top-left
pdf.line(
    leftX + ribbonRadius,
    y,
    splitX,
    y
);

// Left edge
pdf.line(
    leftX,
    y + ribbonRadius,
    leftX,
    y + ribbonHeight
);

// Bottom-left
pdf.line(
    leftX,
    y + ribbonHeight,
    splitX,
    y + ribbonHeight
);


// RIGHT — EXCLUSIONS
pdf.setDrawColor(
    ...exclusionBorder
);

// Top-right
pdf.line(
    splitX,
    y,
    leftX + totalRibbonWidth - ribbonRadius,
    y
);

// Right edge
pdf.line(
    leftX + totalRibbonWidth,
    y + ribbonRadius,
    leftX + totalRibbonWidth,
    y + ribbonHeight
);

// Bottom-right
pdf.line(
    splitX,
    y + ribbonHeight,
    leftX + totalRibbonWidth,
    y + ribbonHeight
);

    // ---------------------------------------------------------
    // CENTER DIVIDER
    // ---------------------------------------------------------

    pdf.setDrawColor(
        255,
        255,
        255
    );

    pdf.setLineWidth(
        0.5
    );

    const ribbonDividerTop =
        y + 1;

    const ribbonDividerBottom =
        y +
        ribbonHeight -
        1;

    pdf.line(
        splitX,
        ribbonDividerTop,
        splitX,
        ribbonDividerBottom
    );


    
    // ---------------------------------------------------------
    // RIBBON TEXT
    // ---------------------------------------------------------

    pdf.setTextColor(
        255,
        255,
        255
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(
        9.5
    );

    const ribbonTextY =
        y + 4.8;

    pdf.text(
        "INCLUSIONS",
        leftX +
            halfRibbonWidth / 2,
        ribbonTextY,
        {
            align: "center"
        }
    );

    pdf.text(
        "EXCLUSIONS",
        splitX +
            halfRibbonWidth / 2,
        ribbonTextY,
        {
            align: "center"
        }
    );
};

  // ---------------------------------------------------------
  // DRAW DIVIDER FOR ONE PAGE SEGMENT
  //
  // IMPORTANT:
  // Each page gets its own divider segment.
  // ---------------------------------------------------------

  const drawDivider = (
    startY,
    endY
) => {

    if (endY <= startY) {
        return;
    }

    pdf.setDrawColor(
        210,
        214,
        220
    );

    pdf.setLineWidth(0.35);

    pdf.line(
        dividerX,
        startY,
        dividerX,
        endY
    );
};

  // ---------------------------------------------------------
  // FIRST PAGE
  // Ribbon + first row must fit together.
  // ---------------------------------------------------------

 const firstRowHeight =
    totalRows > 0
        ? getRowHeight(
            leftRows[0],
            rightRows[0]
        )
        : lineHeight;

  cursorY =
    ensureSpace(
      cursorY,
      ribbonHeight +
        contentTopGap +
        firstRowHeight +
        4
    );

  // ---------------------------------------------------------
  // FIRST PAGE SEGMENT
  // ---------------------------------------------------------

  let ribbonY =
    cursorY;

let currentY =
    ribbonY +
    ribbonHeight +
    contentTopGap;

  /// Divider begins immediately below the ribbon.
// The ribbon itself remains visually uninterrupted.
let segmentStartY =
    ribbonY +
    ribbonHeight +
    contentTopGap;


   // ---------------------------------------------------------
// PREDICT CARD SEGMENT END
// ---------------------------------------------------------

const predictSegmentEndY = (
    startY,
    startRowIndex
) => {

    let predictedY =
        startY;

    const pageBottom =
        PAGE.height -
        PAGE.marginBottom;

    for (
        let rowIndex = startRowIndex;
        rowIndex < totalRows;
        rowIndex++
    ) {

        const rowHeight =
            getRowHeight(
                leftRows[rowIndex],
                rightRows[rowIndex]
            );

        if (
            predictedY +
            rowHeight >
            pageBottom
        ) {
            break;
        }

        predictedY +=
            rowHeight;
    }

    return predictedY;
};



    // ---------------------------------------------------------
// CARD SEGMENT TRACKING
// ---------------------------------------------------------

let cardSegmentStartY =
    ribbonY;

    let cardSegmentStartRow = 0;

    const predictedSegmentEndY =
    predictSegmentEndY(
        segmentStartY,
        cardSegmentStartRow
    );


    // ---------------------------------------------------------
// FIRST INCLUSION / EXCLUSION CARD
// ---------------------------------------------------------

const cardBottom =
    predictedSegmentEndY + 4;

pdf.setFillColor(
    ...cardFill
);

// ---------------------------------------------------------
// CARD BODY — NEUTRAL FILL + ROUNDED OUTER SHAPE
// ---------------------------------------------------------

const cardHeight =
    cardBottom -
    cardSegmentStartY;

// Fill the complete rounded card first.
// This restores the rounded bottom corners.

pdf.setFillColor(
    ...cardFill
);

pdf.setDrawColor(
    ...cardBorder
);

pdf.setLineWidth(
    0.35
);

pdf.roundedRect(
    leftX,
    cardSegmentStartY,
    pageWidth,
    cardHeight,
    cardRadius,
    cardRadius,
    "FD"
);

// ---------------------------------------------------------
// CARD BORDER — SPLIT THEME WITH ROUNDED CORNERS
// ---------------------------------------------------------

pdf.setLineWidth(0.35);


// =========================================================
// LEFT SIDE — INCLUSIONS
// =========================================================

pdf.setDrawColor(
    ...inclusionBorder
);

// Left vertical
pdf.line(
    leftX,
    cardSegmentStartY + cardRadius,
    leftX,
    cardBottom - cardRadius
);

// Bottom-left horizontal
pdf.line(
    leftX + cardRadius,
    cardBottom,
    dividerX,
    cardBottom
);


// =========================================================
// RIGHT SIDE — EXCLUSIONS
// =========================================================

pdf.setDrawColor(
    ...exclusionBorder
);

// Right vertical
pdf.line(
    leftX + pageWidth,
    cardSegmentStartY + cardRadius,
    leftX + pageWidth,
    cardBottom - cardRadius
);

// Bottom-right horizontal
pdf.line(
    dividerX,
    cardBottom,
    leftX + pageWidth - cardRadius,
    cardBottom
);

// ---------------------------------------------------------
// RIBBON — MUST BE DRAWN LAST
// ---------------------------------------------------------

drawRibbons(
    ribbonY
);


    // ---------------------------------------------------------
  // RENDER COLUMNS INDEPENDENTLY
  //
  // IMPORTANT:
  // Left and right columns no longer share row height.
  //
  // A wrapped Inclusion item must NOT push the next
  // Exclusion item downward.
  //
  // Both columns still share the same page break so the
  // two-column visual structure remains intact.
  // ---------------------------------------------------------

  let leftCursorY =
    currentY;

  let rightCursorY =
    currentY;

  for (
    let rowIndex = 0;
    rowIndex < totalRows;
    rowIndex++
  ) {

    const leftRow =
      leftRows[rowIndex];

    const rightRow =
      rightRows[rowIndex];

    const leftHeight =
      leftRow?.height || 0;

    const rightHeight =
      rightRow?.height || 0;

    const rowHeight =
    getRowHeight(
        leftRow,
        rightRow
    );

    // -------------------------------------------------------
    // CHECK WHETHER THE NEXT ROW CAN FIT
    //
    // Use the lower of the two active cursors.
    // The taller column determines whether a new page
    // is required.
    // -------------------------------------------------------

    const pageBottom =
      PAGE.height -
      PAGE.marginBottom;

    const nextRowBottom =
      Math.max(
        leftCursorY,
        rightCursorY
      ) +
      rowHeight;

    const rowWouldOverflow =
      nextRowBottom >
      pageBottom;

    // -------------------------------------------------------
    // PAGE BREAK
    // -------------------------------------------------------

    if (rowWouldOverflow) {

      

      // -------------------------------------------------------
// FINISH CARD SEGMENT ON OLD PAGE
// -------------------------------------------------------

const cardSegmentEndY =
    Math.max(
        leftCursorY,
        rightCursorY
    );

// Finish the divider while still on the OLD page.

      drawDivider(
        segmentStartY,
        Math.max(
          leftCursorY,
          rightCursorY
        )
      );

      // Create the continuation page.
      const checkedY =
        ensureSpace(
          Math.max(
            leftCursorY,
            rightCursorY
          ),
          rowHeight
        );

      // New page ribbon.
     ribbonY =
    checkedY;

currentY =
    ribbonY +
    ribbonHeight +
    contentTopGap;

      leftCursorY =
        currentY;

      rightCursorY =
        currentY;

      // New divider segment begins below the ribbon.
      segmentStartY =
        currentY;

        cardSegmentStartY =
    ribbonY;

    cardSegmentStartRow =
    rowIndex;

    const continuationSegmentEndY =
    predictSegmentEndY(
        segmentStartY,
        cardSegmentStartRow
    );

    // ---------------------------------------------------------
// CONTINUATION CARD BACKGROUND
// ---------------------------------------------------------

const continuationCardBottom =
    continuationSegmentEndY + 4;

pdf.setFillColor(
    ...cardFill
);

pdf.setDrawColor(
    ...cardBorder
);

pdf.setLineWidth(
    0.35
);

pdf.roundedRect(
    leftX,
    cardSegmentStartY,
    pageWidth,
    continuationCardBottom -
        cardSegmentStartY,
    cardRadius,
    cardRadius,
    "FD"
);

drawRibbons(
    ribbonY
);

    

      }

    // -------------------------------------------------------
    // LEFT COLUMN
    // -------------------------------------------------------

    if (leftRow) {

      let y =
        leftCursorY;

      leftRow.lines.forEach(
    (line) => {

        if (
            line === ""
        ) {

            y +=
                lineHeight;

            return;
        }

        /*
         * Rich-text line
         */
        if (
            Array.isArray(line)
        ) {

            drawRichDescriptionPreviewLine(
                pdf,
                line,
                leftX + 3,
                y
            );

        } else {

            /*
             * Existing plain-text line
             */
            pdf.setTextColor(
                0,
                0,
                0
            );

            pdf.setFont(
                "times",
                "normal"
            );

            pdf.setFontSize(
                10
            );

            pdf.text(
                line,
                leftX + 3,
                y
            );
        }

        y +=
            lineHeight;
    }
);

      leftCursorY =
        y;
    }

    // -------------------------------------------------------
    // RIGHT COLUMN
    // -------------------------------------------------------

    if (rightRow) {

      let y =
        rightCursorY;

      rightRow.lines.forEach(
    (line) => {

        if (
            line === ""
        ) {

            y +=
                lineHeight;

            return;
        }

        /*
         * Rich-text line
         */
        if (
            Array.isArray(line)
        ) {

            drawRichDescriptionPreviewLine(
                pdf,
                line,
                rightX + 3,
                y
            );

        } else {

            /*
             * Existing plain-text line
             */
            pdf.setTextColor(
                0,
                0,
                0
            );

            pdf.setFont(
                "times",
                "normal"
            );

            pdf.setFontSize(
                10
            );

            pdf.text(
                line,
                rightX + 3,
                y
            );
        }

        y +=
            lineHeight;
    }
);

      rightCursorY =
        y;
    }

    // Current Y is always the bottom of the taller column.
    currentY =
      Math.max(
        leftCursorY,
        rightCursorY
      );
  }

  // ---------------------------------------------------------
  // FINISH FINAL PAGE DIVIDER
  // ---------------------------------------------------------

  const finalCardSegmentEndY =
    currentY;

    


drawDivider(
    segmentStartY,
    finalCardSegmentEndY
);


  pdf.setTextColor(
    0,
    0,
    0
  );

  return currentY + 5;
}


function drawDayWiseHeader(
  pdf,
  cursorY,
  ensureSpace,
  sectionColor
) {

  ensureSpace(18);

  console.log(
  "DETAILED ITINERARY RGB:",
  sectionColor
);

 cursorY = drawSectionHeading(
  pdf,
  "DETAILED TOUR ITINERARY",
  cursorY,
  sectionColor
);

  return cursorY;
}



 function drawDayHeader(
    pdf,
    day,
    dayDate,
    cursorY,
    ensureSpace,
    dayColor
) {

    // =========================================================
// DAY HEADER THEME
// =========================================================

const baseDayColor =
    Array.isArray(dayColor)
        ? dayColor
        : [47, 143, 145];

const darkenColor = (
    color,
    amount
) => [

    Math.round(
        color[0] * (1 - amount)
    ),

    Math.round(
        color[1] * (1 - amount)
    ),

    Math.round(
        color[2] * (1 - amount)
    )

];

const dayAccentColor =
    darkenColor(
        baseDayColor,
        0.18
    );


    const left = 15;

    /*
     * =====================================================
     * CONTINUOUS DAY HEADER RIBBON
     * =====================================================
     *
     * Total width:
     *
     * DAY      24 mm
     * DATE     28 mm
     * TITLE   128 mm
     *
     * Total = 180 mm
     *
     * 15 → 195
     */

    const headerWidth = 180;

    const headerHeight =
    RIBBON.height;

    console.log(
    "DAY HEADER RIBBON HEIGHT:",
    headerHeight
);
    const headerRadius = 1.5;

    /*
     * -----------------------------------------------------
     * OUTER RIBBON
     * -----------------------------------------------------
     */

   pdf.setFillColor(
    ...baseDayColor
);

pdf.setDrawColor(
    ...COLORS.dayRibbonBorder
);

    pdf.setLineWidth(
        0.35
    );

    pdf.roundedRect(
        left,
        cursorY,
        headerWidth,
        headerHeight,
        headerRadius,
        headerRadius,
        "DF"
    );


    /*
     * =====================================================
     * SUBTLE VERTICAL DIVIDERS
     * =====================================================
     *
     * Dividers deliberately do NOT touch the outer
     * top/bottom borders.
     */

    pdf.setDrawColor(
    ...COLORS.dayDivider
);

    pdf.setLineWidth(
        0.35
    );

    const dividerTop =
    cursorY + 1.25;

const dividerBottom =
    cursorY +
    headerHeight -
    1.25;


    /*
     * DAY | DATE
     *
     * DAY area = 24 mm
     */

    pdf.line(
        left + 24,
        dividerTop,
        left + 24,
        dividerBottom
    );


    /*
     * DATE | TITLE
     *
     * DATE begins at 24
     * DATE width = 28
     */

    pdf.line(
        left + 52,
        dividerTop,
        left + 52,
        dividerBottom
    );


    /*
     * =====================================================
     * DAY TEXT
     * =====================================================
     */

    pdf.setFont(
        "helvetica",
        "bold"
    );

   pdf.setFontSize(
    9.5
);

    pdf.setTextColor(
        0,
        0,
        0
    );

    pdf.text(
        `DAY ${day.day}`,
        left + 3,
        cursorY + 4.8
    );


    /*
     * =====================================================
     * DATE TEXT
     * =====================================================
     */

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.text(
        dayDate || "",
        left + 27,
        cursorY + 4.8
    );


    /*
     * =====================================================
     * TITLE TEXT
     * =====================================================
     */

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.text(
        day.title || "",
        left + 55,
       cursorY + 4.8
    );


    return cursorY + 11;
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
  ensureSpace,
  sectionColor
) {

    console.log(
  "BILLING SECTION COLOR:",
  sectionColor
);

  ensureSpace(70);

  cursorY = drawSectionHeading(
  pdf,
  " BILLING DETAILS",
  cursorY,
  sectionColor
);

  pdf.setFont("times","normal");
  pdf.setFontSize(10);
  pdf.setTextColor(0,0,0);

 const rs = currencySymbol;


  // -----------------------------
// VEHICLE COSTING
// -----------------------------

const validVehicleCosts =
  (quoteData.vehicleCosts || [])
    .filter(
      vehicle =>
        vehicle &&
        vehicle.vehicle &&
        String(vehicle.vehicle).trim() !== ""
    );

if (
  quoteData.useVehicleCosting &&
  validVehicleCosts.length > 0
) {

  validVehicleCosts.forEach(vehicle => {

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

const validVehicleCosts =
    (quoteData.vehicleCosts || [])
        .filter(
            vehicle =>
                vehicle &&
                vehicle.vehicle &&
                String(vehicle.vehicle).trim() !== ""
        );

if (
    quoteData.useVehicleCosting &&
    validVehicleCosts.length > 0
) {

    console.log(
        "vehicleCosts =",
        validVehicleCosts
    );

    validVehicleCosts.forEach(() => {

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
  ensureSpace,
  sectionColor
) {

    const billingColors =
  getBillingColorFamily(
    sectionColor || [107, 38, 54]
  );

  // Save starting position
  const startY = cursorY;

  // Measure only

  const measuredY =
  drawCostSummaryCompactInternal(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    true,
    billingColors
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
    cardHeight,
    sectionColor
);

  // Draw for real
const finalY =
  drawCostSummaryCompactInternal(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    false,
    billingColors
  );

// ==========================
// BILLING CHAMPAGNE ACCENT
// Draw LAST so billing rows
// cannot cover it.
// ==========================

// ==========================
// BILLING CHAMPAGNE ACCENT
// Straight left-edge accent
// ==========================

pdf.setFillColor(198, 161, 91);

const accentX = PAGE.marginLeft;

const accentY =
    cursorY + RIBBON.height + 1.5;

const accentWidth = 1.2;

const accentHeight =
    cardHeight - RIBBON.height - 4.5;

pdf.rect(
    accentX,
    accentY,
    accentWidth,
    accentHeight,
    "F"
);

// Move cursor to the actual bottom of the billing card.

return finalY + (
    CARD_PADDING * 2
);

}

function drawCostSummaryCompactInternal(
  pdf,
  quoteData,
  cursorY,
  ensureSpace,
  measureOnly = false,
  billingColors
) {

 

  // Header already drawn by drawBillingCard()
cursorY += SPACING.ribbonGap + 3;

pdf.setFont("times", "normal");
pdf.setFontSize(10);
pdf.setTextColor(0, 0, 0);

/*
 * ---------------------------------------------------------
 * QUOTATION CURRENCY
 * ---------------------------------------------------------
 */

const currency =
    getCurrency(
        quoteData.currency ||
        DEFAULT_CURRENCY
    );

const currencySymbol =
    currency?.symbol ||
    "₹";

// -----------------------------
// VEHICLE COSTING
// -----------------------------

const validVehicleCosts =
  (quoteData.vehicleCosts || [])
    .filter(
      vehicle =>
        vehicle &&
        vehicle.vehicle &&
        String(vehicle.vehicle).trim() !== ""
    );

if (
  quoteData.useVehicleCosting &&
  validVehicleCosts.length > 0
) {

  validVehicleCosts.forEach(vehicle => {

      const total =
  Number(vehicle.cost || 0);


      if (measureOnly) {

    cursorY += 7;

} else {

      cursorY = drawGreyCostRowCompact(
        pdf,
        `Package Cost With (${vehicle.vehicle})`,
       `${currencySymbol} ${total.toLocaleString()}`,
        cursorY
      );
      }

      


if (measureOnly) {

    cursorY += 7;

} else {
     const packageCostDescription =
  String(
    vehicle.description || ""
  ).trim();

const payableLabel =
  packageCostDescription
    ? `TOTAL AMOUNT PAYABLE (${packageCostDescription})`
    : "TOTAL AMOUNT PAYABLE";

cursorY = drawBlueCostRowCompact(
  pdf,
  payableLabel,
  `${currencySymbol} ${total.toLocaleString()}`,
  cursorY
);
}
           cursorY += 3;


      // ---------------------------------------------------
      // SUBTLE SEPARATOR BETWEEN VEHICLE OPTIONS
      // ---------------------------------------------------

      if (
        vehicle !==
        validVehicleCosts[
          validVehicleCosts.length - 1
        ]
      ) {

        if (!measureOnly) {

          pdf.setDrawColor(
            210,
            210,
            210
          );

          pdf.setLineWidth(0.2);

          pdf.line(
            PAGE.marginLeft + 4,
            cursorY - 1,
            PAGE.width -
              PAGE.marginRight -
              4,
            cursorY - 1
          );

        }

        cursorY += 2;

      }


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

const packageCostDescription =
    String(
        quoteData.packageCostDescription ||
        ""
    ).trim();

const packageCostLabel =
    packageCostDescription
        ? `Package Cost (${packageCostDescription})`
        : "Package Cost";

if (measureOnly) {

  pdf.setFont("NotoSans", "normal");
  pdf.setFontSize(10);

  const LABEL_X =
    PAGE.marginLeft + RIBBON.leftPadding;

  const colonX =
    PAGE.marginLeft + 94;

  const LABEL_MAX_WIDTH =
    colonX - LABEL_X - 4;

  const packageCostLabelWidth =
    pdf.getTextWidth(packageCostLabel);

  if (packageCostLabelWidth <= LABEL_MAX_WIDTH) {

    cursorY += 7;

  } else {

    cursorY += 13;

  }

} else {

  cursorY = drawGreyCostRowCompact(
  pdf,
  packageCostLabel,
  `${currencySymbol} ${subtotal.toLocaleString()}`,
  cursorY,
  billingColors
);
}

if (quoteData.applyGst) {

  if (measureOnly) {

    cursorY += 7;

} else {

  cursorY = drawGreyCostRowCompact(
  pdf,
  `GST (${quoteData.gstPercent}%)`,
  `${currencySymbol} ${gstAmount.toLocaleString()}`,
  cursorY,
  billingColors
);
}
}
if (measureOnly) {

    cursorY += 7;

} else {
cursorY = drawBlueCostRowCompact(
  pdf,
 "TOTAL AMOUNT PAYABLE",
`${currencySymbol} ${grandTotal.toLocaleString()}`,
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
  cursorY,
  billingColors
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

    if (!policy.text?.trim()) {
        return cursorY;
    }

    const title =
        sanitizePdfText(
            policy.title || ""
        );

    const wrapped =
        buildWrappedPolicyLines(
            pdf,
            policy.text || ""
        );

    const visibleLineCount =
        wrapped.lines.filter(
            line => line !== null
        ).length;

    const estimatedHeight =
        12 +
        visibleLineCount *
            wrapped.lineHeight +
        6;

    // ---------------------------------------------
    // MEASUREMENT MODE
    // ---------------------------------------------

    if (measureOnly) {
        return estimatedHeight;
    }

    
    cursorY = ensureSpace(
    cursorY,
    estimatedHeight
);
    // ---------------------------------------------
    // POLICY TITLE
    // ---------------------------------------------

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(9);

    const POLICY_CONTENT_X =
        PAGE.marginLeft + 3;

    pdf.text(
        `${title}:`,
        POLICY_CONTENT_X,
        cursorY
    );

    cursorY += 5;

    // ---------------------------------------------
    // POLICY BODY
    // ---------------------------------------------

    cursorY =
        drawWrappedLines(
            pdf,
            wrapped.lines,
            0,
            PAGE.marginLeft +
                DESCRIPTION_INSET,
            cursorY
        );

    cursorY += 4;

    return cursorY;
}



function drawCancellationRefundPolicy(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    drawClosing,
    policyColor
) {

    const policies =
        quoteData.cancellationRefundPolicy || [];

    if (!policies.length) return cursorY;

    const visiblePolicies = policies.filter(
        p => p.title?.trim() || p.text?.trim()
    );

    if (!visiblePolicies.length) return cursorY;

    const isFreshPage =
    cursorY <= PAGE.marginTop + 12 + 0.1;

if (isFreshPage) {

    cursorY += 8;

} else {

    cursorY += 20;
}

// =====================================================
// KEEP POLICY HEADING + FIRST POLICY TOGETHER
// =====================================================

const firstPolicy =
    visiblePolicies[0];

const firstPolicyHeight =
    drawSinglePolicy(
        pdf,
        firstPolicy,
        cursorY,
        ensureSpace,
        true
    );

// Heading + gap + complete first policy
const POLICY_OPENING_HEIGHT =
    20 +
    5 +
    firstPolicyHeight;

cursorY = ensureSpace(
    cursorY,
    POLICY_OPENING_HEIGHT
);


   cursorY = drawSectionHeading(
    pdf,
    "CANCELLATION & REFUND POLICY",
    cursorY,
    policyColor
);

    console.log(
    "POLICY AFTER HEADING:",
    {
        page:
            pdf.getCurrentPageInfo().pageNumber,
        cursorY
    }
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

    if (
        remaining <
        policyHeight + footerHeight
    ) {

        pdf.addPage();

        cursorY =
            PAGE.marginTop + 12;
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


function drawCustomPdfSection(
    pdf,
    section,
    cursorY,
    ensureSpace
) {

    if (!section) {
        return cursorY;
    }

    const title =
        String(
            section.label || ""
        ).trim();

    const content =
        String(
            section.content || ""
        ).trim();

    if (!title && !content) {
        return cursorY;
    }

    /*
     * ---------------------------------------------------------
     * SECTION COLOR
     * ---------------------------------------------------------
     */

    const sectionColor =
        section.color ||
        "#64748B";

    /*
     * ---------------------------------------------------------
     * SPACE BEFORE SECTION
     * ---------------------------------------------------------
     */

    const isFreshPage =
        cursorY <=
        PAGE.marginTop + 12 + 0.1;

    if (isFreshPage) {

        cursorY += 8;

    } else {

        cursorY += 20;
    }

    /*
     * ---------------------------------------------------------
     * SECTION HEADING
     * ---------------------------------------------------------
     */

    cursorY =
        ensureSpace(
            cursorY,
            20
        );

    cursorY =
        drawSectionHeading(
            pdf,
            title,
            cursorY,
            hexToRgb(
                sectionColor
            )
        );

    cursorY += 5;

    /*
     * ---------------------------------------------------------
     * RICH-TEXT CONTENT
     * ---------------------------------------------------------
     */

    if (content) {

        const contentLines =
            buildWrappedRichDescriptionLines(
                pdf,
                content,
                0,
                PAGE.width -
                    PAGE.marginLeft -
                    PAGE.marginRight -
                    4
            );

        const lines =
            contentLines.lines;

        const lineHeight =
            contentLines.lineHeight;

        for (
            let i = 0;
            i < lines.length;
            i++
        ) {

            cursorY =
                ensureSpace(
                    cursorY,
                    lineHeight
                );

            drawRichDescriptionPreviewLine(
                pdf,
                lines[i],
                PAGE.marginLeft + 2,
                cursorY
            );

            cursorY +=
                lineHeight;
        }
    }

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

function drawContentIcon(
    pdf,
    type,
    x,
    y,
    size = 5,
     iconColor
) {

    const color =
    iconColor ||
    COLORS.contentIcon;

    pdf.setDrawColor(
        ...color
    );

    pdf.setFillColor(
        ...color
    );

    pdf.setLineWidth(
        0.45
    );

    /*
     * -------------------------------------------------------
     * CITY — LOCATION PIN
     * -------------------------------------------------------
     */

    if (type === "city") {

        const cx =
            x + size / 2;

        const cy =
            y + size * 0.42;

        pdf.circle(
            cx,
            cy,
            size * 0.32,
            "F"
        );

        pdf.triangle(
            cx - size * 0.27,
            cy + size * 0.12,
            cx + size * 0.27,
            cy + size * 0.12,
            cx,
            y + size,
            "F"
        );

        pdf.setFillColor(
            255,
            255,
            255
        );

        pdf.circle(
            cx,
            cy,
            size * 0.11,
            "F"
        );

        return;
    }

    /*
     * -------------------------------------------------------
     * HOTEL — BUILDING
     * -------------------------------------------------------
     */

    if (type === "hotel") {

        const buildingX =
            x + size * 0.18;

        const buildingY =
            y + size * 0.18;

        const buildingW =
            size * 0.64;

        const buildingH =
            size * 0.78;

        pdf.rect(
            buildingX,
            buildingY,
            buildingW,
            buildingH,
            "F"
        );

        pdf.setFillColor(
            255,
            255,
            255
        );

        for (
            let row = 0;
            row < 3;
            row++
        ) {

            for (
                let col = 0;
                col < 2;
                col++
            ) {

                pdf.rect(
                    buildingX +
                        size * 0.13 +
                        col * size * 0.22,
                    buildingY +
                        size * 0.13 +
                        row * size * 0.19,
                    size * 0.10,
                    size * 0.10,
                    "F"
                );
            }
        }

        return;
    }

    /*
     * -------------------------------------------------------
     * MEAL PLAN — FORK + KNIFE
     * -------------------------------------------------------
     */

    if (type === "meal") {

        const forkX =
            x + size * 0.28;

        const knifeX =
            x + size * 0.70;

        /*
         * Fork handle
         */
        pdf.line(
            forkX,
            y + size * 0.40,
            forkX,
            y + size * 0.95
        );

        /*
         * Fork tines
         */
        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            pdf.line(
                forkX +
                    i * size * 0.10,
                y + size * 0.10,
                forkX +
                    i * size * 0.10,
                y + size * 0.43
            );
        }

        /*
         * Knife
         */
        pdf.line(
            knifeX,
            y + size * 0.10,
            knifeX,
            y + size * 0.95
        );

        return;
    }

    /*
     * -------------------------------------------------------
     * SIGHTSEEING — CAMERA
     * -------------------------------------------------------
     */

    if (type === "sightseeing") {

        pdf.roundedRect(
            x + size * 0.08,
            y + size * 0.30,
            size * 0.84,
            size * 0.55,
            0.6,
            0.6,
            "F"
        );

        /*
         * Camera lens
         */
        pdf.setFillColor(
            255,
            255,
            255
        );

        pdf.circle(
            x + size * 0.50,
            y + size * 0.575,
            size * 0.16,
            "F"
        );

        /*
         * Top camera bump
         */
        pdf.setFillColor(
            ...color
        );

        pdf.rect(
            x + size * 0.27,
            y + size * 0.18,
            size * 0.23,
            size * 0.16,
            "F"
        );

        return;
    }

    /*
     * -------------------------------------------------------
     * TRANSFERS — SIMPLE CAR
     * -------------------------------------------------------
     */

    if (type === "transfer") {

        /*
         * Car body
         */
        pdf.roundedRect(
            x + size * 0.10,
            y + size * 0.48,
            size * 0.80,
            size * 0.30,
            0.5,
            0.5,
            "F"
        );

        /*
         * Roof
         */
        pdf.triangle(
            x + size * 0.27,
            y + size * 0.48,
            x + size * 0.73,
            y + size * 0.48,
            x + size * 0.62,
            y + size * 0.25,
            "F"
        );

        /*
         * Windows
         */
        pdf.setFillColor(
            255,
            255,
            255
        );

        pdf.triangle(
            x + size * 0.36,
            y + size * 0.45,
            x + size * 0.58,
            y + size * 0.45,
            x + size * 0.54,
            y + size * 0.31,
            "F"
        );

        /*
         * Wheels
         */
        pdf.setFillColor(
            ...color
        );

        pdf.circle(
            x + size * 0.28,
            y + size * 0.82,
            size * 0.10,
            "F"
        );

        pdf.circle(
            x + size * 0.72,
            y + size * 0.82,
            size * 0.10,
            "F"
        );

        return;
    }
}


function drawCityHotelMeals(
    pdf,
    day,
    cursorY,
    ensureSpace,
    isLastDay = false,
    dayAccentColor
) {

    const left = LAYOUT.col1LabelX;


     /*
     * CITY
     * ----
     * Custom City takes priority over selected City.
     */
    const cityName =
        day.customCity?.trim()
            ? day.customCity.trim()
            : (day.city || "").trim();


    /*
     * HOTEL
     * -----
     * Custom Hotel takes priority over selected Hotel.
     */
    const hotelName =
        day.customHotel?.trim()
            ? day.customHotel.trim()
            : (day.hotel || "").trim();


    /*
     * HOTEL DISPLAY
     * -------------
     * Include hotel category only when an actual hotel exists.
     */
    const hotelDisplay =
        hotelName
            ? `${hotelName}${
                day.hotelCategoryLabel?.trim()
                    ? ` (${day.hotelCategoryLabel.trim()})`
                    : ""
              }`
            : "";


    /*
     * MEAL PLAN
     * ---------
     * Dropdown/chip mode
     */
    const mealItems = [
        ...(day.meals || []),
        ...(day.customMeals || [])
    ]
        .map(item => String(item || "").trim())
        .filter(Boolean);


    /*
 * Custom text mode
 *
 * Prefer the rich-text version when available.
 * Keep the existing plain-text field as fallback
 * for older quotations/drafts.
 */

const customMealRichText =
    day.mealMode === "text"
        ? (
            day.mealRichText?.trim()
                ? day.mealRichText
                : ""
          )
        : "";

const customMealText =
    day.mealMode === "text"
        ? sanitizePdfText(
            day.mealText || ""
          ).trim()
        : "";


            const hasCityHotelMeal =
    !!(
        cityName ||
        hotelDisplay ||
        mealItems.length > 0 ||
        customMealText ||
        customMealRichText
    );

    const sightseeingItems = [
    ...(day.selectedSightseeing || [])
].filter(Boolean);

const hasSightseeing =
    day.sightseeingMode === "text"
        ? !!(
            day.sightseeingRichText?.trim() ||
            day.sightseeingText?.trim()
          )
        : sightseeingItems.length > 0;

const transferItems = [
    ...(day.transfers || []),
    ...(day.customTransfers || [])
].filter(Boolean);

const hasTransfers =
    day.transferMode === "text"
        ? !!sanitizePdfText(
            day.transferText || ""
          ).trim()
        : transferItems.length > 0;

    /*
     * Final meal content.
     *
     * Priority:
     * 1. Custom text mode
     * 2. Selected/custom meal chips
     */
    const mealPlanText =
        customMealText ||
        (
            mealItems.length
                ? sanitizePdfText(
                    mealItems.join(" • ")
                  )
                : ""
        );


    const hasCity =
        cityName !== "";

    const hasHotel =
        hotelDisplay !== "";

    const hasMealPlan =
        mealPlanText !== "";


    /*
     * Nothing to render.
     */
    if (
        !hasCity &&
        !hasHotel &&
        !hasMealPlan
    ) {
        return cursorY;
    }


    pdf.setFontSize(10);


   /*
 * =====================================================
 * CITY + HOTEL ROW
 * =====================================================
 *
 * City + Hotel remain together as one logical row.
 *
 * IMPORTANT:
 * Measure the row BEFORE drawing it so the entire
 * City/Hotel row stays above CONTENT_BOTTOM_Y.
 */

if (hasCity || hasHotel) {

    pdf.setFont(
        "times",
        "bold"
    );

    const cityLabel = "City:";
    const hotelLabel = "Hotel:";

    const cityLabelWidth =
        pdf.getTextWidth(cityLabel);

    const hotelLabelWidth =
        pdf.getTextWidth(hotelLabel);

    const pageRight =
        PAGE.width -
        PAGE.marginRight;

    const cityLabelX =
        left;

    const cityValueX =
        left +
        7 +
        cityLabelWidth +
        2.5;

    const hotelLabelX =
        left + 60;

    const hotelValueX =
        hotelLabelX +
        7 +
        hotelLabelWidth +
        2.5;


    /*
     * -----------------------------------------------------
     * MEASURE CITY / HOTEL LINES FIRST
     * -----------------------------------------------------
     */

    let cityLines = [];
    let hotelLines = [];

    if (hasCity && hasHotel) {

        const cityAvailableWidth =
            hotelLabelX -
            cityValueX -
            8;

        cityLines =
            pdf.splitTextToSize(
                cityName,
                Math.max(
                    cityAvailableWidth,
                    35
                )
            );

        const hotelAvailableWidth =
            pageRight -
            hotelValueX;

        hotelLines =
            pdf.splitTextToSize(
                hotelDisplay,
                Math.max(
                    hotelAvailableWidth,
                    45
                )
            );

    } else if (hasCity) {

        const cityAvailableWidth =
            pageRight -
            cityValueX;

        cityLines =
            pdf.splitTextToSize(
                cityName,
                Math.max(
                    cityAvailableWidth,
                    50
                )
            );

    } else if (hasHotel) {

        const hotelValueXSingle =
            cityLabelX +
            7 +
            hotelLabelWidth +
            2.5;

        const hotelAvailableWidth =
            pageRight -
            hotelValueXSingle;

        hotelLines =
            pdf.splitTextToSize(
                hotelDisplay,
                Math.max(
                    hotelAvailableWidth,
                    50
                )
            );
    }


    const maxLines =
        Math.max(
            cityLines.length,
            hotelLines.length,
            1
        );

    const cityHotelHeight =
        Math.max(
            6,
            maxLines * 4.5 + 2
        );


    /*
     * -----------------------------------------------------
     * PAGINATION CHECK
     * -----------------------------------------------------
     *
     * If City/Hotel cannot fit safely, the COMPLETE
     * City/Hotel row moves to the next page.
     *
     * The Day header is NOT redrawn.
     */

    console.log(
    "CITY/HOTEL SPACE CHECK:",
    {
        page:
            pdf.getCurrentPageInfo().pageNumber,

        cursorY,

        cityHotelHeight,

        cityName,
        hotelDisplay
    }
);

    cursorY =
        ensureSpace(
            cursorY,
            cityHotelHeight
        );


    /*
     * -----------------------------------------------------
     * DRAW CITY + HOTEL
     * -----------------------------------------------------
     */

    if (hasCity && hasHotel) {

        drawContentIcon(
    pdf,
    "city",
    left,
    cursorY - 4.5,
    5,
    dayAccentColor
);

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            cityLabel,
            cityLabelX + 7,
            cursorY
        );


        pdf.setFont(
            "times",
            "normal"
        );

        pdf.setTextColor(
            0,
            0,
            0
        );

        pdf.text(
            cityLines,
            cityValueX,
            cursorY
        );


        drawContentIcon(
            pdf,
            "hotel",
            hotelLabelX,
            cursorY - 4.5,
            5,
            dayAccentColor
        );

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            hotelLabel,
            hotelLabelX + 7,
            cursorY
        );


        pdf.setFont(
            "times",
            "normal"
        );

        pdf.setTextColor(
            0,
            0,
            0
        );

        pdf.text(
            hotelLines,
            hotelValueX,
            cursorY
        );


    } else if (hasCity) {

        drawContentIcon(
            pdf,
            "city",
            cityLabelX,
            cursorY - 4.5,
            5,
            dayAccentColor
        );

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            cityLabel,
            cityLabelX + 7,
            cursorY
        );


        pdf.setFont(
            "times",
            "normal"
        );

        pdf.setTextColor(
            0,
            0,
            0
        );

        pdf.text(
            cityLines,
            cityValueX,
            cursorY
        );


    } else if (hasHotel) {

        const hotelValueXSingle =
            cityLabelX +
            7 +
            hotelLabelWidth +
            2.5;

        drawContentIcon(
            pdf,
            "hotel",
            cityLabelX,
            cursorY - 4.5,
            5,
            dayAccentColor
        );

        pdf.setFont(
            "times",
            "bold"
        );

       pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            hotelLabel,
            cityLabelX + 7,
            cursorY
        );


        pdf.setFont(
            "times",
            "normal"
        );

        pdf.setTextColor(
            0,
            0,
            0
        );

        pdf.text(
            hotelLines,
            hotelValueXSingle,
            cursorY
        );
    }


    cursorY +=
        cityHotelHeight;


    pdf.setTextColor(
        0,
        0,
        0
    );
}


/*
 * =====================================================
 * MEAL PLAN
 * =====================================================
 *
 * Meal Plan is independently paginated.
 *
 * This is important:
 *
 * City + Hotel may remain on the current page while
 * Meal Plan moves to the next page if it does not fit.
 */

if (hasMealPlan) {

    cursorY += 2;

    const mealLabel =
        "Meal Plan:";

        const mealValueX =
    left +
    7 +
    pdf.getTextWidth(
        mealLabel
    ) +
    2.5;

const pageRight =
    PAGE.width -
    PAGE.marginRight;

const mealAvailableWidth =
    pageRight -
    mealValueX;

    const mealLabelWidth =
        pdf.getTextWidth(
            mealLabel + " "
        );

    /*
     * -------------------------------------------------------
     * RICH-TEXT CUSTOM MEAL
     * -------------------------------------------------------
     */

    if (
        day.mealMode === "text" &&
        customMealRichText?.trim()
    ) {

        /*
         * Build formatted/wrapped rich-text lines.
         *
         * The first line begins beside "Meal Plan:".
         * Continuation lines begin at the normal left inset.
         */

        const mealLines =
            buildWrappedRichDescriptionLines(
                pdf,
                customMealRichText,
                mealLabelWidth
            );

        const mealLineHeight =
            mealLines.lineHeight;

        const mealHeight =
            Math.max(
                7,
                mealLines.lines.length *
                    mealLineHeight +
                    2
            );

        cursorY =
            ensureSpace(
                cursorY,
                mealHeight
            );

        /*
         * MEAL ICON
         */
        drawContentIcon(
            pdf,
            "meal",
            left,
            cursorY - 4.5,
            5,
            dayAccentColor
        );

        /*
         * MEAL LABEL
         */
        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setFontSize(10);

        pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            mealLabel,
            left + 7,
            cursorY
        );

        /*
         * MEAL BODY
         */
        pdf.setTextColor(
            0,
            0,
            0
        );

        mealLines.lines.forEach(
            (line, lineIndex) => {

                const lineX =
                    lineIndex === 0
                        ? mealValueX
                        : left;

                drawRichDescriptionPreviewLine(
                    pdf,
                    line,
                    lineX,
                    cursorY
                );

                if (
                    lineIndex <
                    mealLines.lines.length - 1
                ) {

                    cursorY +=
                        mealLineHeight;
                }

            }
        );

        cursorY +=
    mealLineHeight +
    2;

    }

    /*
     * -------------------------------------------------------
     * EXISTING PLAIN-TEXT / CHIP MODE
     * -------------------------------------------------------
     */

    else {

        const mealLines =
            pdf.splitTextToSize(
                mealPlanText,
                Math.max(
                    mealAvailableWidth,
                    60
                )
            );

        const mealHeight =
            Math.max(
                7,
                mealLines.length * 4.5 + 2
            );

        cursorY =
            ensureSpace(
                cursorY,
                mealHeight
            );

        drawContentIcon(
            pdf,
            "meal",
            left,
            cursorY - 4.5,
            5,
            dayAccentColor
        );

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            mealLabel,
            left + 7,
            cursorY
        );

        pdf.setFont(
            "times",
            "normal"
        );

        pdf.setTextColor(
            0,
            0,
            0
        );

        pdf.text(
            mealLines,
            mealValueX,
            cursorY
        );

        cursorY +=
            mealHeight;
    }
}

    /*
     * Return the exact next drawing position.
     *
     * Sightseeing will continue from here.
     */
    return cursorY;
}

function drawRichSightseeingText(
    pdf,
    html,
    cursorY,
    ensureSpace,
    left,
    startX = left
) {

    if (!html?.trim()) {
        return cursorY;
    }

    const container =
        document.createElement("div");

    container.innerHTML = html;

    const CARD_RIGHT_INSET = 4;

const cardRight =
    PAGE.width -
    PAGE.marginRight -
    CARD_RIGHT_INSET;

const availableWidth =
    cardRight -
    startX;

    const lineHeight = 5;

    /*
     * -------------------------------------------------------
     * EXTRACT FORMATTED TEXT RUNS
     * -------------------------------------------------------
     */

    const runs = [];

    const walk = (
        node,
        style = {}
    ) => {

        if (
            node.nodeType ===
            Node.TEXT_NODE
        ) {

            if (node.nodeValue) {

               runs.push({
    text: node.nodeValue,
    bold: !!style.bold,
    italic: !!style.italic,
    underline: !!style.underline,
    color: style.color || null
});

            }

            return;
        }

        if (
            node.nodeType !==
            Node.ELEMENT_NODE
        ) {
            return;
        }

        const tag =
            node.tagName.toLowerCase();

       const nextStyle = {
    bold:
        style.bold ||
        tag === "strong" ||
        tag === "b",

    italic:
        style.italic ||
        tag === "em" ||
        tag === "i",

    underline:
        style.underline ||
        tag === "u",

    color:
        node.style?.color ||
        style.color ||
        null
};
        /*
         * Paragraph / line-break elements.
         *
         * Insert an explicit newline marker.
         */
        if (
            tag === "p" ||
            tag === "div"
        ) {

            node.childNodes.forEach(
                child =>
                    walk(
                        child,
                        nextStyle
                    )
            );

           runs.push({
    text: "\n",
    bold: false,
    italic: false,
    underline: false,
    color: style.color || null
});

            return;
        }

        if (tag === "br") {

           runs.push({
    text: "\n",
    bold: false,
    italic: false,
    underline: false,
    color: style.color || null
});

            return;
        }

        node.childNodes.forEach(
            child =>
                walk(
                    child,
                    nextStyle
                )
        );
    };

    container.childNodes.forEach(
        node =>
            walk(node)
    );

    /*
     * Remove the final artificial newline.
     */
    if (
        runs.length &&
        runs[runs.length - 1].text === "\n"
    ) {
        runs.pop();
    }

    /*
     * -------------------------------------------------------
     * DRAW FORMATTED RUNS
     * -------------------------------------------------------
     */

    let x = startX;

    const setRunFont = (
    run
) => {

    if (
        run.bold &&
        run.italic
    ) {

        pdf.setFont(
            "times",
            "bolditalic"
        );

    } else if (
        run.bold
    ) {

        pdf.setFont(
            "times",
            "bold"
        );

    } else if (
        run.italic
    ) {

        pdf.setFont(
            "times",
            "italic"
        );

    } else {

        pdf.setFont(
            "times",
            "normal"
        );
    }

    pdf.setFontSize(10);

    /*
     * TEXT COLOR
     */
    if (run.color) {

        let r;
        let g;
        let b;

        if (
            run.color.startsWith("#")
        ) {

            const hex =
                run.color.replace(
                    "#",
                    ""
                );

            if (hex.length === 6) {

                r =
                    parseInt(
                        hex.substring(0, 2),
                        16
                    );

                g =
                    parseInt(
                        hex.substring(2, 4),
                        16
                    );

                b =
                    parseInt(
                        hex.substring(4, 6),
                        16
                    );
            }

        } else {

            const rgb =
                run.color.match(
                    /\d+/g
                );

            if (
                rgb &&
                rgb.length >= 3
            ) {

                r = Number(rgb[0]);
                g = Number(rgb[1]);
                b = Number(rgb[2]);
            }
        }

        if (
            Number.isFinite(r) &&
            Number.isFinite(g) &&
            Number.isFinite(b)
        ) {

            pdf.setTextColor(
                r,
                g,
                b
            );

        } else {

            pdf.setTextColor(
                0,
                0,
                0
            );
        }

    } else {

        pdf.setTextColor(
            0,
            0,
            0
        );
    }
};

    const drawTextSegment = (
        text,
        run
    ) => {

        if (!text) {
            return;
        }

        setRunFont(run);

        const width =
            pdf.getTextWidth(text);

        /*
         * If the complete segment fits,
         * draw it normally.
         */
       if (
    x + width <=
    cardRight
) {

            pdf.text(
                text,
                x,
                cursorY
            );

            if (run.underline) {

              pdf.setDrawColor(
        0,
        0,
        0
    );

    pdf.setLineWidth(0.05);

                pdf.line(
                    x,
                    cursorY + 0.8,
                    x + width,
                    cursorY + 0.8
                );
            }

            x += width;

            return;
        }

        /*
         * ---------------------------------------------------
         * WORD WRAPPING
         * ---------------------------------------------------
         */

        const words =
            text.split(/(\s+)/);

        words.forEach(word => {

            if (!word) {
                return;
            }

            /*
             * Explicit whitespace.
             */
            if (
                /^\s+$/.test(word)
            ) {

                const spaceWidth =
                    pdf.getTextWidth(word);

                /*
                 * Don't start a new line
                 * with whitespace.
                 */
               if (
    x !== left &&
    x + spaceWidth <=
        cardRight
) {
                    x +=
                        spaceWidth;
                }

                return;
            }

            setRunFont(run);

            const wordWidth =
                pdf.getTextWidth(word);

            /*
             * Word does not fit on the
             * current line.
             */
            if (
    x !== left &&
    x + wordWidth >
        cardRight
) {

                cursorY =
                    ensureSpace(
                        cursorY,
                        lineHeight
                    );

                cursorY +=
                    lineHeight;

                x = left;
            }

            /*
             * Very long single word.
             */
            if (
                wordWidth >
                availableWidth
            ) {

                const chunks =
                    pdf.splitTextToSize(
                        word,
                        availableWidth
                    );

                chunks.forEach(
                    (chunk, chunkIndex) => {

                        if (
                            chunkIndex > 0
                        ) {

                            cursorY =
                                ensureSpace(
                                    cursorY,
                                    lineHeight
                                );

                            cursorY +=
                                lineHeight;

                            x = left;
                        }

                        setRunFont(run);

                        pdf.text(
                            chunk,
                            x,
                            cursorY
                        );

                        const chunkWidth =
                            pdf.getTextWidth(
                                chunk
                            );

                        if (
                            run.underline
                        ) {

                           pdf.setDrawColor(
                                         0,
                                         0,
                                         0
                                      );

                                      pdf.setLineWidth(0.05);

                            pdf.line(
                                x,
                                cursorY + 0.8,
                                x + chunkWidth,
                                cursorY + 0.8
                            );
                        }

                        x +=
                            chunkWidth;
                    }
                );

                return;
            }

            pdf.text(
                word,
                x,
                cursorY
            );

            if (
                run.underline
            ) {

                pdf.line(
                    x,
                    cursorY + 0.8,
                    x + wordWidth,
                    cursorY + 0.8
                );
            }

            x += wordWidth;
        });
    };

    /*
     * -------------------------------------------------------
     * PROCESS RUNS
     * -------------------------------------------------------
     */

    for (
    const run of runs
) {

    /*
     * -------------------------------------------------------
     * PRESERVE EVERY EXPLICIT LINE BREAK
     *
     * Tiptap may store several visual lines inside the
     * same text node:
     *
     * • Item 1\n
     * • Item 2\n
     * • Item 3
     *
     * We must process those lines individually.
     * -------------------------------------------------------
     */

    const runLines =
        String(run.text || "")
            .split("\n");

    for (
        let lineIndex = 0;
        lineIndex < runLines.length;
        lineIndex++
    ) {

        const lineText =
            runLines[lineIndex];

        /*
         * Draw the actual text on this line.
         */
        if (
            lineText !== ""
        ) {

            const cleanLine =
                sanitizePdfText(
                    lineText
                );

            if (
                cleanLine
            ) {

                drawTextSegment(
                    cleanLine,
                    run
                );

            }

        }

        /*
         * Every explicit newline means:
         *
         * 1. Finish the current PDF line
         * 2. Move vertically
         * 3. Reset X to the left margin
         *
         * This is what preserves vertical bullet lists.
         */
        if (
            lineIndex <
            runLines.length - 1
        ) {

            cursorY =
                ensureSpace(
                    cursorY,
                    lineHeight
                );

            cursorY +=
                lineHeight;

            x = left;

        }

    }
}

pdf.setTextColor(
    0,
    0,
    0
);

    return cursorY + lineHeight + 2;
}


 function drawSightseeing(
    pdf,
    day,
    cursorY,
    ensureSpace,
    dayAccentColor
) {

    const left = LAYOUT.col1LabelX;

    const CARD_RIGHT_INSET = 4;

const cardRight =
    PAGE.width -
    PAGE.marginRight -
    CARD_RIGHT_INSET;

    if (
    day.sightseeingMode === "text" &&
    (
        day.sightseeingRichText?.trim() ||
        day.sightseeingText?.trim()
    )
) {

    // ---------- SIGHTSEEING LABEL ----------

    drawContentIcon(
    pdf,
    "sightseeing",
    left,
    cursorY - 4.5,
    5,
    dayAccentColor
);


pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(10);

pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

pdf.text(
    "Sightseeing:",
    left + 7,
    cursorY
);

    // Start content below the label.
    cursorY += 5;


    pdf.setTextColor(
    0,
    0,
    0
);

    /*
     * -------------------------------------------------------
     * RICH TEXT
     *
     * Use Tiptap HTML when available.
     *
     * This preserves:
     *   <strong> / <b>
     *   <em> / <i>
     *   <u>
     *   paragraph breaks
     *   line breaks
     * -------------------------------------------------------
     */

    if (
        day.sightseeingRichText?.trim()
    ) {

        cursorY =
            ensureSpace(
                cursorY,
                5
            );

        cursorY =
            drawRichSightseeingText(
                pdf,
                day.sightseeingRichText,
                cursorY,
                ensureSpace,
                left
            );

        return cursorY;
    }

    /*
     * -------------------------------------------------------
     * LEGACY / PLAIN TEXT FALLBACK
     *
     * Keep the existing renderer for older quotations
     * or content that has no rich-text representation.
     * -------------------------------------------------------
     */

    pdf.setFont(
        "times",
        "normal"
    );

    pdf.setFontSize(10);

    const sourceLines =
        day.sightseeingText
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");

    // Remove only trailing blank / whitespace-only lines.
    while (
        sourceLines.length > 0 &&
        sourceLines[
            sourceLines.length - 1
        ].trim() === ""
    ) {
        sourceLines.pop();
    }

    const availableWidth =
    cardRight -
    left;


    sourceLines.forEach(
        (sourceLine) => {

            // ---------- BLANK EDITOR LINE ----------

            if (
                sourceLine.trim() === ""
            ) {

                cursorY =
                    ensureSpace(
                        cursorY,
                        5
                    );

                cursorY += 5;

                return;
            }

            const cleanLine =
                sanitizePdfText(
                    sourceLine
                );

            if (!cleanLine) {

                cursorY =
                    ensureSpace(
                        cursorY,
                        5
                    );

                cursorY += 5;

                return;
            }

            const wrapped =
                pdf.splitTextToSize(
                    cleanLine,
                    availableWidth
                );

            const lineHeight =
                wrapped.length * 5;

            cursorY =
                ensureSpace(
                    cursorY,
                    lineHeight
                );

            pdf.text(
                wrapped,
                left,
                cursorY
            );

            cursorY +=
                lineHeight;
        }
    );

    return cursorY + 2;
}


    const sightseeing =
    (day.selectedSightseeing || []).filter(Boolean);

const sightseeingText =
    sanitizePdfText(
        day.sightseeingText || ""
    );

const sightseeingRichText =
    day.sightseeingMode === "text"
        ? (
            day.sightseeingRichText?.trim()
                ? day.sightseeingRichText
                : ""
          )
        : "";

const hasSightseeing =
    day.sightseeingMode === "text"
        ? !!(
            sightseeingRichText ||
            sightseeingText
          )
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

        drawContentIcon(
    pdf,
    "sightseeing",
    left,
    cursorY - 4.5,
    5,
    dayAccentColor
);

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(10);

pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

pdf.text(
    "Sightseeing:",
    left + 7,
    cursorY
);

pdf.setFont(
    "times",
    "normal"
);

pdf.setTextColor(
    0,
    0,
    0
);





        const text =
    sanitizePdfText(

        sightseeing.length
            ? sightseeing
                  .map(s => s?.name || "")
                  .filter(Boolean)
                  .join(" • ")
            : "-"

    );

        const startX =
    left +
    7 +
    pdf.getTextWidth(
        "Sightseeing:"
    ) +
    2.5;

        const wrapped =
    pdf.splitTextToSize(
        text,
        cardRight -
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

drawContentIcon(
    pdf,
    "sightseeing",
    left,
    cursorY - 4.5,
    5
);

pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(10);

pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

pdf.text(
    "Sightseeing:",
    left + 7,
    cursorY
);

pdf.setTextColor(
    0,
    0,
    0
);

cursorY += 5;

    sightseeing.forEach(item => {

        const bullet =
            " • ";

        if (
    item.descriptionRichText?.trim() ||
    item.description?.trim()
) {

    // ---------------------------------------------------------
    // SIGHTSEEING TITLE
    // ---------------------------------------------------------

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

    /*
     * -------------------------------------------------------
     * DESCRIPTION STARTS BESIDE THE SIGHTSEEING TITLE
     * -------------------------------------------------------
     */

    const descriptionStartX =
        left +
        titleWidth +
        2;

    /*
     * -------------------------------------------------------
     * RICH-TEXT DESCRIPTION
     *
     * Use the Tiptap HTML when available.
     *
     * The helper handles:
     *   Bold
     *   Italic
     *   Underline
     *   Wrapping
     *   Explicit line breaks
     *   Pagination
     * -------------------------------------------------------
     */

    if (
        item.descriptionRichText?.trim()
    ) {

        cursorY =
            drawRichSightseeingText(
                pdf,
                item.descriptionRichText,
                cursorY,
                ensureSpace,
                left,
                descriptionStartX
            );

    } else {

        /*
         * ---------------------------------------------------
         * EXISTING PLAIN-TEXT FALLBACK
         * ---------------------------------------------------
         */

        pdf.setFont(
            "times",
            "normal"
        );

        const description =
            sanitizePdfText(
                item.description
            );

        // -----------------------------------------------------
        // FIRST DESCRIPTION LINE
        // -----------------------------------------------------

       const firstLineWidth =
    cardRight -
    descriptionStartX;

        const firstLineWrapped =
            pdf.splitTextToSize(
                description,
                Math.max(
                    firstLineWidth,
                    40
                )
            );

        pdf.text(
            firstLineWrapped[0] || "",
            descriptionStartX,
            cursorY
        );

        cursorY += 5;

        // -----------------------------------------------------
        // REMAINING DESCRIPTION
        // -----------------------------------------------------

        if (
            firstLineWrapped.length > 1
        ) {

            const remainingDescription =
                firstLineWrapped
                    .slice(1)
                    .join(" ");

           const remainingWrapped =
    pdf.splitTextToSize(
        remainingDescription,
        cardRight -
        left
    );

            cursorY =
                drawWrappedLines(
                    pdf,
                    remainingWrapped,
                    0,
                    left,
                    cursorY
                );
        }
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
        if (
    item !== sightseeing[sightseeing.length - 1]
) {
    cursorY += 1;
}

});

    return cursorY;

}



 function drawTransfers(
    pdf,
    day,
    cursorY,
    ensureSpace,
    dayAccentColor
) {

    const left =
        LAYOUT.col1LabelX;

    const transferItems = [
        ...(day.transfers || []),
        ...(day.customTransfers || [])
    ];

    /*
     * -------------------------------------------------------
     * CUSTOM TEXT
     *
     * Prefer the new rich-text field.
     * Fall back to transferText for older quotations.
     * -------------------------------------------------------
     */

    const transferRichText =
        day.transferMode === "text"
            ? (
                day.transferRichText?.trim()
                    ? day.transferRichText
                    : ""
              )
            : "";

    const transferText =
        sanitizePdfText(
            day.transferText || ""
        ).trim();

    const hasTransfers =
        day.transferMode === "text"
            ? !!(
                transferRichText ||
                transferText
              )
            : transferItems.length > 0;

    if (!hasTransfers) {

        return {
            cursorY,
            remainingLines: [],
            textX: left
        };
    }


    /*
     * =======================================================
     * CUSTOM TEXT — RICH TEXT
     * =======================================================
     */

    if (
        day.transferMode === "text" &&
        transferRichText
    ) {

        const transferLabel =
            "Transfers:";

        const transferLabelWidth =
            pdf.getTextWidth(
                transferLabel + " "
            );

        const transferValueX =
            left +
            6 +
            pdf.getTextWidth(
                transferLabel
            ) +
            2.5;


        /*
         * Build formatted/wrapped lines.
         *
         * First line starts after "Transfers:".
         * Continuation lines start at normal left inset.
         */

        const transferLines =
            buildWrappedRichDescriptionLines(
                pdf,
                transferRichText,
                transferLabelWidth
            );

        const transferLineHeight =
            transferLines.lineHeight;

        const transferHeight =
            Math.max(
                7,
                transferLines.lines.length *
                    transferLineHeight +
                    2
            );


        cursorY =
            ensureSpace(
                cursorY,
                transferHeight
            );


        /*
         * TRANSFER ICON
         */

        drawContentIcon(
            pdf,
            "transfer",
            left,
            cursorY - 4.0,
            4,
            dayAccentColor
        );


        /*
         * TRANSFER LABEL
         */

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setFontSize(10);

        pdf.setTextColor(
    ...(dayAccentColor || COLORS.contentLabel)
);

        pdf.text(
            transferLabel,
            left + 6,
            cursorY
        );


        /*
         * TRANSFER BODY
         */

        pdf.setTextColor(
            0,
            0,
            0
        );

        transferLines.lines.forEach(
            (line, lineIndex) => {

                const lineX =
                    lineIndex === 0
                        ? transferValueX
                        : left;

                drawRichDescriptionPreviewLine(
                    pdf,
                    line,
                    lineX,
                    cursorY
                );

                if (
                    lineIndex <
                    transferLines.lines.length - 1
                ) {

                    cursorY +=
                        transferLineHeight;
                }
            }
        );

        cursorY += 2;

        return {
            cursorY,
            remainingLines: [],
            textX: left
        };
    }


    /*
     * =======================================================
     * CUSTOM TEXT — OLD PLAIN-TEXT FALLBACK
     * =======================================================
     */

    if (
        day.transferMode === "text" &&
        transferText
    ) {

        drawContentIcon(
            pdf,
            "transfer",
            left,
            cursorY - 4.0,
            4,
            dayAccentColor
        );

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setFontSize(10);

        const VALUE_X =
            left +
            6 +
            pdf.getTextWidth(
                "Transfers:"
            ) +
            2.5;

        const lines =
            buildHangingLines(
                pdf,
                transferText,
                VALUE_X,
                left
            );

        return {
           cursorY:
    drawHangingLines(
        pdf,
        "Transfers:",
        lines,
        left,
        VALUE_X,
        cursorY,
        "transfer",
        dayAccentColor
    ),

            remainingLines: [],
            textX: left
        };
    }


    /*
     * =======================================================
     * CHIP MODE — EXISTING LOGIC
     * =======================================================
     */

    drawContentIcon(
        pdf,
        "transfer",
        left,
        cursorY - 4.0,
        4,
        dayAccentColor
    );

    pdf.setFont(
        "times",
        "bold"
    );

    pdf.setFontSize(10);

    const VALUE_X =
        left +
        6 +
        pdf.getTextWidth(
            "Transfers:"
        ) +
        2.5;

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
        cursorY:
    drawHangingLines(
        pdf,
        "Transfers:",
        lines,
        left,
        VALUE_X,
        cursorY,
        "transfer",
        dayAccentColor
    ),

        remainingLines: [],
        textX: left
    };
}


// =========================================================
// HOTEL USED
// =========================================================

function drawHotelUsed(
    pdf,
    quoteData,
    cursorY,
    ensureSpace
) {

    if (
        !quoteData.hotelUsedEnabled ||
        !quoteData.hotelUsed?.length
    ) {
        return cursorY;
    }

    const hotels =
        quoteData.hotelUsed.filter(
            hotel =>
                hotel &&
                (
                    hotel.nights?.trim() ||
                    hotel.city?.trim() ||
                    hotel.hotelName?.trim() ||
                    hotel.room?.trim()
                )
        );

    if (!hotels.length) {
        return cursorY;
    }


    // =====================================================
    // CARD GEOMETRY
    // =====================================================

    const left =
        PAGE.marginLeft;

    const right =
        PAGE.width -
        PAGE.marginRight;

    const totalWidth =
        right - left;

    const cardPadding =
        3;

    const sectionHeaderHeight =
    8;

    const tableHeaderHeight =
        8;

    const rowPaddingX =
        2;

    const rowPaddingY =
        3;

    const rowLineHeight =
        4.5;


    // =====================================================
    // PREMIUM SECTION COLOR
    // =====================================================

 const sectionColor =
    hexToRgb(
        quoteData?.pdfTheme?.sections
            ?.hotelUsed?.color ||
        "#5C3391"
    );

    const hotelUsedColors =
    getHotelUsedColorFamily(
        sectionColor
    );

    // =====================================================
    // COLUMN WIDTHS
    // =====================================================

    const colWidths = [
        totalWidth * 0.13, // Nights
        totalWidth * 0.22, // City
        totalWidth * 0.39, // Hotel Name
        totalWidth * 0.26  // Room
    ];


    // =====================================================
    // PREPARE ROWS FIRST
    //
    // This is important for pagination.
    // We calculate the complete card height BEFORE
    // drawing anything.
    // =====================================================

    const preparedRows =
        hotels.map(
            hotel => {

                const values = [
                    hotel.nights || "",
                    hotel.city || "",
                    hotel.hotelName || "",
                    hotel.room || ""
                ];

                const wrappedCells =
                    values.map(
                        (value, index) =>
                            pdf.splitTextToSize(
                                String(value),
                                colWidths[index] -
                                    rowPaddingX * 2
                            )
                    );

                const maxLines =
                    Math.max(
                        ...wrappedCells.map(
                            lines =>
                                Math.max(
                                    lines.length,
                                    1
                                )
                        )
                    );

                const rowHeight =
                    Math.max(
                        8,
                        maxLines *
                            rowLineHeight +
                            rowPaddingY * 2
                    );

                return {
                    wrappedCells,
                    rowHeight
                };

            }
        );


    // =====================================================
    // COMPLETE CARD HEIGHT
    // =====================================================

    const rowsHeight =
        preparedRows.reduce(
            (total, row) =>
                total + row.rowHeight,
            0
        );

    const cardHeight =
        cardPadding +
        sectionHeaderHeight +
        4 +
        tableHeaderHeight +
        rowsHeight +
        cardPadding;


    // =====================================================
    // ATOMIC PAGINATION
    //
    // The COMPLETE HOTEL USED card must fit.
    // If it doesn't, move the entire card to a new page.
    // =====================================================

    const availableHeight =
        PAGE.height -
        PAGE.marginBottom -
        cursorY;

    if (
        cardHeight >
        availableHeight
    ) {

        pdf.addPage();

        cursorY =
            PAGE.marginTop;
    }


    // =====================================================
    // OUTER CARD
    // =====================================================

    pdf.setFillColor(
        255,
        255,
        255
    );

    pdf.setDrawColor(
        210,
        214,
        220
    );

    pdf.setLineWidth(
        0.5
    );

    pdf.roundedRect(
        left,
        cursorY,
        totalWidth,
        cardHeight,
        3,
        3,
        "FD"
    );


    // =====================================================
    // SECTION HEADER
    // =====================================================

    pdf.setFillColor(
        sectionColor[0],
        sectionColor[1],
        sectionColor[2]
    );

    pdf.setDrawColor(
        sectionColor[0],
        sectionColor[1],
        sectionColor[2]
    );

    pdf.roundedRect(
        left,
        cursorY,
        totalWidth,
        sectionHeaderHeight,
        3,
        3,
        "F"
    );


    // Cover the lower rounded corners of header so
    // only the top corners remain rounded.

    pdf.rect(
        left,
        cursorY + 4,
        totalWidth,
        sectionHeaderHeight - 4,
        "F"
    );


    // =====================================================
    // HEADER TEXT
    // =====================================================

    pdf.setFont(
        "times",
        "bold"
    );

    pdf.setFontSize(
        10
    );

    pdf.setTextColor(
        255,
        255,
        255
    );

    pdf.text(
        "HOTEL USED",
        left + 5,
        cursorY + 5.5
    );


    cursorY +=
        sectionHeaderHeight + 4;


    // =====================================================
// TABLE HEADER — CLEAN PREMIUM STYLE
// =====================================================

pdf.setFillColor(
    ...hotelUsedColors.tableHeader
);

pdf.setDrawColor(
    210,
    214,
    220
);

pdf.rect(
    left,
    cursorY,
    totalWidth,
    tableHeaderHeight,
    "F"
);


// -----------------------------------------------------
// HEADER LABELS
// -----------------------------------------------------

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.setFontSize(
    9
);

pdf.setTextColor(
    ...hotelUsedColors.headerText
);

const headers = [
    "Nights",
    "City",
    "Hotel Name",
    "Room"
];


let headerX =
    left;


headers.forEach(
    (header, index) => {

        const columnCenter =
            headerX +
            colWidths[index] / 2;

        pdf.text(
            header,
            columnCenter,
            cursorY + 5.3,
            {
                align: "center"
            }
        );

        // -------------------------------------------------
        // SHORT VERTICAL DIVIDER
        //
        // Divider stays INSIDE header only.
        // It does not touch top/bottom border.
        // -------------------------------------------------

        if (
            index <
            colWidths.length - 1
        ) {

            const dividerX =
                headerX +
                colWidths[index];

            pdf.setDrawColor(
    ...hotelUsedColors.divider
);

pdf.setLineWidth(
    0.4
);

            pdf.line(
                dividerX,
                cursorY + 1.5,
                dividerX,
                cursorY +
                    tableHeaderHeight -
                    1.5
            );
        }

        headerX +=
            colWidths[index];
    });


cursorY +=
    tableHeaderHeight;


    // =====================================================
    // TABLE ROWS
    // =====================================================

    pdf.setFont(
        "times",
        "normal"
    );

    pdf.setFontSize(
        9
    );

    pdf.setTextColor(
        0,
        0,
        0
    );


    preparedRows.forEach(
        row => {

            const {
                wrappedCells,
                rowHeight
            } = row;


            // =====================================================
// SUBTLE ROW BAND
// =====================================================

const rowIndex =
    preparedRows.indexOf(row);

if (
    rowIndex % 2 === 0
) {

    pdf.setFillColor(
    ...hotelUsedColors.rowBand
);

} else {

    pdf.setFillColor(
        255,
        255,
        255
    );
}

pdf.rect(
    left,
    cursorY,
    totalWidth,
    rowHeight,
    "F"
);

            // ---------------------------------------------
            // CENTERED CELL VALUES
            // ---------------------------------------------

            let textX =
                left;


            wrappedCells.forEach(
                (lines, index) => {

                    const columnCenter =
                        textX +
                        colWidths[index] / 2;


                    pdf.text(
                        lines,
                        columnCenter,
                        cursorY +
                            rowPaddingY +
                            3.5,
                        {
                            align: "center",
                            baseline:
                                "alphabetic"
                        }
                    );


                    textX +=
                        colWidths[index];
                }
            );


            cursorY +=
                rowHeight;

        }
    );


    // =====================================================
    // FINAL CARD GAP
    // =====================================================

    return (
        cursorY +
        14
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
    ensureSpace,
    hexToRgb(
        pdfSectionColors.billing
    )
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


function drawRichDescriptionPreviewLine(
    pdf,
    lineRuns,
    x,
    y
) {

    let currentX = x;

    lineRuns.forEach((run) => {

        if (!run?.text) {
            return;
        }

        if (
            run.bold &&
            run.italic
        ) {

            pdf.setFont(
                "times",
                "bolditalic"
            );

        } else if (
            run.bold
        ) {

            pdf.setFont(
                "times",
                "bold"
            );

        } else if (
            run.italic
        ) {

            pdf.setFont(
                "times",
                "italic"
            );

        } else {

            pdf.setFont(
                "times",
                "normal"
            );
        }

        pdf.setFontSize(10);

       if (run.color) {

    let r;
    let g;
    let b;

    if (
        run.color.startsWith("#")
    ) {

        const hex =
            run.color.replace(
                "#",
                ""
            );

        if (hex.length === 6) {

            r =
                parseInt(
                    hex.substring(0, 2),
                    16
                );

            g =
                parseInt(
                    hex.substring(2, 4),
                    16
                );

            b =
                parseInt(
                    hex.substring(4, 6),
                    16
                );
        }

    } else {

        const rgb =
            run.color.match(
                /\d+/g
            );

        if (
            rgb &&
            rgb.length >= 3
        ) {

            r = Number(rgb[0]);
            g = Number(rgb[1]);
            b = Number(rgb[2]);
        }
    }

    if (
        Number.isFinite(r) &&
        Number.isFinite(g) &&
        Number.isFinite(b)
    ) {

        pdf.setTextColor(
            r,
            g,
            b
        );

    } else {

        pdf.setTextColor(
            0,
            0,
            0
        );
    }

} else {

    pdf.setTextColor(
        0,
        0,
        0
    );
}

        const text =
    /^\s+$/.test(run.text)
        ? run.text
        : sanitizePdfText(
            run.text
          );

        if (!text) {
            return;
        }

        const width =
            pdf.getTextWidth(text);

        pdf.text(
            text,
            currentX,
            y
        );

        if (run.underline) {

            pdf.setDrawColor(
                0,
                0,
                0
            );

            pdf.setLineWidth(
                0.05
            );

            pdf.line(
                currentX,
                y + 0.8,
                currentX + width,
                y + 0.8
            );
        }

        currentX += width;
    });

    return currentX;
}




async function drawItineraryContent(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    pageState,
    contentBottomY,
    pdfSectionColors
) {

  cursorY = drawTourSummary(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    pdfSectionColors.tourSummary
);


console.log(
  "DETAILED ITINERARY THEME COLOR:",
  pdfSectionColors?.detailedTourItinerary
);


 cursorY =
  drawDayWiseHeader(
    pdf,
    cursorY,
    ensureSpace,
    hexToRgb(
      pdfSectionColors
        .detailedTourItinerary
    )
  );

 

const itinerary = quoteData.itinerary || [];

for (const [index, day] of itinerary.entries()) {

    const dayPanelStartY =
    cursorY;

    pageState.activeDayPanel = {
    startPage: pageState.currentPage,
    startY: dayPanelStartY,
    pageBreaks: []
};

  const baseDate = new Date(quoteData.travelFrom);

baseDate.setDate(
    baseDate.getDate() + index
);

const dayDate =
    formatPdfDate(baseDate);

  
  
const description =
    day.descriptionRichText?.trim()
        ? day.descriptionRichText
        : sanitizePdfText(
            day.description
          );

const preview =
    day.descriptionRichText?.trim()
        ? (() => {

            const wrapped =
                buildWrappedRichDescriptionLines(
                    pdf,
                    day.descriptionRichText
                );

            return {

                firstTwoHeight:
                    Math.min(
                        wrapped.lines.length,
                        2
                    ) *
                    wrapped.lineHeight,

                totalLines:
                    wrapped.lines.length,

                lines:
                    wrapped.lines,

                lineHeight:
                    wrapped.lineHeight

            };

        })()
        : measureDescriptionPreview(
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
    !!(
        day.descriptionRichText?.trim() ||
        sanitizePdfText(day.description)?.trim()
    );

const DAY_HEADER_HEIGHT = 14;
const CITY_HOTEL_MEAL_HEIGHT = 7;

// =========================================================
// DAY START OPENING PACKAGE
// =========================================================
//
// At the start of a Day, protect:
//
//   1. Day header
//   2. First 2 description lines
//   3. Actual City / Hotel row height
//
// This ONLY determines whether the Day itself should
// start on the current page.
//
// Once the Day has started, all remaining content follows
// the existing normal pagination logic.
// =========================================================


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


// ---------------------------------------------------------
// MEASURE CITY / HOTEL HEIGHT FOR DAY START
// ---------------------------------------------------------
//
// We must calculate the actual wrapped height here,
// rather than using a fixed estimate.
//
// This mirrors the layout used by drawCityHotelMeals().
// ---------------------------------------------------------

const startCityName =
    day.customCity?.trim()
        ? day.customCity.trim()
        : (day.city || "").trim();

const startHotelName =
    day.customHotel?.trim()
        ? day.customHotel.trim()
        : (day.hotel || "").trim();

const startHotelDisplay =
    startHotelName
        ? `${startHotelName}${
            day.hotelCategoryLabel?.trim()
                ? ` (${day.hotelCategoryLabel.trim()})`
                : ""
          }`
        : "";


const hasStartCity =
    !!startCityName;

const hasStartHotel =
    !!startHotelDisplay;


// ---------------------------------------------------------
// MEASURE LABELS
// ---------------------------------------------------------

pdf.setFont(
    "times",
    "bold"
);

const startCityLabel =
    "City:";

const startHotelLabel =
    "Hotel:";

const startCityLabelWidth =
    pdf.getTextWidth(
        startCityLabel
    );

const startHotelLabelWidth =
    pdf.getTextWidth(
        startHotelLabel
    );


// ---------------------------------------------------------
// MEASURE AVAILABLE WIDTHS
// ---------------------------------------------------------

const startPageRight =
    PAGE.width -
    PAGE.marginRight;

const startCityValueX =
    PAGE.marginLeft +
    7 +
    startCityLabelWidth +
    2.5;

const startHotelLabelX =
    PAGE.marginLeft +
    60;

const startHotelValueX =
    startHotelLabelX +
    7 +
    startHotelLabelWidth +
    2.5;


let startCityLines = [];

let startHotelLines = [];


// ---------------------------------------------------------
// CITY + HOTEL
// ---------------------------------------------------------

if (
    hasStartCity &&
    hasStartHotel
) {

    const cityAvailableWidth =
        startHotelLabelX -
        startCityValueX -
        8;

    startCityLines =
        pdf.splitTextToSize(
            startCityName,
            Math.max(
                cityAvailableWidth,
                35
            )
        );


    const hotelAvailableWidth =
        startPageRight -
        startHotelValueX;

    startHotelLines =
        pdf.splitTextToSize(
            startHotelDisplay,
            Math.max(
                hotelAvailableWidth,
                45
            )
        );

}


// ---------------------------------------------------------
// CITY ONLY
// ---------------------------------------------------------

else if (
    hasStartCity
) {

    const cityAvailableWidth =
        startPageRight -
        startCityValueX;

    startCityLines =
        pdf.splitTextToSize(
            startCityName,
            Math.max(
                cityAvailableWidth,
                50
            )
        );

}


// ---------------------------------------------------------
// HOTEL ONLY
// ---------------------------------------------------------

else if (
    hasStartHotel
) {

    const startHotelValueXSingle =
        PAGE.marginLeft +
        7 +
        startHotelLabelWidth +
        2.5;

    const hotelAvailableWidth =
        startPageRight -
        startHotelValueXSingle;

    startHotelLines =
        pdf.splitTextToSize(
            startHotelDisplay,
            Math.max(
                hotelAvailableWidth,
                50
            )
        );
}


// ---------------------------------------------------------
// ACTUAL CITY / HOTEL HEIGHT
// ---------------------------------------------------------

const startCityHotelLines =
    Math.max(
        startCityLines.length,
        startHotelLines.length,
        0
    );

const START_CITY_HOTEL_HEIGHT =
    startCityHotelLines > 0
        ? Math.max(
            6,
            startCityHotelLines *
                4.5 +
                2
          )
        : 0;


// ---------------------------------------------------------
// COMPLETE DAY OPENING PACKAGE
// ---------------------------------------------------------

const DAY_OPENING_REQUIRED =
    DAY_START_SPACE +
    START_CITY_HOTEL_HEIGHT;


// ---------------------------------------------------------
// DAY START PAGINATION
// ---------------------------------------------------------
//
// If the complete opening package does not fit,
// move the ENTIRE DAY start to the next page.
//
// This does NOT make the entire description atomic.
// After the Day starts, normal pagination resumes.
// ---------------------------------------------------------

cursorY =
    ensureSpace(
        cursorY,
        DAY_OPENING_REQUIRED
    );


cursorY = await drawDayHeader(
    pdf,
    day,
    dayDate,
    cursorY,
    ensureSpace,
    hexToRgb(
        quoteData?.pdfTheme?.sections?.dayHeader?.color ||
        "#2F8F91"
    )
);
    
// =========================================================
// DAY CONTENT ACCENT COLOR
// Derived from the Day Header color
// =========================================================

const dayHeaderColor =
    hexToRgb(
        quoteData?.pdfTheme?.sections?.dayHeader?.color ||
        "#2F8F91"
    );

const dayAccentColor = [
    Math.round(dayHeaderColor[0] * 0.82),
    Math.round(dayHeaderColor[1] * 0.82),
    Math.round(dayHeaderColor[2] * 0.82)
];


    // ---------- draw first two lines ----------

const firstTwo =
    preview.lines.slice(0, 2);

if (firstTwo.length > 0) {

    firstTwo.forEach((line) => {

        /*
         * Rich-text Day Description
         */
        if (Array.isArray(line)) {

            drawRichDescriptionPreviewLine(
                pdf,
                line,
                PAGE.marginLeft +
                    DESCRIPTION_INSET,
                cursorY
            );

        } else {

            /*
             * Existing plain-text compatibility
             */
            pdf.setFont(
                "times",
                "normal"
            );

            pdf.setFontSize(10);

            pdf.text(
                line,
                PAGE.marginLeft +
                    DESCRIPTION_INSET,
                cursorY
            );
        }

        cursorY +=
            preview.lineHeight;

    });

    pdf.setFont(
        "times",
        "normal"
    );
}


// ---------- remaining description ----------

if (preview.lines.length > 2) {

    /*
     * Rich-text Day Description
     */
    if (
        Array.isArray(preview.lines[2])
    ) {

        for (
            let i = 2;
            i < preview.lines.length;
            i++
        ) {

            const line =
                preview.lines[i];

            cursorY =
                ensureSpace(
                    cursorY,
                    preview.lineHeight
                );

            drawRichDescriptionPreviewLine(
                pdf,
                line,
                PAGE.marginLeft +
                    DESCRIPTION_INSET,
                cursorY
            );

            cursorY +=
                preview.lineHeight;
        }

    } else {

        /*
         * Existing plain-text renderer.
         * Leave this path unchanged.
         */
        cursorY =
            drawWrappedLines(
                pdf,
                preview.lines,
                2,
                PAGE.marginLeft +
                    DESCRIPTION_INSET,
                cursorY
            );
    }
}


// ---------- optional note ----------

const hasNote =
    day.noteEnabled &&
    (
        day.noteRichText?.trim() ||
        day.noteText?.trim()
    );

    // ---------- spacing: Description → Note ----------

if (
    hasDescription &&
    hasNote
) {
    

    cursorY =
        ensureSpace(
            cursorY,
            1
        );
}

if (hasNote) {

    if (
        day.noteRichText?.trim()
    ) {

       

        const noteLabel =
            "Note:";

        pdf.setFont(
            "times",
            "bold"
        );

        pdf.setFontSize(10);

        pdf.setTextColor(
            220,
            0,
            0
        );

        const noteLabelWidth =
            pdf.getTextWidth(
                noteLabel + " "
            );

        const noteLines =
            buildWrappedRichDescriptionLines(
                pdf,
                day.noteRichText,
                noteLabelWidth
            );

        const noteLineHeight =
            noteLines.lineHeight;

            
             cursorY =
    ensureSpace(
        cursorY,
        noteLines.lines.length *
            noteLineHeight +
            2
    );

        /*
 * NOTE LABEL
 */
pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(10);

pdf.setTextColor(
    220,
    0,
    0
);

pdf.text(
    noteLabel,
    PAGE.marginLeft +
        DESCRIPTION_INSET,
    cursorY
);

        /*
 * NOTE BODY — BLACK
 */
pdf.setTextColor(
    0,
    0,
    0
);




        /*
         * NOTE BODY
         */
        noteLines.lines.forEach(
    (line, lineIndex) => {

        const lineX =
            lineIndex === 0
                ? PAGE.marginLeft +
                  DESCRIPTION_INSET +
                  noteLabelWidth
                : PAGE.marginLeft +
                  DESCRIPTION_INSET;

        drawRichDescriptionPreviewLine(
            pdf,
            line,
            lineX,
            cursorY
        );

        /*
         * Advance only between lines.
         * Do NOT advance after the final line.
         */
        if (
            lineIndex <
            noteLines.lines.length - 1
        ) {
            cursorY +=
                noteLineHeight;
        }
    }
);



    // ---------- NOTE → CITY / HOTEL / MEAL ----------

cursorY += noteLineHeight;
cursorY += 2;



pdf.setTextColor(
            0,
            0,
            0
        );

    } else {

        /*
         * Existing plain-text Note behavior.
         */
        const noteLines =
            pdf.splitTextToSize(
                day.noteText,
                PAGE.width -
                PAGE.marginLeft -
                PAGE.marginRight -
                21
            );

        const noteHeight =
            6 +
            noteLines.length *
                4.3 +
            6;

        cursorY =
            ensureSpace(
                cursorY,
                noteHeight
            );

        cursorY =
            drawCalloutBox(
                pdf,
                "Note",
                day.noteText,
                cursorY
            );
    }
}


const cityNameForSpacing =
    day.customCity?.trim()
        ? day.customCity.trim()
        : (day.city || "").trim();

const hotelNameForSpacing =
    day.customHotel?.trim()
        ? day.customHotel.trim()
        : (day.hotel || "").trim();

const hotelDisplayForSpacing =
    hotelNameForSpacing
        ? `${hotelNameForSpacing}${
            day.hotelCategoryLabel?.trim()
                ? ` (${day.hotelCategoryLabel.trim()})`
                : ""
          }`
        : "";

const mealItemsForSpacing = [
    ...(day.meals || []),
    ...(day.customMeals || [])
]
    .map(item => String(item || "").trim())
    .filter(Boolean);

const customMealTextForSpacing =
    day.mealMode === "text"
        ? sanitizePdfText(
            day.mealText || ""
          ).trim()
        : "";

const hasCityHotelMeal =
    !!(
        cityNameForSpacing ||
        hotelDisplayForSpacing ||
        mealItemsForSpacing.length > 0 ||
        customMealTextForSpacing
    );


    const sightseeingItemsForSpacing = [
    ...(day.selectedSightseeing || [])
].filter(Boolean);

const hasSightseeing =
    day.sightseeingMode === "text"
        ? !!(
            day.sightseeingRichText?.trim() ||
            day.sightseeingText?.trim()
          )
        : sightseeingItemsForSpacing.length > 0;

const transferItemsForSpacing = [
    ...(day.transfers || []),
    ...(day.customTransfers || [])
].filter(Boolean);

const transferRichTextForSpacing =
    day.transferMode === "text"
        ? (
            day.transferRichText?.trim()
                ? day.transferRichText
                : ""
          )
        : "";

const transferTextForSpacing =
    day.transferMode === "text"
        ? sanitizePdfText(
            day.transferText || ""
          ).trim()
        : "";

const hasTransfers =
    day.transferMode === "text"
        ? !!(
            transferRichTextForSpacing ||
            transferTextForSpacing
          )
        : transferItemsForSpacing.length > 0;

    
// ---------- spacing before City / Hotel / Meal ----------
//
// When there is no Note, add a small breathing gap so the
// description does not visually collide with the details row.
// When a Note exists, drawCalloutBox() already provides the
// required vertical rhythm.





// ---------- Note → City / Hotel / Meal ----------
//
// drawCityHotelMeals() handles its own internal rhythm.
// Do not reserve an additional section-sized block here.

// ---------- City / Hotel / Meal ----------

if (
    hasDescription &&
    hasCityHotelMeal &&
    !hasNote
) {
    cursorY += 2;
}



cursorY = drawCityHotelMeals(
    pdf,
    day,
    cursorY,
    ensureSpace,
    index === itinerary.length - 1,
    dayAccentColor
);


// ---------- spacing: City / Hotel / Meal → Sightseeing ----------

if (
    hasCityHotelMeal &&
    hasSightseeing
) {
    cursorY += 2;
}


// ---------- Sightseeing start ----------
// Do not reserve a separate page-space block here.
// drawSightseeing() handles its own pagination line-by-line.


    // ---------- Sightseeing start ----------


        
   



   // ---------- Sightseeing ----------

cursorY = drawSightseeing(
    pdf,
    day,
    cursorY,
    ensureSpace,
    dayAccentColor
);

// ---------- spacing: Sightseeing → Transfers ----------

if (
    hasSightseeing &&
    hasTransfers
) {
    cursorY += 2;
}

// ---------- Transfers ----------

const transferResult =
    drawTransfers(
        pdf,
        day,
        cursorY,
        ensureSpace,
        dayAccentColor
    );

cursorY = transferResult.cursorY;

if (
    transferResult.remainingLines &&
    transferResult.remainingLines.length > 0
) {
    cursorY =
        drawWrappedLines(
            pdf,
            transferResult.remainingLines,
            0,
            transferResult.textX,
            cursorY
        );
}


// ---------- FINALIZE DAY PANEL ----------

pageState.activeDayPanel.endY =
    cursorY;

pageState.activeDayPanel.endPage =
    pageState.currentPage;

drawDayPanelBorder(
    pdf,
    pageState.activeDayPanel,
    contentBottomY
);

pageState.activeDayPanel = null;

// ---------- GAP BETWEEN DAYS ----------

cursorY += 8;
}


// =========================================================
// HOTEL USED
// =========================================================

cursorY =
    drawHotelUsed(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    hexToRgb(
        pdfSectionColors.hotelUsed
    )
);


// =========================================================
// COSTING
// =========================================================

cursorY = drawCostSummaryCompact(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    hexToRgb(
        pdfSectionColors.billing
    )
);


// ---------- GAP: BILLING → INCLUSIONS / EXCLUSIONS ----------

cursorY += 8;


cursorY = drawItineraryInclusionExclusion(
    pdf,
    quoteData,
    cursorY,
    ensureSpace,
    hexToRgb(
        pdfSectionColors.inclusions
    ),
    hexToRgb(
        pdfSectionColors.exclusions
    )
);





return cursorY;

} // ← END OF drawItineraryContent