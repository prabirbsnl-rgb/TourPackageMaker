import {
  PAGE,
  COLORS,
  FONT,
  SPACING,
  RIBBON,
  LAYOUT
} from "./pdfTheme";
/**
 * Draw grey ribbon
 */
export function drawRibbon(pdf, text, y, x = PAGE.marginLeft) {
  pdf.setFillColor(COLORS.ribbonGrey);
  pdf.rect(x, y, pdf.getTextWidth(text) + 8, 8, "F");

  pdf.setFont("times", "bold");
  pdf.setFontSize(FONT.body);

  pdf.setTextColor(20, 20, 20);

  pdf.text(text, x + 4, y + 5.5);

  return 10;
}

/**
 * Draw full-width section heading
 */
export function drawSectionHeading(pdf, title, y) {

  // More space after blue divider
 y += SPACING.sectionGap;
  // Thin grey ribbon
  pdf.setFillColor(...COLORS.ribbon);

  console.log("drawSectionHeading:", {
  title,
  y,
  marginLeft: PAGE.marginLeft,
  pageWidth: PAGE.width,
  marginRight: PAGE.marginRight,
  ribbonHeight: RIBBON.height,
});

  pdf.rect(
    PAGE.marginLeft,
    y,
    PAGE.width - PAGE.marginLeft - PAGE.marginRight,
    RIBBON.height,
    "F"
  );

  // Header text
  pdf.setFont("times", "bold");   // closer to Word
  pdf.setFontSize(RIBBON.titleFont);         // smaller like Word
  pdf.setTextColor(0, 0, 0);

  pdf.text(
    title,
    PAGE.marginLeft +RIBBON.leftPadding,
    y +  RIBBON.topPadding     // vertically centered in 6 mm ribbon
  );

  pdf.setTextColor(0, 0, 0);

  // Leave space before first row
  return y + SPACING.ribbonGap;
}

/**
 * Draw label : value
 */
export function drawLabelValue(pdf, label, value, y) {

  pdf.setFont("times", "bold");
  pdf.setFontSize(FONT.body);

  // Label
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("times", "bold");
  pdf.setFontSize(FONT.body);

  pdf.text(label, PAGE.marginLeft + 2, y);

  // Colon
  pdf.text(":", PAGE.marginLeft + 32, y);

  // Value
   pdf.setTextColor(0, 0, 0);
  pdf.setFont("times", "normal");

  pdf.text(
    String(value || "-"),
    PAGE.marginLeft + 36,
    y
  );

  // Move to next row
  return y + 7;

}



export function drawSummaryRow3(
  pdf,
  l1, v1,
  l2, v2,
  l3, v3,
  y
) {

  pdf.setFont("times", "bold");
  pdf.setFontSize(10);

  // ---------- COLUMN 1 ----------
  pdf.text(String(l1 || ""), LAYOUT.col1LabelX, y);
  pdf.text(":", LAYOUT.col1ColonX, y);

  pdf.setFont("times", "normal");
  pdf.text(String(v1 || "-"), LAYOUT.col1ValueX, y);

  // ---------- COLUMN 2 ----------
  pdf.setFont("times", "bold");
  pdf.text(String(l2 || ""), LAYOUT.col2LabelX, y);
  pdf.text(":", LAYOUT.col2ColonX, y);

  pdf.setFont("times", "normal");
  pdf.text(String(v2 || "-"), LAYOUT.col2ValueX, y);

  // ---------- COLUMN 3 ----------
  pdf.setFont("times", "bold");
  pdf.text(String(l3 || ""), LAYOUT.col3LabelX, y);
  pdf.text(":", LAYOUT.col3ColonX, y);

  pdf.setFont("times", "normal");

  let value = String(v3 || "-");

  if (l3 === "Email" && value.length > 26) {
    value = value.substring(0, 26) + "...";
  }

  pdf.text(value, LAYOUT.col3ValueX, y);

  return y + (SPACING.rowGapCurrent || SPACING.rowGap);
}

