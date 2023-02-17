import { Box, Divider, Typography } from "@mui/material"
import { withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"
import { UndoHistory } from "components/UndoHistory.tsx/UndoHistory"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { withSSRCatch } from "utils/withSSRCatch"

const History: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
    return (
        <>
            <MetaTitle title="Versionsverlauf" />
            <Typography variant={"h4"}>Änderungsverlauf</Typography>
            <Divider />

            <Box sx={{ mt: 10 }}>
                <UndoHistory />
            </Box>
        </>
    )
}

export default History

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
