import { Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import WikiTree from "components/Wiki/WikiTree"
import type { NextPage } from "next"

const Wiki: NextPage = () => {
    return (
        <>
            <MetaTitle title="Startseite" />
            <Typography variant={"h4"}>Wiki</Typography>

            <WikiTree />
        </>
    )
}

export default Wiki
