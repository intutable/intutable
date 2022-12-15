import { useView } from "./useView"
import type { UNS } from "shared/dist/input-masks/types"

// row mask => just a differently rendered table, will be used by default if no input mask is provided
// input mask => row mask + additonal features
export const useInputMask = () => {
    const { data: view } = useView()

    return {
        inputMaks: view ? (view as UNSAFE_ViewData).inputMasks : [],
    }
}
