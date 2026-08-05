
const STORAGE_KEY = "orbitzQuotationDrafts";

export function getDrafts() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    return saved
        ? JSON.parse(saved)
        : [];

}

export function getLatestDraft() {

    const drafts = getDrafts();

    return drafts.length
        ? drafts[0]
        : null;

}

export function saveDraft(draft) {

    const drafts = getDrafts();

    const index =
        drafts.findIndex(
            item =>
                item.quotationNo === draft.quotationNo
        );

    if (index >= 0) {

        drafts[index] = draft;

    } else {

        drafts.unshift(draft);

    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(drafts)
    );

}



export function getAllDrafts() {

    return getDrafts();

}

export function deleteDraft(quotationNo) {

    const drafts = getDrafts();

    const updated = drafts.filter(
        draft =>
            draft.quotationNo !== quotationNo
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
    );

}