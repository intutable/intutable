import { Box, Button, Stack, Typography } from "@mui/material"
import { withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"
import { getTypeBadge, WikiBadge } from "components/Wiki/Badges"
import { Header } from "components/Wiki/Header"
import type { NextPage } from "next"
import { useRouter } from "next/router"
import path from "path"
import { useState } from "react"
import { withSSRCatch } from "utils/withSSRCatch"

export type MarkdownPage = {
    /** path to the .md file */
    file: string
    title: string
    /** arbitrary but unique, text based or just a uuid */
    slug: string
    type: "user-guide" | "technical-documentation"
    badge?: ("wiki" | "beta")[]
}

export const WikiPages: MarkdownPage[] = [
    {
        file: path.join(process.cwd(), "/src/pages/wiki/pages/Projects-Tables-Views.md"),
        title: "Projekte, Tabellen und Views",
        slug: "projects-tables-views",
        type: "user-guide",
    },
    {
        file: path.join(process.cwd(), "/src/pages/wiki/pages/InputMasks.md"),
        title: "Eingabemasken",
        slug: "input-masks-technical-documentation",
        type: "technical-documentation",
        badge: ["beta"],
    },
    {
        file: path.join(process.cwd(), "/src/pages/wiki/pages/Constraints-UserGuide.md"),
        title: "Constraints",
        slug: "how-to-constraints",
        type: "user-guide",
        badge: ["beta"],
    },
    {
        file: path.join(
            process.cwd(),
            "/src/pages/wiki/pages/Constraints-TechnicalDocumentation.md"
        ),
        title: "Constraints",
        slug: "constraints-technical-documentation",
        type: "technical-documentation",
        badge: ["beta"],
    },
    {
        file: path.join(process.cwd(), "/src/pages/wiki/pages/ProcessManagement.md"),
        title: "Prozessmanagement",
        slug: "process-management",
        type: "user-guide",
    },
    {
        file: path.join(process.cwd(), "/src/pages/wiki/pages/Permissions.md"),
        title: "Nutzerrechte",
        slug: "permissions",
        type: "technical-documentation",
        badge: ["beta"],
    },
]

/** Only pages with the types inside the array will show up */
export type WikiPageTypeFilter = ("user-guide" | "technical-documentation")[]

const Wiki: NextPage = () => {
    const router = useRouter()

    const [filter, setFilter] = useState<WikiPageTypeFilter>([])

    return (
        <>
            <MetaTitle title="Wiki" />

            <Stack direction="row" alignItems="center" gap={2} marginBottom={5}>
                <Typography variant={"h4"}>Wiki</Typography>
                <WikiBadge />
            </Stack>

            <Box>
                <Header filter={filter} setFilter={setFilter} />
                <ul>
                    {WikiPages.filter(page => {
                        if (filter.length === 0) return true
                        return filter.includes(page.type)
                    }).map(page => (
                        <li key={page.slug}>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Button onClick={() => router.push(`/wiki/${page.slug}`)}>
                                    {page.title}
                                </Button>
                                {getTypeBadge(page.type)}
                            </Stack>
                        </li>
                    ))}
                </ul>
            </Box>
        </>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        return {
            props: {},
        }
    })
)

export default Wiki
