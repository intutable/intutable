import { knex } from "knex"
import { Condition as DB_Condition } from "@intutable-org/database/dist/types"
import { select, rawQuery } from "@intutable-org/database/dist/requests"
import { getTableInfo } from "@intutable-org/project-management/dist/requests"

import { getCore as core } from "./internal/core"
import { error } from "./internal/error"
import type { ColumnDescriptor, ColumnGroupSpecifier } from "./types/internal"
import { TableDescriptor, JoinDescriptor, ViewId, ParentColumnId, RowOptions } from "./types"
import { getJoinIdFromColumnGroup, getCustomAttributes } from "./internal"
import {
    SelectableSpecifier,
    SourceTableSpecifier,
    SourceViewSpecifier,
    SelectableType,
} from "./selectable"

export const V = {
    VIEWS: "views",
    VIEW_JOINS: "view_joins",
    VIEW_COLUMNS: "view_columns",
    ID: "_id",
    NAME: "name",
    SOURCE_ID: "base_id",
    SOURCE_TYPE: "base_type",
    USER_ID: "user_id",
    ROW_OPTIONS: "row_options",
    ON: "on",
    PRE_GROUP: "pre_group",
    VIEW_ID: "view_id",
    JOIN_ID: "join_id",
    COLUMN_ID: "column_id",
    FUNCTION: "function",
}

export const PM = {
    COLUMNS: "columns",
    COLUMN_NAME: "columnName",
}

export const VIEWS_ATTRIBUTES = [V.ID, V.NAME, V.SOURCE_ID, V.SOURCE_TYPE, V.USER_ID, V.ROW_OPTIONS]

export const VIEW_JOINS_ATTRIBUTES = [
    V.ID,
    V.VIEW_ID,
    V.SOURCE_ID,
    V.SOURCE_TYPE,
    V.ON,
    V.PRE_GROUP,
]

/**
 * The VIEW_COLUMNS table can be extended by custom attributes. These here
 * are the ones that are intrinsic to this plugin and cannot be changed.
 */
export const VIEW_COLUMNS_ATTRIBUTES = [V.ID, V.VIEW_ID, V.JOIN_ID, V.COLUMN_ID, V.FUNCTION]

/** Get the tuple of a given view's metadata from the database. */
export async function getViewMetaRow(
    connectionId: string,
    id: number
): Promise<Record<string, any>> {
    return getMetaRow(connectionId, V.VIEWS, id)
}
/** Get the tuple of a given join's metadata from the database. */
export async function getJoinMetaRow(
    connectionId: string,
    id: number
): Promise<Record<string, any>> {
    return getMetaRow(connectionId, V.VIEW_JOINS, id)
}
/** Get the tuple of a given column's metadata from the database. */
export async function getColumnMetaRow(
    connectionId: string,
    id: number
): Promise<Record<string, any>> {
    return getMetaRow(connectionId, V.VIEW_COLUMNS, id)
}

async function getMetaRow(
    connectionId: string,
    table: string,
    id: number
): Promise<Record<string, any>> {
    const rows = (await core().events.request(
        select(connectionId, table, { condition: [V.ID, id] })
    )) as Record<string, any>[]
    if (rows.length !== 1) {
        return Promise.reject(
            (rows.length === 0 ? "no entry" : "several entries") +
                ` found in meta table ${table} for ID ${id.toString()}`
        )
    } else {
        return rows[0]
    }
}

/**
 * Extract a view's source table from its corresponding metadata row.
 */
export function getSelectableFromDbRow(dbRow: Record<string, any>): SelectableSpecifier {
    const type: SelectableType = dbRow[V.SOURCE_TYPE]
    switch (type) {
        case SelectableType.Table:
            return { type, id: dbRow[V.SOURCE_ID] } as SelectableSpecifier
        case SelectableType.View:
            return { type, id: dbRow[V.SOURCE_ID] } as SelectableSpecifier
    }
}

/**
 * Given a {@link SelectableSpecifier}, create an object of the DB props that
 * are needed to represent it.
 */
export function getDbPropsFromSelectable(spec: SelectableSpecifier): Record<string, unknown> {
    switch (spec.type) {
        case SelectableType.Table:
            return {
                [V.SOURCE_ID]: (spec as SourceTableSpecifier).id,
                [V.SOURCE_TYPE]: spec.type,
            }
        case SelectableType.View:
            return {
                [V.SOURCE_ID]: (spec as SourceViewSpecifier).id,
                [V.SOURCE_TYPE]: spec.type,
            }
    }
}

