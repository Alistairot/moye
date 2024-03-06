import { debug, error, log, warn } from "cc";
import { ILog } from "./ILog";
import { DEBUG } from "cc/env";

export class LoggerDefault implements ILog {
    debug(...data: any[]): void {
        if (DEBUG) {
            debug(...data);
        }
    }

    log(...data: any[]): void {
        if (DEBUG) {
            log(...data);
        }
    }

    warn(...data: any[]): void {
        if (DEBUG) {
            warn(...data);
        }
    }

    error(...data: any[]): void {
        if (DEBUG) {
            error(...data);
        }
    }
}