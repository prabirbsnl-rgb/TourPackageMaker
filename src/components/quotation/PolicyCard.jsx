


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
        marginBottom: "14px",

        borderRadius: "10px",

        transition: "all .25s ease",

        boxShadow:
            expandedPolicyId === policy.id
                ? "0 6px 18px rgba(15,23,42,.10)"
                : "none"
    }}
>

            <div
                
                style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "12px 18px",

    border: "1px solid #E5E7EB",

    borderRadius:
        expandedPolicyId === policy.id
            ? "10px 10px 0 0"
            : "10px",

    background:
    expandedPolicyId === policy.id
        ? "#F0F9FF"
        : "#F8FAFC",

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
        fontSize: "10px",
        padding: 0,
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
        fontSize: "10px",
        padding: 0,
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

            fontSize: "14px",

            width: "220px"

        }}

    />

) : (

    <span
        style={{
            fontWeight: 600,
            color: "#1E293B",
            fontSize: "14px",

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

            padding: "3px 9px",

            borderRadius: "999px",

            fontSize: "11px",

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

    <button
        type="button"

        onClick={(e) => {

    e.stopPropagation();

    setDeletePolicyId(policy.id);

}}

        title="Delete Policy"

        style={{

            border: "none",

            background: "transparent",

            cursor: "pointer",

            color: "#DC2626",

            fontSize: "15px",

            padding: "2px",

            display: "flex",

            alignItems: "center",

            justifyContent: "center"

        }}
    >

        🗑

    </button>

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

                        width: "100%",

                        padding: "14px",

                        border: "1px solid #E5E7EB",

                        borderTop: "none",

                        borderBottomLeftRadius: "10px",

                        borderBottomRightRadius: "10px",

                        resize: "vertical",

                        fontFamily: "inherit",

                        boxSizing: "border-box",

                        outline: "none"

                    }}

                />

            )}

        </div>

    );

}