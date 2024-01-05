import { Backdrop, Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material"
import WorkflowInfo from "components/Workflow/WorkflowInfo"
import MetaTitle from "components/MetaTitle"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { useEffect, useRef, useState } from "react"
import { useWorkflow } from "hooks/useWorkflow"
import { Workflow, ProcessState, PMResponse } from "@intutable-org/process-manager/dist/types"
import React from "react"
import { withSessionSsr } from "auth"
import { withSSRCatch } from "utils/withSSRCatch"
import { useRouter } from "next/router"
import WorkflowSteps from "components/Workflow/WorkflowSteps"
import WorkflowMajorSteps from "components/Workflow/WorkflowMajorSteps"
import WorkflowConnections from "components/Workflow/WorkflowConnections"
import { useSnackbar } from "notistack"
const EditWorkflowTemplates: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = () => <EditWorkflowTemplatesPage />
const EditWorkflowTemplatesPage: React.FC = () => {
    // --- Hooks ---
    const { createUpdateWorkflow, getWorkflow } = useWorkflow()
    const router = useRouter()
    const { enqueueSnackbar } = useSnackbar()
    const [showWorkflowNotFound, setShowWorkflowNotFound] = useState(false)

    // --- States ---
    const [workflow, setWorkflow] = useState<Workflow>({
        _id: "",
        index: -1,
        name: "",
        description: "",
        steps: [],
        connections: {},
        startstep: "",
        owner: 1,
        majorsteps: [],
        history: [],
        state: ProcessState.NotStarted,
    })
    const [backdrop, setBackdrop] = useState(false)
    const dataFetchedRef = useRef(false)

    // --- Variables ---
    const inputValidation = {
        name: {
            displayName: "Name",
            validation: !!workflow.name,
        },
        description: {
            displayName: "Beschreibung",
            validation: !!workflow.description,
        },
        steps: {
            displayName: "Schritte",
            validation: workflow.steps.length > 0,
        },
        startstep: {
            displayName: "Startschritt",
            validation: !!workflow.startstep,
        },
        majorsteps: {
            displayName: "Hauptschritte",
            validation: workflow.majorsteps.length > 0,
        },
        connections: {
            displayName: "Verbindungen",
            validation: Object.keys(workflow.connections).length > 0,
        },
    }

    // --- Functions ---
    const fetchData = async (workflowId: string) => {
        setBackdrop(true)
        getWorkflow(workflowId)
            .then(({ workflow }: PMResponse) => setWorkflow(workflow!))
            .catch(() => setShowWorkflowNotFound(true))
            .finally(() => setBackdrop(false))
    }
    useEffect(() => {
        if (dataFetchedRef.current) {
            return
        }
        dataFetchedRef.current = true
        const workflowId = router.query["workflowId"] as string
        if (workflowId) {
            fetchData(workflowId)
        }
    })
    const checkInputs = () => {
        return Object.values(inputValidation)
            .filter(property => !property.validation)
            .map(property => property.displayName)
    }
    const handleSubmit = async () => {
        const invalidInputs = checkInputs()
        if (invalidInputs.length > 0) {
            enqueueSnackbar(
                `Bitte überprüfen Sie die Eingaben auf Vollständigkeit. Folgende Angaben sind fehlerhaft: ${invalidInputs.join(
                    ", "
                )}`,
                {
                    variant: "warning",
                }
            )
            return
        }

        setBackdrop(true)
        createUpdateWorkflow(workflow)
            .then(() => router.push("/manage-workflow-templates"))
            .catch(() => {
                enqueueSnackbar("There was an error while updating the database.", {
                    variant: "error",
                })
            })
            .finally(() => setBackdrop(false))
    }

    return (
        <>
            <MetaTitle title="Prozessvorlage bearbeiten" />
            {showWorkflowNotFound ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        minHeight: "50vh",
                    }}
                >
                    <Typography variant="h1" style={{ color: "black" }}>
                        404
                    </Typography>
                    <Typography variant="h6" style={{ color: "black" }}>
                        Der Prozess wurde nicht gefunden.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Backdrop
                        open={backdrop}
                        sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <Box
                        sx={{
                            width: 1000,
                            display: "block",
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                    >
                        {workflow._id ? (
                            <Typography variant={"h4"} align="center" gutterBottom>
                                Prozessvorlage bearbeiten
                            </Typography>
                        ) : (
                            <Typography variant={"h4"} align="center" gutterBottom>
                                Prozessvorlage erstellen
                            </Typography>
                        )}
                        <Divider sx={{ mb: 6 }} />

                        <Box sx={{ m: 2 }}>
                            {/* General */}
                            <WorkflowInfo
                                edit={true}
                                workflow={workflow}
                                setWorkflow={setWorkflow}
                            />

                            {/* Steps */}
                            <WorkflowSteps
                                workflow={workflow}
                                setWorkflow={setWorkflow}
                                setBackdrop={setBackdrop}
                            />

                            {/* Major Steps */}
                            <WorkflowMajorSteps workflow={workflow} setWorkflow={setWorkflow} />

                            {/* Connections */}
                            <WorkflowConnections workflow={workflow} setWorkflow={setWorkflow} />

                            <Box
                                style={{ display: "flex", justifyContent: "center" }}
                                sx={{ m: 2, mt: 8 }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{ m: 1 }}
                                    color="success"
                                >
                                    Speichern
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push("/manage-workflow-templates")}
                                    sx={{ m: 1 }}
                                    color="error"
                                >
                                    Abbrechen
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
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
export default EditWorkflowTemplates
