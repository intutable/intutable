import { Divider, Typography } from "@mui/material"
import { useUser, withSessionSsr } from "auth"
import Title from "components/Head/Title"
import Link from "components/Link"
import type { NextPage } from "next"

const Home: NextPage = () => {
    const { user } = useUser()

    return (
        <>
            <Title title="Startseite" />
            <Typography variant={"h4"}>Startseite</Typography>
            <Divider />
            <Typography sx={{ mt: 2 }}>
                {user?.isLoggedIn ? (
                    <>Hallo {user.username}!</>
                ) : (
                    <>
                        Melde dich an: <Link href="/login">anmelden</Link>
                    </>
                )}
            </Typography>
        </>
    )
}

export default Home

export const getServerSideProps = withSessionSsr(async context => {
    const user = context.req.session.user

    console.log(user)

    return {
        props: {},
    }
})
