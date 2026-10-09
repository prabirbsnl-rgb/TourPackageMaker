


import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    ShadingType
} from "docx";

import { saveAs } from "file-saver";


/* =========================================================
   BASIC HELPERS
========================================================= */

function cleanText(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\r\n/g, "\n")
        .trim();
}


function hasText(value) {
    return cleanText(value).length > 0;
}


function validItems(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(item => cleanText(item))
        .filter(Boolean);
}


function hasItems(value) {
    return validItems(value).length > 0;
}


function safeFileName(value) {
    return (
        String(
            value ||
                "Orbitz-Holiday-Proposal"
        )
            .replace(
                /[<>:"/\\|?*\x00-\x1F]/g,
                ""
            )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120) ||
        "Orbitz-Holiday-Proposal"
    );
}


/* =========================================================
   COLORS
========================================================= */

const COLORS = {
    heading: "172033",
    text: "475569",
    lightText: "64748B",
    border: "E2E8F0",
    softBackground: "F8FAFC",
    white: "FFFFFF"
};


/* =========================================================
   BORDERS
========================================================= */

const NO_BORDERS = {
    top: {
        style: BorderStyle.NONE,
        size: 0,
        color: COLORS.white
    },
    bottom: {
        style: BorderStyle.NONE,
        size: 0,
        color: COLORS.white
    },
    left: {
        style: BorderStyle.NONE,
        size: 0,
        color: COLORS.white
    },
    right: {
        style: BorderStyle.NONE,
        size: 0,
        color: COLORS.white
    },
    insideHorizontal: {
        style: BorderStyle.NONE,
        size: 0,
        color: COLORS.white
    },
    insideVertical: {
        style: BorderStyle.NONE,
        size: 0,
        color: COLORS.white
    }
};


const CARD_BORDERS = {
    top: {
        style: BorderStyle.SINGLE,
        size: 5,
        color: COLORS.border
    },
    bottom: {
        style: BorderStyle.SINGLE,
        size: 5,
        color: COLORS.border
    },
    left: {
        style: BorderStyle.SINGLE,
        size: 5,
        color: COLORS.border
    },
    right: {
        style: BorderStyle.SINGLE,
        size: 5,
        color: COLORS.border
    }
};


/* =========================================================
   COLORED ICONS
========================================================= */

/*
 * We use small SVG data URLs instead of Unicode emoji fonts.
 *
 * This makes the icons actual colored graphics inside the
 * DOCX and avoids Word's monochrome emoji rendering.
 */

const ICONS = {
    proposal:
        "#7C3AED",

    overview:
        "#2563EB",

    destination:
        "#DC2626",

    calendar:
        "#2563EB",

    duration:
        "#D97706",

    travellers:
        "#0891B2",

    from:
        "#16A34A",

    to:
        "#EA580C",

    recommended:
        "#8B5CF6",

    route:
        "#0F766E",

    idea:
        "#CA8A04",

    warning:
        "#D97706",

    pace:
        "#7C3AED",

    day:
        "#2563EB",

    highlight:
        "#EAB308",

    season:
        "#16A34A",

    weather:
        "#0284C7",

    climate:
        "#64748B",

    tips:
        "#CA8A04",

    packing:
        "#7C3AED",

    optional:
        "#8B5CF6",

    include:
        "#16A34A",

    exclude:
        "#DC2626",

    package:
        "#475569",

    budget:
        "#D97706",

    pricing:
        "#0891B2"
};




const emojiImageCache = new Map();

async function iconRun(colorOrSymbol, maybeSymbol) {

    const symbol =
        maybeSymbol !== undefined
            ? maybeSymbol
            : colorOrSymbol;

    const canvas =
        document.createElement("canvas");

    canvas.width = 64;
    canvas.height = 64;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        return new TextRun({
            text: symbol,
            font: "Segoe UI Emoji",
            size: 21
        });
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font =
        '42px "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';

    ctx.fillText(
        symbol,
        canvas.width / 2,
        canvas.height / 2
    );

    const blob =
        await new Promise(resolve => {
            canvas.toBlob(
                resolve,
                "image/png"
            );
        });

    if (!blob) {
        return new TextRun({
            text: symbol,
            font: "Segoe UI Emoji",
            size: 21
        });
    }

    const buffer =
        await blob.arrayBuffer();

    return new ImageRun({
        data: new Uint8Array(buffer),
        transformation: {
            width: 13,
            height: 13
        },
        type: "png"
    });
}



