

export const quotationStatuses = [

    {
        value: "Draft",
        label: "🟡 Draft",
        color: "#ca8a04"
    },

    {
        value: "Sent",
        label: "🔵 Sent to Client",
        color: "#2563eb"
    },

    {
        value: "Confirmed",
        label: "🟢 Booking Confirmed",
        color: "#15803d"
    },

    {
        value: "Archived",
        label: "⚫ Archived",
        color: "#4b5563"
    }

];

export const filterStatuses = [

    {

        value: "All",

        label: "All",

        color: "#6b7280"

    },

    ...quotationStatuses

];

export const statusTransitions = {

    Draft: [
        "Sent"
    ],

    Sent: [
        "Confirmed",
        "Draft"
    ],

    Confirmed: [
        "Archived"
    ],

    Archived: []

};