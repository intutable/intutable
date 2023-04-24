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
import { parseQuery } from "hooks/useAPI"
import { WikiBadge } from "."

const WikiPage: NextPage = () => {
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

        const { wikipage } = parseQuery<{ wikipage: string }>(context.query, ["wikipage"])

        // TODO: load file and export markdown as string

        return {
            props: {},
        }
    })
)

export default WikiPage
