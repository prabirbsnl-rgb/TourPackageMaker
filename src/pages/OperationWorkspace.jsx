

import React from "react";

export default function OperationWorkspace({
  onOpenQuotation,
  onOpenLeadManagement,
  onOpenClientAgencyMaster,
  onOpenServicesModule,
  onOpenProposalLibrary,
  onOpenBackupRecovery,
  onOpenSupplierMaster,
  onOpenHotelMasterSupplier
}) {

  
  const sectionStyle = {
    background: "#ffffff",
    border: "1px solid #dce7f3",
    borderRadius: "15px",
    padding: "18px",
    boxSizing: "border-box",
    boxShadow: "0 4px 16px rgba(24, 55, 95, 0.045)",
    overflow: "hidden",
  };

  const sectionTitleStyle = {
  margin: "0 0 16px",
  fontSize: "14px",
  fontWeight: 900,
  color: "#087e8b",
  letterSpacing: "0.8px",
  textAlign: "left",
  paddingBottom: "10px",
  borderBottom: "2px solid #d7e9f2",
};

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  };

  const disabledCardStyle = {
    minHeight: "190px",
    border: "1px solid #dce7f3",
    borderRadius: "13px",
    background: "#f8fbff",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    cursor: "default",
    boxShadow: "0 3px 10px rgba(24, 55, 95, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const quotationCardStyle = {
    ...disabledCardStyle,
    background: "#f5fbff",
    border: "1px solid #b9d9f5",
    cursor: "pointer",
  };

  const cardTitleStyle = {
    fontSize: "15px",
    fontWeight: 900,
    color: "#173b70",
    marginBottom: "6px",
  };

  const comingStyle = {
    fontSize: "10px",
    fontWeight: 700,
    color: "#8193ad",
    marginTop: "5px",
  };



  
  
const WorkspaceCard = ({
  title,
  description,
  image,
  imagePosition = "center",
imageHeight = "180px",
accent = "#174ea6",
  clickable = false,
  onClick,
  status
}) => {
  return (
    <div
      style={{
        ...disabledCardStyle,
        minHeight: "265px",
        padding: 0,
        border: `1px solid ${accent}45`,
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "default",
      }}
    >
      <div
  style={{
    height: imageHeight,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    background: "#102b50",
  }}
>
  
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
height: "100%",
marginLeft: 0,
transform: imagePosition === "top"
  ? "translateY(-3px) scale(1.02)"
  : "none",
transformOrigin: "center top",
objectFit: "cover",
objectPosition: imagePosition,
position: "relative",
zIndex: 1,
display: "block",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 45%, rgba(10,30,65,0.48) 100%)",
            pointerEvents: "none",
          }}
        />

        
      </div>

      <div
        style={{
          padding: "14px 15px 16px",
          textAlign: "left",
          flex: 1,
        }}
      >
        <div style={{ ...cardTitleStyle, color: accent }}>
          {title}
        </div>

        <div
          style={{
            fontSize: "11px",
            lineHeight: 1.5,
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          {description}
        </div>

        {clickable && (
          <button
            type="button"
            onClick={onClick}
            style={{
              marginTop: "13px",
              padding: 0,
              border: "none",
              background: "transparent",
              fontSize: "10px",
              fontWeight: 900,
              color: accent,
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "left",
            }}
          >
            OPEN MODULE →
          </button>
        )}

        {!clickable && status === "COMING NEXT" && (
          <div style={comingStyle}>Coming Next</div>
        )}
      </div>
    </div>
  );
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
    position: "relative",
    overflow: "hidden",
    marginBottom: "22px",
    padding: "20px 22px",
    background: "linear-gradient(110deg, #123568 0%, #075b78 55%, #087e8b 100%)",
    border: "1px solid #164c70",
    borderRadius: "14px",
    boxShadow: "0 5px 16px rgba(15, 45, 85, 0.18)",
  }}
