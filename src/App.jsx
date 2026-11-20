


import React, { useState, useEffect } from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";


import { getUserProfile } from "./utils/quotationStorage";


import {
    getProposals,
    getLeadName,
    getLeadBusinessId,
    getLeadById,
    deleteProposal,
    updateProposal
} from "./utils/proposalStorage";



import { getAllLeads } from "./utils/leadStorage";

import { getActiveServices } from "./utils/serviceCatalogueStorage";

import AdminUserManagement from "./components/admin/AdminUserManagement";

import Login from "./Login";
import TourPackageMaker from "./TourPackageMaker";
import DMCQuotationGenerator from "./pages/DMCQuotationGenerator";

import OperationWorkspace from "./pages/OperationWorkspace";
import LeadManagement from "./pages/LeadManagement";
import ClientAgencyMaster from "./pages/ClientAgencyMaster";

import SupplierMaster from "./pages/SupplierMaster";
import HotelMasterSupplier from "./pages/HotelMasterSupplier";
import BackupRecoveryCenter from "./components/BackupRecoveryCenter";

 

import ServiceBooking from "./components/services/ServiceBooking";

import ServiceTransactions from "./components/services/ServiceTransactions";


import ManageServices from "./components/services/ManageServices";






export default function App() {
  const [user, setUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [quotationContext, setQuotationContext] =
  useState(null);

  const [leadFromClient, setLeadFromClient] =
    useState(null);


    const [clientToEdit, setClientToEdit] = useState(null);

    const [proposalLibrary, setProposalLibrary] = useState([]);

    const [proposalToResume, setProposalToResume] =
    useState(null);


    const [proposalToReuse, setProposalToReuse] =
    useState(null);

    const [reuseLead, setReuseLead] = useState(null);


    const [reuseLeads, setReuseLeads] = useState([]);
    const [reuseLeadsLoading, setReuseLeadsLoading] = useState(false);


    const [startTemplateCreation, setStartTemplateCreation] =
    useState(false);

    const [proposalSearch, setProposalSearch] = useState("");

    const [proposalLibraryFilter, setProposalLibraryFilter] =
    useState("all");

    const [proposalLeadNames, setProposalLeadNames] = useState({});

    const [proposalLeadIds, setProposalLeadIds] = useState({});


    
const handleUpdateProposalDelivery = async (
    item,
    deliveryStatus,
    deliveryChannel
) => {
    if (!item?.id) {
        alert("Proposal Library record ID is missing.");
        return;
    }

    try {
        const updated = await updateProposal(
            item.id,
            {
                deliveryStatus,
                deliveryChannel
            }
        );

        if (!updated) {
            alert("Proposal Library record was not found.");
            return;
        }

        setProposalLibrary((current) =>
            current.map((proposal) =>
                proposal.id === item.id
                    ? {
                        ...proposal,
                        deliveryStatus,
                        deliveryChannel
                    }
                    : proposal
            )
        );
    } catch (error) {
        console.error(
            "Failed to update proposal delivery status:",
            error
        );

        alert(
            "Could not update delivery status. Please try again."
        );
    }
};



     const [page, setPage] = useState("workspace");

     const [servicesView, setServicesView] = useState("home");

     const [activeServices, setActiveServices] = useState([]);
     const [servicesLoading, setServicesLoading] = useState(false);
     const [servicesError, setServicesError] = useState("");

     const [selectedService, setSelectedService] = useState(null);

     const [newlySavedServiceRecordId, setNewlySavedServiceRecordId] = useState(null);



     useEffect(() => {
    if (page !== "services" || servicesView !== "new") {
        return;
    }

    let isMounted = true;

    const loadActiveServices = async () => {
        setServicesLoading(true);
        setServicesError("");

        try {
            const services = await getActiveServices();

            if (isMounted) {
                setActiveServices(services);
            }
        } catch (error) {
            console.error("Failed to load service catalogue:", error);

            if (isMounted) {
                setServicesError(
                    "Unable to load services. Please try again."
                );
            }
        } finally {
            if (isMounted) {
                setServicesLoading(false);
            }
        }
    };

    loadActiveServices();

    return () => {
        isMounted = false;
    };
}, [page, servicesView]);




    useEffect(() => {
  if (page !== "proposal-library") return;

  const loadProposalLibrary = async () => {
    try {

     const proposals = await getProposals();



const leadNameEntries =
    await Promise.all(
        proposals.map(
            async (proposal) => {

                if (!proposal.leadId) {
                    return null;
                }

                const name =
                    await getLeadName(
                        proposal.leadId
                    );

                return [
                    proposal.leadId,
                    name
                ];
            }
        )
    );



    const leadIdEntries =
    await Promise.all(
        proposals.map(
            async (proposal) => {

                if (!proposal.leadId) {
                    return null;
                }

                const businessLeadId =
                    await getLeadBusinessId(
                        proposal.leadId
                    );

                return [
                    proposal.leadId,
                    businessLeadId
                ];
            }
        )
    );

const leadIds =
    Object.fromEntries(
        leadIdEntries.filter(Boolean)
    );





const leadNames = Object.fromEntries(
    leadNameEntries.filter(Boolean)
);

setProposalLeadNames(leadNames);

setProposalLeadIds(
    leadIds
);


setProposalLibrary(proposals);


    } catch (error) {
      console.error(
        "❌ Failed to load Proposal Library:",
        error
      );
    }
  };

  loadProposalLibrary();
}, [page]);



const LOGIN_ENABLED = true;

useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (currentUser) => {

        // Keep the application hidden while
        // authentication/profile is being resolved.
        setLoading(true);

        setUser(currentUser);

        setPage("workspace");

        if (currentUser) {

          const profile =
            await getUserProfile(
              currentUser.uid
            );

          setUserProfile(profile);

          console.log(
            "🔥 ORBITZ USER PROFILE:",
            profile
          );

        } else {

          setUserProfile(null);

        }

        setLoading(false);

      }
    );

  return unsubscribe;

}, []);



