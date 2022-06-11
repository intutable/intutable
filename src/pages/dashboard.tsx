import { Divider, Typography } from "@mui/material"
import Title from "components/Head/Title"
import type { NextPage } from "next"

const Dashboard: NextPage = () => {
    return (
        <>
            <Title title="Dashboard" />
            <Typography variant={"h4"}>Dashboard</Typography>
            <Divider />
        </>
    )
}

export default Dashboard
