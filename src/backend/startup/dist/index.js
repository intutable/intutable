"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
// =============================================================================
// CONSTANTS
const APP_NAME = "dekanat-app";
const CORE_SCRIPT = path_1.default.join(__dirname, "/core");
const FRONTEND_SCRIPT = "./node_modules/next/dist/bin/next";
// =============================================================================
// SCRIPT
main();
function main() {
    let args;
    try {
        args = processArgs(process_1.default.argv);
    }
    catch (e) {
        process_1.default.exit(1);
    }
    // I'd just use the NPM scripts, but it seems they disown the node processes
    // they launch and they then can't be killed.
    const coreProcess = (0, child_process_1.spawn)("node", [CORE_SCRIPT]);
    const frontendProcess = (0, child_process_1.spawn)("node", [
        FRONTEND_SCRIPT,
        args.frontendOption,
    ]);
    logWithName("launched Core plugin container\n");
    logWithName("launched front-end\n");
    const components = [
        { description: "Core plugin container", process: coreProcess },
        { description: "front-end", process: frontendProcess },
    ];
    // if either subprocess exits, shut down all the others
    coreProcess.on("close", (code, signal) => shutdown(components, reason("start/core", code, signal)));
    frontendProcess.on("close", (code, signal) => shutdown(components, reason("front-end", code, signal)));
    // On receiving a signal, call proper shutdown procedure.
    process_1.default.on("SIGINT", () => shutdown(components, "received interrupt signal"));
    process_1.default.on("SIGTERM", () => shutdown(components, "received SIGTERM"));
    // echo all console output from the subprocesses
    coreProcess.stdout.on("data", data => {
        console.log(data.toString());
    });
    coreProcess.stderr.on("data", data => {
        console.log(data.toString());
    });
    frontendProcess.stdout.on("data", data => {
        console.log(data.toString());
    });
    frontendProcess.stderr.on("data", data => {
        console.log(data.toString());
    });
}
// =============================================================================
// PROCEDURES
// program args/options
function processArgs(args) {
    // first three arguments are either "node debug <script>" or "node <script>"
    if (args[1] === "debug")
        return processArgs1(args.slice(3));
    else
        return processArgs1(args.slice(2));
}
function processArgs1(args) {
    if (args.length !== 1)
        usage();
    else
        switch (args[0]) {
            case "dev":
                return { frontendOption: "dev" };
            case "start":
                return { frontendOption: "start" };
            default:
                usage();
        }
}
function usage() {
    console.log("Usage: node start dev | node start start");
    throw new Error("");
}
// process control
function shutdown(components, reason) {
    if (reason)
        logWithName(reason + "\n");
    for (const component of components) {
        logWithName("shutting down " + component.description);
        if (component.process.exitCode === null) {
            // means it's still running
            const shutdownSuccessfully = component.process.kill("SIGTERM");
            if (shutdownSuccessfully)
                log("    ...done\n");
            else
                log("    ...failed\n");
        }
        else
            log("    ...already terminated\n");
    }
    logWithName("exiting\n");
    process_1.default.exit(0);
}
// logging
function log(...stuff) {
    process_1.default.stdout.write(stuff.reduce((s1, s2) => s1 + ", " + s2));
}
function logWithName(...stuff) {
    process_1.default.stdout.write(APP_NAME + ": ");
    log(...stuff);
}
function reason(name, code, signal) {
    return ("Process " +
        name +
        " exited with code " +
        code.toString() +
        (signal ? " and signal " + signal : ""));
}
