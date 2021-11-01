import process from "process"
import { ChildProcess, spawn } from "child_process"


// =============================================================================
// TYPES
/**
 * Arguments to the program.
 * @param {string} frontendOption - The option (dev or preview) to be passed to
 * the front-end script (e.g. next or svelte-kit).
 */
interface ProgramArgs {
    frontendOption : string
}
/**
 * A child process together with a description.
 */
interface AppComponent {
    description : string
    process     : ChildProcess
}

interface ProcessEnd {
    name : string
}

// =============================================================================
// CONSTANTS
const APP_NAME        = "dekanat-app"
const CORE_SCRIPT     = "./backend/dist/start/core"
const FRONTEND_SCRIPT = "./node_modules/next/dist/bin/next"


// =============================================================================
// SCRIPT
main()
function main(){
    let args : ProgramArgs
    try {
        args = processArgs(process.argv)
    } catch (e){
        process.exit(1)
    }

    // I'd just use the NPM scripts, but it seems they disown the node processes
    // they launch and they then can't be killed.
    const coreProcess     = spawn("node", [ CORE_SCRIPT ])
    const frontendProcess = spawn("node", [ FRONTEND_SCRIPT,
                                            args.frontendOption])

    logWithName("launched Core plugin container\n")
    logWithName("launched front-end\n")

    const components : AppComponent[] = [
        { description: "Core plugin container", process: coreProcess },
        { description: "front-end", process: frontendProcess }
    ]

    // if either subprocess exits, shut down all the others
    coreProcess.on("close", (code, signal) =>
        shutdown(components, reason("start/core", code, signal)))
    frontendProcess.on("close",  (code, signal) =>
        shutdown(components, reason("front-end", code, signal)))
    // On receiving a signal, call proper shutdown procedure.
    process.on("SIGINT", () => shutdown(components,
                                        "received interrupt signal"))
    process.on("SIGTERM", () => shutdown(components, "received SIGTERM"))

    // echo all console output from the subprocesses
    coreProcess.stdout.on("data", (data) => {
        console.log(data.toString())
    })
    coreProcess.stderr.on("data", (data) => {
        console.log(data.toString())
    })
    frontendProcess.stdout.on("data", (data) => {
        console.log(data.toString())
    })
    frontendProcess.stderr.on("data", (data) => {
        console.log(data.toString())
    })
}

// =============================================================================
// PROCEDURES

// program args/options
function processArgs(args : string[]) : ProgramArgs {
    // first three arguments are either "node debug <script>" or "node <script>"
    if(args[1] === "debug")
        return processArgs1(args.slice(3))
    else
        return processArgs1(args.slice(2))
}

function processArgs1(args: string[]) : ProgramArgs {
    if (args.length !== 1)
        usage()
    else
        switch(args[0]){
            case "dev":
                return { frontendOption: "dev" }
            case "preview":
                return { frontendOption: "preview" }
            default:
                usage()
        }
}

function usage() : ProgramArgs {
    console.log("Usage: node start dev | node start preview")
    throw new Error("")
}

// process control
function shutdown(components : AppComponent[], reason?: string){
    if (reason)
        logWithName(reason + "\n")
    for (let component of components){
        logWithName("shutting down " + component.description)
        if (component.process.exitCode === null){ // means it's still running
            let shutdownSuccessfully = component.process.kill("SIGTERM")
            if (shutdownSuccessfully)
                log("    ...done\n")
            else
                log("    ...failed\n")
        } else
            log("    ...already terminated\n")
    }
    logWithName("exiting\n")
    process.exit(0)
}

// logging
function log(...stuff){
    process.stdout.write(stuff.reduce((s1, s2) => s1 + ", " + s2))
}

function logWithName(...stuff){
    process.stdout.write(APP_NAME + ": ")
    log(...stuff)
}

function reason(name : string, code : number, signal : string | null) : string {
    return "Process " + name + " exited with code " + code.toString() +
        (signal ? " and signal "+ signal : "")
}
