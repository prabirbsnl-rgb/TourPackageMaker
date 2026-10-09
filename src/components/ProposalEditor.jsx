


import React, { useRef } from "react";
import { generateProposalPdf } from "./generateProposalPdf";




export default function ProposalEditor({
    proposal,
    onChange,
    onClose,
    isLibraryResume,
    onWhatsApp,
    onEmail,
    onDownloadDocx
}) {

    if (!proposal) return null;

    const proposalDocumentRef = useRef(null);

    return (
        <div
            style={{
    position: "fixed",
    top: "2vh",
    left: "50%",
    transform: "translateX(-50%)",
    width: "96vw",
    maxWidth: "1500px",
    height: "96vh",
    maxHeight: "96vh",
    background: "#fff",
    border: "1px solid #dbe3ea",
    borderRadius: "16px",
    boxShadow:
        "0 20px 60px rgba(15, 23, 42, 0.24)",
    zIndex: 1010,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
}}
        >
            {/* HEADER */}
            <div
                style={{
                    minHeight: "62px",
                    padding: "10px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc"
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: "#172033"
                        }}
                    >
                        ✨ Proposal
                    </div>

                    <div
                        style={{
                            marginTop: "3px",
                            fontSize: "11px",
                           color: "#475569"
                        }}
                    >
                        {proposal.proposalTitle || "Customer Travel Proposal"}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: "32px",
                        height: "32px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#e2e8f0",
                        color: "#334155",
                        cursor: "pointer",
                        fontSize: "19px",
                        lineHeight: 1
                    }}
                >
                    ×
                </button>
            </div>

           {/* CONTENT */}
<div
    style={{
        flex: 1,
        minWidth: 0,
        overflowY: "auto",
        padding: "16px",
        boxSizing: "border-box",
        background: "#f1f5f9"
    }}
>
    <div
    ref={proposalDocumentRef}
    data-proposal-pdf-root="true"

        style={{
            width: "100%",
            maxWidth: "100%",
            minHeight: "100%",
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
            boxShadow: "0 4px 18px rgba(15, 23, 42, 0.08)",
           padding: "24px",
            boxSizing: "border-box"
        }}
    >
       {/* CUSTOMER GREETING */}
<div
    style={{
        marginBottom: "24px"
    }}
>
    <textarea
        value={proposal.customerGreeting || ""}
        onChange={e =>
            onChange?.({
                ...proposal,
                customerGreeting: e.target.value
            })
        }
        rows={4}
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "7px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#334155",
            lineHeight: 1.7,
            background: "#fff",
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none"
        }}
    />
</div>

       {/* PROPOSAL TITLE */}
<div
    style={{
        marginBottom: "22px"
    }}
>
    <input
        type="text"
        value={proposal.proposalTitle || ""}
        onChange={e =>
            onChange?.({
                ...proposal,
                proposalTitle: e.target.value
            })
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "7px",
            padding: "8px 10px",
            fontSize: "24px",
            fontWeight: 800,
            color: "#172033",
            lineHeight: 1.25,
            background: "#fff",
            fontFamily: "inherit",
            outline: "none",
            textAlign: "center"
        }}
    />
</div>


        {/* TRIP OVERVIEW */}
<div
    style={{
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 0",
        marginBottom: "22px"
    }}