export function drawSummaryRow2(
  pdf,
  l1, v1,
  l2, v2,
  y
) {

  pdf.setFont("times", "bold");
  pdf.setFontSize(10);

  // ---------- COLUMN 1 ----------
  pdf.text(
    String(l1 || ""),
    LAYOUT.col1LabelX,
    y
  );

  pdf.text(
    ":",
    LAYOUT.col1ColonX,
    y
  );

  pdf.setFont("times", "normal");

  pdf.text(
    String(v1 || "-"),
    LAYOUT.col1ValueX,
    y
  );

  // ---------- COLUMN 2 ----------
  pdf.setFont("times", "bold");

  pdf.text(
    String(l2 || ""),
    LAYOUT.col2LabelX,
    y
  );

  pdf.text(
    ":",
    LAYOUT.col2ColonX,
    y
  );

  pdf.setFont("times", "normal");

  pdf.text(
    String(v2 || "-"),
    LAYOUT.col2ValueX,
    y
  );

  return y + (SPACING.rowGapCurrent || SPACING.rowGap);
}

export function buildWrappedDescriptionLines(pdf, text) {

  pdf.setFont("times", "italic");
  pdf.setFontSize(FONT.body);

  const maxWidth =
    PAGE.width -
    PAGE.marginLeft -
    PAGE.marginRight;

  const words = String(text || "").split(/\s+/);

  const lines = [];
  let line = "";

  words.forEach((word) => {

    const testLine =
      line === ""
        ? word
        : line + " " + word;

    if (
      pdf.getTextWidth(testLine) <= maxWidth
    ) {

      line = testLine;

    } else {

      if (line !== "") {
        lines.push(line);
      }

      line = word;

    }

  });

  if (line !== "") {
    lines.push(line);
  }

 return {
    lines,
    lineHeight: 4.3
};

}


export function measureDescriptionPreview(pdf, text) {

    const wrapped =
        buildWrappedDescriptionLines(
            pdf,
            text
        );

    return {

        firstTwoHeight:
            Math.min(
                wrapped.lines.length,
                2
            ) * wrapped.lineHeight,

        totalLines:
            wrapped.lines.length,

        lines:
            wrapped.lines,

        lineHeight:
            wrapped.lineHeight

    };

}

export function drawDescription(
  pdf,
  text,
  y,
  wrappedLines = null,
  startLine = 0
) {
  pdf.setFont("times", "italic");
  pdf.setFontSize(FONT.body);

  const wrapped =
  wrappedLines
    ? {
        lines: wrappedLines,
        lineHeight: 4.3
      }
    : buildWrappedDescriptionLines(
        pdf,
        text
      );

const lines =
  wrapped.lines.slice(startLine);

const lineHeight =
  wrapped.lineHeight;

  
   // --------------------------
  // NEW DRAWING SECTION
  // --------------------------

  let currentY = y;

  lines.forEach((lineText) => {

    // bottom reached?
    if (
      currentY + lineHeight >
      PAGE.height - PAGE.marginBottom
    ) {

      pdf.addPage();

      currentY = PAGE.marginTop;

      // continuation header will come here later
    }

   pdf.text(
  lineText,
  PAGE.marginLeft,
  currentY
);

    currentY += lineHeight;

  });

  pdf.setFont("times", "normal");

  return currentY - y + 2;

}

export function drawWrappedLines(
  pdf,
  lines,
  startIndex,
   startX,
  cursorY
) {

   lines =
    Array.isArray(lines)
        ? lines
        : [String(lines || "")];

if (lines.length === 0) {
    return cursorY;
}


  pdf.setFont("times", "italic");
  pdf.setFontSize(FONT.body);

  const lineHeight = 4.3;
  const ADAPTIVE_GAP = 6;

  let index = startIndex;

  while (index < lines.length) {

    // Space available on THIS page
    const usableHeight =
      PAGE.height -
      PAGE.marginBottom -
      ADAPTIVE_GAP -
      cursorY;

    // Maximum whole lines that fit
    let fitCount =
      Math.floor(
        usableHeight / lineHeight
      );

    // If nothing fits, start new page
    if (fitCount <= 0) {

      pdf.addPage();

      cursorY = PAGE.marginTop;

      continue;

    }

    // Don't exceed remaining lines
    fitCount = Math.min(
      fitCount,
      lines.length - index
    );

    // Draw exactly the lines that fit
    for (let j = 0; j < fitCount; j++) {

      pdf.text(
    lines[index],
    startX,
    cursorY
);

      cursorY += lineHeight;

      index++;

    }

    // More lines remain?
    if (index < lines.length) {

      pdf.addPage();

      cursorY = PAGE.marginTop;

    }

  }

  pdf.setFont("times", "normal");

  return cursorY + 2;

}

