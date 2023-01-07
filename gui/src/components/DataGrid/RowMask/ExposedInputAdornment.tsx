import { Column } from "types"
import KeyIcon from "@mui/icons-material/Key"
import LinkIcon from "@mui/icons-material/Link"
import LookupIcon from "@mui/icons-material/ManageSearch"
import { InputAdornment as MUIInputAdornment } from "@mui/material"

export const ExposedInputAdornment: React.FC<{
    column: Column.Deserialized | Column.Serialized
}> = ({ column }) => {
    if (column.isUserPrimaryKey === false && column.kind === "standard") return null
    return (
        <MUIInputAdornment position="start">
            <ExposedInputIcon column={column} />
        </MUIInputAdornment>
    )
}

export const ExposedInputIcon: React.FC<{ column: Column.Deserialized | Column.Serialized }> = ({
    column,
}) =>
    column.isUserPrimaryKey === true ? (
        <KeyIcon fontSize="small" />
    ) : column.kind === "lookup" ? (
        <LookupIcon fontSize="small" />
    ) : column.kind === "link" ? (
        <LinkIcon fontSize="small" />
    ) : null
