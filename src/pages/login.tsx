import { useAuth } from "@app/context/AuthContext"
import Title from "@components/Head/Title"
import { Paper } from "@components/LoginOutRegister/Paper"
import { Box, TextField, Typography } from "@mui/material"
import { SxProps, Theme } from "@mui/system"
import type { NextPage } from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"

const validateUsername = (username: string): true | Error =>
    username.length > 7
        ? true
        : new Error("Der Benutzername muss mindestens 8 Zeichen lang sein!")
const validatePassword = (password: string): true | Error =>
    password.length > 7
        ? true
        : new Error("Das Passwort muss mindestens 8 Zeichen lang sein!")

type FormData = {
    username: string
    password: string
}

// TODO: whenever an error is set, that error box moves other components. Set an absolute position for the error boxes by `errorStyle`
const textFieldStyle: SxProps<Theme> = {
    my: 2,
}

const Login: NextPage = () => {
    const router = useRouter()
    const errorMessage =
        typeof router.query.error === "string"
            ? new Error(router.query.error)
            : Array.isArray(router.query.error)
            ? new Error(router.query.error.toString())
            : null
    const { enqueueSnackbar } = useSnackbar()
    const { user, login } = useAuth()

    const [loading, setLoading] = useState<boolean>(false)
    const [usernameValid, setUsernameValid] = useState<Error | true | null>(
        null
    )
    const [passwordValid, setPasswordValid] = useState<Error | true | null>(
        null
    )
    const [form, setForm] = useState<FormData>({
        username: "",
        password: "",
    })
    // TODO: implement error handling correctly
    const [error, setError] = useState<Error | null>(errorMessage)

    const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setForm(prev => ({ username: value, password: prev.password }))
        if (value.length === 0) return setUsernameValid(null)
        const isValid = validateUsername(value)
        setUsernameValid(isValid)
    }
    const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setForm(prev => ({ username: prev.username, password: value }))
        if (value.length === 0) return setPasswordValid(null)
        const isValid = validatePassword(value)
        setPasswordValid(isValid)
    }

    useEffect(() => {
        if (error) enqueueSnackbar(error.message, { variant: "error" })
    }, [error, enqueueSnackbar])

    const handleEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleLogin()
        }
    }

    const handleLogin = async () => {
        try {
            setLoading(true)
            await login(form.username, form.password)
            setLoading(false) // TODO: does not update when `login` throws
        } catch (error) {
            setLoading(false)
            if (error instanceof Error || typeof error === "string") {
                const _error = error instanceof Error ? error : new Error(error)
                setError(_error)
                enqueueSnackbar(_error.message, { variant: "error" })
            } else {
                console.error(error)
                enqueueSnackbar("Ein unbekannter Fehler ist aufgetreten", {
                    variant: "error",
                })
            }
        }
    }

    // TODO: test if redirect works properly when user is already logged in
    if (user) {
        router.back()
        return null
    }

    return (
        <>
            <Title title="Anmelden" />
            <Box
                onKeyPress={handleEnter}
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Paper
                    mode="login"
                    handleAction={handleLogin}
                    loading={loading}
                    disabled={
                        usernameValid instanceof Error ||
                        usernameValid == null ||
                        passwordValid instanceof Error ||
                        passwordValid == null
                    }
                >
                    <TextField
                        autoFocus
                        value={form.username}
                        onChange={handleUsername}
                        label="E-Mail"
                        placeholder="yourid@uni-heidelberg.de"
                        type="email"
                        required
                        error={usernameValid instanceof Error}
                        helperText={
                            usernameValid instanceof Error
                                ? usernameValid.message
                                : undefined
                        }
                        fullWidth
                        sx={textFieldStyle}
                        variant="standard"
                    />
                    <TextField
                        value={form.password}
                        onChange={handlePassword}
                        label="Passwort"
                        placeholder="pw1234"
                        type="password"
                        required
                        error={passwordValid instanceof Error}
                        helperText={
                            passwordValid instanceof Error
                                ? passwordValid.message
                                : undefined
                        }
                        fullWidth
                        sx={textFieldStyle}
                        variant="standard"
                    />
                    {error && (
                        <Typography sx={{ color: "red" }}>
                            {error.message}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </>
    )
}

export default Login
