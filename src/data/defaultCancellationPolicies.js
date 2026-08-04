

export const defaultCancellationPolicies = [
    {
        id: 1,
        title: "Booking Confirmation",
        text: "A booking is confirmed only after receipt of the prescribed advance/payment and written confirmation from Orbitz Holidays.",
        isCustom: false
    },
    {
        id: 2,
        title: "Cancellation Request",
        text: "All cancellation requests must be made in writing by email or from the registered communication channel. The effective cancellation date is the date of receipt.",
        isCustom: false
    },
    {
        id: 3,
        title: "Standard Cancellation Charges",
        text: `More than 60 days: Booking/processing charges only.
46–60 days: 25% of package cost.
31–45 days: 50%.
16–30 days: 75%.
15 days or less / No-show / After departure: 100%.`,
        isCustom: false
    },
    {
        id: 4,
        title: "Refunds",
        text: "Refunds, where applicable, will be processed after receipt from the respective suppliers. Normal processing time is 15–30 working days after reconciliation.",
        isCustom: false
    },
    {
        id: 5,
        title: "Force Majeure",
        text: "No compensation shall be payable for cancellations or interruptions caused by events beyond reasonable control, including natural disasters, war, civil unrest, government restrictions, epidemics, airline disruption or severe weather. Recoveries depend solely on supplier policies.",
        isCustom: false
    },
    {
        id: 6,
        title: "Refund Method",
        text: "Refunds will be made to the original payer through the original payment mode wherever feasible, after deducting applicable charges.",
        isCustom: false
    }
];