async function coloredSparkleRun() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 64;
    canvas.height = 64;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        return new TextRun({
            text: "✦",
            font: "Arial",
            size: 21,
            color: "F59E0B"
        });
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
     * Main large sparkle
     */
    ctx.fillStyle = "#F59E0B";

    ctx.beginPath();

    ctx.moveTo(45, 8);
    ctx.lineTo(49, 20);
    ctx.lineTo(60, 24);
    ctx.lineTo(49, 28);
    ctx.lineTo(45, 40);
    ctx.lineTo(41, 28);
    ctx.lineTo(30, 24);
    ctx.lineTo(41, 20);

    ctx.closePath();
    ctx.fill();

    /*
     * Small secondary sparkle
     */
    ctx.fillStyle = "#FBBF24";

    ctx.beginPath();

    ctx.moveTo(20, 30);
    ctx.lineTo(23, 38);
    ctx.lineTo(31, 41);
    ctx.lineTo(23, 44);
    ctx.lineTo(20, 52);
    ctx.lineTo(17, 44);
    ctx.lineTo(9, 41);
    ctx.lineTo(17, 38);

    ctx.closePath();
    ctx.fill();

    const blob =
        await new Promise(resolve => {
            canvas.toBlob(
                resolve,
                "image/png"
            );
        });

    if (!blob) {
        return new TextRun({
            text: "✦",
            font: "Arial",
            size: 21,
            color: "F59E0B"
        });
    }

    const buffer =
        await blob.arrayBuffer();

    return new ImageRun({
        data: new Uint8Array(buffer),
        transformation: {
            width: 13,
            height: 13
        },
        type: "png"
    });
}




/* =========================================================
   TEXT
========================================================= */

function textRun(
    text,
    options = {}
) {
    return new TextRun({
        text: cleanText(text),

        font:
            options.font ||
            "Arial",

        size:
            options.size ||
            20,

        bold:
            options.bold ||
            false,

        italics:
            options.italics ||
            false,

        color:
            options.color ||
            COLORS.text
    });
}


function paragraph(
    value,
    options = {}
) {
    const text =
        cleanText(value);

    if (!text) {
        return null;
    }

    return new Paragraph({
        keepLines: true,

        alignment:
            options.alignment ||
            AlignmentType.LEFT,

        spacing: {
            before:
                options.before || 0,

            after:
                options.after !== undefined
                    ? options.after
                    : 90,

            line:
                options.line ||
                260
        },

        children: [
            textRun(
                text,
                options
            )
        ]
    });
}


/* =========================================================
   HEADING
========================================================= */

async function sectionHeading(
    color,
    symbol,
    title
) {
    return new Paragraph({
        keepNext: true,

        spacing: {
            before: 130,
            after: 100,
            line: 260
        },

        children: [
            await iconRun(
                color,
                symbol
            ),

            textRun(
                ` ${title}`,
                {
                    size: 24,
                    bold: true,
                    color:
                        COLORS.heading
                }
            )
        ]
    });
}


/* =========================================================
   BULLETS
========================================================= */

function bulletList(
    items,
    bullet = "•"
) {
    return validItems(items)
        .map(item =>
            new Paragraph({
                keepLines: true,

                spacing: {
                    after: 55,
                    line: 250
                },

                indent: {
                    left: 280,
                    hanging: 160
                },

                children: [
                    textRun(
                        `${bullet} ${item}`,
                        {
                            size: 20
                        }
                    )
                ]
            })
        );
}


/* =========================================================
   LABEL + VALUE
========================================================= */

async function labelValue(
    color,
    symbol,
    label,
    value
) {
    return new Paragraph({
        keepLines: true,

        spacing: {
            after: 65,
            line: 250
        },

        children: [
            await iconRun(
                color,
                symbol
            ),

            textRun(
                ` ${label}: `,
                {
                    size: 20,
                    bold: true
                }
            ),

            textRun(
                value || "—",
                {
                    size: 20
                }
            )
        ]
    });
}


/* =========================================================
   OVERVIEW CELL
========================================================= */

async function overviewCell(
    iconColor,
    iconSymbol,
    label,
    value
) {
    return new TableCell({
        width: {
            size: 25,
            type:
                WidthType.PERCENTAGE
        },

        borders:
            CARD_BORDERS,

        margins: {
            top: 100,
            bottom: 100,
            left: 110,
            right: 110
        },

        children: [
            new Paragraph({
                keepNext: true,

                spacing: {
                    after: 45
                },

                children: [
                    await iconRun(
                        iconColor,
                        iconSymbol
                    ),

                    textRun(
                        ` ${label}`,
                        {
                            size: 18,
                            bold: true,
                            color:
                                COLORS.lightText
                        }
                    )
                ]
            }),

            paragraph(
                value || "—",
                {
                    size: 19,
                    after: 0
                }
            )
        ]
    });
}


/* =========================================================
   TRIP OVERVIEW
========================================================= */

