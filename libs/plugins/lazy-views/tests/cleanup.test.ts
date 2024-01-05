/**
 * Testing robust deletion: If a table, view, column, or join is deleted, then
 * data that depend on it should also be cleaned up.
 */
import path from "path"
import { Core, EventSystem, CoreRequest } from "core"
import { openConnection, closeConnection } from "@intutable/database/dist/requests"
import { ColumnType } from "@intutable/database/dist/types"
import {
    ProjectDescriptor,
    ColumnDescriptor as PM_Column,
} from "@intutable/project-management/dist/types"
import * as db from "@intutable/database/dist/requests"
import * as pm from "@intutable/project-management/dist/requests"
import * as req from "../src/requests"
import { V } from "../src/meta"
import {
    TableDescriptor,
    ViewDescriptor,
    ColumnInfo,
    JoinDescriptor,
    ViewInfo,
    RowOptions,
    ParentColumnSpecifier,
} from "../src/types"
import { ConditionKind, OperandKind } from "../src/types/condition"
import * as selectable from "../src/selectable"
import { EMPTY_ROW_OPTIONS } from "./setup"

let DB_CONN_ID: string
const USER_ID = 1
const PROJECT_NAME = "sourceTestProject"
let PROJECT: ProjectDescriptor

let core: Core
function coreRequest<Result = unknown>(request: CoreRequest): Promise<Result> {
    return core.events.request(request) as Promise<Result>
}

beforeAll(async () => {
    core = await Core.create(
        [path.join(__dirname, "../node_modules/@intutable/*"), path.join(__dirname, "..")],
        new EventSystem(false)
    )
    const open = (await core.events.request(openConnection("admin", "admin"))) as {
        connectionId: string
    }
    DB_CONN_ID = open.connectionId
    PROJECT = await core.events.request(pm.createProject(DB_CONN_ID, USER_ID, PROJECT_NAME))
})

afterAll(async () => {
    await core.events.request(pm.removeProject(DB_CONN_ID, PROJECT.id))
    await core.events.request(closeConnection(DB_CONN_ID))
    await core.plugins.closeAll()
})

describe("clean up views depending on a table/view when it is deleted", () => {
    // a table with a view on it and a view on top of that.
    let table: TableDescriptor
    let tableView: ViewDescriptor
    let viewView: ViewDescriptor

    beforeAll(async () => {
        table = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Table")
        )
        tableView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(table.id),
                "tableView",
                { columns: [], joins: [] },
                EMPTY_ROW_OPTIONS
            )
        )
        viewView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.viewId(tableView.id),
                "viewView",
                { columns: [], joins: [] },
                EMPTY_ROW_OPTIONS
            )
        )
    })
    test("deleting table causes view to be deleted", async () => {
        const viewRows = await core.events.request(
            db.select(DB_CONN_ID, V.VIEWS, {
                condition: [V.ID, "in", [tableView.id, viewView.id]],
            })
        )
        expect(viewRows.length).toBe(2)
        await core.events.request(pm.removeTable(DB_CONN_ID, table.id))
        // have to wait since the notification stuff is async
        const noViewRows = await core.events.request(
            db.select(DB_CONN_ID, V.VIEWS, {
                condition: [V.ID, "in", [tableView.id, viewView.id]],
            })
        )
        expect(noViewRows.length).toBe(0)
    })
})

