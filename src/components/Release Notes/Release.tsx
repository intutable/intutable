import { Box, Button, Chip, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import { VersionTag } from "types/VersionTag"

export type ReleaseProps = {
    version: VersionTag
    prerelease: boolean
    title: string
    date: Date
    teaser: React.ReactNode
    description: React.ReactNode
}

export const Release: React.FC<ReleaseProps> = props => {
    return (
        <>
            {/* <MetaTitle title={"Release Notes " + props.version} /> */}

            <Typography>Release of {props.version}</Typography>
            {props.prerelease && (
                <Chip label={<Typography>Prerelease</Typography>} />
            )}
            <Typography>{props.date.toLocaleDateString()}</Typography>

            <Typography variant="h5">{props.title}</Typography>
            <Box>{props.teaser}</Box>
            <Box>{props.description}</Box>

            <Link href="/service-desk">
                <Button>Report A Bug</Button>
            </Link>
        </>
    )
}
export default Release
