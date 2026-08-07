

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

export function formatRelativeDate(dateString) {

    if (!dateString) return "-";

    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    if (target.getTime() === today.getTime()) {

        return `Today (${formattedDate}), ${formattedTime}`;

    }

    if (target.getTime() === yesterday.getTime()) {

        return `Yesterday (${formattedDate}), ${formattedTime}`;

    }

    return `${formattedDate}, ${formattedTime}`;

}