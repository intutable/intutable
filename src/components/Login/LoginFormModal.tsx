import React, { useState } from "react"
import { useRouter } from "next/router"
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
    width: "100%",
    my: 2,
}

const errorBoxStyle: SxProps<Theme> = {
    display: "block",
    minHeight: "4em",
    position: "relative"
}
const errorMessageStyle: SxProps<Theme> = {
    textAlign: "center",
    fontSize: "0.9em",
    color: "#000022",
    backgroundColor: "#ffdddd",
    border: "1px solid red",
    padding: "0.3em",
    position: "absolute",
    height: "100%",
    width: "100%"
}

const buttonStyle: SxProps<Theme> = {
    width:"100%"
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
    successRedirect: string
}

const LoginFormModal: React.FC<LoginFormModalProps> = props => {
    const theme = useTheme()

    const [formValid, setFormValid] = useState<boolean>(false)
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: ""
    })
    const [attemptError, setAttemptError] = useState<string>("")
    const router = useRouter()

    const { login } = useAuth()
    const tryLogin = async () => {
        login(formData.username, formData.password)
            .then(() => router.push(props.successRedirect || "/"))
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
            open={true}
            onKeyDown={(e) => (e.keyCode === ENTER_KEY) ? tryLogin() : null }
            TransitionComponent={Transition}
            keepMounted
            aria-describedby="login-dialog"
            fullWidth={true}
            maxWidth="xs"
        >
            <DialogTitle sx={{ textTransform: "uppercase" }}>Login</DialogTitle>


            <DialogContent>
                <Box sx={errorBoxStyle}>
                    <DialogContentText sx={{
                        ...errorMessageStyle,
                        ...(attemptError === "" && { visibility: "hidden" })
                    }}>
                        {attemptError}
                    </DialogContentText>
                </Box>
                <TextField
                    autoFocus
                    value={formData.username}
                    onChange={handleUsername}
                    label="E-Mail"
                    placeholder="yourid@uni-heidelberg.de"
                    type="email"
                    required
                    sx={inputFieldStyle}
                    fullWidth={true}
                />
                <TextField
                    value={formData.password}
                    onChange={handlePassword}
                    label="Passwort"
                    placeholder="pw1234"
                    type="password"
                    required
                    sx={inputFieldStyle}
                    fullWidth={true}
                />
            </DialogContent>

            <DialogActions sx={{ flexWrap: "wrap" }}>
                <Button variant="contained" disabled={!formValid}
                        color="success" onClick={tryLogin}
                        sx={buttonStyle}>
                    Login
                </Button>
                <Button variant="text" color="secondary"
                        sx={{ ...buttonStyle, fontSize: "0.8em" }}>
                    Passwort vergessen?
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default LoginFormModal
