import { JtInfo } from "@intutable/join-tables/dist/types"

/**
 * When linking tables, we need a foreign key column. This function creates
 * a unique name for that column.
 */
export default function makeForeignKeyName(jtInfo: JtInfo){
    // We pick a number greater than any join so far's ID...
    const nextJoinIndex = Math.max(0, ...jtInfo.joins.map(j => j.id)) + 1
    // and add a special character so that there can't be clashes with
    // user-added columns (see ./sanitizeName)
    const fkColumnName = `j#${nextJoinIndex}_fk`
    return fkColumnName
}
