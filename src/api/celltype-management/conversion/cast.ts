import { User } from "../../types/legacy"
import { CellData, CellType, _RuntimeCellTypeMap } from ".."
import { isConvertable } from "./whitelist"

/**
 * Converts data from one type to another.
 * @param {CellType} from
 * @param {CellType} to
 * @param {} data
 * @returns the converted data in case of success, or an error with a message that can be displayed to the user.
 */
export const convertData = <T1 extends CellType, T2 extends CellType>(
    from: T1,
    to: T2,
    data: CellData<T1>[]
): CellData<T2>[] | Error => {
    const convertable = isConvertable(from, to)
    if (convertable instanceof Error) return convertable

    const convertedObjects = []
    const nonConvertedObjects = []
    data.forEach(obj => {
        if (1) {
            convertedObjects.push(obj)
        } else {
            nonConvertedObjects.push(obj)
        }
    })
    // if (data.length !== convertedObjects.length)
    return new Error("not implemented")
}
