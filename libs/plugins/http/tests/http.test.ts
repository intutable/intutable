import { Core } from "core"
import { join as joinPath } from "path"
import { Request, Response, NextFunction } from "express"
import { addEndpoint, addMiddleware } from "../src"

import axios from "axios"

let core: Core

const channel = "channel"
const method = "method"
const request = { message: "this is a request" }
const mockResponse = { message: "hi" }

let requestHandler: jest.Mock
let notificationHandler: jest.Mock
let middlewareHandler: jest.Mock

beforeAll(async () => {
    core = await Core.create([joinPath(__dirname, "..")])
})

afterAll(async () => {
    core.plugins.closeAll()
})

describe("creates endpoints for the event system", () => {
    beforeAll(() => {
        requestHandler = jest.fn(async () => {
            return mockResponse
        })

        notificationHandler = jest.fn(async () => {})
        core.events.listenForRequests("channel", "method", requestHandler)
        core.events.listenForNotifications("channel", "method", notificationHandler)
    })

    test("can make requests", async () => {
        const response = await axios
            .post(`http://localhost:8080/request/${channel}/${method}`, request)
            .then(resp => resp.data)

        expect(response).toEqual(mockResponse)
        expect(requestHandler).toHaveBeenCalledWith({ channel, method, ...request })
    })

    test("can send notifications", async () => {
        await axios.post(`http://localhost:8080/notification/${channel}/${method}`, request)

        expect(notificationHandler).toHaveBeenCalledWith({ channel, method, ...request })
    })
})

type HTTPMethod = "post" | "get" | "put" | "delete"

describe("allows custom endpoints", () => {
    beforeAll(() => {
        requestHandler = jest.fn(async (req: Request, res: Response) => {
            res.send(mockResponse)
        })
    })

    test.each(["post", "get", "put", "delete"] as HTTPMethod[])(
        "can add %s endpoints",
        async (httpMethod: HTTPMethod) => {
            await core.events.request(addEndpoint(httpMethod, "/this/is/a/route", requestHandler))

            const response = await axios[httpMethod](
                `http://localhost:8080/this/is/a/route`,
                request
            ).then((resp: any) => resp.data)

            expect(response).toEqual(mockResponse)
        }
    )
})

describe("allows custom middleware", () => {
    beforeAll(() => {
        middlewareHandler = jest.fn(async (req: Request, res: Response, next: NextFunction) => {
            next()
        })
    })

    test("can add express middleware", async () => {
        await core.events.request(addMiddleware(middlewareHandler))

        const response = await axios
            .post(`http://localhost:8080/request/${channel}/${method}`, request)
            .then(resp => resp.data)

        expect(response).toEqual(mockResponse)
        expect(middlewareHandler).toHaveBeenCalledTimes(1)
    })
})
