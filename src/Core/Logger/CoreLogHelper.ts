import { JsHelper } from "../JavaScript/JsHelper";
import { MOYE_OUTPUT_DEBUG, MOYE_OUTPUT_LOG, MOYE_OUTPUT_WARN } from "../../Macro";
import { Logger } from "./Logger";
import { debug, error, log, warn } from "cc";

// 框架内部用这个log 区分外部的log 不进行导出

export function moyeDebug(tag: string, str: string) {
    if(!MOYE_OUTPUT_DEBUG){
        return;
    }

    const output = `[${tag}]: ${str}`;

    try{
        Logger.get().debug(output);
    }catch(e){
        debug(output);
    }
}

export function moyeDebugF(tag: string, str: string, ...args: any[]) {
    if(!MOYE_OUTPUT_DEBUG){
        return;
    }

    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;

    try{
        Logger.get().debug(output);
    }catch(e){
        debug(output);
    }
}

export function moyeLog(tag: string, str: string) {
    if(!MOYE_OUTPUT_LOG){
        return;
    }

    const output = `[${tag}]: ${str}`;

    try{
        Logger.get().log(output);
    }catch(e){
        log(output);
    }
}

export function moyeLogF(tag: string, str: string, ...args: any[]) {
    if(!MOYE_OUTPUT_LOG){
        return;
    }

    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;

    try{
        Logger.get().log(output);
    }catch(e){
        log(output);
    }
}

export function moyeWarn(tag: string, str: string) {
    if(!MOYE_OUTPUT_WARN){
        return;
    }

    const output = `[${tag}]: ${str}`;

    try{
        Logger.get().warn(output);
    }catch(e){
        warn(output);
    }
}

export function moyeWarnF(tag: string, str: string, ...args: any[]) {
    if(!MOYE_OUTPUT_WARN){
        return;
    }

    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;

    try{
        Logger.get().warn(output);
    }catch(e){
        warn(output);
    }
}

export function moyeError(tag: string, str: string) {
    const output = `[${tag}]: ${str}`;

    try{
        Logger.get().error(output);
    }catch(e){
        error(output);
    }
}

export function moyeErrorF(tag: string, str: string, ...args: any[]) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;

    try{
        Logger.get().error(output);
    }catch(e){
        error(output);
    }
}