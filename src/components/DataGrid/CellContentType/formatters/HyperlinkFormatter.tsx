import { FormatterComponent } from "@datagrid/CellContentType/types/FormatterComponent"
import { Box, IconButton, Tooltip } from "@mui/material"
import { Row } from "types"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { isValidURL } from "@datagrid/CellContentType/validators/isValidURL"
import LinkIcon from "@mui/icons-material/Attachment"

export const HyperlinkFormatter: FormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined

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
            {isValidURL(content) ? (
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

export default HyperlinkFormatter
