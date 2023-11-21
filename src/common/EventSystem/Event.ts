import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { Scene } from "../Entity/Scene";
import { AEvent } from "../Event/AEvent";
import { coreError, coreWarn } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { safeCall } from "../Core/JavaScript/safeCall";
import { Type } from "../Core/Type/Type";

export abstract class AEventHandler<A>{
    protected abstract run(scene: Scene, args: A);

    public async handleAsync(scene: Scene, a: A) {
        try {
            await this.run(scene, a);
        }
        catch (e) {
            if (e instanceof Error) {
                coreError(e.stack);
            } else {
                coreError(e);
            }
        }
    }

    public handle(scene: Scene, a: A) {
        try {
            let ret = this.run(scene, a);

            if (ret instanceof Promise) {
                coreWarn('{0}的run方法是异步的, 请尽量不要用publish来通知', this.constructor.name);
                safeCall(ret);
            }

        }
        catch (e) {
            if (e instanceof Error) {
                coreError(e.stack);
            } else {
                coreError(e);
            }
        }
    }
}

/**
 * 事件装饰器
 * @param eventCls 
 * @param sceneType 
 * @returns 
 */
export function EventHandlerDecorator(eventCls: Type<AEvent>, sceneType: string) {
    return function (target: Function) {
        if (DEVELOP) {
            if (sceneType == null) {
                console.error(`EventDecorator必须要传 sceneType`)
            }
        }

        DecoratorCollector.inst.add(DecoratorTypeCore.Event, eventCls, target, sceneType)
    }
}