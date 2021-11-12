import React, { useState } from "react"
import {
    useTheme,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Slide,
    TextField,
} from "@mui/material"
import type { TransitionProps } from "@mui/material/transitions"
import { SxProps, Theme } from "@mui/system"

import { useAuth } from "@utils/useAuth"


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children?: React.ReactElement<any, any>
    },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />
})

const inputFieldStyle: SxProps<Theme> = {
    display: "block",
    my: 2,
}

const validateUsername = (username: string): boolean => username.length > 6
const validatePassword = (password: string): boolean => password.length > 0
const validateFormData = (username: string, password: string): boolean =>
    validateUsername(username) && validatePassword(password)

type FormData = {
    username: string
    password: string
}

type LoginFormModalProps = {
    open: boolean
    onClose: () => void
}

const LoginFormModal: React.FC<LoginFormModalProps> = props => {
    const theme = useTheme()

    const [formValid, setFormValid] = useState<boolean>(false)
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: ""
    })

    const { login } = useAuth()

    const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData(prev => ({ username: value, password: prev.password }))
        setFormValid(validateFormData(formData.username, formData.password))
    }
    const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData(prev => ({ username: prev.username, password: value }))
        setFormValid(validateFormData(formData.username, formData.password))
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            TransitionComponent={Transition}
            keepMounted
            aria-describedby="login-dialog"
        >
            <DialogTitle sx={{ textTransform: "uppercase" }}>Login</DialogTitle>

            <DialogContent>
                <TextField
                    value={formData.username}
                    onChange={handleUsername}
                    label="E-Mail"
                    placeholder="yourid@uni-heidelberg.de"
                    type="email"
                    required
                    sx={inputFieldStyle}
                />
                <TextField
                    value={formData.password}
                    onChange={handlePassword}
                    label="Passwort"
                    placeholder="pw1234"
                    type="password"
                    required
                    sx={inputFieldStyle}
                />
            </DialogContent>

            <DialogActions>
                <Button variant="contained" color="error"
                        onClick={props.onClose}>
                    Abbrechen
                </Button>
                <Button variant="contained" disabled={!formValid}
                        color="success" onClick={login}>
                    Login
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default LoginFormModal
