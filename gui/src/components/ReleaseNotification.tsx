import { Alert, Box, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import Link from "components/Link"

import { useEffect } from "react"
const byDate = (a: ReleaseProps, b: ReleaseProps) => b.date.getTime() - a.date.getTime()
const getLatestRelease = (releases: ReleaseProps[]) => releases.sort(byDate)[0]

export const ReleaseNotification: React.FC = () => {
    const latestRelease = getLatestRelease(releases)
    const theme = useTheme()

    useEffect(() => {
        // reset `acknowledgedReleaseNotes` in user settings once a new version is available
        const lastAcknowledgedRelease = null
    }, [])

    if (releases.length === 0) return null

    return (
        <Box
            sx={{
                borderRadius: theme.shape.borderRadius,
                p: theme.spacing(3),
                bgcolor: theme.palette.grey[100],
                display: "inline-block",
            }}
        >
            <Alert severity="info" sx={{ mb: theme.spacing(2) }}>
                Eine neue Version ist verfügbar!
            </Alert>

            <Typography>
                Schau dir die Release-Notes{" "}
                <Link href={`/release/${latestRelease.version}`}>hier</Link> an.
            </Typography>

            <Typography>
                {latestRelease.title} wurde am {latestRelease.date.toLocaleDateString()}{" "}
                veröffentlicht
            </Typography>
        </Box>
    )
}
