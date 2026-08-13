
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

    const normalizeSearchValue = (value) => {

    let normalized =
        String(value || "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[-()]/g, "");

    // Normalize Indian mobile numbers
    // so +91 98765 43210 matches 9876543210
    if (
        normalized.startsWith("+91") &&
        normalized.length === 13
    ) {
        normalized =
            normalized.slice(3);
    }

    return normalized;
};

    
    const [searchText, setSearchText] = useState("");

    const [sortBy, setSortBy] = useState("");

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




    const filteredDrafts = drafts.filter((draft) => {

    const search =
    normalizeSearchValue(searchText);

    

   const matchesSearch =

    normalizeSearchValue(
        displayQuotationNo(
            draft.quotationNo
        )
    ).includes(search)

    ||

    normalizeSearchValue(
        draft.clientName
    ).includes(search)

    ||

    normalizeSearchValue(
        draft.destination
    ).includes(search)

    ||

    normalizeSearchValue(
        draft.mobile
        || draft.commonData?.mobile
    ).includes(search);

    const matchesStatus =

        statusFilter === "All"

         ||

        draft.status === statusFilter;

    return matchesSearch && matchesStatus;

});

const sortedDrafts = [...filteredDrafts].sort((a, b) => {

    switch (sortBy) {

        case "newest":
            return (
                new Date(b.savedAt) -
                new Date(a.savedAt)
            );

        case "oldest":
            return (
                new Date(a.savedAt) -
                new Date(b.savedAt)
            );

        case "clientAZ":
            return (
                (a.clientName || "")
                    .toLowerCase()
                    .localeCompare(
                        (b.clientName || "")
                            .toLowerCase()
                    )
            );

        case "clientZA":
            return (
                (b.clientName || "")
                    .toLowerCase()
                    .localeCompare(
                        (a.clientName || "")
                            .toLowerCase()
                    )
            );

        case "quotationAsc":
            return (
                displayQuotationNo(a.quotationNo)
                    .localeCompare(
                        displayQuotationNo(
                            b.quotationNo
                        ),
                        undefined,
                        {
                            numeric: true
                        }
                    )
            );

        case "quotationDesc":
            return (
                displayQuotationNo(b.quotationNo)
                    .localeCompare(
                        displayQuotationNo(
                            a.quotationNo
                        ),
                        undefined,
                        {
                            numeric: true
                        }
                    )
            );

        case "destinationAZ":
            return (
                (a.destination || "")
                    .toLowerCase()
                    .localeCompare(
                        (b.destination || "")
                            .toLowerCase()
                    )
            );

        case "destinationZA":
            return (
                (b.destination || "")
                    .toLowerCase()
                    .localeCompare(
                        (a.destination || "")
                            .toLowerCase()
                    )
            );

        default:
            return 0;
    }

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
       width: "96vw",
       maxWidth: "1400px",
        height: "92vh",
        maxHeight: "92vh",
        background: "#fff",
        borderRadius: "12px",
        boxShadow:
            "0 15px 40px rgba(0,0,0,.25)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    }}
>

                <div
    style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 14px",
        flexShrink: 0,
        background: "#fff",
        zIndex: 10
    }}
>

    <div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: 700,
                color:"#1f2937"
            }}
        >
            📂 Quotation Library
        </div>

        <div
            style={{
                marginTop: "1px",
                color: "#6b7280",
                fontSize: "11px"
            }}
        >
            Quotation Management Workspace
        </div>

    </div>

    <div
    style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center"
    }}
>
    <img
        src={orbitzLogo}
        alt="Orbitz Holidays"
        style={{
            width: "150px",
            height: "auto",
            opacity: 0.9
        }}
    />
</div>

<button
    onClick={onClose}
    title="Close Quotation Library"
    style={{
        background: "#dc2626",
        color: "#fff",
        border: "none",
        padding: "6px 14px",
        borderRadius: "999px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1,
        marginLeft: "auto"
    }}
>
    Close
</button>

</div>

                <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "4px 0 6px",
        padding: "6px 10px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        minHeight: "48px"
    }}
>

    <div>

        <div
            style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#1f2937"
            }}
        >
            {drafts.length} Draft{drafts.length !== 1 ? "s" : ""}
        </div>

        <div
            style={{
                fontSize: "11px",
                color: "#6b7280",
                marginTop: "1px"
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
        fontSize: "10px",
        color: "#6b7280",
        lineHeight: 1
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
        marginTop: "1px",
        lineHeight: 1.1
    }}
>
                {displayQuotationNo(latestDraft.quotationNo)}
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: 1.1
                }}
            >
                {latestDraft.clientName || "No Client"}
            </div>

            <div
                style={{
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: 1.1
                }}
            >
                {latestDraft.destination || "-"}
            </div>

            <div
                style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "1px",
                    lineHeight: 1.1
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

   <div
    style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateRows: "auto auto auto auto 1fr",
        overflow: "hidden"
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
            width: "100%",
            boxSizing: "border-box",
            padding: "7px 42px 7px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            outline: "none"
        }}
    />

    {searchText && (
        <button
            type="button"
            title="Clear Search"
            onClick={() => {
                setSearchText("");
                searchRef.current?.focus();
            }}
            

             onMouseEnter={(e) => {
        e.currentTarget.style.background = "#e5e7eb";
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f3f4f6";
    }}

            style={{
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "28px",
    height: "28px",
    border: "1px solid #d1d5db",
    background: "#f3f4f6",
    color: "#374151",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 800,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    padding: 0
}}
        >
            ×
        </button>
    )}
