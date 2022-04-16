import { withSessionSsr } from "auth"
import { NextPage } from "next"
import { User } from "types/User"

export const ProtectedUserPage = withSessionSsr<User>(async context => {
    const user = context.req.session.user

    if (user == null || user.isLoggedIn === false)
        return {
            notFound: true,
        }

    return {
        props: user,
    }
})
