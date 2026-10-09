

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile } from "./utils/quotationStorage";

import {
    getProposals,
    getLeadName,
    getLeadBusinessId
} from "./utils/proposalStorage";

import AdminUserManagement from "./components/admin/AdminUserManagement";

import Login from "./Login";
import TourPackageMaker from "./TourPackageMaker";
import DMCQuotationGenerator from "./pages/DMCQuotationGenerator";

import OperationWorkspace from "./pages/OperationWorkspace";
import LeadManagement from "./pages/LeadManagement";
import ClientAgencyMaster from "./pages/ClientAgencyMaster";






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

    const [proposalSearch, setProposalSearch] = useState("");

    const [proposalLeadNames, setProposalLeadNames] = useState({});

    const [proposalLeadIds, setProposalLeadIds] = useState({});

     const [page, setPage] = useState("workspace");


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
    onOpenProposalLibrary={() => setPage("proposal-library")}
/>
  
) : page === "leads" ? (
    <LeadManagement
        userProfile={userProfile}
        onBackToWorkspace={() => setPage("workspace")}

            onBackToProposalLibrary={() => {
        setProposalToResume(null);
        setPage("proposal-library");
    }}



        initialLead={leadFromClient}


              resumeProposal={proposalToResume}



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



) : page === "clients" ? (
<ClientAgencyMaster
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
            background: "#ffffff",
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
                color: "#172033",
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
            style={{
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                background: "#ffffff",
                color: "#172033",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
            }}
        >
            All
        </button>

        <button
            type="button"
            style={{
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                background: "transparent",
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
            }}
        >
            Lead Proposals
        </button>

        <button
            type="button"
            style={{
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                background: "transparent",
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
            }}
        >
            Templates
        </button>
    </div>
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
    "minmax(280px, 2.2fr) 160px 120px 120px 130px 100px 100px",
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
<div style={{ textAlign: "left" }}>Lead ID</div>
<div style={{ textAlign: "left" }}>Destination</div>
<div style={{ textAlign: "left" }}>Delivery Status</div>
<div style={{ textAlign: "left" }}>Created By</div>
<div style={{ textAlign: "left" }}>Actions</div>
</div>



   {proposalLibrary
    .filter((item) => {
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
                    "minmax(280px, 2.2fr) 160px 120px 120px 130px 100px 100px",
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

            {/* Lead ID */}
            <div
                style={{
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                }}
            >
                {proposalLeadIds[item.leadId] || "—"}
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
                    textAlign: "left",
                }}
            >
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        background:
                            item.deliveryStatus === "Sent"
                                ? "#dcfce7"
                                : "#fef3c7",
                        color:
                            item.deliveryStatus === "Sent"
                                ? "#166534"
                                : "#a16207",
                        fontSize: "11px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.deliveryStatus || "Not Sent"}
                </span>
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
                    gap: "6px",
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
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Resume
                </button>
            </div>
        </div>
    ))}
</div>
</div>




) : page === "tour" ? (
  
  <TourPackageMaker />
) : page === "admin" &&
  userProfile?.role === "admin" ? (
  <AdminUserManagement />
) : (
  <DMCQuotationGenerator
  userProfile={userProfile}
  onBackToWorkspace={() => setPage("workspace")}
  quotationContext={quotationContext}
/>
)}

    </div>
  );
}