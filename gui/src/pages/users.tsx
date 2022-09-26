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
import { UserList, AddUserModal, EditUserModal } from "components/Permissions"

const Users: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
        <UserPage />
    </SWRConfig>
)

/* type EditUserModalProps = {
 *     open: boolean
 *     onClose: () => void
 *     user: User
 *     onHandleSaveUser: (user: User) => Promise<void>
 * }
 */
const UserPage: React.FC = () => {
    const { users, createUser, deleteUser, changeRole } = useUsers()

    const [addUserAnchorEl, setAddUserAnchorEl] = useState<Element | null>(null)
    const [editUserAnchorEl, setEditUserAnchorEl] = useState<Element | null>(
        null
    )
    const [userBeingEdited, setUserBeingEdited] = useState<User | null>(null)

    if (!users) return null

    const handleOpenAddUserModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAddUserAnchorEl(event.currentTarget)
    }

    const handleOpenEditUserModal = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        user: User
    ) => {
        setEditUserAnchorEl(event.currentTarget)
        setUserBeingEdited(user)
    }

    const handleSaveUser = (user: User) => changeRole(user.id, user.role.id)

    return (
        <>
            <UserList
                users={users}
                onDeleteUser={deleteUser}
                onOpenEditor={handleOpenEditUserModal}
                sx={{
                    maxWidth: 0.8,
                    maxHeight: 0.8,
                }}
            />
            <IconButton onClick={handleOpenAddUserModal}>
                <AddIcon />
            </IconButton>
            <AddUserModal
                open={addUserAnchorEl !== null}
                onClose={() => setAddUserAnchorEl(null)}
                onHandleCreateUser={createUser}
            />
            <EditUserModal
                open={editUserAnchorEl != null}
                onClose={() => setEditUserAnchorEl(null)}
                user={userBeingEdited}
                onHandleSaveUser={handleSaveUser}
            />
        </>
    )
}

type PageProps = { fallback: Record<string, User[]> }

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
