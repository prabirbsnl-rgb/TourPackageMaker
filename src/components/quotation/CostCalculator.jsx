

import React from "react";

import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
  getCurrency
} from "../../config/currencies";


import {
  calculateQuotationTotals
} from "../../utils/quotationCalculator";




export default function CostCalculator({
  commonData,
  packageData,
  itineraryData,
  setCommonData
}) {

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  };

  const selectedCurrency =
    getCurrency(
      commonData?.currency ||
      DEFAULT_CURRENCY
    );


    


  // reusable field update helper
  const updateField = (key, value, isNumber = true) => {
  setCommonData({
    ...commonData,
    [key]:
      isNumber && value !== ""
        ? Number(value)
        : value,
  });
};

  // reusable input component
 const Field = ({
  label,
  value,
  onChange,
  type = "number",
  style = {}
}) => (
  <div
    style={{
      width: "100%",
      minWidth: 0
    }}
  >
    <label
      style={{
        display: "block",
        marginBottom: "4px",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: 600,
        color: "#52658a",
        textAlign: "center"
      }}
    >
      {label}
    </label>

    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      style={{
  ...inputStyle,
  width: "100%",
  height: "34px",
  padding: "6px 9px",
  fontSize: "12px",
  borderRadius: "7px",
  cursor: "pointer",
  background: "#fff",
  boxSizing: "border-box"
}}
    />
  </div>
);
  

  /* =====================================================
     LIVE COSTING CALCULATIONS
  ===================================================== */

  const {
    totalCost,
    gstAmount,
    costWithGst,
    markupAmount,
    suggestedTotalAmount
  } = calculateQuotationTotals({
    commonData,
    usdRate: commonData?.usdRate
  });

  const totalAmountPayable =
  commonData?.totalAmountPayable !== undefined &&
  commonData?.totalAmountPayable !== ""
    ? Number(commonData.totalAmountPayable)
    : suggestedTotalAmount;



  return (
  <div>

        {!commonData?.useVehicleCosting && (
      <>

    {/* =====================================================
        ROW 1 — CURRENCY / ADULT / CHILD
    ===================================================== */}

    <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "8px",
    alignItems: "start"
  }}
>

      {/* SELECT CURRENCY */}

      <div>

        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#52658a",
            lineHeight: "16px"
          }}
        >
          Select Currency
        </label>

        <select
          value={
            commonData?.currency ||
            DEFAULT_CURRENCY
          }
          onChange={(e) =>
            setCommonData({
              ...commonData,
              currency: e.target.value
            })
          }
          style={{
            ...inputStyle,
            height: "34px",
            padding: "6px 9px",
            fontSize: "12px",
            borderRadius: "7px",
            cursor: "pointer",
            background: "#fff",
            boxSizing: "border-box"
          }}
        >
          {CURRENCY_OPTIONS.map(
            (currency) => (
              <option
                key={currency.code}
                value={currency.code}
              >
                {currency.label}
              </option>
            )
          )}
        </select>

      </div>


      {/* ADULT COST */}

      <Field
        label={`Per Adult Cost (${selectedCurrency.symbol})`}
        value={
          commonData?.perAdultCost
        }
        onChange={(e) =>
          updateField(
            "perAdultCost",
            e.target.value
          )
        }
        style={{
          height: "34px",
          padding: "6px 9px",
          fontSize: "12px",
          borderRadius: "7px",
          boxSizing: "border-box"
        }}
      />


      {/* CHILD COST */}

      <Field
        label={`Per Child Cost (${selectedCurrency.symbol})`}
        value={
          commonData?.perChildCost
        }
        onChange={(e) =>
          updateField(
            "perChildCost",
            e.target.value
          )
        }
        style={{
          height: "34px",
          padding: "6px 9px",
          fontSize: "12px",
          borderRadius: "7px",
          boxSizing: "border-box"
        }}
      />

    </div>


    {/* =====================================================
        ROW 2 — MARKUP / GST | EXCHANGE / USD
    ===================================================== */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "0.9fr auto 0.9fr 2px 1.15fr auto",
        columnGap: "8px",
        alignItems: "end",
        marginBottom: "4px"
      }}
    >

      {/* MARKUP */}

      <Field
        label="Markup (%)"
        value={
          commonData?.markupPercent
        }
        onChange={(e) =>
          updateField(
            "markupPercent",
            e.target.value
          )
        }
        style={{
          height: "34px",
          padding: "6px 9px",
          fontSize: "12px",
          borderRadius: "7px",
          boxSizing: "border-box"
        }}
      />


      {/* APPLY GST */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          height: "34px",
          padding: "0 2px",
          margin: 0,
          whiteSpace: "nowrap",
          fontSize: "12px",
          fontWeight: 600,
          color: "#52658a",
          boxSizing: "border-box"
        }}
      >

        <input
          type="checkbox"
          checked={
            commonData?.applyGst ||
            false
          }
          onChange={(e) =>
            updateField(
              "applyGst",
              e.target.checked,
              false
            )
          }
          style={{
            margin: 0
          }}
        />

        Apply GST

      </label>


      {/* GST */}

      <Field
        label="GST (%)"
        value={
          commonData?.gstPercent
        }
        onChange={(e) =>
          updateField(
            "gstPercent",
            e.target.value
          )
        }
        style={{
          height: "34px",
          padding: "6px 9px",
          fontSize: "12px",
          borderRadius: "7px",
          boxSizing: "border-box"
        }}
      />


      {/* =================================================
          VERTICAL DIVIDER
      ================================================= */}

      <div
        style={{
          width: "1px",
          height: "28px",
          background: "#94a3b8",
          alignSelf: "end",
          marginBottom: "3px"
        }}
      />


      {/* EXCHANGE RATE */}

      <Field
        label={`Exchange Rate (1 USD = ${selectedCurrency.symbol})`}
        value={
          commonData?.usdRate ?? 86
        }
        onChange={(e) =>
          updateField(
            "usdRate",
            e.target.value
          )
        }
        style={{
          height: "34px",
          padding: "6px 9px",
          fontSize: "12px",
          borderRadius: "7px",
          boxSizing: "border-box"
        }}
      />


      {/* SHOW USD IN PDF */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          height: "34px",
          padding: "0 2px",
          margin: 0,
          whiteSpace: "nowrap",
          fontSize: "12px",
          fontWeight: 600,
          color: "#52658a",
          boxSizing: "border-box"
        }}
      >

        <input
          type="checkbox"
          checked={
            commonData?.showUsd ||
            false
          }
          onChange={(e) =>
            setCommonData({
              ...commonData,
              showUsd:
                e.target.checked
            })
          }
          style={{
            margin: 0
          }}
        />

        Show USD in PDF

      </label>

    </div>
      </>
    )}



    {/* =====================================================
    COST SUMMARY
===================================================== */}

