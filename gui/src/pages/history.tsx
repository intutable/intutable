import { Box, Divider, Typography } from "@mui/material"
import MetaTitle from "components/MetaTitle"
import { UndoHistory } from "components/UndoHistory.tsx/UndoHistory"
import type { NextPage } from "next"

const History: NextPage = () => {
    return (
        <>
            <MetaTitle title="Versionsverlauf" />
            <Typography variant={"h4"}>Versionsverlauf</Typography>
            <Divider />

            <Box sx={{ mt: 10 }}>
                <UndoHistory />
            </Box>
        </>
    )
}

export default History
