import { Stack, Typography } from "@mui/material"
import { withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"
import * as fse from "fs-extra"
import { parseQuery } from "hooks/useAPI"
import type { NextPage } from "next"
import { withSSRCatch } from "utils/withSSRCatch"
import { MarkdownPage, WikiBadge, WikiPages } from "."

type WikiPageProps = MarkdownPage & {
    content: string
}

const WikiPage: NextPage = props => {
    console.log(props)

    return (
        <>
            <MetaTitle title="Wiki" />

            <Stack direction="row" alignItems="center" gap={2}>
                <Typography variant={"h4"}>Wiki</Typography>
                <WikiBadge />
            </Stack>
        </>
    )
}

export const getStaticPaths = withSSRCatch(
    withSessionSsr(async context => {
        return {
            paths: WikiPages.map(page => ({ params: { wikipage: page.slug } })),
            fallback: false,
        }
    })
)

export const getStaticProps = withSSRCatch(
    withSessionSsr<WikiPageProps>(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        const { wikipage } = parseQuery<{ wikipage: string }>(context.query, ["wikipage"])

        const page = WikiPages.find(page => page.url === wikipage)
        if (page == null)
            return {
                notFound: true,
            }

        try {
            // load file and export markdown as string
            const file = await fse.readFile(page.file)
            const content = file.toString()
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
    })
)

export default WikiPage
