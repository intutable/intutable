import { project_management } from "../type-annotations/project-management"

// Note: augments the `react-data-grid` module

declare module "react-data-grid" {
    /* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
    interface Column<TRow, TSummaryRow = unknown>
        extends Partial<project_management.UID> {}
    /* eslint-enable @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
}