>
    <div
        style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#172033",
            marginBottom: "10px"
        }}
    >
        🗺️ Trip Overview
    </div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "10px 18px",
            fontSize: "12px",
            color: "#475569",
            lineHeight: 1.5
        }}
    >
        {/* DESTINATION */}
        <div>
            <strong>📍 Destination:</strong>{" "}
            <input
                type="text"
                value={proposal.tripOverview?.destination || ""}
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        tripOverview: {
                            ...proposal.tripOverview,
                            destination: e.target.value
                        }
                    })
                }
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    maxWidth: "140px"
                }}
            />
        </div>

        {/* TRAVEL WINDOW */}
        <div>
            <strong>🗓️ Travel Window:</strong>{" "}
            <input
                type="text"
                value={
                    proposal.tripOverview?.requestedTravelWindow || ""
                }
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        tripOverview: {
                            ...proposal.tripOverview,
                            requestedTravelWindow: e.target.value
                        }
                    })
                }
                placeholder="-"
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    maxWidth: "125px"
                }}
            />
        </div>

        {/* DURATION */}
        <div>
            <strong>⏱️ Duration:</strong>{" "}
            <input
                type="text"
                value={
                    proposal.tripOverview?.requestedDuration ||
                    proposal.tripOverview?.suggestedDuration ||
                    ""
                }
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        tripOverview: {
                            ...proposal.tripOverview,
                            requestedDuration: e.target.value
                        }
                    })
                }
                placeholder="-"
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    maxWidth: "125px"
                }}
            />
        </div>

        {/* TRAVELLERS */}
        <div>
            <strong>👥 Travellers:</strong>{" "}
            <input
                type="number"
                min="0"
                value={
                    proposal.tripOverview?.travellers?.adults ?? 0
                }
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        tripOverview: {
                            ...proposal.tripOverview,
                            travellers: {
                                ...proposal.tripOverview?.travellers,
                                adults: Number(e.target.value) || 0
                            }
                        }
                    })
                }
                style={{
                    width: "38px",
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px"
                }}
            />{" "}
            Adults
            {proposal.tripOverview?.travellers?.children ? (
                <>
                    {", "}
                    <input
                        type="number"
                        min="0"
                        value={
                            proposal.tripOverview.travellers.children
                        }
                        onChange={e =>
                            onChange?.({
                                ...proposal,
                                tripOverview: {
                                    ...proposal.tripOverview,
                                    travellers: {
                                        ...proposal.tripOverview
                                            ?.travellers,
                                        children:
                                            Number(e.target.value) || 0
                                    }
                                }
                            })
                        }
                        style={{
                            width: "38px",
                            border: "none",
                            borderBottom: "1px dashed #94a3b8",
                            outline: "none",
                            background: "transparent",
                            fontSize: "12px",
                            color: "#1f2937",
                            fontFamily: "inherit",
                            padding: "1px 2px"
                        }}
                    />{" "}
                    Children
                </>
            ) : null}
        </div>

        {/* RECOMMENDED TRAVEL WINDOW */}
        {proposal.tripOverview?.recommendedTravelWindow &&
        proposal.tripOverview.recommendedTravelWindow !==
            proposal.tripOverview.requestedTravelWindow ? (
            <div>
                <strong>✨ Recommended:</strong>{" "}
                <input
                    type="text"
                    value={
                        proposal.tripOverview
                            .recommendedTravelWindow
                    }
                    onChange={e =>
                        onChange?.({
                            ...proposal,
                            tripOverview: {
                                ...proposal.tripOverview,
                                recommendedTravelWindow:
                                    e.target.value
                            }
                        })
                    }
                    style={{
                        border: "none",
                        borderBottom: "1px dashed #94a3b8",
                        outline: "none",
                        background: "transparent",
                        fontSize: "12px",
                        color: "#1f2937",
                        fontFamily: "inherit",
                        padding: "1px 2px",
                        maxWidth: "140px"
                    }}
                />
            </div>
        ) : null}

        {/* SUGGESTED DURATION */}
        {proposal.tripOverview?.suggestedDuration &&
        proposal.tripOverview.suggestedDuration !==
            proposal.tripOverview.requestedDuration ? (
            <div>
                <strong>✨ Suggested Duration:</strong>{" "}
                <input
                    type="text"
                    value={
                        proposal.tripOverview.suggestedDuration
                    }
                    onChange={e =>
                        onChange?.({
                            ...proposal,
                            tripOverview: {
                                ...proposal.tripOverview,
                                suggestedDuration: e.target.value
                            }
                        })
                    }
                    style={{
                        border: "none",
                        borderBottom: "1px dashed #94a3b8",
                        outline: "none",
                        background: "transparent",
                        fontSize: "12px",
                        color: "#1f2937",
                        fontFamily: "inherit",
                        padding: "1px 2px",
                        maxWidth: "120px"
                    }}
                />
            </div>
        ) : null}

        {/* FROM */}
        <div>
            <strong>🛫 From:</strong>{" "}
            <input
                type="text"
                value={proposal.tripOverview?.travelFrom || ""}
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        tripOverview: {
                            ...proposal.tripOverview,
                            travelFrom: e.target.value
                        }
                    })
                }
                placeholder="-"
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    maxWidth: "120px"
                }}
            />
        </div>

        {/* TO */}
        <div>
            <strong>🛬 To:</strong>{" "}
            <input
                type="text"
                value={proposal.tripOverview?.travelTo || ""}
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        tripOverview: {
                            ...proposal.tripOverview,
                            travelTo: e.target.value
                        }
                    })
                }
                placeholder="-"
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    maxWidth: "120px"
                }}
            />
        </div>
    </div>
</div>



       {/* ROUTE + ITINERARY REASON */}
<div
    data-pdf-section="route"
    style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: "28px",
        marginBottom: "22px"
    }}
>
   {/* ROUTE */}
