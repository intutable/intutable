import { CellMap } from "./Cells"

import { Text } from "./components/Text"
import { Num } from "./components/Number"
import { Time } from "./components/Time"
import { DateCell } from "./components/Date"
import { Bool } from "./components/Boolean"
import { Percentage } from "./components/Percentage"
import { Currency } from "./components/Currency"
import { Hyperlink } from "./components/Hyperlink"
import { EMail } from "./components/EMail"
import { Select } from "./components/Select"
import { MultiSelect } from "./components/MultiSelect"
import { BackwardLink } from "./components/BackwardLink"

export const cellMap = new CellMap(
    Text,
    Num,
    Time,
    DateCell,
    Bool,
    Percentage,
    Currency,
    Hyperlink,
    EMail,
    Select,
    MultiSelect,
    BackwardLink
)

export { Cell } from "./abstract/Cell"
export type { CellCtor } from "./Cells"
