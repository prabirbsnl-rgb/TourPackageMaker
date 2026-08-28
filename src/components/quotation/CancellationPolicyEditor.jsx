


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


    // =========================================================
    // MOVE POLICY UP
    // =========================================================

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


    // =========================================================
    // MOVE POLICY DOWN
    // =========================================================

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


    // =========================================================
    // ADD CUSTOM POLICY
    // =========================================================

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


    // =========================================================
    // DELETE POLICY
    // =========================================================

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


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            style={{
                marginTop: "4px"
            }}
        >

            {/* =================================================
                MAIN POLICY CARD
            ================================================= */}

            <div
                style={{
                    background: "#FFFFFF",

                    border:
                        "1px solid #E5E7EB",

                    borderRadius: "12px",

                    overflow: "hidden",

                    boxShadow:
                        "0 2px 8px rgba(15, 23, 42, 0.05)"
                }}
            >


                {/* =================================================
                    TOP ACCENT LINE
                ================================================= */}

                <div
                    style={{
                        height: "3px",

                        background:
                            "linear-gradient(90deg, #C084FC 0%, #E879A9 50%, #C084FC 100%)"
                    }}
                />


                {/* =================================================
                    POLICY HEADER
                ================================================= */}

                <div
                    onClick={() => {

                        if (editorExpanded) {

                            setExpandedPolicyId(null);

                        }

                        setDeletePolicyId(null);

                        setEditorExpanded(
                            !editorExpanded
                        );

                    }}
                    style={{
                        display: "flex",

                        justifyContent:
                            "space-between",

                        alignItems: "center",

                        padding:
                            "16px 18px 14px 18px",

                        cursor: "pointer",

                        userSelect: "none",

                        borderBottom:
                            "1px dashed #D1D5DB"
                    }}
                >

                    <div
                        style={{
                            display: "flex",

                            alignItems: "center",

                            gap: "9px"
                        }}
                    >

                        <span
                            style={{
                                fontSize: "12px",

                                color: "#64748B",

                                width: "14px"
                            }}
                        >
                            {editorExpanded
                                ? "▼"
                                : "▶"}
                        </span>


                        <span
                            style={{
                                fontSize: "17px",

                                fontWeight: 700,

                                color: "#1F2937"
                            }}
                        >
                            Cancellation & Refund Policy
                        </span>

                    </div>


                    {/* POLICY COUNT */}

                    <span
                        style={{
                            minWidth: "28px",

                            height: "28px",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            background: "#F1F5F9",

                            border:
                                "1px solid #E2E8F0",

                            borderRadius: "999px",

                            padding:
                                "0 8px",

                            fontSize: "12px",

                            fontWeight: 700,

                            color: "#475569",

                            boxSizing: "border-box"
                        }}
                    >

                        {
                            (
                                commonData?.cancellationRefundPolicy ||
                                []
                            ).length
                        }

                    </span>

                </div>


                {/* =================================================
                    POLICY CONTENT
                ================================================= */}

                {editorExpanded && (

                    <div
                        style={{
                            padding:
                                "16px 18px 18px 18px"
                        }}
                    >


                        {/* =================================================
                            EXISTING POLICY CARDS
                        ================================================= */}

                        {(
                            commonData?.cancellationRefundPolicy ||
                            []
                        ).map(

                            (policy, index) => (

                                <PolicyCard

                                    key={policy.id}

                                    policy={policy}

                                    index={index}

                                    totalPolicies={
                                        (
                                            commonData
                                                ?.cancellationRefundPolicy ||
                                            []
                                        ).length
                                    }

                                    expandedPolicyId={
                                        expandedPolicyId
                                    }

                                    setExpandedPolicyId={
                                        setExpandedPolicyId
                                    }

                                    commonData={
                                        commonData
                                    }

                                    setCommonData={
                                        setCommonData
                                    }

                                    movePolicyUp={
                                        movePolicyUp
                                    }

                                    movePolicyDown={
                                        movePolicyDown
                                    }

                                    deletePolicyId={
                                        deletePolicyId
                                    }

                                    setDeletePolicyId={
                                        setDeletePolicyId
                                    }

                                    deletePolicy={
                                        deletePolicy
                                    }

                                    editingPolicyId={
                                        editingPolicyId
                                    }

                                    setEditingPolicyId={
                                        setEditingPolicyId
                                    }

                                />

                            )

                        )}


                        {/* =================================================
                            ADD CUSTOM POLICY
                        ================================================= */}

                       <div
    style={{
        marginTop: "16px",
        textAlign: "left"
    }}
>

                            <button
                                type="button"

                                onClick={
                                    addCustomPolicy
                                }

                                style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "6px",
    width: "fit-content",
    padding: "7px 12px",
    margin: "0",
    border: "1px dashed #94A3B8",
    borderRadius: "7px",
    background: "#F8FAFC",
    color: "#2563EB",
    fontWeight: 600,
    fontSize: "11px",
    cursor: "pointer",
    textAlign: "left"
}}
 >

                                <span
                                    style={{
                                        fontSize: "16px",

                                        lineHeight: 1
                                    }}
                                >
                                    ＋
                                </span>

                                Add Custom Policy

                            </button>

                        </div>

                    </div>

                )}


                {/* =================================================
                    BOTTOM ACCENT LINE
                ================================================= */}

                <div
                    style={{
                        height: "4px",

                        background:
                            "linear-gradient(90deg, #C084FC 0%, #E879A9 50%, #C084FC 100%)"
                    }}
                />

            </div>

        </div>

    );

}