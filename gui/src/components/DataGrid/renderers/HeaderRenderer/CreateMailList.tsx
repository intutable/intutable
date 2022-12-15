import DownloadingIcon from "@mui/icons-material/Downloading"
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material"

import { useAPI } from "context"
import { useColumn } from "hooks/useColumn"
import { useView } from "hooks/useView"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { ExportViewDialog } from "../../Toolbar/ToolbarItems/ExportView/ExportViewDialog"

export type CreateMailListProps = {
    headerRendererProps: HeaderRendererProps<Row>
}

export const CreateMailList: React.FC<CreateMailListProps> = props => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeModal = () => setAnchorEL(null)

    const { table, view } = useAPI()
    const { data: viewData } = useView()
    const { getColumnInfo } = useColumn()
    const columnInfo = getColumnInfo(props.headerRendererProps.column)

    const date = new Date()
    const localDateFormat = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

    const emailColumns: number[] | null = useMemo(
        () =>
            viewData
                ? viewData.columns
                      .filter(col => ColumnUtility.isAppColumn(col) === false)
                      .filter(col => col.cellType === "email")
                      .map(col => col.id!)
                : null,
        [viewData]
    )

    if (
        (columnInfo &&
            Object.prototype.hasOwnProperty.call(columnInfo, "attributes") &&
            columnInfo.attributes.cellType === "email") === false ||
        viewData == null
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
                        date: new Date(),
                        options: {
                            columnSelection: emailColumns ?? [],
                        },
                        file: {
                            name: `Mail Liste ${table!.name}-${view!.name} ${localDateFormat}`,
                            format: "csv",
                            excludeDateString: true,
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
