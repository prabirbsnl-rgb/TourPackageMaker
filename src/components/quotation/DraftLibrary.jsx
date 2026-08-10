
import { useState, useRef, useEffect } from "react";
import orbitzLogo from "../../assets/orbitz-logo.png";

import {

    quotationStatuses,

    filterStatuses,

    statusTransitions

} from "../../data/quotationStatuses";


import {
    displayQuotationNo,
    formatRelativeDate
} from "../../utils/quotationUtils";

function getStatus(status) {

    return quotationStatuses.find(

        item => item.value === status

    ) || quotationStatuses[0];

}

const menuItemStyle = {

    padding: "11px 14px",

    cursor: "pointer",

    fontSize: "14px",

    color: "#374151",

    transition: "background .2s"

};

export default function DraftLibrary({

    open,

    drafts,

    onOpen,

    onDuplicate,

    onDelete,

    onStatusChange,

    onReviewPdf,

    onRevisionHistory,

    onClose

})

{

    
    const [searchText, setSearchText] = useState("");

    const [statusFilter, setStatusFilter] =
    useState("All");

    
    const [actionMenuFor, setActionMenuFor] =
    useState(null);

   const [expandedStatusFor, setExpandedStatusFor] =
    useState(null);

    const searchRef = useRef(null);

    useEffect(() => {

    if (open) {

        searchRef.current?.focus();

    }

}, [open]);

const statusCounts = {

    All: drafts.length

};

quotationStatuses.forEach(status => {

    statusCounts[status.value] = drafts.filter(

        draft =>

            draft.status === status.value

    ).length;

});

console.log(
    "LIBRARY DRAFTS:",
    drafts
);

console.log(
    "LIBRARY REVISION STATES:",
    drafts
        .filter(draft => draft.revisionNo > 0)
        .map(draft => ({
            quotationNo: draft.quotationNo,
            revisionNo: draft.revisionNo,
            revisionHistoryLength:
                draft.revisionHistory?.length || 0,
            clientName: draft.clientName
        }))
);

    const filteredDrafts = drafts.filter((draft) => {

    const search =
        searchText.toLowerCase();

   const matchesSearch =

    displayQuotationNo(
        draft.quotationNo
    )
        .toLowerCase()
        .includes(search)

    ||

    (draft.clientName || "")
        .toLowerCase()
        .includes(search)

    ||

    (draft.destination || "")
        .toLowerCase()
        .includes(search)

    ||

(
    draft.mobile
    || draft.commonData?.mobile
    || ""
)
    .toLowerCase()
    .includes(search);
        
    const matchesStatus =

        statusFilter === "All"

        ||

        draft.status === statusFilter;

    return (

        matchesSearch

        &&

        matchesStatus

    );

});

const latestDraft =
    drafts.length > 0
        ? drafts[0]
        : null;

if (!open) return null;


    return (

        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999
            }}
        >

            <div
                style={{
                    width: "900px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow:
                        "0 15px 40px rgba(0,0,0,.25)"
                }}
            >

                <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px"
    }}
>

    <div>

        <div
            style={{
                fontSize: "24px",
                fontWeight: 700,
                color:"#1f2937"
            }}
        >
            📂 Quotation Library
        </div>

        <div
            style={{
                marginTop: "4px",
                color: "#6b7280",
                fontSize: "14px"
            }}
        >
            Quotation Management Workspace
        </div>

    </div>

    <img
        src={orbitzLogo}
        alt="Orbitz Holidays"
        style={{
    width: "95px",
    height: "auto",
    opacity: 0.9
}}
    />

</div>

                <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "12px",
        marginBottom: "18px",
        padding: "10px 14px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "8px"
    }}
>

    <div>

        <div
            style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1f2937"
            }}
        >
            {drafts.length} Draft{drafts.length !== 1 ? "s" : ""}
        </div>

        <div
            style={{
                fontSize: "13px",
                color: "#6b7280",
                marginTop: "4px"
            }}
        >
            Saved quotations available for editing
        </div>

    </div>

    <div
    style={{
        textAlign: "right"
    }}
>

    <div
        style={{
            fontSize: "12px",
            color: "#6b7280"
        }}
    >
        Latest Quotation
    </div>

    {latestDraft ? (

        <>

            <div
                style={{
                    fontWeight: 700,
                    color: "#111827",
                    marginTop: "4px"
                }}
            >
                {displayQuotationNo(latestDraft.quotationNo)}
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#374151"
                }}
            >
                {latestDraft.clientName || "No Client"}
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#374151"
                }}
            >
                {latestDraft.destination || "-"}
            </div>

            <div
                style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px"
                }}
            >
                {formatRelativeDate(latestDraft.savedAt)}
            </div>

        </>

    ) : (

        "-"

    )}

