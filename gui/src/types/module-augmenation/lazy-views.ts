// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ColumnInfo } from "@intutable/lazy-views"
import { DB } from "utils/DBParser/DBParser"

// Note: augments the `@intutable/lazy-views` module

declare module "@intutable/lazy-views" {
    interface ColumnInfo {
        attributes: DB.Column // TOOD: change to Column.Deserialized when DBParser moved to the backend
    }
}
