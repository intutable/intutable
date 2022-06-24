import { types as lv } from "@intutable/lazy-views"

export const byIndex = (a: lv.ColumnInfo, b: lv.ColumnInfo) =>
    (a.attributes.index as number) > (b.attributes.index as number) ? 1 : -1