<div>
    <div
        style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#172033",
            marginBottom: "8px"
        }}
    >
        🧭 Recommended Route
    </div>

    <div
        style={{
            fontSize: "12px",
            color: "#475569",
            lineHeight: 1.6
        }}
    >
        {proposal.route?.recommendedRoute?.length ? (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "4px 6px",
            marginBottom: "7px"
        }}
    >
        {proposal.route.recommendedRoute.map(
            (place, index) => (
                <React.Fragment key={index}>
                    <input
                        type="text"
                        value={place || ""}
                        onChange={e => {
                            const updatedRoute = [
                                ...proposal.route.recommendedRoute
                            ];

                            updatedRoute[index] =
                                e.target.value;

                            onChange?.({
                                ...proposal,
                                route: {
                                    ...proposal.route,
                                    recommendedRoute:
                                        updatedRoute
                                }
                            });
                        }}
                        style={{
                            width: `${Math.max(
                                55,
                                Math.min(
                                    150,
                                    String(place || "").length * 8 + 18
                                )
                            )}px`,
                            border: "none",
                            borderBottom:
                                "1px dashed #94a3b8",
                            outline: "none",
                            background: "transparent",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#334155",
                            fontFamily: "inherit",
                            padding: "1px 2px",
                            boxSizing: "border-box"
                        }}
                    />

                    {index <
                    proposal.route.recommendedRoute.length - 1 ? (
                        <span
                            style={{
                                color: "#1f2937",
                                fontWeight: 700
                            }}
                        >
                            →
                        </span>
                    ) : null}
                </React.Fragment>
            )
        )}
    </div>
) : (
    <div style={{ marginBottom: "7px" }}>
        Route will be planned based on destination,
        season and travel preferences.
    </div>
)}

       <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "28px",
        flexWrap: "wrap"
    }}
>
    {proposal.route?.entryPoint !== undefined ? (
        <div>
            <strong>🛫 Entry:</strong>{" "}
            <input
                type="text"
                value={proposal.route.entryPoint || ""}
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        route: {
                            ...proposal.route,
                            entryPoint: e.target.value
                        }
                    })
                }
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    width: "110px"
                }}
            />
        </div>
    ) : null}

    {proposal.route?.exitPoint !== undefined ? (
        <div>
            <strong>🛬 Exit:</strong>{" "}
            <input
                type="text"
                value={proposal.route.exitPoint || ""}
                onChange={e =>
                    onChange?.({
                        ...proposal,
                        route: {
                            ...proposal.route,
                            exitPoint: e.target.value
                        }
                    })
                }
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    width: "110px"
                }}
            />
        </div>
    ) : null}
</div>

        {proposal.route?.routeReason !== undefined ? (
    <div
        style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
            marginTop: "7px"
        }}
    >
        <strong style={{ whiteSpace: "nowrap" }}>
            🧭 Route logic:
        </strong>

        <textarea
            value={proposal.route.routeReason || ""}
            onChange={e =>
                onChange?.({
                    ...proposal,
                    route: {
                        ...proposal.route,
                        routeReason: e.target.value
                    }
                })
            }
            rows={2}
            style={{
                flex: 1,
                border: "1px dashed #94a3b8",
                borderRadius: "5px",
                outline: "none",
                background: "transparent",
                fontSize: "12px",
                color: "#1f2937",
                fontFamily: "inherit",
                lineHeight: 1.45,
                padding: "3px 5px",
                resize: "vertical",
                boxSizing: "border-box"
            }}
        />
    </div>
) : null}

        
    </div>
</div>

