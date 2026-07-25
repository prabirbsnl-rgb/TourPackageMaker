import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";
import TourPackageMaker from "./TourPackageMaker";
import DMCQuotationGenerator from "./pages/DMCQuotationGenerator";

export default function App() {
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

const LOGIN_ENABLED = false;

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });

  return unsubscribe;
}, []);

  const [page, setPage] = useState("dmc");

if (loading) {
  return <div>Loading...</div>;
}

if (LOGIN_ENABLED && !user) {
  return <Login onLogin={() => {}} />;
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
      ) : (
        <DMCQuotationGenerator />
      )}
    </div>
  );
}