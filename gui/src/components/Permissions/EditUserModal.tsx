import { useState, useEffect } from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    DialogActions,
} from "@mui/material"
import { User } from "@backend/permissions"
import UserModalFields from "./UserModalFields"

type EditUserModalProps = {
    open: boolean
    onClose: () => void
    user: User | null
    onHandleSaveUser: (user: User) => Promise<void>
}

const EditUserModal: React.FC<EditUserModalProps> = props => {
    const { open, onClose, user: initialUser, onHandleSaveUser } = props

    const [user, setUser] = useState<User | null>(null)
    const [valid, setValid] = useState<boolean>(false)

    useEffect(() => (user !== null ? setValid(true) : setValid(false)), [user])

    const handleSaveUser = async () => {
        if (user === null) return
        await onHandleSaveUser(user)
        onClose()
    }

    if (!initialUser) return null

    return (
        <Dialog open={open} onClose={() => onClose()}>
            <DialogTitle>Benutzer anpassen</DialogTitle>
            <DialogContent>
                <UserModalFields
                    user={user}
                    onUserChange={u =>
                        setUser(u ? { ...u, id: initialUser.id } : null)
                    }
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Abbrechen</Button>
                <Button onClick={handleSaveUser} disabled={valid == false}>
                    Speichern
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default EditUserModal
