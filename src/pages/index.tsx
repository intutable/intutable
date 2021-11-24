import type { NextPage } from "next"

import Title from "@components/Head/Title"
import Link from "@components/Link/Link"
import { Typography } from "@mui/material"

const Home: NextPage = () => {
    return (
        <>
            <Title title="Startseite" />
            <Typography>Hello</Typography>
        </>
    )
}

export default Home
