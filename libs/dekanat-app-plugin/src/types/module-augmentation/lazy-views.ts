// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ColumnInfo } from "@intutable-org/lazy-views"
import { SerializedColumn } from "shared/dist/types/tables"
import { DB } from "shared/dist/types/tables"

// Note: augments the `@intutable/lazy-views` module

declare module "@intutable-org/lazy-views" {
    interface ColumnInfo {
        attributes: DB.Column
    }
    /** // TODO: is this suitable? a parsed version of ColumnInfo? */
    interface ColumnInfoParsed extends Omit<ColumnInfo, "attributes"> {
        attributes: SerializedColumn
    }
}
