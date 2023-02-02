const DRAFT_SESSION_STORAGE_KEY_PREFIX = "RecordDraft-" as const

export const useRecordDraftSession = () => {
    const getDrafts = (): { _id: number }[] => {
        if (!window) throw new Error("session storage not available")
        const keys = Object.keys(window.sessionStorage)
        const draftKeys = keys.filter(key => key.startsWith(DRAFT_SESSION_STORAGE_KEY_PREFIX))
        return draftKeys.map(key => {
            const item = window.sessionStorage.getItem(key)
            if (!item) throw new Error("session storage item not found")
            return { _id: parseInt(item) }
        })
    }

    const isDraft = (record: { _id: number }) => {
        if (!window) throw new Error("session storage not available")
        return window.sessionStorage.getItem(`${DRAFT_SESSION_STORAGE_KEY_PREFIX}${record._id}`) !== null
    }

    const addDraft = (draft: { _id: number }) => {
        if (!window) throw new Error("session storage not available")
        window.sessionStorage.setItem(`${DRAFT_SESSION_STORAGE_KEY_PREFIX}${draft._id}`, draft._id.toString())
    }

    return {
        getDrafts,
        isDraft,
        addDraft,
    }
}
