/** Default row options for a new table view. */
import {
    ParentColumnDescriptor,
    RowOptions,
    SortOrder
} from "@intutable/lazy-views"
import { project_management_constants } from "types/type-annotations/project-management"


/**
 * Default row options: obviously no filtering or grouping. Only order by
 * UID to keep rows from jumping around when you edit them.
 */
export default function defaultRowOptions(
    /**
     * The interface {@link ParentColumnDescriptor} can take columns of
     * a table or a view. */
    columns: ParentColumnDescriptor[]
): RowOptions {
    const idColumn = columns.find(
        c => c.name === project_management_constants.UID_KEY
    )!
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: idColumn.id, joinId: null },
                order: SortOrder.Ascending
            },
        ],
    }
}
