import { Box, Button, Chip, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import { VersionTag } from "types/VersionTag"
import { WikiDoc } from "./types"

/**
 * A Document is a single page in a wiki.
 */
export const Doc: React.FC<WikiDoc> = props => {
    return (
        <>
            <MetaTitle title={props.title} />
            <Typography>{props.title}</Typography>
        </>
    )
}

export default Doc