{/* WHY THIS ITINERARY */}
<div>
    <div
        style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#172033",
            marginBottom: "8px"
        }}
    >
        💡 Why This Itinerary
    </div>

    <div
        style={{
            fontSize: "12px",
            color: "#475569",
            lineHeight: 1.6
        }}
    >
                     {proposal.whyThisItinerary?.length ? (
    proposal.whyThisItinerary.map((item, index) => (
        <div
            key={index}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
                marginBottom: "6px"
            }}
        >
            <span
                style={{
                    fontSize: "12px",
                    color: "#475569",
                    lineHeight: 1.5
                }}
            >
                •
            </span>

            <textarea
                value={item || ""}
                onChange={e => {
                    const updatedWhy = [
                        ...proposal.whyThisItinerary
                    ];

                    updatedWhy[index] = e.target.value;

                    onChange?.({
                        ...proposal,
                        whyThisItinerary: updatedWhy
                    });
                }}
                rows={2}
                style={{
                    flex: 1,
                    border: "1px dashed #94a3b8",
                    borderRadius: "5px",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    color: "#1f2937",
                    fontFamily: "inherit",
                    lineHeight: 1.45,
                    padding: "3px 5px",
                    resize: "vertical",
                    boxSizing: "border-box"
                }}
            />
        </div>
    ))
) : (
    <div>
        The itinerary has been planned around your travel preferences,
        route feasibility and destination experience.
    </div>
)}
    </div>

    {proposal.routeAdvisory ? (
    <div
        style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "5px",
            marginTop: "10px"
        }}
    >
        <strong style={{ whiteSpace: "nowrap" }}>
            ⚠️ Route Advisory:
        </strong>

        <textarea
            value={proposal.routeAdvisory || ""}
            onChange={e =>
                onChange?.({
                    ...proposal,
                    routeAdvisory: e.target.value
                })
            }
            rows={2}
            style={{
                flex: 1,
                border: "1px dashed #94a3b8",
                borderRadius: "5px",
                outline: "none",
                background: "transparent",
                fontSize: "12px",
                color: "#1f2937",
                fontFamily: "inherit",
                lineHeight: 1.45,
                padding: "3px 5px",
                resize: "vertical",
                boxSizing: "border-box"
            }}
        />
    </div>
) : null}

   {proposal.suggestedPace ? (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "8px"
        }}
    >
        <strong style={{ whiteSpace: "nowrap" }}>
            🚶 Pace:
        </strong>

        <input
            type="text"
            value={proposal.suggestedPace || ""}
            onChange={e =>
                onChange?.({
                    ...proposal,
                    suggestedPace: e.target.value
                })
            }
            style={{
                border: "1px dashed #94a3b8",
                borderRadius: "5px",
                outline: "none",
                background: "transparent",
                fontSize: "12px",
                color: "#1f2937",
                fontFamily: "inherit",
                padding: "3px 5px",
                width: "150px",
                boxSizing: "border-box"
            }}
        />
    </div>
) : null}
</div>
</div>



{/* DAY-WISE ITINERARY + DESTINATION HIGHLIGHTS */}
<div
    data-pdf-section="daywise"
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "10px",
        marginBottom: "22px",
        alignItems: "start"
    }}
>
    {/* DAY-WISE HEADING */}
    <div
        style={{
            gridColumn: "1 / -1",
            fontSize: "14px",
            fontWeight: 800,
            color: "#172033",
            marginBottom: "0"
        }}
    >
        📅 Day-wise Itinerary
    </div>

    {/* DAY CARDS */}
    {proposal.dayWiseItinerary?.length ? (
        proposal.dayWiseItinerary.map((day, index) => {
            const dayLabel =
                typeof day.day === "string" &&
                day.day.toLowerCase().startsWith("day ")
                    ? day.day
                    : `Day ${day.day || index + 1}`;

                    const overnightStayLocation = (() => {
    const stays = proposal.overnightStayLocations || [];

    let nightCounter = 0;

    for (const stay of stays) {
        const stayNights = Number(stay?.nights) || 0;

        if (
            (day.day || index + 1) >= nightCounter + 1 &&
            (day.day || index + 1) <= nightCounter + stayNights
        ) {
            return stay?.location || "";
        }

        nightCounter += stayNights;
    }

    return "";
})();



            return (
                <div
                    key={index}
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        background: "#fff",
                        minHeight: "88px",
                        boxSizing: "border-box"
                    }}
                >
                    <div
    style={{
        fontSize: "12px",
        fontWeight: 800,
        color: "#172033",
        marginBottom: "4px",
        lineHeight: 1.45
    }}
>
    {dayLabel}

    {day.title !== undefined ? (
        <>
            {" — "}
            <input
                type="text"
                value={day.title || ""}
                onChange={e => {
                    const updatedDays = [
                        ...proposal.dayWiseItinerary
                    ];

                    updatedDays[index] = {
                        ...updatedDays[index],
                        title: e.target.value
                    };

                    onChange?.({
                        ...proposal,
                        dayWiseItinerary: updatedDays
                    });
                }}
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#172033",
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    width: "calc(100% - 55px)",
                    boxSizing: "border-box"
                }}
            />
        </>
    ) : null}
</div>

                   {day.description !== undefined ? (
    <textarea
        value={day.description || ""}
        onChange={e => {
            const updatedDays = [
                ...proposal.dayWiseItinerary
            ];

            updatedDays[index] = {
                ...updatedDays[index],
                description: e.target.value
            };

            onChange?.({
                ...proposal,
                dayWiseItinerary: updatedDays
            });
        }}
        rows={3}
        style={{
            width: "100%",
            border: "1px dashed #94a3b8",
            borderRadius: "5px",
            outline: "none",
            background: "transparent",
            fontSize: "11px",
            lineHeight: 1.45,
            color: "#1f2937",
            fontFamily: "inherit",
            padding: "3px 5px",
            resize: "vertical",
            boxSizing: "border-box"
        }}
    />
) : null}

{overnightStayLocation ? (
    <div
        style={{
            marginTop: "6px",
            paddingTop: "5px",
            borderTop: "1px solid #f1f5f9",
            fontSize: "10px",
            fontWeight: 700,
            color: "#1f2937",
            lineHeight: 1.4
        }}
    >
        🌙 Night stay at {overnightStayLocation}
    </div>
) : null}


                </div>
            );
        })
    ) : (
        <div
            style={{
                gridColumn: "1 / -1",
                fontSize: "12px",
                color: "#64748b"
            }}
        >
            Day-wise itinerary will appear here.
        </div>
    )}

    {/* DESTINATION HIGHLIGHTS */}
    {(() => {
        const dayCount = proposal.dayWiseItinerary?.length || 0;
        const remaining = dayCount % 4;

        // If only one space remains, avoid making Highlights too narrow.
       const highlightFitsBeside =
    remaining === 1 || remaining === 2;

const highlightSpan =
    remaining === 1
        ? 3
        : remaining === 2
            ? 2
            : 4;

const highlightStart =
    remaining === 1
        ? "2"
        : remaining === 2
            ? "3"
            : "1";

        return (
            <div
                style={{
                    gridColumn: highlightFitsBeside
    ? `${highlightStart} / span ${highlightSpan}`
    : "1 / -1",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    background: "#fff",
                    boxSizing: "border-box",
                    minHeight: "88px"
                }}
            >
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#172033",
                        marginBottom: "6px"
                    }}
                >
                    ⭐ Destination Highlights
                </div>

                <div
                    style={{
                        fontSize: "11px",
                        color: "#475569",
                        lineHeight: 1.5,
                        display: "grid",
                        gridTemplateColumns:
                            highlightSpan >= 3
                                ? "repeat(3, minmax(0, 1fr))"
                                : highlightSpan === 2
                                    ? "repeat(2, minmax(0, 1fr))"
                                    : "1fr",
                        gap: "3px 14px"
                    }}
                >
                    {proposal.destinationHighlights?.length
    ? proposal.destinationHighlights.map(
          (item, index) => (
              <div
                  key={index}
                  style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "4px"
                  }}
              >
                  <span>•</span>

                  <input
                      type="text"
                      value={item || ""}
                      onChange={e => {
                          const updatedHighlights = [
                              ...proposal.destinationHighlights
                          ];

                          updatedHighlights[index] =
                              e.target.value;

                          onChange?.({
                              ...proposal,
                              destinationHighlights:
                                  updatedHighlights
                          });
                      }}
                      style={{
                          width: "100%",
                          border: "none",
                          borderBottom:
                              "1px dashed #94a3b8",
                          outline: "none",
                          background: "transparent",
                          fontSize: "11px",
                          color: "#1f2937",
                          lineHeight: 1.5,
                          fontFamily: "inherit",
                          padding: "1px 2px",
                          boxSizing: "border-box"
                      }}
                  />
              </div>
          )
      )
    : "Highlights will appear here."}

                </div>
            </div>
        );
    })()}
