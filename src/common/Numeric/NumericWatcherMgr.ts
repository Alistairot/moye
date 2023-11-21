import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { NumericChange } from "../EventSystem/EventCore";
import { Options } from "../Core/Options/Options";
import { Game } from "../Core/Singleton/Game";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { INumericWatcherHandler } from "./INumericWatcherHandler";

export class NumericWatcherMgr extends Singleton {
    private _isSending: boolean = false
    private _handlers: Map<Type, Map<number, INumericWatcherHandler[]>> = new Map
    private _frameFinishs: Map<INumericWatcherHandler, Map<number, NumericChange>> = new Map

    awake(): void {
        let list = DecoratorCollector.inst.get(DecoratorTypeCore.NumericWatcher)
        let handlerMap: Map<any, INumericWatcherHandler> = new Map

        for (const args of list) {
            let handlerType: Type = args[0]
            let entityType: Type = args[1]
            let handlerInst = handlerMap.get(handlerType)

            if (handlerInst == null) {
                handlerInst = new handlerType
                handlerMap.set(handlerType, handlerInst)
            }

            let numericType: number = args[2]

            let entityMap = this._handlers.get(entityType)
            if (entityMap == null) {
                entityMap = new Map
                this._handlers.set(entityType, entityMap)
            }

            let numericHandlers = entityMap.get(numericType)
            if (numericHandlers == null) {
                numericHandlers = []
                entityMap.set(numericType, numericHandlers)
            }

            numericHandlers.push(handlerInst)
        }

        handlerMap.clear()

    }

    destroy(): void {
        this._handlers.clear()
        this._frameFinishs.clear()
    }

    public run(args: NumericChange) {
        if (Options.getInst().isServer) {
            this.innerRun(args)
        } else {
            this.addFrameFinish(args)
        }
    }

    private innerRun(args: NumericChange) {
        let numericHandlers = this.getWatchs(args)

        if (numericHandlers == null) {
            return
        }

        for (const watcher of numericHandlers) {
            watcher.run(args.entity, args)
        }
    }

    private getWatchs(args: NumericChange): INumericWatcherHandler[] {
        let entityMap = this._handlers.get(args.entity.constructor as Type)

        if (entityMap == null) {
            // ctLog(`没有${args.entity.constructor.name}类型的数值处理`)
            return
        }

        let numericHandlers = entityMap.get(args.numericType)

        if (null == numericHandlers) {
            return
        }

        return numericHandlers
    }

    private addFrameFinish(args: NumericChange) {
        let numericHandlers = this.getWatchs(args)

        if (numericHandlers == null) {
            return
        }

        for (const handler of numericHandlers) {
            let idMap = this._frameFinishs.get(handler)

            if (idMap == null) {
                idMap = new Map
                this._frameFinishs.set(handler, idMap)
            }

            idMap.set(args.entity.id, args)
        }

        this.sendAtFrameFinish()
    }

    private async sendAtFrameFinish() {
        if (this._isSending) {
            return
        }

        this._isSending = true
        await Game.waitFrameFinish()

        for (const [handler, idMap] of this._frameFinishs) {
            for (const [id, args] of idMap) {
                if (args.entity.isDisposed) {
                    continue
                }

                handler.run(args.entity, args)
            }

            idMap.clear()
        }

        this._isSending = false
    }
}