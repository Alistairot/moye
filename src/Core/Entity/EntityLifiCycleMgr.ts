import { InstanceQueueIndex } from "./InstanceQueueIndex";
import { Singleton } from "../Singleton/Singleton";
import { IEntity } from "../Type/IEntity";
import { EntityCenter } from "./EntityCenter";

/**
 * 管理实体组件的生命周期
 */
export class EntityLifiCycleMgr extends Singleton {
    private readonly _queues: bigint[][] = new Array(InstanceQueueIndex.MAX);

    awake(): void {
        for (let i = 0; i < this._queues.length; i++) {
            this._queues[i] = [];
        }
    }

    registerSystem(entity: IEntity): void {
        if (entity.update) {
            this._queues[InstanceQueueIndex.UPDATE].push(entity.instanceId);
        }

        if (entity.lateUpdate) {
            this._queues[InstanceQueueIndex.LATE_UPDATE].push(entity.instanceId);
        }
    }

    awakeComEvent(entity: IEntity) {
        entity.awake();
    }

    destroyComEvent(entity: IEntity) {
        entity.destroy();
    }

    update(): void {
        const queue = this._queues[InstanceQueueIndex.UPDATE];
        const entityCenter = EntityCenter.get();

        for (let i = queue.length - 1; i >= 0; i--) {
            const instanceId = queue[i];
            const entity = entityCenter.get(instanceId);

            if (!entity) {
                queue.splice(i, 1);
                continue;
            }

            if (entity.isDisposed) {
                queue.splice(i, 1);
                continue;
            }

            entity.update();
        }
    }

    lateUpdate(): void {
        const queue = this._queues[InstanceQueueIndex.LATE_UPDATE];
        const entityCenter = EntityCenter.get();

        for (let i = queue.length - 1; i >= 0; i--) {
            const instanceId = queue[i];
            const entity = entityCenter.get(instanceId);

            if (!entity) {
                queue.splice(i, 1);
                continue;
            }

            if (entity.isDisposed) {
                queue.splice(i, 1);
                continue;
            }

            entity.lateUpdate();
        }
    }
}