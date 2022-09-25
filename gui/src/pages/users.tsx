import { useState } from "react"
import { InferGetServerSidePropsType, NextPage } from "next"
import { SWRConfig } from "swr"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import { withSSRCatch } from "utils/withSSRCatch"
import { IconButton } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { User } from "@backend/permissions/types"
import { useUsers, useUsersConfig } from "hooks/useUsers"
import { UserListItem, AddUserModal } from "components/Permissions"

type PageProps = { fallback: Record<string, User[]> }

const Users: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
        <UserPage />
    </SWRConfig>
)

const UserPage: React.FC = () => {
    const { users, createUser, deleteUser, changeRole } = useUsers()

    const [anchorEl, setAnchorEl] = useState<Element | null>(null)

    if (!users) return null

    const handleOpenAddUserModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEl(event.currentTarget)
    }

    return (
        <>
            {users.map(u => (
                <UserListItem
                    key={u.id}
                    user={u}
                    onDelete={() => deleteUser(u.id)}
                    onChangeRole={roleId => changeRole(u.id, roleId)}
                />
            ))}
            <IconButton onClick={handleOpenAddUserModal}>
                <AddIcon />
            </IconButton>
            <AddUserModal
                open={anchorEl !== null}
                onClose={() => setAnchorEl(null)}
                onHandleCreateUser={createUser}
            />
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
        return {
            props: {
                fallback: { [useUsersConfig.cacheKey]: users },
            },
        }
    })
)
export default Users
