import { coreLog } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { NetServices } from "../Network/NetServices";
import { Options } from "../Core/Options/Options";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { IMessage } from "./IMessage";

/**
 * 消息打印器
 */
export class MsgPrinter extends Singleton {
    private _ignoreDebugLogMessages: Set<number> = new Set()
    /**
     * 是否需要在收到消息的时候打印
     */
    private _isLog: boolean = true;

    /**
     * 是否需要print
     * 如果为false 那么所有print都不会打印
     */
    private _isPrint: boolean = true;

    private isNeedLogMessage(opcode: number): boolean {
        if (this._ignoreDebugLogMessages.has(opcode)) {
            return false;
        }

        return true;
    }

    private replacer(key, value) {
        if (value instanceof Map) {
            if(value.size > 10){
                return `Map length: ${value.size}`
            }else{
                return {
                    dataType: 'Map',
                    value: Array.from(value.entries()), // or with spread: value: [...value]
                };
            }
        }else if(value instanceof Uint8Array){
            return `Uint8Array length: ${value.byteLength}`;
        }else if(value instanceof Set){
            if(value.size > 10){
                return `Set length: ${value.size}`
            }else{
                return {
                    dataType: 'Set',
                    value: Array.from(value.entries()), // or with spread: value: [...value]
                };
            }
        }else if(value instanceof Array){
            if(value.length > 10){
                return `Array length: ${value.length}`
            }else{
                return value;
            }
        }
        else {
            return value;
        }
    }

    /**
     * 供收到消息的时候调用 可以忽略一些消息的打印
     * @param message 
     * @returns 
     */
    log(message: IMessage, prefix: string = ''): void {
        if(!Options.getInst().develop){
            return;
        }
        
        if(!this._isLog) {
            return
        }

        let opcode = NetServices.getInst().GetOpcode(message.constructor as Type);

        if (!this.isNeedLogMessage(opcode)) {
            return;
        }

        coreLog(`[MsgPrinter.l] ${prefix}${message.constructor.name}:${JSON.stringify(message, this.replacer)}`);
    }

    /**
     * 直接打印出消息
     * @param message 
     */
    print(message: IMessage, prefix: string = ''): void {
        if(!this._isPrint){
            return;
        }

        coreLog(`[MsgPrinter.p] ${prefix}${message.constructor.name}:${JSON.stringify(message, this.replacer)}`);
    }

    /**
     * 将消息转化成string
     * @param message 
     * @returns 
     */
    getMsgString(message: IMessage): string {
        return `${message.constructor.name}:${JSON.stringify(message, this.replacer)}`;
    }

    ignore(opcode: number): void {
        this._ignoreDebugLogMessages.add(opcode);
    }

    closePrint(): void {
        this._isPrint = false;
    }

    closeLog(): void {
        this._isLog = false;
    }
}