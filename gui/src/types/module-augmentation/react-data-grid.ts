import { MetaColumnProps, Column as _Column } from "types"

// Note: augments the `react-data-grid` module

declare module "react-data-grid" {
    /* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
    interface Column<TRow, TSummaryRow = unknown> extends MetaColumnProps {
        __serialized: _Column.Serialized
    }
    /* eslint-enable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
}