async function buildTripOverview(
    proposal
) {
    const overview =
        proposal.tripOverview ||
        {};

    const travellers =
        overview.travellers ||
        {};

    const adults =
        Number(
            travellers.adults ?? 0
        );

    const children =
        Number(
            travellers.children ?? 0
        );

    let travellerText =
        `${adults} Adult${
            adults === 1
                ? ""
                : "s"
        }`;

    if (children > 0) {
        travellerText +=
            `, ${children} Child${
                children === 1
                    ? ""
                    : "ren"
            }`;
    }

    const firstRow =
        new TableRow({
            cantSplit: true,

            children: [
                await overviewCell(
                    ICONS.destination,
                    "📍",
                    "Destination",
                    overview.destination
                ),

                await overviewCell(
                    ICONS.calendar,
                    "🗓️",
                    "Travel Window",
                    overview.requestedTravelWindow
                ),

                await overviewCell(
                    ICONS.duration,
                    "⏱️",
                    "Duration",
                    overview.requestedDuration
                ),

                await overviewCell(
                    ICONS.travellers,
                     "👥",
                    "Travellers",
                    travellerText
                )
            ]
        });

    const secondRow =
        new TableRow({
            cantSplit: true,

            children: [
                await overviewCell(
                    ICONS.from,
                    "🛫",
                    "From",
                    overview.travelFrom
                ),

                await overviewCell(
                    ICONS.to,
                    "🛬",
                    "To",
                    overview.travelTo
                ),

                await overviewCell(
                    ICONS.recommended,
                    "🧭",
                    "Recommended Window",
                    overview.recommendedTravelWindow
                ),

                await overviewCell(
                    ICONS.recommended,
                     "⏱️",
                    "Suggested Duration",
                    overview.suggestedDuration
                )
            ]
        });

    return new Table({
        width: {
            size: 100,
            type:
                WidthType.PERCENTAGE
        },

        borders:
            NO_BORDERS,

        rows: [
            firstRow,
            secondRow
        ]
    });
}


/* =========================================================
   ROUTE
========================================================= */

async function buildRoute(
    proposal
) {
    const route =
        proposal.route ||
        {};

    const children = [];

    const routeItems =
        validItems(
            route.recommendedRoute
        );

    if (routeItems.length) {
        children.push(
            paragraph(
                routeItems.join(
                    " → "
                ),
                {
                    size: 21,
                    bold: true,
                    after: 100
                }
            )
        );
    }

    if (
        hasText(
            route.entryPoint
        ) ||
        hasText(
            route.exitPoint
        )
    ) {
        const runs = [];

        if (
            hasText(
                route.entryPoint
            )
        ) {
            runs.push(
                await iconRun(
                    ICONS.from,
                   "🛫"
                ),

                textRun(
                    ` Entry: ${route.entryPoint}`,
                    {
                        size: 20,
                        bold: true
                    }
                )
            );
        }

        if (
            hasText(
                route.exitPoint
            )
        ) {
            if (
                hasText(
                    route.entryPoint
                )
            ) {
                runs.push(
                    textRun(
                        "     ",
                        {
                            size: 20
                        }
                    )
                );
            }

            runs.push(
                await iconRun(
                    ICONS.to,
                   "🛬"
                ),

                textRun(
                    ` Exit: ${route.exitPoint}`,
                    {
                        size: 20,
                        bold: true
                    }
                )
            );
        }

        children.push(
            new Paragraph({
                keepLines: true,

                spacing: {
                    after: 70,
                    line: 250
                },

                children: runs
            })
        );
    }

    if (
        hasText(
            route.routeReason
        )
    ) {
        children.push(
            await labelValue(
                ICONS.route,
               "🧭",
                "Route Logic",
                route.routeReason
            )
        );
    }

    return children;
}


/* =========================================================
   DAY CARD
========================================================= */

