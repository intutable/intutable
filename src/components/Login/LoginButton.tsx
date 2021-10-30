import LoginIcon from "@mui/icons-material/Login"
import {
  IconButton,
  useTheme
} from "@mui/material"

import useUser from "@auth/useUser"

import UserAvatarButton from "./UserAvatarButton"


type LoginButtonProps = {
  openLoginFormModalFn: () => void
}

const LoginButton: React.FC<LoginButtonProps> = props => {

    const theme = useTheme()
    const [user] = useUser()

    if (!user) return <IconButton color="inherit" onClick={props.openLoginFormModalFn}>
        <LoginIcon />
    </IconButton>

    return <UserAvatarButton />
}

export default LoginButton
