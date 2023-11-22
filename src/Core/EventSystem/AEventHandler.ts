import { safeCall } from "../JavaScript/safeCall";
import { coreError, coreWarn } from "../Logger/CoreLogHelper";

export abstract class AEventHandler<T, A>{
    protected abstract run(scene: T, args: A): any;

    async handleAsync(scene: T, a: A) {
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

    handle(scene: T, a: A) {
        try {
            const ret = this.run(scene, a);

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