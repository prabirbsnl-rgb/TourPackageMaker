
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



export function drawSectionHeading(
  pdf,
  title,
  y,
  sectionColor
) {

  // More space after blue divider
  y += SPACING.sectionGap;

  const radius = 3;

  const ribbonWidth =
    PAGE.width -
    PAGE.marginLeft -
    PAGE.marginRight;

  // ==========================
  // SECTION RIBBON COLOR
  // ==========================


  console.log(
  "DRAW SECTION HEADING:",
  title,
  sectionColor
);


 // ==========================
// SECTION RIBBON COLOR
// ==========================

if (
  typeof sectionColor === "string" &&
  /^#[0-9A-Fa-f]{6}$/.test(sectionColor)
) {

  const hex =
    sectionColor.substring(1);

  const r =
    parseInt(
      hex.substring(0, 2),
      16
    );

  const g =
    parseInt(
      hex.substring(2, 4),
      16
    );

  const b =
    parseInt(
      hex.substring(4, 6),
      16
    );

  pdf.setFillColor(
    r,
    g,
    b
  );

} else if (
  Array.isArray(sectionColor)
) {

  pdf.setFillColor(
    ...sectionColor
  );

} else {

  // Existing sections that pass
  // ensureSpace or another function
  // continue using the original default.

  pdf.setFillColor(
    ...COLORS.sectionHeader
  );

}

  // ==========================
  // ROUNDED SECTION RIBBON
  // ==========================

  pdf.roundedRect(
    PAGE.marginLeft,
    y,
    ribbonWidth,
    RIBBON.height,
    radius,
    radius,
    "F"
  );

  pdf.rect(
    PAGE.marginLeft,
    y + RIBBON.height - radius,
    ribbonWidth,
    radius,
    "F"
  );

  // ==========================
  // HEADER TEXT
  // ==========================

  pdf.setFont(
    "times",
    "bold"
  );

  pdf.setFontSize(
    RIBBON.titleFont
  );

  pdf.setTextColor(
    255,
    255,
    255
  );

  pdf.text(
    title,
    PAGE.marginLeft +
      RIBBON.leftPadding,
    y +
      RIBBON.topPadding
  );

  pdf.setTextColor(
    0,
    0,
    0
  );

  // Leave space before first row

  return (
    y +
    SPACING.ribbonGap
  );
}


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

  pdf.setFontSize(10);

  // =================================
  // COLUMN 1
  // =================================

  pdf.setFont("times", "bold");

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
    LAYOUT.col1ColonX + 3,
    y
  );

  // =================================
  // COLUMN 2
  // =================================

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
    LAYOUT.col2ColonX + 3,
    y
  );

  // =================================
  // COLUMN 3
  // =================================

  pdf.setFont("times", "bold");

  pdf.text(
    String(l3 || ""),
    LAYOUT.col3LabelX,
    y
  );

  pdf.text(
    ":",
    LAYOUT.col3ColonX,
    y
  );

  const value =
  String(v3 || "-");

pdf.setFont("times", "normal");

// ---------------------------------
// EMAIL — FIT TO AVAILABLE WIDTH
// ---------------------------------

if (l3 === "Email") {

  const availableWidth =
    PAGE.width -
    PAGE.marginRight -
    (LAYOUT.col3ColonX + 3);

  let fontSize = 10;

  pdf.setFontSize(fontSize);

  while (
    pdf.getTextWidth(value) >
      availableWidth &&
    fontSize > 7.5
  ) {
    fontSize -= 0.5;
    pdf.setFontSize(fontSize);
  }

} else {

  pdf.setFontSize(10);
}

pdf.text(
  value,
  LAYOUT.col3ColonX + 3,
  y
);

  return y +
    (SPACING.rowGapCurrent || SPACING.rowGap);
}




export function drawSummaryRow2(
  pdf,
  l1, v1,
  l2, v2,
  y
) {

  pdf.setFontSize(10);

  // =================================
  // COLUMN 1
  // =================================

  pdf.setFont("times", "bold");

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
    LAYOUT.col1ColonX + 3,
    y
  );

  // =================================
  // COLUMN 2
  // =================================

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
    LAYOUT.col2ColonX + 3,
    y
  );

  return y +
    (SPACING.rowGapCurrent || SPACING.rowGap);
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

