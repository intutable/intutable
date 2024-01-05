import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    Step as UIStep,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material"
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import CancelIcon from "@mui/icons-material/Cancel"
import DeleteIcon from "@mui/icons-material/Delete"
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle"
import MetaTitle from "components/MetaTitle"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { ReactNode, useEffect, useRef, useState } from "react"
import { useWorkflow } from "hooks/useWorkflow"
import { Step, Workflow, PMResponse, ProcessState } from "@intutable-org/process-manager/dist/types"
import React from "react"
import { withSessionSsr } from "auth"
import { withSSRCatch } from "utils/withSSRCatch"
import WorkflowInfo from "components/Workflow/WorkflowInfo"
import { useSnackbar } from "notistack"
const ManageActiveWorkflows: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = () => <ManageActiveWorkflowsPage />
const ManageActiveWorkflowsPage: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()
    const [workflow, setWorkflow] = useState<Workflow>()
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [workflowProperties, setWorkflowProperties] = useState<{
        history: { stepId: string; name: string; completedat: number }[]
        activeSteps: Step[]
        majorSteps: { name: string; state: ProcessState }[]
    }>()
    const [backdrop, setBackdrop] = useState(false)
    const dataFetchedRef = useRef(false)
    const {
        getActiveWorkflows,
        getWorkflowProgress,
        abortWorkflow,
        blockWorkflow,
        deleteWorkflow,
        unblockWorkflow,
    } = useWorkflow()
    const fetchData = async () => {
        setBackdrop(true)
        const data = await getActiveWorkflows()
        setWorkflows(data)
        setBackdrop(false)
    }
    useEffect(() => {
        if (dataFetchedRef.current) {
            return
        }
        dataFetchedRef.current = true
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handleChange = async (event: SelectChangeEvent) => {
        const currentWorkflow: Workflow | undefined = workflows.find(
            (workflow: Workflow) => workflow._id === event.target.value
        )
        if (currentWorkflow) {
            setBackdrop(true)
            await updateStates(currentWorkflow)
            setBackdrop(false)
        }
    }
    const updateStates = async (currentWorkflow: Workflow) => {
        // enhance history item with the step name for easier access during rendering
        const history = currentWorkflow.history.map(
            (historyItem: { stepId: string; completedat: number }) => {
                const relatedStep = currentWorkflow.steps.find(
                    (step: Step) => step._id === historyItem.stepId
                )
                return {
                    stepId: historyItem.stepId,
                    name: relatedStep ? relatedStep.name : "",
                    completedat: historyItem.completedat,
                }
            }
        )
        const activeSteps = currentWorkflow.steps.filter(
            (step: Step) => step.state === ProcessState.Pending
        )
        const majorSteps = await getWorkflowProgress(currentWorkflow._id)
        setWorkflow(currentWorkflow)
        setWorkflowProperties({
            history,
            activeSteps,
            majorSteps,
        })
    }
    const showErrorSnackbar = () => {
        enqueueSnackbar("There was an error while updating the workflow.", {
            variant: "error",
        })
    }
    const buttons: {
        name: string
        icon: ReactNode
        clickHandler: () => Promise<void>
    }[] = []
    if (workflow) {
        if (workflow.state !== ProcessState.Aborted && workflow.state !== ProcessState.Completed) {
            buttons.push({
                name: "Abbrechen",
                icon: <CancelIcon />,
                clickHandler: async () => {
                    setBackdrop(true)
                    const response: PMResponse = await abortWorkflow(workflow._id)
                    if (response.message) {
                        showErrorSnackbar()
                    } else if (response.workflow) {
                        await updateStates(response.workflow)
                    }
                    setBackdrop(false)
                },
            })
            if (workflow.state !== ProcessState.Blocked) {
                buttons.push({
                    name: "Sperren",
                    icon: <RemoveCircleIcon />,
                    clickHandler: async () => {
                        setBackdrop(true)
                        const response: PMResponse = await blockWorkflow(workflow._id)
                        if (response.message) {
                            showErrorSnackbar()
                        } else if (response.workflow) {
                            await updateStates(response.workflow)
                        }
                        setBackdrop(false)
                    },
                })
            } else {
                buttons.push({
                    name: "Entsperren",
                    icon: <ArrowRightIcon />,
                    clickHandler: async () => {
                        setBackdrop(true)
                        const response: PMResponse = await unblockWorkflow(workflow._id)
                        if (response.message) {
                            showErrorSnackbar()
                        } else if (response.workflow) {
                            await updateStates(response.workflow)
                        }
                        setBackdrop(false)
                    },
                })
            }
        }
        buttons.push({
            name: "Löschen",
            icon: <DeleteIcon />,
            clickHandler: async () => {
                setBackdrop(true)
                const response: PMResponse = await deleteWorkflow(workflow._id)
                if (response.message) {
                    showErrorSnackbar()
                } else if (response.status === 200) {
                    setWorkflow(undefined)
                    await fetchData()
                }
                setBackdrop(false)
            },
        })
    }
    return (
        <Box sx={{ width: 1000, display: "block", marginLeft: "auto", marginRight: "auto" }}>
            <MetaTitle title="Verwaltung aktiver Prozesse" />
            <Backdrop
                open={backdrop}
                sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box sx={{ m: 2, width: 1000 }}>
                <Typography variant={"h4"} align="center" gutterBottom>
                    Aktive Prozesse
                </Typography>
                <Divider />
                {workflows.length ? (
                    <FormControl sx={{ mb: 2, mt: 2 }} fullWidth>
                        <InputLabel id="workflowSelectLabel">Prozess</InputLabel>
                        <Select
                            labelId="workflowSelectLabel"
                            id="workflowSelect"
                            value={workflow?._id || ""}
                            label="Prozess"
                            onChange={handleChange}
                            autoWidth
                        >
                            {workflows.map(workflow => (
                                <MenuItem key={workflow._id} value={workflow._id}>
                                    {workflow.name} ({workflow._id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <Typography sx={{ mt: 3 }} variant="body1" align="center">
                        Keine aktiven Prozesse verfügbar.
                    </Typography>
                )}
                {workflow && (
                    <>
                        <Box
                            style={{ display: "flex", justifyContent: "space-evenly" }}
                            sx={{ mb: 2 }}
                        >
                            {buttons.map(
                                (button: {
                                    name: string
                                    icon: ReactNode
                                    clickHandler: () => Promise<void>
                                }) => {
                                    return (
                                        <Button
                                            key={button.name + "-button"}
                                            variant="contained"
                                            startIcon={button.icon}
                                            onClick={() => {
                                                button.clickHandler()
                                            }}
                                        >
                                            {button.name}
                                        </Button>
                                    )
                                }
                            )}
                        </Box>
                        {/* General */}
                        <WorkflowInfo edit={false} workflow={workflow} setWorkflow={setWorkflow} />
                        {/* Active steps */}
                        <Typography variant="h6">Aktive Schritte</Typography>
                        <Divider />
                        {workflowProperties!.activeSteps.length ? (
                            <List>
                                {workflowProperties!.activeSteps.map(activeStep => (
                                    <ListItem key={activeStep._id} alignItems="flex-start">
                                        <ListItemIcon>
                                            <PendingActionsOutlinedIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={activeStep.name}
                                            secondary={
                                                <>
                                                    <Typography
                                                        sx={{ display: "inline" }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {activeStep.type}
                                                    </Typography>
                                                    {" - " + activeStep.description}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography sx={{ m: 2 }} variant="body1">
                                Zurzeit gibt es keine aktiven Schritte.
                            </Typography>
                        )}
                        {/* History */}
                        <Typography variant="h6">Historie</Typography>
                        <Divider />
                        <Stepper sx={{ m: 2 }} orientation="vertical">
                            {workflowProperties!.history.map((historyItem, index) => (
                                <UIStep
                                    key={`historyStep-${index}-${historyItem.stepId}`}
                                    completed
                                >
                                    <StepLabel>
                                        <Typography>{historyItem.name}</Typography>
                                        <Typography variant="body2" style={{ color: "grey" }}>
                                            {new Date(historyItem.completedat).toLocaleString()}
                                        </Typography>
                                    </StepLabel>
                                </UIStep>
                            ))}
                        </Stepper>
                        {/* Major Steps */}
                        <Typography variant="h6">Hauptschritte</Typography>
                        <Divider />
                        <Stepper sx={{ m: 2 }} alternativeLabel>
                            {workflowProperties!.majorSteps.map(
                                (step: { name: string; state: ProcessState }) => {
                                    const stepProps: { completed: boolean; active: boolean } = {
                                        completed: step.state === ProcessState.Completed,
                                        active: step.state === ProcessState.Pending,
                                    }
                                    const labelProps: { error: boolean } = {
                                        error: step.state === ProcessState.Blocked,
                                    }
                                    return (
                                        <UIStep key={step.name} {...stepProps}>
                                            <StepLabel {...labelProps}>{step.name}</StepLabel>
                                        </UIStep>
                                    )
                                }
                            )}
                        </Stepper>
                    </>
                )}
            </Box>
        </Box>
    )
}
export const getServerSideProps = withSSRCatch(
    withSessionSsr(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false) {
            return {
                notFound: true,
            }
        }
        return {
            props: {},
        }
    })
)
export default ManageActiveWorkflows
