import React from "react"
import {
    SxProps,
    Theme,
    IconButton,
    Select,
    SelectChangeEvent,
    MenuItem,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { User } from "@backend/permissions"
import { useRoles } from "hooks/useRoles"

const USER_TABLE_COLUMNS = [
    { id: "email", label: "E-Mail", minWidth: "20em" },
    { id: "role", label: "Rolle", minWidth: "12em" },
    { id: "delete", label: "", minWidth: null },
]

export type UserListProps = {
    users: User[]
    onDeleteUser: (id: number) => Promise<void>
    onChangeUserRole: (userId: number, roleId: number) => Promise<void>
    sx?: SxProps<Theme>
}

const UserList: React.FC<UserListProps> = props => {
    const { users, onDeleteUser, onChangeUserRole, sx } = props
    return (
        <TableContainer sx={sx}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {USER_TABLE_COLUMNS.map(c => (
                            <TableCell
                                key={c.id}
                                style={
                                    c.minWidth ? { minWidth: c.minWidth } : {}
                                }
                            >
                                {c.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(u => (
                        <UserListItem
                            key={u.id}
                            user={u}
                            onDelete={() => onDeleteUser(u.id)}
                            onChangeRole={roleId =>
                                onChangeUserRole(u.id, roleId)
                            }
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

type UserListItemProps = {
    user: User
    onDelete: () => Promise<void>
    onChangeRole: (roleId: number) => Promise<void>
}

const UserListItem: React.FC<UserListItemProps> = props => {
    const { user, onDelete, onChangeRole } = props
    const { roles } = useRoles()

    if (!user || !roles) return null

    const handleChangeRole = (e: SelectChangeEvent<number>) => {
        if (typeof e.target.value === "string") return
        onChangeRole(e.target.value)
    }
    return (
        <TableRow>
            <TableCell key="email">{user.email}</TableCell>
            <TableCell key="role">
                <Select value={user.role.id ?? ""} onChange={handleChangeRole}>
                    {roles.map(r => (
                        <MenuItem key={r.id} value={r.id}>
                            {r.name}
                        </MenuItem>
                    ))}
                </Select>
            </TableCell>
            <TableCell key="delete">
                <IconButton onClick={onDelete}>
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

export default UserList
