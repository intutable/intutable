import { Button, Checkbox, Chip, FormControlLabel, Stack, TextField } from "@mui/material"
import { InputMask } from "@shared/input-masks/types"
import GroupAddIcon from "@mui/icons-material/GroupAdd"
import React from "react"
import { EditorSection } from "../EditorSection"
import AddLinkIcon from "@mui/icons-material/AddLink"
import AnchorIcon from "@mui/icons-material/Anchor"

const Eligible: React.FC<{ eligible: InputMask["eligible"] }> = ({ eligible }) => {
    if (!eligible)
        return (
            <Button variant="contained" startIcon={<GroupAddIcon fontSize="small" />}>
                Freigabe
            </Button>
        )

    return <Chip label={eligible.role} />
}

const Origin: React.FC<{ origin: InputMask["origin"] }> = ({ origin }) => {
    if (!origin)
        return (
            <Button variant="contained" startIcon={<AddLinkIcon fontSize="small" />}>
                Verbinden
            </Button>
        )

    return (
        <>
            Verbunden
            <AnchorIcon fontSize="small" color="success" />
        </>
    )
}

export const GeneralProperties: React.FC<{ inputMask: InputMask }> = ({ inputMask }) => {
    return (
        <EditorSection label="Allgemeines">
            <Stack gap={3}>
                <Stack direction="row" gap={1}>
                    <TextField size="small" value={inputMask.id} label="ID" disabled />
                    <TextField size="small" value={inputMask.name} label="Name" required />
                    <Origin origin={inputMask.origin} />
                    <Eligible eligible={inputMask.eligible} />
                </Stack>
                <TextField
                    size="small"
                    value={inputMask.description}
                    label="Beschreibung"
                    required
                    multiline
                />
                <TextField
                    size="small"
                    value={inputMask.addRecordButtonIcon}
                    label="Call-To-Action-Text"
                />
                <TextField
                    size="small"
                    value={inputMask.addRecordButtonText}
                    label="Call-To-Action-Icon"
                />

                <FormControlLabel
                    control={<Checkbox checked={inputMask.draftsCanBeDeleted} />}
                    label="Entwürfe können gelöscht werden"
                />
            </Stack>
        </EditorSection>
    )
}
