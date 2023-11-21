import { coreError, coreWarn } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { ObjectPool } from "../Core/ObjectPool/ObjectPool";
import { Singleton } from "../Core/Singleton/Singleton";
import { Task } from "../Core/Task/Task";
import { TimerMgr } from "../Timer/TimerMgr";

export class CoroutineLockItem {
    public key: string
    public task: Task<void>
    private _timeoutInfo: string;
    private _timerId1: number;
    private _timerId2: number;

    init(key: string) {
        this.key = key;
        this.task = Task.create();

        // 开发阶段进行检查 一分钟还没解锁一般都是bug了
        if(DEVELOP){
            this._timerId2 = TimerMgr.getInst().newOnceTimer(60 * 1000, this.timeout.bind(this));
            this._timeoutInfo = '60秒没有解锁 出大问题了';
        }
    }

    /**
     * 
     * @param timeout 用于开发阶段 多久没解锁就打印警告
     * @param info 
     * @returns 
     */
    setTimeoutInfo(timeout: number, info: string) {
        if(DEVELOP){
            if(this._timerId1){
                coreError(`CoroutineLockItem repeat setTimeoutInfo`)
                return;
            }

            this._timerId1 = TimerMgr.getInst().newOnceTimer(timeout, this.timeout.bind(this));
            this._timeoutInfo = info;
        }
    }

    private async timeout() {
        if (DEVELOP) {
            coreWarn(`CoroutineLockItem timeout key: ${this.key}`)
            coreWarn(`CoroutineLockItem timeout info: ${this._timeoutInfo}`)
        }
    }

    dispose() {
        if(DEVELOP){
            if(this._timerId1){
                TimerMgr.getInst().remove(this._timerId1);
                this._timerId1 = null;
            }

            TimerMgr.getInst().remove(this._timerId2);
            this._timerId2 = null;
            this._timeoutInfo = null;

            if(this.key == null){
                coreError(`CoroutineLockItem repeat dispose`)
                return;
            }
        }

        CoroutineLock.getInst().runNextLock(this)

        this.key = null;
        this.task = null;
    }
}

export class CoroutineLock extends Singleton {
    private lockMap: Map<string, Set<CoroutineLockItem>> = new Map

    public async wait(lockType: string, key: string) {
        let newKey = `${lockType}_${key}`;
        let lockSet = this.lockMap.get(newKey);

        if (!lockSet) {
            lockSet = new Set;

            this.lockMap.set(newKey, lockSet);
        }

        let lock = ObjectPool.getInst().fetch(CoroutineLockItem);

        lock.init(newKey);

        lockSet.add(lock);

        if (lockSet.size > 1) {
            await lock.task;
        } else {
            lock.task.setResult();
        }

        return lock;
    }

    public runNextLock(lock: CoroutineLockItem) {
        let lockSet = this.lockMap.get(lock.key)

        lockSet.delete(lock)
        ObjectPool.getInst().recycle(lock)

        for (const nextLock of Array.from(lockSet.values())) {
            nextLock.task.setResult()
            break
        }
    }
}