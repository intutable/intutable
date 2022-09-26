import { useState, useEffect } from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    FormControl,
    Button,
    DialogActions,
    TextField,
} from "@mui/material"
import { User } from "@backend/permissions"
import UserModalFields from "./UserModalFields"

type AddUserModalProps = {
    open: boolean
    onClose: () => void
    onHandleCreateUser: (
        user: Omit<User, "id">,
        password: string
    ) => Promise<void>
}

const AddUserModal: React.FC<AddUserModalProps> = props => {
    const [user, setUser] = useState<Omit<User, "id"> | null>(null)
    const [password, setPassword] = useState<string>("")
    const [valid, setValid] = useState<boolean>(false)

    const isPasswordValid = (password: string) => password.length >= 8

    useEffect(() => {
        if (user !== null && isPasswordValid(password)) setValid(true)
        else setValid(false)
    }, [user, password])

    const handleSaveUser = async () => {
        if (user === null || !isPasswordValid(password)) return
        await props.onHandleCreateUser(user, password)
        props.onClose()
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
            <DialogContent>
                <UserModalFields user={user} onUserChange={setUser} />
                <FormControl fullWidth>
                    <TextField
                        label="Passwort"
                        type="password"
                        value={password}
                        variant="outlined"
                        onChange={e => setPassword(e.target.value)}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button onClick={handleSaveUser} disabled={valid == false}>
                    Speichern
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AddUserModal
