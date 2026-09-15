


import { useState } from "react";
import PolicyCard from "./PolicyCard";



export default function CancellationPolicyEditor({

    commonData,

    setCommonData

}) {

   const [expandedPolicyId, setExpandedPolicyId] =
    useState(null);

   const [editorExpanded, setEditorExpanded] =
    useState(false);

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

                    borderRadius: "10px",

                    overflow: "hidden",

                    boxShadow:
                        "0 2px 8px rgba(15, 23, 42, 0.05)"
                }}
            >


               

                {/* =================================================
                    POLICY HEADER
                ================================================= */}

               <div
  onClick={() => {
    if (editorExpanded) setExpandedPolicyId(null);
    setDeletePolicyId(null);
    setEditorExpanded(!editorExpanded);
  }}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
   minHeight: "36px",
padding: "4px 10px 4px 20px",
    boxSizing: "border-box",
    cursor: "pointer",
    userSelect: "none",
    borderBottom: "1px solid #E5E7EB",
    position: "relative"
  }}
>
  <span
  style={{
    position: "absolute",
    left: "0px",
    top: 0,
    bottom: 0,
    width: "3px",
    background:
      "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
    borderRadius: "2px"
  }}
/>

  <span
    style={{
      fontSize: "16px",
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "16px",
      height: "24px",
      flexShrink: 0
    }}
  >
    📋
  </span>

  <span
    style={{
      fontSize: "14px",
      fontWeight: 750,
      color: "#1e3a5f",
      whiteSpace: "nowrap"
    }}
  >
    Cancellation & Refund Policy
  </span>

  <span
    style={{
      width: "24px",
      height: "24px",
      border: "1px solid #cbd5e1",
      borderRadius: "6px",
      background: "#ffffff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}
  >
    <span
      style={{
        width: "7px",
        height: "7px",
        borderRight: "2px solid #475569",
        borderBottom: "2px solid #475569",
        transform: editorExpanded
          ? "rotate(225deg)"
          : "rotate(45deg)",
        marginTop: editorExpanded ? "4px" : "-3px"
      }}
    />
  </span>
                  

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


                
            </div>

        </div>

    );

}