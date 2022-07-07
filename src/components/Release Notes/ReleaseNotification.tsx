import { Box, Button, Chip, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import { VersionTag } from "types/VersionTag"
import { ReleaseProps } from "./Release"

export const ReleaseNotification: React.FC<ReleaseProps> = props => {
    return (
        <Box>
            <Typography>Release of {props.version}</Typography>
            {props.prerelease && (
                <Chip label={<Typography>Prerelease</Typography>} />
            )}
            <Typography>{props.date.toLocaleDateString()}</Typography>

            <Typography variant="h5">{props.title}</Typography>
            <Box>{props.teaser}</Box>
        </Box>
    )
}
