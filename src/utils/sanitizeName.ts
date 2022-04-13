/** Reduce a table/column/whatever name to a DB-safe ascii string */
export default function sanitizeName(name: string): string {
    return name
        .split("")
        .map(spaceToUnderscore)
        .map(c => c.toLowerCase())
        .filter(isSimple)
        .join("")
}

function spaceToUnderscore(char: string): string {
    if (char.length !== 1) {
        throw TypeError(`expected single char, got: ${char}`)
    } else {
        return char.match(/^\s$/) ? "_" : char
    }
}

function isSimple(char: string): boolean {
    if (char.length !== 1) {
        throw TypeError(`expected single char, got: ${char}`)
    } else {
        return !!char.match(/^[a-zA-Z0-9-_]$/)
    }
}
