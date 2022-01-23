import React from "react"
import LogoutIcon from "@mui/icons-material/Logout"
import { IconButton } from "@mui/material"

import { useAuth } from "@context/AuthContext"


const LogoutButton: React.FC<object> = () => {
    const { user, logout } = useAuth()

    return (
        <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
        </IconButton>
    )
}

export default LogoutButton
