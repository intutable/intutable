import { Column } from "types"
import { Text } from "@datagrid/Cells/components/Text"
import { useEffect, useState } from "react"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"

export type CreateColumnFactoryProps = Pick<
    Column.Serialized,
    "name" | "cellType"
>

// properties that can be set programmatically from the frontend
export type SettableColumnProps = keyof Omit<
    Column.Serialized,
    "key" | "id" | "isUserPrimaryKey" | "index"
>

// properties that the user can set directly & arbitrarily
export type UserSettableColumnProps = Exclude<
    SettableColumnProps,
    "kind" | "minWidth" | "maxWidth"
>

export class ColumnFactory {
    static readonly DEFAULT_COLUMN: Pick<
        Column.Serialized,
        SettableColumnProps
    > = {
        name: "",
        kind: "standard",
        hidden: false,
        cellType: new Text().brand,
        width: undefined,
        minWidth: undefined,
        maxWidth: undefined,
        cellClass: undefined,
        headerCellClass: undefined,
        summaryCellClass: undefined,
        summaryFormatter: undefined,
        groupFormatter: undefined,
        editable: true,
        colSpan: undefined,
        frozen: false,
        resizable: true,
        sortable: true,
        sortDescendingFirst: false,
    }
    static readonly USER_DEFAULT_COLUMN: Pick<
        Column.Serialized,
        UserSettableColumnProps
    > = {
        name: "",
        hidden: false,
        cellType: new Text().brand,
        width: undefined,
        cellClass: undefined,
        headerCellClass: undefined,
        summaryCellClass: undefined,
        summaryFormatter: undefined,
        groupFormatter: undefined,
        editable: true,
        colSpan: undefined,
        frozen: false,
        resizable: true,
        sortable: true,
        sortDescendingFirst: false,
    }

    constructor(private initialColumnProps: CreateColumnFactoryProps) {}

    public create(): Pick<Column.Serialized, SettableColumnProps> {
        return {
            ...ColumnFactory.DEFAULT_COLUMN,
            ...this.initialColumnProps,
        }
    }

    /**
     * Here is some space for further modifications. Scenarios could be:
     * • Manage what properties can be changed, especially if they are restricted in any way
     * • …
     *
     * The class intendens to be instantiated at the highest possible level (e.g. some component),
     * at then passed down to the lowest possible level (e.g. a hook).
     * The necessary properties are then passed down through network requests (by `properties` property).
     */
}

/**
 * Hook for creating a new column.
 */
export const useColumnFactory = () => {
    const { snackError } = useSnacki()
    const { createColumn: _createColumn } = useColumn()

    const [initialColumnProps, setInitialColumnProps] =
        useState<CreateColumnFactoryProps>({
            name: ColumnFactory.USER_DEFAULT_COLUMN.name,
            cellType: ColumnFactory.USER_DEFAULT_COLUMN.cellType,
        })

    const [valid, setValid] = useState(false)
    useEffect(() => {
        if (initialColumnProps.name.length > 0) setValid(true)
    }, [initialColumnProps.name])

    const request = async () => {
        try {
            const column = new ColumnFactory(initialColumnProps)
            await _createColumn(column)
        } catch (error) {
            snackError("Die Spalte konnte nicht erstellt werden!")
        }
    }

    const setProperty = <T extends keyof CreateColumnFactoryProps>(
        option: T,
        value: CreateColumnFactoryProps[T]
    ) => {
        setInitialColumnProps(prev => ({
            ...prev,
            [option]: value,
        }))
    }

    return {
        valid,
        initialColumnProps,
        request,
        setProperty,
    }
}
