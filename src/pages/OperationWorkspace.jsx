

import React from "react";

export default function OperationWorkspace({
  onOpenQuotation,
  onOpenLeadManagement
}) {
  const sectionStyle = {
    background: "#ffffff",
    border: "1px solid #dbe3ea",
    borderRadius: "10px",
    padding: "18px",
    boxSizing: "border-box",
  };

  const sectionTitleStyle = {
    margin: "0 0 14px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e3a5f",
    letterSpacing: "0.2px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "10px",
  };

  const disabledCardStyle = {
    minHeight: "62px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
    padding: "12px 14px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    cursor: "default",
  };

  const quotationCardStyle = {
    ...disabledCardStyle,
    background: "#f0fdfa",
    border: "1px solid #99f6e4",
    cursor: "pointer",
  };

  const cardTitleStyle = {
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "4px",
  };

  const comingStyle = {
    fontSize: "10px",
    fontWeight: 600,
    color: "#94a3b8",
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 58px)",
        background: "#f5f7fa",
        padding: "28px 32px 40px",
        boxSizing: "border-box",
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            color: "#172033",
          }}
        >
          Orbitz Operation Workspace
        </h1>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Central workspace for leads, clients, suppliers, hotels,
          quotations and billing.
        </p>
      </div>

      {/* LEADS & CLIENTS */}
      <div style={{ ...sectionStyle, marginBottom: "14px" }}>
        <h2 style={sectionTitleStyle}>LEADS & CLIENTS</h2>

        <div style={gridStyle}>
          <button
  type="button"
  onClick={onOpenLeadManagement}
  style={{
    ...disabledCardStyle,
    textAlign: "left",
    fontFamily: "inherit",
    cursor: "pointer",
    background: "#f0fdfa",
    border: "1px solid #99f6e4",
  }}
>
  <div
    style={{
      ...cardTitleStyle,
      color: "#0f766e",
    }}
  >
    Lead Management
  </div>

  <div
    style={{
      fontSize: "10px",
      fontWeight: 600,
      color: "#5f8f8a",
    }}
  >
    Central lead database
  </div>
</button>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Client / Agency Master</div>
            <div style={comingStyle}>Coming Next</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Client Enquiries</div>
            <div style={comingStyle}>Coming Next</div>
          </div>
        </div>
      </div>

      {/* SUPPLIERS & HOTELS */}
      <div style={{ ...sectionStyle, marginBottom: "14px" }}>
        <h2 style={sectionTitleStyle}>SUPPLIERS & HOTELS</h2>

        <div style={gridStyle}>
          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>DMC / Supplier Master</div>
            <div style={comingStyle}>Coming Next</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Hotel Master</div>
            <div style={comingStyle}>Coming Next</div>
          </div>
        </div>
      </div>

      {/* SUPPLIER OPERATIONS */}
      <div style={{ ...sectionStyle, marginBottom: "14px" }}>
        <h2 style={sectionTitleStyle}>SUPPLIER OPERATIONS</h2>

        <div style={gridStyle}>
          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Supplier Enquiry</div>
            <div style={comingStyle}>Coming Next</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>
              DMC Quotation Import / Extraction
            </div>
            <div style={comingStyle}>Coming Next</div>
          </div>
        </div>
      </div>

      {/* QUOTATION */}
      <div style={{ ...sectionStyle, marginBottom: "14px" }}>
        <h2 style={sectionTitleStyle}>QUOTATION</h2>

        <div style={gridStyle}>
          <button
            type="button"
            onClick={onOpenQuotation}
            style={{
              ...quotationCardStyle,
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                ...cardTitleStyle,
                color: "#0f766e",
              }}
            >
              Open Quotation Workspace
            </div>

            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#5f8f8a",
              }}
            >
              Existing quotation system
            </div>
          </button>
        </div>
      </div>

      {/* BOOKING & BILLING */}
      <div style={{ ...sectionStyle, marginBottom: "14px" }}>
        <h2 style={sectionTitleStyle}>BOOKING & BILLING</h2>

        <div style={gridStyle}>
          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Confirmed Bookings</div>
            <div style={comingStyle}>Coming Next</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Proforma Invoices</div>
            <div style={comingStyle}>Existing quotation workspace</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Tax Invoices</div>
            <div style={comingStyle}>Existing quotation workspace</div>
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>HISTORY</h2>

        <div style={gridStyle}>
          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Hotel History</div>
            <div style={comingStyle}>Coming Next</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Supplier History</div>
            <div style={comingStyle}>Coming Next</div>
          </div>

          <div style={disabledCardStyle}>
            <div style={cardTitleStyle}>Client History</div>
            <div style={comingStyle}>Coming Next</div>
          </div>
        </div>
      </div>
    </div>
  );
}