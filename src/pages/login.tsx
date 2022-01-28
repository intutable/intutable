import type { NextPage } from "next"
import { useRouter } from "next/router"

import Title from "@components/Head/Title"
import LoginFormModal from "@components/Login/LoginFormModal"


const Login: NextPage = () => {
    const router = useRouter()
    const errorMessage = (typeof(router.query.error) === "string")
                       ? router.query.error
                       : undefined
    return <>
        <Title title="Einloggen" />
        <LoginFormModal successRedirect="/projects"
                        errorMessage={errorMessage} />
    </>
}

export default Login
