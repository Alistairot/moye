import { IMessage } from "../../../../common/Message/IMessage";
import { MsgPrinter } from "../../../../common/Message/MsgPrinter";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";

/**
 * 用来在开发阶段检查消息
 * 比如检查rpc消息是否死锁了
 */
export class MsgCheck {
    private _msg: IMessage;
    private _timerId: number;
    private _prefix: string = '';

    /**
     * 指定时间内没有处理完消息就报错
     * @param msg 
     * @param time 
     */
    timeOut(msg: IMessage, time: number = 5 * 1000) {
        this._msg = msg;
        this._timerId = TimerMgr.getInst().newOnceTimer(time, this.logInfo.bind(this));
    }

    setPrefix(prefix: string) {
        this._prefix = prefix;
    }

    dispose() {
        if(this._timerId){
            TimerMgr.getInst().remove(this._timerId);
        }

        this._msg = null;
        this._timerId = null;
    }

    private logInfo() {
        MsgPrinter.getInst().print(this._msg, `${this._prefix}[消息堵塞]`);
    }
}