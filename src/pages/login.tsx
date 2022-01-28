import type { NextPage } from "next"
import { useRouter } from "next/router"

import Title from "@components/Head/Title"
import LoginFormModal from "@components/Login/LoginFormModal"


const Login: NextPage = () => {
    const router = useRouter()
    return <>
        <Title title="Einloggen" />
        <LoginFormModal successRedirect="/projects"
                        errorMessage={router.query.error} />
    </>
}

export default Login
