import React from "react"
import {
    Box,
    Typography,
    IconButton,
    Select,
    SelectChangeEvent,
    MenuItem,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { User } from "@backend/permissions"
import { useRoles } from "hooks/useRoles"

export type UserListItemProps = {
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
        <Box
            key={user.id}
            sx={{
                m: 0.5,
                p: 0.5,
                borderRadius: "4px",
                display: "flex",
                alignContent: "center",
            }}
        >
            <Typography>{user.email}</Typography>
            <Select value={user.role.id ?? ""} onChange={handleChangeRole}>
                {roles.map(r => (
                    <MenuItem key={r.id} value={r.id}>
                        {r.name}
                    </MenuItem>
                ))}
            </Select>
            <IconButton onClick={onDelete}>
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}

export default UserListItem