</div>



      {/* SEASONAL INFORMATION */}
<div

 data-pdf-section="seasonal"

    style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px 14px",
        marginBottom: "22px",
        background: "#fff",
        boxSizing: "border-box"
    }}
>
    <div
        style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#172033",
            marginBottom: "10px"
        }}
    >
        🌤️ Seasonal Information
    </div>

    {/* SEASON / WEATHER / CLIMATE */}
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "18px",
            marginBottom:
                proposal.seasonalInformation?.seasonalHighlights?.length ||
                proposal.seasonalInformation?.seasonalAdvisory
                    ? "10px"
                    : "0"
        }}
    >
        <div>
            <div
                style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#64748b",
                    marginBottom: "3px"
                }}
            >
                🌿 Season
            </div>

            <input
    type="text"
    value={proposal.seasonalInformation?.season || ""}
    onChange={e =>
        onChange?.({
            ...proposal,
            seasonalInformation: {
                ...proposal.seasonalInformation,
                season: e.target.value
            }
        })
    }
    style={{
        width: "100%",
        border: "none",
        borderBottom: "1px dashed #94a3b8",
        outline: "none",
        background: "transparent",
        fontSize: "11px",
       color: "#1f2937",
        lineHeight: 1.45,
        fontFamily: "inherit",
        padding: "1px 2px",
        boxSizing: "border-box"
    }}
/>
        </div>

        <div>
            <div
                style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#64748b",
                    marginBottom: "3px"
                }}
            >
                🌡️ Weather
            </div>

            <textarea
    value={proposal.seasonalInformation?.weather || ""}
    onChange={e =>
        onChange?.({
            ...proposal,
            seasonalInformation: {
                ...proposal.seasonalInformation,
                weather: e.target.value
            }
        })
    }
    rows={2}
    style={{
        width: "100%",
        border: "1px dashed #94a3b8",
        borderRadius: "5px",
        outline: "none",
        background: "transparent",
        fontSize: "11px",
        color: "#1f2937",
        lineHeight: 1.45,
        fontFamily: "inherit",
        padding: "3px 5px",
        resize: "vertical",
        boxSizing: "border-box"
    }}
