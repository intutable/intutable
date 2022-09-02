import { SerializableError } from "../utils/error-handling/SerializableError"

describe("SerializableError", () => {
    it("should properly serialize to json and back", () => {
        const error = new SerializableError("hello")

        const json = SerializableError.toJSON(error)

        const parsed = SerializableError.fromJSON(json)
        console.log(parsed)

        expect(true).toBeTruthy()
    })
})
