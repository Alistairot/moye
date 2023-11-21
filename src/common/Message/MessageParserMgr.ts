import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { coreError } from "../Core/Logger/CoreLogHelper";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";

/**
 * 消息解析管理类 可以通过opcode获取对应的解析器
 */
export class MessageParserMgr extends Singleton {
    parsers: Map<number, Type> = new Map<number, Type>();

    awake() {
        let args = DecoratorCollector.inst.get(DecoratorTypeCore.MessageParser)

        for (let arg of args) {
            let type = arg[0]
            let opcode = arg[1]

            this.parsers.set(opcode, type)
        }
    }

    getParser(opcode: number): any {
        let parser = this.parsers.get(opcode)

        if (parser == null) {
            coreError(`找不到opcode:${opcode}对应的解析器`)
        }

        return parser
    }
}