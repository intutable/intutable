import { ParsedUrlQuery } from "querystring"

export type PageAction<T = unknown> = { type: string; payload: T }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CallbackParser<T = any> = (value: string) => T

/**
 * Just add new keys and they will be parsed automatically.
 *
 * #### Types of page actions
 * - `view` expects a view id
 * - `inputMask` expects an input mask id
 * - `record` expects a row id
 * - `newRecord` expects a unique id (e.g. timestamp)
 */
const RUNTIME_ROUTE_PARAMETERS_MAP: {
    [key: string]: PageAction["type"] | { type: PageAction["type"]; parser: CallbackParser }
} = {
    view: { type: "selectView", parser: value => Number.parseInt(value) },
    inputMask: "selectInputMask",
    record: { type: "openRow", parser: value => Number.parseInt(value) },
    newRecord: { type: "createRow", parser: value => Number.parseInt(value) },
}

const isParser = (value: unknown): value is { type: PageAction["type"]; parser: CallbackParser } =>
    Object.prototype.hasOwnProperty.call(value, "type") &&
    Object.prototype.hasOwnProperty.call(value, "parser")

/**
 * ### Page Action Util
 * for nextjs page `[tableId].tsx`.
 *
 * #### But what are page actions?
 * URLs can contain several query/route parameters that instruct the page
 * to do something special or behave differently.
 *
 * #### Example
 * `/project/:projectId/table/:tableId?view=1`
 * => this additional parameter `view=1` sets the view.
 *
 * _Note_: These route parameters starting with a `?` can also
 * be appended to the query (and thus not beeing visible).
 *
 */
export class PageActionUtil {
    public actions: PageAction[] = []

    constructor(...actions: PageAction[]) {
        this.actions = this.actions.concat(actions)
    }

    /** removes and returns the element */
    public use<T>(type: string): PageAction<T> | undefined {
        const index = this.actions.findIndex(action => action.type === type)
        const item = index === -1 ? undefined : (this.actions.splice(index, 1)[0] as PageAction<T>)
        return item
    }

    static fromQuery(query: ParsedUrlQuery): PageActionUtil {
        return new PageActionUtil(...PageActionUtil.parseQuery(query))
    }

    static parseQuery(query: ParsedUrlQuery): PageAction[] {
        const parsed: PageAction[] = []
        Object.entries(query).forEach(([key, value]) => {
            if (Object.keys(RUNTIME_ROUTE_PARAMETERS_MAP).includes(key)) {
                const param =
                    RUNTIME_ROUTE_PARAMETERS_MAP[key as keyof typeof RUNTIME_ROUTE_PARAMETERS_MAP]
                const type = isParser(param) ? param.type : param
                const payload = isParser(param) ? param.parser(value as string) : value
                parsed.push({ type, payload })
            } else return
        })
        return parsed
    }
}
