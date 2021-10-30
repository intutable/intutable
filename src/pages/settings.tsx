/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file settings.tsx
 * @description User Settings Page
 * @since 06.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules
import { useState } from "react"

import Title from "@components/Head/Title"
import {
    Typography,
    Button
} from "@mui/material"

import useUser from "@auth/useUser"
import type { NextPage } from "next"
import LoginFormModal from "@components/Login/LoginFormModal"


const Settings: NextPage = () => {

    const [user] = useUser()

    const [loginFormModalOpen, setLoginFormModalOpen] = useState<boolean>(false)

    if (!user) return <>
        <Title title="Login" />
        <Typography>Du musst Dich zuerst einloggen!</Typography>
        <Button onClick={() => setLoginFormModalOpen(true)}>Login</Button>

        <LoginFormModal open={loginFormModalOpen} onClose={() => setLoginFormModalOpen(false)} />
    </>

    return <>
        <Title title="Einstellungen" />
        <Typography variant="h3" component="h1" color="inherit">Nutzereinstellungen</Typography>

    </>

}

export default Settings
