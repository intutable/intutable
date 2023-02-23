import { TableDescriptor } from "@backend/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { InputMask } from "@shared/input-masks/types"
import { fetcher } from "api"
import { useUser } from "auth"
import useSWR from "swr"
import { Row } from "types"
import { Bookmark } from "components/DataGrid/RowMask/Bookmark"

export type UserSettings = {
    // --- user account ---
    title: string
    sex: "male" | "female" | "diverse" | ""
    firstName: string
    lastName: string
    // --- user preferences ---
    disableFunnyGreetings: boolean
    preferredTheme: "system" | "dark" | "light"
    // --- undo cache ---
    enableUndoCache: boolean
    undoCacheLimit: number
    // --- constraint validation ---
    constrainValidation: "always" | "opening-closening" | "never"
    saveMismatchingRecords: boolean
    // --- features ---
    bookmarkedRecords: Bookmark[]
}

// dont delete, will be used for initial values
export const DefaultUserSettings: UserSettings = {
    title: "",
    sex: "",
    firstName: "",
    lastName: "",
    disableFunnyGreetings: true,
    bookmarkedRecords: [],
    preferredTheme: "system",
    undoCacheLimit: 20,
    enableUndoCache: true,
    constrainValidation: "always",
    saveMismatchingRecords: true,
}

// TODO: connect to db ✅
// TODO: integrate in `/settings` ✅
// TODO: actually use each setting

export const useUserSettings = () => {
    const { user } = useUser()

    const {
        data: userSettings,
        mutate: mutateUserSettings,
        error,
        isValidating,
    } = useSWR<UserSettings>(
        user
            ? {
                  url: `/api/user/settings`,
                  method: "GET",
              }
            : null
    )

    // console.log(userSettings)

    const changeUserSetting = async (
        update: Partial<{ [key in keyof UserSettings]: UserSettings[key] }>
    ) => {
        if (userSettings == null) return
        const newSettingsObject: UserSettings = {
            ...userSettings,
            ...update,
        }
        await fetcher({
            url: "/api/user/settings",
            body: {
                update: newSettingsObject,
            },
            method: "PATCH",
        })
        await mutateUserSettings()
    }

    return {
        userSettings: userSettings ?? null,
        changeUserSetting,
        error,
        isValidating,
    }
}
