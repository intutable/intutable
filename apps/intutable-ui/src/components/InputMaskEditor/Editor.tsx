import {
    Alert,
    Box,
    Button,
    Checkbox,
    Collapse,
    Divider,
    FormControlLabel,
    Grid,
    Paper,
    Stack,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { getInputMask } from "@shared/input-masks"
import { InputMask } from "@shared/input-masks/types"
import { withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"

import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown"
import { Badge, IconButton } from "@mui/material"
import { parseQuery } from "hooks/useAPI"
import { useSnacki } from "hooks/useSnacki"
import { NextPage } from "next"
import React, { useState } from "react"
import { withSSRCatch } from "utils/withSSRCatch"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled"
import StopCircleIcon from "@mui/icons-material/StopCircle"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { EditorSection } from "./EditorSection"
import { EditorToolbar } from "./EditorToolbar"
import { GeneralProperties } from "./sections/GeneralProperties"
import { Beta } from "components/Beta"

export const Editor: React.FC<{ inputMask: InputMask }> = ({ inputMask }) => {
    const theme = useTheme()
    const { snackError, snack } = useSnacki()

    const [valid, setValid] = useState<boolean>(false)

    return (
        <Paper
            elevation={10}
            sx={{
                p: 5,
            }}
        >
            <Stack gap={2}>
                <EditorToolbar inputMask={inputMask} valid={valid} />
                <Divider variant="middle" />

                {valid === false && (
                    <Collapse in>
                        <Alert severity="warning" variant="outlined">
                            Diese Eingabemaske ist noch nicht bereit, um sie zu veröffentlichen!
                        </Alert>
                    </Collapse>
                )}

                <GeneralProperties inputMask={inputMask} />

                <EditorSection label="Erweiterte Eigenschaften">
                    <TextField size="small" value={inputMask.groups.length} label="Gruppierungen" />
                    <TextField
                        size="small"
                        value={inputMask.columnProps.length}
                        label="Zusätzliche Spalten-Eigenschaften"
                    />

                    <TextField
                        size="small"
                        value={inputMask.components.length}
                        label="Zusätzliche Komponenten"
                    />
                </EditorSection>

                <EditorSection label={<>Constraints {<Beta />}</>}>
                    <TextField size="small" value={inputMask.constraints.length} />
                </EditorSection>

                <EditorSection label={<>Suggestions, Restrictions {<Beta />}</>}>
                    <TextField size="small" value={"suggestions"} />
                    <TextField size="small" value={"restrictions"} />
                </EditorSection>

                <EditorSection label="Annotationen">
                    <TextField size="small" value={"comments"} />
                </EditorSection>

                {/* Footer */}
                <Box
                    sx={{
                        width: 1,
                        mt: 5,
                        justifyContent: "center",
                        display: "flex",
                    }}
                >
                    <Stack direction="row" gap={1}>
                        <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.disabled }}
                            fontStyle="italic"
                        >
                            Erstellt: 15.09.2022
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.disabled }}
                            fontStyle="italic"
                        >
                            Zuletzt editiert: 16.09.2022
                        </Typography>
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    )
}