if (loading) {
  return <div>Loading...</div>;
}




if (LOGIN_ENABLED && !user) {
  return <Login onLogin={() => {}} />;
}

if (
  LOGIN_ENABLED &&
  user &&
  (
    !userProfile ||
    userProfile.status !== "active"
  )
) {


 


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "100%",
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,.12)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#1E3A8A",
            marginBottom: "10px",
          }}
        >
          Orbitz Holidays
        </h2>

        <p
          style={{
            color: "#374151",
            fontWeight: 600,
          }}
        >
          Access not available
        </p>

        <p
          style={{
            color: "#6B7280",
            lineHeight: 1.5,
          }}
        >
          Your Orbitz account is currently not active.
          Please contact the administrator for access.
        </p>

        <button
          onClick={() => {
  setPage("dmc");
  signOut(auth);
}}
          style={{
            marginTop: "15px",
            background: "#DC2626",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

  return (
    <div
        style={{
            width: "100%",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
            boxSizing: "border-box"
        }}
    >
     <div
  style={{
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    background: "#111827",
    minHeight: "58px",
    boxSizing: "border-box",
  }}
>

  {/* ORBITZ LOGO */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginRight: "42px",
  }}
>
  <img
    src="/logoq.png"
    alt="Orbitz Holidays"
    style={{
      height: "55px",
      width: "auto",
      objectFit: "contain",
      display: "block",
    }}
  />
</div>

  {/* APPLICATION NAVIGATION */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "26px",
      height: "100%",
    }}
  >
    {/* Tour Package Maker */}
    <button
      type="button"
      onClick={() => setPage("tour")}
      style={{
        position: "relative",
        background: "transparent",
        color: page === "tour"
          ? "#FFFFFF"
          : "#CBD5E1",
        border: "none",
        padding: "12px 2px 11px",
        cursor: "pointer",
        fontWeight: page === "tour" ? 700 : 600,
        fontSize: "14px",
      }}
    >
      Tour Package Maker

      {page === "tour" && (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "3px",
            borderRadius: "999px",
            background: "#3B82F6",
          }}
        />
      )}
    </button>

    {/* NAVIGATION SEPARATOR */}
<div
  style={{
    width: "2px",
    height: "24px",
    background: "#64748B",
    flexShrink: 0,
    margin: "0 4px",
    borderRadius: "999px",
  }}
