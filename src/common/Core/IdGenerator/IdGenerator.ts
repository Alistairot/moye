import { Singleton } from "../Singleton/Singleton";
import { IdStruct } from './IdStruct';
import { InstanceIdStruct } from './InstanceIdStruct';

export class IdGenerator extends Singleton {
    awake(): void {
    }

    public generateInstanceId(): number {
        return InstanceIdStruct.generate();
    }

    public generateId(): number {
        return IdStruct.generate();
    }
}