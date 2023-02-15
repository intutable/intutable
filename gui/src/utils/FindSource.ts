import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import {
    isTableIdOrigin,
    isTableNameOrigin,
    isViewIdOrigin,
    isViewNameOrigin,
    TableOrigin,
    ViewOrigin,
} from "@shared/input-masks/utils"
import { ViewData } from "types/tables/rdg"

export type FindSourceTree = Array<{
    project: ProjectDescriptor
    tables: Array<{
        table: ViewDescriptor
        views: Array<ViewDescriptor>
    }>
}>

export type BuildTreeProps = {
    fetchProjectsCallback: () => Promise<ProjectDescriptor[]>
    fetchTablesCallback: (projectId: number) => Promise<ViewDescriptor[]>
    fetchViewsCallback: (tableId: number) => Promise<ViewDescriptor[]>
}

export class FindSource {
    /**
     * It is really painful to find the source of a table or view when you don't have more information than its name or id.
     * This class helps.
     *
     * You can also use the tree for debugging or creating input masks.
     *
     * @param projects all projects
     * @param tables all tables across all projects (!)
     * @param views all views across all tables across all projects (!)
     */
    constructor(public tree: FindSourceTree) {}

    public sourceOfTable(table: ViewDescriptor | TableOrigin): ProjectDescriptor | null {
        if (FindSource.isViewDescriptor(table))
            return (
                this.tree.find(project =>
                    project.tables.find(tableWithViews => tableWithViews.table.id === table.id)
                )?.project ?? null
            )

        if (isTableIdOrigin(table))
            return (
                this.tree.find(project =>
                    project.tables.find(tableWithViews => tableWithViews.table.id === table.tableId)
                )?.project ?? null
            )

        if (isTableNameOrigin(table))
            return (
                this.tree.find(
                    projectWithTables => projectWithTables.project.id === table.projectId
                )?.project ?? null
            )

        throw new Error("Could not read parameter 'table'!")
    }

    public sourceOfView(
        view: ViewDescriptor | ViewOrigin
    ): { project: ProjectDescriptor; table: ViewDescriptor } | null {
        if (FindSource.isViewDescriptor(view)) {
            let found: { project: ProjectDescriptor; table: ViewDescriptor } | null = null
            this.tree.find(projectWithTables =>
                projectWithTables.tables.find(tableWithViews =>
                    tableWithViews.views.find(v => {
                        if (v.id === view.id) {
                            found = {
                                project: projectWithTables.project,
                                table: tableWithViews.table,
                            }
                            return true
                        }
                        return false
                    })
                )
            )
            return found
        }

        if (isViewIdOrigin(view)) {
            let found: { project: ProjectDescriptor; table: ViewDescriptor } | null = null
            this.tree.find(projectWithTables =>
                projectWithTables.tables.find(tableWithViews =>
                    tableWithViews.views.find(v => {
                        if (v.id === view.viewId) {
                            found = {
                                project: projectWithTables.project,
                                table: tableWithViews.table,
                            }
                            return true
                        }
                        return false
                    })
                )
            )
            return found
        }

        if (isViewNameOrigin(view)) {
            const projectWithTables = this.tree.find(
                projectWithTables => projectWithTables.project.id === view.projectId
            )
            const table = projectWithTables?.tables.find(
                tableWithViews => tableWithViews.table.name === view.viewsTableName
            )?.table
            return table ? { project: projectWithTables.project, table } : null
        }

        throw new Error("Could not read parameter 'view'!")
    }

    public descriptorForTableOrigin(origin: TableOrigin): ViewDescriptor | null {
        if (isTableIdOrigin(origin)) {
            let found: ViewDescriptor | null = null
            this.tree.find(projectWithTables =>
                projectWithTables.tables.find(tableWithViews => {
                    if (tableWithViews.table.id === origin.tableId) {
                        found = tableWithViews.table
                        return true
                    }
                    return false
                })
            )
            return found
        }

        if (isTableNameOrigin(origin)) {
            const projectWithTables = this.tree.find(
                projectWithTables => projectWithTables.project.id === origin.projectId
            )
            return (
                projectWithTables?.tables.find(
                    tableWithViews => tableWithViews.table.name === origin.tableName
                )?.table ?? null
            )
        }

        throw new Error("Could not read parameter 'origin'!")
    }

    public descriptorForViewOrigin(origin: ViewOrigin): ViewDescriptor | null {
        if (isViewIdOrigin(origin)) {
            let found: ViewDescriptor | null = null
            this.tree.find(projectWithTables =>
                projectWithTables.tables.find(tableWithViews =>
                    tableWithViews.views.find(v => {
                        if (v.id === origin.viewId) {
                            found = v
                            return true
                        }
                        return false
                    })
                )
            )
            return found
        }

        if (isViewNameOrigin(origin)) {
            const projectWithTables = this.tree.find(
                projectWithTables => projectWithTables.project.id === origin.projectId
            )
            const table = projectWithTables?.tables.find(
                tableWithViews => tableWithViews.table.name === origin.viewsTableName
            )?.table
            return table
                ? projectWithTables.tables
                      .find(tableWithViews => tableWithViews.table.id === table.id)
                      ?.views.find(v => v.name === origin.viewName) ?? null
                : null
        }

        throw new Error("Could not read parameter 'origin'!")
    }

    static async buildTree(props: BuildTreeProps): Promise<FindSource> {
        const projects = await Promise.all(await props.fetchProjectsCallback())

        const projectsWithTables = await Promise.all(
            projects.map(async project => ({
                project,
                tables: await props.fetchTablesCallback(project.id),
            }))
        )

        const projectsWithTablesWithViews: FindSourceTree = await Promise.all(
            projectsWithTables.map(async projectWithTables => {
                const tables = projectWithTables.tables

                const tablesWithViews = await Promise.all(
                    tables.map(async table => ({
                        table,
                        views: await props.fetchViewsCallback(table.id),
                    }))
                )

                return {
                    project: projectWithTables.project,
                    tables: tablesWithViews,
                }
            })
        )

        return new FindSource(projectsWithTablesWithViews)
    }

    /** Type Guard for ViewDescriptor type */
    static isViewDescriptor(value: unknown): value is ViewDescriptor {
        return (
            Object.prototype.hasOwnProperty.call(value, "id") &&
            Object.prototype.hasOwnProperty.call(value, "name")
        )
    }
}
