

export function calculateQuotationTotals({
    commonData,
    usdRate
}) {

    /*
     * =========================================================
     * BASE COST
     *
     * Normal costing:
     * Adult cost × adults
     * +
     * Child cost × children
     *
     * Vehicle costing:
     * Uses the existing vehiclePackageCost value.
     *
     * NOTE:
     * Vehicle-specific totals are handled separately by the
     * PDF vehicle-costing logic for each vehicle option.
     * =========================================================
     */

    const totalCost =
        commonData?.useVehicleCosting
            ? Number(
                commonData?.vehiclePackageCost || 0
              )
            : (
                (
                    Number(
                        commonData?.perAdultCost || 0
                    ) *
                    Number(
                        commonData?.adults || 0
                    )
                )
                +
                (
                    Number(
                        commonData?.perChildCost || 0
                    ) *
                    Number(
                        commonData?.children || 0
                    )
                )
            );


    /*
     * =========================================================
     * GST
     * =========================================================
     */

    const gstAmount =
        commonData?.applyGst
            ? (
                totalCost *
                Number(
                    commonData?.gstPercent || 0
                )
              ) / 100
            : 0;


    /*
     * =========================================================
     * COST INCLUDING GST
     * =========================================================
     *
     * This is the internal cost before markup/profit.
     * =========================================================
     */

    const costWithGst =
        totalCost + gstAmount;


    /*
     * =========================================================
     * MARKUP / PROFIT
     * =========================================================
     *
     * Markup is internal information.
     * It is NOT intended for the customer-facing PDF.
     * =========================================================
     */

    const markupAmount =
        (
            totalCost *
            Number(
                commonData?.markupPercent || 0
            )
        ) / 100;


    /*
     * =========================================================
     * SUGGESTED TOTAL AMOUNT PAYABLE
     * =========================================================
     *
     * This is the automatically suggested selling price.
     *
     * Staff can later override this value manually in the
     * editor.
     * =========================================================
     */

    const suggestedTotalAmount =
        costWithGst + markupAmount;


    /*
     * =========================================================
     * USD EQUIVALENT
     * =========================================================
     */

    const grandTotalUsd =
        suggestedTotalAmount /
        Number(
            usdRate || 86
        );


    return {

        // Actual internal package / vehicle cost
        totalCost,

        // GST amount
        gstAmount,

        // Internal cost including GST
        costWithGst,

        // Internal markup / profit
        markupAmount,

        // Automatically suggested selling price
        suggestedTotalAmount,

        // Kept for compatibility with existing code
        packageCost: totalCost,

        subtotal: costWithGst,

        grandTotal:
            suggestedTotalAmount,

        grandTotalUsd

    };

}