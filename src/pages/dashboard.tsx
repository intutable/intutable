import { Divider, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import type { NextPage } from "next"

const Dashboard: NextPage = () => {
    return (
        <>
            <MetaTitle title="Dashboard" />
            <Typography variant={"h4"}>Dashboard</Typography>
            <Divider />
        </>
    )
}

export default Dashboard
