
import { useState, useRef, useEffect } from "react";
import orbitzLogo from "../../assets/orbitz-logo.png";

import {
    displayQuotationNo,
    formatSavedDate
} from "../../utils/quotationUtils";


export default function DraftLibrary({

    open,

    drafts,

    onOpen,

    onDelete,

    onClose

}) {

    
    const [searchText, setSearchText] = useState("");

    const searchRef = useRef(null);

    useEffect(() => {

    if (open) {

        searchRef.current?.focus();

    }

}, [open]);

    const filteredDrafts = drafts.filter((draft) => {
        
    const search = searchText.toLowerCase();

    return (

        displayQuotationNo(draft.quotationNo)
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

    );

});

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
            textAlign: "right",
            fontSize: "13px",
            color: "#6b7280"
        }}
    >

        <div>
            Latest Save
        </div>

        <div
            style={{
                fontWeight: 600,
                color: "#111827",
                marginTop: "4px"
            }}
        >
            {drafts.length
                ? formatSavedDate(drafts[0].savedAt)
                : "-"}
        </div>

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

                <hr style={{ margin: "20px 0" }} />

{filteredDrafts.length === 0 ? (

    <p>No drafts found.</p>

) : (

    <>

    <div
        style={{
            maxHeight: "420px",
            overflowY: "auto",
            border: "1px solid #d1d5db",
            borderRadius: "8px"
        }}
    >

        <div
        
    style={{

         position: "sticky",
    top: 0,
    zIndex: 10,

        display: "grid",
        gridTemplateColumns:
"130px 170px 120px 90px 140px 90px 90px",
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

        {filteredDrafts.map((draft, index) => (


           <div
    key={draft.quotationNo}

    onDoubleClick={() => onOpen(draft)}

    onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f8fbff";
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
                    "130px 170px 120px 90px 140px 90px 90px",
                    alignItems: "center",
                    padding: "12px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "14px",
                    cursor:"pointer",
                    transition:"background 0.2s"
                }}
            >

                <div>
                    <strong>
                        {displayQuotationNo(draft.quotationNo)}
                    </strong>
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
    {formatSavedDate(draft.savedAt)}
</div>

<div>
    {draft.status}
</div>
                <div
                    style={{
                        display: "flex",
                        gap: "8px"
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
                     title="Delete Draft"
                        onClick={() => {

                            if (
                                window.confirm(
                                    "Delete this draft?"
                                )
                            ) {

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

               ))}

    </div>

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