</div>

</div>

<div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    }}
>

    <input
        type="text"
        placeholder="🔍 Search quotation, client or destination..."
        value={searchText}
        ref={searchRef}
        onChange={(e) =>
            setSearchText(e.target.value)
        }
        style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            outline: "none"
        }}
    />

</div>

<div
    style={{
        display: "flex",
        gap: "10px",
        marginBottom: "18px",
        flexWrap: "wrap"
    }}
>

    {filterStatuses.map(filter => (

        <button

            key={filter.value}

            onClick={() =>
                setStatusFilter(filter.value)
            }

            style={{

                padding: "8px 14px",

                borderRadius: "999px",

                border:

    statusFilter === filter.value

        ? `2px solid ${filter.color}`

        : "1px solid #d1d5db",

                background:

    statusFilter === filter.value

        ? `${filter.color}18`

        : "#fff",

                cursor: "pointer",

                fontWeight:700,

color:

    statusFilter === filter.value

        ? filter.color

        : "#374151",

            }}

        >

          <>
    {filter.label}

    {" ("}

    {statusCounts[filter.value]}

    {")"}
</>

        </button>

    ))}

</div>

                <hr style={{ margin: "20px 0" }} />

{filteredDrafts.length === 0 ? (

    <p>No drafts found.</p>

) : (

    <>

    

        <div

    style={{
        display: "grid",
        gridTemplateColumns:
        "1.4fr 1.5fr 1.2fr 0.9fr 1.3fr 0.9fr 0.8fr",
        fontWeight: 700,
        padding: "12px 8px",
        background: "#e5e7eb",
       borderBottom: "2px solid #9ca3af",
       color: "#1f2937",
       letterSpacing: "0.3px",
        fontSize: "14px"
    }}
>

    <div>Quotation</div>
    <div>Client</div>
    <div>Destination</div>
    <div>Duration</div>
    <div>Saved</div>
    <div>Status</div>
    <div>Actions</div>

</div>

       {filteredDrafts.map((draft, index) => {

    const status = getStatus(draft.status);

    const availableStatuses = quotationStatuses.filter(
        item =>
            statusTransitions[draft.status]?.includes(item.value)
    );

    return (

        <div

    key={draft.quotationNo}

    onDoubleClick={() => onOpen(draft)}

    onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f9fafb"
    }}

    onMouseLeave={(e) => {

   e.currentTarget.style.background =
    index % 2 === 0
        ? "#ffffff"
        : "#fafafa";

}}
    
                style={{
                    background:
    index % 2 === 0
        ? "#ffffff"
        : "#fafafa",
                    display: "grid",
                    gridTemplateColumns:
                    "1.4fr 1.5fr 1.2fr 0.9fr 1.3fr 0.9fr 0.8fr",
                    alignItems: "center",
                    padding: "12px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "14px",
                    cursor:"pointer",
                    transition:"background 0.2s"
                }}
            >

                <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px"
    }}
>

    <div
        style={{
            fontWeight: 700
        }}
    >
        {displayQuotationNo(draft.quotationNo)}
    </div>
    
{draft.revisionNo > 0 && (
    <div
        style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#7c3aed",
            marginTop: "2px"
        }}
    >
        Revision {draft.revisionNo}
    </div>
)}
    

</div>
                <div>
                    {draft.clientName || "-"}
                </div>

                <div>
    {draft.destination || "-"}
</div>

<div>
    {draft.commonData?.totalDays || 0}D / {draft.commonData?.totalNights || 0}N
</div>

<div>
    {formatRelativeDate(draft.savedAt)}
</div>

