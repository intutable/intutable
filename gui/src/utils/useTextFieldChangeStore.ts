import { useState } from "react"

/** For controlled inputs whose states get saved in a db */
export const useTextFieldChangeStore = <T>(initialValue: T) => {
    const [value, setValue] = useState<T>(initialValue)

    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value as T)
    }

    return {
        value,
        onChangeHandler,
    }
}
