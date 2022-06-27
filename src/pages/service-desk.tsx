import MetaTitle from "components/MetaTitle"
import Avatar from "@mui/material/Avatar"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"
import { useTheme } from "@mui/material"
import type { NextPage } from "next"

const ServiceDesk: NextPage = () => {
    const theme = useTheme()
    return (
        <>
            <MetaTitle title="Service Desk" />
            <Typography variant={"h4"}>Service Desk</Typography>
            <Divider />

            {/* Bugs & Feature-Requests */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Bugs und Feature-Requests
            </Typography>
            <Divider />
            <ul>
                <li>
                    <Typography>
                        Bugs oder Feature-Requests können mit einer
                        detaillierten Beschreibung an diese{" "}
                        <a href="mailto:contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com">
                            E-Mail
                        </a>{" "}
                        gesendet werden. Die Entwickler erhalten eine Nachricht
                        und kümmern sich darum.
                    </Typography>
                </li>
            </ul>

            {/* Caveats */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Caveats
            </Typography>
            <Divider />
            <ul>
                <li>
                    <Typography
                        sx={{
                            color: theme.palette.text.secondary,
                        }}
                    >
                        Safari wird zzt. als Browser nicht vollständig
                        unterstützt. Wir empfehlen Google Chrome.
                    </Typography>
                </li>
                <li>
                    <Typography
                        sx={{
                            color: theme.palette.text.secondary,
                        }}
                    >
                        Die App ist zzt. nicht für mobile Endgeräte optimiert.
                    </Typography>
                </li>
            </ul>

            {/* Versionsverlauf */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Versionsverlauf
            </Typography>
            <Divider />
            <List
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                }}
            >
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>2</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="MVP" secondary="Jun 9, 2022" />
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>1</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="MVP" secondary="Apr 7, 2022" />
                </ListItem>
            </List>
        </>
    )
}

export default ServiceDesk
