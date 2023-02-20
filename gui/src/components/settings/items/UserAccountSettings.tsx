import PersonIcon from "@mui/icons-material/Person"
import {
    CircularProgress,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    TextField,
} from "@mui/material"
import { UserSettings, useUserSettings } from "hooks/useUserSettings"
import { CollapsableList, CollapsableListDivider } from "../CollapsableList"

export const UserAccountSettings: React.FC = () => {
    const { userSettings, changeUserSetting } = useUserSettings()

    return (
        <CollapsableList label="Benutzerkonto" description="Name, Adresse, Geschlecht">
            {userSettings == null ? (
                <CircularProgress />
            ) : (
                <>
                    <ListItem>
                        <ListItemText>Akad. Titel</ListItemText>

                        <Select
                            value={userSettings.title}
                            variant="filled"
                            size="small"
                            sx={{ minWidth: "5rem" }}
                            onChange={e => {
                                changeUserSetting({
                                    title: e.target.value,
                                })
                            }}
                        >
                            <MenuItem value={""}>
                                <em>Keiner</em>
                            </MenuItem>
                            <MenuItem value={"Dr."}>Dr.</MenuItem>
                            <MenuItem value={"Prof. Dr."}>Prof. Dr.</MenuItem>
                        </Select>
                    </ListItem>

                    <CollapsableListDivider />

                    <ListItem>
                        <ListItemText>Geschlecht</ListItemText>

                        <Select
                            value={userSettings.sex}
                            variant="filled"
                            size="small"
                            sx={{ minWidth: "5rem" }}
                            onChange={e => {
                                changeUserSetting({
                                    sex: e.target.value as UserSettings["sex"],
                                })
                            }}
                        >
                            <MenuItem value={""}>
                                <em>Sonstiges</em>
                            </MenuItem>
                            <MenuItem value={"male"}>Herr</MenuItem>
                            <MenuItem value={"female"}>Frau</MenuItem>
                            <MenuItem value={"diverse"}>Divers</MenuItem>
                        </Select>
                    </ListItem>

                    <CollapsableListDivider />

                    <ListItem>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>

                        <TextField
                            variant="filled"
                            size="small"
                            label="Vorname"
                            value={userSettings.firstName}
                            sx={{ mr: 0.5 }}
                        />
                        <TextField
                            variant="filled"
                            size="small"
                            label="Nachname"
                            value={userSettings.lastName}
                        />
                    </ListItem>
                </>
            )}
        </CollapsableList>
    )
}
