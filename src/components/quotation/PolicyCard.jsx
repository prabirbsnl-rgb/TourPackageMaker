


export default function PolicyCard({

    policy,

    index,

    totalPolicies,

    expandedPolicyId,

    setExpandedPolicyId,

    commonData,

    setCommonData,

    movePolicyUp,

    deletePolicyId,

    deletePolicy,

    setDeletePolicyId,

    editingPolicyId,

    setEditingPolicyId,

    movePolicyDown

}) {

    return (

       <div
    style={{
  marginBottom: "8px",
  borderRadius: "8px",
  transition: "all .2s ease",
  boxShadow:
    expandedPolicyId === policy.id
      ? "0 3px 10px rgba(15,23,42,.07)"
      : "none"
}}
>

            <div
                
                style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "9px 14px",

    border: "1px solid #E5E7EB",

    borderRadius:
  expandedPolicyId === policy.id
    ? "8px 8px 0 0"
    : "8px",

   background:
  expandedPolicyId === policy.id
    ? "#F8FAFC"
    : "#FBFCFE",

    cursor: "pointer",

    userSelect: "none",

    transition: "all .2s ease",

   
}}
            >

                <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flex: 1
    }}
>

    <div
    onClick={(e) => e.stopPropagation()}

    style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
        marginRight: "8px"
    }}
>

    <button
    type="button"

    disabled={index === 0}

    onClick={(e) => {

        e.stopPropagation();

        movePolicyUp(policy.id);

    }}

    style={{
        border: "none",
        background: "transparent",
        cursor:
          index === 0
        ? "not-allowed"
        : "pointer",
        opacity:
         index === 0
        ? 0.35
        : 1,
        fontSize: "9px",
       padding: "1px 3px",
        lineHeight: 1
    }}
>
    ▲
</button>

    <button
    type="button"

    disabled={
    index === totalPolicies - 1
}

    onClick={(e) => {

        e.stopPropagation();

        movePolicyDown(policy.id);

    }}

    style={{
        border: "none",
        background: "transparent",
        cursor:
           index === totalPolicies - 1
        ? "not-allowed"
        : "pointer",
        opacity:
          index === totalPolicies - 1
        ? 0.35
        : 1,
        fontSize: "9px",
       padding: "1px 3px",
        lineHeight: 1
    }}
>
    ▼
</button>

</div>

    {/* Status Dot */}

    <span
        style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            display: "inline-block",

            background:
                policy.text?.trim()
                    ? "#22C55E"
                    : "#CBD5E1"
        }}
    />

    {/* Title */}

    {policy.isCustom && editingPolicyId === policy.id ? (

    <input
        type="text"

        value={policy.title}

        autoFocus

        onClick={(e) => e.stopPropagation()}

        onKeyDown={(e) => {

    if (e.key === "Enter") {

        setEditingPolicyId(null);

    }

}}

onBlur={() => {

    setEditingPolicyId(null);

}}

        onChange={(e) => {

            const updatedPolicies =
                commonData.cancellationRefundPolicy.map(item =>

                    item.id === policy.id

                        ? {

                            ...item,

                            title: e.target.value

                          }

                        : item

                );

            setCommonData({

                ...commonData,

                cancellationRefundPolicy:
                    updatedPolicies

            });

        }}

        style={{

            border: "none",

            outline: "none",

            background: "transparent",

            fontWeight: 600,

            color: "#1E293B",

            fontSize: "13px",

            width: "220px"

        }}

    />

) : (

    <span
        style={{
            fontWeight: 600,
            color: "#1E293B",
            fontSize: "13px",

            cursor:
                policy.isCustom
                    ? "text"
                    : "default"
        }}

        onClick={(e) => {

    e.stopPropagation();

    if (policy.isCustom) {

        setEditingPolicyId(policy.id);

    }

}}
    >

        {policy.title}

    </span>

)}

    {/* Badge */}

    <span
        style={{
            marginLeft: "10px",

            padding: "2px 8px",

            borderRadius: "999px",

            fontSize: "10px",

            fontWeight: 600,

            background:
                policy.isCustom
                    ? "#DBEAFE"
                    : "#F1F5F9",

            color:
                policy.isCustom
                    ? "#1D4ED8"
                    : "#64748B"
        }}
    >

        {policy.isCustom
    ? "Custom"
    : "Built-in"}

    </span>

