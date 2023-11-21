import { InstanceIdStruct } from "../../../../common/Core/IdGenerator/InstanceIdStruct";
import { ObjectPool } from "../../../../common/Core/ObjectPool/ObjectPool";

export class InstanceIdHelper{
    static getSceneInstanceId(processId: number, sceneId: number){
        let objectPool = ObjectPool.getInst()

        let instanceIdStruct = objectPool.fetch(InstanceIdStruct)
        instanceIdStruct.initArgs2(processId, sceneId);
        let instanceId = instanceIdStruct.ToLong();

        objectPool.recycle(instanceIdStruct)

        return instanceId;
    }

    static getProcessId(actorId: number){
        let objectPool = ObjectPool.getInst()

        let instanceIdStruct = objectPool.fetch(InstanceIdStruct)
        instanceIdStruct.initArgs1(actorId);
        let processId = instanceIdStruct.Process;

        objectPool.recycle(instanceIdStruct);

        return processId;
    }
}