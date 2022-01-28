import type { NextPage } from "next"
import Title from "@components/Head/Title"
import { Divider, Typography, Box, useTheme, IconButton } from "@mui/material"

const ServiceDesk: NextPage = () => {
    const theme = useTheme()
    return (
        <>
            <Title title="Service Desk" />
            <Typography variant={"h4"}>Service Desk</Typography>
            <Divider />
            <Typography
                sx={{
                    mt: theme.spacing(8),
                    color: theme.palette.text.secondary,
                }}
            >
                Bugs oder Feature-Requests können mit einer detaillierten
                Beschreibung an diese{" "}
                <a href="mailto:contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com">
                    E-Mail
                </a>{" "}
                gesendet werden. Die Entwickler erhalten eine Nachricht und
                kümmern sich darum.
            </Typography>
        </>
    )
}

export default ServiceDesk
