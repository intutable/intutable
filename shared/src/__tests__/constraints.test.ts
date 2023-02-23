import { ConditionIterIter } from "../constraints/util/ConstraintStore"
import { Alert } from "../constraints/dos/Alert"
import { AlwaysTrue } from "../constraints/ifs/AlwaysTrue"
import { Constraint } from "../constraints/util/Constraint"

describe("Constraints", () => {
    it("should properly jsonize", () => {
        const constraint = new Constraint("Proof-of-Concept")
            .do(
                new Alert({
                    severity: "warn",
                    title: "Test",
                    message: "Test",
                })
            )
            .if(new AlwaysTrue())
        // console.dir(constraint.toJSON(), { depth: null })
    })

    it("complex constraints should also properly jsonize", () => {
        const constraint = new Constraint("Proof-of-Concept")
            .do(
                new Alert({
                    severity: "warn",
                    title: "Test",
                    message: "Test",
                })
            )
            .do(
                new Alert({
                    severity: "info",
                    title: "Test2",
                    message: "Test",
                })
            )
            .if(new AlwaysTrue())
            .and.if(new AlwaysTrue())
            .or.if(new AlwaysTrue())
        // console.dir(constraint.toJSON(), { depth: null })
    })

    it("should throw when being malformatted", () => {
        expect(() => new Constraint("Proof-of-Concept").and.if(new AlwaysTrue())).toThrow()
    })

    it("should stringify and parse back", () => {
        const constraint = new Constraint("Proof-of-Concept")
            .do(
                new Alert({
                    severity: "warn",
                    title: "Test",
                    message: "Test",
                })
            )
            .do(
                new Alert({
                    severity: "info",
                    title: "Test2",
                    message: "Test",
                })
            )
            .if(new AlwaysTrue())
            .and.if(new AlwaysTrue())
            .or.if(new AlwaysTrue())
        const stringified = JSON.stringify(constraint.toJSON())
        console.log(stringified)
        expect(typeof stringified).toBe("string")
        const parsed = JSON.parse(stringified)
        console.dir(parsed, { depth: null })
        expect(typeof parsed).toBe("object")
    })

    it("can be traversed via the Condition Iterable Iterator", () => {
        const constraint = new Constraint("Proof-of-Concept")
            .do(
                new Alert({
                    severity: "warn",
                    title: "Test",
                    message: "Test",
                })
            )
            .do(
                new Alert({
                    severity: "info",
                    title: "Test2",
                    message: "Test",
                })
            )
            .if(new AlwaysTrue())
            .and.if(new AlwaysTrue())
            .or.if(new AlwaysTrue())
            .toJSON()

        const conditions = new ConditionIterIter(constraint.conditions)

        console.log(Array.from(conditions))

        expect(Array.isArray(Array.from(conditions))).toBeTruthy()
        expect(Array.from(conditions).length).toBe(5)
    })
})
