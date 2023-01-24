import { cellMap } from "@datagrid/Cells"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import KeyIcon from "@mui/icons-material/Key"
import LinkIcon from "@mui/icons-material/Link"
import LookupIcon from "@mui/icons-material/ManageSearch"
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { useAPI } from "context"
import { useForeignTable } from "hooks/useForeignTable"
import { useRouter } from "next/router"
import React from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { ColumnContextMenu } from "./ColumnContextMenu"
import { PrefixIcon } from "./PrefixIcon"
import { SearchBar } from "./SearchBar"

export const HeaderRenderer: React.FC<HeaderRendererProps<Row>> = props => {
    const { column } = props
    const router = useRouter()

    const { project } = useAPI()

    const { foreignTable } = useForeignTable(column)
    const navigateToTable = () => router.push(`/project/${project!.id}/table/${foreignTable?.id}`)

    const cell = cellMap.instantiate(column)
    const Icon = cell.icon

    return (
        <Stack
            direction="column"
            sx={{
                width: "100%",
                height: "100%",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: "35px",
                    display: "inline-flex",
                    justifyContent: "flex-start",
                    alignContent: "center",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                }}
            >
                {/* Prefix Icon Link Column */}
                <PrefixIcon
                    open={column.kind === "link"}
                    title={`Verlinkte Spalte. (Ursprung: Primärspalte aus Tabelle '${
                        foreignTable ? foreignTable.name : "Lädt..."
                    }'.)`}
                    iconButtonProps={{
                        onClick: navigateToTable,
                        disabled: foreignTable == null,
                    }}
                >
                    <LinkIcon
                        sx={{
                            fontSize: "90%",
                        }}
                    />
                </PrefixIcon>
                {/* Prefix Icon Backward Link Column */}
                <PrefixIcon
                    open={column.kind === "backwardLink"}
                    title={`Verlinkte Spalte. (Ursprung: Primärspalte aus Tabelle '${
                        foreignTable ? foreignTable.name : "Lädt..."
                    }'.)`}
                    iconButtonProps={{
                        onClick: navigateToTable,
                        disabled: foreignTable == null,
                    }}
                >
                    <LinkIcon
                        sx={{
                            fontSize: "90%",
                        }}
                    />
                </PrefixIcon>

                {/* Prefix Icon Primary Column */}
                <PrefixIcon
                    open={column.isUserPrimaryKey === true}
                    title="Primärspalte. (Inhalt sollte einzigartig sein, z.B. ein Name oder eine ID-Nummer.)"
                >
                    <KeyIcon
                        sx={{
                            fontSize: "80%",
                        }}
                    />
                </PrefixIcon>

                {/* Prefix Icon Lookup Column */}
                <PrefixIcon
                    open={column.kind === "lookup"}
                    title={`Lookup aus '${foreignTable?.name}'. (readonly)`}
                >
                    <LookupIcon
                        sx={{
                            fontSize: "90%",
                        }}
                    />
                </PrefixIcon>

                <Box
                    sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <Tooltip title={props.column.name}>
                        <Typography
                            sx={{
                                fontWeight: "bold",
                            }}
                        >
                            <Icon fontSize="small" />
                            {props.column.name}
                        </Typography>
                    </Tooltip>
                </Box>

                <Box>
                    {/* <Tooltip title="Filter">
                        <IconButton size="small" edge="end" disabled>
                        <FilterAltIcon
                        sx={{
                        fontSize: "80%",
                        }}
                        />
                        </IconButton>
                        </Tooltip> */}

                    <ColumnContextMenu headerRendererProps={props} />
                </Box>
            </Box>

            <SearchBar />
        </Stack>
    )
}