describe("clean up join depending on a table when table is deleted", () => {
    let foreignTable: TableDescriptor
    let joiningTable: TableDescriptor
    let joiningView: ViewDescriptor

    beforeAll(async () => {
        foreignTable = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Table")
        )
        let tableColumns = (await core.events.request(
            pm.getColumnsFromTable(DB_CONN_ID, foreignTable.id)
        )) as PM_Column[]
        let idColumn = tableColumns.find(c => c.name === "_id")!

        joiningTable = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Joining Table", [
                { name: "fk#1", type: ColumnType.integer },
            ])
        )
        let joiningTableColumns = (await core.events.request(
            pm.getColumnsFromTable(DB_CONN_ID, joiningTable.id)
        )) as PM_Column[]
        let fkColumn = joiningTableColumns.find(c => c.name === "fk#1")!

        joiningView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(joiningTable.id),
                "Joining View",
                {
                    columns: [],
                    joins: [
                        {
                            foreignSource: selectable.tableId(foreignTable.id),
                            on: [fkColumn.id, "=", idColumn.id],
                            columns: [],
                        },
                    ],
                },
                EMPTY_ROW_OPTIONS
            )
        )
    })
    test("join is gone after table is deleted", async () => {
        let joiningViewInfo: ViewInfo = await core.events.request(
            req.getViewInfo(DB_CONN_ID, joiningView.id)
        )
        expect(joiningViewInfo.joins.length).toBe(1)

        await core.events.request(pm.removeTable(DB_CONN_ID, foreignTable.id))
        joiningViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, joiningView.id))
        expect(joiningViewInfo.joins.length).toBe(0)
    })
    afterAll(async () => {
        await core.events.request(pm.removeTable(DB_CONN_ID, joiningTable.id))
    })
})

describe("columns deleted when their source is deleted", () => {
    /** For testing if child columns are cleaned up properly */
    let table: TableDescriptor
    let tableColumn: PM_Column
    let tableView: ViewDescriptor
    let viewView: ViewDescriptor

    /** For testing if joins are cleaned up properly */
    let joiningTable: TableDescriptor
    let joiningView: ViewDescriptor

    /** For testing if row options are cleaned up properly */
    // A set of row options whose conditions, sortings, and groupings all include the
    // specified column, plus a control column that will not be deleted
    let rowOptionsBeforeCleanup: RowOptions
    let rowOptionsAfterCleanup: RowOptions
    function createDenseRowOptions(
        columnToBeCleanedUp: ParentColumnSpecifier,
        columnToStay: ParentColumnSpecifier
    ): RowOptions {
        return {
            conditions: [
                {
                    kind: ConditionKind.Infix,
                    left: {
                        kind: OperandKind.Column,
                        column: columnToBeCleanedUp,
                    },
                    operator: "=",
                    right: {
                        kind: OperandKind.Literal,
                        value: "testing",
                    },
                },
                {
                    kind: ConditionKind.Infix,
                    left: {
                        kind: OperandKind.Column,
                        column: columnToStay,
                    },
                    operator: "=",
                    right: {
                        kind: OperandKind.Literal,
                        value: "development",
                    },
                },
            ],
            groupColumns: [columnToBeCleanedUp, columnToStay],
            sortColumns: [{ column: columnToBeCleanedUp }, { column: columnToStay }],
        }
    }

    // These are the row options that should remain after the
    function createStrippedRowOptions(columnToStay: ParentColumnSpecifier): RowOptions {
        return {
            conditions: [
                {
                    kind: ConditionKind.Infix,
                    left: {
                        kind: OperandKind.Column,
                        column: columnToStay,
                    },
                    operator: "=",
                    right: {
                        kind: OperandKind.Literal,
                        value: "development",
                    },
                },
            ],
            groupColumns: [columnToStay],
            sortColumns: [{ column: columnToStay }],
        }
    }

    beforeAll(async () => {
        table = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Table")
        )
        tableColumn = await core.events.request(
            pm.createColumnInTable(DB_CONN_ID, table.id, "cleanup", ColumnType.string)
        )
        const controlColumn = await core.events
            .request(pm.getColumnsFromTable(DB_CONN_ID, table.id))
            .then((columns: PM_Column[]) => columns.find(c => c.name === "_id")!)
        rowOptionsBeforeCleanup = createDenseRowOptions(
            { parentColumnId: tableColumn.id, joinId: null },
            { parentColumnId: controlColumn.id, joinId: null }
        )
        rowOptionsAfterCleanup = createStrippedRowOptions({
            parentColumnId: controlColumn.id,
            joinId: null,
        })

        // This view will have one column and some of its row options cleaned up when
        // `tableColumn` is deleted from `table.
        tableView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(table.id),
                "tableView",
                { columns: [], joins: [] },
                rowOptionsBeforeCleanup
            )
        )
        viewView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.viewId(tableView.id),
                "viewView",
                { columns: [], joins: [] },
                EMPTY_ROW_OPTIONS
            )
        )

        // Table that joins to `table`, with `tableColumn` in the condition, and whose join will
        // be cleaned up when `tableColumn` is deleted.
        joiningTable = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Joining Table", [
                { name: "fk#1", type: ColumnType.string },
            ])
        )
        const joiningTableColumns: PM_Column[] = await core.events.request(
            pm.getColumnsFromTable(DB_CONN_ID, joiningTable.id)
        )
        const foreignKeyColumn = joiningTableColumns.find(c => c.name === "fk#1")!

        joiningView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(joiningTable.id),
                "joiningView",
                {
                    columns: [],
                    joins: [
                        {
                            foreignSource: selectable.tableId(table.id),
                            on: [foreignKeyColumn.id, "=", tableColumn.id],
                            columns: [],
                        },
                    ],
                },
                EMPTY_ROW_OPTIONS
            )
        )
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, joiningView.id))
        await core.events.request(pm.removeTable(DB_CONN_ID, joiningTable.id))
        await core.events.request(req.deleteView(DB_CONN_ID, viewView.id))
        await core.events.request(req.deleteView(DB_CONN_ID, tableView.id))
        await core.events.request(pm.removeTable(DB_CONN_ID, table.id))
    })
    test("deleting table column causes view columns and joins to disappear", async () => {
        let tableViewInfo: ViewInfo
        let viewViewInfo: ViewInfo
        let joiningViewInfo: ViewInfo
        tableViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, tableView.id))
        viewViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, viewView.id))
        joiningViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, joiningView.id))
        expect(tableViewInfo.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "cleanup",
                }),
            ])
        )
        expect(tableViewInfo.rowOptions).toEqual(rowOptionsBeforeCleanup)
        expect(viewViewInfo.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "cleanup",
                }),
            ])
        )
        expect(joiningViewInfo.joins.length).toBe(1)
        await core.events.request(pm.removeColumn(DB_CONN_ID, tableColumn.id))
        tableViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, tableView.id))
        viewViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, viewView.id))
        joiningViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, joiningView.id))
        expect(tableViewInfo.columns).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "cleanup",
                }),
            ])
        )
        expect(tableViewInfo.rowOptions).toEqual(rowOptionsAfterCleanup)
        expect(viewViewInfo.columns).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "cleanup",
                }),
            ])
        )
        expect(joiningViewInfo.joins.length).toBe(0)
    })
})