/>
        </div>

        <div>
            <div
                style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#64748b",
                    marginBottom: "3px"
                }}
            >
                ☁️ Climate
            </div>

           <textarea
    value={proposal.seasonalInformation?.climateNote || ""}
    onChange={e =>
        onChange?.({
            ...proposal,
            seasonalInformation: {
                ...proposal.seasonalInformation,
                climateNote: e.target.value
            }
        })
    }
    rows={2}
    style={{
        width: "100%",
        border: "1px dashed #94a3b8",
        borderRadius: "5px",
        outline: "none",
        background: "transparent",
        fontSize: "11px",
        color: "#1f2937",
        lineHeight: 1.45,
        fontFamily: "inherit",
        padding: "3px 5px",
        resize: "vertical",
        boxSizing: "border-box"
    }}
/>
        </div>
    </div>

    {/* SEASONAL HIGHLIGHTS */}
    {proposal.seasonalInformation?.seasonalHighlights?.length ? (
        <div
            style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "8px",
                marginTop: "2px"
            }}
        >
            <div
                style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#64748b",
                    marginBottom: "4px"
                }}
            >
                ✨ Seasonal Highlights
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "3px 18px",
                    fontSize: "11px",
                    color: "#475569",
                    lineHeight: 1.45
                }}
            >
                {proposal.seasonalInformation.seasonalHighlights.map(
    (item, index) => (
        <div
            key={index}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "4px"
            }}
        >
            <span>•</span>

            <input
                type="text"
                value={item || ""}
                onChange={e => {
                    const updatedHighlights = [
                        ...proposal.seasonalInformation
                            .seasonalHighlights
                    ];

                    updatedHighlights[index] =
                        e.target.value;

                    onChange?.({
                        ...proposal,
                        seasonalInformation: {
                            ...proposal.seasonalInformation,
                            seasonalHighlights:
                                updatedHighlights
                        }
                    });
                }}
                style={{
                    border: "none",
                    borderBottom: "1px dashed #94a3b8",
                    outline: "none",
                    background: "transparent",
                    fontSize: "11px",
                    color: "#1f2937",
                    lineHeight: 1.45,
                    fontFamily: "inherit",
                    padding: "1px 2px",
                    minWidth: "120px",
                    flex: 1,
                    boxSizing: "border-box"
                }}
            />
        </div>
    )
)}
            </div>
        </div>
    ) : null}

    {/* SEASONAL ADVISORY */}
    {proposal.seasonalInformation?.seasonalAdvisory ? (
    <div
        style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: "7px",
            marginTop: "7px",
            fontSize: "11px",
            color: "#475569",
            lineHeight: 1.45
        }}
    >
        <strong>⚠️ Seasonal Advisory:</strong>{" "}

        <textarea
            value={
                proposal.seasonalInformation
                    .seasonalAdvisory || ""
            }
            onChange={e =>
                onChange?.({
                    ...proposal,
                    seasonalInformation: {
                        ...proposal.seasonalInformation,
                        seasonalAdvisory: e.target.value
                    }
                })
            }
            rows={2}
            style={{
                width: "calc(100% - 165px)",
                border: "1px dashed #94a3b8",
                borderRadius: "5px",
                outline: "none",
                background: "transparent",
                fontSize: "11px",
                color: "#1f2937",
                lineHeight: 1.45,
                fontFamily: "inherit",
                padding: "3px 5px",
                resize: "vertical",
                verticalAlign: "top",
                boxSizing: "border-box"
            }}
        />
    </div>
) : null}
</div>


      {/* TRAVEL TIPS + PACKING ADVICE + OPTIONAL EXPERIENCES */}
<div

data-pdf-section="tips"

    style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "22px"
    }}
