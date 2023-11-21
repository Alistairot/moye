import { EntityCenter } from "../../../../../common/Core/Singleton/EntityCenter";
import { InstanceQueueIndex } from "../../../../../common/Core/Singleton/InstanceQueueIndex";
import { Singleton } from "../../../../../common/Core/Singleton/Singleton";
import { ILifeCycle } from "../../../../../common/Core/Type/ILifeCycle";

/**
 * 管理实体组件的生命周期
 */
export class EntityLifiCycleMgr extends Singleton {
    private readonly queues: Array<Array<number>> = new Array(InstanceQueueIndex.Max);

    awake(): void {
        for (let i = 0; i < this.queues.length; i++) {
            this.queues[i] = new Array;
        }

    }

    registerSystem(component: ILifeCycle): void {
        if (component.update) {
            this.queues[InstanceQueueIndex.Update].push(component.instanceId)
        }

        if (component.lateUpdate) {
            this.queues[InstanceQueueIndex.LateUpdate].push(component.instanceId)
        }
    }

    awakeComEvent(component: ILifeCycle) {
        component.awake()
    }

    destroyComEvent(component: ILifeCycle) {
        component.destroy()
    }

    update(): void {
        let queue = this.queues[InstanceQueueIndex.Update];
        let entityCenter = EntityCenter.getInst();

        for (let i = queue.length - 1; i >= 0; i--) {
            let instanceId = queue[i];
            let component = entityCenter.get(instanceId);

            if (!component) {
                queue.splice(i, 1);
                continue;
            }

            if (component.isDisposed) {
                queue.splice(i, 1);
                continue;
            }

            component.update()
        }
    }

    lateUpdate(): void {
        let queue = this.queues[InstanceQueueIndex.LateUpdate];
        let entityCenter = EntityCenter.getInst();

        for (let i = queue.length - 1; i >= 0; i--) {
            let instanceId = queue[i];
            let component = entityCenter.get(instanceId);

            if (!component) {
                queue.splice(i, 1);
                continue;
            }

            if (component.isDisposed) {
                queue.splice(i, 1);
                continue;
            }

            component.lateUpdate()
        }
    }
}