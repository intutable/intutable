import { IconButton, Slide, Stack, TextField } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { useRef, useState } from "react"

export const Search: React.FC = () => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

    return (
        <Stack
            direction="row"
            alignItems="center"
            ref={containerRef}
            sx={{
                overflow: "hidden",
            }}
        >
            <IconButton size="small" onClick={() => setOpen(prev => !prev)}>
                <SearchIcon fontSize="small" />
            </IconButton>

            <Slide direction="right" in={open} container={containerRef.current}>
                <TextField size="small" placeholder="Suche..." />
            </Slide>
        </Stack>
    )
}
