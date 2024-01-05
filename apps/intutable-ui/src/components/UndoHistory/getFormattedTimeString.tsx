export const getFormattedTimeString = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.round((now.getTime() - date.getTime()) / 1000 / 60)

    // "x minutes ago"
    if (diffInMinutes < 60)
        return `Vor ${diffInMinutes} ${diffInMinutes === 1 ? "Minute" : "Minuten"}`

    // "x hours ago"
    if (diffInMinutes >= 60 && diffInMinutes < 60 * 24)
        return `Vor ${Math.floor(diffInMinutes / 60)} ${
            Math.floor(diffInMinutes / 60) === 1 ? "Stunde" : "Stunden"
        }`

    // if yesterday
    if (diffInMinutes >= 60 * 24 && diffInMinutes < 60 * 24 * 2) return "Gestern"

    // "x days ago"
    return `Vor ${Math.floor(diffInMinutes / 60 / 24)} Tagen`
}
