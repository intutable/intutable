import { IconButton, Menu, MenuItem, MenuList, Slide, Stack, TextField } from "@mui/material"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { MarkdownPage, WikiPages, WikiPageTypeFilter } from "pages/wiki"
import { getTypeBadge, getTypeBadgeComponent } from "./Badges"

export type FilterProps = {
    filter: WikiPageTypeFilter
    setFilter: Dispatch<SetStateAction<WikiPageTypeFilter>>
}

const filterValues: MarkdownPage["type"][] = ["user-guide", "technical-documentation"]

export const Filter: React.FC<FilterProps> = props => {
    const anchor = useRef(null)
    const [menuOpen, setMenuOpen] = useState(false)

    const addFilter = (type: MarkdownPage["type"]) => {
        props.setFilter(prev => [...prev, type])
        setMenuOpen(false)
    }

    const removeFilter = (type: MarkdownPage["type"]) => {
        props.setFilter(prev => prev.filter(t => t !== type))
    }

    return (
        <>
            <Stack direction="row" alignItems="center" ref={anchor} gap={1}>
                <IconButton size="small" onClick={() => setMenuOpen(prev => !prev)}>
                    <FilterAltIcon fontSize="small" />
                </IconButton>
                {props.filter.map(type => {
                    const Badge = getTypeBadgeComponent(type)
                    return <Badge key={type} onDelete={() => removeFilter(type)} />
                })}
            </Stack>
            <Menu
                open={anchor.current != null && menuOpen}
                anchorEl={anchor.current}
                onClose={() => setMenuOpen(false)}
            >
                <MenuList>
                    {props.filter.length === filterValues.length && (
                        <MenuItem onClick={() => props.setFilter([])}>
                            <i>Zurücksetzen</i>
                        </MenuItem>
                    )}
                    {filterValues
                        .filter(type => props.filter.includes(type) === false)
                        .map(type => (
                            <MenuItem key={type} onClick={() => addFilter(type)}>
                                {getTypeBadge(type)}
                            </MenuItem>
                        ))}
                </MenuList>
            </Menu>
        </>
    )
}
