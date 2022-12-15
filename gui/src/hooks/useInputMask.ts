import { useView } from "./useView"
import type { UNSAFE_ViewData } from "shared/dist/input-masks"

// row mask => just a differently rendered table, will be used by default if no input mask is provided
// input mask => row mask + additonal features
export const useInputMask = () => {
    const { data: view } = useView()

    return {
        inputMasks: view ? (view as unknown as UNSAFE_ViewData).inputMasks : [],
    }
}
