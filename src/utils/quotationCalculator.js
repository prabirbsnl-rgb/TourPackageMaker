

export function calculateQuotationTotals({

    commonData,

    usdRate

}) {

    const packageCost =
        commonData?.useVehicleCosting
            ? Number(commonData?.vehiclePackageCost || 0)
            : (
                (
                    Number(commonData?.perAdultCost || 0) *
                    Number(commonData?.adults || 0)
                )
                +
                (
                    Number(commonData?.perChildCost || 0) *
                    Number(commonData?.children || 0)
                )
            );

    const markupAmount =
        (
            packageCost *
            Number(commonData?.markupPercent || 0)
        ) / 100;

    const subtotal = packageCost;

    const gstAmount =
        commonData?.applyGst
            ? (
                subtotal *
                Number(commonData?.gstPercent || 0)
            ) / 100
            : 0;

    const grandTotal =
        subtotal + gstAmount;

    const grandTotalUsd =
        grandTotal / Number(usdRate || 86);

    return {

        packageCost,

        markupAmount,

        subtotal,

        gstAmount,

        grandTotal,

        grandTotalUsd

    };

}