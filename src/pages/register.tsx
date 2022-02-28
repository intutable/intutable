import Title from "components/Head/Title"
import { Paper } from "components/LoginOutRegister/Paper"
import { Box } from "@mui/material"
import type { NextPage } from "next"
import React from "react"

const Register: NextPage = () => {
    const handleRegister = () => {
        alert("not implemented")
    }

    return (
        <>
            <Title title="Registrieren" />
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Paper
                    mode="register"
                    handleAction={handleRegister}
                    disabled
                    loading={false}
                ></Paper>
            </Box>
        </>
    )
}

export default Register
