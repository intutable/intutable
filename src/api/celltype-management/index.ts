import { CellType, isCellType, _RuntimeCellTypeMap } from "./celltypes"
import {
    ConversionType,
    CONVERSION_TABLE,
    Convertable,
    isOfTypeConvertable,
} from "./whitelist"

export class ConversionWarning extends Error {
    private readonly typeA: CellType
    private readonly typeB: CellType
    public readonly conversionType: ConversionType = "dependent"
    constructor(
        displayWarning: string,
        currentType: CellType,
        newType: CellType
    ) {
        super(displayWarning)
        this.name = this.constructor.name
        this.stack = undefined

        this.typeA = currentType
        this.typeB = newType
    }
}

type IsConvertableResponse = {
    convertable: boolean
    conversion: ConversionType
    /**
     * returns an `Error` instance when types are not convertable
     * and an `ConversionWarning` instance when types are convertable
     * but only of `ConversionType` 'dependent'!
     */
    message?: Error | ConversionWarning
}

/**
 * Tells if type A can be converted to type B.
 * @param {CellType} from A
 * @param {CellType} to B
 * @returns either true or an error with a message that can be displayed to the user.
 */
export const isConvertable = (
    from: CellType,
    to: CellType
): IsConvertableResponse => {
    const currentType = CONVERSION_TABLE[from]
    const isConvertableWithoutParsing = currentType.includes(to)
    const isConvertableWithParsing = currentType.find(
        e => isOfTypeConvertable(e) && e.type === to
    ) as undefined | Convertable

    if (isConvertableWithoutParsing)
        return {
            convertable: true,
            conversion: "independent",
            message: undefined,
        }

    if (isConvertableWithParsing)
        return {
            convertable: true,
            conversion: "dependent",
            message: new ConversionWarning(
                `Type ${from} can only be converted to type ${to} if ${"#not implemented yet#"}!`,
                from,
                to
            ),
        }

    return {
        convertable: false,
        conversion: "none",
        message: new Error(`Type ${from} can not be converted to type ${to}!`),
    }
}
