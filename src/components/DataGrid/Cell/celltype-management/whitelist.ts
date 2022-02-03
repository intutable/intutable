import { CellType, isCellType, _RuntimeCellTypeMap } from "./celltypes"
import Obj from "@utils/Obj"
import { CellData } from "."

/**
 * • 'none' means that one type A is not convertable to another type B regardless of the circumstances. Note that 'none' is not used in a whitelist because this would be redundant.
 * • 'independent' means that one type A is convertable to another type B regardless of the actual data (e.g. a number is always convertable to string, no further parsing).
 * • 'dependent' means that one type A is convertable to another type B if every data set of A matches the requirements of casting to type B (e.g. a string is not always convertable a number, first it must be tested/parsed).
 */
export type ConversionType = "none" | "independent" | "dependent"
export const isConversionType = (value: unknown): value is ConversionType =>
    typeof value === "string" &&
    ["none", "independent", "dependent"].includes(value)

/**
 * If type of CellType: an implict conversion type of 'independent' is assumed.
 */
export type Convertable = {
    type: CellType
    /**
     * @default independet
     */
    conversion: ConversionType
}
export const isOfTypeConvertable = (value: unknown): value is Convertable => {
    if (value == null || !(value instanceof Object)) return false
    value.hasOwnProperty

    if (
        Object.prototype.hasOwnProperty.call(value, "type") &&
        Object.prototype.hasOwnProperty.call(value, "conversion")
    )
        if (
            isCellType((value as { type: unknown }).type as string) &&
            isConversionType((value as { conversion: unknown }).conversion)
        )
            return true
    return false
}

/**
 * Whitelist of types that can be converted to each other.
 * E.g. a number can not be converted to an Avatar.
 * Note that the conversion direction is meant to be unidirectional!
 */
export type WhiteList = {
    /**
     * type of name `key` can be converted to the types in its value array.
     * otherwise not.
     */
    [key in CellType]: (Convertable | CellType)[]
}

export const CONVERSION_TABLE: WhiteList = {
    string: [
        { type: "number", conversion: "dependent" },
        { type: "percentage", conversion: "dependent" },
        { type: "currency", conversion: "dependent" },
        { type: "boolean", conversion: "dependent" },
        { type: "date", conversion: "dependent" },
        { type: "datetime", conversion: "dependent" },
        { type: "time", conversion: "dependent" },
        { type: "avatar", conversion: "dependent" },
        { type: "link", conversion: "dependent" },
        { type: "email", conversion: "dependent" },
        { type: "select", conversion: "dependent" },
        { type: "multiSelect", conversion: "dependent" },
    ],
    number: [
        "string",
        "percentage",
        "currency",
        "boolean",
        "date",
        "datetime",
        "time",
        "select",
        "multiSelect",
    ],
    percentage: ["string", "number"],
    currency: ["string", "number"],
    boolean: ["string", "number", "percentage", "select"],
    date: ["string", "number"],
    datetime: ["string", "number", "date", "time"],
    time: ["string", "number"],
    avatar: ["string", "link"],
    link: ["string", "avatar"],
    email: ["string"],
    select: ["string", "multiSelect"],
    multiSelect: ["string", "select"],
    complex: [],
}

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

export type IsConvertableResponse = {
    convertable: boolean
    conversion: ConversionType
    /**
     * returns an `Error` instance when types are not convertable
     * and an `ConversionWarning` instance when types are convertable
     * but only of `ConversionType` 'dependent'!
     */
    message?: Error | ConversionWarning
}

const review = <FROM extends CellType>(
    from: CellType,
    to: CellType,
    data: CellData<FROM>
): boolean => {
    // TODO: implement
    return false
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
): IsConvertableResponse | typeof review => {
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