/>

    {/* Orbitz Quotation */}
    <button
      type="button"
      onClick={() => setPage("dmc")}
      style={{
        position: "relative",
        background: "transparent",
        color: page === "dmc"
          ? "#FFFFFF"
          : "#CBD5E1",
        border: "none",
        padding: "12px 2px 11px",
        cursor: "pointer",
        fontWeight: page === "dmc" ? 700 : 600,
        fontSize: "14px",
      }}
    >
      Orbitz Quotation

      {page === "dmc" && (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "3px",
            borderRadius: "999px",
            background: "#14B8A6",
          }}
        />
      )}
    </button>
  </div>

  {/* ADMIN AREA */}
  {userProfile?.role === "admin" && (
    <div
  style={{
    position: "absolute",
    left: "72%",
    transform: "translateX(-50%)",

    display: "flex",
    alignItems: "center",
  }}
>
      <button
        type="button"
        onClick={() => setPage("admin")}
        style={{
  position: "relative",

  display: "flex",
  alignItems: "center",
  gap: "7px",

  background: "transparent",
  color: page === "admin"
    ? "#FFFFFF"
    : "#CBD5E1",

  border: "none",

  padding: "12px 2px 11px",

  cursor: "pointer",

  fontWeight: page === "admin"
    ? 700
    : 600,

  fontSize: "14px",
}}
      >
        {/* White User Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        User Management

        {page === "admin" && (
  <span
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "3px",
      borderRadius: "999px",
      background: "#8B5CF6",
    }}
  />
)}
      </button>

      

    </div>
  )}

  {/* PUSH LOGOUT TO RIGHT */}
  <div
    style={{
      marginLeft: "auto",
    }}
  >
    <button
      type="button"
      onClick={() => signOut(auth)}
      style={{
        background: "#DC2626",
        color: "#fff",
        border: "none",
        padding: "9px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      Logout
    </button>
  </div>
</div>


{page === "workspace" ? (
  <OperationWorkspace
    onOpenQuotation={() => setPage("dmc")}
    onOpenLeadManagement={() => setPage("leads")}
    onOpenClientAgencyMaster={() => setPage("clients")}
    onOpenServicesModule={() => setPage("services")}
    onOpenProposalLibrary={() => setPage("proposal-library")}
    onOpenBackupRecovery={
      import.meta.env.DEV && userProfile?.role === "admin"
        ? () => setPage("backup-recovery")
        : undefined
    }

    onOpenSupplierMaster={() => setPage("supplier-master")}

    onOpenHotelMasterSupplier={() => setPage("hotel-master-supplier")}

  />

  
) : page === "leads" ? (
    <LeadManagement
        userProfile={userProfile}
        startTemplateCreation={startTemplateCreation}
        onTemplateCreationStarted={() => setStartTemplateCreation(false)}
        onBackToWorkspace={() => setPage("workspace")}

            onBackToProposalLibrary={() => {
        setProposalToResume(null);
        setPage("proposal-library");
    }}



        initialLead={leadFromClient}


              resumeProposal={proposalToResume}


              reuseProposal={proposalToReuse}


         onEditClient={client => {
            setClientToEdit(client);
            setPage("clients");
        }}

        onOpenQuotation={(lead, action, quotation) => {
            setQuotationContext({
                lead,
                action,
                quotation: quotation || null
            });
            setPage("dmc");
        }}
    />



    ) : page === "supplier-master" ? (
  <SupplierMaster
    currentUser={user}
    userProfile={userProfile}
    onBackToWorkspace={() => setPage("workspace")}
  />


  ) : page === "hotel-master-supplier" ? (
  <HotelMasterSupplier
  onBackToWorkspace={() => setPage("workspace")}
  isAdmin={
    userProfile?.status === "active" &&
    userProfile?.role === "admin"
  }
/>
  


) : page === "clients" ? (
<ClientAgencyMaster
    currentUser={user}
    userProfile={userProfile}
    onBackToWorkspace={() => setPage("workspace")}
    onOpenLead={lead => {
        setLeadFromClient(lead);
        setPage("leads");
    }}
    onEditClient={client => {
        setClientToEdit(client);
    }}
    clientToEdit={clientToEdit}
/>


) : page === "proposal-library" ? (
    <div
        style={{
            minHeight: "calc(100vh - 58px)",
            background: "#f5f7fa",
            padding: "28px 32px 40px",
            boxSizing: "border-box",
        }}
    >


      
        <div style={{ display: "none" }}>
            <LeadManagement
                userProfile={userProfile}
               startTemplateCreation={false}
                onTemplateCreationStarted={() =>
                    setStartTemplateCreation(false)
                }
                onBackToWorkspace={() =>
                    setPage("workspace")
                }
                onBackToProposalLibrary={() => {
                    setProposalToResume(null);
                    setPage("proposal-library");
                }}
                initialLead={null}
                resumeProposal={null}
            />
        </div>


        <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "18px",
        marginBottom: "18px",
    }}
>
    {/* LEFT — BACK + TITLE */}
<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flex: "0 0 auto",
    }}
>
    <button
        type="button"
        onClick={() => setPage("workspace")}
        style={{
            border: "1px solid #cbd5e1",
            background: "#b0f52f",
            color: "#334155",
            borderRadius: "7px",
            padding: "7px 11px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
        }}
    >
        ← Workspace
    </button>

    <div>

        <h1
            style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 750,
                color: "#2718f5",
            }}
        >
            Proposal Library
        </h1>

        <div
            style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#64748b",
            }}
        >
            Saved proposals & reusable templates
        </div>


        

    </div>
    </div>



    {/* MIDDLE — SEARCH */}
    <input
        type="text"
        placeholder="Search proposals..."
        value={proposalSearch}
onChange={(e) => setProposalSearch(e.target.value)}
        style={{
            flex: "1 1 auto",
            maxWidth: "360px",
            height: "34px",
            padding: "0 12px",
            border: "1px solid #d7dee8",
            borderRadius: "7px",
            outline: "none",
            fontSize: "12px",
            color: "#172033",
            background: "#ffffff",
            boxSizing: "border-box",
        }}
    />

    {/* RIGHT — FILTER TABS */}
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px",
            background: "#eef2f7",
            borderRadius: "8px",
            flex: "0 0 auto",
        }}
    >
        
<button
    type="button"
    onClick={() => setProposalLibraryFilter("all")}
    style={{
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        background:
            proposalLibraryFilter === "all"
                ? "#b0f52f"
                : "transparent",
        color:
            proposalLibraryFilter === "all"
                ? "#172033"
                : "#64748b",
        fontSize: "11px",
        fontWeight:
            proposalLibraryFilter === "all" ? 700 : 600,
        cursor: "pointer",
    }}
>
    All
</button>

<button
    type="button"
    onClick={() => setProposalLibraryFilter("lead")}
    style={{
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        background:
            proposalLibraryFilter === "lead"
                ? "#b0f52f"
                : "transparent",
        color:
            proposalLibraryFilter === "lead"
                ? "#172033"
                : "#64748b",
        fontSize: "11px",
        fontWeight:
            proposalLibraryFilter === "lead" ? 700 : 600,
        cursor: "pointer",
    }}
>
    Lead Proposals
</button>

<button
    type="button"
    onClick={() => setProposalLibraryFilter("templates")}
    style={{
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        background:
            proposalLibraryFilter === "templates"
                ? "#b0f52f"
                : "transparent",
        color:
            proposalLibraryFilter === "templates"
                ? "#172033"
                : "#64748b",
        fontSize: "11px",
        fontWeight:
            proposalLibraryFilter === "templates" ? 700 : 600,
        cursor: "pointer",
    }}
>
    Templates
</button>

    </div>
</div>



{/* CREATE TEMPLATE — SECOND ROW */}
<div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        marginTop: "-10px",
        marginBottom: "10px",
        paddingRight: "16px",
        boxSizing: "border-box",
    }}
>
    <button
        type="button"
        onClick={() => {
            setProposalToResume(null);
            setPage("leads");
            setStartTemplateCreation(true);
        }}
        style={{
            border: "1px solid #cbd5e1",
            background: "#b6f5f2",
            color: "#334155",
            borderRadius: "7px",
            padding: "8px 12px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
        }}
    >
        + Create Template Proposal
    </button>
