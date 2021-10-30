import { useState } from "react"
import type { NextPage } from "next"

import Title from "@components/Head/Title"
import {
  Typography,
  Button
} from "@mui/material"
import LoginFormModal from "@components/Login/LoginFormModal"

import useUser from "@auth/useUser"


const Settings: NextPage = () => {
  const [user] = useUser()
  const [loginFormModalOpen, setLoginFormModalOpen] = useState<boolean>(false)
  if (!user)
    return ( <>
      <Title title="Login" />
      <Typography>Du musst Dich zuerst einloggen!</Typography>
      <Button onClick={() => setLoginFormModalOpen(true)}>Login</Button>
      <LoginFormModal open={loginFormModalOpen}
                      onClose={() => setLoginFormModalOpen(false)} />
    </> )
  else
    return ( <>
      <Title title="Einstellungen" />
      <Typography variant="h3" component="h1" color="inherit">
        Nutzereinstellungen</Typography>
    </> )
}

export default Settings
