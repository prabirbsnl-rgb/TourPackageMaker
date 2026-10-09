


import jsPDF from "jspdf";
import html2canvas from "html2canvas";


function safeFileName(value) {
    return String(value || "Orbitz-Holiday-Proposal")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || "Orbitz-Holiday-Proposal";
}


/**
 * Finds safe vertical page-break positions.
 *
 * The Proposal Editor is treated as a series of major blocks.
 * We never intentionally cut through one of those blocks.
 */
function createCanvasSlice(
    sourceCanvas,
    sourceY,
    sourceHeight
) {
    const sliceCanvas =
        document.createElement("canvas");

    sliceCanvas.width =
        sourceCanvas.width;

    sliceCanvas.height =
        Math.max(
            1,
            Math.floor(sourceHeight)
        );

    const context =
        sliceCanvas.getContext("2d");

    context.fillStyle = "#ffffff";

    context.fillRect(
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height
    );

    context.drawImage(
        sourceCanvas,
        0,
        sourceY,
        sourceCanvas.width,
        sourceHeight,
        0,
        0,
        sourceCanvas.width,
        sourceHeight
    );

    return sliceCanvas;
}


function getPdfSections(
    proposalElement,
    scale
) {
    const rootRect =
        proposalElement.getBoundingClientRect();

    const sectionElements =
        Array.from(
            proposalElement.querySelectorAll(
                "[data-pdf-section]"
            )
        );

    return sectionElements
        .map(element => {
            const rect =
                element.getBoundingClientRect();

            return {
                name:
                    element.getAttribute(
                        "data-pdf-section"
                    ),

                top:
                    (rect.top -
                        rootRect.top) *
                    scale,

                bottom:
                    (rect.bottom -
                        rootRect.top) *
                    scale
            };
        })
        .filter(section =>
            section.bottom >
            section.top + 2
        )
        .sort(
            (a, b) =>
                a.top - b.top
        );
}


export async function generateProposalPdf(
    proposal,
    proposalElement
) {
    if (!proposalElement) {
        alert(
            "Unable to generate the proposal PDF. Please try again."
        );

        return;
    }

    try {

        /*
         * --------------------------------------------------
         * CAPTURE THE FINAL EDITED PROPOSAL
         * --------------------------------------------------
         */

        const scale = 2;

        const canvas =
            await html2canvas(
                proposalElement,
                {
                    scale,

                    useCORS: true,

                    allowTaint: true,

                    backgroundColor:
                        "#ffffff",

                    imageTimeout:
                        15000,

                    logging: false,

                    onclone:
                        clonedDocument => {

                            const clonedRoot =
                                clonedDocument.querySelector(
                                    "[data-proposal-pdf-root]"
                                );

                            if (!clonedRoot) {
                                return;
                            }

                            /*
                             * Remove editor-only
                             * borders and controls.
                             */
                            clonedRoot
                                .querySelectorAll(
                                    "input, textarea"
                                )
                                .forEach(
                                    element => {

                                        element.style.border =
                                            "none";

                                        element.style.outline =
                                            "none";

                                        element.style.background =
                                            "transparent";

                                        element.style.boxShadow =
                                            "none";

                                        element.style.resize =
                                            "none";

                                        element.style.caretColor =
                                            "transparent";
                                    }
                                );

                            clonedRoot.style.boxShadow =
                                "none";

                            clonedRoot.style.borderRadius =
                                "0";
                        }
                }
            );


        /*
         * --------------------------------------------------
         * A4 SETTINGS
         * --------------------------------------------------
         */

        const pdf =
            new jsPDF({
                orientation:
                    "portrait",

                unit: "mm",

                format: "a4",

                compress: true
            });

        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();

        const margin = 8;

        const usableWidth =
            pageWidth -
            margin * 2;

        const usableHeight =
            pageHeight -
            margin * 2;


        /*
         * Source canvas pixels corresponding
         * to one PDF page.
         */
        const pixelsPerMm =
            canvas.width /
            usableWidth;

        const pageCanvasHeight =
            usableHeight *
            pixelsPerMm;


        /*
         * --------------------------------------------------
         * GET EXPLICIT PROPOSAL SECTIONS
         * --------------------------------------------------
         */

        const sections =
            getPdfSections(
                proposalElement,
                scale
            );


        /*
         * --------------------------------------------------
         * BUILD PAGE RANGES
         * --------------------------------------------------
         */

        const pageRanges = [];

        let pageStart = 0;


        while (
            pageStart <
            canvas.height - 2
        ) {

            const pageLimit =
                Math.min(
                    canvas.height,
                    pageStart +
                        pageCanvasHeight
                );


            /*
             * Find the LAST COMPLETE SECTION
             * that fits on this page.
             */
            let safeEnd =
                null;


            for (
                const section
                of sections
            ) {

                /*
                 * Section already belongs
                 * to a previous page.
                 */
                if (
                    section.top <=
                    pageStart + 2
                ) {
                    continue;
                }


                /*
                 * Entire section fits.
                 */
                if (
                    section.bottom <=
                    pageLimit
                ) {
                    safeEnd =
                        section.bottom;
                }
            }


            /*
             * If at least one complete section
             * fits, end the page there.
             */
            if (
                safeEnd !== null &&
                safeEnd >
                    pageStart + 20
            ) {

                pageRanges.push({
                    start:
                        pageStart,

                    end:
                        safeEnd
                });

                pageStart =
                    safeEnd;

                continue;
            }


            /*
             * ------------------------------------------------
             * A SINGLE SECTION IS TALLER THAN ONE PAGE
             * ------------------------------------------------
             *
             * This can happen with a very long
             * Day-wise / Seasonal section.
             *
             * In that situation we have no choice
             * but to split that one section.
             */
            pageRanges.push({
                start:
                    pageStart,

                end:
                    pageLimit
            });

            pageStart =
                pageLimit;
        }


        /*
         * --------------------------------------------------
         * RENDER PAGE RANGES
         * --------------------------------------------------
         */

        pageRanges.forEach(
            (range, index) => {

                if (index > 0) {
                    pdf.addPage();
                }


                const sourceY =
                    Math.floor(
                        range.start
                    );

                const sourceHeight =
                    Math.floor(
                        range.end -
                        range.start
                    );


                if (
                    sourceHeight <= 0
                ) {
                    return;
                }


                const pageCanvas =
                    createCanvasSlice(
                        canvas,
                        sourceY,
                        sourceHeight
                    );


                const imageWidth =
                    usableWidth;

                const imageHeight =
                    sourceHeight *
                    imageWidth /
                    canvas.width;


                pdf.addImage(
                    pageCanvas.toDataURL(
                        "image/png"
                    ),
                    "PNG",
                    margin,
                    margin,
                    imageWidth,
                    imageHeight,
                    undefined,
                    "FAST"
                );
            }
        );


        /*
         * --------------------------------------------------
         * SAVE
         * --------------------------------------------------
         */

        const title =
            proposal?.proposalTitle ||
            "Customer Travel Proposal";

        pdf.save(
            `${safeFileName(title)}.pdf`
        );


    } catch (error) {

        console.error(
            "Proposal PDF generation failed:",
            error
        );

        alert(
            "Unable to generate the proposal PDF. Please try again."
        );
    }
}