</div>


       <div
    style={{
        marginTop: "20px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
    }}
>


  <div
    style={{
        display: "grid",
      gridTemplateColumns:
    "minmax(280px, 2.2fr) 160px 120px 120px 130px 100px 160px",
        alignItems: "center",
        gap: "16px",
        padding: "9px 16px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    }}
>
    <div style={{ textAlign: "left" }}>Proposal Title</div>
<div style={{ textAlign: "left" }}>Name</div>
<div style={{ textAlign: "left" }}>TYPE / LEAD ID</div>
<div style={{ textAlign: "left" }}>Destination</div>
<div style={{ textAlign: "left" }}>Delivery Status</div>
<div style={{ textAlign: "left" }}>Created By</div>
<div style={{ textAlign: "left" }}>Actions</div>
</div>



   {proposalLibrary
    .filter((item) => {


if (
    proposalLibraryFilter === "lead" &&
    (
        item.recordType === "template" ||
        !item.leadId
    )
) {
    return false;
}

if (
    proposalLibraryFilter === "templates" &&
    item.recordType !== "template"
) {
    return false;
}


       const search =
            proposalSearch.trim().toLowerCase();

        if (!search) return true;

        const title =
            item.proposal?.proposalTitle || "";

        const destination =
            item.destination || "";

        const createdBy =
            item.createdByUsername || "";

        return (
            title.toLowerCase().includes(search) ||
            destination.toLowerCase().includes(search) ||
            createdBy.toLowerCase().includes(search)
        );
    })
    .map((item) => (
        <div
            key={item.id}
            style={{
                display: "grid",
                gridTemplateColumns:
                    "minmax(280px, 2.2fr) 160px 120px 120px 130px 100px 160px",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                minHeight: "76px",
                background: "#ffffff",
                borderBottom: "1px solid #eef2f7",
                boxSizing: "border-box",
            }}
        >
            {/* Proposal Title */}
            <div
                style={{
                    textAlign: "left",
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: 750,
                        color: "#172033",
                        lineHeight: 1.35,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {item.proposal?.proposalTitle ||
                        "Untitled Proposal"}
                </div>
            </div>

            {/* Name */}
            <div
                style={{
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                }}
            >
                {proposalLeadNames[item.leadId] || "—"}
            </div>

           
{/* Type / Lead ID */}
<div
    style={{
        textAlign: "left",
        fontSize: "11px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        color:
            item.recordType === "template"
                ? "#7c3aed"
                : "#2563eb",
    }}
>
    {item.recordType === "template"
        ? "TEMPLATE"
        : proposalLeadIds[item.leadId] || "—"}
</div>

            {/* Destination */}
            <div
                style={{
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                }}
            >
                {item.destination || "—"}
            </div>



           


{/* Delivery Status */}
<div
    style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    minWidth: 0,
    width: "max-content",
    maxWidth: "100%",
    whiteSpace: "nowrap",
}}
>
    {/* Status capsule */}
    <div style={{ position: "relative" }}>
        <button
            type="button"
            title="Click to change delivery status"
            
onClick={() => {
    const nextStatus =
        (item.deliveryStatus || "Not Sent") === "Sent"
            ? "Not Sent"
            : "Sent";

    handleUpdateProposalDelivery(
        item,
        nextStatus,
        nextStatus === "Not Sent"
            ? ""
            : item.deliveryChannel || ""
    );
}}

            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                boxSizing: "border-box",
                gap: "6px",
                padding: "5px 10px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor:
                    item.deliveryStatus === "Sent"
                        ? "#a7e8bf"
                        : "#f5d58a",
                background:
                    item.deliveryStatus === "Sent"
                        ? "#e5f9ec"
                        : "#fff5dc",
                color:
                    item.deliveryStatus === "Sent"
                        ? "#166534"
                        : "#946200",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
            }}
        >
            {item.deliveryStatus === "Sent" ? (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    aria-hidden="true"
                >
                    <circle cx="7.5" cy="7.5" r="7" fill="#16803d" />
                    <path
                        d="M4 7.6 6.4 10 11 5.2"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : null}
            {item.deliveryStatus || "Not Sent"}
        </button>

        
    </div>

    {/* Delivery channel capsule */}
    {item.deliveryStatus === "Sent" && (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                title="Click to change delivery channel"
                onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    if (menu) {
                        menu.style.display =
                            menu.style.display === "block"
                                ? "none"
                                : "block";
                    }
                }}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "5px 10px",
                    borderRadius: "999px",
                    border: "1px solid #bfd8fb",
                    background: "#edf5ff",
                    color: "#174b91",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                }}
            >
                {item.deliveryChannel === "WhatsApp" ? (
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2878e8"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5Z" />
                        <path d="M8.5 8.2c.4-.6.8-.4 1.1.2l.7 1.4c.2.4 0 .7-.4 1l-.5.4c.6 1.2 1.5 2.1 2.7 2.7l.4-.5c.3-.4.6-.6 1-.4l1.4.7c.6.3.8.7.2 1.1-.6.7-1.4.9-2.3.6-2.4-.7-4.9-3.2-5.6-5.6-.3-.9-.1-1.7.6-2.3Z" />
                    </svg>
                ) : item.deliveryChannel === "Email" ? (
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2878e8"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m4 7 8 6 8-6" />
                    </svg>
                ) : null}

                {item.deliveryChannel === "WhatsApp"
                    ? "Via WhatsApp"
                    : item.deliveryChannel === "Email"
                    ? "Via Email"
                    : item.deliveryChannel === "Both"
                    ? "Both"
                    : "Select channel"}
            </button>

            <div
                style={{
                    display: "none",
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    minWidth: "125px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
                    zIndex: 30,
                    overflow: "hidden",
                }}
            >
                {[
                    { label: "Via WhatsApp", value: "WhatsApp" },
                    { label: "Via Email", value: "Email" },
                    { label: "Both", value: "Both" },
                ].map((channel) => (
                    <button
                        key={channel.value}
                        type="button"
                        onClick={(e) => {
                            handleUpdateProposalDelivery(
                                item,
                                "Sent",
                                channel.value
                            );

                            e.currentTarget.parentElement.style.display =
                                "none";
                        }}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 10px",
                            border: "none",
                            background: "#ffffff",
                            color: "#334155",
                            textAlign: "left",
                            fontSize: "11px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {channel.label}
                    </button>
                ))}
            </div>
        </div>
    )}
