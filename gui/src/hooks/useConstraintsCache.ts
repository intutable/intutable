import { ConstraintMismatch } from "context/ConstraintsContext"
import { useMemo, useRef } from "react"

export const useConstraintsCache = () => {
    // const cache = useMemo(() => new Map<ConstraintMismatch["key"], ConstraintMismatch>(), [])
    const cache = useRef(new Map<ConstraintMismatch["key"], ConstraintMismatch>())
    const clear = () => cache.current.clear()

    const addConstraintMismatch = (...mismatches: ConstraintMismatch[]) =>
        mismatches.forEach(mismatch => {
            cache.current.set(mismatch.key, mismatch)
        })

    const removeConstraintMismatch = (...keys: ConstraintMismatch["key"][]) =>
        keys.forEach(key => {
            cache.current.delete(key)
        })

    const constraintMismatches: ConstraintMismatch[] = useMemo(
        () => Array.from(cache.current.values()),
        [cache]
    )

    return {
        constraintMismatches,
        addConstraintMismatch,
        removeConstraintMismatch,
        clear,
    }
}
