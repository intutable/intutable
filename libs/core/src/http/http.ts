import express, { Express, RequestHandler } from 'express';
import {getEndpoints} from "../requests";
import cors from "cors";

const PORT = process.env.HTTP_PORT || 8080

export interface Endpoint {
    httpMethod: string; // POST, GET, ...
    route: string;
    handler: RequestHandler;
}

export async function startHttpServer(): Promise<void> {
    const app: Express = express();
    app.use(express.json)
    app.use(cors())

    const endpoints = getEndpoints()
    endpoints.forEach((endpoint) => {
        const { httpMethod, route, handler } = endpoint;

        // ts-ignore for now until we can figure out the correct types as express uses any for everything...
        // @ts-ignore
        app[httpMethod.toLowerCase()](route, handler);
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
