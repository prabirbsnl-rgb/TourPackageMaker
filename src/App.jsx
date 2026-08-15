

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
    padding: "15px",
    background: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  <div
    style={{
      display: "flex",
      gap: "10px",
    }}
  >
    <button onClick={() => setPage("tour")}>
      Tour Package Maker
    </button>

    <button onClick={() => setPage("dmc")}>
      DMC Quotation
    </button>
  </div>

  {userProfile?.role === "admin" && (
  <button onClick={() => setPage("admin")}>
    User Management
  </button>
)}

  <button
    onClick={() => signOut(auth)}
    style={{
      background: "#DC2626",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
    }}
  >
    Logout
  </button>
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