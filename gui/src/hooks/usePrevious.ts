import { useEffect, useRef } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePrevious = <T>(value: T) => {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current === undefined ? null : ref.current
}
