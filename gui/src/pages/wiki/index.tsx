import { Box, Chip, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUser, withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"
import { useUserSettings } from "hooks/useUserSettings"
import type { NextPage } from "next"
import { useRouter } from "next/router"
import { withSSRCatch } from "utils/withSSRCatch"

export type MarkdownPage = {
    /** path to the .md file */
    file: string
    title: string
    /** arbitrary */
    slug: string
}

export const WikiPages: MarkdownPage[] = [
    {
        file: "shared/input-masks/README.md",
        title: "Eingabemasken",
        slug: "input-masks",
    },
]

export const WikiBadge: React.FC = () => (
    <Chip variant="outlined" label="Wiki" color="primary" size="small" sx={{ cursor: "help" }} />
)

const Wiki: NextPage = () => {
    const router = useRouter()

    return (
        <>
            <MetaTitle title="Wiki" />

            <Stack direction="row" alignItems="center" gap={2}>
                <Typography variant={"h4"}>Wiki</Typography>
                <WikiBadge />
            </Stack>

            <Box>
                <ul>
                    {WikiPages.map(page => (
                        <li key={page.url} onClick={() => router.push(page.url)}>
                            {page.title}
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
