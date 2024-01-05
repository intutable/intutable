import { Stack, Typography } from "@mui/material"
import { WikiPages, WikiPageTypeFilter } from "pages/wiki"
import { Dispatch, SetStateAction } from "react"
import { Filter } from "./Filter"

export type HeaderProps = {
    // search:
    // setSearch
    filter: WikiPageTypeFilter
    setFilter: Dispatch<SetStateAction<WikiPageTypeFilter>>
}

export const Header: React.FC<HeaderProps> = props => {
    return (
        <Stack direction="row" alignItems="center" gap={2}>
            {/* <Search /> */}
            <Filter {...props} />
            <Typography>
                {props.filter.length > 0 &&
                    WikiPages.filter(page => props.filter.includes(page.type)).length + " / "}
                {WikiPages.length} {WikiPages.length === 1 ? "Eintrag" : "Einträge"}
            </Typography>
        </Stack>
    )
}