async function dayCard(
    day,
    index,
    overnightStayLocations
) {

    const dayNumber =
        day?.day ||
        index + 1;

    const dayLabel =
        String(dayNumber)
            .toLowerCase()
            .startsWith("day ")
            ? String(dayNumber)
            : `Day ${dayNumber}`;

    const title =
        cleanText(
            day?.title
        );

    const description =
        cleanText(
            day?.description
        );

    const heading =
        title
            ? `${dayLabel} — ${title}`
            : dayLabel;


            const overnightStayLocation = (() => {
    const stays = Array.isArray(overnightStayLocations)
        ? overnightStayLocations
        : [];

    let nightCounter = 0;

    for (const stay of stays) {
        const stayNights =
            Number(stay?.nights) || 0;

        if (
            Number(dayNumber) >= nightCounter + 1 &&
            Number(dayNumber) <=
                nightCounter + stayNights
        ) {
            return cleanText(
                stay?.location
            );
        }

        nightCounter += stayNights;
    }

    return "";
})();




    const children = [
        new Paragraph({
            keepNext: true,

            spacing: {
                after: 70
            },

            children: [
                textRun(
                    heading,
                    {
                        size: 20,
                        bold: true,
                        color:
                            COLORS.heading
                    }
                )
            ]
        })
    ];

    if (description) {
        children.push(
            paragraph(
                description,
                {
                    size: 19,
                    line: 250,
                    after: 0
                }
            )
        );
    }


    if (overnightStayLocation) {
    children.push(
        new Paragraph({
            spacing: {
                before: 70,
                after: 0
            },

            children: [
                await iconRun("🌙"),
                textRun(
                    ` Night stay at ${overnightStayLocation}`,
                    {
                        size: 17,
                        bold: true,
                        color: COLORS.muted
                    }
                )
            ]
        })
    );
}



    

    return new TableCell({
        borders:
            CARD_BORDERS,

        margins: {
            top: 100,
            bottom: 100,
            left: 110,
            right: 110
        },

        children
    });
}




/* =========================================================
   DAY CARD CONTENT HELPER
========================================================= */

async function dayCardChildren(
    day,
    index,
    overnightStayLocations
) {
    const cell =
        await dayCard(
            day,
            index,
            overnightStayLocations
        );

    return cell.options?.children || [];
}





/* =========================================================
   ITINERARY + DESTINATION HIGHLIGHTS
========================================================= */

async function buildItineraryArea(
    proposal
) {
    const days =
        Array.isArray(
            proposal.dayWiseItinerary
        )
            ? proposal.dayWiseItinerary.filter(
                  Boolean
              )
            : [];

    const highlights =
        validItems(
            proposal.destinationHighlights
        );

    if (
        !days.length &&
        !highlights.length
    ) {
        return [];
    }

    const result = [];

    /*
     * ----------------------------------------------------
     * OPENING 70 / 30 BLOCK
     * ----------------------------------------------------
     *
     * IMPORTANT:
     * No nested tables.
     *
     * The left cell contains the actual Day 1–3
     * paragraphs directly.
     *
     * The right cell contains Destination Highlights.
     *
     * This removes the nested-table structure that was
     * causing Word's pagination/layout problem.
     */

    const openingDays =
        days.slice(0, 3);

    if (
        openingDays.length &&
        highlights.length
    ) {
        const leftChildren = [];

        for (
            let index = 0;
            index < openingDays.length;
            index++
        ) {
            const dayChildren =
                await dayCardChildren(
                    openingDays[index],
                    index,
                    proposal.overnightStayLocations
                );

            leftChildren.push(
                ...dayChildren
            );

            if (
                index <
                openingDays.length - 1
            ) {
                leftChildren.push(
                    new Paragraph({
                        spacing: {
                            after: 20
                        },

                        children: []
                    })
                );
            }
        }

        const rightChildren = [
            new Paragraph({
                keepNext: true,

                spacing: {
                    after: 100
                },

                children: [
                    await iconRun("⭐"),

                    textRun(
                        " Destination Highlights",
                        {
                            size: 21,
                            bold: true,
                            color:
                                COLORS.heading
                        }
                    )
                ]
            }),

            ...bulletList(
                highlights
            )
        ];

        result.push(
            new Table({
                width: {
                    size: 100,
                    type:
                        WidthType.PERCENTAGE
                },

                borders:
                    NO_BORDERS,

                rows: [
                    new TableRow({
                        /*
                         * IMPORTANT:
                         * Allow Word to split this row if
                         * the opening block is taller than
                         * the remaining page space.
                         */
                        cantSplit: false,

                        children: [
                            new TableCell({
                                width: {
                                    size: 70,

                                    type:
                                        WidthType.PERCENTAGE
                                },

                                borders:
                                    NO_BORDERS,

                                margins: {
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 80
                                },

                                children:
                                    leftChildren
                            }),

                            new TableCell({
                                width: {
                                    size: 30,

                                    type:
                                        WidthType.PERCENTAGE
                                },

                                borders:
                                    CARD_BORDERS,

                                margins: {
                                    top: 120,
                                    bottom: 120,
                                    left: 130,
                                    right: 130
                                },

                                children:
                                    rightChildren
                            })
                        ]
                    })
                ]
            })
        );
    }

    /*
     * ----------------------------------------------------
     * DAYS WHEN THERE ARE NO HIGHLIGHTS
     * ----------------------------------------------------
     */

    if (
        openingDays.length &&
        !highlights.length
    ) {
        for (
            let index = 0;
            index < openingDays.length;
            index++
        ) {
            const dayChildren =
                await dayCardChildren(
                    openingDays[index],
                    index,
                    proposal.overnightStayLocations
                );

            result.push(
                new Table({
                    width: {
                        size: 100,
                        type:
                            WidthType.PERCENTAGE
                    },

                    borders:
                        NO_BORDERS,

                    rows: [
                        new TableRow({
                            cantSplit: false,

                            children: [
                                new TableCell({
                                    width: {
                                        size: 100,

                                        type:
                                            WidthType.PERCENTAGE
                                    },

                                    borders:
                                        NO_BORDERS,

                                    children:
                                        dayChildren
                                })
                            ]
                        })
                    ]
                })
            );
        }
    }

    /*
     * ----------------------------------------------------
     * REMAINING DAYS
     * ----------------------------------------------------
     *
     * IMPORTANT:
     * Day 4 onward is returned as a normal,
     * independent 100% table.
     *
     * No rowSpan.
     * No columnSpan.
     * No nested table.
     */

    for (
        let index = 3;
        index < days.length;
        index++
    ) {
        const dayChildren =
            await dayCardChildren(
                days[index],
                index,
                proposal.overnightStayLocations
            );

        result.push(
            new Table({
                width: {
                    size: 100,
                    type:
                        WidthType.PERCENTAGE
                },

                borders:
                    NO_BORDERS,

                rows: [
                    new TableRow({
                        cantSplit: false,

                        children: [
                            new TableCell({
                                width: {
                                    size: 100,

                                    type:
                                        WidthType.PERCENTAGE
                                },

                                borders:
                                    NO_BORDERS,

                                children:
                                    dayChildren
                            })
                        ]
                    })
                ]
            })
        );

        if (
            index <
            days.length - 1
        ) {
            result.push(
                new Paragraph({
                    spacing: {
                        after: 20
                    },

                    children: []
                })
            );
        }
    }

    /*
     * ----------------------------------------------------
     * HIGHLIGHTS ONLY
     * ----------------------------------------------------
     */

    if (
        !openingDays.length &&
        highlights.length
    ) {
        result.push(
            new Table({
                width: {
                    size: 100,
                    type:
                        WidthType.PERCENTAGE
                },

                borders:
                    NO_BORDERS,

                rows: [
                    new TableRow({
                        cantSplit: false,

                        children: [
                            new TableCell({
                                width: {
                                    size: 100,

                                    type:
                                        WidthType.PERCENTAGE
                                },

                                borders:
                                    CARD_BORDERS,

                                margins: {
                                    top: 120,
                                    bottom: 120,
                                    left: 130,
                                    right: 130
                                },

                                children: [
                                    new Paragraph({
                                        keepNext: true,

                                        spacing: {
                                            after: 100
                                        },

                                        children: [
                                            await iconRun("⭐"),

                                            textRun(
                                                " Destination Highlights",
                                                {
                                                    size: 21,
                                                    bold: true,
                                                    color:
                                                        COLORS.heading
                                                }
                                            )
                                        ]
                                    }),

                                    ...bulletList(
                                        highlights
                                    )
                                ]
                            })
                        ]
                    })
                ]
            })
        );
    }

    return result;
}





