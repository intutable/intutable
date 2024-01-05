/**
 * Check if two elements have the same elements but not necessarily in the same order.
 * A subset is not considered equal to the superset.
 *
 * Atm comparisons are only made on strings and numbers.
 * Comparing complex objects would be more complicated.
 *
 * The arrays are expected to not contain any nullish values.
 */
export const arraysAreEqual = <T extends string | number>(
    arr1: Array<T>,
    arr2: Array<T>
): boolean => {
    if (arr1.length !== arr2.length) return false

    return arr1.sort().join(",") === arr2.sort().join(",")
}
