import { TableDescriptor } from "@backend/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { InputMask } from "@shared/input-masks/types"
import { fetcher } from "api"
import { useUser } from "auth"
import useSWR from "swr"
import { Row } from "types"
import { Bookmark } from "components/DataGrid/RowMask/Bookmark"
import { VersionTag } from "types/VersionTag"
import { useEffect } from "react"

export type UserSettings = {
    // --- user account ---
    title: string
    sex: "male" | "female" | "diverse" | ""
    firstName: string
    lastName: string
    // --- user preferences ---
    /** informal greeting on landing page */
    disableFunnyGreetings: boolean
    preferredTheme: "system" | "dark" | "light"
    // --- undo cache ---
    enableUndoCache: boolean
    undoCacheLimit: number
    // --- constraint validation ---
    constraintValidation: "always" | "opening-closening" | "never"
    /** if constraints fail, the record will be shown at the dashboard until all constraints pass */
    saveMismatchingRecords: boolean // TODO: rename 'rememberFailedConstraints'
    /** if constraints are turned off an alert will be shown, this 'acknowledges' (turns off) the alert */
    acknowledgedConstraintDangers: boolean
    // --- features ---
    bookmarkedRecords: Bookmark[]
    // TODO: check if there's a new version
    // then just reset to null
    acknowledgedReleaseNotes: VersionTag | null
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
    constraintValidation: "never",
    saveMismatchingRecords: true,
    acknowledgedConstraintDangers: false,
    acknowledgedReleaseNotes: null,
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

    const resetDependentSettings = (
        update: Partial<{ [key in keyof UserSettings]: UserSettings[key] }>
    ): Partial<{ [key in keyof UserSettings]: UserSettings[key] }> => {
        const dependencies: Partial<{ [key in keyof UserSettings]: UserSettings[key] }> = {}

        // when constraint validation is turned off but gets turned on again,
        // the acknowledged alert will be reset
        if (
            "constraintValidation" in update &&
            userSettings?.constraintValidation === "never" &&
            update.constraintValidation !== "never"
        ) {
            if (userSettings?.acknowledgedConstraintDangers) {
                dependencies["acknowledgedConstraintDangers"] = false
            }
        }

        return dependencies
    }

    const changeUserSetting = async (
        update: Partial<{ [key in keyof UserSettings]: UserSettings[key] }>
    ) => {
        if (userSettings == null) return

        const newSettingsObject: UserSettings = {
            ...userSettings,
            ...update,
            ...resetDependentSettings(update),
        }

        console.log(newSettingsObject)
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
