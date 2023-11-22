import { ILifeCycle } from "../Type/ILifeCycle";
import { Singleton } from "./Singleton";

export class EntityCenter extends Singleton{
    private _allEntities: Map<number, ILifeCycle> = new Map;
    
    add(entity: ILifeCycle): void {
        this._allEntities.set(entity.instanceId, entity);
    }

    remove(instanceId: number): void {
        this._allEntities.delete(instanceId);
    }

    get(instanceId: number): ILifeCycle {
        const component = this._allEntities.get(instanceId);

        return component;
    }
}