import { InferGetServerSidePropsType, NextPage } from "next"
import { Typography } from "@mui/material"
import { User } from "@backend/permissions/types"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import { withSSRCatch } from "utils/withSSRCatch"

type PageProps = { users: User[] }

const Users: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ users }) => {
    return (
        <>
            {(users as unknown as User[]).map(u => (
                <Typography key={u.id}>{u.email}</Typography>
            ))}
        </>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr<PageProps>(async context => {
        const user = context.req.session.user

        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }
        const users = await fetcher<User[]>({
            url: `/api/permissions/users`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })
        return { props: { users } }
    })
)
export default Users
