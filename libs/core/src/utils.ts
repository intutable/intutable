/**
 * `core`'s logging utility.
 *
 * @deprecated will be replaced with a more elaborate logging system in the future.
 */
export class Logger {
    /**
     * Create a new logger instance.s
     *
     * @param debugging if `true`, the logger will log to the console/stdout, otherwise it will do nothing.
     */
    constructor(private debugging: boolean = false) {}

    /** Logs whatever is passed to it to the console/stdout if `debug` is set to `true` */
    public log(...args: any[]) {
        if (this.debugging) {
            console.log(...args)
        }
    }
}