>
    {/* TRAVEL TIPS */}
    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "11px 13px",
            background: "#fff",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033",
                marginBottom: "7px"
            }}
        >
            💡 Travel Tips
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.45
            }}
        >
           {proposal.travelTips?.length
    ? proposal.travelTips.map((item, index) => (
          <div
              key={index}
              style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "4px"
              }}
          >
              <span>•</span>

              <textarea
                  value={item || ""}
                  onChange={e => {
                      const updatedTips = [
                          ...proposal.travelTips
                      ];

                      updatedTips[index] = e.target.value;

                      onChange?.({
                          ...proposal,
                          travelTips: updatedTips
                      });
                  }}
                  rows={2}
                  style={{
                      flex: 1,
                      border: "1px dashed #94a3b8",
                      borderRadius: "5px",
                      outline: "none",
                      background: "transparent",
                      fontSize: "11px",
                      color: "#1f2937",
                      lineHeight: 1.45,
                      fontFamily: "inherit",
                      padding: "3px 5px",
                      resize: "vertical",
                      boxSizing: "border-box"
                  }}
              />
          </div>
      ))
    : "Travel tips will appear here."}
        </div>
    </div>

    {/* PACKING ADVICE */}
    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "11px 13px",
            background: "#fff",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033",
                marginBottom: "7px"
            }}
        >
            🎒 Packing Advice
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.45
            }}
        >
            {proposal.packingAdvice?.length
    ? proposal.packingAdvice.map((item, index) => (
          <div
              key={index}
              style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "4px"
              }}
          >
              <span>•</span>

              <textarea
                  value={item || ""}
                  onChange={e => {
                      const updatedPacking = [
                          ...proposal.packingAdvice
                      ];

                      updatedPacking[index] = e.target.value;

                      onChange?.({
                          ...proposal,
                          packingAdvice: updatedPacking
                      });
                  }}
                  rows={2}
                  style={{
                      flex: 1,
                      border: "1px dashed #94a3b8",
                      borderRadius: "5px",
                      outline: "none",
                      background: "transparent",
                      fontSize: "11px",
                      color: "#1f2937",
                      lineHeight: 1.45,
                      fontFamily: "inherit",
                      padding: "3px 5px",
                      resize: "vertical",
                      boxSizing: "border-box"
                  }}
              />
          </div>
      ))
    : "Packing advice will appear here."}
        </div>
    </div>

    {/* OPTIONAL EXPERIENCES */}
    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "11px 13px",
            background: "#fff",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033",
                marginBottom: "7px"
            }}
        >
            ✨ Optional Experiences
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.45
            }}
        >
            {proposal.optionalExperiences?.length
    ? proposal.optionalExperiences.map((item, index) => (
          <div
              key={index}
              style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "4px"
              }}
          >
              <span>✦</span>

              <textarea
                  value={item || ""}
                  onChange={e => {
                      const updatedExperiences = [
                          ...proposal.optionalExperiences
                      ];

                      updatedExperiences[index] =
                          e.target.value;

                      onChange?.({
                          ...proposal,
                          optionalExperiences:
                              updatedExperiences
                      });
                  }}
                  rows={2}
                  style={{
                      flex: 1,
                      border: "1px dashed #94a3b8",
                      borderRadius: "5px",
                      outline: "none",
                      background: "transparent",
                      fontSize: "11px",
                      color: "#1f2937",
                      lineHeight: 1.45,
                      fontFamily: "inherit",
                      padding: "3px 5px",
                      resize: "vertical",
                      boxSizing: "border-box"
                  }}
              />
          </div>
      ))
    : "Optional experiences will appear here."}
        </div>
    </div>
</div>




      {/* PACKAGE INCLUDES + PACKAGE EXCLUDES */}
<div

 data-pdf-section="package"

    style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
        marginBottom: "22px"
    }}
>
    {/* PACKAGE INCLUDES */}
    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "11px 13px",
            background: "#fff",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033",
                marginBottom: "7px"
            }}
        >
            ✅ Package Includes
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.45
            }}
        >
            {proposal.packageIncludes?.length
                ? proposal.packageIncludes.map((item, index) => (
                      <div
                          key={index}
                          style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "4px"
                          }}
                      >
                          <span>•</span>

                          <textarea
                              value={item || ""}
                              onChange={e => {
                                  const updatedIncludes = [
                                      ...proposal.packageIncludes
                                  ];

                                  updatedIncludes[index] =
                                      e.target.value;

                                  onChange?.({
                                      ...proposal,
                                      packageIncludes:
                                          updatedIncludes
                                  });
                              }}
                              rows={2}
                              style={{
                                  flex: 1,
                                  border: "1px dashed #94a3b8",
                                  borderRadius: "5px",
                                  outline: "none",
                                  background: "transparent",
                                  fontSize: "11px",
                                  color: "#1f2937",
                                  lineHeight: 1.45,
                                  fontFamily: "inherit",
                                  padding: "3px 5px",
                                  resize: "vertical",
                                  boxSizing: "border-box"
                              }}
                          />
                      </div>
                  ))
                : "Suggested inclusions will appear here."}
        </div>
    </div>

    {/* PACKAGE EXCLUDES */}
    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "11px 13px",
            background: "#fff",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033",
                marginBottom: "7px"
            }}
        >
            ❌ Package Excludes
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.45
            }}
        >
            {proposal.packageExcludes?.length
                ? proposal.packageExcludes.map((item, index) => (
                      <div
                          key={index}
                          style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "4px"
                          }}
                      >
                          <span>•</span>

                          <textarea
                              value={item || ""}
                              onChange={e => {
                                  const updatedExcludes = [
                                      ...proposal.packageExcludes
                                  ];

                                  updatedExcludes[index] =
                                      e.target.value;

                                  onChange?.({
                                      ...proposal,
                                      packageExcludes:
                                          updatedExcludes
                                  });
                              }}
                              rows={2}
                              style={{
                                  flex: 1,
                                  border: "1px dashed #94a3b8",
                                  borderRadius: "5px",
                                  outline: "none",
                                  background: "transparent",
                                  fontSize: "11px",
                                  color: "#1f2937",
                                  lineHeight: 1.45,
                                  fontFamily: "inherit",
                                  padding: "3px 5px",
                                  resize: "vertical",
                                  boxSizing: "border-box"
                              }}
                          />
                      </div>
                  ))
                : "Suggested exclusions will appear here."}
        </div>
    </div>
