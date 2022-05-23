import { replaceUndefined } from "../utils/replaceUndefined"

describe("'replaceUndefined' utility", () => {
    it("should recursivley replace 'undefined' by 'null'", () => {
        const date = new Date()
        const sample = {
            key1: "hello",
            key2: 1,
            key3: true,
            key4: date,
            key5: null,
            key6: undefined,
            key7: {
                key7_1: "hello",
                key7_2: 1,
                key7_3: true,
                key7_4: date,
                key7_5: null,
                key7_6: undefined,
            },
        }
        const expectation = {
            key1: "hello",
            key2: 1,
            key3: true,
            key4: date,
            key5: null,
            key6: null,
            key7: {
                key7_1: "hello",
                key7_2: 1,
                key7_3: true,
                key7_4: date,
                key7_5: null,
                key7_6: null,
            },
        }

        const result = replaceUndefined(sample)

        expect(result).toEqual(expectation)
    })
})