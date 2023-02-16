import { cellMap } from "@datagrid/Cells"

const getFormattedValue = (value: unknown, column: { cellType: string }): string => {
    const ctor = cellMap.getCellCtor(column.cellType)
    const exporter = ctor?.export
    if (exporter == null) return value as string
    return exporter(value) as string
}
