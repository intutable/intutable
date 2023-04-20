import { Box, Card, CardActionArea, CardContent, Divider, Grid, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import type { InferGetServerSidePropsType, NextPage } from "next"
import React from "react"
import { withSessionSsr } from "auth"
import { withSSRCatch } from "utils/withSSRCatch"
import { useRouter } from "next/router"
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch"
import DesignServicesIcon from "@mui/icons-material/DesignServices"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

const ManageWorkflows: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => (
    <ManageWorkflowsPage />
)
const ManageWorkflowsPage: React.FC = () => {
    // --- Hooks ---
    const router = useRouter()

    // --- Functions ---
    const handleCardClick = (type: string) => {
        switch (type) {
            case "activeWorkflows":
                router.push("/manage-active-workflows")
                break
            case "workflowTemplates":
                router.push("/manage-workflow-templates")
                break
        }
    }

    return (
        <>
            <MetaTitle title="Prozessverwaltung" />
            <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                <a
                    style={{
                        lineHeight: "0",
                    }}
                    href="/Nutzerhandbuch_Prozesse.pdf"
                    download="Nutzerhandbuch_Prozesse"
                >
                    <InfoOutlinedIcon
                        sx={{
                            color: "primary.main",
                        }}
                    />
                </a>
            </Grid>
            <Box sx={{ width: 600, display: "block", marginLeft: "auto", marginRight: "auto" }}>
                <Typography variant={"h4"} align="center" gutterBottom>
                    Prozessverwaltung
                </Typography>

                <Divider />

                <Box sx={{ mt: 6, display: "flex", justifyContent: "space-evenly" }}>
                    <Card sx={{ maxWidth: 250 }} onClick={() => handleCardClick("activeWorkflows")}>
                        <CardActionArea>
                            <CardContent>
                                <Box
                                    sx={{ mb: 2, display: "flex", justifyContent: "space-evenly" }}
                                >
                                    <ContentPasteSearchIcon />
                                </Box>
                                <Typography gutterBottom variant="h5" align="center">
                                    Aktive Prozesse
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Anzeige und Verwaltung des aktuellen Status aller aktiven
                                    Prozesse. Sie können Prozesse abbrechen, (ent-)sperren und
                                    löschen.
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Card
                        sx={{ ml: 1, mr: 2, maxWidth: 250 }}
                        onClick={() => handleCardClick("workflowTemplates")}
                    >
                        <CardActionArea>
                            <CardContent>
                                <Box
                                    sx={{ mb: 2, display: "flex", justifyContent: "space-evenly" }}
                                >
                                    <DesignServicesIcon />
                                </Box>
                                <Typography gutterBottom variant="h5" align="center">
                                    Prozessvorlagen
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Anzeige und Verwaltung aller Prozessvorlagen. Sie können neue
                                    Vorlagen anlegen und bereits bestehende Vorlagen bearbeiten oder
                                    löschen.
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
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
export default ManageWorkflows
