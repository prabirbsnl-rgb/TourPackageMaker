

import React from "react";

import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
  getCurrency
} from "../../config/currencies";

export default function CostCalculator({ commonData, setCommonData }) {

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
    <div style={{ flex: 1 }}>
      <label style={{ display: "block", marginBottom: 5, fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        style={{ ...inputStyle, ...style }}
      />
    </div>
  );

  



  return (
    <div>

     {/* CURRENCY */}

<div
  style={{
    marginBottom: "15px"
  }}
>
  <label
    style={{
      display: "block",
      marginBottom: 5,
      fontWeight: 600
    }}
  >
    Quotation Currency
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
      cursor: "pointer",
      background: "#fff"
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

{/* COST PER PAX */}

<label
  style={{
    display: "block",
    marginBottom: 5,
    fontWeight: 600
  }}
>
  Cost Per Pax ({selectedCurrency.symbol})
</label>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Field
  label={`Per Adult Cost (${selectedCurrency.symbol})`}
          value={commonData?.perAdultCost}
          onChange={(e) =>
            updateField("perAdultCost", e.target.value)
          }
        />

        <Field
  label={`Per Child Cost (${selectedCurrency.symbol})`}
          value={commonData?.perChildCost}
          onChange={(e) =>
            updateField("perChildCost", e.target.value)
          }
        />
      </div>

      {/* MARKUP + GST */}
<div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-end",
  }}
>

  <Field
    label="Markup (%)"
    value={commonData?.markupPercent}
    onChange={(e) =>
      updateField("markupPercent", e.target.value)
    }
    style={{ marginBottom: 0 }}
  />

  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
      whiteSpace: "nowrap",
      fontWeight: 500,
    }}
  >
    <input
      type="checkbox"
      checked={commonData?.applyGst || false}
      onChange={(e) =>
        updateField("applyGst", e.target.checked,false )
      }
    />
    Apply GST
  </label>

  <Field
    label="GST (%)"
    value={commonData?.gstPercent}
    onChange={(e) =>
      updateField("gstPercent", e.target.value)
    }
    style={{ marginBottom: 0 }}
  />

</div>

      {/* USD + TOGGLE */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
          marginTop: 10
        }}
      >
        <Field
          label={`Exchange Rate (1 USD = ${selectedCurrency.symbol})`}
          value={commonData?.usdRate ?? 86}
          onChange={(e) =>
            updateField("usdRate", e.target.value)
          }
          style={{ marginBottom: 0 }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
            marginBottom: 10
          }}
        >
          <input
            type="checkbox"
            checked={commonData?.showUsd || false}
            onChange={(e) =>
              setCommonData({
                ...commonData,
                showUsd: e.target.checked
              })
            }
          />
          Show USD in Preview
        </label>
      </div>

    </div>
  );
}