>


  <img
  src="/images/workspace/travel-header-banner-final.png"
  alt=""
  aria-hidden="true"
  style={{
  position: "absolute",
  top: "-4px",
left: "-4px",
width: "calc(100% + 8px)",
height: "calc(100% + 8px)",
  objectFit: "fill",
  objectPosition: "center",
  pointerEvents: "none",
  zIndex: 0,
}}
/>



  <h1
    style={{
      position: "relative",
      zIndex: 1,
      margin: 0,
      fontSize: "25px",
      fontWeight: 900,
      letterSpacing: "-0.5px",
      color: "#ffffff",
      
      textAlign: "left",
    }}
  >
    Orbitz Operation Workspace
  </h1>

  <p
    style={{
      position: "relative",
      zIndex: 1,
      margin: "7px 0 0",
      fontSize: "13px",
      fontWeight: 500,
      color: "#dceefa",
      textAlign: "left",
      letterSpacing: "0.15px",
    }}
  >
    Central workspace for leads, clients, suppliers, hotels,
    quotations and billing.
  </p>
</div>

      
{/* LEADS & CLIENTS */}
<div
  style={{
    ...sectionStyle,
    marginBottom: "14px",
    background: "linear-gradient(90deg, #087eaf 0%, #58a9ce 12%, #c5e2f0 25%, #ffffff 42%, #ffffff 100%)",
    border: "1px solid #cbdff0",
  }}
>
 <h2
  style={{
    ...sectionTitleStyle,
    color: "#ffffff",
    textShadow: "0 1px 2px rgba(0, 35, 65, 0.25)",
  }}
>
  LEADS & CLIENTS
</h2>

  <div style={gridStyle}>
    <WorkspaceCard
  title="Lead Management"
  description="Central lead database and enquiry follow-ups"
  image="/images/workspace/lead-management-banner.png"
  accent="#087e8b"
  clickable
  onClick={onOpenLeadManagement}
/>

    <WorkspaceCard
  title="Client Master"
  description="Central customer database and client information"
  image="/images/workspace/client-master-banner.png"
  accent="#2563a6"
  clickable
  onClick={onOpenClientAgencyMaster}
/>

   <WorkspaceCard
  title="Services Module"
  description="Service bookings, transactions and management"
  image="/images/workspace/services-module-banner.png"
  accent="#0e7490"
  clickable
  onClick={onOpenServicesModule}
/>
  </div>
</div>




      {/* PROPOSAL LIBRARY */}
<div
  style={{
    ...sectionStyle,
    marginBottom: "14px",
    background: "linear-gradient(90deg, #3730a3 0%, #818cf8 12%, #e0e7ff 28%, #ffffff 48%, #ffffff 100%)",
    border: "1px solid #c7d2fe",
  }}
>
  <h2
    style={{
      ...sectionTitleStyle,
      color: "#ffffff",
      textAlign: "left",
      textShadow: "0 1px 2px rgba(30, 30, 90, 0.25)",
    }}
  >
    PROPOSALS
  </h2>

  <div style={gridStyle}>
    <WorkspaceCard
      title="Proposal Library"
      description="Saved proposals & reusable templates"
      image="/images/workspace/proposal-library-banner.png"
      accent="#3730a3"
      clickable
      onClick={onOpenProposalLibrary}
    />
  </div>
</div>





      
{/* SUPPLIERS & HOTELS */}
<div
  style={{
    ...sectionStyle,
    marginBottom: "14px",
    background: "linear-gradient(90deg, #075985 0%, #38a3c5 12%, #c5e8f3 27%, #ffffff 45%, #ffffff 100%)",
    border: "1px solid #bae0ee",
  }}
>
  <h2
    style={{
      ...sectionTitleStyle,
      color: "#ffffff",
      textAlign: "left",
      textShadow: "0 1px 2px rgba(0, 35, 65, 0.25)",
    }}
  >
    SUPPLIERS & HOTELS
  </h2>

  <div style={gridStyle}>
    <WorkspaceCard
  title="DMC / Supplier Master"
  description="Supplier network, destination partners and DMC services"
  image="/images/workspace/dmc-supplier-banner.png"
  imagePosition="top"
  accent="#075985"
  clickable={true}
  onClick={onOpenSupplierMaster}
/>

   <WorkspaceCard
  title="Hotel Master & Supplier"
  description="Domestic and international hotels, hotel suppliers, rooms, contracts and rates"
  image="/images/workspace/hotel-master-banner.png"
  accent="#087e8b"
  clickable={true}
  onClick={onOpenHotelMasterSupplier}
/>
  </div>
