

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile } from "./utils/quotationStorage";

import AdminUserManagement from "./components/admin/AdminUserManagement";

import Login from "./Login";
import TourPackageMaker from "./TourPackageMaker";
import DMCQuotationGenerator from "./pages/DMCQuotationGenerator";

export default function App() {
  const [user, setUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [loading, setLoading] = useState(true);

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

        setPage("dmc");

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

  const [page, setPage] = useState("dmc");

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
    <div>
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

      {page === "tour" ? (
  <TourPackageMaker />
) : page === "admin" &&
  userProfile?.role === "admin" ? (
  <AdminUserManagement />
) : (
  <DMCQuotationGenerator
  userProfile={userProfile}
/>
)}

    </div>
  );
}