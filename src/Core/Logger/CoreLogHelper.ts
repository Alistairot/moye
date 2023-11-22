import { JsHelper } from "../JavaScript/JsHelper";
import { CORE_LOG, CORE_WARN } from "../../Macro";
import { ICoreLog } from "./ICoreLog";
import { Logger } from "./Logger";

// 框架内部用这个log 区分外部的log 不进行导出
export function coreLog(str: string, ...args: any[]) {
    if(!CORE_LOG){
        return;
    }

    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[core]: ${formatStr}`;

    try{
        const inst = Logger.getInst() as unknown as ICoreLog;
        inst.coreLog(output);
    }catch(e){
        console.log(output);
    }
}

export function coreWarn(str: string, ...args: any[]) {
    if(!CORE_WARN){
        return;
    }

    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[core]: ${formatStr}`;

    try{
        const inst = Logger.getInst() as unknown as ICoreLog;
        inst.coreWarn(output);
    }catch(e){
        console.warn(output);
    }
}

export function coreError(str: string, ...args: any[]) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[core]: ${formatStr}`;

    try{
        const inst = Logger.getInst() as unknown as ICoreLog;
        inst.coreError(output);
    }catch(e){
        console.error(output);
    }
}