/** JSONizable protocol */
export type JSONizable<ObjectNotation> = {
    toJSON: () => ObjectNotation
}