/* =========================================================
   OPTIONAL SECTION
========================================================= */

async function optionalInlineSection(
    color,
    symbol,
    label,
    value
) {
    if (!hasText(value)) {
        return [];
    }

    return [
        await labelValue(
            color,
            symbol,
            label,
            value
        )
    ];
}


async function optionalBulletSection(
    color,
    symbol,
    title,
    items,
    bullet = "•"
) {
    if (!hasItems(items)) {
        return [];
    }

    return [
        await sectionHeading(
            color,
            symbol,
            title
        ),

        ...bulletList(
            items,
            bullet
        )
    ];
}


/* =========================================================
   SEASONAL INFORMATION
========================================================= */

async function buildSeasonalInformation(
    proposal
) {
    const seasonal =
        proposal.seasonalInformation ||
        {};

    const children = [];

    if (
        hasText(
            seasonal.season
        )
    ) {
        children.push(
            await labelValue(
                ICONS.season,
               "🌿",
                "Season",
                seasonal.season
            )
        );
    }

    if (
        hasText(
            seasonal.weather
        )
    ) {
        children.push(
            await labelValue(
                ICONS.weather,
                "🌡️",
                "Weather",
                seasonal.weather
            )
        );
    }

    if (
        hasText(
            seasonal.climateNote
        )
    ) {
        children.push(
            await labelValue(
                ICONS.climate,
                "☁️",
                "Climate",
                seasonal.climateNote
            )
        );
    }

    return children;
}


/* =========================================================
   PACKAGE SECTION
========================================================= */

