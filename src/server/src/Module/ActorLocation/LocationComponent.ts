import { CoroutineLock } from "../../../../common/CoroutineLock/CoroutineLock";
import { Entity } from "../../../../common/Entity/Entity";
import { coreError, coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { LockTypeCore } from "../../Game/CoroutineLock/LockTypeCore";
import { LockInfo } from "./LockInfo";

/**
 * 位置组件
 * 比如unit每次传送都要上报instanceId, 这个组件就是用来查询unitId对应的instanceId的
 * instanceId包含了unit所在进程 也就是所在的位置
 */
export class LocationComponent extends Entity {
    public readonly locations: Map<number, number> = new Map();
    public readonly lockInfos: Map<number, LockInfo> = new Map();

    public async add(key: number, instanceId: number) {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.Location, key.toString())
        try {
            this.locations.set(key, instanceId);
            coreLog(`location add key: ${key} instanceId: ${instanceId}`);
        } finally {
            lock.dispose();
        }
    }

    public async remove(key: number) {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.Location, key.toString())
        try {
            this.locations.delete(key);
            coreLog(`location remove key: ${key}`);
        } finally {
            lock.dispose();
        }
    }

    public async lock(key: number, instanceId: number, time: number = 0) {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.Location, key.toString());

        let lockInfo = this.addChild(LockInfo).init(instanceId, lock);

        this.lockInfos.set(key, lockInfo);

        coreLog(`location lock key: ${key} instanceId: ${instanceId}`);

        // todo 改成类方法
        if (time > 0) {
            let timeWaitAsync = async () => {
                let lockInfoInstanceId = lockInfo.instanceId;
                await TimerMgr.getInst().waitAsync(time);
                if (lockInfo.instanceId != lockInfoInstanceId) {
                    return;
                }

                this.unLock(key, instanceId, instanceId);
            }

            timeWaitAsync();
        }
    }

    public unLock(key: number, oldInstanceId: number, newInstanceId: number) {
        let lockInfo = this.lockInfos.get(key)

        if (!lockInfo) {
            coreError(`location unlock not found key: ${key} {oldInstanceId}`);
            return;
        }

        if (oldInstanceId != lockInfo.LockInstanceId) {
            coreError(`location unlock oldInstanceId is different: ${key} {oldInstanceId}`);
            return;
        }

        coreLog(`location unlock key: ${key} instanceId: ${oldInstanceId} newInstanceId: ${newInstanceId}`);

        this.locations.set(key, newInstanceId)
        this.lockInfos.delete(key);

        // 解锁
        lockInfo.dispose();
    }

    public async get(key: number): Promise<number> {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.Location, key.toString());
        try {
            let instanceId = this.locations.get(key);

            return instanceId;
        } finally {
            lock.dispose();
        }
    }
}