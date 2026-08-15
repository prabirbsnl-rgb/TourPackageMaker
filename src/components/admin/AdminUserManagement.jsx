

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

            <h2
                style={{
                    color: "#1E3A8A",
                    marginBottom: "5px"
                }}
            >
                Orbitz User Management
            </h2>

            <p
                style={{
                    color: "#6B7280",
                    marginTop: 0,
                    marginBottom: "20px"
                }}
            >
                Manage staff access to the quotation system.
            </p>

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
                            justifyContent: "space-between",
                            gap: "20px",
                            padding: "14px 16px",
                            marginBottom: "10px",
                            border: "1px solid #E5E7EB",
                            borderRadius: "10px",
                            background: "#fff"
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    fontWeight: 700,
                                    color: "#111827"
                                }}
                            >
                                {item.username || "Unnamed User"}
                            </div>

                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#6B7280",
                                    marginTop: "3px"
                                }}
                            >
                                Role: {item.role || "-"}
                            </div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#9CA3AF",
                                    marginTop: "2px"
                                }}
                            >
                                UID: {item.uid}
                            </div>

                        </div>

                        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "8px"
    }}
>

    <div
        style={{
            padding: "6px 12px",
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
                    ? "#166534"
                    : item.status === "pending"
                        ? "#92400E"
                        : "#991B1B"
        }}
    >
        {item.status || "unknown"}
    </div>

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
                        background: "#16A34A",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "7px 12px",
                        cursor: "pointer",
                        fontWeight: 600
                    }}
                >
                    Approve
                </button>
            )}

            {item.status === "active" && (
                <button
                    type="button"
                    onClick={() => {

    const confirmed =
        window.confirm(
            `Disable ${item.username || "this staff user"}?`
        );

    if (!confirmed) {
        return;
    }

    handleStatusChange(
        item.uid,
        "disabled"
    );

}}
                    style={{
                        background: "#DC2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "7px 12px",
                        cursor: "pointer",
                        fontWeight: 600
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