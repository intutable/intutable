import useSWR from "swr"
import type { User } from "types/User"
import type { Events } from "pages/api/auth/events"

export const useEvents = (user?: User) => {
    // We do a request to /api/events only if the user is logged in
    const { data: events } = useSWR<Events>(
        user?.isLoggedIn ? `/api/events` : null
    )

    return { events }
}
