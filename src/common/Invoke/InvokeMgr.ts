import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { coreError } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { AInvokeHandler } from "./AInvokeHandler";

/**
 * 回调管理器
 */
export class InvokeMgr extends Singleton {
    private _invokes: Map<string, AInvokeHandler<any, any>> = new Map

    awake(): void {
        let argsList = DecoratorCollector.inst.get(DecoratorTypeCore.Invoke)

        for (const args of argsList) {
            let handlerType: Type<AInvokeHandler<any, any>> = args[0]
            let invokeType: string = args[1]
            let invokeHandler = new handlerType()

            if (this._invokes.has(invokeType)) {
                console.error(`1个invoketype只能有一个回调, invoketype=${invokeType}`)
            }

            this._invokes.set(invokeType, invokeHandler)
        }
    }

    invoke<A, B>(type: string, args: A): B {
        let invokeHandlers = this.getHandler(type)

        return invokeHandlers.handle(args)
    }

    async invokeAsync<A, B>(type: string, args?: A): Promise<B> {
        let invokeHandlers = this.getHandler(type)

        return await invokeHandlers.handle(args)
    }

    private getHandler(type: string): AInvokeHandler<any, any> {
        let invokeHandler = this._invokes.get(type)

        if (DEVELOP) {
            if (invokeHandler == null) {
                coreError(`未找到对应的invoke: ${type}`)
            }
        }

        return invokeHandler
    }
}