export function drawLabeledWrappedParagraph(
    pdf,
    label,
    lines,
    labelX,
    textX,
    cursorY
) {

    const wrapped =
        Array.isArray(lines)
            ? lines
            : [String(lines || "-")];

    pdf.setFont("times", "bold");
    pdf.setFontSize(10);

    pdf.text(
        label,
        labelX,
        cursorY
    );

    pdf.setFont("times", "normal");

    pdf.text(
        wrapped[0],
        textX,
        cursorY
    );

    return {

        cursorY: cursorY + 4,

        remainingLines: wrapped.slice(1),

        textX

    };

}

export function drawGreyCostRow(pdf, label, value, y) {

  pdf.setFillColor(238,241,244);

  pdf.rect(
    PAGE.marginLeft,
    y - 4,
    PAGE.width - PAGE.marginLeft - PAGE.marginRight,
    8,
    "F"
  );

  pdf.setFont("times","bold");
  pdf.setFontSize(10);

  // Label
  pdf.text(
    label,
    PAGE.marginLeft + 3,
    y + 1
  );

 
  // Right-aligned value
  // Fixed value column (like Word)
const colonX = PAGE.marginLeft + 94;
const valueX = PAGE.marginLeft + 99;

// Colon
pdf.text(":", colonX, y + 1);

// Value
pdf.text(
    value,
    valueX,
    y + 1
);

  return y + 9;

}
export function drawBlueCostRow(pdf, label, value, y) {

  pdf.setFillColor(220, 238, 255);

  pdf.rect(
    PAGE.marginLeft,
    y - 4,
    PAGE.width - PAGE.marginLeft - PAGE.marginRight,
    9,
    "F"
  );

  pdf.setFont("times", "bold");
  pdf.setFontSize(10);

// Label
  pdf.text(label, PAGE.marginLeft + 3, y + 1);

  

// Value
 // Fixed value column (like Word)
const colonX = PAGE.marginLeft + 94;
const valueX = PAGE.marginLeft + 99;

// Colon
pdf.text(":", colonX, y + 1);

// Value
pdf.text(
    value,
    valueX,
    y + 1
);
  return y + 10;
}

export function drawGreyCostRowCompact(pdf, label, value, y) {

  pdf.setFillColor(238,241,244);

  pdf.rect(
    PAGE.marginLeft,
    y - 3,
    PAGE.width - PAGE.marginLeft - PAGE.marginRight,
    6,
    "F"
  );

  pdf.setFont("times","bold");
  pdf.setFontSize(9);

  const colonX = PAGE.marginLeft + 94;
  const valueX = PAGE.marginLeft + 99;

  pdf.text(label, PAGE.marginLeft + 3, y);

  pdf.text(":", colonX, y);

  pdf.text(value, valueX, y);

  return y + 7;

}
export function drawBlueCostRowCompact(pdf, label, value, y) {

  pdf.setFillColor(220,238,255);

  pdf.rect(
    PAGE.marginLeft,
    y - 3,
    PAGE.width - PAGE.marginLeft - PAGE.marginRight,
    6,
    "F"
  );

  pdf.setFont("times","bold");
  pdf.setFontSize(9);

  const colonX = PAGE.marginLeft + 94;
  const valueX = PAGE.marginLeft + 99;

  pdf.text(label, PAGE.marginLeft + 3, y);

  pdf.text(":", colonX, y);

  pdf.text(value, valueX, y);

  return y + 7;

}