</div>



            {/* Created By */}
            <div
                style={{
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                }}
            >
                {item.createdByUsername || "—"}
            </div>

           
{/* Actions */}
<div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "4px",
        flexWrap: "nowrap",
        whiteSpace: "nowrap",
        width: "100%",
    }}
>
    <button
        type="button"
        onClick={() => {
            setProposalToResume(item);
            setPage("leads");
        }}
        style={{
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#334155",
            borderRadius: "6px",
           padding: "5px 7px",
fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
        }}
    >
        Resume
    </button>


    <button
    type="button"
    onClick={async () => {
    setProposalToReuse(item);
    setReuseLead(null);
    setReuseLeadsLoading(true);

    try {
        const leads = await getAllLeads();
        setReuseLeads(Array.isArray(leads) ? leads : []);
    } catch (error) {
        console.error("Failed to load Leads for reuse:", error);
        setReuseLeads([]);
        alert("Could not load Leads. Please try again.");
    } finally {
        setReuseLeadsLoading(false);
    }
}}
    style={{
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: "6px",
       padding: "5px 7px",
fontSize: "11px",
        fontWeight: 700,
        cursor: "pointer",
    }}
>
    Reuse
</button>


<button
    type="button"
    disabled={userProfile?.role !== "admin"}
    onClick={async () => {
        if (userProfile?.role !== "admin") return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${
                item.proposal?.proposalTitle ||
                "Untitled Proposal"
            }" from the Proposal Library? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteProposal(item.id);

            setProposalLibrary((current) =>
                current.filter(
                    (proposal) => proposal.id !== item.id
                )
            );
        } catch (error) {
            console.error(
                "Failed to delete proposal:",
                error
            );

            alert(
                "The proposal could not be deleted. Please try again."
            );
        }
    }}
    style={{
        border: "1px solid #cbd5e1",
        background:
            userProfile?.role === "admin"
                ? "#fff1f2"
                : "#e5e7eb",
        color:
            userProfile?.role === "admin"
                ? "#b91c1c"
                : "#9ca3af",
        borderRadius: "6px",
        padding: "5px 7px",
fontSize: "11px",
        fontWeight: 700,
        cursor:
            userProfile?.role === "admin"
                ? "pointer"
                : "not-allowed",
        opacity:
            userProfile?.role === "admin"
                ? 1
                : 0.75,
    }}
>
    Delete
</button>

</div>

        </div>
   
    ))}

    {/* Reuse Proposal Dialog */}
    {proposalToReuse && (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#ffffff",
                    width: "100%",
                    maxWidth: "480px",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                }}
            >
                <h2 style={{ marginTop: 0, color: "#0f172a" }}>
                    Reuse Proposal
                </h2>

                <p style={{ color: "#475569", fontSize: "14px" }}>
                    Select an existing Lead for this new proposal.
                    The original proposal will remain unchanged.
                </p>

                {reuseLeadsLoading ? (
                    <p>Loading Leads...</p>
                ) : reuseLeads.length === 0 ? (
                    <p style={{ color: "#b91c1c" }}>
                        No Leads were found. Please check Lead Management.
                    </p>
                ) : (
                    <select
                        value={reuseLead?.id || ""}
                        onChange={(event) => {
                            const selected = reuseLeads.find(
                                (lead) => lead.id === event.target.value
                            );
                            setReuseLead(selected || null);
                        }}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        <option value="">-- Select a Lead --</option>
                        {reuseLeads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                                {lead.name || "Unnamed Lead"}
                                {lead.leadId ? ` (${lead.leadId})` : ""}
                            </option>
                        ))}
                    </select>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setProposalToReuse(null);
                            setReuseLead(null);
                        }}
                        style={{
                            padding: "9px 14px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "7px",
                            background: "#ffffff",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!reuseLead || reuseLeadsLoading}
                      onClick={() => {
    if (!proposalToReuse || !reuseLead) {
        return;
    }

    setProposalToResume(null);

    setProposalToReuse({
        ...proposalToReuse,
        reuseLeadId: reuseLead.id,
    });

    setReuseLead(null);
    setPage("leads");
}}
                        style={{
                            padding: "9px 14px",
                            border: "none",
                            borderRadius: "7px",
                            background: reuseLead ? "#1d4ed8" : "#94a3b8",
                            color: "#ffffff",
                            fontWeight: 700,
                            cursor: reuseLead ? "pointer" : "not-allowed",
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    )}

</div>
</div>



) : page === "services" ? (
    <div
        style={{
            minHeight: "calc(100vh - 58px)",
            background: "#f5f7fa",
            padding: "28px 32px 40px",
            boxSizing: "border-box",
        }}
    >
        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "24px"
    }}
