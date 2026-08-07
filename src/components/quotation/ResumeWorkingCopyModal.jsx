


import orbitzLogo from "../../assets/orbitz-logo.png";

import {
    displayQuotationNo,
    formatRelativeDate
} from "../../utils/quotationUtils";

export default function ResumeWorkingCopyModal({

    open,
    workingCopy,

    onResume,
    onDiscard

}) {

    if (!open || !workingCopy) return null;

    return (

        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 99999
            }}
        >

            <div
                style={{
                    width: "500px",
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "28px",
                    boxShadow:
                        "0 20px 60px rgba(0,0,0,.25)"
                }}
            >

                <div
    style={{
        textAlign: "center",
        marginBottom: "16px"
    }}
>

    <img
        src={orbitzLogo}
        alt="Orbitz Holidays"
        style={{
            width: "180px",
            height: "auto",
            marginBottom: "12px"
        }}
    />

    <div
        style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827"
        }}
    >
        Resume Previous Work
    </div>

    <div
        style={{
            marginTop: "6px",
            color: "#6b7280",
            fontSize: "14px"
        }}
    >
        An unsaved quotation was found.
    </div>

    <div
    style={{
        marginTop: "16px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
        padding: "8px 16px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 700
    }}
>
    <span
        style={{
            width: "10px",
            height: "10px",
            background: "#dc2626",
            borderRadius: "50%",
            display: "inline-block"
        }}
    />

    Working Copy
</div>

</div>

<div
    style={{
        display: "flex",
        justifyContent: "space-between"
    }}
>

    <span
        style={{
            color: "#6b7280"
        }}
    >
        Quotation
    </span>

    <strong
        style={{
            color: "#2563eb"
        }}
    >
        {workingCopy.commonData?.quotationNo
            ? displayQuotationNo(
                workingCopy.commonData.quotationNo
            )
            : "-"}
    </strong>

</div>

                
                <div
    style={{
        marginTop: "24px",
        marginBottom: "28px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "16px",
        lineHeight: 2
    }}
>

                    <div
    style={{
        display: "flex",
        justifyContent: "space-between"
    }}
>

    <span
        style={{
            color: "#6b7280"
        }}
    >
        Client
    </span>

    <strong>
        {workingCopy.commonData?.clientName || "-"}
    </strong>

</div>

                    <div
    style={{
        display: "flex",
        justifyContent: "space-between"
    }}
>

    <span
        style={{
            color: "#6b7280"
        }}
    >
        Destination
    </span>

    <strong>
        {workingCopy.commonData?.destination || "-"}
    </strong>

</div>

                    <div
    style={{
        display: "flex",
        justifyContent: "space-between"
    }}
>

    <span
        style={{
            color: "#6b7280"
        }}
    >
        Last Saved
    </span>

    <strong>
        {formatRelativeDate(
    workingCopy.savedAt
)}
    </strong>

</div>

                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "28px"
                    }}
                >

                    <button
                        onClick={onDiscard}
                        style={{
                            background:"#dc2626",
                            color:"#fff",
                            border:"none",
                           padding:"12px",
                            borderRadius:"8px",
                            cursor:"pointer",
                            flex: 1,
                            fontWeight:600
                        }}
                    >
                        Discard
                    </button>

                    <button
                        onClick={onResume}
                        style={{
                            background:"#2563eb",
                            color:"#fff",
                            border:"none",
                            padding:"12px",
                            borderRadius:"8px",
                            cursor:"pointer",
                            flex: 1,
                            fontWeight:600
                        }}
                    >
                        Resume
                    </button>

                </div>

            </div>

        </div>

    );

}