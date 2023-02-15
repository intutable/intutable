import { Box, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"

export const Note: React.FC<{ text: string; headline?: string }> = ({ text, headline }) => {
    const theme = useTheme()

    return (
        <Box
            sx={{
                bgcolor: theme.palette.grey[100],
                borderRadius: theme.shape.borderRadius,
                mb: 2,
                px: 3,
                py: 1.5,
                boxSizing: "border-box",
                position: "relative",
            }}
        >
            {headline && (
                <>
                    <Stack
                        direction="row"
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                ml: "24px",
                            }}
                        >
                            {headline}
                        </Typography>
                    </Stack>
                </>
            )}
            <Typography
                sx={{
                    mt: headline ? 2 : 0,
                }}
            >
                {text}
            </Typography>
        </Box>
    )
}
