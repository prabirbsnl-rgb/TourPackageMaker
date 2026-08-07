
const STORAGE_KEY = "orbitzQuotationDrafts";

const WORKING_COPY_KEY =
    "orbitzWorkingCopy";

const TEMPLATE_KEY =
    "orbitzQuotationTemplates";

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

    const drafts = getDrafts();

    drafts.sort((a, b) => {

        return new Date(b.savedAt) - new Date(a.savedAt);

    });

    return drafts;

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

export function getTemplates() {

    const saved =
        localStorage.getItem(TEMPLATE_KEY);

    return saved
        ? JSON.parse(saved)
        : [];

}

export function saveTemplate(template) {

    const templates =
        getTemplates();

    templates.unshift(template);

    localStorage.setItem(
        TEMPLATE_KEY,
        JSON.stringify(templates)
    );

}

export function deleteTemplate(id) {

    const templates =
        getTemplates();

    localStorage.setItem(

        TEMPLATE_KEY,

        JSON.stringify(

            templates.filter(

                t => t.id !== id

            )

        )

    );

}

export function saveWorkingCopy(data) {

    

    localStorage.setItem(
        WORKING_COPY_KEY,
        JSON.stringify(data)
    );

}

export function getWorkingCopy() {

    const saved = localStorage.getItem(
        WORKING_COPY_KEY
    );

    return saved
        ? JSON.parse(saved)
        : null;

}

export function clearWorkingCopy() {

    localStorage.removeItem(
        WORKING_COPY_KEY
    );

}

export function updateDraftStatus(

    quotationNo,

    status

) {

    const drafts = getDrafts();

    const index = drafts.findIndex(

        draft =>

            draft.quotationNo === quotationNo

    );

    if (index < 0) return;

    drafts[index] = {

        ...drafts[index],

        status

    };

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(drafts)

    );

}