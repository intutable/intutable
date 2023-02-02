import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Box, Card, CardContent, darken, Divider, Stack, Typography } from "@mui/material"
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

type InputMaskCallToActionCard = {
    inputMask: InputMask
    url: string
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

            <CollapsableSection title={"Titel"}>
                <Stack direction="row" sx={{ width: "100%" }} gap={4}>
                    {props.cards.map(card => (
                        <Card
                            key={card.inputMask.id}
                            onClick={() => router.push(card.url)}
                            sx={{
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                bgcolor: theme.colorScheme.ochsenblut,
                                "&:hover": {
                                    bgcolor: darken(theme.colorScheme.ochsenblut, 0.2),
                                },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row">
                                    {card.inputMask.addRecordButtonIcon ? (
                                        <Icon
                                            sx={{
                                                color: theme.palette.getContrastText(theme.colorScheme.ochsenblut),
                                            }}
                                        >
                                            {card.inputMask.addRecordButtonIcon}
                                        </Icon>
                                    ) : (
                                        <AddRecordIcon
                                            sx={{
                                                color: theme.palette.getContrastText(theme.colorScheme.ochsenblut),
                                            }}
                                        />
                                    )}
                                    <Stack direction="column">
                                        <Typography
                                            sx={{
                                                color: theme.palette.getContrastText(theme.colorScheme.ochsenblut),
                                            }}
                                        >
                                            {card.originType === "table"
                                                ? card.source.table.name
                                                : `${card.source.view.name} in ${card.source.table.name}`}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: theme.palette.getContrastText(theme.colorScheme.ochsenblut),
                                            }}
                                        >
                                            {card.inputMask.addRecordButtonText}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
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
                    url: `/project/${project.id}/table/${tableDescriptor.id}`,
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
                    url: `/project/${project.id}/table/${table.id}`,
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