>
    <button
        type="button"
        onClick={() => setPage("workspace")}
        style={{
            border: "1px solid #cbd5e1",
            background: "#b0f52f",
            color: "#334155",
            borderRadius: "8px",
            padding: "9px 15px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap"
        }}
    >
        ← Workspace
    </button>

    {servicesView !== "home" && (
    <button
        type="button"
        onClick={() => setServicesView("home")}
        style={{
            border: "1px solid #cbd5e1",
            background: "#99dbf5",
            color: "#334155",
            borderRadius: "8px",
            padding: "9px 15px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap"
        }}
    >
        ← Services Home
    </button>
)}


    {servicesView === "transactions" && selectedService && (
    <button
        type="button"
        onClick={() => setServicesView("new")}
        style={{
            border: "1px solid #93c5fd",
            background: "linear-gradient(110deg, #e8f2ff, #dbeafe)",
            color: "#1e40af",
            borderRadius: "8px",
            padding: "9px 15px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap"
        }}
    >
        ← Back to {selectedService.serviceName}
    </button>
)}


</div>

       

{servicesView === "home" ? (
    <div
        style={{
            display: "grid",
            gridTemplateColumns:
    userProfile?.role === "admin"
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(2, minmax(0, 1fr))",
            gap: "22px",
            width: "100%",
        }}
    >
       
{/* SERVICES HOME */}
<button
    type="button"
    onClick={() => setServicesView("new")}
    style={{
        padding: 0,
        overflow: "hidden",
        textAlign: "left",
        border: "1px solid #bfdbfe",
        borderRadius: "16px",
        background: "#ffffff",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 8px 22px rgba(30,64,175,0.10)",
        minWidth: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
    }}
>
   {/* SERVICES HOME — PREMIUM ASYMMETRIC COLLAGE */}
<div
    style={{
        height: "235px",
        minHeight: "235px",
        flex: "0 0 235px",
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gridTemplateRows: "repeat(3, minmax(0, 1fr))",
        gap: "4px",
        position: "relative",
        overflow: "hidden",
        background: "#ffffff",
        width: "100%",
    }}
>
    {[
        {
            src: "cruise.webp",
            alt: "Cruise Services",
            style: {
                gridColumn: "span 2",
                gridRow: "span 2",
            },
        },
        { src: "flights.webp", alt: "Flight Ticket" },
        { src: "passport-services.webp", alt: "Passport Services" },
        { src: "visa-services.webp", alt: "Visa Services" },
        { src: "hotels.webp", alt: "Hotel Services" },
        { src: "train-ticket.webp", alt: "Train Ticket" },
        { src: "forex.webp", alt: "Forex and Currency Exchange" },
        { src: "destinations.webp", alt: "Holiday Destinations" },
        { src: "travel-insurance.webp", alt: "Travel Insurance" },
    ].map(item => (
        <img
            key={item.src}
            src={`/images/services/webp/${item.src}`}
            alt={item.alt}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                minWidth: 0,
                minHeight: 0,
                ...(item.style || {}),
            }}
        />
    ))}

    <div
        style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg,rgba(5,30,55,.30),transparent 65%)",
            pointerEvents: "none",
        }}
    />
</div>




    {/* SERVICES HOME TEXT PANEL */}
    <div
        style={{
            padding: "20px 22px 22px",
            background: "linear-gradient(145deg,#ffffff,#eaf5ff)",
            flex: 1,
            width: "100%",
            boxSizing: "border-box",
        }}
    >
        <div style={{ fontSize: "23px", fontWeight: 800, color: "#164da5" }}>
            Services Home
        </div>

        <div style={{ marginTop: "8px", fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            Explore Orbitz travel services and service activities.
        </div>

        <div style={{ marginTop: "17px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb" }}>
                EXPLORE SERVICES
            </span>

            <span style={{
                background: "#1675dc",
                color: "#fff",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "grid",
                placeItems: "center",
                fontSize: "23px",
            }}>→</span>
        </div>

       
<div
    style={{
        marginTop: "15px",
        paddingTop: "12px",
        borderTop: "1px solid #dbeafe",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    }}
>
    {/* First row */}
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "3px",
            flexWrap: "nowrap",
        }}
    >
        {["Flights", "Hotels", "Packages", "Visa", "Rail", "Forex", "Cruise"].map(item => (
            <span
                key={item}
                style={{
                    border: "1px solid #93c5fd",
                    background: "#ffffff",
                    color: "#164da5",
                    borderRadius: "20px",
                    padding: "6px 6px",
                    fontSize: "9px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                }}
            >
                {item}
            </span>
        ))}
    </div>

    {/* Second row */}
    <div style={{ display: "flex" }}>
        <span
            style={{
                border: "1px solid #93c5fd",
                background: "#ffffff",
                color: "#164da5",
                borderRadius: "20px",
                padding: "6px 9px",
                fontSize: "10px",
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            Travel Insurance
        </span>
    </div>
</div>

    </div>
</button>


       
{/* SERVICE TRANSACTIONS */}
<button
    type="button"
    onClick={() => setServicesView("transactions")}
    style={{
        padding: 0,
        overflow: "hidden",
        textAlign: "left",
        border: "1px solid #99f6e4",
        borderRadius: "16px",
        background: "#ffffff",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 8px 22px rgba(13,148,136,0.11)",
        minWidth: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
    }}
>
    {/* PHOTOGRAPHIC SERVICE COLLAGE */}
<div
    style={{
        height: "235px",
        minHeight: "235px",
        flex: "0 0 235px",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gridTemplateRows: "repeat(3, minmax(0, 1fr))",
        gap: "4px",
        background: "#ffffff",
        width: "100%",
    }}
>
    {[
        {
    src: "flights.webp",
    alt: "Flight Ticket",
    style: {
        gridColumn: "span 2",
        gridRow: "span 2",
    },
},
        { src: "passport-services.webp", alt: "Passport Services" },
        { src: "visa-services.webp", alt: "Visa Services" },
        { src: "hotels.webp", alt: "Hotel Services" },
        { src: "train-ticket.webp", alt: "Train Ticket" },
        { src: "forex.webp", alt: "Forex and Currency Exchange" },
        { src: "cruise.webp", alt: "Cruise Services" },
        { src: "destinations.webp", alt: "Holiday Destinations" },
        { src: "travel-insurance.webp", alt: "Travel Insurance" },
    ].map((item) => (
        <img
            key={item.src}
            src={`/images/services/webp/${item.src}`}
            alt={item.alt}
           style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    minWidth: 0,
    minHeight: 0,
    ...(item.style || {}),
}}
        />
    ))}

    <div
        style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg,rgba(0,45,55,.25),transparent 60%)",
            pointerEvents: "none",
        }}
    />
