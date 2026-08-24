

import { useEffect, useState } from "react";

import {
    getAllUserProfiles,
    updateUserStatus
} from "../../utils/quotationStorage";

export default function AdminUserManagement() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = async () => {


        setLoading(true);
        setError("");

        const result =
            await getAllUserProfiles();

        if (Array.isArray(result)) {

            setUsers(result);

        } else {

            setError(
                "Unable to load Orbitz user profiles."
            );

        }

        setLoading(false);
    };

    const handleStatusChange = async (
    uid,
    newStatus
) => {

    const success =
        await updateUserStatus(
            uid,
            newStatus
        );

    if (!success) {

        alert(
            "Unable to update user status."
        );

        return;
    }

    await loadUsers();
};

    useEffect(() => {

        loadUsers();

    }, []);

    return (
        <div
            style={{
                padding: "25px",
                maxWidth: "1000px",
                margin: "0 auto"
            }}
        >

          <div
    style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "25px",
        minHeight: "70px"
    }}
>
    <img
        src="/orbitz-logo.png"
        alt="Orbitz Holidays"
        style={{
            position: "absolute",
            left: "15px",
            width: "175px",
            height: "auto",
            objectFit: "contain"
        }}
    />

    <div style={{ textAlign: "center" }}>
        <h2
            style={{
                color: "#1E3A8A",
                margin: 0,
                marginBottom: "5px"
            }}
        >
             User Management
        </h2>

        <p
            style={{
                color: "#6B7280",
                margin: 0
            }}
        >
            Manage staff access to the quotation system
        </p>
    </div>
</div>
            {loading && (
                <p>Loading users...</p>
            )}

            {error && (
                <div
                    style={{
                        color: "#DC2626",
                        marginBottom: "15px"
                    }}
                >
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                users.map((item) => (

                    <div
    key={item.uid}
    style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",

        padding: "20px 26px",
        marginBottom: "14px",

        border:
            item.role === "admin"
                ? "1px solid #D9E0F2"
                : "1px solid #E5E7EB",

        borderRadius: "14px",

        background:
            item.role === "admin"
                ? "#FAFBFF"
                : "#FFFFFF",

        boxShadow:
            "0 3px 10px rgba(15, 23, 42, 0.06)",

        minHeight: "112px",
        boxSizing: "border-box"
    }}
>
    {/* USER ICON */}
    <div
        style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            background:
                item.role === "admin"
                    ? "#EEF0FF"
                    : "#F4F5F7",

            flexShrink: 0
        }}
    >
        {item.role === "admin" ? (
            /* ADMIN SHIELD ICON */
            <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4338CA"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 3L20 6V11C20 16.2 16.6 20 12 21C7.4 20 4 16.2 4 11V6L12 3Z" />

                <path d="M12 7.5L13.1 9.7L15.5 10L13.75 11.7L14.15 14.1L12 13L9.85 14.1L10.25 11.7L8.5 10L10.9 9.7L12 7.5Z" />
            </svg>
        ) : (
            /* STAFF USER ICON */
            <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3155C7"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle
                    cx="12"
                    cy="8"
                    r="4"
                />

                <path
                    d="M4 21C4.8 16.8 7.5 14.5 12 14.5C16.5 14.5 19.2 16.8 20 21"
                />
            </svg>
        )}
    </div>

    {/* USER INFORMATION */}
    <div
        style={{
            flex: 1,
            minWidth: 0
        }}
    >
        {/* USERNAME + ROLE */}
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}
        >
            <div
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111827"
                }}
            >
                {item.username || "Unnamed User"}
            </div>

            {/* ROLE CAPSULE */}
            <div
                style={{
                    padding: "7px 13px",
                    borderRadius: "999px",

                    background:
                        item.role === "admin"
                            ? "#EEF0FF"
                            : "#F3F4F6",

                    color:
                        item.role === "admin"
                            ? "#4338CA"
                            : "#4B5563",

                    fontSize: "11px",
                    fontWeight: 700,

                    textTransform: "uppercase",
                    letterSpacing: "0.4px"
                }}
            >
                {item.role || "-"}
            </div>
        </div>

        {/* UID DIRECTLY UNDER USERNAME */}
        <div
            style={{
                marginTop: "14px",

                display: "flex",
                alignItems: "center",
                gap: "8px",

                fontSize: "13px",
                color: "#64748B",

                fontFamily: "monospace"
            }}
        >
            <span
                style={{
                    color: "#64748B",
                    fontWeight: 600
                }}
            >
                UID:
            </span>

            <span
                style={{
                    color: "#64748B"
                }}
            >
                {item.uid}
            </span>
        </div>
    </div>

    {/* STATUS + ACTIONS */}
    <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            flexShrink: 0
        }}
    >

        {/* STATUS */}
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",

                width: "72px",
                height: "32px",

                boxSizing: "border-box",
                padding: 0,

                borderRadius: "999px",

                fontSize: "12px",
                fontWeight: 700,

                background:
                    item.status === "active"
                        ? "#DCFCE7"
                        : item.status === "pending"
                            ? "#FEF3C7"
                            : "#FEE2E2",

                color:
                    item.status === "active"
                        ? "#15803D"
                        : item.status === "pending"
                            ? "#92400E"
                            : "#B91C1C"
            }}
        >
            {item.status || "unknown"}
        </div>

        {/* STAFF ACTION */}
        {item.role === "staff" && (
            <>
                {item.status !== "active" && (
                    <button
                        type="button"
                        onClick={() =>
                            handleStatusChange(
                                item.uid,
                                "active"
                            )
                        }
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",

                            width: "72px",
                            height: "32px",

                            boxSizing: "border-box",
                            padding: 0,

                            background: "#16A34A",
                            color: "#fff",

                            border: "none",
                            borderRadius: "999px",

                            cursor: "pointer",

                            fontWeight: 700,
                            fontSize: "12px"
                        }}
                    >
                        Approve
                    </button>
                )}

                {item.status === "active" && (
                    <button
                        type="button"
                        onClick={() =>
                            handleStatusChange(
                                item.uid,
                                "disabled"
                            )
                        }
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",

                            width: "72px",
                            height: "32px",

                            boxSizing: "border-box",
                            padding: 0,

                            background: "#DC2626",
                            color: "#fff",

                            border: "none",
                            borderRadius: "999px",

                            cursor: "pointer",

                            fontWeight: 700,
                            fontSize: "12px"
                        }}
                    >
                        Disable
                    </button>
                )}
            </>
        )}
    </div>
</div>

        ))}

        </div>
    );
}