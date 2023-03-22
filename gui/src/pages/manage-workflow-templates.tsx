import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Switch,
    Tooltip,
    Typography,
} from "@mui/material"
import MetaTitle from "components/MetaTitle"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { useEffect, useRef, useState } from "react"
import { useWorkflow } from "hooks/useWorkflow"
import { ProcessState, Workflow } from "@intutable/process-manager/dist/types"
import React from "react"
import { withSessionSsr } from "auth"
import { withSSRCatch } from "utils/withSSRCatch"
import { useRouter } from "next/router"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DeleteIcon from "@mui/icons-material/Delete"
const ManageWorkflowTemplates: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = () => <ManageWorkflowTemplatesPage />
const ManageWorkflowTemplatesPage: React.FC = () => {
    // --- Hooks ---
    const {
        getWorkflowTemplates,
        deleteWorkflow,
        copyWorkflow,
        activateWorkflowTemplate,
        deactivateWorkflowTemplate,
    } = useWorkflow()
    const router = useRouter()

    // --- States ---
    const [workflowTemplates, setWorkflowTemplates] = useState<Workflow[]>([])
    const [backdrop, setBackdrop] = useState(false)
    const dataFetchedRef = useRef(false)

    // --- Functions ---
    const fetchData = async () => {
        setBackdrop(true)
        const data = await getWorkflowTemplates()
        data.sort((a, b) => a.name.localeCompare(b.name))
        setWorkflowTemplates(data)
        setBackdrop(false)
    }
    useEffect(() => {
        if (dataFetchedRef.current) {
            return
        }
        dataFetchedRef.current = true
        fetchData()
    })

    const handleActiveSwitchChange = async (workflowId: string, active: boolean) => {
        setBackdrop(true)
        if (active) {
            await deactivateWorkflowTemplate(workflowId)
        } else {
            await activateWorkflowTemplate(workflowId)
        }
        setBackdrop(false)
        await fetchData()
    }
    const handleEditClick = (workflowId: string) => {
        // Optional catch all routes is not supported with current next.js version: https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes
        router.push(`/edit-workflow-templates?workflowId=${workflowId}`)
    }
    const handleCopyClick = async (workflowId: string) => {
        setBackdrop(true)
        await copyWorkflow(workflowId)
        setBackdrop(false)
        await fetchData()
    }
    const handleDeleteClick = async (workflowId: string) => {
        setBackdrop(true)
        await deleteWorkflow(workflowId)
        setBackdrop(false)
        await fetchData()
    }

    return (
        <>
            <MetaTitle title="Verwaltung der Prozessvorlagen" />
            <Backdrop
                open={backdrop}
                sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box sx={{ width: 800, display: "block", marginLeft: "auto", marginRight: "auto" }}>
                <Typography variant={"h4"} align="center">
                    Verwaltung der Prozessvorlagen
                </Typography>
                <Divider />

                <Box sx={{ m: 2 }}>
                    {!workflowTemplates.length ? (
                        <Typography variant={"body1"} align="center">
                            Keine Prozessvorlagen verfügbar.
                        </Typography>
                    ) : (
                        <List>
                            {workflowTemplates.map(workflow => {
                                const startStep = workflow.steps.find(
                                    step => step._id === workflow.startstep
                                )!
                                const activeWorkflow =
                                    startStep.state === ProcessState.Pending &&
                                    workflow.state === ProcessState.Pending
                                return (
                                    <ListItem
                                        key={workflow._id}
                                        divider
                                        secondaryAction={
                                            <>
                                                <Tooltip
                                                    title={activeWorkflow ? "Aktiv" : "Inaktiv"}
                                                >
                                                    <Switch
                                                        checked={activeWorkflow}
                                                        onChange={() =>
                                                            handleActiveSwitchChange(
                                                                workflow._id,
                                                                activeWorkflow
                                                            )
                                                        }
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Bearbeiten">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleEditClick(workflow._id)
                                                        }
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Kopieren">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleCopyClick(workflow._id)
                                                        }
                                                    >
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Löschen">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleDeleteClick(workflow._id)
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        }
                                    >
                                        <ListItemText
                                            primary={workflow.name}
                                            secondary={workflow.description}
                                        />
                                    </ListItem>
                                )
                            })}
                        </List>
                    )}
                </Box>
                <Box sx={{ mt: 2 }} style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            router.push("/edit-workflow-templates")
                        }}
                        startIcon={<AddIcon />}
                    >
                        Prozessvorlage erstellen
                    </Button>
                </Box>
            </Box>
        </>
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
export default ManageWorkflowTemplates