</div>

{policy.isCustom && (

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginLeft: "10px"
        }}
    >

        <button
            type="button"

            onClick={(e) => {

                e.stopPropagation();

                setDeletePolicyId(policy.id);

            }}

            title="Delete Policy"

            style={{
                width: "28px",
                height: "28px",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                border: "1px solid #FECACA",
                borderRadius: "6px",

                background: "#FFF1F2",
                color: "#DC2626",

                cursor: "pointer",

                fontSize: "14px",

                padding: 0,

                transition: "all .2s ease"
            }}

            onMouseEnter={(e) => {
                e.currentTarget.style.background =
                    "#FEE2E2";
            }}

            onMouseLeave={(e) => {
                e.currentTarget.style.background =
                    "#FFF1F2";
            }}
        >

            🗑

        </button>

        <div
  style={{
    width: "1px",
    height: "22px",
    background: "#94A3B8"
  }}
/>

    </div>

)}

               <button
    type="button"

    onClick={(e) => {

        e.stopPropagation();

        setExpandedPolicyId(

            expandedPolicyId === policy.id

                ? null

                : policy.id

        );

    }}

    style={{

        border: "none",

        background: "transparent",

        cursor: "pointer",

        fontSize: "11px",

        color: "#64748B",

        padding: "6px",

        borderRadius: "6px",

    }}
>

    {expandedPolicyId === policy.id

        ? "▼"

        : "▶"}

</button>

            </div>


{deletePolicyId === policy.id && (

    <div
        style={{
            border: "1px solid #FECACA",
            borderTop: "none",

            background: "#FEF2F2",

            padding: "18px",

            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px"
        }}
    >

        <div
            style={{
                fontWeight: 600,
                color: "#B91C1C",
                marginBottom: "8px"
            }}
        >
            ⚠ Delete this custom policy?
        </div>

        <div
            style={{
                color: "#7F1D1D",
                fontSize: "13px",
                marginBottom: "18px"
            }}
        >
            This action cannot be undone.
        </div>

        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "16px"
            }}
        >

            <button
                type="button"

                onClick={() =>
                    setDeletePolicyId(null)
                }
            >
                Cancel
            </button>

            <button
    type="button"

    onClick={() =>

        deletePolicy(policy.id)

    }

    style={{
        background: "#DC2626",
        color: "#fff",

        border: "none",

        padding: "8px 18px",

        borderRadius: "6px",

        cursor: "pointer"
    }}
>
    Delete
</button>

        </div>

    </div>

)}

           {expandedPolicyId === policy.id &&
            deletePolicyId !== policy.id && (

                <textarea

                    value={policy.text}

                    rows={4}

                    onChange={(e) => {

                        const updatedPolicies =

                            commonData.cancellationRefundPolicy.map(item =>

                                item.id === policy.id

                                    ? {

                                          ...item,

                                          text: e.target.value

                                      }

                                    : item

                            );

                        setCommonData({

                            ...commonData,

                            cancellationRefundPolicy:

                                updatedPolicies

                        });

                    }}

                    style={{
    display: "block",
    width: "100%",
    minWidth: 0,
    minHeight: "110px",

    padding: "10px 12px",

    border: "1px solid #E5E7EB",
    borderTop: "none",

    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",

    background: "#FFFFFF",

    resize: "vertical",

    fontFamily: "inherit",
    fontSize: "12px",
    lineHeight: "18px",

    boxSizing: "border-box",

    outline: "none"
}}

                />

            )}

        </div>

    );

}