{!commonData?.useVehicleCosting && (
  <div
    style={{
      marginTop: "8px",
      paddingTop: "9px",
      borderTop: "1px solid #cbd5e1"
    }}
  >

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
      "1fr 1fr 1fr",
      gap: "10px",
      alignItems: "start"
    }}
  >

    {/* TOTAL COST */}

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
          color: "#52658a"
        }}
      >
        Total Cost
      </label>

      <div
        style={{
          height: "34px",
          display: "flex",
          alignItems: "center",
          padding: "6px 9px",
          boxSizing: "border-box",
          border: "1px solid #c4b5d9",
          borderRadius: "7px",
          background: "#eee7f5",
          fontSize: "12px",
          fontWeight: 700,
          color: "#5b4772"
        }}
      >
        {selectedCurrency.symbol}{" "}
        {totalCost.toLocaleString()}
      </div>

    </div>


    {/* GST AMOUNT */}

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
          color: "#52658a"
        }}
      >
        GST Amount
      </label>

      <div
        style={{
          height: "34px",
          display: "flex",
          alignItems: "center",
          padding: "6px 9px",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: "7px",
          background: "#f8fafc",
          fontSize: "12px",
          fontWeight: 700,
          color: "#334155"
        }}
      >
        {selectedCurrency.symbol}{" "}
        {gstAmount.toLocaleString()}
      </div>

      <div
  style={{
    marginTop: "3px",
    fontSize: "9px",
    lineHeight: "12px",
    color: "#64748b"
  }}
>
  Cost incl. GST:{" "}
  <strong style={{ color: "#52658a" }}>
    {selectedCurrency.symbol}{" "}
    {costWithGst.toLocaleString()}
  </strong>
</div>

    </div>


    {/* MARKUP / PROFIT */}

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
          color: "#52658a"
        }}
      >
        Markup / Profit
      </label>

      <div
        style={{
          height: "34px",
          display: "flex",
          alignItems: "center",
          padding: "6px 9px",
          boxSizing: "border-box",
          border: "1px solid #a7f3d0",
          borderRadius: "7px",
          background: "#ecfdf5",
          fontSize: "12px",
          fontWeight: 700,
          color: "#047857"
        }}
      >
        {selectedCurrency.symbol}{" "}
        {markupAmount.toLocaleString()}
      </div>

    </div>

 </div>


 {/* ---------------------------------------------------
      FINAL SELLING PRICE + DESCRIPTION
  --------------------------------------------------- */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "1fr 2fr",
      gap: "10px",
      alignItems: "start",
      marginTop: "8px"
    }}
  >

    {/* TOTAL AMOUNT PAYABLE */}

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 700,
          color: "#1e3a8a"
        }}
      >
        Total Amount Payable
      </label>

      <input
        type="number"
        value={totalAmountPayable}
        onChange={(e) =>
          setCommonData({
            ...commonData,
            totalAmountPayable:
              e.target.value
          })
        }
        style={{
          ...inputStyle,
          width: "100%",
          height: "34px",
          padding: "6px 9px",
          boxSizing: "border-box",
          fontSize: "12px",
          fontWeight: 700,
          borderRadius: "7px",
        border: "1px solid #c9a24e",
        background: "#f3e3b5",
        color: "#684d18"
        }}
      />

    </div>


    {/* PACKAGE COST DESCRIPTION */}

    <div>

      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 700,
          color: "#52658a"
        }}
      >
        Package Cost Description
      </label>

      <input
        type="text"
        value={
          commonData?.packageCostDescription ||
          ""
        }
        onChange={(e) =>
          setCommonData({
            ...commonData,
            packageCostDescription:
              e.target.value
          })
        }
        placeholder="@ ₹34,999 / Pax"
        style={{
          ...inputStyle,
          width: "100%",
          height: "34px",
          padding: "6px 9px",
          boxSizing: "border-box",
          fontSize: "12px",
          borderRadius: "7px"
        }}
      />

      <div
        style={{
          marginTop: "4px",
          fontSize: "10px",
          lineHeight: "13px",
          color: "#64748b"
        }}
      >
        This description accompanies
        Total Amount Payable in the PDF.
      </div>

    </div>

  </div>

</div>
)}
  </div>
);
}

    