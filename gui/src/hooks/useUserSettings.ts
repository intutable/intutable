import { TableDescriptor, ViewDescriptor } from "@backend/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { InputMask } from "@shared/input-masks/types"
import { useState } from "react"
import { Row } from "types"

export type Bookmark = {
    projectId: ProjectDescriptor["id"]
    tableId: TableDescriptor["id"]
    inputMask: InputMask["id"]
    rowId: Row["_id"]
}

export type UserSettings = {
    firstName: string
    lastName: string
    /** @default false */
    disableFunnyGreetings: boolean
    /** @default [] */
    bookmarkedRecords: Bookmark[]
    /** @default 'system' */
    preferredTheme: "system" | "dark" | "light"
    /** @default '/dashboard' */
    loginRedirect: string
    /** @default 20 */
    undoCacheLimit: number
    /** @default true */
    enableUndoCache: boolean
    /** @default 'always' */
    constrainValidation: "always" | "opening-closening"
    /** @default ';' */
    exportJoinCharacter: string
}

const dummy: UserSettings = {
    firstName: "Max",
    lastName: "Mustermann",
    disableFunnyGreetings: false,
    bookmarkedRecords: [],
    preferredTheme: "system",
    loginRedirect: "/dashboard",
    undoCacheLimit: 20,
    enableUndoCache: true,
    constrainValidation: "always",
    exportJoinCharacter: ";",
}

// TODO: connect to db
// TODO: integrate in `/settings`
// TODO: actually use each setting

export const useUserSettings = () => {
    const [userSettings, setUserSettings] = useState<UserSettings | null>(dummy)

    const changeUserSetting = async (
        update: Partial<{ [key in keyof UserSettings]: UserSettings[key] }>
    ) => {
        setUserSettings(prev => ({
            ...prev!,
            ...update,
        }))
    }

    return {
        userSettings,
        changeUserSetting,
    }
}
