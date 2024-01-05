import { Divider as MuiDivider } from "@mui/material"

export const Divider: React.FC<{ label?: string }> = ({ label }) => (
    <MuiDivider sx={{ mt: 5, mb: 3 }}>{label}</MuiDivider>
)
