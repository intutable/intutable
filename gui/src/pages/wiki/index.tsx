import { Alert, Box, Chip, Divider, Stack, Typography } from "@mui/material"
import { useUser, withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import type { NextPage } from "next"
import { ReleaseNotification } from "components/Release Notes/ReleaseNotification"
import { useUserSettings } from "hooks/useUserSettings"
import { Greeting } from "components/Greeting"
import Image from "next/image"
import { useTheme } from "@mui/material/styles"
import { QuickLinks } from "components/QuickLinks"
import { IncompleteUserSettingsWarning } from "components/IncompleteUserSettingsWarning"
import { withSSRCatch } from "utils/withSSRCatch"

export type MarkdownPage = {
    /** path to the .md file */
    file: string
    title: string
    url: string
}

export const WikiPages: MarkdownPage[] = [
    {
        file: "shared/input-masks/README.md",
        title: "Eingabemasken",
        url: "/wiki/input-masks",
    },
]

export const WikiBadge: React.FC = () => (
    <Chip variant="outlined" label="Wiki" color="primary" size="small" sx={{ cursor: "help" }} />
)

const Wiki: NextPage = () => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()
    const theme = useTheme()

    return (
        <>
            <MetaTitle title="Wiki" />

            <Stack direction="row" alignItems="center" gap={2}>
                <Typography variant={"h4"}>Wiki</Typography>
                <WikiBadge />
            </Stack>

            <Box>
                <ul>
                    {WikiPages.map(page => (
                        <li key={page.url}>{page.title}</li>
                    ))}
                </ul>
            </Box>
        </>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        return {
            props: {},
        }
    })
)

export default Wiki
