/** Replace all booleans with 0 or 1 in a given type. */
export declare type SqlData<A> = A extends boolean ? number : A extends Object ? {
    [k in keyof A]: A[k] extends boolean ? number : A[k];
} : A;
/** Replace all booleans with 0 or 1 in a given value. */
export declare function toSQL(obj: boolean | Object | any): SqlData<typeof obj>;
export declare const A: {
    COLUMN_INDEX: {
        key: string;
    };
};