/** Get descriptor for a given join (by its ID) */
export async function getJoinDescriptor(connectionId: string, id: number): Promise<JoinDescriptor> {
    const row = await getJoinMetaRow(connectionId, id)
    return {
        id: row[V.ID],
        foreignSource: getSelectableFromDbRow(row),
        on: JSON.parse(row[V.ON]),
        preGroup: row[V.PRE_GROUP] === 1,
    }
}
/** Get all joins for a given view. */
export async function getJoinDescriptorsOfView(
    connectionId: string,
    viewId: number
): Promise<JoinDescriptor[]> {
    return getJoinDescriptors(connectionId, [V.VIEW_ID, viewId])
}
async function getJoinDescriptors(
    connectionId: string,
    condition: DB_Condition
): Promise<JoinDescriptor[]> {
    const rows = (await core().events.request(
        select(connectionId, V.VIEW_JOINS, {
            columns: [V.ID, V.SOURCE_ID, V.SOURCE_TYPE, V.ON, V.PRE_GROUP],
            condition,
        })
    )) as any[]
    return rows.map(r => ({
        id: r[V.ID],
        foreignSource: getSelectableFromDbRow(r),
        on: JSON.parse(r[V.ON]),
        preGroup: r[V.PRE_GROUP] === 1,
    }))
}

/** Get the descriptor of a PM table. */
export async function getTableDescriptor(
    connectionId: string,
    tableId: number
): Promise<TableDescriptor> {
    return core()
        .events.request(getTableInfo(connectionId, tableId))
        .then(t => t.table)
        .catch(e => Promise.reject(error("getTableDescriptor", "could not get table info", e)))
}

/**
 * Get a single column's descriptor (contains ID, view ID, custom metadata,
 * but not yet the parent column's metadata)
 */
export async function getColumnDescriptor(
    connectionId: string,
    id: number
): Promise<ColumnDescriptor> {
    return getColumnMetaRow(connectionId, id).then(row => makeColumnDescriptor(row))
}
/**
 * Get the descriptors (contain ID, view ID, custom metadata, but not yet the
 * parent column's metadata) for a given view
 */
export async function getColumnDescriptors(
    connectionId: string,
    viewId: number,
    group: ColumnGroupSpecifier
): Promise<ColumnDescriptor[]> {
    return core()
        .events.request(
            select(connectionId, V.VIEW_COLUMNS, {
                condition: [
                    {
                        [V.VIEW_ID]: viewId,
                        [V.JOIN_ID]: getJoinIdFromColumnGroup(group),
                    },
                ],
            })
        )
        .then(viewRows => viewRows.map((row: Record<string, any>) => makeColumnDescriptor(row)))
}
const makeColumnDescriptor = (dbRow: Record<string, any>): ColumnDescriptor => {
    return {
        parentColumnId: dbRow[V.COLUMN_ID],
        ...(dbRow[V.FUNCTION] ? { outputFunc: dbRow[V.FUNCTION] } : {}),
        attributes: getCustomAttributes(dbRow),
        id: dbRow[V.ID],
        viewId: dbRow[V.VIEW_ID],
        joinId: dbRow[V.JOIN_ID],
    }
}
/**
 * Get all column descriptors of a view
 */
export async function getAllColumnDescriptors(
    connectionId: string,
    viewId: number
): Promise<ColumnDescriptor[]> {
    const baseSource: ColumnGroupSpecifier = await getViewMetaRow(connectionId, viewId).then(
        getSelectableFromDbRow
    )
    const joins = await getJoinDescriptorsOfView(connectionId, viewId)
    const groups: ColumnGroupSpecifier[] = [baseSource].concat(joins)
    return Promise.all(groups.map(g => getColumnDescriptors(connectionId, viewId, g))).then(
        columnArrays => columnArrays.flat()
    )
}

/**
 * Get the descriptors of all columns that are based on a given column.
 * @param {SelectableType} type The type of selectable that the column belongs to. Since each
 * type has its own columns table, it can happen that there is both a table column and a view
 * column with the given ID. But we can disambiguate if we know what kind of selectable the
 * column belongs to.
 * @param {ParentColumnId} id the ID of the column whose children should be fetched
 */
export async function getChildColumnDescriptors(
    connectionId: string,
    type: SelectableType,
    id: ParentColumnId
): Promise<ColumnDescriptor[]> {
    const knexion = knex({ client: "pg" })
    const query = knexion
        .select("*")
        .from(V.VIEW_COLUMNS)
        .where(function () {
            // columns from the base source: parent column ID = id, joinId = null,
            // source_type = <the type of the selectable that the column is form>
            this.where(V.COLUMN_ID, "=", id)
            this.andWhere(function () {
                this.whereNull(V.JOIN_ID)
            })
            this.andWhere(function () {
                this.whereExists(function () {
                    this.select("*")
                        .from(V.VIEWS)
                        .whereRaw(`${V.VIEWS}.${V.ID}=${V.VIEW_COLUMNS}.${V.VIEW_ID}`)
                        .andWhere(V.SOURCE_TYPE, "=", type)
                })
            })
        })
        .orWhere(function () {
            // columns from a join: if there is a join with the matching ID and source type.
            // We need not explicitly check that joinId != null, because there is no join that
            // has ID null, so the condition will always fail if joinId = null
            this.where(V.COLUMN_ID, "=", id)
            this.andWhere(function () {
                this.whereExists(function () {
                    this.select("*")
                        .from(V.VIEW_JOINS)
                        .whereRaw(`${V.VIEW_JOINS}.${V.ID}=${V.VIEW_COLUMNS}.${V.JOIN_ID}`)
                        .andWhere(V.SOURCE_TYPE, "=", type)
                })
            })
        })
        .toSQL()
    return core()
        .events.request(
            rawQuery(connectionId, {
                sql: query.sql,
                bindings: query.bindings,
            })
        )
        .then(dbResponse =>
            dbResponse.rows.map((row: Record<string, any>) => makeColumnDescriptor(row))
        )
}
/**
 * Get all joins whose `foreignSource` is the given source, so they can be cleaned up when that
 * source is deleted.
 */
