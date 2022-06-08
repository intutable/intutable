import { Box, Divider, Typography, useTheme } from "@mui/material"
import React from "react"
import { Row } from "types"

export type DetailedRowViewProps = {
    open: boolean
    row?: Row
}
export const DetailedRowView: React.FC<DetailedRowViewProps> = props => {
    const theme = useTheme()

    if (props.open === false) return null

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: "4px",
                overflowX: "hidden",
                overflowY: "scroll",
                p: theme.spacing(1),
                maxHeight: "100%",
            }}
        >
            <Typography
                variant="overline"
                sx={{
                    letterSpacing: 1,
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                    width: "100%",
                    textAlign: "center",
                }}
            >
                Detail-Ansicht{" "}
                {props.row ? `Zeile ${props.row.__rowIndex__}` : ""}
            </Typography>
            <Divider />
            {props.row == null && (
                <Typography variant="caption">
                    Keine Zeile ausgewählt
                </Typography>
            )}
            {props.row && (
                <ul>
                    {Object.entries(props.row).map(([key, value], i) => (
                        <li key={i}>
                            <>
                                {key}: {value}
                            </>
                        </li>
                    ))}
                </ul>
            )}
            {props.row && (
                <>
                    <Divider sx={{ mt: 5, mb: 0.5 }} />
                    <Typography
                        sx={{
                            p: 1,
                            fontSize: "70%",
                            color: theme.palette.error.light,
                        }}
                    >
                        Dieses Feature wird zzt. nicht vollständig unterstützt.
                    </Typography>
                </>
            )}
        </Box>
    )
}
