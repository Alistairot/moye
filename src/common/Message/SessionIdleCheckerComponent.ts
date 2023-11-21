import { Entity } from "../Entity/Entity";
import { coreLog } from "../Core/Logger/CoreLogHelper";
import { Session } from "./Session";
import { ErrorCore } from "../Network/ErrorCore";
import { TimeHelper } from "../Core/Time/TimeHelper";
import { TimerMgr } from "../Timer/TimerMgr";

/**
 * 用于检测session长时间不通信的组件
 * 一旦发现长时间不通信就销毁session
 */
export class SessionIdleCheckerComponent extends Entity {
    public static CheckInteral = 2000;
    public static SessionTimeoutTime = 15 * 1000;
    public RepeatedTimer: number;

    awake() {
        this.RepeatedTimer = TimerMgr.getInst().newRepeatedTimer(SessionIdleCheckerComponent.CheckInteral, this.check.bind(this));
    }

    private check() {
        let session = this.getParent(Session);
        let timeNow = TimeHelper.clientNow();

        if (timeNow - session.LastRecvTime < SessionIdleCheckerComponent.SessionTimeoutTime && timeNow - session.LastSendTime < SessionIdleCheckerComponent.SessionTimeoutTime) {
            return;
        }

        session.Error = ErrorCore.ERR_SessionSendOrRecvTimeout;

        session.dispose();
    }

    destroy(): void {
        TimerMgr.getInst().remove(this.RepeatedTimer);
        this.RepeatedTimer = 0
    }
}