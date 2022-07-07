import { Box } from "@mui/material"
import { WikiTree } from "components/Wiki/types"

export const docs: WikiTree = [
    {
        title: "Data Grid",
        children: [
            {
                title: "Views benutzen",
                description: "",
                body: <Box>Hallo</Box>,
                lastEdited: new Date("07/07/2022"),
                href: "/wiki/views-benutzen",
            },
            {
                title: "Filter anwenden",
                description: "",
                body: <Box>Hallo</Box>,
                lastEdited: new Date("07/07/2022"),
                href: "/wiki/filter-anwenden",
            },
        ],
    },
]