export async function getJoinsToSource(
    connectionId: string,
    source: SelectableSpecifier
): Promise<{ join: JoinDescriptor; viewId: ViewId }[]> {
    const rows = (await core().events.request(
        select(connectionId, V.VIEW_JOINS, {
            columns: [V.ID, V.VIEW_ID, V.SOURCE_ID, V.SOURCE_TYPE, V.ON, V.PRE_GROUP],
            condition: [getDbPropsFromSelectable(source)],
        })
    )) as any[]
    return rows.map(r => ({
        join: {
            id: r[V.ID],
            foreignSource: getSelectableFromDbRow(r),
            on: JSON.parse(r[V.ON]),
            preGroup: r[V.PRE_GROUP] === 1,
        },
        viewId: r[V.VIEW_ID],
    }))
}

/**
 * Get all joins that involve the given column, for cleaning them up when the column is
 * deleted.
 */
export async function getJoinsWithColumn(
    connectionId: string,
    type: SelectableType,
    id: ParentColumnId
): Promise<JoinDescriptor[]> {
    /* The conditions are stored in the form
       [23,"=",17] (as a string, not JSON), so we search using a POSIX regex.
       Unfortunately, we again run into the issue of a given column ID being able 
       to exist twice (once for tables, once for views so the actual query ends
       up rather complicated. The regex '\[id,.*' matches conditions where the left column,
       from the base source, has the requisite ID. The regex '.*,id\]' matches conditions where
       the right column, from the foreign source, has that ID. */
    const knexion = knex({ client: "pg" })
    const query = knexion
        .select("j.*")
        .from(`${V.VIEW_JOINS} AS j`)
        .join(`${V.VIEWS} AS v`, `j.${V.VIEW_ID}`, `v.${V.ID}`)
        .where(function () {
            this.where(`v.${V.SOURCE_TYPE}`, "=", type)
            this.andWhere(`j.${V.ON}`, "~", `\\[${id},.*`)
        })
        .orWhere(function () {
            this.where(`j.${V.SOURCE_TYPE}`, "=", type)
            this.andWhere(`j.${V.ON}`, "~", `.*,${id}\\]`)
        })
        .toSQL()

    const rows = (await core()
        .events.request(rawQuery(connectionId, { sql: query.sql, bindings: query.bindings }))
        .then(dbResponse => dbResponse.rows)) as any[]
    return rows.map(r => ({
        id: r[V.ID],
        foreignSource: getSelectableFromDbRow(r),
        on: JSON.parse(r[V.ON]),
        preGroup: r[V.PRE_GROUP] === 1,
    }))
}

/**
 * Get all views whose row options involve the given column, for the purpose of cleaning them
 * up when that column is deleted.
 */
export async function getRowOptionsWithColumn(
    connectionId: string,
    type: SelectableType,
    id: ParentColumnId
): Promise<{ viewId: ViewId; options: RowOptions }[]> {
    // just search for all rows that contain the substring "parentColumnId":<id>. We don't have
    // to worry about the case where the literal version of that string appears (like, as a
    // JSON string) in the row options, because then it would have \" instead of ", and not match.
    const knexion = knex({ client: "pg" })
    const query = knexion
        .select([V.ID, V.ROW_OPTIONS])
        .from(V.VIEWS)
        .where(V.SOURCE_TYPE, "=", type)
        .andWhere(V.ROW_OPTIONS, "~", `"parentColumnId":${id}`)
        .toSQL()
    const rows = (await core()
        .events.request(rawQuery(connectionId, { sql: query.sql, bindings: query.bindings }))
        .then(dbResponse => dbResponse.rows)) as any[]
    return rows.map(r => ({
        viewId: r[V.ID],
        options: JSON.parse(r[V.ROW_OPTIONS]),
    }))
}

// utils
export async function getForeignSource(
    connectionId: string,
    joinId: number
): Promise<SelectableSpecifier> {
    return getJoinMetaRow(connectionId, joinId).then(getSelectableFromDbRow)
}

export async function viewExists(connectionId: string, id: number): Promise<boolean> {
    if (typeof id !== "number") return false
    return core()
        .events.request(
            select(connectionId, V.VIEWS, {
                condition: [V.ID, id],
            })
        )
        .then(r => (<any[]>r).length !== 0)
}
