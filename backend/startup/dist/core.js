"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@intutable/core");
const net_1 = __importDefault(require("net"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const PLUGIN_PATHS = [
    path_1.default.join(process_1.default.cwd(), "node_modules/@intutable/*"),
    path_1.default.join(__dirname, "../../dekanat-app-plugin"),
];
const PG_PORT = 5432;
const RETRIES = Math.pow(2, 30);
main();
/**
 * Start a {@link Core}. Since we have the HTTP plugin installed, it will keep
 * running and listen for requests.
 */
async function main() {
    await waitForDatabase().catch(e => crash(e));
    const devMode = process_1.default.argv.includes("dev"); // what could go wrong?
    const events = new core_1.EventSystem(devMode); // flag sets debug mode
    await core_1.Core.create(PLUGIN_PATHS, events).catch(e => crash(e));
}
async function waitForDatabase() {
    let connected = false;
    let lastError;
    let retries = RETRIES;
    while (retries > 0 && !connected) {
        console.log(`waiting for database...`);
        console.log(`retries: ${retries}`);
        await testPort(PG_PORT)
            .then(() => {
            connected = true;
        })
            .catch(e => {
            lastError = e;
        });
        await new Promise(res => setTimeout(res, 3000));
        retries--;
    }
    if (connected) {
        return;
    }
    else {
        return Promise.reject({
            error: {
                message: "could not connect to database",
                reason: lastError,
            },
        });
    }
}
async function testPort(port, host) {
    let socket;
    return new Promise((res, rej) => {
        socket = net_1.default.createConnection(port, host);
        socket
            .on("connect", function (e) {
            res(e);
            socket.destroy();
        })
            .on("error", function (e) {
            rej(e);
            socket.destroy();
        });
    });
}
function crash(e) {
    console.log(e);
    return process_1.default.exit(1);
}