</div>



{/* BUDGET PLANNING + PRICING NOTE */}

<div

 data-pdf-section="budget"

    style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
        marginBottom: "4px"
    }}
>
    {/* BUDGET PLANNING */}
    {proposal.budgetPlanningNote ? (
        <div
            style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "11px 13px",
                background: "#fff",
                boxSizing: "border-box"
            }}
        >
            <div
                style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#172033",
                    marginBottom: "5px"
                }}
            >
                💰 Budget Planning
            </div>

            <textarea
                value={proposal.budgetPlanningNote || ""}
                onChange={e => {
                    onChange?.({
                        ...proposal,
                        budgetPlanningNote: e.target.value
                    });
                }}
                rows={3}
                style={{
                    width: "100%",
                    border: "1px dashed #94a3b8",
                    borderRadius: "5px",
                    outline: "none",
                    background: "transparent",
                    fontSize: "11px",
                    color: "#1f2937",
                    lineHeight: 1.45,
                    fontFamily: "inherit",
                    padding: "3px 5px",
                    resize: "vertical",
                    boxSizing: "border-box"
                }}
            />
        </div>
    ) : (
        <div />
    )}

    {/* PRICING NOTE */}
    <div
        style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "11px 13px",
            background: "#fff",
            boxSizing: "border-box"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033",
                marginBottom: "5px"
            }}
        >
            💬 Pricing Note
        </div>

        <textarea
            value={proposal.finalPricingNote || ""}
            onChange={e => {
                onChange?.({
                    ...proposal,
                    finalPricingNote: e.target.value
                });
            }}
            rows={3}
            style={{
                width: "100%",
                border: "1px dashed #94a3b8",
                borderRadius: "5px",
                outline: "none",
                background: "transparent",
                fontSize: "11px",
                color: "#1f2937",
                lineHeight: 1.45,
                fontFamily: "inherit",
                padding: "3px 5px",
                resize: "vertical",
                boxSizing: "border-box"
            }}
        />
    </div>
</div>


    </div>
</div>



{/* DELIVERY BAR */}
<div
    style={{
        minHeight: "62px",
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        borderTop: "1px solid #e2e8f0",
        background: "#f8fafc",
        boxSizing: "border-box"
    }}
>
    <div>
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#172033"
            }}
        >
            Delivery
        </div>

        <div
            style={{
                marginTop: "2px",
                fontSize: "10px",
                color: "#64748b"
            }}
        >
            Use the final edited proposal for customer communication
        </div>
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
        }}
    >


                {/* BACK TO PROPOSAL INPUT */}
       <button
    type="button"
    onClick={e => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onClose === "function") {
        onClose();
    }
}}
    style={{
        border: "1px solid #cbd5e1",
        background: "#fff",
        color: "#334155",
        borderRadius: "7px",
        padding: "9px 14px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 700
    }}
>
    ← {isLibraryResume
    ? "Back to Proposal Library"
    : "Back to Proposal Input"}
</button>



        {/* WHATSAPP */}
        <button
            type="button"
            onClick={() => onWhatsApp?.(proposal)}
            style={{
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 14px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700
            }}
        >
            💬 WhatsApp
        </button>

        {/* EMAIL */}
        <button
            type="button"
            onClick={() => onEmail?.(proposal)}
            style={{
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 14px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700
            }}
        >
            ✉ Email
        </button>




        {/* Generate DOCX */}

       <button
    type="button"
    onClick={() => onDownloadDocx?.(proposal)}
    style={{
        padding: "9px 14px",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        background: "#fff",
        color: "#334155",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600
    }}
>
    📄 Generate DOCX
</button>
    </div>
</div>


        </div>
    );
}