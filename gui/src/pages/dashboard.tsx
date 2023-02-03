import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Box, Button, Card, CardContent, darken, Divider, Stack, Tooltip, Typography } from "@mui/material"
import { InputMask } from "@shared/input-masks/types"
import { fetcher } from "api/fetcher"
import { withSessionSsr } from "auth/withSessionSSR"
import { CollapsableSection } from "components/CollapsableSection"
import MetaTitle from "components/MetaTitle"
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { TableData, ViewData } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { withSSRCatch } from "utils/withSSRCatch"
import { useTheme } from "@mui/material/styles"
import {
    isTableIdOrigin,
    isTableNameOrigin,
    isViewIdOrigin,
    isViewNameOrigin,
    TableIdOrigin,
    TableNameOrigin,
    TableOrigin,
    ViewIdOrigin,
    ViewNameOrigin,
    ViewOrigin,
} from "@shared/input-masks/utils"
import { FindSource } from "utils/FindSource"
import AddRecordIcon from "@mui/icons-material/PlaylistAddCircle"
import Icon from "@mui/material/Icon"
import Head from "next/head"
import { useRouter } from "next/router"
import TableIcon from "@mui/icons-material/TableRows"
import ViewIcon from "@mui/icons-material/TableView"
import { UrlObject } from "url"

type InputMaskCallToActionCard = {
    inputMask: InputMask
    url: string | UrlObject
    callToActionUrl: string | UrlObject
    originType: "table" | "view"
    source: {
        project: ProjectDescriptor
        table: ViewDescriptor
        view: ViewDescriptor
    }
}

type DashboardProps = {
    cards: InputMaskCallToActionCard[]
}

const Dashboard: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props: DashboardProps) => {
    const theme = useTheme()
    const router = useRouter()

    return (
        <>
            <MetaTitle title="Dashboard" />
            <Head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            </Head>
            <Typography variant={"h4"}>Dashboard</Typography>
            <Divider />

            <CollapsableSection title="Eingabemasken">
                <Stack direction="row" sx={{ width: "100%" }} gap={4}>
                    {props.cards.map(card => (
                        <Tooltip
                            arrow
                            placement="top"
                            enterDelay={2000}
                            title={card.inputMask.description}
                            key={card.inputMask.id}
                        >
                            <Card
                                onClick={() =>
                                    router.push(card.url, typeof card.url === "string" ? card.url : card.url.pathname!)
                                }
                                sx={{
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    "&:hover": {
                                        bgcolor: theme.palette.action.hover,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Stack direction="row" alignItems="center">
                                        <Tooltip
                                            arrow
                                            placement="right"
                                            title={`${card.source.project.name} > ${card.source.table.name} > ${card.source.view.name}`}
                                            sx={{ mr: 2 }}
                                        >
                                            {card.originType === "table" ? (
                                                <TableIcon fontSize="large" />
                                            ) : (
                                                <ViewIcon fontSize="large" />
                                            )}
                                        </Tooltip>
                                        <Stack direction="column">
                                            <Typography variant="h6">
                                                {card.originType === "table"
                                                    ? card.source.table.name
                                                    : `${card.source.view.name} in ${card.source.table.name}`}
                                            </Typography>
                                            <Button
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    router.push(
                                                        card.callToActionUrl,
                                                        typeof card.url === "string" ? card.url : card.url.pathname!
                                                    )
                                                }}
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    bgcolor: theme.palette.primary.light,
                                                    mt: 3,
                                                }}
                                                startIcon={
                                                    card.inputMask.addRecordButtonIcon ? (
                                                        <Icon>{card.inputMask.addRecordButtonIcon}</Icon>
                                                    ) : (
                                                        <AddRecordIcon />
                                                    )
                                                }
                                            >
                                                {card.inputMask.addRecordButtonText ?? "Neuer Eintrag"}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Tooltip>
                    ))}
                </Stack>
            </CollapsableSection>
        </>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr<DashboardProps>(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        const tree = await FindSource.buildTree({
            fetchProjectsCallback: async () =>
                await fetcher<ProjectDescriptor[]>({
                    url: `/api/projects`,
                    method: "GET",
                    headers: context.req.headers as HeadersInit,
                }),
            fetchTablesCallback: async projectId =>
                await fetcher<ViewDescriptor[]>({
                    url: `/api/tables/${projectId}`,
                    method: "GET",
                    headers: context.req.headers as HeadersInit,
                }),
            fetchViewsCallback: async tableId =>
                await fetcher<ViewDescriptor[]>({
                    url: `/api/views/${tableId}}`,
                    method: "GET",
                    headers: context.req.headers as HeadersInit,
                }),
        })

        const inputMasks = await fetcher<InputMask[]>({
            url: `/api/inputMasks`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })

        const DEFAULT_VIEW_NAME = "Standard" as const

        const cards: InputMaskCallToActionCard[] = inputMasks.map(mask => {
            const originType = isViewIdOrigin(mask.origin) || isViewNameOrigin(mask.origin) ? "view" : "table"
            const source =
                originType === "view"
                    ? tree.sourceOfView(mask.origin as ViewOrigin)
                    : tree.sourceOfTable(mask.origin as TableOrigin)

            if (source == null) throw new Error("Source not found for input mask: " + mask.id)

            if (originType === "table") {
                const project = source as ProjectDescriptor
                const origin = mask.origin as TableOrigin
                const tableDescriptor = tree.descriptorForTableOrigin(origin)
                if (tableDescriptor == null) throw new Error("Table descriptor not found for input mask: " + mask.id)
                const viewDescriptor = tree.descriptorForViewOrigin({
                    projectId: project.id,
                    viewName: DEFAULT_VIEW_NAME,
                    viewsTableName: tableDescriptor.name,
                })
                if (viewDescriptor == null) throw new Error("View descriptor not found for input mask: " + mask.id)
                return {
                    inputMask: mask,
                    url: {
                        pathname: `/project/${project.id}/table/${tableDescriptor.id}`,
                        query: {
                            inputMask: mask.id,
                        },
                    },
                    callToActionUrl: {
                        pathname: `/project/${project.id}/table/${tableDescriptor.id}`,
                        query: {
                            inputMask: mask.id,
                            newRecord: Date.now().toString(),
                        },
                    },
                    originType: "table",
                    source: {
                        project: project,
                        table: tableDescriptor,
                        view: viewDescriptor,
                    },
                }
            }

            if (originType === "view") {
                const { project, table } = source as { project: ProjectDescriptor; table: ViewDescriptor }
                const viewDescriptor = tree.descriptorForViewOrigin(mask.origin as ViewOrigin)
                if (viewDescriptor == null) throw new Error("View descriptor not found for input mask: " + mask.id)

                return {
                    inputMask: mask,
                    url: {
                        pathname: `/project/${project.id}/table/${table.id}`,
                        query: {
                            view: viewDescriptor.id,
                            inputMask: mask.id,
                        },
                    },
                    callToActionUrl: {
                        pathname: `/project/${project.id}/table/${table.id}`,
                        query: {
                            view: viewDescriptor.id,
                            inputMask: mask.id,
                            newRecord: Date.now().toString(),
                        },
                    },
                    originType: "view",
                    source: {
                        project,
                        table,
                        view: viewDescriptor,
                    },
                }
            }

            throw new Error("Unknown origin type: " + originType)
        })

        return {
            props: {
                cards,
            },
        }
    })
)

export default Dashboard
