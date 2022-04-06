/**
 * When serializing, components as values of keys can not be serialized properly.
 * Therefore these components are identified by unique strings and then replaced.
 */
export const PLACEHOLDER = {
    /**
     * @deprecated
     */
    SELECTOR_COLUMN_KEY: "__selector__",
    ROW_INDEX_KEY: "__rowIndex__",
    /**
     * predefined by rdg
     * DO NOT CHANGE THIS VALUE
     */
    COL_SELECTOR: "select-row",
} as const
