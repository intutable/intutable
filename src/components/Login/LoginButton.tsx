import React from "react"
import LoginIcon from "@mui/icons-material/Login"
import { IconButton, useTheme } from "@mui/material"
import UserAvatarButton from "./UserAvatarButton"
import { useAuth } from "../../utils/useAuth"

type LoginButtonProps = {
    openLoginFormModalFn: () => void
}

const LoginButton: React.FC<LoginButtonProps> = props => {
    const theme = useTheme()
    const { user } = useAuth()

    if (!user)
        return (
            <IconButton color="inherit" onClick={props.openLoginFormModalFn}>
                <LoginIcon />
            </IconButton>
        )

    return <UserAvatarButton />
}

export default LoginButton
