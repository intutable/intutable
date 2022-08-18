export const isValidURL = (url: unknown): boolean => {
    if (typeof url !== "string") return false

    try {
        new URL(url)
        return true
    } catch (e) {
        return false
    }
}
