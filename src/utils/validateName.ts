export const isValidName = (name: string): true | Error => {
    const letters = /^[a-zA-Z]+$/
    if (!letters.test(name)) return new Error("The Name must contain only letters!")
    return true
}
export const prepareName = (name: string): string => name.trim()
