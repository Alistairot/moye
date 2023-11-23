import { JsHelper } from "../JavaScript/JsHelper";
import { Options } from "../Options/Options";
import { Singleton } from "../Singleton/Singleton";
import { ILog } from "./ILog";
import { LoggerDefault } from "./LoggerDefault";

/**
 * Logger
 */
export class Logger extends Singleton {
    set iLog(value: ILog) {
        this._logInst = value;
    }
    
    static readonly LOG_LEVEL = 1;
    static readonly WARN_LEVEL = 2;

    private _logInst: ILog;
    private get _iLog(): ILog {
        if (!this._logInst) {
            this._logInst = new LoggerDefault();
            this._logInst.warn('not set iLog, use default logger');
        }
        return this._logInst;
    }
    

    log(str: string, ...args: any[]) {
        if (this.checkLogLevel(Logger.LOG_LEVEL)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.log(formatStr);
        }
    }

    warn(str: string, ...args: any[]) {
        if (this.checkLogLevel(Logger.WARN_LEVEL)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.warn(formatStr);
        }
    }

    /**
     * 错误打印会带上堆栈 用于定位错误
     * 错误打印不会受到logLevel的影响 一定会打印
     * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
     * @param str 
     * @param args 
     */
    error(str: string, ...args: any[]) {
        const formatStr = JsHelper.formatStr(str, ...args);
        this._iLog.error(formatStr);
    }

    private checkLogLevel(level: number): boolean {
        return Options.get().logLevel <= level;
    }

    /**
     * 不受logLevel影响的log
     * @param str 
     * @param args 
     */
    private coreLog(str: string) {
        this._iLog.log(str);
    }

    /**
     * 不受logLevel影响的log
     * @param str 
     * @param args 
     */
    private coreWarn(str: string) {
        this._iLog.warn(str);
    }

    /**
     * 错误打印会带上堆栈 用于定位错误
     * 错误打印不会受到logLevel的影响 一定会打印
     * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
     * @param str 
     * @param args 
     */
    private coreError(str: string) {
        this._iLog.error(str);
    }
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
export function log(str: string, ...args: any[]) {
    Logger.get().log(str, ...args);
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
export function warn(str: string, ...args: any[]) {
    Logger.get().warn(str, ...args);
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
export function error(str: string, ...args: any[]) {
    Logger.get().error(str, ...args);
}