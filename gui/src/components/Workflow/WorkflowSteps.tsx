import { v4 as uuidv4 } from "uuid"
import stepCategories from "./stepCategories.json"
import {
    Step,
    Workflow,
    ProcessState,
    StepType,
    DataFieldProperties,
    AutomaticStepTemplate,
    TimeUnit,
} from "@intutable/process-manager/dist/types"
import AddIcon from "@mui/icons-material/Add"
import BuildIcon from "@mui/icons-material/Build"
import CancelIcon from "@mui/icons-material/Cancel"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CreateIcon from "@mui/icons-material/Create"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import StarIcon from "@mui/icons-material/Star"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import {
    Typography,
    Divider,
    FormControl,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Stack,
    Switch,
} from "@mui/material"
import { useWorkflow } from "hooks/useWorkflow"
import { Fragment, useEffect, useRef, useState } from "react"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

const WorkflowSteps = (props: {
    workflow: Workflow
    setWorkflow: (workflow: Workflow) => void
    setBackdrop: (value: boolean) => void
}) => {
    // --- Hooks ---
    const { getAutomaticStepTemplates, getWorkflowTemplates } = useWorkflow()

    // --- States ---
    const [showAddStepsDialog, setShowAddStepsDialog] = useState(false)
    const [availableSteps, setAvailableSteps] = useState<
        { assignment: { id: string; name: string }; steps: Step[] }[]
    >([])
    const [availableStepsFlat, setAvailableStepsFlat] = useState<Step[]>([])
    const [automaticStepTemplates, setAutomaticStepTemplates] = useState<AutomaticStepTemplate[]>(
        []
    )
    const [activeAutomaticStepTemplate, setActiveAutomaticStepTemplate] =
        useState<AutomaticStepTemplate>()
    const [checkedSteps, setCheckedSteps] = useState<Step[]>([])
    const [showCreateStepDialog, setShowCreateStepDialog] = useState(false)
    // const [steps, setSteps] = useState<Step[]>([])
    const [stepTemplate, setStepTemplate] = useState<Step>({
        _id: "",
        name: "",
        description: "",
        type: StepType.Manual,
        trigger: "",
        state: ProcessState.NotStarted,
    })
    const dataFetchedRef = useRef(false)

    // --- Functions ---
    const fetchData = async () => {
        props.setBackdrop(true)
        setAutomaticStepTemplates((await getAutomaticStepTemplates()) || [])
        const workflowTemplates = (await getWorkflowTemplates()) || []
        setAvailableStepsFlat(
            workflowTemplates.map(workflowTemplate => workflowTemplate.steps).flat()
        )
        setAvailableSteps(
            workflowTemplates.map(workflowTemplate => {
                return {
                    assignment: {
                        id: workflowTemplate._id,
                        name: workflowTemplate.name,
                    },
                    steps: workflowTemplate.steps,
                }
            })
        )
        props.setBackdrop(false)
    }
    useEffect(() => {
        if (dataFetchedRef.current) {
            return
        }
        dataFetchedRef.current = true
        fetchData()
    })

    const addToMajorSteps = (stepId: string) => {
        const existingMajorSteps = props.workflow.majorsteps
        existingMajorSteps.push(stepId)
        props.setWorkflow({
            ...props.workflow,
            majorsteps: existingMajorSteps,
        })
    }
    const removeMajorStep = (stepId: string) => {
        const existingMajorSteps = props.workflow.majorsteps
        const remainingMajorSteps = existingMajorSteps.filter(stepId_ => stepId_ !== stepId)
        props.setWorkflow({
            ...props.workflow,
            majorsteps: remainingMajorSteps,
        })
    }
    const removeStep = (stepId: string) => {
        const steps = props.workflow.steps
        const remainingSteps = steps.filter(step => step._id !== stepId)

        const connections = props.workflow.connections
        delete connections[stepId]

        Object.keys(connections).forEach(sourceStepId => {
            connections[sourceStepId] = connections[sourceStepId].filter(
                destinationStepId => destinationStepId !== stepId
            )
            if (!connections[sourceStepId].length) {
                delete connections[sourceStepId]
            }
        })

        const remainingMajorSteps = props.workflow.majorsteps.filter(stepId_ => stepId_ !== stepId)
        const startstep = props.workflow.startstep === stepId ? "" : props.workflow.startstep
        props.setWorkflow({
            ...props.workflow,
            steps: remainingSteps,
            startstep: startstep,
            connections: connections,
            majorsteps: remainingMajorSteps,
        })
    }
    const handleStartStepChange = (evt: { target: { value: string } }) => {
        props.setWorkflow({
            ...props.workflow,
            startstep: evt.target.value,
        })
    }
    const handleStepToggle = (step: Step) => {
        const currentIndex = checkedSteps.indexOf(step)
        const newChecked = [...checkedSteps]

        if (currentIndex === -1) {
            newChecked.push(step)
        } else {
            newChecked.splice(currentIndex, 1)
        }

        setCheckedSteps(newChecked)
    }
    const handleAddSteps = () => {
        const updatedCheckedSteps = checkedSteps.map(checkedStep => {
            const updatedCheckedStep = { ...checkedStep }
            updatedCheckedStep._id = uuidv4()
            return updatedCheckedStep
        })
        const steps = props.workflow.steps.concat(updatedCheckedSteps)
        props.setWorkflow({
            ...props.workflow,
            steps: steps,
        })
        setShowAddStepsDialog(false)
        setCheckedSteps([])
    }
    const handleCancelSteps = () => {
        setShowAddStepsDialog(false)
        setCheckedSteps([])
    }
    const handleChange = (evt: { target: { name: string; value: unknown } }) => {
        const name = evt.target.name
        let value = evt.target.value

        if (name === "responsible" && typeof value === "string") {
            if (value === "") {
                value = null
            } else {
                value = parseInt(value)
            }
        }

        setStepTemplate({
            ...stepTemplate,
            [name]: value,
        })

        if (name === "trigger") {
            const selectedAutomaticStepTemplate: AutomaticStepTemplate | undefined =
                automaticStepTemplates.filter(stepTemplate => stepTemplate.trigger === value)[0]
            setActiveAutomaticStepTemplate(selectedAutomaticStepTemplate || {})
        }
    }
    const handleDelayChange = (evt: { target: { name: string; value: number | string } }) => {
        const newDelay = stepTemplate.delay
        if (evt.target.name === "value") {
            newDelay!["value"] = evt.target.value as number
        } else {
            newDelay!["unit"] = evt.target.value as TimeUnit
        }
        setStepTemplate({
            ...stepTemplate,
            delay: newDelay,
        })
    }

    const handleDataChange = (
        evt: { target: { type: string; name: string; value: string } } | null
    ) => {
        if (evt) {
            const newData: Record<string, string | number> = stepTemplate.data || {}
            if (evt.target.type === "datetime-local") {
                if (evt.target.value) {
                    newData[evt.target.name] = new Date(evt.target.value).getTime()
                } else {
                    newData[evt.target.name] = 0
                }
            } else {
                newData[evt.target.name] = evt.target.value
            }
            setStepTemplate({
                ...stepTemplate,
                data: newData,
            })
        }
    }
    const handleCreateStep = () => {
        const steps = props.workflow.steps
        let startstep = props.workflow.startstep
        if (stepTemplate._id) {
            const index = steps.findIndex(step => step._id === stepTemplate._id)
            steps[index] = stepTemplate
            if (startstep === stepTemplate._id && stepTemplate.type === StepType.Automatic) {
                startstep = ""
            }
        } else {
            const newStep = {
                ...stepTemplate,
                _id: uuidv4(),
            }
            steps.push(newStep)
        }
        props.setWorkflow({
            ...props.workflow,
            steps: steps,
            startstep: startstep,
        })
        setShowCreateStepDialog(false)
        resetStepTemplate()
    }
    const resetStepTemplate = (changeType = false) => {
        if (changeType) {
            setStepTemplate({
                _id: stepTemplate._id,
                name: stepTemplate.name,
                description: stepTemplate.description,
                type:
                    stepTemplate.type === StepType.Automatic ? StepType.Manual : StepType.Automatic,
                trigger: "",
                state: ProcessState.NotStarted,
                responsible: undefined,
                delay:
                    stepTemplate.type === StepType.Manual
                        ? { value: 0, unit: "Minuten" as TimeUnit }
                        : undefined,
                data: {},
            })
        } else {
            setStepTemplate({
                _id: changeType ? stepTemplate._id : "",
                name: "",
                description: "",
                type: StepType.Manual,
                trigger: "",
                state: ProcessState.NotStarted,
                responsible: undefined,
                delay:
                    stepTemplate.type === StepType.Automatic
                        ? { value: 0, unit: "Minuten" as TimeUnit }
                        : undefined,
                data: {},
            })
        }
        setActiveAutomaticStepTemplate(undefined)
    }
    const handleCreateCancelSteps = () => {
        setShowCreateStepDialog(false)
        resetStepTemplate()
    }
    const editStep = (step: Step) => {
        setStepTemplate(JSON.parse(JSON.stringify(step)))
        setShowCreateStepDialog(true)
        const automaticStepTemplate: AutomaticStepTemplate | undefined =
            automaticStepTemplates.find(stepTemplate => stepTemplate.trigger === step.trigger)
        if (automaticStepTemplate) {
            setActiveAutomaticStepTemplate(automaticStepTemplate)
        }
    }
    const copyStep = (stepToBeCopied: Step) => {
        let newName = `${stepToBeCopied.name} (Kopie)`
        const steps = props.workflow.steps
        let iterator = 1
        while (steps.find(step => step.name === newName)) {
            newName = `${stepToBeCopied.name} (Kopie-${iterator})`
            iterator++
        }

        const newStep: Step = JSON.parse(JSON.stringify(stepToBeCopied))
        newStep._id = uuidv4()
        newStep.name = newName

        steps.push(newStep)

        props.setWorkflow({
            ...props.workflow,
            steps: steps,
        })
    }
    const renderDialogContent = () => {
        switch (stepTemplate.type) {
            case StepType.Manual:
                return (
                    <>
                        <TextField
                            sx={{ mt: 2 }}
                            label="Auslöser"
                            variant="outlined"
                            name="trigger"
                            value={stepTemplate.trigger || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            sx={{ mt: 2 }}
                            label="Verantwortliche Person"
                            variant="outlined"
                            name="responsible"
                            type="number"
                            value={stepTemplate.responsible}
                            onChange={handleChange}
                            InputProps={{
                                inputProps: { min: 0 },
                            }}
                            required
                        />
                    </>
                )
            case StepType.Automatic:
                return (
                    <>
                        <Box
                            sx={{ mt: 2 }}
                            style={{ display: "flex", justifyContent: "space-evenly" }}
                        >
                            <TextField
                                key="data-delay"
                                sx={{ width: "75%", pr: "1em" }}
                                label="Verzögerung"
                                variant="outlined"
                                name="value"
                                InputProps={{
                                    inputProps: { min: 0 },
                                }}
                                value={stepTemplate.delay!.value}
                                onChange={handleDelayChange}
                                type="number"
                            />
                            <TextField
                                select
                                sx={{ width: "25%" }}
                                label="Zeiteinheit"
                                value={stepTemplate.delay?.unit}
                                name="unit"
                                onChange={handleDelayChange}
                            >
                                {/* Can this be done via enum? */}
                                {timeUnits.map(timeUnit => (
                                    <MenuItem key={`item-${timeUnit}`} value={timeUnit}>
                                        {timeUnit}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            sx={{ mt: 2 }}
                            label="Auslöser"
                            variant="outlined"
                            name="trigger"
                            select
                            value={stepTemplate.trigger || ""}
                            onChange={handleChange}
                            required
                        >
                            {automaticStepTemplates.map((stepTemplate, index) => {
                                return (
                                    <MenuItem
                                        key={`trigger-select-item-${stepTemplate.trigger}-${index}`}
                                        value={stepTemplate.trigger}
                                    >
                                        {stepTemplate.trigger}
                                    </MenuItem>
                                )
                            })}
                        </TextField>

                        {activeAutomaticStepTemplate && activeAutomaticStepTemplate.helptext ? (
                            <Box
                                sx={{
                                    border: 1,
                                    borderColor: "info.main",
                                    borderRadius: 1,
                                    color: "info.main",
                                    mt: 2,
                                    p: 1,
                                    fontSize: 14,
                                }}
                            >
                                <InfoOutlinedIcon
                                    sx={{
                                        float: "right",
                                    }}
                                />
                                {activeAutomaticStepTemplate.helptext
                                    .split("\n")
                                    .map((line: string, index: number) => {
                                        return (
                                            <span key={`info-line-${index}`}>
                                                {line}
                                                <br />
                                            </span>
                                        )
                                    })}
                            </Box>
                        ) : (
                            ""
                        )}

                        {activeAutomaticStepTemplate &&
                            Object.keys(activeAutomaticStepTemplate.data).map(
                                (dataFieldName, index) => {
                                    const dataField: DataFieldProperties =
                                        activeAutomaticStepTemplate.data[dataFieldName]
                                    let value =
                                        (stepTemplate.data && stepTemplate.data[dataFieldName]) ||
                                        ""
                                    let rows = 1

                                    // Workaround as MUI Textfield seems bugged with multiline:
                                    // Needs explicit 'rows'-property
                                    if (typeof value === "string" && dataField.multiline) {
                                        rows = (value.match(/\n/g) || []).length + 1
                                    }
                                    const textFieldProps: {
                                        required?: boolean
                                        multiline?: boolean
                                        rows: number
                                        type?: string
                                    } = {
                                        required: dataField.required,
                                        multiline: dataField.multiline,
                                        rows: rows,
                                        type: dataField.type,
                                    }

                                    if (dataField.type === "datetime-local" && value) {
                                        value = new Date(value).toISOString()
                                        value = value.substring(0, value.length - 8)
                                    }

                                    return dataField.helpText ? (
                                        <TextField
                                            key={`data-${dataFieldName}-${index}`}
                                            sx={{ mt: 2 }}
                                            label={dataField.name}
                                            helperText={<>{dataField.helpText}</>}
                                            variant="outlined"
                                            name={dataFieldName}
                                            value={value}
                                            onChange={handleDataChange}
                                            {...textFieldProps}
                                        />
                                    ) : (
                                        <TextField
                                            key={`data-${dataFieldName}-${index}`}
                                            sx={{ mt: 2 }}
                                            label={dataField.name}
                                            variant="outlined"
                                            name={dataFieldName}
                                            value={value}
                                            onChange={handleDataChange}
                                            {...textFieldProps}
                                        />
                                    )
                                }
                            )}
                    </>
                )
        }
    }
    const handleSwitchChange = () => {
        resetStepTemplate(true)
    }

    const timeUnits = ["Minuten", "Stunden", "Tage", "Wochen", "Monate", "Jahre"]

    const checkCreateStepCompletion = () => {
        const generalAttributesComplete =
            stepTemplate.name && stepTemplate.description && stepTemplate.trigger
        let specificAttributesComplete

        if (stepTemplate.type === StepType.Manual) {
            specificAttributesComplete = true
        } else {
            specificAttributesComplete =
                activeAutomaticStepTemplate &&
                Object.keys(activeAutomaticStepTemplate.data)
                    .filter(key => activeAutomaticStepTemplate.data[key].required)
                    .every(key => stepTemplate.data?.[key])
        }

        return generalAttributesComplete && specificAttributesComplete
    }

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant={"h6"}>Schritte</Typography>
                <Divider />
                {props.workflow.steps.length > 0 ? (
                    <List>
                        {props.workflow.steps.map(step => (
                            <ListItem
                                key={step._id}
                                divider
                                secondaryAction={
                                    <>
                                        <Tooltip title="Bearbeiten">
                                            <IconButton onClick={() => editStep(step)}>
                                                <CreateIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Kopieren">
                                            <IconButton onClick={() => copyStep(step)}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {!props.workflow.majorsteps.includes(step._id) ? (
                                            <Tooltip title="Zu Hauptschritten hinzufügen">
                                                <IconButton
                                                    onClick={() => addToMajorSteps(step._id)}
                                                >
                                                    <StarBorderIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Von Hauptschritten entfernen">
                                                <IconButton
                                                    onClick={() => removeMajorStep(step._id)}
                                                >
                                                    <StarIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Entfernen">
                                            <IconButton onClick={() => removeStep(step._id)}>
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={step.name}
                                    secondary={
                                        <Fragment>
                                            <Typography
                                                sx={{ display: "inline" }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {step.type}
                                            </Typography>
                                            {" - " + step.description}
                                        </Fragment>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ m: 2 }} variant="body1">
                        Es wurden noch keine Schritte hinzugefügt.
                    </Typography>
                )}

                <Box sx={{ mt: 2 }} style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Button
                        variant="outlined"
                        onClick={() => setShowAddStepsDialog(true)}
                        startIcon={<AddIcon />}
                    >
                        Schritte hinzufügen
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setShowCreateStepDialog(true)}
                        startIcon={<BuildIcon />}
                    >
                        Schritt erstellen
                    </Button>
                </Box>
            </Box>
            <FormControl fullWidth sx={{ m: 2, pr: 2 }}>
                <InputLabel id="startstepSelectLabel">Startschritt</InputLabel>
                <Select
                    sx={{ mr: 2 }}
                    labelId="startstepSelectLabel"
                    value={props.workflow.startstep}
                    label="Startschritt"
                    disabled={props.workflow.steps.length === 0}
                    onChange={handleStartStepChange}
                >
                    {props.workflow.steps
                        .filter(step => step.type === StepType.Manual)
                        .map(step => (
                            <MenuItem key={step._id} value={step._id}>
                                {step.name} ({step._id})
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
            <Dialog onClose={handleCancelSteps} open={showAddStepsDialog}>
                <DialogTitle>Schritte hinzufügen</DialogTitle>
                <DialogContent>
                    {stepCategories.showWorkflowCategories &&
                        availableSteps
                            .filter(step => step.assignment.id !== props.workflow._id)
                            .map(step => {
                                return (
                                    <Accordion key={step.assignment.id} variant="outlined">
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>{`Workflow: ${step.assignment.name}`}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <List>
                                                {step.steps.map(step => (
                                                    <ListItem key={step._id} disablePadding>
                                                        <ListItemButton
                                                            onClick={() => handleStepToggle(step)}
                                                            dense
                                                        >
                                                            <ListItemIcon>
                                                                <Checkbox
                                                                    checked={checkedSteps.includes(
                                                                        step
                                                                    )}
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
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            })}
                    {stepCategories.customCategories.map(stepCategory => {
                        let steps: Step[] = []
                        availableSteps.forEach(step => {
                            steps = steps.concat(step.steps)
                        })
                        const matchingSteps = steps.filter(step => {
                            const sSearchText = [step.name, step.description, step.trigger]
                                .join(" ")
                                .toUpperCase()
                            return sSearchText.includes(stepCategory.match.toUpperCase())
                        })
                        return (
                            <Accordion key={stepCategory.name} variant="outlined">
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{stepCategory.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {matchingSteps.map(step => (
                                            <ListItem key={step._id} disablePadding>
                                                <ListItemButton
                                                    onClick={() => handleStepToggle(step)}
                                                    dense
                                                >
                                                    <ListItemIcon>
                                                        <Checkbox
                                                            checked={checkedSteps.includes(step)}
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
                                </AccordionDetails>
                            </Accordion>
                        )
                    })}
                    <Accordion variant="outlined">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Alle Schritte</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {availableStepsFlat.map(step => (
                                    <ListItem key={step._id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleStepToggle(step)}
                                            dense
                                        >
                                            <ListItemIcon>
                                                <Checkbox checked={checkedSteps.includes(step)} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={step.name}
                                                secondary={step.description}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleAddSteps}
                        startIcon={<AddIcon />}
                        disabled={!checkedSteps.length}
                    >
                        Hinzufügen
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleCancelSteps}
                        startIcon={<CancelIcon />}
                    >
                        Abbrechen
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog onClose={handleCreateCancelSteps} open={showCreateStepDialog}>
                <DialogTitle>
                    {stepTemplate._id ? "Schritt bearbeiten" : "Schritt erstellen"}
                </DialogTitle>
                <DialogContent sx={{ width: 600 }}>
                    <FormControl fullWidth>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>Manuell</Typography>
                                <Switch
                                    checked={stepTemplate.type === StepType.Automatic}
                                    onChange={handleSwitchChange}
                                    color="default"
                                />
                                <Typography>Automatisch</Typography>
                            </Stack>
                        </div>
                        <TextField
                            sx={{ mt: 2 }}
                            label="Name"
                            variant="outlined"
                            name="name"
                            value={stepTemplate.name}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            sx={{ mt: 2 }}
                            label="Beschreibung"
                            variant="outlined"
                            name="description"
                            value={stepTemplate.description}
                            onChange={handleChange}
                            required
                        />

                        {renderDialogContent()}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleCreateStep}
                        startIcon={stepTemplate._id ? <BuildIcon /> : <CreateIcon />}
                        disabled={!checkCreateStepCompletion()}
                    >
                        {stepTemplate._id ? "Bearbeiten" : "Erstellen"}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleCreateCancelSteps}
                        startIcon={<CancelIcon />}
                    >
                        Abbrechen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default WorkflowSteps
