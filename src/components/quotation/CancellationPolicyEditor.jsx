


import { useState } from "react";
import PolicyCard from "./PolicyCard";

export default function CancellationPolicyEditor({

    commonData,

    setCommonData

}) {
    
    const [expandedPolicyId, setExpandedPolicyId] =
        useState(1);

        const [editorExpanded, setEditorExpanded] =
        useState(true);

    const [deletePolicyId, setDeletePolicyId] =
        useState(null);

        const [editingPolicyId, setEditingPolicyId] =
          useState(null);

        function movePolicyUp(policyId) {

    const policies = [
        ...(commonData.cancellationRefundPolicy || [])
    ];

    const index =
        policies.findIndex(
            p => p.id === policyId
        );

    if (index <= 0) return;

    [
        policies[index - 1],
        policies[index]
    ] = [
        policies[index],
        policies[index - 1]
    ];

    setCommonData({

        ...commonData,

        cancellationRefundPolicy:
            policies

    });

}

function movePolicyDown(policyId) {

    const policies = [
        ...(commonData.cancellationRefundPolicy || [])
    ];

    const index =
        policies.findIndex(
            p => p.id === policyId
        );

    if (index >= policies.length - 1) return;

    [
        policies[index],
        policies[index + 1]
    ] = [
        policies[index + 1],
        policies[index]
    ];

    setCommonData({

        ...commonData,

        cancellationRefundPolicy:
            policies

    });

}

function addCustomPolicy() {

    const newPolicy = {

        id: Date.now(),

        title: "New Policy",

        text: "",

        isCustom: true

    };

    const updatedPolicies = [

        ...(commonData.cancellationRefundPolicy || []),

        newPolicy

    ];

    setCommonData({

        ...commonData,

        cancellationRefundPolicy:
            updatedPolicies

    });

    setExpandedPolicyId(newPolicy.id);
    setEditingPolicyId(newPolicy.id);

}

function deletePolicy(policyId) {

    const updatedPolicies =
        commonData.cancellationRefundPolicy.filter(

            policy => policy.id !== policyId

        );

    setCommonData({

        ...commonData,

        cancellationRefundPolicy:
            updatedPolicies

    });

    setDeletePolicyId(null);

    if (expandedPolicyId === policyId) {

        setExpandedPolicyId(null);

    }

}

    return (

    <div>

       <div
    onClick={() => {

    if (editorExpanded) {

        setExpandedPolicyId(null);

    }

    setDeletePolicyId(null);

    setEditorExpanded(!editorExpanded);

}}
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",

        padding: "14px 18px",

        background: "#F8FAFC",

        border: "1px solid #E5E7EB",

        borderRadius: "10px",

        cursor: "pointer",

        userSelect: "none",

        marginBottom: "16px",

        fontWeight: 600,

        fontSize: "16px"
    }}
>

    <span>

        {editorExpanded ? "▼" : "▶"}{" "}

        Cancellation & Refund Policy

    </span>

    <span
        style={{
            background: "#E2E8F0",
            borderRadius: "999px",
            padding: "2px 10px",
            fontSize: "13px"
        }}
    >

        {(commonData?.cancellationRefundPolicy || []).length}

    </span>

</div>

{editorExpanded && ( 
    <>

        {(commonData?.cancellationRefundPolicy || []).map((policy, index) => (

    <PolicyCard

    key={policy.id}

    policy={policy}

    index={index}

     totalPolicies={
        commonData.cancellationRefundPolicy.length
    }

    expandedPolicyId={expandedPolicyId}

    setExpandedPolicyId={setExpandedPolicyId}

    commonData={commonData}

    setCommonData={setCommonData}

    movePolicyUp={movePolicyUp}

    movePolicyDown={movePolicyDown}

    deletePolicyId={deletePolicyId}

    setDeletePolicyId={setDeletePolicyId}

    deletePolicy={deletePolicy}

    editingPolicyId={editingPolicyId}

    setEditingPolicyId={setEditingPolicyId}
    

/>

))}
        <div
    style={{
        marginTop: "18px"
    }}
>

    <button
        type="button"
        onClick={addCustomPolicy}
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "12px",
            border: "1px dashed #94A3B8",
            borderRadius: "10px",
            background: "#F8FAFC",
            color: "#2563EB",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer"
        }}
    >
        <span
            style={{
                fontSize: "18px",
                lineHeight: 1
            }}
        >
            ＋
        </span>

        Add Custom Policy

    </button>

    
</div>

    </> 
)}
</div>
)};

