export class QueryOptions {
    private query: any;
    constructor() {
        this.query = {};
    }

    public roleId(roleId: number) : this {
        this.query.roleId = roleId
        return this;
    }
    public action(action: string) : this {
        this.query.action = action
        return this;
    }
    public subject(subject: string) : this {
        this.query.subject = subject
        return this;
    }
    public subjectName(subjectName: string) : this {
        this.query.subjectName = subjectName
        return this;
    }

    public getQuery(): any {
        return this.query
    }
}