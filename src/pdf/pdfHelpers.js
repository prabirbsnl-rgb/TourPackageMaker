
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

  pdf.setFont("times", "normal");
  pdf.setFontSize(FONT.body);

  const DESCRIPTION_INSET = 4;

  const maxWidth =
    PAGE.width -
    PAGE.marginLeft -
    PAGE.marginRight -
    (DESCRIPTION_INSET * 2);

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

export function buildWrappedPolicyLines(pdf, text) {

    pdf.setFont("times", "normal");
    pdf.setFontSize(FONT.body);

    const DESCRIPTION_INSET = 4;

    const maxWidth =
        PAGE.width -
        PAGE.marginLeft -
        PAGE.marginRight -
        (DESCRIPTION_INSET * 2);

    const paragraphs =
        String(text || "").split(/\r?\n/);

    const allLines = [];

    paragraphs.forEach((paragraph, paragraphIndex) => {

    const words = paragraph.split(/\s+/);

    let line = "";

    words.forEach((word) => {

        const test =
            line === ""
                ? word
                : line + " " + word;

        if (pdf.getTextWidth(test) <= maxWidth) {

            line = test;

        } else {

            if (line !== "") {

                allLines.push(line);

            }

            line = word;

        }

    });

    if (line !== "") {

        allLines.push(line);

    }

    // Preserve Enter ONLY between paragraphs
    if (paragraphIndex < paragraphs.length - 1) {

        allLines.push(null);

    }

});

    return {

        lines: allLines,

        lineHeight: 4.3

    };

}

export const DESCRIPTION_INSET = 4;

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
) 
{

   lines =
    Array.isArray(lines)
        ? lines
        : [String(lines || "")];

if (lines.length === 0) {
    return cursorY;
}


  pdf.setFont("times", "normal");
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

    // Blank line marker
    if (lines[index] === null) {

    cursorY += 1;   // was: lineHeight (4.3)

    index++;

    continue;

}

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

      console.log(
    "drawWrappedLines page break",
    {
        index,
        total: lines.length,
        cursorY
    }
);
      pdf.addPage();

      cursorY = PAGE.marginTop;

    }

  }

  pdf.setFont("times", "normal");

  return cursorY;

}

export function buildHangingLines(
    pdf,
    text,
    valueX,
    continuationX
) {

    text = (text || "").trim();

    if (!text) {
        return [];
    }

    pdf.setFont("times", "normal");
    pdf.setFontSize(FONT.body);

    const words = text.split(/\s+/);

    const firstWords = [];
    let firstLine = "";

    const firstWidth =
        PAGE.width -
        PAGE.marginRight -
        valueX;

    for (const word of words) {

        const candidate =
            firstWords.length
                ? firstWords.join(" ") + " " + word
                : word;

        if (
            pdf.getTextWidth(candidate) <= firstWidth
        ) {

            firstWords.push(word);
            firstLine = candidate;

        } else {

            break;

        }

    }

    const remainingWords =
        words.slice(firstWords.length);

    if (!remainingWords.length) {
        return [firstLine];
    }

    const remaining =
        pdf.splitTextToSize(
            remainingWords.join(" "),
            PAGE.width -
                PAGE.marginRight -
                continuationX
        );

    return [
        firstLine,
        ...remaining
    ];

}

export function drawHangingLines(
    pdf,
    label,
    lines,
    labelX,
    valueX,
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

    if (wrapped.length === 0) {
        return cursorY + 2;
    }

    // First line beside label
    pdf.text(
        wrapped[0],
        valueX,
        cursorY
    );

    cursorY += 5;

    // Remaining lines start from label column
    if (wrapped.length > 1) {

        cursorY = drawWrappedLines(
            pdf,
            wrapped.slice(1),
            0,
            labelX,
            cursorY
        );

    }

    return cursorY + 2;

}

