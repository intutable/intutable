import type { NextPage } from "next"

import Title from "@components/Head/Title"
import LoginFormModal from "@components/Login/LoginFormModal"


const Login: NextPage = () => {
    return <>
        <Title title="Einloggen" />
        <LoginFormModal successRedirect="/projects"/>
    </>
}

export default Login
