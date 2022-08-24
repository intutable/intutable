import LinkIcon from "@mui/icons-material/Attachment"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { Box, IconButton, Tooltip } from "@mui/material"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"

export class Hyperlink extends Cell {
    readonly brand = "hyperlink"
    label = "Hyperlink"

    isValid(value: unknown): boolean {
        if (typeof value !== "string") return false

        try {
            new URL(value)
            return true
        } catch (e) {
            return false
        }
    }

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
                    // case: valid url
                    <Tooltip title={content!} arrow placement="top">
                        <IconButton
                            size="small"
                            onClick={() => open(content)}
                            color="success"
                        >
                            <LinkIcon
                                sx={{
                                    fontSize: "90%",
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                ) : (
                    // case: invalid url, will be ignored when e.g. generating a url list, but the input gets saved
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
                            title="Dies ist keine gültige URL und wird bei Aktionen für diesen Typen ignoriert."
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
