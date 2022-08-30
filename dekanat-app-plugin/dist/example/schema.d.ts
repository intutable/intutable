/**
 * Specifications of example data.
 */
import { Column, ColumnType, ColumnOption } from "@intutable/database/dist/column";
import { TableDescriptor, ViewDescriptor } from "@intutable/lazy-views/dist/types";
export declare const PK_COLUMN = "_id";
export declare type JoinSpec = {
    table: string;
    fkColumn: Column;
    pkColumn: string;
    linkColumns: {
        name: string;
        attributes: Record<string, any>;
    }[];
};
export declare type TableSpec = {
    name: string;
    columns: {
        baseColumn: Column;
        attributes: Record<string, any>;
    }[];
    joins: JoinSpec[];
};
export declare type Table = {
    baseTable: TableDescriptor;
    tableView: ViewDescriptor;
    filterView: ViewDescriptor;
};
export declare const PERSONEN: TableSpec;
export declare const PERSONEN_DATA: {
    index: number;
    nachname: string;
    vorname: string;
    titel: string;
    stellung: string;
}[];
export declare const ORGANE: TableSpec;
export declare const ORGANE_DATA: {
    index: number;
    name: string;
    kuerzel: string;
    typ: string;
    fk_math_inf: string;
}[];
export declare const ROLLEN: {
    name: string;
    columns: {
        baseColumn: {
            name: string;
            type: ColumnType;
            options: ColumnOption[];
        };
        attributes: any;
    }[];
    joins: {
        table: string;
        fkColumn: {
            name: string;
            type: ColumnType;
        };
        pkColumn: string;
        linkColumns: {
            name: string;
            attributes: any;
        }[];
    }[];
};
export declare const ROLLEN_DATA: {
    index: number;
    rolle: string;
    "j#1_fk": number;
    "j#2_fk": number;
}[];