async function buildPackageSection(proposal) {
    const includes = validItems(
        proposal.packageIncludes
    );

    const excludes = validItems(
        proposal.packageExcludes
    );

    if (
        !includes.length &&
        !excludes.length
    ) {
        return [];
    }

    const cells = [];

    if (includes.length) {
        const includeChildren = [];

        includeChildren.push(
            new Paragraph({
                keepNext: true,
                spacing: {
                    after: 90
                },
                children: [
                    await iconRun(
                        ICONS.include,
                        "✅"
                    ),
                    textRun(
                        " Package Includes",
                        {
                            size: 21,
                            bold: true,
                            color:
                                COLORS.heading
                        }
                    )
                ]
            })
        );

        includeChildren.push(
            ...bulletList(includes)
        );

        cells.push(
            new TableCell({
                width: {
                    size: excludes.length ? 50 : 100,
                    type:
                        WidthType.PERCENTAGE
                },
                borders: CARD_BORDERS,
                margins: {
                    top: 120,
                    bottom: 120,
                    left: 130,
                    right: 130
                },
                children: includeChildren
            })
        );
    }

    if (excludes.length) {
        const excludeChildren = [];

        excludeChildren.push(
            new Paragraph({
                keepNext: true,
                spacing: {
                    after: 90
                },
                children: [
                    await iconRun(
                        ICONS.exclude,
                        "❌"
                    ),
                    textRun(
                        " Package Excludes",
                        {
                            size: 21,
                            bold: true,
                            color:
                                COLORS.heading
                        }
                    )
                ]
            })
        );

        excludeChildren.push(
            ...bulletList(excludes)
        );

        cells.push(
            new TableCell({
                width: {
                    size: includes.length ? 50 : 100,
                    type:
                        WidthType.PERCENTAGE
                },
                borders: CARD_BORDERS,
                margins: {
                    top: 120,
                    bottom: 120,
                    left: 130,
                    right: 130
                },
                children: excludeChildren
            })
        );
    }

    const output = [];


    output.push(
        new Table({
            width: {
                size: 100,
                type:
                    WidthType.PERCENTAGE
            },
            borders: NO_BORDERS,
            rows: [
                new TableRow({
                    cantSplit: true,
                    children: cells
                })
            ]
        })
    );

    return output;
}


/* =========================================================
   BUDGET / PRICING
========================================================= */

async function buildBudgetPricing(
    proposal
) {
    const budget =
        cleanText(
            proposal.budgetPlanningNote
        );

    const pricing =
        cleanText(
            proposal.finalPricingNote
        );

    if (
        !budget &&
        !pricing
    ) {
        return [];
    }

    const cells = [];

    /*
     * BUDGET PLANNING
     */
    if (budget) {

        const budgetChildren = [];

        budgetChildren.push(
            new Paragraph({
                keepNext: true,

                spacing: {
                    after: 90,
                    line: 260
                },

                children: [
                    await iconRun(
                        ICONS.budget,
                        "💰"
                    ),

                    textRun(
                        " Budget Planning",
                        {
                            size: 21,
                            bold: true,
                            color:
                                COLORS.heading
                        }
                    )
                ]
            })
        );

        budgetChildren.push(
            paragraph(
                budget,
                {
                    size: 20,
                    line: 270,
                    after: 0
                }
            )
        );

        cells.push(
            new TableCell({
                width: {
                    size:
                        pricing
                            ? 50
                            : 100,

                    type:
                        WidthType.PERCENTAGE
                },

                borders:
                    CARD_BORDERS,

                margins: {
                    top: 120,
                    bottom: 120,
                    left: 130,
                    right: 130
                },

                children:
                    budgetChildren
            })
        );
    }

    /*
     * PRICING NOTE
     */
    if (pricing) {

        const pricingChildren = [];

        pricingChildren.push(
            new Paragraph({
                keepNext: true,

                spacing: {
                    after: 90,
                    line: 260
                },

                children: [
                    await iconRun(
                        ICONS.pricing,
                        "💬"
                    ),

                    textRun(
                        " Pricing Note",
                        {
                            size: 21,
                            bold: true,
                            color:
                                COLORS.heading
                        }
                    )
                ]
            })
        );

        pricingChildren.push(
            paragraph(
                pricing,
                {
                    size: 20,
                    line: 270,
                    after: 0
                }
            )
        );

        cells.push(
            new TableCell({
                width: {
                    size:
                        budget
                            ? 50
                            : 100,

                    type:
                        WidthType.PERCENTAGE
                },

                borders:
                    CARD_BORDERS,

                margins: {
                    top: 120,
                    bottom: 120,
                    left: 130,
                    right: 130
                },

                children:
                    pricingChildren
            })
        );
    }

    return [
        new Table({
            width: {
                size: 100,
                type:
                    WidthType.PERCENTAGE
            },

            borders:
                NO_BORDERS,

            rows: [
                new TableRow({
                    cantSplit: true,
                    children:
                        cells
                })
            ]
        })
    ];
}


