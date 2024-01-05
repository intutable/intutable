import ExternalLinkIcon from "@mui/icons-material/OpenInNew"
import SettingsIcon from "@mui/icons-material/Settings"
import SosIcon from "@mui/icons-material/Sos"
import { Button, ButtonGroup, Paper } from "@mui/material"
import { useUser } from "auth"
import { useRouter } from "next/router"

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
                    onClick={() => router.push("/wiki")}
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