</div>



    {/* SERVICE TRANSACTIONS TEXT PANEL */}
    <div
        style={{
            padding: "20px 22px 22px",
            background: "linear-gradient(145deg,#ffffff,#e6faf5)",
            flex: 1,
            width: "100%",
            boxSizing: "border-box",
        }}
    >
        <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
}}>
    <div style={{ fontSize: "23px", fontWeight: 800, color: "#08786f" }}>
        Service Transactions
    </div>

    <span style={{
        background: "#ccfbf1",
        color: "#087c69",
        borderRadius: "20px",
        padding: "6px 10px",
        fontSize: "9px",
        fontWeight: 800,
        whiteSpace: "nowrap",
    }}>
        CUSTOMER SERVICE RECORDS
    </span>
</div>

        <div style={{ marginTop: "8px", fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            Create, view and manage customer transactions for every active service.
        </div>

        <div style={{ marginTop: "17px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#0d9488" }}>
                OPEN TRANSACTIONS
            </span>

            <span style={{
                background: "#079b82",
                color: "#fff",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "grid",
                placeItems: "center",
                fontSize: "23px",
            }}>→</span>
        </div>

        <div style={{
            marginTop: "15px",
            paddingTop: "12px",
            borderTop: "1px solid #ccefe8",
            fontSize: "10px",
            color: "#397c75",
            fontWeight: 700,
        }}>
            CLIENT LINKED · UNIQUE SERVICE RECORD ID
        </div>
    </div>
</button>


        
{/* MANAGE SERVICES — ADMIN ONLY */}
{userProfile?.role === "admin" && (
    <button
        type="button"
        onClick={() => setServicesView("manage")}
        style={{
            padding: 0,
            overflow: "hidden",
            textAlign: "left",
            border: "1px solid #ddd6fe",
            borderRadius: "16px",
            background: "#ffffff",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 8px 22px rgba(109,40,217,0.10)",
            minWidth: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
        }}
    >
        {/* SERVICE MANAGEMENT PHOTOGRAPH */}
        <div
            style={{
                height: "235px",
                minHeight: "235px",
                flex: "0 0 235px",
                position: "relative",
                overflow: "hidden",
                width: "100%",
                background: "#ede9fe",
            }}
        >
            <img
                src="/images/services/webp/service-management.webp"
                alt="Service management workspace"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(0deg,rgba(49,20,90,.35),transparent 60%)",
                    pointerEvents: "none",
                }}
            />
        </div>

        {/* MANAGE SERVICES TEXT PANEL */}
        <div
            style={{
                padding: "20px 22px 22px",
                background: "linear-gradient(145deg,#ffffff,#f3edff)",
                flex: 1,
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <div style={{ fontSize: "23px", fontWeight: 800, color: "#6425b8" }}>
                Manage Services
            </div>

            <div style={{ marginTop: "8px", fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                Add, edit, activate and deactivate service definitions and configure their forms.
            </div>

            <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#702bc5",
                    background: "#e9d5ff",
                    borderRadius: "20px",
                    padding: "7px 12px",
                }}>
                    ADMIN ONLY
                </span>

                <span style={{
                    background: "#702bc5",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "38px",
                    height: "38px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "23px",
                }}>→</span>
            </div>
        </div>
    </button>
)}

    </div>



) : (
    <div
    style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "24px",
    }}
>
    <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        marginBottom: "16px",
    }}
>
       


        {servicesView === "new" && selectedService && (
    <button
        type="button"
        onClick={() => setSelectedService(null)}
        style={{
            border: "1px solid #cbd5e1",
            background: "#99dbf5",
            borderRadius: "7px",
            padding: "7px 12px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
        }}
    >
        ← Back to Services
    </button>
)}



