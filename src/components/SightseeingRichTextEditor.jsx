

import { useRef } from "react";

import {
  useState
} from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";


export default function SightseeingRichTextEditor({
  value = "",
  onChange,
  preserveLineBreaks = false,
  compact = false,
  onFocus,
  active = false
}) {


  const [showColorPalette, setShowColorPalette] =
  useState(false);

  const userInteracted =
    useRef(false);

  const editor = useEditor({

   extensions: [
  StarterKit,
  Underline,
  TextStyle,
  Color
],

    content: value,

    autofocus: false,

     onFocus: ({ editor }) => {

  if (onFocus) {
    onFocus(editor);
  }

},

    onUpdate: ({ editor }) => {

  if (onChange) {

    let html =
      editor.getHTML();

    /*
     * -------------------------------------------------------
     * NORMALIZE LEGACY WORD / PDF BULLET
     *
     * Some Word/PDF sources provide bullets as U+F0B7
     * instead of standard Unicode U+2022.
     *
     * Tiptap accepts the character correctly, but browsers
     * may display it as an unknown square.
     *
     * Convert it only when exporting the editor HTML.
     * -------------------------------------------------------
     */

    html =
      html.split(
        String.fromCharCode(0xF0B7)
      ).join("•");

    onChange(
      html
    );

  }

},

    editorProps: {

 attributes: {
  class:
    `sightseeing-rich-text-editor${
      active
        ? " sightseeing-rich-text-editor-active"
        : ""
    }`,

  tabindex: "0"
},

  handlePaste: (view, event) => {

    

    
  const html =
    event.clipboardData?.getData(
      "text/html"
    );

  const plainText =
    event.clipboardData?.getData(
      "text/plain"
    );

    console.log(
    "PDF PASTE PLAIN TEXT:",
    JSON.stringify(plainText)
);





  /*
   * -------------------------------------------------------
   * DETERMINE WHETHER THE HTML ACTUALLY CONTAINS
   * RICH FORMATTING.
   *
   * A PDF can provide text/html while still containing
   * nothing more than plain text wrapped in HTML.
   * -------------------------------------------------------
   */

  const hasRichFormatting =
    !!html &&
    (
      /<(strong|b|em|i|u|s|mark)\b/i.test(html) ||
      /font-weight\s*:/i.test(html) ||
      /text-decoration\s*:/i.test(html)
    );

  /*
   * -------------------------------------------------------
   * TRUE RICH HTML
   *
   * Word normally comes through here.
   *
   * Let Tiptap handle it normally so its existing
   * formatting support remains intact.
   * -------------------------------------------------------
   */

  if (
    html &&
    hasRichFormatting
  ) {

    return false;
  }

  /*
   * -------------------------------------------------------
   * PLAIN PDF TEXT
   *
   * Even though the PDF provides text/html, it does not
   * contain formatting. Therefore use text/plain instead.
   *
   * This preserves the PDF's actual newline structure.
   * -------------------------------------------------------
   */

  if (!plainText) {
    return false;
  }

  event.preventDefault();

  let cleanedText =
    plainText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00a0/g, " ")

    
/*
 * -------------------------------------------------------
 * PDF LINE-WRAP NORMALIZATION
 *
 * PDF extraction often inserts a newline merely because
 * the original text reached the visual edge of the PDF.
 *
 * Preserve genuine bullet lines, but join ordinary
 * wrapped text back into a flowing paragraph.
 * -------------------------------------------------------
 */

cleanedText =
    cleanedText
      .split("\n")
      .reduce(
        (result, line) => {

          const current =
            line.trim();

          if (!current) {

            result.push("");

            return result;
          }

         const isStructuredMarker =
    /^(?:[•●◦▪▫‣⁃∙⦁⦾∘○■□◆◇★☆✓✔✦✧➤➜➢➣➤\-–—*+]|(?:\d+|[A-Za-z])[.)]|[ivxlcdm]+[.)])\s+/i.test(
        current
    );

          /*
           * A bullet begins a genuine new line.
           */
          if (isStructuredMarker) {

    result.push(
        current
    );

    return;
}
          /*
           * If the previous line is ordinary text,
           * join this PDF-extracted visual line to it.
           */
          if (
    preserveLineBreaks
) {

    /*
     * For Inclusion / Exclusion:
     * preserve every meaningful clipboard
     * line exactly as supplied.
     */
    result.push(
        current
    );

} else if (
    result.length > 0 &&
    result[result.length - 1] !== ""
) {

    /*
     * Existing behavior for Day Description,
     * Note, Sightseeing, etc.
     *
     * Join ordinary PDF visual-wrap lines.
     */
    result[result.length - 1] +=
        " " + current;

} else {

    result.push(
        current
    );
}

          return result;
        },
        []
      )
      .join("\n");

  /*
   * Remove trailing spaces from extracted PDF lines.
   */
  
  /*
   * -------------------------------------------------------
   * IMPORTANT:
   *
   * Do NOT split bullets that occur horizontally here.
   *
   * Your actual diagnostic proves that this PDF already
   * supplies the correct vertical line structure:
   *
   * • Item 1
   * • Item 2
   * • Item 3
   *
   * We should preserve those lines exactly.
   * -------------------------------------------------------
   */

  /*
   * Insert the plain text through the ProseMirror
   * transaction so newline characters are interpreted
   * properly by the editor.
   */

 const {
    state,
    dispatch
} = view;


/*
 * -------------------------------------------------------
 * REMEMBER THE INSERTION RANGE BEFORE DISPATCH
 * -------------------------------------------------------
 */

const insertFrom =
    state.selection.from;

const insertTo =
    state.selection.to;


/*
 * -------------------------------------------------------
 * INSERT THE PLAIN TEXT
 * -------------------------------------------------------
 */

const tr =
    state.tr.insertText(
        cleanedText,
        insertFrom,
        insertTo
    );

dispatch(tr);


/*
 * -------------------------------------------------------
 * NORMALIZE LEGACY PDF BULLET
 * -------------------------------------------------------
 *
 * The first transaction inserts the clipboard text
 * exactly as supplied.
 *
 * The second transaction changes only U+F0B7
 * inside that newly inserted text.
 * -------------------------------------------------------
 */

const legacyBullet =
    String.fromCharCode(0xF0B7);

if (
    cleanedText.includes(
        legacyBullet
    )
) {

    const normalizedText =
        cleanedText
            .split(
                legacyBullet
            )
            .join("•");

    /*
     * The inserted range length may differ after
     * normalization, so use the original inserted
     * range for replacement.
     */
    const normalizedTr =
        view.state.tr.insertText(
            normalizedText,
            insertFrom,
            insertFrom +
                cleanedText.length
        );

    dispatch(
        normalizedTr
    );
}

return true;
},


  handleDOMEvents: {

    mousedown: () => {

      userInteracted.current =
        true;

      return false;
    },

    focus: (view) => {

      if (
        !userInteracted.current
      ) {

        view.dom.blur();

        return true;
      }

      return false;
    }

  }

}

  });

  if (!editor) {
    return null;
  }

  return (
  <div
    className={
      compact
        ? "sightseeing-rich-text-editor-compact"
        : ""
    }
  >

      {/* =========================
          TOOLBAR
      ========================= */}

     <div
  className={
    compact
      ? "sightseeing-rich-text-editor-internal-toolbar-compact"
      : ""
  }
  style={{
    display: "flex",
    gap: "6px",
    padding: "6px 8px",
    border: "1px solid #a3a3a3",
    borderBottom: "none",
    borderRadius: "6px 6px 0 0",
    background: "#f3f4f6"
  }}
>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          style={{
            fontWeight: "bold",
            padding: "4px 9px",
            border: "1px solid #c7c7c7",
            borderRadius: "4px",
            background:
              editor.isActive("bold")
                ? "#dbeafe"
                : "#fff",
            cursor: "pointer"
          }}
        >
          B
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          style={{
            fontStyle: "italic",
            padding: "4px 9px",
            border: "1px solid #c7c7c7",
            borderRadius: "4px",
            background:
              editor.isActive("italic")
                ? "#dbeafe"
                : "#fff",
            cursor: "pointer"
          }}
        >
          I
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
          style={{
            textDecoration: "underline",
            padding: "4px 9px",
            border: "1px solid #c7c7c7",
            borderRadius: "4px",
            background:
              editor.isActive("underline")
                ? "#dbeafe"
                : "#fff",
            cursor: "pointer"
          }}
        >
          U
        </button>

        {/* =========================
    TEXT COLOR
========================= */}

<div
  style={{
    position: "relative"
  }}
>

  <button
    type="button"
    onClick={() =>
      setShowColorPalette(
        !showColorPalette
      )
    }
    style={{
      padding: "4px 9px",
      border: "1px solid #c7c7c7",
      borderRadius: "4px",
      background: "#fff",
      cursor: "pointer",
      fontWeight: "bold"
    }}
    title="Text Color"
  >
    A
    <span
      style={{
        display: "block",
        height: "3px",
        background: "#111827",
        marginTop: "1px",
        borderRadius: "2px"
      }}
    />
  </button>

  {showColorPalette && (

    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: "4px",
        padding: "6px",
        background: "#fff",
        border: "1px solid #c7c7c7",
        borderRadius: "6px",
        display: "flex",
        gap: "5px",
        zIndex: 1000,
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.15)"
      }}
    >

      {[
        "#000000",
        "#4b5563",
        "#dc2626",
        "#2563eb",
        "#16a34a",
        "#ea580c"
      ].map((color) => (

        <button
          key={color}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();

            editor
              .chain()
              .focus()
              .setColor(color)
              .run();

            setShowColorPalette(false);
          }}
          style={{
            width: "22px",
            height: "22px",
            padding: 0,
            border:
              "1px solid #c7c7c7",
            borderRadius: "50%",
            background: color,
            cursor: "pointer"
          }}
          title={color}
        />

      ))}

    </div>

  )}

