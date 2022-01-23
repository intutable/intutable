import React from "react"
import { useRouter } from "next/router"
import LoginIcon from "@mui/icons-material/Login"
import { IconButton, useTheme } from "@mui/material"

import { useAuth } from "@context/AuthContext"


const LoginButton: React.FC<object> = () => {
    const theme = useTheme()
    const { user } = useAuth()
    const router = useRouter()

    const sendToLogin = () => router.push("/login")

    return (
        <IconButton color="inherit" onClick={sendToLogin}>
            <LoginIcon />
        </IconButton>
    )
}

export default LoginButton
