import { Box, IconButton, Stack, Typography } from "@mui/material"
import { ConstraintMismatch, useConstraints } from "hooks/useConstraints"
import { useTheme } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"

const Mismatch: React.FC<{ mismatch: ConstraintMismatch }> = ({ mismatch }) => {
    const theme = useTheme()
    return (
        <Box
            sx={{
                borderRadius: theme.shape.borderRadius,
                bgcolor: theme.palette.error.main,
                py: 0.8,
                px: 1.5,
                mb: 0.5,
                overflowWrap: "break-word",
                width: 1,
            }}
        >
            <Typography>{mismatch.title}</Typography>
            <Typography variant="body2" fontSize="small">
                {mismatch.description}
            </Typography>
            {mismatch.conflict.toString()}
        </Box>
    )
}

export type ConstraintMismatchesProps = {
    onClose: () => void
}

export const ConstraintMismatches: React.FC<ConstraintMismatchesProps> = props => {
    const { isValid, constraintMismatches } = useConstraints()

    if (isValid) return null

    return (
        <Box
            sx={{
                width: 1,
                height: 1,
                boxSizing: "border-box",
                overflowY: "scroll",
            }}
        >
            <IconButton onClick={props.onClose}>
                <CloseIcon />
            </IconButton>
            <Stack direction="column">
                {constraintMismatches.map((mismatch, i) => (
                    <Mismatch key={mismatch.title + i} mismatch={mismatch} />
                ))}
            </Stack>
        </Box>
    )
}
