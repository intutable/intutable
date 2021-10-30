import React, { useState } from "react"

import { SxProps, Theme } from "@mui/system";
import {
  useTheme,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  TextField
} from "@mui/material"
import type { TransitionProps } from "@mui/material/transitions"


type FormData = {
    email: string
    password: string
}

type LoginFormModalProps = {
  open: boolean,
  onClose: () => void
}


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
})

const inputFieldStyle: SxProps<Theme> = {
    display: "block",
    my: 2
}

const validateEMail = (email: string): boolean => email.length > 6
const validatePassword = (password: string): boolean => password.length > 4
const validateFormData = (email: string, password: string): boolean => validateEMail(email) && validatePassword(password)

const LoginFormModal: React.FC<LoginFormModalProps> = props => {
  const theme = useTheme()

  const [formValid, setFormValid] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>(
    { email: "", password: "" })

  const login = () => { }


  const handleEMail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData(prev => ({ email: value, password: prev.password }))
    setFormValid(validateFormData(formData.email, formData.password))
  }
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData(prev => ({ email: prev.email, password: value }))
    setFormValid(validateFormData(formData.email, formData.password))
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="login-dialog">

      <DialogTitle sx={{ textTransform: "uppercase" }}>Login</DialogTitle>

      <DialogContent>
        <TextField value={formData.email} onChange={handleEMail} label="E-Mail"
                   placeholder="yourid@uni-heidelberg.de" type="email"
                   required sx={inputFieldStyle} />
        <TextField value={formData.password} onChange={handlePassword}
                   label="Passwort" placeholder="pw1234" type="password"
                   required sx={inputFieldStyle} />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={props.onClose}>
          Abbrechen</Button>
        <Button variant="contained" disabled={!formValid} color="success">
          Login</Button>
      </DialogActions>

    </Dialog> )
}


export default LoginFormModal
