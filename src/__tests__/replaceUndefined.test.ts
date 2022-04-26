import { replaceUndefined } from "utils/replaceUndefined"

describe("'replaceUndefined' Utility", () => {
    it("should recursivley replace 'undefined' by 'null'", () => {
        const sample = {
            key1: "hello",
            key2: 1,
            key3: true,
            key4: new Date(),
            key5: null,
            key6: undefined,
            key7: {
                key7_1: "hello",
                key7_2: 1,
                key7_3: true,
                key7_4: new Date(),
                key7_5: null,
                key7_6: undefined,
            },
        }
        const result = replaceUndefined(sample)

        console.dir(result)

        expect(result).toEqual({
            key1: "hello",
            key2: 1,
            key3: true,
            key4: new Date(),
            key5: null,
            key6: null,
            key7: {
                key7_1: "hello",
                key7_2: 1,
                key7_3: true,
                key7_4: new Date(),
                key7_5: null,
                key7_6: null,
            },
        })
    })
})
