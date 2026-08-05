

export function displayQuotationNo(quotationNo) {

    if (!quotationNo) return "";

    const number = quotationNo.replace("ORB-", "");

    return `ORB-${number.slice(-6)}`;

}

export function formatSavedDate(savedAt) {

    if (!savedAt) return "-";

    const date = new Date(savedAt);
    const now = new Date();

    const sameDay =
        date.toDateString() === now.toDateString();

    if (sameDay) {

        return `Today ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;

    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (
        date.toDateString() ===
        yesterday.toDateString()
    ) {

        return `Yesterday ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;

    }

    return date.toLocaleDateString();
}