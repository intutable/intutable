import { TableDescriptor } from "@backend/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { InputMask } from "@shared/input-masks/types"
import { fetcher } from "api"
import { useUser } from "auth"
import useSWR from "swr"
import { Row } from "types"
import { Bookmark } from "components/DataGrid/RowMask/Bookmark"

export type UserSettings = {
    title: string
    sex: "male" | "female" | "diverse" | ""
    firstName: string
    lastName: string
    /** @default false */
    disableFunnyGreetings: boolean
    /** @default [] */
    bookmarkedRecords: Bookmark[]
    /** @default 'system' */
    preferredTheme: "system" | "dark" | "light"
    /** @default 20 */
    undoCacheLimit: number
    /** @default true */
    enableUndoCache: boolean
    /** @default 'always' */
    constrainValidation: "always" | "opening-closening"

    /** @default ';' */
    exportJoinCharacter: string
}

export const DefaultUserSettings: UserSettings = {
    title: "",
    sex: "",
    firstName: "Max",
    lastName: "Mustermann",
    disableFunnyGreetings: false,
    bookmarkedRecords: [],
    preferredTheme: "system",
    undoCacheLimit: 20,
    enableUndoCache: true,
    constrainValidation: "always",
    exportJoinCharacter: ";",
}

// TODO: connect to db ✅
// TODO: integrate in `/settings`
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