<div>

    <span
    style={{
        display: "inline-block",
        background: `${status.color}22`,
        color: status.color,
        padding: "5px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    }}
>
    {status.label}
</span>

</div>

               <div
    style={{
        position: "relative",
        display: "flex",
        gap: "8px",
        alignItems: "center"
    }}
>

                    <button
                     title="Open Draft"
                        onClick={() => onOpen(draft)}
                        style={{
    background:"#2563eb",
    color:"#fff",
    border:"none",
    padding:"6px 10px",
    fontSize:"12px",
    borderRadius:"5px",
    cursor:"pointer",
    fontWeight:600
}}
                    >
                        📂 
                    </button>

                    <button
    title="More Actions"
    onClick={() => {

        setActionMenuFor(

            actionMenuFor === draft.quotationNo

                ? null

                : draft.quotationNo

        );

    }}

    style={{

        background:"#f59e0b",

        color:"#fff",

        border:"none",

        padding:"6px 10px",

        fontSize:"12px",

        borderRadius:"5px",

        cursor:"pointer",

        fontWeight:600

    }}

>

    ⋮

</button>

{actionMenuFor === draft.quotationNo && (

    <div
        style={{
            position: "absolute",
            top: "115%",
            right: "40px",
            minWidth: "210px",
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            overflow: "hidden",
            zIndex: 500
        }}
    >

        <div
            onClick={() => {

                onDuplicate(draft);

                setActionMenuFor(null);

            }}
            style={menuItemStyle}
        >
            📄 Duplicate Quotation
        </div>

        <div
            style={{
                height: "1px",
                background: "#e5e7eb"
            }}
        />

        <div
    style={{
        padding: "10px 14px"
    }}
>

    <div

    onClick={() =>

    setExpandedStatusFor(

        expandedStatusFor === draft.quotationNo

            ? null

            : draft.quotationNo

    )

}

    style={{

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        cursor: "pointer",

        fontWeight: 700,

        color: "#374151",

        padding: "6px 0"

    }}

>

    <span>

        Change Status

    </span>

    <span>

       {expandedStatusFor === draft.quotationNo

    ? "▼"

    : "▶"}

    </span>

</div>

  {expandedStatusFor === draft.quotationNo && (

    availableStatuses.length === 0 ? (

        <div
            style={{
                padding: "8px 10px",
                color: "#6b7280",
                fontSize: "13px",
                fontStyle: "italic"
            }}
        >
            ✓ No further status changes
        </div>

    ) : (

        availableStatuses.map((item) => (

            <div

                key={item.value}

               onClick={() => {

    const confirmed = window.confirm(
        `Change Quotation Status?\n\n` +

        `${displayQuotationNo(draft.quotationNo)}\n` +

        `Client: ${draft.clientName || "No client"}\n\n` +

        `Current Status: ${draft.status || "Draft"}\n` +

        `New Status: ${item.label}\n\n` +

        `Change status to ${item.label}?`
    );

    if (!confirmed) {
        return;
    }

    onStatusChange(
        draft.quotationNo,
        item.value
    );

    setActionMenuFor(null);
    setExpandedStatusFor(null);

}}

                style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600
                }}

                onMouseEnter={(e) =>
                    e.currentTarget.style.background = "#f9fafb"
                }

                onMouseLeave={(e) =>
                    e.currentTarget.style.background = "#fff"
                }

            >

                {item.label}

            </div>

        ))

    )

)}

</div>

        <div
            style={{
                height: "1px",
                background: "#e5e7eb"
            }}
        />

        <div

    onClick={() => {

        onReviewPdf(draft);

        setActionMenuFor(null);

    }}

    style={menuItemStyle}

>

    📄 Review PDF

</div>

        <div
            style={{
                height: "1px",
                background: "#e5e7eb"
            }}
        />

       <div
    style={menuItemStyle}
    onClick={() => {
    onRevisionHistory(draft);
}}
>
    🕒 Revision History
</div>

    </div>

)}

                    <button
                     title="Delete Draft"

                        onClick={() => {

    const confirmed = window.confirm(
        `Delete Quotation?\n\n` +

        `${displayQuotationNo(draft.quotationNo)}\n` +

        `Client: ${draft.clientName || "No client"}\n` +

        `Destination: ${draft.destination || "No destination"}\n\n` +

        `This will permanently delete the quotation ` +
        `and its complete revision history.\n\n` +

        `This action cannot be undone.`
    );

    if (confirmed) {

        onDelete(
            draft.quotationNo
        );

    }

}}

                        style={{
                            background:"#dc2626",
                            color:"#fff",
                            border:"none",
                            padding:"6px 10px",
                            fontSize:"12px",
                            borderRadius:"5px",
                            cursor:"pointer",
                             fontWeight:600
                        }}
                    >
                        🗑
                    </button>

                </div>

          </div>

);

})}

    </>

)}

                <div
    style={{
        display:"flex",
        justifyContent:"flex-end",
        marginTop:"20px"
    }}
>

    <button
        onClick={onClose}
        style={{
            background:"#6b7280",
            color:"#fff",
            border:"none",
            padding:"8px 16px",
            borderRadius:"6px",
            cursor:"pointer",
            fontWeight:600
        }}
    >
        Close
    </button>

</div>

            </div>

        </div>

    );

}