
import { DEVELOP } from "../../Macro";
import { moyeErrorF, moyeWarnF } from "../Logger/CoreLogHelper";
import { ObjectPool } from "../ObjectPool/ObjectPool";
import { Singleton } from "../Singleton/Singleton";
import { Task } from "../Task/Task";
import { TimerMgr } from "../Timer/TimerMgr";

export const CoroutineLockTag = 'CoroutineLock';

export class CoroutineLockItem {
    key: string;
    task: Task;
    private _timeoutInfo: string;
    private _timerId: number;

    init(key: string) {
        this.key = key;
        this.task = Task.create();

        // 开发阶段进行检查 60s还没解锁一般都是bug了
        if(DEVELOP){
            this.setTimeout(60 * 1000, 'CoroutineLock timeout');
        }
    }

    /**
     * timeout tips
     * @param timeout ms
     * @param info 
     * @returns 
     */
    private setTimeout(timeout: number, info: string) {
        if(!DEVELOP){
            return;
        }

        this.deleteTimeout();

        this._timerId = TimerMgr.get().newOnceTimer(timeout, this.timeout.bind(this));
        this._timeoutInfo = info;
    }

    private deleteTimeout() {
        if(!DEVELOP){
            return;
        }

        if(this._timerId == null){
            return;
        }

        TimerMgr.get().remove(this._timerId);
        this._timerId = null;
    }

    private async timeout() {
        if(!DEVELOP){
            return;
        }

        moyeWarnF(CoroutineLockTag, 'CoroutineLock timeout key: {0}, info: {1}', this.key, this._timeoutInfo);
    }

    dispose() {
        if(this.key == null){
            moyeWarnF(CoroutineLockTag, 'repeat dispose CoroutineLockItem');
            return;
        }

        this.deleteTimeout();

        CoroutineLock.get().runNextLock(this);

        this.key = null;
        this.task = null;
    }
}

export class CoroutineLock extends Singleton {
    private _lockMap: Map<string, Set<CoroutineLockItem>> = new Map;

    async wait(lockType: string, key: string) {
        const newKey = `${lockType}_${key}`;
        let lockSet = this._lockMap.get(newKey);

        if (!lockSet) {
            lockSet = new Set;

            this._lockMap.set(newKey, lockSet);
        }

        const lock = ObjectPool.get().fetch(CoroutineLockItem);

        lock.init(newKey);

        lockSet.add(lock);

        if (lockSet.size > 1) {
            await lock.task;
        } else {
            lock.task.setResult();
        }

        return lock;
    }

    runNextLock(lock: CoroutineLockItem) {
        const lockSet = this._lockMap.get(lock.key);

        lockSet.delete(lock);
        ObjectPool.get().recycle(lock);

        for (const nextLock of Array.from(lockSet.values())) {
            nextLock.task.setResult();
            break;
        }
    }
}