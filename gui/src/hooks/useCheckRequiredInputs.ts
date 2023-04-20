import { InputMask } from "@shared/input-masks/types"
import { isColumnIdOrigin } from "@shared/input-masks/utils"
import { useRowMask } from "context/RowMaskContext"
import { useMemo, useState } from "react"
import { Row } from "types"
import { Column } from "types/tables/rdg"
import { useView } from "./useView"

const getRequiredInputsInInputMask = (inputMask: InputMask, columns: Column[]): Column[] =>
    columns.filter(column => {
        const columnSpecification = inputMask.columnProps.find(spec =>
            isColumnIdOrigin(spec.origin)
                ? spec.origin.id === column.id
                : spec.origin.name === column.name
        )
        if (columnSpecification == null) return false

        return columnSpecification.inputRequired === true
    })

const getValuesOfColumns = (
    columns: Column[],
    row: Row
): { columnName: string; value: unknown }[] => {
    const values: { columnName: string; value: unknown }[] = []
    columns.forEach(column => {
        const value = row[column.key]
        values.push({ value, columnName: column.name as string })
    })
    return values
}

const isEmptyValue = (value: unknown): boolean => value == null || value === ""

// use this if you don't want to or can't use the hook
export const checkRequiredInputs = (
    inputMask: InputMask,
    row: Row,
    columns: Column[]
): string[] => {
    const requiredInputs = getRequiredInputsInInputMask(inputMask, columns)
    const valuesOfRequiredInputs = getValuesOfColumns(requiredInputs, row)
    return valuesOfRequiredInputs
        .filter(({ value }) => isEmptyValue(value))
        .map(({ columnName }) => columnName)
}

export const useCheckRequiredInputs = () => {
    const { row, inputMask } = useRowMask()
    const { data: view } = useView()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const missingInputs = useMemo(() => {
        // try {
        if (inputMask && row && view) {
            // setIsLoading(true)
            return checkRequiredInputs(inputMask, row, view.columns)
        } else return []
        // } catch (error) {
        //     setError(error as Error)
        //     return []
        // } finally {
        //     setIsLoading(false)
        // }
    }, [inputMask, row, view])

    return {
        isValid: missingInputs.length === 0,
        missingInputs: missingInputs,
        isLoading,
        error,
    }
}
