export declare type CellContentType = "string" | "number" | "percentage" | "currency" | "boolean" | "date" | "datetime" | "time" | "avatar" | "hyperlink" | "email" | "select" | "multiSelect" | "complex";
/**
 * On creating a standard column, these are the properties that must be
 * specified.
 * TODO: make Column.Serialized a subtype of this
 */
export declare type StandardColumnSpecifier = {
    name: string;
    _cellContentType: CellContentType;
    editable: boolean;
};
