import { CoroutineLockItem } from "../../../../common/CoroutineLock/CoroutineLock";
import { Entity } from "../../../../common/Entity/Entity";

/**
 * 锁定instanceId的信息
 * todo 改成class用对象池可能会更好
 */
export class LockInfo extends Entity {
    public LockInstanceId: number;
    public CoroutineLock: CoroutineLockItem;

    init(lockInstanceId: number, coroutineLock: CoroutineLockItem) {
        this.CoroutineLock = coroutineLock;
        this.LockInstanceId = lockInstanceId;

        return this
    }

    destroy(): void {
        this.CoroutineLock.dispose();
        this.LockInstanceId = 0;
    }
}