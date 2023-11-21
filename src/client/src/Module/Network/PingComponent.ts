import { Entity } from "../../../../common/Entity/Entity";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { Session } from "../../../../common/Message/Session";
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper";
import { TimeInfo } from "../../../../common/Core/Time/TimeInfo";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { C2G_Ping, G2C_Ping } from "../../Game/Message/OuterMessageCore/OuterMessageCore";

export class PingComponent extends Entity {
    public Ping: number

    awake() {
        this.PingAsync()
    }

    private async PingAsync() {
        await TimerMgr.getInst().waitAsync(5000);
        
        let session = this.getParent(Session);
        let instanceId = this.instanceId;

        while (true) {
            if (this.instanceId != instanceId) {
                return;
            }

            let time1 = TimeHelper.clientNow();
            try {
                if(!session || session.isDisposed){
                    return;
                }
                
                let response = await session.Call(new C2G_Ping()) as G2C_Ping;

                if(response == null){
                    coreLog('ping 没有 回应')
                    return
                }

                if (this.instanceId != instanceId) {
                    return;
                }

                let time2 = TimeHelper.clientNow();
                this.Ping = time2 - time1;

                TimeInfo.getInst().ServerMinusClientTime = response.time + (time2 - time1) / 2 - time2;

                if(DEVELOP){
                    coreLog(`网络延迟=${this.Ping}`)
                }

                await TimerMgr.getInst().waitAsync(5000);
            }
            catch (e) {
                // session断开导致ping rpc报错，记录一下即可，不需要打成error
                coreLog(`ping error: ${this.id} ${e}`);
                return;
            }
        }
    }
}