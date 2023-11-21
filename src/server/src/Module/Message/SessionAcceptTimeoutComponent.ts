import { Entity } from "../../../../common/Entity/Entity";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";

/**
 * 用于处理session验证超时
 * 超时后断开连接
 */
export class SessionAcceptTimeoutComponent extends Entity {
    public Timer: number;

    awake() {
        this.Timer = TimerMgr.getInst().newOnceTimer(5 * 1000, this.timerCallback.bind(this));
    }

    private timerCallback() {
        let parendId = this.parent.id

        this.parent.dispose()
    }

    destroy(): void {
        TimerMgr.getInst().remove(this.Timer);

        this.Timer = 0
    }
}