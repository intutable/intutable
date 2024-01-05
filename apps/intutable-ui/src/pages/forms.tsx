import { ViewDescriptor } from "@intutable-org/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable-org/project-management/dist/types"
import { Divider, Stack, Typography } from "@mui/material"
import { InputMask } from "@shared/input-masks/types"
import {
    isViewIdOrigin,
    isViewNameOrigin,
    TableOrigin,
    ViewOrigin,
} from "@shared/input-masks/utils"
import { fetcher } from "api/fetcher"
import { withSessionSsr } from "auth/withSessionSSR"
import { CollapsableSection } from "components/CollapsableSection"
import { InputMaskCTACard } from "components/InputMaskCTACard"
import MetaTitle from "components/MetaTitle"
import type { InferGetServerSidePropsType, NextPage } from "next"
import Head from "next/head"
import { UrlObject } from "url"
import { FindSource } from "utils/FindSource"
import { withSSRCatch } from "utils/withSSRCatch"

export type InputMaskCallToActionCard = {
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

type FormsProps = {
    cards: InputMaskCallToActionCard[]
}

const Forms: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
    props: FormsProps
) => {
    return (
        <>
            <MetaTitle title="Eingabemasken" />
            <Head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
            </Head>
            <Typography variant={"h4"}>Eingabemasken</Typography>
            <Divider />

            <Stack direction="row" sx={{ width: "100%", mt: 5 }} gap={4} flexWrap="wrap">
                {props.cards
                    .sort((a, b) =>
                        a.inputMask.disabled === b.inputMask.disabled
                            ? 0
                            : a.inputMask.disabled
                            ? 1
                            : -1
                    )
                    .map(card => (
                        <InputMaskCTACard key={card.inputMask.id} card={card} />
                    ))}
            </Stack>
        </>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr<FormsProps>(async context => {
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
            const originType =
                isViewIdOrigin(mask.origin) || isViewNameOrigin(mask.origin) ? "view" : "table"
            const source =
                originType === "view"
                    ? tree.sourceOfView(mask.origin as ViewOrigin)
                    : tree.sourceOfTable(mask.origin as TableOrigin)

            if (source == null) throw new Error("Source not found for input mask: " + mask.id)

            if (originType === "table") {
                const project = source as ProjectDescriptor
                const origin = mask.origin as TableOrigin
                const tableDescriptor = tree.descriptorForTableOrigin(origin)
                if (tableDescriptor == null)
                    throw new Error("Table descriptor not found for input mask: " + mask.id)
                const viewDescriptor = tree.descriptorForViewOrigin({
                    projectId: project.id,
                    viewName: DEFAULT_VIEW_NAME,
                    viewsTableName: tableDescriptor.name,
                })
                if (viewDescriptor == null)
                    throw new Error("View descriptor not found for input mask: " + mask.id)
                return {
                    inputMask: mask,
                    url: {
                        pathname: `/project/${project.id}/table/${tableDescriptor.id}`,
                        query: {
                            viewId: viewDescriptor.id,
                            inputMask: mask.id,
                        },
                    },
                    callToActionUrl: {
                        pathname: `/project/${project.id}/table/${tableDescriptor.id}`,
                        query: {
                            viewId: viewDescriptor.id,
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
                const { project, table } = source as {
                    project: ProjectDescriptor
                    table: ViewDescriptor
                }
                const viewDescriptor = tree.descriptorForViewOrigin(mask.origin as ViewOrigin)
                if (viewDescriptor == null)
                    throw new Error("View descriptor not found for input mask: " + mask.id)

                return {
                    inputMask: mask,
                    url: {
                        pathname: `/project/${project.id}/table/${table.id}`,
                        query: {
                            viewId: viewDescriptor.id,
                            inputMask: mask.id,
                        },
                    },
                    callToActionUrl: {
                        pathname: `/project/${project.id}/table/${table.id}`,
                        query: {
                            viewId: viewDescriptor.id,
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

export default Forms