export function drawHangingParagraph(
    pdf,
    text,
    valueX,
    continuationX,
    cursorY
)
{

    text = (text || "").trim();

    console.log("drawHangingParagraph START", {
    cursorY,
    preview: text.substring(0, 25)
});

    if (!text) {
        return cursorY;
    }

    const words = text.split(/\s+/);

    const firstWords = [];
    let firstLine = "";

    // Maximum width available beside the label
    const firstWidth =
        PAGE.width -
        PAGE.marginRight -
        valueX;

    // Find the largest first line that fits
    for (const word of words) {

        const candidate =
            firstWords.length
                ? firstWords.join(" ") + " " + word
                : word;

        if (
            pdf.getTextWidth(candidate) <= firstWidth
        ) {

            firstWords.push(word);
            firstLine = candidate;

        } else {

            break;

        }

    }

    // Remaining words
    const remainingWords =
        words.slice(firstWords.length);

    // Draw first line
    pdf.text(
        firstLine,
        valueX,
        cursorY
    );

    cursorY += 5;

    if (remainingWords.length) {

        const remainingText =
            remainingWords.join(" ");

        const wrapped =
            pdf.splitTextToSize(
                remainingText,
                PAGE.width -
                PAGE.marginRight -
                continuationX
            );

        cursorY = drawWrappedLines(
            pdf,
            wrapped,
            0,
            continuationX,
            cursorY
        );

    }

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

const ROW_TEXT_Y_OFFSET = 0.8;

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
  pdf.setFontSize(10);

  const colonX = PAGE.marginLeft + 94;
  const valueX = PAGE.marginLeft + 99;

  const LABEL_X =
    PAGE.marginLeft + RIBBON.leftPadding;

pdf.text(
    label,
    LABEL_X,
    y + ROW_TEXT_Y_OFFSET
);

  pdf.text(
    ":",
    colonX,
    y + ROW_TEXT_Y_OFFSET
);
  pdf.text(
    value,
    valueX,
    y + ROW_TEXT_Y_OFFSET
);

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
  pdf.setFontSize(11);

  const colonX = PAGE.marginLeft + 94;
  const valueX = PAGE.marginLeft + 99;

  const LABEL_X =
    PAGE.marginLeft + RIBBON.leftPadding;

pdf.text(
    label,
    LABEL_X,
    y + ROW_TEXT_Y_OFFSET
);

  pdf.text(
    ":",
    colonX,
    y + ROW_TEXT_Y_OFFSET
);

  pdf.text(
    value,
    valueX,
    y + ROW_TEXT_Y_OFFSET
);

  return y + 7;

}

export function sanitizePdfText(text) {

  return String(text || "")

    // Replace non-breaking spaces
    .replace(/\u00A0/g, " ")

    // Remove zero-width Unicode characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // Convert line breaks to spaces
    .replace(/\r?\n/g, " ")

    // Replace Rupee symbol
    .replace(/₹/g, "Rs. ")

    // Collapse multiple spaces
    .replace(/\s+/g, " ")

    .trim();

}

export function drawCalloutBox(
    pdf,
    label,
    text,
    cursorY
) {

    text = sanitizePdfText(text);
   

    const left = PAGE.marginLeft;

    const width =
        PAGE.width -
        PAGE.marginLeft -
        PAGE.marginRight;

    
const lineHeight = 4.3;

// Horizontal padding

// Vertical padding




    // ---------- wrap text ----------

   

    const LABEL_GAP = 3;

     pdf.setFont("times", "bold");
     pdf.setFontSize(10);

const labelWidth =
    pdf.getTextWidth(label + ":");

const textWidth =
    width -
    labelWidth -
    LABEL_GAP;

pdf.setFont("times", "normal");
pdf.setFontSize(10);

    const wrapped =
        pdf.splitTextToSize(
            text,
            textWidth
        );

   const contentHeight =
    wrapped.length * lineHeight;

    // ---------- label & text ----------

// Draw label first to measure its width

pdf.setFont("times", "bold");
pdf.setFontSize(10);

const labelText = label + ":";

const NOTE_INDENT = 4;   // mm

const labelX =
    left + NOTE_INDENT;

const textX =
    labelX +
    labelWidth +
    LABEL_GAP;

// -------- Vertical positioning --------

const baselineY =
    cursorY + 4.5;


// -------- Draw label --------

pdf.setFont("times","bold");
pdf.setTextColor(190,0,0);

pdf.text(
    labelText,
    labelX,
    baselineY
);

// -------- Draw note text --------

pdf.setFont("times","normal");
pdf.setTextColor(0,0,0);

pdf.text(
    wrapped,
    textX,
    baselineY
);

    return cursorY +
    contentHeight +
    6;

}

export function drawBillingCard(
    pdf,
    title,
    x,
    y,
    width,
    height
) {

    const radius = 3;

    // ==========================
    // BODY BACKGROUND (no border)
    // ==========================

    pdf.setFillColor(248,250,252);

    pdf.roundedRect(
        x,
        y,
        width,
        height,
        radius,
        radius,
        "F"
    );

    // ==========================
    // HEADER BACKGROUND
    // ==========================

    pdf.setFillColor(...COLORS.ribbon);

    pdf.roundedRect(
    x,
    y,
    width,
    RIBBON.height + radius,
    radius,
    radius,
    "F"
);

    // ==========================
    // BORDER LAST
    // ==========================

    pdf.setDrawColor(220,226,235);

    pdf.roundedRect(
        x,
        y,
        width,
        height,
        radius,
        radius,
        "S"
    );

    // ==========================
    // TITLE
    // ==========================

    pdf.setFont("times","bold");
    pdf.setFontSize(RIBBON.titleFont);
    pdf.setTextColor(0,0,0);

    const TITLE_Y_OFFSET = 1.5;

    pdf.text(
    title,
    x + RIBBON.leftPadding,
    y + RIBBON.topPadding + TITLE_Y_OFFSET
);

}