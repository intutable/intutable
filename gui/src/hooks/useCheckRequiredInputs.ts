import { InputMask } from "@shared/input-masks/types"
import { isColumnIdOrigin } from "@shared/input-masks/utils"
import { useRowMask } from "context/RowMaskContext"
import { useEffect, useMemo, useState } from "react"
import { Row } from "types"
import { Column } from "types/tables/rdg"
import { useInputMask } from "./useInputMask"
import { useView } from "./useView"

const getRequiredInputsInInputMask = (inputMask: InputMask, columns: Column[]): Column[] =>
    columns.filter(column => {
        const columnSpecification = inputMask.columnProps.find(spec =>
            isColumnIdOrigin(spec.origin) ? spec.origin.id === column.id : spec.origin.name === column.name
        )
        if (columnSpecification == null) return false

        return columnSpecification.inputRequired === true
    })

const getValuesOfColumns = (columns: Column[], row: Row): { columnName: string; value: unknown }[] => {
    const values: { columnName: string; value: unknown }[] = []
    columns.forEach(column => {
        const value = row[column.key]
        values.push({ value, columnName: column.name as string })
    })
    return values
}

const isEmptyValue = (value: unknown): boolean => value == null || value === ""

// use this if you don't want to or can't use the hook
export const checkRequiredInputs = (inputMask: InputMask, row: Row, columns: Column[]): string[] => {
    const requiredInputs = getRequiredInputsInInputMask(inputMask, columns)
    const valuesOfRequiredInputs = getValuesOfColumns(requiredInputs, row)
    return valuesOfRequiredInputs.filter(({ value }) => isEmptyValue(value)).map(({ columnName }) => columnName)
}

export const useCheckRequiredInputs = () => {
    const { currentInputMask } = useInputMask()
    const { rowMaskState } = useRowMask()
    const { data: view } = useView()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const missingInputs = useMemo(() => {
        // try {
        if (currentInputMask && rowMaskState.mode === "edit") {
            // setIsLoading(true)
            if (view == null) throw new Error("Could not load view when checking required inputs.")
            const row = view.rows.find(row => row._id === rowMaskState.row._id)
            if (row == null) throw new Error("Could not find row when checking required inputs.")

            return checkRequiredInputs(currentInputMask, row, view.columns)
        } else return []
        // } catch (error) {
        //     setError(error as Error)
        //     return []
        // } finally {
        //     setIsLoading(false)
        // }
    }, [currentInputMask, rowMaskState, view])

    return {
        isValid: missingInputs.length === 0,
        missingInputs: missingInputs,
        isLoading,
        error,
    }
}
