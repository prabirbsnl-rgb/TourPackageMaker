

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
        justifyContent: "space-between",
        padding: "18px 22px",
        background:
            "linear-gradient(135deg, #f5f9ff 0%, #ffffff 100%)",
        borderBottom: "1px solid #dbe4ee",
        flexShrink: 0
    }}
>

                    <div>

                        <div
                            style={{
                               fontSize: "21px",
                               fontWeight: 800,
                               color: "#172033",
                               letterSpacing: "-0.3px"
                            }}
                        >
                            📚 Itinerary Template Library
                        </div>

                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#64748b",
                                marginTop: "4px"
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
        padding: "12px 20px",
        background: "#f4f7fb",
        borderBottom: "1px solid #dbe4ee",
        flexShrink: 0
    }}
>
    <div
        style={{
            position: "relative",
            width: "100%"
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
                boxSizing: "border-box",
                padding: "9px 38px 9px 12px",
                border: "1px solid #d5dee8",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#172033",
                fontSize: "13px",
                outline: "none",
                boxShadow:
                    "0 1px 4px rgba(23,51,79,.05)"
            }}
        />

        {searchText.trim() && (
            <button
                type="button"
                onClick={() => {
                    setSearchText("");
                }}
                title="Clear search"
                aria-label="Clear search"
                style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform:
                        "translateY(-50%)",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    borderRadius: "50%",
                    background: "#eef2f7",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: 1,
                    padding: 0
                }}
            >
                ×
            </button>
        )}

    </div>
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
    key={template.id}
    style={{
    display: "grid",
    gridTemplateColumns:
        "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "14px",
    minHeight: "50px",
    padding: "7px 10px 7px 12px",
    marginBottom: "6px",
    border: "1px solid #d9e3ed",
    borderRadius: "9px",
    background:
        "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
    boxShadow:
        "0 2px 5px rgba(23,51,79,.045)",
    transition:
        "border-color .15s ease, box-shadow .15s ease"
}}
>

    {/* TEMPLATE INFORMATION — SINGLE LINE */}
    <div
        style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            gap: "8px",
            whiteSpace: "nowrap"
        }}
    >

        {/* Template icon */}
        <span
            style={{
                width: "27px",
                height: "27px",
                borderRadius: "7px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
               background: "#edf3ff",
color: "#1e3a8a",
border: "1px solid #dbe6ff",
                fontSize: "14px",
                flexShrink: 0
            }}
        >
            📋
        </span>


        {/* Template title */}
        <span
    style={{
        minWidth: 0,
        display: "inline-flex",
        alignItems: "center",
        overflow: "hidden",
        whiteSpace: "nowrap"
    }}
>
   <span
    style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "13px",
fontWeight: 700,
color: "#125C55",
letterSpacing: "0.05px"
    }}
>
        {(template.name ||
            "Untitled Template")
            .replace(
                /\s*[-–—]?\s*\d+\s*N\s*\/\s*\d+\s*D\s*$/i,
                ""
            )
            .trim()}
    </span>

    <span
        style={{
            flexShrink: 0,
            marginLeft: "6px",
            fontSize: "12px",
fontWeight: 600,
color: "#6B8F8C"
        }}
    >
        • {template.totalNights || 0}N /{" "}
        {template.totalDays || 0}D
    </span>
</span>


        {/* Created / Updated */}
        <span
            style={{
                flexShrink: 0,
                fontSize: "10px",
                fontWeight: 500,
                color: "#94a3b8",
                marginLeft: "8px"
            }}
        >
            Created{" "}
            {template.createdAt
                ? new Date(
                    template.createdAt
                ).toLocaleDateString()
                : "-"}

            {" • "}

            Updated{" "}
            {template.updatedAt
                ? new Date(
                    template.updatedAt
                ).toLocaleDateString()
                : "-"}
        </span>

    </div>


    {/* ACTIONS */}
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            flexShrink: 0
        }}
    >

        {/* USE TEMPLATE */}
        <button
            type="button"
            onClick={() =>
                onSelectTemplate(
                    template
                )
            }
            style={{
                height: "30px",
                padding: "0 13px",
                background:
                    "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
                color: "#fff",
                border: "1px solid #1e40af",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow:
                    "0 2px 4px rgba(30,58,138,.16)"
            }}
        >
            Use Template
        </button>


        {/* DELETE */}
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
                height: "30px",
                padding: "0 11px",
                background:
                    userProfile?.role === "admin"
                        ? "#fff1f2"
                        : "#f1f5f9",
                color:
                    userProfile?.role === "admin"
                        ? "#dc2626"
                        : "#9ca3af",
                border:
                    userProfile?.role === "admin"
                        ? "1px solid #fecdd3"
                        : "1px solid #e2e8f0",
                borderRadius: "7px",
                cursor:
                    userProfile?.role === "admin"
                        ? "pointer"
                        : "not-allowed",
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                opacity:
                    userProfile?.role === "admin"
                        ? 1
                        : 0.65
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