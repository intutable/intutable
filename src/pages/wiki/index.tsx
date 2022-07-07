import { Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import WikiTree from "components/Wiki/Wiki"
import type { NextPage } from "next"
import { docs } from "public/wikidocs"

const Wiki: NextPage = () => {
    return (
        <>
            <MetaTitle title="Startseite" />
            <Typography variant={"h4"}>Wiki</Typography>

            <WikiTree nodes={docs} />
        </>
    )
}

export default Wiki