/* =========================================================
   MAIN GENERATOR
========================================================= */

export async function generateProposalDocx(
    proposal
) {
    if (!proposal) {
        alert(
            "Unable to generate the proposal document."
        );

        return;
    }

    try {
        const children = [];



/* -----------------------------------------------
   GREETING
------------------------------------------------ */

if (
    hasText(
        proposal.customerGreeting
    )
) {
    const greeting =
        String(
            proposal.customerGreeting
        )
            .replace(/\r\n/g, "\n")
            .trim();

    const greetingLines =
        greeting.split("\n");

    for (
        let i = 0;
        i < greetingLines.length;
        i++
    ) {
        const line =
            greetingLines[i];

        /* Preserve blank lines */
        if (!line.trim()) {
            children.push(
                new Paragraph({
                    spacing: {
                        after: 70,
                        line: 280
                    },
                    children: [
                        new TextRun({
                            text: " ",
                            font: "Arial",
                            size: 21
                        })
                    ]
                })
            );

            continue;
        }

        const brandText =
            "Orbitz Holidays!";

        const brandIndex =
            line.indexOf(
                brandText
            );

        const lineChildren = [];

        if (brandIndex >= 0) {

            const beforeBrand =
                line.slice(
                    0,
                    brandIndex
                );

            let afterBrand =
                line.slice(
                    brandIndex +
                        brandText.length
                );

            /*
             * Remove the original Unicode sparkle
             * from the text so Word cannot render
             * it as a black/white emoji.
             */
            const sparkleMatch =
                afterBrand.match(
                    /^\s*✨/
                );

            const hasSparkle =
                Boolean(
                    sparkleMatch
                );

            if (hasSparkle) {
                afterBrand =
                    afterBrand.slice(
                        sparkleMatch[0].length
                    );
            }

            /*
             * Text before Orbitz.
             */
            if (beforeBrand) {
                lineChildren.push(
                    textRun(
                        beforeBrand,
                        {
                            size: 21,
                            color:
                                COLORS.text
                        }
                    )
                );
            }

            /*
             * Explicit space before Orbitz.
             */
            lineChildren.push(
                new TextRun({
                    text: " ",
                    font: "Arial",
                    size: 21
                })
            );

            /*
             * Orbitz Holidays!
             */
            lineChildren.push(
                textRun(
                    brandText,
                    {
                        size: 21,
                        bold: true,
                        color:
                            ICONS.proposal.replace(
                                "#",
                                ""
                            )
                    }
                )
            );

            /*
             * Add exactly ONE colored sparkle.
             */
            if (hasSparkle) {

                lineChildren.push(
                    new TextRun({
                        text: " ",
                        font: "Arial",
                        size: 21
                    })
                );

                lineChildren.push(
                    await coloredSparkleRun()
                );
            }

            /*
             * Text after sparkle.
             */
            if (afterBrand) {
                lineChildren.push(
                    textRun(
                        afterBrand,
                        {
                            size: 21,
                            color:
                                COLORS.text
                        }
                    )
                );
            }

        } else {

            lineChildren.push(
                textRun(
                    line,
                    {
                        size: 21,
                        color:
                            COLORS.text
                    }
                )
            );
        }

        children.push(
            new Paragraph({
                spacing: {
                    after:
                        i ===
                        greetingLines.length - 1
                            ? 140
                            : 0,
                    line: 280
                },
                children:
                    lineChildren
            })
        );
    }
}




        /* -----------------------------------------------
           TRIP OVERVIEW
        ----------------------------------------------- */

        const overview =
            proposal.tripOverview ||
            {};

        const hasOverview =
            hasText(
                overview.destination
            ) ||
            hasText(
                overview.requestedTravelWindow
            ) ||
            hasText(
                overview.recommendedTravelWindow
            ) ||
            hasText(
                overview.requestedDuration
            ) ||
            hasText(
                overview.suggestedDuration
            ) ||
            overview.travellers ||
            hasText(
                overview.travelFrom
            ) ||
            hasText(
                overview.travelTo
            );

        if (hasOverview) {
            children.push(
                await sectionHeading(
                    ICONS.overview,
                    "O",
                    "Trip Overview"
                ),

                await buildTripOverview(
                    proposal
                )
            );
        }


        /* -----------------------------------------------
           ROUTE
        ----------------------------------------------- */

        const route =
            proposal.route ||
            {};

        const hasRoute =
            hasItems(
                route.recommendedRoute
            ) ||
            hasText(
                route.entryPoint
            ) ||
            hasText(
                route.exitPoint
            ) ||
            hasText(
                route.routeReason
            );

        if (hasRoute) {
            children.push(
                await sectionHeading(
                    ICONS.route,
                    "R",
                    "Recommended Route"
                ),

                ...await buildRoute(
                    proposal
                )
            );
        }


        /* -----------------------------------------------
           WHY THIS ITINERARY
        ----------------------------------------------- */

        children.push(
            ...await optionalBulletSection(
                ICONS.idea,
                "💡",
                "Why This Itinerary",
                proposal.whyThisItinerary
            )
        );


        /* -----------------------------------------------
           ROUTE ADVISORY
        ----------------------------------------------- */

        children.push(
            ...await optionalInlineSection(
                ICONS.warning,
                "⚠️",
                "Route Advisory",
                proposal.routeAdvisory
            )
        );


        /* -----------------------------------------------
           PACE
        ----------------------------------------------- */

        children.push(
            ...await optionalInlineSection(
                ICONS.pace,
                "🚶",
                "Pace",
                proposal.suggestedPace
            )
        );


        /* -----------------------------------------------
           DAY-WISE + HIGHLIGHTS
        ----------------------------------------------- */

        const itinerary =
            await buildItineraryArea(
                proposal
            );

        if (
            itinerary.length
        ) {
            children.push(
                await sectionHeading(
                    ICONS.day,
                    "📅",
                    "Day-wise Itinerary"
                ),

                ...itinerary
            );
        }


        /* -----------------------------------------------
           SEASONAL INFORMATION
        ----------------------------------------------- */

        const seasonalInfo =
            await buildSeasonalInformation(
                proposal
            );

        if (
            seasonalInfo.length
        ) {
            children.push(
                await sectionHeading(
                    ICONS.season,
                   "🌤️",
                    "Seasonal Information"
                ),

                ...seasonalInfo
            );
        }


        /* -----------------------------------------------
           SEASONAL HIGHLIGHTS
        ----------------------------------------------- */

        children.push(
            ...await optionalBulletSection(
                ICONS.optional,
                "✨",
                "Seasonal Highlights",
                proposal
                    .seasonalInformation
                    ?.seasonalHighlights
            )
        );


        /* -----------------------------------------------
           SEASONAL ADVISORY
        ----------------------------------------------- */

        children.push(
            ...await optionalInlineSection(
                ICONS.warning,
               "⚠️",
                "Seasonal Advisory",
                proposal
                    .seasonalInformation
                    ?.seasonalAdvisory
            )
        );


        /* -----------------------------------------------
           TRAVEL TIPS
        ----------------------------------------------- */

        children.push(
            ...await optionalBulletSection(
                ICONS.tips,
                "💡",
                "Travel Tips",
                proposal.travelTips
            )
        );


        /* -----------------------------------------------
           PACKING
        ----------------------------------------------- */

        children.push(
            ...await optionalBulletSection(
                ICONS.packing,
               "🎒",
                "Packing Advice",
                proposal.packingAdvice
            )
        );


        /* -----------------------------------------------
           OPTIONAL EXPERIENCES
        ----------------------------------------------- */

        children.push(
            ...await optionalBulletSection(
                ICONS.optional,
                "✨",
                "Optional Experiences",
                proposal.optionalExperiences,
                "✦"
            )
        );


        /* -----------------------------------------------
           PACKAGE
        ----------------------------------------------- */

        children.push(
            ...await buildPackageSection(
                proposal
            )
        );


        /* -----------------------------------------------
           BUDGET / PRICING
        ----------------------------------------------- */

        children.push(
            ...await buildBudgetPricing(
                proposal
            )
        );


        /* -----------------------------------------------
           DOCX
        ----------------------------------------------- */

        const doc =
            new Document({
                creator:
                    "Orbitz Holidays",

                title:
                    proposal.proposalTitle ||
                    "Customer Travel Proposal",

                subject:
                    "Orbitz Holidays Travel Proposal",

                description:
                    "Customer travel proposal generated by Orbitz Holidays.",

                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: 720,
                                    right: 720,
                                    bottom: 720,
                                    left: 720
                                }
                            }
                        },

                        children
                    }
                ]
            });


        const blob =
            await Packer.toBlob(
                doc
            );


        const fileName =
            `${safeFileName(
                proposal.proposalTitle ||
                    "Orbitz-Holiday-Proposal"
            )}.docx`;


       saveAs(
    blob,
    fileName
);

return {
    blob,
    fileName
};


    } catch (error) {
        console.error(
            "Proposal DOCX generation failed:",
            error
        );

        alert(
            "Unable to generate the proposal DOCX. Please try again."
        );
    }
}