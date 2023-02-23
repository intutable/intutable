import { Box, Button, ButtonGroup, Divider, Stack, Paper } from "@mui/material"
import SosIcon from "@mui/icons-material/Sos"
import SettingsIcon from "@mui/icons-material/Settings"
import ExternalLinkIcon from "@mui/icons-material/OpenInNew"
import { useRouter } from "next/router"
import { useUser } from "auth"

export const QuickLinks: React.FC = () => {
    const router = useRouter()
    const { user } = useUser()

    return (
        <Paper
            elevation={5}
            // variant="outlined"
            sx={{
                p: 1.5,
                position: "absolute",
                left: "50%",
                bottom: "50px",
                transform: "translate(-50%, 0)",
            }}
        >
            <ButtonGroup variant="text">
                {user?.isLoggedIn && (
                    <Button
                        startIcon={<SettingsIcon fontSize="small" />}
                        onClick={() => router.push("/settings")}
                    >
                        Einstellungen
                    </Button>
                )}
                <Button
                    startIcon={<ExternalLinkIcon fontSize="small" />}
                    onClick={() => window.open("https://www.mathi.uni-heidelberg.de", "_blank")}
                >
                    Fakultäts-Website
                </Button>
                <Button
                    endIcon={<ExternalLinkIcon fontSize="small" />}
                    onClick={() => window.open("https://www.mathi.uni-heidelberg.de", "_blank")}
                >
                    Leitfaden
                </Button>
                <Button
                    endIcon={<SosIcon fontSize="small" />}
                    color="error"
                    onClick={() => router.push("/service-desk")}
                >
                    Hilfe Erhalten
                </Button>
            </ButtonGroup>
        </Paper>
    )
}
