import { SerializableError } from "../utils/error/SerializableError"
import { replaceUndefined } from "../utils/replaceUndefined"

describe("'SerializableError' class", () => {
    it("should properly serialize", () => {
        const error = new SerializableError("hello")
        console.log(error.serialize())
        // expect(error.serialize).toEqual(expectation)
    })
})
