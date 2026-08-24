

import React, { useEffect, useRef, useState } from "react";

export default function DatePicker({
    value,
    onChange,
    placeholder = "Select date",
    minDate = "",
    initialViewDate = "",
    onOpen
}) {

    const [open, setOpen] = useState(false);

    const [viewDate, setViewDate] =
        useState(() => {

            const source =
                initialViewDate ||
                value ||
                new Date()
                    .toISOString()
                    .slice(0, 10);

            return new Date(`${source}T00:00:00`);
        });

    const pickerRef = useRef(null);


    /* ---------------------------------- */
    /* Synchronize calendar view          */
    /* ---------------------------------- */

    useEffect(() => {

        if (!open || !initialViewDate) {
            return;
        }

        const nextDate =
            new Date(
                `${initialViewDate}T00:00:00`
            );

        if (!Number.isNaN(nextDate.getTime())) {

            setViewDate(nextDate);

        }

    }, [initialViewDate, open]);


    /* ---------------------------------- */
    /* Close when clicking outside        */
    /* ---------------------------------- */

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                pickerRef.current &&
                !pickerRef.current.contains(
                    event.target
                )
            ) {

                setOpen(false);

            }

        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    /* ---------------------------------- */
    /* Helpers                            */
    /* ---------------------------------- */

    const formatDisplayDate = (dateValue) => {

        if (!dateValue) {
            return "";
        }

        const date =
            new Date(`${dateValue}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    };


    const formatInputDate = (date) => {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    };


    const isSameDay = (
        date,
        dateValue
    ) => {

        if (!dateValue) {
            return false;
        }

        const selected =
            new Date(
                `${dateValue}T00:00:00`
            );

        return (
            date.getFullYear() ===
                selected.getFullYear() &&
            date.getMonth() ===
                selected.getMonth() &&
            date.getDate() ===
                selected.getDate()
        );

    };


    const isBeforeMinDate = (date) => {

        if (!minDate) {
            return false;
        }

        const minimum =
            new Date(
                `${minDate}T00:00:00`
            );

        return date < minimum;

    };


    /* ---------------------------------- */
    /* Calendar                            */
    /* ---------------------------------- */

    const year =
        viewDate.getFullYear();

    const month =
        viewDate.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousMonth = () => {

        setViewDate(
            new Date(
                year,
                month - 1,
                1
            )
        );

    };


    const nextMonth = () => {

        setViewDate(
            new Date(
                year,
                month + 1,
                1
            )
        );

    };


    const selectDate = (day) => {

        const selectedDate =
            new Date(
                year,
                month,
                day
            );

        if (
            isBeforeMinDate(
                selectedDate
            )
        ) {
            return;
        }

        const dateValue =
            formatInputDate(
                selectedDate
            );

        onChange(dateValue);

        setOpen(false);

    };


    return (

        <div
            ref={pickerRef}
            style={{
                position: "relative",
                flex: 1,
                minWidth: 0
            }}
        >

            {/* INPUT */}

            <button
                type="button"
                onClick={() => {

                    const nextOpen =
                        !open;

                    setOpen(nextOpen);

                    if (
                        nextOpen &&
                        onOpen
                    ) {
                        onOpen();
                    }

                }}
                style={{
                    ...inputStyle,
                    width: "100%",
                    height: "40px",
                    marginBottom: 0,
                    boxSizing: "border-box",

                    background: "#fff",
                    cursor: "pointer",

                    textAlign: "left",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >

                <span
                    style={{
                        color:
                            value
                                ? "#111827"
                                : "#9ca3af"
                    }}
                >
                    {value
                        ? formatDisplayDate(
                            value
                        )
                        : placeholder}
                </span>

                <span>
                    📅
                </span>

            </button>


            {/* CALENDAR */}

            {open && (

                <div
                    style={{
                        position: "absolute",
                        top: "46px",
                        left: 0,

                        width: "290px",

                        background: "#fff",

                        border:
                            "1px solid #d1d5db",

                        borderRadius: "10px",

                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.15)",

                        padding: "12px",

                        zIndex: 1000
                    }}
                >

                    {/* HEADER */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",

                            marginBottom: "10px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={
                                previousMonth
                            }
                            style={{
                                border: "none",
                                background:
                                    "#f1f5f9",
                                borderRadius: "6px",
                                width: "32px",
                                height: "32px",
                                cursor: "pointer"
                            }}
                        >
                            ‹
                        </button>


                        <strong
                            style={{
                                fontSize: "14px",
                                color:
                                    "#111827"
                            }}
                        >
                            {viewDate.toLocaleDateString(
                                "en-US",
                                {
                                    month:
                                        "long",
                                    year:
                                        "numeric"
                                }
                            )}
                        </strong>


                        <button
                            type="button"
                            onClick={
                                nextMonth
                            }
                            style={{
                                border: "none",
                                background:
                                    "#f1f5f9",
                                borderRadius: "6px",
                                width: "32px",
                                height: "32px",
                                cursor: "pointer"
                            }}
                        >
                            ›
                        </button>

                    </div>


                    {/* WEEKDAYS */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(7, 1fr)",
                            gap: "3px",
                            marginBottom: "4px"
                        }}
                    >

                        {[
                            "Su",
                            "Mo",
                            "Tu",
                            "We",
                            "Th",
                            "Fr",
                            "Sa"
                        ].map(
                            (day) => (

                                <div
                                    key={day}
                                    style={{
                                        textAlign:
                                            "center",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            700,
                                        color:
                                            "#64748b",
                                        padding:
                                            "4px 0"
                                    }}
                                >
                                    {day}
                                </div>

                            )
                        )}

                    </div>


                    {/* DAYS */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(7, 1fr)",
                            gap: "3px"
                        }}
                    >

                        {Array.from(
                            {
                                length:
                                    firstDay
                            }
                        ).map(
                            (_, index) => (

                                <div
                                    key={
                                        `empty-${index}`
                                    }
                                />

                            )
                        )}


                        {Array.from(
                            {
                                length:
                                    daysInMonth
                            }
                        ).map(
                            (_, index) => {

                                const day =
                                    index + 1;

                                const date =
                                    new Date(
                                        year,
                                        month,
                                        day
                                    );

                                const disabled =
                                    isBeforeMinDate(
                                        date
                                    );

                                const selected =
                                    isSameDay(
                                        date,
                                        value
                                    );

                                return (

                                    <button
                                        key={day}
                                        type="button"
                                        disabled={
                                            disabled
                                        }
                                        onClick={() =>
                                            selectDate(
                                                day
                                            )
                                        }
                                        style={{
                                            height:
                                                "32px",

                                            border:
                                                "none",

                                            borderRadius:
                                                "6px",

                                            cursor:
                                                disabled
                                                    ? "not-allowed"
                                                    : "pointer",

                                            background:
                                                selected
                                                    ? "#2563eb"
                                                    : "transparent",

                                            color:
                                                selected
                                                    ? "#fff"
                                                    : disabled
                                                        ? "#cbd5e1"
                                                        : "#111827",

                                            fontSize:
                                                "12px",

                                            fontWeight:
                                                selected
                                                    ? 700
                                                    : 500
                                        }}
                                    >
                                        {day}
                                    </button>

                                );

                            }
                        )}

                    </div>

                </div>

            )}

        </div>

    );

}


/*
 * Shared input styling fallback.
 *
 * QuoteForm passes its own inputStyle visually,
 * but the component needs a safe local base.
 */
const inputStyle = {
    border:
        "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "13px",
    color: "#111827",
    background: "#fff"
};