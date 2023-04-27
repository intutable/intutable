import { Breadcrumbs, Stack, Typography } from "@mui/material"
import Link from "components/Link"
import MetaTitle from "components/MetaTitle"
import { getBadges, getTypeBadge } from "components/Wiki/Badges"
import * as fse from "fs-extra"
import type { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { useRouter } from "next/router"
import ReactMakdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { MarkdownPage, WikiPages } from "."

type WikiPageProps = MarkdownPage & {
    content: string
}

const WikiPage: NextPage<WikiPageProps> = props => {
    const router = useRouter()

    return (
        <>
            <MetaTitle title={props.title} />

            <Breadcrumbs separator="›">
                <Link href="/wiki" muiLinkProps={{ underline: "hover" }}>
                    Wiki
                </Link>
                <Typography>{props.title}</Typography>
            </Breadcrumbs>

            <Stack direction="row" alignItems="center" gap={1} marginTop={3} marginBottom={8}>
                <Typography variant={"h4"}>{props.title}</Typography>
                {getTypeBadge(props.type)}
                {props.badge && getBadges(props.badge)}
            </Stack>

            <ReactMakdown remarkPlugins={[remarkGfm]}>{props.content}</ReactMakdown>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: WikiPages.map(page => ({ params: { wikipage: page.slug } })),
        fallback: false, // <- allows only the paths above to be rendered
    }
}

export const getStaticProps: GetStaticProps = async context => {
    try {
        const { wikipage } = context.params as { wikipage: string; [key: string]: unknown }
        const page = WikiPages.find(page => page.slug === wikipage) // get full page object
        if (!page) throw new Error(`Wiki page not found: ${wikipage}`)
        const file = await fse.readFile(page.file, "utf8") // load file
        const content = file.toString() // get markdown

        return {
            props: {
                ...page,
                content,
            },
        }
    } catch (error) {
        return {
            notFound: true,
        }
    }
}

export default WikiPage