</div>





     
{/* SUPPLIER OPERATIONS & QUOTATIONS */}
<div
  style={{
    ...sectionStyle,
    marginBottom: "14px",
    background: "linear-gradient(90deg, #92400e 0%, #d97706 12%, #fde7bd 28%, #ffffff 48%, #ffffff 100%)",
    border: "1px solid #f2d3a0",
  }}
>
  <h2
    style={{
      ...sectionTitleStyle,
      color: "#ffffff",
      textAlign: "left",
      textShadow: "0 1px 2px rgba(0, 35, 65, 0.25)",
    }}
  >
    SUPPLIER OPERATIONS & QUOTATIONS
  </h2>

  <div style={gridStyle}>
    
<WorkspaceCard
  title="DMC Quotation Import / Extraction"
  description="Import and extract supplier quotation details"
  image="/images/workspace/dmc-quotation-import-banner.png"
  accent="#075985"
  status="COMING NEXT"
/>

<WorkspaceCard
  title="Quotation Workspace"
  description="Prepare and manage customer quotations"
  image="/images/workspace/quotation-workspace-banner.png"
  accent="#087e8b"
  clickable
  onClick={onOpenQuotation}
/>

  </div>
</div>




      
{/* BOOKING & BILLING */}
<div
  style={{
    ...sectionStyle,
    marginBottom: "14px",
    background: "linear-gradient(90deg, #334155 0%, #64766d 13%, #dce5df 30%, #ffffff 52%, #ffffff 100%)",
    border: "1px solid #cbd8cf",
  }}
>
  <h2
    style={{
      ...sectionTitleStyle,
      color: "#ffffff",
      textAlign: "left",
      textShadow: "0 1px 2px rgba(20, 35, 30, 0.25)",
    }}
  >
    BOOKING & BILLING
  </h2>

  <div style={gridStyle}>
    <WorkspaceCard
      title="Confirmed Bookings"
      description="Consolidated tour packages and direct service bookings"
      image="/images/workspace/confirmed-bookings-banner.png"
      accent="#365a4a"
      status="COMING NEXT"
    />

    <WorkspaceCard
      title="Proforma Invoices"
      description="Consolidated proforma register from Draft Library"
      image="/images/workspace/proforma-invoices-banner.png"
      accent="#536b82"
      status="COMING NEXT"
    />

    <WorkspaceCard
      title="Tax Invoices"
      description="Consolidated tax invoice register from Tax Library"
      image="/images/workspace/tax-invoices-banner.png"
      accent="#48645b"
      status="COMING NEXT"
    />
  </div>
</div>





            {/* HISTORY */}
      <div
        style={{
          ...sectionStyle,
          background:
            "linear-gradient(90deg, #633b61 0%, #a96883 14%, #e8d2dc 32%, #ffffff 55%, #ffffff 100%)",
          border: "1px solid #d8bdca",
        }}
      >
        <h2
          style={{
            ...sectionTitleStyle,
            color: "#ffffff",
            textAlign: "left",
            textShadow: "0 1px 2px rgba(40, 20, 40, 0.25)",
          }}
        >
          HISTORY
        </h2>

        <div style={gridStyle}>
          <WorkspaceCard
            title="Hotel History"
            description="Search hotels and view past and current bookings, rates and transaction records"
            image="/images/workspace/hotel-history-banner.png"
            accent="#287b8c"
            status="COMING NEXT"
          />

          <WorkspaceCard
            title="Supplier History"
            description="View supplier-wise enquiries, quotations, bookings and service records"
            image="/images/workspace/supplier-history-banner.png"
            accent="#496b91"
            status="COMING NEXT"
          />

          <WorkspaceCard
            title="Client History"
            description="Explore complete customer travel, service, proposal and invoice history"
            image="/images/workspace/client-history-banner.png"
            accent="#397b69"
            status="COMING NEXT"
          />
        </div>
      </div>


        
      {/* BACKUP & RECOVERY */}
      {onOpenBackupRecovery && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>BACKUP & RECOVERY</h2>

          <div style={gridStyle}>
            <button
              type="button"
              onClick={onOpenBackupRecovery}
              style={{
                ...quotationCardStyle,
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  ...cardTitleStyle,
                  color: "#1d4ed8",
                }}
              >
                Backup &amp; Recovery Center
              </div>

              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                Manual Firestore backup, verification &amp; recovery
              </div>
            </button>
          </div>
        </div>
      )}


      </div>
    
  );
}