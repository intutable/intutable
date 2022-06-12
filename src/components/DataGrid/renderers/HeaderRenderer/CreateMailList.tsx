import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import DownloadingIcon from "@mui/icons-material/Downloading"
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import { isAppColumn } from "api/utils/de_serialize/column"
import { useAPI } from "context"
import { useView } from "hooks/useView"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { ExportViewDialog } from "../../Toolbar/ToolbarItems/ExportView/ExportViewDialog"

export type CreateMailListProps = {
    colInfo: ColumnInfo
    headerRendererProps: HeaderRendererProps<Row>
}

export const CreateMailList: React.FC<CreateMailListProps> = props => {
    const { colInfo: col } = props

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeModal = () => setAnchorEL(null)

    const { table, view } = useAPI()
    const { data: viewData } = useView()

    const date = new Date()
    const localDateFormat = `${date.getDate()}-${
        date.getMonth() + 1
    }-${date.getFullYear()}`

    // TODO: uncomment when `_cellContentType is usable`
    // const emailColumns = useMemo(
    //     () =>
    //         viewData?.columns
    //             .filter(col => isAppColumn(col) === false)
    //             .filter(col => col._cellContentType === "email")
    //             .map(col => col._id),
    //     [viewData?.columns]
    // )

    if (
        (col &&
            Object.prototype.hasOwnProperty.call(col, "attributes") &&
            col.attributes.editor === "email") === false
    )
        return null

    return (
        <>
            <MenuItem onClick={openModal}>
                <ListItemIcon>
                    <DownloadingIcon />
                </ListItemIcon>
                <ListItemText>Mailing-Liste generieren</ListItemText>
            </MenuItem>
            <ExportViewDialog
                options={{
                    title: "Mailing-Liste generieren",
                    initialState: {
                        fileName: `Mail Liste ${table!.name}-${
                            view!.name
                        } ${localDateFormat}`,
                        format: "csv",
                        columns: [
                            /*emailColumns*/
                        ],
                        options: {
                            csvOptions: {
                                header: false,
                                includeEmptyRows: false,
                            },
                        },
                    },
                }}
                open={anchorEL != null}
                onClose={closeModal}
                allRowsSelected={props.headerRendererProps.allRowsSelected}
            />
        </>
    )
}