</div>

      </div>

      {/* =========================
          EDITOR
      ========================= */}

      <EditorContent
        editor={editor}
      />

      {/* =========================
          EDITOR STYLING
      ========================= */}

      <style>
        {`
          .sightseeing-rich-text-editor {

  height: 120px;
  min-height: 120px;
  max-height: 120px;

  overflow-y: auto;
  overflow-x: hidden;

  padding: 10px;

  box-sizing: border-box;

  border: 1px solid #a3a3a3;
  border-radius: 0 0 6px 6px;

  background: #fff;

  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;

  outline: none;

  white-space: pre-wrap;

  text-align: left;
  direction: ltr;
  unicode-bidi: plaintext;

  cursor: text;
}

          .sightseeing-rich-text-editor p {
  margin: 0 0 6px 0;
  text-align: left;
  direction: ltr;
}

          .sightseeing-rich-text-editor p:last-child {
            margin-bottom: 0;
          }

          .sightseeing-rich-text-editor:focus {
            outline: none;
          }

          /* =====================================================
   COMPACT HOTEL USED EDITOR
===================================================== */

/* =====================================================
   COMPACT HOTEL USED EDITOR
===================================================== */

.sightseeing-rich-text-editor-compact {
  width: 100%;
}

.sightseeing-rich-text-editor-internal-toolbar-compact {
  display: none !important;
}

.sightseeing-rich-text-editor-active {
  outline: 2px solid #64748b !important;
  outline-offset: -2px;
}

.sightseeing-rich-text-editor-compact button {
  width: 21px !important;
  height: 23px !important;
  min-width: 21px !important;
  padding: 0 !important;
  margin: 1px !important;
  font-size: 10px !important;
  line-height: 1 !important;
}

.sightseeing-rich-text-editor-compact
.sightseeing-rich-text-editor {
  height: 46px;
min-height: 46px;
max-height: 46px;
  padding: 4px 6px;
}
        `}
      </style>

    </div>
  );
}