describe("clean up objects dependent on a join when deleting it", () => {
    let homeTable: TableDescriptor
    let foreignTable: TableDescriptor
    let homeView: ViewDescriptor

    beforeAll(async () => {
        foreignTable = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Departments")
        )
        const foreignTableColumns = (await core.events.request(
            pm.getColumnsFromTable(DB_CONN_ID, foreignTable.id)
        )) as PM_Column[]
        const foreignIdColumn = foreignTableColumns.find(c => c.name === "_id")!

        homeTable = await core.events.request(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, "Staff")
        )
        const fkColumn = await core.events.request(
            pm.createColumnInTable(DB_CONN_ID, homeTable.id, "Department", ColumnType.integer)
        )
        homeView = await core.events.request(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(homeTable.id),
                "tableView",
                {
                    columns: [],
                    joins: [
                        {
                            foreignSource: selectable.tableId(foreignTable.id),
                            on: [fkColumn.id, "=", foreignIdColumn.id],
                            columns: foreignTableColumns.map(c => ({
                                parentColumnId: c.id,
                                attributes: {},
                            })),
                        },
                    ],
                },
                EMPTY_ROW_OPTIONS
            )
        )
    })
    afterAll(async () => {
        await core.events.request(pm.removeTable(DB_CONN_ID, homeTable.id))
        await core.events.request(pm.removeTable(DB_CONN_ID, foreignTable.id))
    })

    test("foreign columns disappear after deleting join", async () => {
        let homeViewInfo: ViewInfo = await core.events.request(
            req.getViewInfo(DB_CONN_ID, homeView.id)
        )
        expect(homeViewInfo.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    joinId: expect.any(Number),
                }),
            ])
        )
        await core.events.request(req.removeJoinFromView(DB_CONN_ID, homeViewInfo.joins[0].id))
        homeViewInfo = await core.events.request(req.getViewInfo(DB_CONN_ID, homeView.id))
        expect(homeViewInfo.columns).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    joinId: expect.any(Number),
                }),
            ])
        )
    })
})

