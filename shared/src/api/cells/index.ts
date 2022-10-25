export * from "./abstract"
export * from "./components"

import { Cells } from "./Cells"
import { Text } from "./components/Text"
import { Num } from "./components/Number"
import { Time } from "./components/Time"
import { Date } from "./components/Date"
import { Bool } from "./components/Boolean"
import { Percentage } from "./components/Percentage"
import { Currency } from "./components/Currency"
import { Hyperlink } from "./components/Hyperlink"
import { EMail } from "./components/EMail"
import { Select } from "./components/Select"
import { MultiSelect } from "./components/MultiSelect"

export const cells = new Cells(
    new Text(),
    new Num(),
    new Time(),
    new Date(),
    new Bool(),
    new Percentage(),
    new Currency(),
    new Hyperlink(),
    new EMail(),
    new Select(),
    new MultiSelect()
)
