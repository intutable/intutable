import React from "react"
import LoginIcon from "@mui/icons-material/Login"
import LogoutIcon from "@mui/icons-material/Logout"
import { IconButton, useTheme } from "@mui/material"
import UserAvatarButton from "./UserAvatarButton"
import { useAuth } from "@context/AuthContext"

type LoginButtonProps = {
    openLoginFormModalFn: () => void
}

const LoginButton: React.FC<LoginButtonProps> = props => {
    const theme = useTheme()
    const { user, logout } = useAuth()

    if (!user)
        return (
            <IconButton color="inherit" onClick={props.openLoginFormModalFn}>
                <LoginIcon />
            </IconButton>
        )
    else
        return (
            <IconButton color="inherit" onClick={logout}>
                <LogoutIcon />
            </IconButton>
        )
}

export default LoginButton
