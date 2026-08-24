

// src/config/currencies.js

export const CURRENCY_OPTIONS = [
  {
    code: "INR",
    label: "INR – ₹",
    symbol: "₹"
  },
  {
    code: "USD",
    label: "USD – $",
    symbol: "$"
  },
  {
    code: "EUR",
    label: "EUR – €",
    symbol: "€"
  },
  {
    code: "GBP",
    label: "GBP – £",
    symbol: "£"
  },
  {
    code: "THB",
    label: "THB – ฿",
    symbol: "฿"
  },
  {
    code: "AED",
    label: "AED",
    symbol: "AED"
  }
];

export const DEFAULT_CURRENCY = "INR";

export const getCurrency = (code) =>
  CURRENCY_OPTIONS.find(
    (currency) =>
      currency.code === code
  ) ||
  CURRENCY_OPTIONS.find(
    (currency) =>
      currency.code === DEFAULT_CURRENCY
  );