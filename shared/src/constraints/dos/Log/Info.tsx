import React from "react"
import { LoggableComponentFactory } from "./index"

export type InfoProps = {
    message: string
}

export const Info: LoggableComponentFactory<InfoProps> = ({ componentProps, logEntryProps }) => ({
    ...logEntryProps,
    __ctor: InfoBody.name,
    __props: Object.values(componentProps),
})

export const InfoBody: React.FC<InfoProps> = props => {
    return <>{props.message}</>
}
