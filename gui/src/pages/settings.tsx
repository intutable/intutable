import { CircularProgress, Divider, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import { useUser, withSessionSsr } from "auth"
import { InputMaskSettings } from "components/settings/items/InputMaskSettings"
import { PreferenceSettings } from "components/settings/items/PreferenceSettings"
import { UserAccountSettings } from "components/settings/items/UserAccountSettings"
import { useUserSettings } from "hooks/useUserSettings"
import type { NextPage } from "next"
import { withSSRCatch } from "utils/withSSRCatch"

const Settings: NextPage = () => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()

    if (!user || !userSettings) return <CircularProgress />

    return (
        <>
            <MetaTitle title="Einstellungen" />
            <Typography variant={"h4"}>Einstellungen</Typography>
            <Divider />

            <UserAccountSettings />

            <PreferenceSettings />

            <InputMaskSettings />
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

export default Settings