{servicesView === "new" && selectedService && (
    <button
        type="button"
       onClick={() => {
    setNewlySavedServiceRecordId(null);
    setServicesView("transactions");
}}
        style={{
            border: "1px solid #93c5fd",
            background: "linear-gradient(110deg, #e8f2ff, #dbeafe)",
            color: "#1e40af",
            borderRadius: "7px",
            padding: "8px 14px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(30,64,175,0.10)",
        }}
    >
        📋 View Service Transactions →
    </button>
)}



        {(servicesView !== "new" || !selectedService) &&
    servicesView !== "transactions" && (
        <div style={{
            width: "100%",
            marginBottom: "18px",
            padding: "15px 22px",
            boxSizing: "border-box",
            background: "linear-gradient(110deg, #123b78 0%, #1765b5 55%, #2589dc 100%)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "12px",
            boxShadow: "0 5px 16px rgba(23,76,145,0.16)",
        }}>
            <h2 style={{
                margin: 0,
                fontSize: "21px",
                fontWeight: 800,
                letterSpacing: "0.2px",
                color: "#ffffff",
                textAlign: "left",
            }}>
                {servicesView === "new"
                    ? "New Service Booking"
                    : "Manage Services"}
            </h2>

            <p
             style={{
    display: "block",
    width: "100%",
    margin: "4px 0 0",
    fontSize: "11px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.82)",
    letterSpacing: "0.25px",
    textAlign: "left",
}}
            >
                {servicesView === "new"
                    ? "Create and manage customer service bookings."
                    : "Configure and manage your service catalogue."}
            </p>
        </div>
    )}
    </div>

       {servicesView === "new" ? (
    selectedService ? (
       <ServiceBooking
    service={selectedService}
    onBack={() => setSelectedService(null)}
    onBookingSaved={(record) => {
    setNewlySavedServiceRecordId(record.id);
}}

onViewSavedBooking={() => setServicesView("transactions")}
/>
    ) : (
        <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "13px", color: "#64748b" }}>
                Select a service to start a new customer transaction.
            </p>

            {servicesLoading ? (
                <p style={{ color: "#64748b" }}>
                    Loading available services...
                </p>
            ) : servicesError ? (
                <p style={{ color: "#b91c1c" }}>
                    {servicesError}
                </p>
            ) : activeServices.length === 0 ? (
                <p style={{ color: "#64748b" }}>
                    No active services are currently available.
                    Please ask an administrator to configure the Service Catalogue.
                </p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "14px",
                        marginTop: "18px",
                    }}
                >
                   
{activeServices.map(service => {
    const serviceName = (service.serviceName || "").toLowerCase();

    // Match each service with its original project image
    const serviceImage =
        serviceName.includes("flight") ? "flights.webp" :
        serviceName.includes("visa") ? "visa-services.webp" :
        serviceName.includes("hotel") ? "hotels.webp" :
        serviceName.includes("train") || serviceName.includes("rail")? "train-ticket.webp" :
        serviceName.includes("forex") || serviceName.includes("currency") ? "forex.webp" :
        serviceName.includes("cruise") ? "cruise.webp" :
        serviceName.includes("passport") ? "passport-services.webp" :
        serviceName.includes("insurance") ? "travel-insurance.webp" :
        null;

    return (
        <button
            key={service.id}
            type="button"
            onClick={() => setSelectedService(service)}
            style={{
                padding: 0,
                textAlign: "left",
                border: "1px solid #bfdbfe",
                borderRadius: "14px",
                background: "#ffffff",
                cursor: "pointer",
                fontFamily: "inherit",
                overflow: "hidden",
                width: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 5px 18px rgba(30,64,175,0.08)",
                transition: "box-shadow 0.2s ease",
            }}
        >
            {/* SERVICE PHOTOGRAPH */}
            <div
                style={{
                    width: "100%",
                    height: "145px",
                    overflow: "hidden",
                    background: "#eff6ff",
                }}
            >
                {serviceImage ? (
                    <img
                        src={`/images/services/webp/${serviceImage}`}
                        alt={service.serviceName}
                        style={{
                            width: "100%",
                            height: "100%",
                           objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            color: "#64748b",
                            fontSize: "12px",
                        }}
                    >
                        Service image unavailable
                    </div>
                )}
            </div>

            {/* SERVICE INFORMATION */}
            <div
                style={{
                    padding: "15px 16px 17px",
                    width: "100%",
                    boxSizing: "border-box",
                    background: "linear-gradient(145deg,#ffffff,#f0f7ff)",
                }}
            >
                <div
                    style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#164da5",
                    }}
                >
                    {service.serviceName}
                </div>

                <div
                    style={{
                        marginTop: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#64748b",
                        }}
                    >
                        Select service
                    </span>

                    <span
                        style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "#1675dc",
                            color: "#ffffff",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "18px",
                        }}
                    >
                        →
                    </span>
                </div>
            </div>
        </button>
    );
})}

                </div>
            )}
        </div>
    )

) : servicesView === "transactions" ? (
   <ServiceTransactions
   initialSelectedRecordId={newlySavedServiceRecordId}
    onBack={() => {
        if (selectedService) {
            setServicesView("new");
        } else {
            setServicesView("home");
        }
    }}
/>
        ) : servicesView === "manage" && userProfile?.role !== "admin" ? (
            <p style={{ color: "#b91c1c" }}>
                Access denied. Admin permission is required.
            </p>
       ) : (
    <ManageServices
        onBack={() => setServicesView("home")}
    />
)
        }
    </div>
)}

    </div>



) : page === "backup-recovery" &&

  import.meta.env.DEV &&
  userProfile?.role === "admin" ? (
  <BackupRecoveryCenter
    onBack={() => setPage("workspace")}
  />

) : page === "tour" ? (
  
  <TourPackageMaker />
) : page === "admin" &&
  userProfile?.role === "admin" ? (
  <AdminUserManagement
  onBackToWorkspace={() => setPage("workspace")}
/>
) : (
  <DMCQuotationGenerator
    currentUser={user}
    userProfile={userProfile}
    onBackToWorkspace={() => setPage("workspace")}
    quotationContext={quotationContext}
/>
)}

    </div>
  );
}