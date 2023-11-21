import { Singleton } from "../Singleton/Singleton";
import { IdStruct } from './IdStruct';
import { InstanceIdStruct } from './InstanceIdStruct';

export class IdGenerator extends Singleton {
    public generateInstanceId(): bigint {
        return InstanceIdStruct.generate();
    }

    public generateId(): bigint {
        return IdStruct.generate();
    }
}