/**
 * Pretty specific. The situation is we have a table t2 with a view v2 based on it. Then we have
 * a table and view t1 and v1, and a join from v1 to v2. Now, if v1 has a column c1 based on
 * a column c3 from v2, then the source type of c1's view is a table, but its source column is
 * actually a view column. Our current (2023-02-14) implementation misses c1 in this case,
 * so here's a test to verify that it is fixed.
 */
describe("foreign columns cleaned up with parent columns, even with different source types", () => {
    let homeName = "Employees"
    let homeTable: TableDescriptor
    let homeView: ViewDescriptor
    let homeViewInfo: ViewInfo

    let foreignName = "Departments"
    let foreignTable: TableDescriptor
    let foreignView: ViewDescriptor
    let foreignAddressColumn: ColumnInfo

    let join: JoinDescriptor

    beforeAll(async () => {
        homeTable = await coreRequest<TableDescriptor>(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, homeName)
        )
        homeView = await coreRequest<ViewDescriptor>(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(homeTable.id),
                homeName,
                { columns: [], joins: [] },
                EMPTY_ROW_OPTIONS
            )
        )

        foreignTable = await coreRequest<TableDescriptor>(
            pm.createTableInProject(DB_CONN_ID, USER_ID, PROJECT.id, foreignName)
        )
        foreignView = await coreRequest<ViewDescriptor>(
            req.createView(
                DB_CONN_ID,
                selectable.tableId(foreignTable.id),
                foreignName,
                { columns: [], joins: [] },
                EMPTY_ROW_OPTIONS
            )
        )
        const addressTableColumn = await coreRequest<PM_Column>(
            pm.createColumnInTable(DB_CONN_ID, foreignTable.id, "address")
        )
        foreignAddressColumn = await coreRequest<ColumnInfo>(
            req.addColumnToView(DB_CONN_ID, foreignView.id, {
                parentColumnId: addressTableColumn.id,
                attributes: {},
            })
        )

        // add join between the views
        const fkColumn = await coreRequest<PM_Column>(
            pm.createColumnInTable(DB_CONN_ID, homeTable.id, "dept_fk", ColumnType.integer)
        )
        const foreignIdColumn = await coreRequest<ViewInfo>(
            req.getViewInfo(DB_CONN_ID, foreignView.id)
        ).then(info => info.columns.find(c => c.name === "_id")!)
        join = await coreRequest<JoinDescriptor>(
            req.addJoinToView(DB_CONN_ID, homeView.id, {
                foreignSource: selectable.viewId(foreignView.id),
                on: [fkColumn.id, "=", foreignIdColumn.id],
                columns: [{ parentColumnId: foreignAddressColumn.id, attributes: {} }],
            })
        )
        homeViewInfo = await coreRequest<ViewInfo>(req.getViewInfo(DB_CONN_ID, homeView.id))
        expect(homeViewInfo.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    parentColumnId: foreignAddressColumn.id,
                    joinId: join.id,
                    name: foreignAddressColumn.name,
                }),
            ])
        )
    })
    afterAll(async () => {
        await coreRequest(pm.removeTable(DB_CONN_ID, homeTable.id))
        await coreRequest(pm.removeTable(DB_CONN_ID, foreignTable.id))
    })
    test("join column is gone after deletion of its parent column in the other view", async () => {
        await coreRequest(req.removeColumnFromView(DB_CONN_ID, foreignAddressColumn.id))
        homeViewInfo = await coreRequest<ViewInfo>(req.getViewInfo(DB_CONN_ID, homeView.id))
        expect(homeViewInfo.columns).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    parentColumnId: foreignAddressColumn.id,
                    joinId: join.id,
                    name: foreignAddressColumn.name,
                }),
            ])
        )
    })
})
