import { useState } from "react";
import TourPackageMaker from "./TourPackageMaker";
import DMCQuotationGenerator from "./pages/DMCQuotationGenerator";

export default function App() {
  const [page, setPage] = useState("dmc");

  return (
    <div>
      <div
        style={{
          padding: "15px",
          background: "#111827",
          display: "flex",
          gap: "10px"
        }}
      >
        <button onClick={() => setPage("tour")}>
          Tour Package Maker
        </button>

        <button onClick={() => setPage("dmc")}>
          DMC Quotation
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