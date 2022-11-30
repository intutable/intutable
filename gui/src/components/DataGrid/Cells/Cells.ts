import { Column } from "types"
import { ColumnFactory } from "utils/column utils/ColumnFactory"
import { Cell } from "./abstract/Cell"

export type CellCtor = typeof Cell

export class CellMap extends Map<string, CellCtor> {
    constructor(...cells: CellCtor[]) {
        super(cells.map(cell => [cell.brand, cell]))
        // debug
        CellMap._checkForDuplicateBrands(...cells)
    }

    public getCellCtor(brand: string): CellCtor {
        const ctor = this.get(brand)
        if (ctor == null) throw new Error(`No cell found for brand '${brand}'`)
        return ctor
    }

    public getBrands(): string[] {
        return Array.from(this.keys())
    }

    public getCtors(): CellCtor[] {
        return Array.from(this.values())
    }

    public getLabels(column: Column.Serialized | "suppress" = "suppress"): string[] {
        const _column = column === "suppress" ? ColumnFactory.createDummy() : column
        const instances = Array.from(this.values()).map(ctor => new ctor(_column))
        return instances.map(cell => cell.label)
    }

    public getBrandLabelMap(column: Column.Serialized | "suppress" = "suppress"): { brand: string; label: string }[] {
        const _column = column === "suppress" ? ColumnFactory.createDummy() : column
        return Array.from(this.entries()).map(([brand, ctor]) => ({ brand, label: new ctor(_column).label }))
    }

    /** E.g. when you only want to get some properties that do no rely on explicit column information (such as the label or icon)  */
    public unsafe_instantiateDummyCell<T extends Cell>(brand: string): T {
        const ctor = this.getCellCtor(brand)
        return new ctor(ColumnFactory.createDummy()) as T
    }

    // TODO: maybe mount the instance to the deserialized column instead
    public instantiate(column: Column.Serialized | Column.Deserialized): Cell {
        const serialized = "__serialized" in column ? column.__serialized : column
        const ctor = this.getCellCtor(serialized.cellType)
        return new ctor(serialized)
    }

    /**
     * This utility is used for debugging.
     * Since each `brand` value is just overriden,
     * you can easily forget to set a new value.
     */
    private static _checkForDuplicateBrands(...cells: CellCtor[]): void {
        const brands = cells.map(cell => cell.brand)
        const uniqueBrands = new Set(brands)
        if (brands.length !== uniqueBrands.size)
            throw new Error(`Duplicate brands found: ${brands.filter(brand => !uniqueBrands.has(brand))}`)
    }
}
