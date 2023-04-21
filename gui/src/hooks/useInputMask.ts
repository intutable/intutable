import type { UNSAFE_ViewData } from "@shared/input-masks"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "./useView"

// const overrideColumns = (columns: Column[], inputMask: InputMask): Column[] => {
//     const original = view.columns

//     return view
// }

// row mask => just a differently rendered table, will be used by default if no input mask is provided
// input mask => row mask + additonal features
/** @deprecated */
export const useInputMask = () => {
    const { data } = useView()
    const { inputMask } = useRowMask()

    const view = data ? (data as unknown as UNSAFE_ViewData) : null
    const inputMasks = view ? view.inputMasks : []
    // const columns = view ? overrideColumns(view., currentInputMask) : null

    // const overriden: ViewData | null = currentInputMask ? overrideColumns(view.columns, currentInputMask) : null

    // TODO: maybe kick of the input masks from the view
    // TODO: fetch them based on the view here
    // TODO: dont let them revalidate, since they are read only

    return {
        inputMasks,
        /** @deprecated Use `inputMask` from `useRowMask` instead */
        currentInputMask: inputMask,
        // columns,
    }
}
