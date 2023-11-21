import { InstanceIdStruct } from "../../../../common/Core/IdGenerator/InstanceIdStruct";
import { ObjectPool } from "../../../../common/Core/ObjectPool/ObjectPool";
import { Options } from "../../../../common/Core/Options/Options";

/**
 * 转化actorId的进程号，使其发送过去可以返回到本进程
 */
export class ProcessActorId {
    /**
     * 要发送过去的进程号
     */
    public Process: number;
    /**
     * 转化后的actorId
     */
    public ActorId: number;

    init(actorId: number) {
        let objectPool = ObjectPool.getInst()
        let instanceIdStruct = objectPool.fetch(InstanceIdStruct)

        instanceIdStruct.initArgs1(actorId)
        
        // 获取actorId的进程号
        this.Process = instanceIdStruct.Process;
        // 设置自己的进程号
        instanceIdStruct.Process = Options.getInst().process;
        instanceIdStruct.updateResult()
        // 返回新的id
        this.ActorId = instanceIdStruct.ToLong();

        objectPool.recycle(instanceIdStruct)
    }
}