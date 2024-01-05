import { Step, Workflow } from "@intutable-org/process-manager/dist/types"
import AddIcon from "@mui/icons-material/Add"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import CancelIcon from "@mui/icons-material/Cancel"
import RemoveIcon from "@mui/icons-material/Remove"
import {
    Typography,
    Divider,
    Box,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemButton,
    ListItemIcon,
} from "@mui/material"
import { useState } from "react"

const WorkflowMajorSteps = (props: {
    workflow: Workflow
    setWorkflow: (workflow: Workflow) => void
}) => {
    // --- States ---
    const [showAddMajorStepsDialog, setShowAddMajorStepsDialog] = useState(false)
    const [checkedMajorSteps, setCheckedMajorSteps] = useState<string[]>([])

    // --- Functions ---
    const removeMajorStep = (stepId: string) => {
        const existingMajorSteps = props.workflow.majorsteps
        const remainingSteps = existingMajorSteps.filter(stepId_ => stepId_ !== stepId)
        props.setWorkflow({
            ...props.workflow,
            majorsteps: remainingSteps,
        })
    }
    const moveMajorStep = (stepId: string, direction: string) => {
        const majorSteps = props.workflow.majorsteps
        const oldIndex = majorSteps.indexOf(stepId)
        const newIndex = direction === "up" ? oldIndex - 1 : oldIndex + 1
        majorSteps.splice(newIndex, 0, majorSteps.splice(oldIndex, 1)[0])
        props.setWorkflow({
            ...props.workflow,
            majorsteps: majorSteps,
        })
    }
    const handleMajorStepToggle = (stepId: string) => {
        const currentIndex = checkedMajorSteps.indexOf(stepId)
        const newChecked = [...checkedMajorSteps]

        if (currentIndex === -1) {
            newChecked.push(stepId)
        } else {
            newChecked.splice(currentIndex, 1)
        }

        setCheckedMajorSteps(newChecked)
    }
    const handleAddMajorSteps = () => {
        const existingMajorSteps = props.workflow.majorsteps
        const majorSteps = existingMajorSteps.concat(checkedMajorSteps)
        props.setWorkflow({
            ...props.workflow,
            majorsteps: majorSteps,
        })
        setShowAddMajorStepsDialog(false)
        setCheckedMajorSteps([])
    }
    const handleCancelMajorSteps = () => {
        setShowAddMajorStepsDialog(false)
        setCheckedMajorSteps([])
    }
    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant={"h6"}>Hauptschritte</Typography>
                <Divider />
                {props.workflow.majorsteps.length > 0 ? (
                    <List>
                        {props.workflow.majorsteps
                            .map(
                                stepId =>
                                    props.workflow.steps.find(step => step._id === stepId) as Step
                            )
                            .map(step => (
                                <ListItem
                                    key={step._id}
                                    divider
                                    secondaryAction={
                                        <>
                                            {props.workflow.majorsteps.indexOf(step._id) > 0 ? (
                                                <Tooltip title="Nach oben verschieben">
                                                    <IconButton
                                                        onClick={() =>
                                                            moveMajorStep(step._id, "up")
                                                        }
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        <ArrowUpwardIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <IconButton
                                                    onClick={() => moveMajorStep(step._id, "up")}
                                                    edge="end"
                                                    disabled
                                                    size="small"
                                                >
                                                    <ArrowUpwardIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {props.workflow.majorsteps.indexOf(step._id) !==
                                            props.workflow.majorsteps.length - 1 ? (
                                                <Tooltip title="Nach unten verschieben">
                                                    <IconButton
                                                        onClick={() =>
                                                            moveMajorStep(step._id, "down")
                                                        }
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        <ArrowDownwardIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <IconButton
                                                    onClick={() => moveMajorStep(step._id, "down")}
                                                    edge="end"
                                                    disabled
                                                    size="small"
                                                >
                                                    <ArrowDownwardIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <Tooltip title="Aus Hauptschritten entfernen">
                                                <IconButton
                                                    onClick={() => removeMajorStep(step._id)}
                                                    edge="end"
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    }
                                >
                                    <ListItemText
                                        primary={step.name}
                                        secondary={
                                            <>
                                                <Typography
                                                    sx={{ display: "inline" }}
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                >
                                                    {step.type}
                                                </Typography>
                                                {" - " + step.description}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                    </List>
                ) : (
                    <Typography sx={{ m: 2 }} variant="body1">
                        Es wurden noch keine Hauptschritte hinzugefügt.
                    </Typography>
                )}
                <Box style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Button
                        sx={{ mt: 2 }}
                        variant="outlined"
                        onClick={() => setShowAddMajorStepsDialog(true)}
                        startIcon={<AddIcon />}
                        disabled={!props.workflow.steps.length}
                    >
                        Hauptschritte hinzufügen
                    </Button>
                </Box>
            </Box>
            <Dialog onClose={handleCancelMajorSteps} open={showAddMajorStepsDialog}>
                <DialogTitle>Hauptschritte hinzufügen</DialogTitle>
                <DialogContent>
                    {!props.workflow.steps.filter(
                        step => !props.workflow.majorsteps.includes(step._id)
                    ).length ? (
                        <Typography sx={{ m: 2 }} variant="body1">
                            Es sind keine Schritte verfügbar.
                        </Typography>
                    ) : (
                        <List sx={{ width: 350 }}>
                            {props.workflow.steps
                                .filter(step => !props.workflow.majorsteps.includes(step._id))
                                .map(step => (
                                    <ListItem key={step._id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleMajorStepToggle(step._id)}
                                            dense
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    checked={checkedMajorSteps.includes(step._id)}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={step.name}
                                                secondary={step.description}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleAddMajorSteps}
                        startIcon={<AddIcon />}
                        disabled={!checkedMajorSteps.length}
                    >
                        Hinzufügen
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleCancelMajorSteps}
                        startIcon={<CancelIcon />}
                    >
                        Abbrechen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default WorkflowMajorSteps
