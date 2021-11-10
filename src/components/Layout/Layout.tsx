import { useTheme, Box } from "@mui/material"

import React from "react"

import Header from "./Header"

const Layout: React.FC = props => {
    const theme = useTheme()

    return (
        <Box sx={{ display: "flex" }}>
            <Header />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: theme.spacing(15),
                    pt: theme.spacing(18), // TODO: hacky bugfix to get the content in main below the appbar, those are overlapping
                    height: "100vh",
                    overflow: "auto",
                }}
            >
                {props.children}
            </Box>
        </Box>
    )
}

export default Layout
