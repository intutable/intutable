import { Step, Workflow } from "@intutable/process-manager/dist/types"
import AddIcon from "@mui/icons-material/Add"
import AddLinkIcon from "@mui/icons-material/AddLink"
import CancelIcon from "@mui/icons-material/Cancel"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
    Typography,
    Divider,
    FormControl,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    Tooltip,
} from "@mui/material"
import { useState } from "react"

const WorkflowConnections = (props: {
    workflow: Workflow
    setWorkflow: (workflow: Workflow) => void
}) => {
    // --- States ---
    const [showAddConnectionDialog, setShowAddConnectionDialog] = useState(false)
    const [newConnection, setNewConnection] = useState({
        sourceStepId: "",
        destinationStepId: "",
    })
    // --- Functions ---
    const removeConnectionStep = (sourceStepId: string, destinationStepId: string) => {
        const existingConnections = props.workflow.connections
        const sourceStepConnections = existingConnections[sourceStepId]
        const remainingConnections = sourceStepConnections.filter(
            stepId => stepId !== destinationStepId
        )

        if (remainingConnections.length > 0) {
            props.setWorkflow({
                ...props.workflow,
                connections: {
                    ...existingConnections,
                    [sourceStepId]: remainingConnections,
                },
            })
        } else {
            delete existingConnections[sourceStepId]
            props.setWorkflow({
                ...props.workflow,
                connections: {
                    ...existingConnections,
                },
            })
        }
    }
    const handleSourceStepChange = (evt: { target: { value: string } }) => {
        setNewConnection({
            ...newConnection,
            ["sourceStepId"]: evt.target.value,
        })
    }
    const handleDestinationStepChange = (evt: { target: { value: string } }) => {
        setNewConnection({
            ...newConnection,
            ["destinationStepId"]: evt.target.value,
        })
    }
    const handleAddConnection = () => {
        const existingConnections = props.workflow.connections
        const sourceStepConnections = existingConnections[newConnection.sourceStepId] || []
        sourceStepConnections.push(newConnection.destinationStepId)
        props.setWorkflow({
            ...props.workflow,
            connections: {
                ...existingConnections,
                [newConnection.sourceStepId]: sourceStepConnections,
            },
        })
        setShowAddConnectionDialog(false)
        setNewConnection({ sourceStepId: "", destinationStepId: "" })
    }
    const handleCancelConnection = () => {
        setShowAddConnectionDialog(false)
        setNewConnection({ sourceStepId: "", destinationStepId: "" })
    }
    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant={"h6"}>Verbindungen</Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.keys(props.workflow.connections).length > 0 ? (
                    Object.keys(props.workflow.connections).map(sourceStepId => {
                        const sourceStep = props.workflow.steps.find(
                            step => step._id === sourceStepId
                        ) as Step
                        const destinationSteps = props.workflow.connections[sourceStepId].map(
                            destinationStepId =>
                                props.workflow.steps.find(
                                    step => step._id === destinationStepId
                                ) as Step
                        )
                        return (
                            <Accordion key={sourceStepId} variant="outlined">
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{sourceStep.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {destinationSteps.map(destinationStep => (
                                            <ListItem
                                                key={destinationStep._id}
                                                divider
                                                secondaryAction={
                                                    <Tooltip title="Remove connection">
                                                        <IconButton
                                                            onClick={() =>
                                                                removeConnectionStep(
                                                                    sourceStep._id,
                                                                    destinationStep._id
                                                                )
                                                            }
                                                            edge="end"
                                                        >
                                                            <LinkOffIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                            >
                                                <ListItemText
                                                    primary={destinationStep.name}
                                                    secondary={destinationStep.description}
                                                />
                                            </ListItem>
                                        ))}
                                        <ListItem>
                                            {newConnection.sourceStepId === sourceStepId ? (
                                                <Box
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        width: "100%",
                                                    }}
                                                >
                                                    <FormControl sx={{ mt: 2, mr: 2 }} fullWidth>
                                                        <InputLabel id="destinationStepSelectLabel">
                                                            Endschritt
                                                        </InputLabel>
                                                        <Select
                                                            labelId="destinationStepSelectLabel"
                                                            value={newConnection.destinationStepId}
                                                            label="Destination Step"
                                                            onChange={handleDestinationStepChange}
                                                            disabled={!newConnection.sourceStepId}
                                                            autoWidth
                                                        >
                                                            {props.workflow.steps
                                                                .filter(step => {
                                                                    const isSourceStep =
                                                                        step._id ===
                                                                        newConnection.sourceStepId

                                                                    if (isSourceStep) {
                                                                        return false
                                                                    }
                                                                    const doesExist = !!(
                                                                        props.workflow.connections[
                                                                            newConnection
                                                                                .sourceStepId
                                                                        ] &&
                                                                        props.workflow.connections[
                                                                            newConnection
                                                                                .sourceStepId
                                                                        ].includes(step._id)
                                                                    )
                                                                    return !doesExist
                                                                })
                                                                .map(step => (
                                                                    <MenuItem
                                                                        key={step._id}
                                                                        value={step._id}
                                                                    >
                                                                        {step.name} ({step._id})
                                                                    </MenuItem>
                                                                ))}
                                                        </Select>
                                                    </FormControl>
                                                    <Box
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                        }}
                                                        sx={{ mt: 2 }}
                                                    >
                                                        <Button
                                                            startIcon={<AddIcon />}
                                                            onClick={handleAddConnection}
                                                            disabled={
                                                                !(
                                                                    newConnection.sourceStepId &&
                                                                    newConnection.destinationStepId
                                                                )
                                                            }
                                                        >
                                                            Hinzufügen
                                                        </Button>
                                                        <Button
                                                            startIcon={<CancelIcon />}
                                                            onClick={() => {
                                                                setNewConnection({
                                                                    sourceStepId: "",
                                                                    destinationStepId: "",
                                                                })
                                                            }}
                                                        >
                                                            Abbrechen
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Button
                                                    sx={{ mt: 2 }}
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setNewConnection({
                                                            ...newConnection,
                                                            ["sourceStepId"]: sourceStep._id,
                                                        })
                                                    }}
                                                    startIcon={<AddIcon />}
                                                >
                                                    Verbindung hinzufügen
                                                </Button>
                                            )}
                                        </ListItem>
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        )
                    })
                ) : (
                    <Typography sx={{ m: 2 }} variant="body1">
                        Es wurden noch keine Verbindungen hinzugefügt.
                    </Typography>
                )}
                <Box style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Button
                        sx={{ mt: 2 }}
                        variant="outlined"
                        onClick={() => setShowAddConnectionDialog(true)}
                        startIcon={<AddLinkIcon />}
                        disabled={props.workflow.steps.length < 2}
                    >
                        Verbindung hinzufügen
                    </Button>
                </Box>
            </Box>
            <Dialog onClose={handleCancelConnection} open={showAddConnectionDialog}>
                <DialogTitle>Neue Verbindung</DialogTitle>
                <DialogContent>
                    <Box sx={{ width: 500 }}>
                        <FormControl sx={{ mt: 2 }} fullWidth>
                            <InputLabel id="sourceStepSelectLabel">Startschritt</InputLabel>
                            <Select
                                labelId="sourceStepSelectLabel"
                                value={newConnection.sourceStepId}
                                label="Source Step"
                                onChange={handleSourceStepChange}
                                autoWidth
                            >
                                {props.workflow.steps.map(step => (
                                    <MenuItem key={step._id} value={step._id}>
                                        {step.name} ({step._id})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ mt: 2 }} fullWidth>
                            <InputLabel id="destinationStepSelectLabel">Endschritt</InputLabel>
                            <Select
                                labelId="destinationStepSelectLabel"
                                value={newConnection.destinationStepId}
                                label="Destination Step"
                                onChange={handleDestinationStepChange}
                                disabled={!newConnection.sourceStepId}
                                autoWidth
                            >
                                {props.workflow.steps
                                    .filter(step => {
                                        const isSourceStep = step._id === newConnection.sourceStepId

                                        if (isSourceStep) {
                                            return false
                                        }
                                        const doesExist = !!(
                                            props.workflow.connections[
                                                newConnection.sourceStepId
                                            ] &&
                                            props.workflow.connections[
                                                newConnection.sourceStepId
                                            ].includes(step._id)
                                        )
                                        return !doesExist
                                    })
                                    .map(step => (
                                        <MenuItem key={step._id} value={step._id}>
                                            {step.name} ({step._id})
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleAddConnection}
                        startIcon={<AddIcon />}
                        disabled={!(newConnection.sourceStepId && newConnection.destinationStepId)}
                    >
                        Hinzufügen
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleCancelConnection}
                        startIcon={<CancelIcon />}
                    >
                        Abbrechen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default WorkflowConnections
