import {
    createUserSettings,
    getUserSettings,
    updateUserSettings,
} from "../../../../../../libs/dekanat-app-plugin/dist/requests"
import { coreRequest } from "api/utils"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { DefaultUserSettings, UserSettings } from "hooks/useUserSettings"
import { isJSONArray } from "utils/isJSON"

export class UserSettings_NoDBDocumentYetCreated extends Error {}

/**
 * Get the user's settings
 */
const GET = withCatchingAPIRoute(async (req, res) => {
    const user = req.session.user
    if (user == null)
        return res.status(401).json(new Error("User Settings [GET]: Not authenticated"))

    let recreationTries = 0

    const get = async (): Promise<UserSettings> => {
        const settings_serialized = await withReadWriteConnection(user, async sessionID =>
            coreRequest<string>(getUserSettings(sessionID, user.id), user.authCookie)
        )
        if (isJSONArray(settings_serialized) || Array.isArray(settings_serialized)) {
            const result: Array<{ user_id: number; settings: UserSettings }> = isJSONArray(
                settings_serialized
            )
                ? JSON.parse(settings_serialized)
                : settings_serialized
            // case: not created yet
            if (result.length === 0) throw new UserSettings_NoDBDocumentYetCreated()
            return result[0].settings
        } else {
            throw new Error("Could not get the user's settings")
        }
    }

    try {
        const settings = await get()
        return res.status(200).json(settings)
    } catch (error) {
        // user's settings row not yet created
        if (error instanceof UserSettings_NoDBDocumentYetCreated) {
            if (recreationTries > 1)
                throw new Error(
                    "Could not get the user's settings. Retried count: " + recreationTries
                )
            recreationTries += 1
            await withReadWriteConnection(user, async sessionID => {
                coreRequest<string>(
                    createUserSettings(sessionID, user.id, JSON.stringify(DefaultUserSettings)),
                    user.authCookie
                )

                const settings = await get()
                return res.status(200).json(settings)
            })
        }

        throw error
    }
})

/**
 * Patch the user's settings
 */
const PATCH = withCatchingAPIRoute(async (req, res) => {
    const { update } = req.body as {
        update: UserSettings
    }
    const user = req.session.user
    if (user == null)
        return res.status(401).json(new Error("User Settings [GET]: Not authenticated"))

    await withReadWriteConnection(user, async sessionID =>
        coreRequest<string>(
            updateUserSettings(sessionID, user.id, JSON.stringify(update)),
            user.authCookie
        )
    )

    res.status(200).json(update)
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        switch (req.method) {
            case "GET":
                await GET(req, res)
                break
            case "PATCH":
                await PATCH(req, res)
                break
            default:
                res.setHeader("Allow", ["GET", "PATCH"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
