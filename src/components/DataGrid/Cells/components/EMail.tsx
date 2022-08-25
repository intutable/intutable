import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { Box, IconButton, Tooltip } from "@mui/material"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"
const MailAddressRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export class EMail extends Cell {
    readonly brand = "email"
    label = "E-Mail"

    isValid(value: unknown): boolean {
        if (typeof value !== "string") return false
        return MailAddressRegex.test(value.toLowerCase())
    }

    // export(value: unknown): string {
    //     // const date = value as Date
    // }

    formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct<string | null | undefined>(props)

        if (content == null || content.length < 1) return null // prevents showing the warning icon when content is null or has no length

        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                }}
            >
                {this.isValid(content) ? (
                    // case: valid mail
                    <Tooltip title={content!} arrow placement="top">
                        <IconButton
                            size="small"
                            href={`mailto:${content}`}
                            color="success"
                        >
                            <MarkEmailReadIcon
                                sx={{
                                    fontSize: "90%",
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                ) : (
                    // case: invalid mail, will be ignored when e.g. generating a mail list, but the input gets saved
                    <>
                        <Box
                            sx={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {content}
                        </Box>
                        <Tooltip
                            title="Dies ist keine gültige E-Mail-Adresse und wird bei Aktionen für diesen Typen ignoriert."
                            arrow
                            placement="right"
                        >
                            <IconButton size="small" color="warning">
                                <WarningAmberIcon
                                    sx={{
                                        fontSize: "60%",
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Box>
        )
    }
}
