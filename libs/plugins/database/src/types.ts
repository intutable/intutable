import { Knex } from "knex"

export type Condition = any[]

export interface SelectOptions {
    columns?: string[]
    join?: Join | Join[]
    condition?: Condition
}

export interface UpdateOptions {
    condition?: Condition
    update: Record<string, any> | any[]
}

export type Join = { table: string; on: string[] }

/**
 * Object to define columns
 */
export interface Column {
    /**
     * Name of the column
     */
    name: string
    /**
     * Type of the column: {@link ColumnType}
     */
    type: ColumnType
    /**
     * **(Optional)**
     * List of {@link SimpleColumnOption}
     */
    options?: ColumnOption[]
}

/**
 * Available column types
 */
export enum ColumnType {
    integer = "integer",
    bigInteger = "bigInteger",
    text = "text",
    string = "string",
    float = "float",
    decimal = "decimal",
    boolean = "boolean",
    date = "date",
    datetime = "datetime",
    time = "time",
    binary = "binary",
    uuid = "uuid",
    increments = "increments",
}

export type ColumnOption = SimpleColumnOption | DefaultValue

/**
 * Available column options
 */
export enum SimpleColumnOption {
    nullable = "nullable",
    notNullable = "notNullable",
    index = "index",
    unsigned = "unsigned",
    primary = "primary",
    unique = "unique",
    alter = "alter",
}

/**
 * A default value constraint for a column
 * @prop name the name of the constraint, for removing it (not implemented
 * in this plugin yet)
 */
export type DefaultValue = {
    defaultValue: Knex.Value
    name?: string
}
/**
 * For now, only this kind of constraint is implemented.
 */
export type TableOption = UniqueIndex | ForeignKey

/**
 * There is a "unique" ColumnOption, but it only applies to a single column.
 * Table-wide unique constraints can also apply to multiple columns.
 */
export type UniqueIndex = {
    columns: string[]
    name?: string
}
/**
 * Foreign keys
 */
export type ForeignKey = {
    columns: string | string[]
    references: string | string[]
    inTable: string
    onUpdate?: ForeignKeyUpdateAction
    onDelete?: ForeignKeyUpdateAction
    name?: string
}
/**
 * What to do when data referenced by a foreign key are updated or deleted:
 * RESTRICT, SET NULL, CASCADE, or NO ACTION.
 */
export enum ForeignKeyUpdateAction {
    restrict = "restrict",
    setNull = "set null",
    cascade = "cascade",
    noAction = "no action",
}
