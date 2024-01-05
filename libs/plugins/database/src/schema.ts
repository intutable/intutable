import { Knex } from "knex"
import TableBuilder = Knex.TableBuilder
import {
    Column,
    SimpleColumnOption,
    ColumnOption,
    DefaultValue,
    TableOption,
    UniqueIndex,
    ForeignKey,
} from "./types"

export function makeTableSchema(
    columns: Column[],
    options?: TableOption[]
): (t: TableBuilder) => any {
    return (table: TableBuilder) => {
        for (const column of columns) configureColumn(table, column)
        if (options) for (const option of options) applyTableOption(table, option)
    }
}

function applyTableOption(builder: Knex.TableBuilder, option: TableOption): void {
    if (isUniqueIndex(option)) applyUniqueIndex(builder, option)
    else applyForeignKey(builder, option)
}

function isUniqueIndex(option: TableOption): option is UniqueIndex {
    return !("references" in option)
}

function applyUniqueIndex(builder: Knex.TableBuilder, index: UniqueIndex): void {
    if (index.name) builder.unique(index.columns, { indexName: index.name })
    else builder.unique(index.columns)
}

function applyForeignKey(builder: Knex.TableBuilder, fk: ForeignKey): void {
    const columns = typeof fk.columns === "string" ? [fk.columns] : fk.columns
    const references = typeof fk.references === "string" ? [fk.references] : fk.references
    const builder1 = builder.foreign(columns).references(references).inTable(fk.inTable)
    const builder2 = fk.onUpdate ? builder1.onUpdate(fk.onUpdate) : builder1
    const builder3 = fk.onDelete ? builder2.onDelete(fk.onDelete) : builder2
    fk.name ? builder3.withKeyName(fk.name) : builder3
}

export function makeColumnSchema(column: Column): (c: TableBuilder) => any {
    return (tableBuilder: TableBuilder) => {
        configureColumn(tableBuilder, column)
    }
}

function configureColumn(tableBuilder: TableBuilder, { name, type, options = [] }: Column): void {
    /* This might seem hacky, but it is actually quite sane.
     * In knex you might write something like:
     *      db.schema.table("table name", (tableBuilder) => {
     *          tableBuilder.string("columnName").primary().notNullable()
     *      })
     *
     * We are doing nothing but the configuration from the inner
     * function here. Just more generic. We get the column name, type
     * and an object of options. Which we need to chain.
     */

    // This line does the table.string part
    let columnBuilder = tableBuilder[type](name)

    let option: ColumnOption
    for (option of options) {
        // This line does the chaining of column option
        // optName might be "primary" or "notNullable"
        // The assignment plays the role of the chaining in a concrete example.
        if (isSimpleColumnOption(option)) columnBuilder = columnBuilder[option]()
        else columnBuilder = applyDefaultOption(columnBuilder, option)
    }
}

function isSimpleColumnOption(option: ColumnOption): option is SimpleColumnOption {
    return typeof option !== "object"
}

function applyDefaultOption(builder: Knex.ColumnBuilder, option: DefaultValue): Knex.ColumnBuilder {
    return builder.defaultTo(option.defaultValue, {
        constraintName: option.name,
    })
}
