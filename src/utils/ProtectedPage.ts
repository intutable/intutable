import { withSessionSsr } from "auth"
import { User } from "types/User"

export const ProtectedPage = withSessionSsr<User>(async context => {
    const user = context.req.session.user

    if (user == null || user.isLoggedIn === false)
        return {
            notFound: true,
        }

    return {
        props: user,
    }
})
