



export function calculateQuote(data) {

  const packageCost =
    (
      Number(data.perAdultCost || 0) *
      Number(data.adults || 0)
    ) +
    (
      Number(data.perChildCost || 0) *
      Number(data.children || 0)
    );

  const markup =
    packageCost *
    Number(data.markupPercent || 0) / 100;

  const subtotal =
    packageCost + markup;

  const gst =
    subtotal *
    Number(data.gstPercent || 0) / 100;

  const grandTotal =
    subtotal + gst;

  const pax =
    Number(data.adults || 0) +
    Number(data.children || 0);

  return {
    packageCost,
    markup,
    subtotal,
    gst,
    grandTotal,
    perPerson:
      pax > 0
        ? grandTotal / pax
        : grandTotal
  };
}