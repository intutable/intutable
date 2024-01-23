import express, { Express, RequestHandler } from 'express';

const PORT = 8080
export interface Endpoint {
    httpMethod: string; // POST, GET, ...
    route: string;
    handler: RequestHandler;
}

export async function startHttpServer(endpoints: Endpoint[]): Promise<void> {
    const app: Express = express();

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