export function buildWrappedRichDescriptionLines(
    pdf,
    html,
    firstLineReservedWidth = 0,
    availableWidth = null
) {

    pdf.setFont(
        "times",
        "normal"
    );

    pdf.setFontSize(
        FONT.body
    );

    const DESCRIPTION_INSET = 4;

    const maxWidth =
    availableWidth !== null
        ? availableWidth
        : PAGE.width -
          PAGE.marginLeft -
          PAGE.marginRight -
          (DESCRIPTION_INSET * 2);
          
        const firstLineMaxWidth =
    maxWidth -
    firstLineReservedWidth;

    const lineHeight = 4.3;

    /*
     * -------------------------------------------------------
     * PARSE Tiptap HTML
     * -------------------------------------------------------
     */

    const container =
        document.createElement("div");

    container.innerHTML =
        html || "";

    /*
     * Each run contains text + formatting.
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

            if (
                node.nodeValue
            ) {

                runs.push({
    text:
        node.nodeValue,

    bold:
        !!style.bold,

    italic:
        !!style.italic,

    underline:
        !!style.underline,

    color:
        style.color || null
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
        if (
            tag === "br"
        ) {

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

       /*
 * Paragraphs represent explicit
 * line breaks.
 */
if (
    tag === "p" ||
    tag === "div"
) {

    runs.push({
        text: "\n",
        bold: false,
        italic: false,
        underline: false,
        color: style.color || null
    });

}

};

    container.childNodes.forEach(
        node =>
            walk(node)
    );

   
    /*
     * -------------------------------------------------------
     * FONT HELPER
     * -------------------------------------------------------
     */

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

        pdf.setFontSize(
            FONT.body
        );
    };

    /*
     * -------------------------------------------------------
     * BUILD VISUAL LINES
     * -------------------------------------------------------
     */

    const lines = [];

    let currentLine = [];

    let currentWidth = 0;

    const pushCurrentLine = () => {

        if (
            currentLine.length > 0
        ) {

            lines.push(
                currentLine
            );

        } else {

            lines.push([]);
        }

        currentLine = [];

        currentWidth = 0;
    };

    for (
        const run of runs
    ) {

        /*
         * Preserve explicit line breaks.
         */
        const parts =
            String(
                run.text || ""
            ).split("\n");

        for (
            let partIndex = 0;
            partIndex < parts.length;
            partIndex++
        ) {

            const part =
                parts[partIndex];

            /*
             * Process words while retaining
             * the formatting run.
             */
            const words =
                part.split(/(\s+)/);

            for (
                const word of words
            ) {

                if (!word) {
                    continue;
                }

                setRunFont(run);

                const wordWidth =
                    pdf.getTextWidth(
                        word
                    );

                /*
                 * Whitespace.
                 */
                if (
                    /^\s+$/.test(word)
                ) {

                    if (
                        currentLine.length === 0
                    ) {
                        continue;
                    }

                    if (
                        currentWidth +
                        wordWidth <=
                        maxWidth
                    ) {

                        currentLine.push({
                            ...run,
                            text: word
                        });

                        currentWidth +=
                            wordWidth;
                    }

                    continue;
                }

                /*
                 * Start a new line if the word
                 * doesn't fit.
                 */
                const currentMaxWidth =
    lines.length === 0
        ? firstLineMaxWidth
        : maxWidth;

if (
    currentWidth > 0 &&
    currentWidth +
    wordWidth >
    currentMaxWidth
) {
    pushCurrentLine();
}

                /*
                 * Very long word.
                 */
                if (
                    wordWidth >
                    maxWidth
                ) {

                    const chunks =
                        pdf.splitTextToSize(
                            word,
                            maxWidth
                        );

                    chunks.forEach(
                        (
                            chunk,
                            chunkIndex
                        ) => {

                            if (
                                chunkIndex > 0
                            ) {
                                pushCurrentLine();
                            }

                            currentLine.push({
                                ...run,
                                text: chunk
                            });

                            setRunFont(run);

                            currentWidth =
                                pdf.getTextWidth(
                                    chunk
                                );
                        }
                    );

                    continue;
                }

                currentLine.push({
                    ...run,
                    text: word
                });

                currentWidth +=
                    wordWidth;
            }

            /*
             * Explicit newline.
             */
            if (
                partIndex <
                parts.length - 1
            ) {

                pushCurrentLine();
            }
        }
    }

    if (
        currentLine.length > 0
    ) {

        pushCurrentLine();
    }


    /*
 * Remove trailing empty visual lines.
 *
 * Word/Tiptap content can produce an empty final
 * line from a trailing paragraph break. It should
 * not consume Note vertical space.
 */
