import { Typography } from "@mui/material"
import { cellMap } from "@datagrid/Cells"
import { Highlight } from "./Highlight"

export const format = (value: unknown, cellType: string): React.ReactNode => {
    const ctor = cellMap.getCellCtor(cellType)
    const catchEmpty = ctor.catchEmpty
    const deserializer = ctor.deserialize
    const exporter = ctor.export

    const deserialized = catchEmpty(deserializer.bind(ctor), value)
    if (deserialized == null) return <em>Leer</em>
    return <Highlight>{exporter(deserialized) as string}</Highlight>
}
