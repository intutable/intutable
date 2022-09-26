import { useState, useEffect } from "react"
import {
    FormControl,
    TextField,
    Select,
    SelectChangeEvent,
    MenuItem,
} from "@mui/material"
import { isValidEMailAddress } from "utils/isValidEMailAddress"
import { User } from "@backend/permissions"
import { useRoles } from "hooks/useRoles"

type UserModalFieldsProps = {
    user: Omit<User, "id"> | null
    onUserChange: (user: Omit<User, "id"> | null) => void
}

/**
 * The "create new user" and "edit existing user" modals have different titles,
 * submit buttons, etc., but the fields that actually make up the user
 * should be shared, so they are abstracted into this component.
 */
const UserModalFields: React.FC<UserModalFieldsProps> = props => {
    const { user: initialUser, onUserChange } = props

    const { roles } = useRoles()
    const [user, setUser] = useState<Partial<User>>(() =>
        initialUser ? initialUser : { email: "", role: undefined }
    )

    const isUserValid = (user: Partial<User>): user is Omit<User, "id"> =>
        isValidEMailAddress(user.email) && user.role != null

    useEffect(() => {
        if (isUserValid(user)) onUserChange(user)
        else onUserChange(null)
    }, [user, onUserChange])
    if (!roles || roles.length === 0) return null

    // i dont know why this works, its so obviously not type safe.
    const handleChangeUserProp = (key: keyof User, value: unknown) =>
        setUser(prev => ({ ...prev, [key]: value }))

    const handleChangeRole = (e: SelectChangeEvent<string | number>) => {
        if (typeof e.target.value === "string") return
        handleChangeUserProp(
            "role",
            roles.find(r => r.id === e.target.value)
        )
    }

    return (
        <>
            <FormControl fullWidth sx={{ mt: 2 }}>
                <TextField
                    label="E-Mail"
                    value={user.email ?? ""}
                    variant="outlined"
                    onChange={e =>
                        handleChangeUserProp("email", e.target.value)
                    }
                />
            </FormControl>
            <FormControl fullWidth>
                <Select
                    label="Rolle"
                    value={user.role?.id ?? ""}
                    onChange={handleChangeRole}
                >
                    {roles.map(r => (
                        <MenuItem key={r.id} value={r.id}>
                            {r.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    )
}

export default UserModalFields
