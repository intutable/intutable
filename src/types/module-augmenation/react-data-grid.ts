import { PM } from "../index"

// Note: augments the `react-data-grid` module

declare module "react-data-grid" {
    /* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
    interface Column<TRow, TSummaryRow = unknown> extends Partial<PM> {}
    /* eslint-enable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
}
