import { useState } from "react"
import type { NextPage } from "next"
import { Typography, Button, Switch, FormControlLabel, styled, PaletteMode } from "@mui/material"
import Title from "@components/Head/Title"
import ThemeSwitch from "../components/ThemeSwitch/ThemeSwitch"

const Settings: NextPage = props => {
    return (
        <>
            <Title title="Einstellungen" />
            <Typography variant="h3" component="h1" color="inherit">
                Nutzereinstellungen
            </Typography>
            {/* <ThemeSwitch/> */}
        </>
    )
}

export default Settings
