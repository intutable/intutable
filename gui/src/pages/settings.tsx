import { Divider, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"

import { useUser } from "auth"
import { InputMaskSettings } from "components/settings/items/InputMaskSettings"
import { PreferenceSettings } from "components/settings/items/PreferenceSettings"
import { UserAccountSettings } from "components/settings/items/UserAccountSettings"
import { useUserSettings } from "hooks/useUserSettings"
import type { NextPage } from "next"

const Settings: NextPage = () => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()

    if (user == null || userSettings == null) return null

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

export default Settings
