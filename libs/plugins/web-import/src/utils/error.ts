/** Whenever the pid (id of a person) is not found. */
export class PIDNotFound extends Error {
    constructor(pid: number | string) {
        super("PID not found: " + (typeof pid === "string" ? pid : pid.toString()))
        this.name = PIDNotFound.name
    }
}

/** Whenever the id of a faculty is not found. */
export class FacultyNotFound extends Error {
    constructor(id: number | string) {
        super("Faculty not found with id: " + (typeof id === "string" ? id : id.toString()))
        this.name = FacultyNotFound.name
    }
}
