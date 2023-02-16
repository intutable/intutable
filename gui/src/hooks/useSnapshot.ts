import { cellMap } from "@datagrid/Cells"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { useAPI } from "context"
import { useView } from "hooks/useView"
import { Row, TableDescriptor, ViewDescriptor } from "types"

export type SnapshotColumn = { id: number; name: string; cellType: string }
export type SnapshotRow = { _id: number; index: number; formattedPrimaryColumnValue: string }

export type Snapshot = {
    project: ProjectDescriptor
    table: TableDescriptor
    view: ViewDescriptor
    column: SnapshotColumn
    row: SnapshotRow
    /** raw */
    oldValue: string
    /** raw */
    newValue: string
}

export const useSnapshot = () => {
    const { project, table, view } = useAPI()
    const { data } = useView()

    return {
        captureSnapshot: (
            oldValue: string,
            newValue: string,
            column: SnapshotColumn,
            row: Row
        ): Snapshot => {
            const primiaryColumn = data!.columns.find(c => c.isUserPrimaryKey)
            const exporter = cellMap.getCellCtor(primiaryColumn!.cellType).export

            const unformattedPrimaryColumnValue = row[primiaryColumn!.key]

            const rowSnapshot: SnapshotRow = {
                _id: row._id,
                index: data!.rows.find(r => r._id === row._id)!.index,
                formattedPrimaryColumnValue: exporter(unformattedPrimaryColumnValue) as string,
            }

            return {
                project: project!,
                table: table!,
                view: view!,
                column,
                row: rowSnapshot,
                oldValue,
                newValue,
            }
        },
    }
}
