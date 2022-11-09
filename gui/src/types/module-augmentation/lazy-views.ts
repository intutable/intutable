// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ColumnInfo } from "@intutable/lazy-views"
import { Column } from "types"
import { DB } from "@shared/types/tables/backend"

// Note: augments the `@intutable/lazy-views` module

declare module "@intutable/lazy-views" {
    interface ColumnInfo {
        attributes: DB.Column
    }
    /** // TODO: is this suitable? a parsed version of ColumnInfo? */
    interface ColumnInfoParsed extends Omit<ColumnInfo, "attributes"> {
        attributes: Column.Serialized
    }
}