while (
    lines.length > 0 &&
    lines[lines.length - 1].length === 0
) {
    lines.pop();
}

    /*
     * -------------------------------------------------------
     * RETURN SAME STRUCTURE AS THE EXISTING FUNCTION
     * -------------------------------------------------------
     */

    return {

        lines,

        lineHeight

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
    cursorY,
    iconType = "transfer",
    labelColor
) {

    const wrapped =
        Array.isArray(lines)
            ? lines
            : [String(lines || "-")];

           

    pdf.setFont(
    "times",
    "bold"
);

pdf.setFontSize(10);

pdf.setTextColor(
    ...(labelColor || COLORS.contentLabel)
);

pdf.text(
    label,
    labelX + 6,
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



export function drawGreyCostRowCompact(
  pdf,
  label,
  value,
  y,
  rowColors
) {

  pdf.setFont("NotoSans", "normal");
  pdf.setFontSize(10);

  const colonX = PAGE.marginLeft + 94;
  const valueX = PAGE.marginLeft + 99;

  const LABEL_X =
    PAGE.marginLeft + RIBBON.leftPadding;

  // Space available before the fixed colon
  const LABEL_MAX_WIDTH =
    colonX - LABEL_X - 4;

  const labelWidth =
    pdf.getTextWidth(label);

  // --------------------------------
  // NORMAL SINGLE-LINE ROW
  // --------------------------------

  if (labelWidth <= LABEL_MAX_WIDTH) {

    pdf.setFillColor(
  ...(rowColors?.background || [246, 241, 236])
);

    pdf.rect(
  PAGE.marginLeft,
  y - 3,
  PAGE.width - PAGE.marginLeft - PAGE.marginRight,
  6,
  "F"
);

    // Subtle row divider
pdf.setDrawColor(
  ...(rowColors?.border || [220, 230, 224])
);

pdf.setLineWidth(0.25);

pdf.line(
  PAGE.marginLeft,
  y + 3,
  PAGE.width - PAGE.marginRight,
  y + 3
);

    pdf.setFont("NotoSans", "bold");

    pdf.setFontSize(10);

    pdf.setTextColor(
  ...(rowColors?.text || [62, 48, 48])
);

    pdf.text(
      label,
      LABEL_X,
      y + ROW_TEXT_Y_OFFSET
    );


    pdf.setFont("NotoSans", "normal");


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

  // --------------------------------
  // LONG LABEL — TWO-LINE ROW
  // --------------------------------

  const wrappedLabel =
    pdf.splitTextToSize(
      label,
      LABEL_MAX_WIDTH
    );

  // Maximum two lines for billing rows
  const lines =
    wrappedLabel.slice(0, 2);

  const rowHeight = 12;

 pdf.setFillColor(
  ...(rowColors?.backgroundAlt || [244, 248, 245])
);

 pdf.rect(
  PAGE.marginLeft,
  y - 3,
  PAGE.width - PAGE.marginLeft - PAGE.marginRight,
  rowHeight,
  "F"
);

  // Subtle divider below two-line row
pdf.setDrawColor(
  ...(rowColors?.border || [220, 230, 224])
);

pdf.setLineWidth(0.25);

pdf.line(
  PAGE.marginLeft,
  y + rowHeight - 3,
  PAGE.width - PAGE.marginRight,
  y + rowHeight - 3
);

  pdf.setFont("NotoSans", "bold");
pdf.setFontSize(10);
pdf.setTextColor(
  ...(rowColors?.text || [38, 58, 53])
);

  const line1Y = y + 1;
  const line2Y = y + 5.5;
  const centerY = y + 3.25;

  pdf.text(
    lines[0],
    LABEL_X,
    line1Y
  );

  if (lines[1]) {
    pdf.text(
      lines[1],
      LABEL_X,
      line2Y
    );
  }

  pdf.setFont("NotoSans", "normal");

  // Colon and amount remain in the SAME fixed columns
  pdf.text(
    ":",
    colonX,
    centerY
  );

  pdf.text(
    value,
    valueX,
    centerY
  );

  return y + rowHeight + 1;
}




export function drawBlueCostRowCompact(
  pdf,
  label,
  value,
  y,
  rowColors
) {

  // ==========================
  // FIXED COLUMN POSITIONS
  // ==========================

  const colonX =
    PAGE.marginLeft + 94;

  const valueX =
    PAGE.marginLeft + 99;

  const LABEL_X =
    PAGE.marginLeft + RIBBON.leftPadding;


  // ==========================
  // LABEL WRAPPING
  // ==========================

  pdf.setFont("times", "bold");
  pdf.setFontSize(10.5);

  const labelMaxWidth =
    colonX - LABEL_X - 4;

  const labelLines =
    pdf.splitTextToSize(
      String(label || ""),
      labelMaxWidth
    );


  // ==========================
  // LINE / ROW HEIGHT
  // ==========================

  const lineHeight = 4.8;

  const rowHeight =
    Math.max(
      6,
      labelLines.length * lineHeight + 1.5
    );


  // ==========================
  // PREMIUM TOTAL ROW
  // ==========================

  pdf.setFillColor(237, 224, 217);

  pdf.rect(
    PAGE.marginLeft,
    y - 3,
    PAGE.width -
      PAGE.marginLeft -
      PAGE.marginRight,
    rowHeight,
    "F"
  );


  // ==========================
  // LABEL — DRAW EACH LINE
  // ==========================

  pdf.setFont("times", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(40, 96, 82);

  labelLines.forEach(
    (line, index) => {

      pdf.text(
        line,
        LABEL_X,
        y +
          ROW_TEXT_Y_OFFSET +
          (index * lineHeight)
      );

    }
  );


  // ==========================
  // COLON + VALUE
  // KEEP FIXED
  // ==========================

  const valueY =
    y +
    (rowHeight - 6) / 2 +
    ROW_TEXT_Y_OFFSET;


  pdf.setFont("NotoSans", "normal");
  pdf.setFontSize(10.5);

  // Colon

  pdf.setTextColor(40, 40, 40);

  pdf.text(
    ":",
    colonX,
    valueY
  );


  // Amount

  pdf.setTextColor(107, 38, 54);

  pdf.text(
    value,
    valueX,
    valueY
  );


  // ==========================
  // NEXT ROW POSITION
  // ==========================

  return y + rowHeight;

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
    height,
    sectionColor
) {

    const radius = 3;

    // ==========================
    // PREMIUM EMERALD PALETTE
    // ==========================

    const HEADER_COLOR =
    Array.isArray(sectionColor)
        ? sectionColor
        : [107, 38, 54];

const mixWithWhite = (color, amount) => [
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

const BODY_COLOR =
    mixWithWhite(
        HEADER_COLOR,
        0.94
    );

const BORDER_COLOR =
    mixWithWhite(
        HEADER_COLOR,
        0.62
    );


    // ==========================
    // BODY BACKGROUND
    // ==========================

  pdf.setFillColor(
    ...BODY_COLOR
);

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

  pdf.setFillColor(
    ...HEADER_COLOR
);

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
    // BORDER
    // ==========================

    pdf.setDrawColor(
    ...BORDER_COLOR
);

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

    pdf.setFont("times", "bold");
    pdf.setFontSize(RIBBON.titleFont);
    pdf.setTextColor(255, 255, 255);

    const TITLE_Y_OFFSET = 1.5;

    pdf.text(
        title,
        x + RIBBON.leftPadding,
        y + RIBBON.topPadding + TITLE_Y_OFFSET
    );
}