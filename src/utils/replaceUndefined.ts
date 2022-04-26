import Obj from "types/Obj"

type ReplaceUndefined<O extends Obj> = {
    [K in keyof O]: O[K] extends Obj
        ? ReplaceUndefined<O[K]>
        : O[K] extends undefined
        ? null
        : O[K]
}

/**
 * Utility that recursivley replaces 'undefined' by 'null' in a plain object.
 * @param {Obj} obj
 * @returns {ReplaceUndefined<typeof obj>}
 */
export const replaceUndefined = (obj: Obj): ReplaceUndefined<typeof obj> => {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]

            // TODO: check correctly if value is a plain object
            if (typeof value === "object" && value != null)
                replaceUndefined(value as Obj)

            if (value === undefined) obj[key] = null
        }
    }
    return obj as ReplaceUndefined<typeof obj>
}
