import React from "react"
import * as Icons from "@mui/icons-material"

type IconList = {
    [key: string]: React.ReactElement
}

const __PREFIX = "__icon__"
const prefix = (key: string): string => __PREFIX + key

// when saving to db
export const IconToName = (key: any) => {}

export const replaceNameByIcon = (
    name: string
): React.ReactElement | string => {
    return name
}

type IconSelectorProps = {
    onChange: () => void
}

export const IconSelector: React.FC<IconSelectorProps> = props => {
    Object.entries(Icons).map(icon => {})

    return null
}
