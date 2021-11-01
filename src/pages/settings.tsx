import { useState } from "react"
import type { NextPage } from "next"

import {
    Typography,
    Button
} from "@mui/material"

import Title from "@components/Head/Title"


const Settings: NextPage = () => {
    return ( <>
        <Title title="Einstellungen" />
        <Typography variant="h3" component="h1" color="inherit">
            Nutzereinstellungen
        </Typography>
    </> )
}

export default Settings
