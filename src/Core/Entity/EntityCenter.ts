
import { Singleton } from "../Singleton/Singleton";
import { IEntity } from "../Type/IEntity";

export class EntityCenter extends Singleton{
    private _allEntities: Map<bigint, IEntity> = new Map;
    
    add(entity: IEntity): void {
        this._allEntities.set(entity.instanceId, entity);
    }

    remove(instanceId: bigint): void {
        this._allEntities.delete(instanceId);
    }

    get(instanceId: bigint): IEntity {
        const component = this._allEntities.get(instanceId);

        return component;
    }
}