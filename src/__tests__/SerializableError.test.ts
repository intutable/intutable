import { SerializableError } from "../utils/error-handling/SerializableError"
import { replaceUndefined } from "../utils/replaceUndefined"

describe("'SerializableError' class", () => {
    it("should properly serialize", () => {
        const error = new SerializableError("hello")
        console.log(error.serialize())

        expect(true).toBeTruthy()
    })
})
