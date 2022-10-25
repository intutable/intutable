/**
 * @module api.cells
 * The different data types that can be edited in the table. Each type is
 * represented by a subtype of the {@link abstract.Cell} type, and provides
 * functions for checking the validity of an input, storing it to a string
 * in the database, exporting to a user-friendly string format. Normally,
 * all their methods would be static, however we want to be able to branch
 * on cell types at runtime, so it's all instance. The type {@link Cells}
 * takes care of this.
 */

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
