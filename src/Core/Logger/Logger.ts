import { JsHelper } from "../JavaScript/JsHelper";
import { Singleton } from "../Singleton/Singleton";
import { ILog } from "./ILog";
import { LoggerDefault } from "./LoggerDefault";
import { LoggerLevel } from "./LoggerLevel";

/**
 * Logger
 */
export class Logger extends Singleton {
    level: LoggerLevel = LoggerLevel.Debug;

    set iLog(value: ILog) {
        this._logInst = value;
    }

    private _logInst: ILog;
    private get _iLog(): ILog {
        if (!this._logInst) {
            this._logInst = new LoggerDefault();
        }
        return this._logInst;
    }

    debug(...args: any[]) {
        if (this.checkLogLevel(LoggerLevel.Debug)) {
            this._iLog.debug(...args);
        }
    }

    debugF(str: string, ...args: any[]) {
        if (this.checkLogLevel(LoggerLevel.Debug)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.debug(formatStr);
        }
    }

    log(...args: any[]) {
        if (this.checkLogLevel(LoggerLevel.Log)) {
            this._iLog.log(...args);
        }
    }

    logF(str: string, ...args: any[]) {
        if (this.checkLogLevel(LoggerLevel.Log)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.log(formatStr);
        }
    }

    warn(...args: any[]) {
        if (this.checkLogLevel(LoggerLevel.Warn)) {
            this._iLog.warn(...args);
        }
    }

    warnF(str: string, ...args: any[]) {
        if (this.checkLogLevel(LoggerLevel.Warn)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.warn(formatStr);
        }
    }

    error(...args: any[]) {
        this._iLog.error(...args);
    }

    errorF(str: string, ...args: any[]) {
        const formatStr = JsHelper.formatStr(str, ...args);
        this._iLog.error(formatStr);
    }

    private checkLogLevel(level: LoggerLevel): boolean {
        return this.level <= level;
    }
}

export function debug(...args: any[]) {
    Logger.get().debug(...args);
}

/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str 
 * @param args 
 */
export function debugF(str: string, ...args: any[]) {
    Logger.get().debugF(str, ...args);
}

export function log(...args: any[]) {
    Logger.get().log(...args);
}

/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str 
 * @param args 
 */
export function logF(str: string, ...args: any[]) {
    Logger.get().logF(str, ...args);
}

export function warn(...args: any[]) {
    Logger.get().warn(...args);
}

/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str 
 * @param args 
 */
export function warnF(str: string, ...args: any[]) {
    Logger.get().warnF(str, ...args);
}

export function error(...args: any[]) {
    Logger.get().error(...args);
}

/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str 
 * @param args 
 */
export function errorF(str: string, ...args: any[]) {
    Logger.get().errorF(str, ...args);
}