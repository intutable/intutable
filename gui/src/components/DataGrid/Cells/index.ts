/**
 * @module components.DataGrid.Cells
 * Cell types - utility classes for the different types of data that users
 * can edit in the table. Each type has a class (Boolean, Number, ...) that
 * represents the type as a whole - as such, you would expect all involved
 * methods to be static, but then we could not do the "get correct cell type
 * at runtime" thing (see {@link Cells})
 * Builds on the functionality of {@link @shared.api.cells}
 */
import { Cells } from "./Cells"
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

const cells = new Cells(
    new Text(),
    new Num(),
    new Time(),
    new DateCell(),
    new Bool(),
    new Percentage(),
    new Currency(),
    new Hyperlink(),
    new EMail(),
    new Select(),
    new MultiSelect()
)

export default cells

export { default as Cell } from "./abstract/Cell"
