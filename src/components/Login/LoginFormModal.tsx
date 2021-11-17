import React, { useState } from "react"
import {
    useTheme,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Slide,
    TextField,
} from "@mui/material"
import type { TransitionProps } from "@mui/material/transitions"
import { SxProps, Theme } from "@mui/system"

import { useAuth } from "@context/AuthContext"


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

const errorMessageStyle: SxProps<Theme> = {
    display: "block",
    textAlign: "center",
    color: "#aa8833",
    paddingBottom: "8px"
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
    const [attemptError, setAttemptError] = useState<string>("")

    const { login } = useAuth()
    const tryLogin = async () => {
        login(formData.username, formData.password)
            .then(props.onClose)
            .catch(e => setAttemptError(e))
    }

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

    const ENTER_KEY = 13
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            onKeyDown={(e) => (e.keyCode === ENTER_KEY) ? tryLogin() : null }
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

            <DialogContentText sx={errorMessageStyle}>
                {attemptError}
            </DialogContentText>

            <DialogActions>
                <Button variant="contained" color="error"
                        onClick={props.onClose}>
                    Abbrechen
                </Button>
                <Button variant="contained" disabled={!formValid}
                        color="success" onClick={tryLogin}>
                    Login
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default LoginFormModal
