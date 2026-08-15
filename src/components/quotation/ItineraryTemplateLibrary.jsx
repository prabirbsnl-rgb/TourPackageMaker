

import { useEffect, useState } from "react";

import {
    getAllTemplatesFromFirestore,
    deleteTemplateFromFirestore
} from "../../utils/quotationStorage";

const STORAGE_KEY = "orbitz_itinerary_templates";

export default function ItineraryTemplateLibrary({
    open,
    onClose,
    onSelectTemplate,
    userProfile
}) {
    const [templates, setTemplates] = useState([]);

    const [searchText, setSearchText] = useState("");

    useEffect(() => {

    if (!open) return;

    const loadTemplates = async () => {

        const firestoreTemplates =
            await getAllTemplatesFromFirestore();

        if (
    Array.isArray(firestoreTemplates)
) {

    

    

    setTemplates(
        firestoreTemplates
    );

    return;
}

        // Firestore failed → LocalStorage backup

        try {

            const stored =
                localStorage.getItem(
                    STORAGE_KEY
                );

            const parsed =
                stored
                    ? JSON.parse(stored)
                    : [];

            setTemplates(
                Array.isArray(parsed)
                    ? parsed
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load itinerary templates:",
                error
            );

            setTemplates([]);

        }

    };

    loadTemplates();

}, [open]);


    if (!open) return null;

    const normalizedSearch =
        searchText
            .toLowerCase()
            .trim();

    const filteredTemplates =
        templates.filter((template) => {

            const destination =
                String(
                    template.destination || ""
                ).toLowerCase();

            const name =
                String(
                    template.name || ""
                ).toLowerCase();

            return (
                !normalizedSearch ||
                destination.includes(
                    normalizedSearch
                ) ||
                name.includes(
                    normalizedSearch
                )
            );
        });

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background:
                    "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10000
            }}
        >

            <div
                style={{
                    width: "1000px",
                    height: "80vh",
                    maxWidth: "95vw",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow:
                        "0 15px 40px rgba(0,0,0,.25)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        padding:
                            "16px 20px",
                        borderBottom:
                            "1px solid #e5e7eb",
                        flexShrink: 0
                    }}
                >

                    <div>

                        <div
                            style={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "#1f2937"
                            }}
                        >
                            📚 Itinerary Template Library
                        </div>

                        <div
                            style={{
                                fontSize: "13px",
                                color: "#6b7280",
                                marginTop: "3px"
                            }}
                        >
                            Reusable itinerary templates
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "999px",
                            padding:
                                "7px 16px",
                            cursor: "pointer",
                            fontWeight: 700
                        }}
                    >
                        Close
                    </button>

                </div>

                {/* SEARCH */}

                <div
                    style={{
                        padding:
                            "12px 20px",
                        borderBottom:
                            "1px solid #e5e7eb",
                        flexShrink: 0
                    }}
                >

                    <input
                        type="text"
                        placeholder="🔍 Search template or destination..."
                        value={searchText}
                        onChange={(e) =>
                            setSearchText(
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            boxSizing:
                                "border-box",
                            padding:
                                "9px 12px",
                            border:
                                "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none"
                        }}
                    />

                </div>

                {/* TEMPLATE LIST */}

                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "12px 20px"
                    }}
                >

                    {filteredTemplates.length === 0 ? (

                        <div
                            style={{
                                textAlign: "center",
                                padding: "50px 20px",
                                color: "#6b7280"
                            }}
                        >
                            No itinerary templates found.
                        </div>

                    ) : (

                        filteredTemplates.map(
                            (template) => (

                                <div
                                    key={
                                        template.id
                                    }
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        padding:
                                            "12px 14px",
                                        marginBottom:
                                            "8px",
                                        border:
                                            "1px solid #e5e7eb",
                                        borderRadius:
                                            "8px",
                                        background:
                                            "#fff"
                                    }}
                                >

                                    <div>

                                        <div
    style={{
        fontWeight: 700,
        color: "#111827"
    }}
>
    {template.name || "Untitled Template"}

    {template.label?.trim()
        ? ` – ${template.label.trim()}`
        : ""}
</div>

                                        <div
                                            style={{
                                                fontSize:
                                                    "13px",
                                                color:
                                                    "#6b7280",
                                                marginTop:
                                                    "3px"
                                            }}
                                        >
                                            {
                                                template.destination ||
                                                "-"
                                            }

                                            {" • "}

                                            {
                                                template.totalNights ||
                                                0
                                            }N /{" "}

                                            {
                                                template.totalDays ||
                                                0
                                            }D
                                        </div>

                                        <div
    style={{
        fontSize: "11px",
        color: "#9ca3af",
        marginTop: "3px"
    }}
>
    Created{" "}
    {template.createdAt
        ? new Date(
            template.createdAt
        ).toLocaleDateString()
        : "-"}
</div>

<div
    style={{
        fontSize: "11px",
        color: "#9ca3af",
        marginTop: "2px"
    }}
>
    Updated{" "}
    {template.updatedAt
        ? new Date(
            template.updatedAt
        ).toLocaleDateString()
        : "-"}
</div>

                                    </div>

                                    <div
    style={{
        display: "flex",
        gap: "8px",
        alignItems: "center"
    }}
>
    <button
        type="button"
        onClick={() =>
            onSelectTemplate(
                template
            )
        }
        style={{
            background: "#1e3a8a",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "7px 14px",
            cursor: "pointer",
            fontWeight: 700
        }}
    >
        Use Template
    </button>

    <button
    type="button"

    disabled={
        userProfile?.role !== "admin"
    }

    title={
        userProfile?.role === "admin"
            ? "Delete Template"
            : "Only Admin can delete templates"
    }

    onClick={async () => {

            const confirmDelete =
                window.confirm(
                    `Delete template "${template.name}${
                        template.label?.trim()
                            ? ` – ${template.label.trim()}`
                            : ""
                    }"?`
                );

            if (!confirmDelete) {
                return;
            }

            try {

                const existing =
                    localStorage.getItem(
                        STORAGE_KEY
                    );

                const templates =
                    existing
                        ? JSON.parse(existing)
                        : [];

                const updatedTemplates =
                    templates.filter(
                        item =>
                            item.id !==
                            template.id
                    );

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        updatedTemplates
                    )
                );

                const firestoreDeleted =
    await deleteTemplateFromFirestore(
        template.id
    );

if (!firestoreDeleted) {

    console.error(
        "Template was removed locally but could not be deleted from Firestore."
    );

}

                // Refresh the library
                setTemplates(
                    updatedTemplates
                );

            } catch (error) {

                console.error(
                    "Failed to delete itinerary template:",
                    error
                );

            }

        }}
        style={{
    background:
        userProfile?.role === "admin"
            ? "#dc2626"
            : "#9CA3AF",

    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "7px 14px",

    cursor:
        userProfile?.role === "admin"
            ? "pointer"
            : "not-allowed",

    fontWeight: 700,

    opacity:
        userProfile?.role === "admin"
            ? 1
            : 0.6
}}
    >
        🗑 Delete
    </button>
</div>
                                </div>

                            )
                        )

                    )}

                </div>

            </div>

        </div>
    );
}