</div>

<select
    value={sortBy}
    onChange={(e) =>
        setSortBy(e.target.value)
    }
    style={{
        padding: "7px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#fff",
        fontSize: "14px",
        cursor: "pointer",
        outline: "none"
    }}
>
    <option value="">
    Default Order
</option>

    <option value="newest">
        Newest First
    </option>

    <option value="oldest">
        Oldest First
    </option>

    <option value="clientAZ">
        Client A–Z
    </option>

    <option value="clientZA">
        Client Z–A
    </option>

    <option value="quotationAsc">
    Quotation No. — Low to High
</option>

<option value="quotationDesc">
    Quotation No. — High to Low
</option>

    <option value="destinationAZ">
        Destination A–Z
    </option>

    <option value="destinationZA">
        Destination Z–A
    </option>
</select>

</div>



<div
    style={{
        display: "flex",
        gap: "10px",
        padding: "0 16px",
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

               padding: "4px 9px",

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

                fontSize: "12px",

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
<hr
    style={{
        margin: "2px 0",
        border: 0,
        borderTop: "1px solid #e5e7eb"
    }}
/>

{filteredDrafts.length === 0 ? (

    <p>No drafts found.</p>

) : (

    <>

    

       

   <div
    style={{
        height: "45vh",
        overflowY: "auto",
        padding: "0 8px 24px",
        boxSizing: "border-box"
    }}
>

    <div
    style={{
        display: "grid",
       gridTemplateColumns:
    "1.25fr 1.4fr 1.15fr 0.8fr 1.45fr 1fr 0.75fr",
        padding: "6px 8px",
        background: "#e5e7eb",
        borderBottom: "2px solid #9ca3af",
        color: "#1f2937",
        letterSpacing: "0.3px",
        fontSize: "14px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxSizing: "border-box"
    }}
>
    <div style={{ textAlign: "left" }}>
    Quotation
</div>

<div style={{ textAlign: "left" }}>
    Client
</div>

<div style={{ textAlign: "left" }}>
    Destination
</div>

<div style={{ textAlign: "left" }}>
    Duration
</div>

<div style={{ textAlign: "center" }}>
    Saved
</div>

<div style={{ textAlign: "center" }}>
    Status
</div>

<div style={{ textAlign: "center" }}>
    Actions
</div>

</div>

    {sortedDrafts.map((draft, index) => {

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
    "1.25fr 1.4fr 1.15fr 0.8fr 1.45fr 1fr 0.75fr",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "14px",
                    cursor:"pointer",
                    transition:"background 0.2s"
                }}
            >

                <div
    style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "2px"
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
        lineHeight: 1.1
    }}
>
    Revision {draft.revisionNo}
</div>
)}
    

</div>
                <div
    style={{
        minWidth: 0,
        textAlign: "left"
    }}
>
    {draft.clientName || "-"}
</div>


                <div
    style={{
        minWidth: 0,
        textAlign: "left"
    }}
>
    {draft.destination || "-"}
</div>

<div
    style={{
        minWidth: 0,
        textAlign: "left"
    }}
>
    {draft.commonData?.totalDays || 0}D / {draft.commonData?.totalNights || 0}N
</div>

<div
    style={{
        minWidth: 0,
        textAlign: "center"
    }}
>
    {formatRelativeDate(draft.savedAt)}
</div>

<div
    style={{
        display: "flex",
        justifyContent: "center",
        minWidth: 0,
        alignItems: "center"
    }}
>

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
        alignItems: "center",
        justifyContent: "center"
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
    right: "0",
    minWidth: "220px",
    padding: "8px",
    background: "#ffffff",
    border: "2px solid #374151",
    borderRadius: "12px",
    boxShadow: "0 12px 30px rgba(0,0,0,.18)",
    zIndex: 500
}}
    >

        <div
    onClick={() => {

        const confirmed = window.confirm(
            `Duplicate Quotation?\n\n` +

            `${displayQuotationNo(draft.quotationNo)}\n` +

            `Client: ${draft.clientName || "No client"}\n` +

            `Destination: ${draft.destination || "No destination"}\n\n` +

            `A new quotation will be created as a separate quotation.\n\n` +

            `Revision history will NOT be copied.\n\n` +

            `The new quotation will start as an Original Draft ` +
            `with no revisions.\n\n` +

            `Continue?`
        );

        if (!confirmed) {
            return;
        }

        onDuplicate(draft);

        setActionMenuFor(null);

    }}
    style={{
    background: "#1e3a8a",
    color: "#fff",
    padding: "9px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "left",
    marginBottom: "6px",
    whiteSpace: "nowrap"
}}

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
        padding: "0",
        marginBottom: "6px"
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
    color: "#fff",
   background: "#1e3a8a",
    padding: "9px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    marginBottom: "6px"
}}

>

    <span>
    🔄 Change Status
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
    padding: "7px 12px",
    marginTop: "5px",
    background: "#fff",
    color: "#111827",
    border: "1px solid #111827",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
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

    style={{
   background: "#1e3a8a",
    color: "#fff",
    padding: "9px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "left",
    marginBottom: "6px",
    whiteSpace: "nowrap"
}}

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
    style={{
    background: "#1e3a8a",
    color: "#fff",
    padding: "9px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap"
}}
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

</div>

</>
)}


                

            </div>

        </div>

    );

}
