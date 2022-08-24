import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { Box, IconButton, Tooltip } from "@mui/material"
import { Row } from "types"
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"
import { isValidMailAddress } from "@datagrid/CellContentType/validators/isValidMailAddress"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"

export const EMailFormatter: FormatterComponent = props => {
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
            {isValidMailAddress(content) ? (
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

export default EMailFormatter
