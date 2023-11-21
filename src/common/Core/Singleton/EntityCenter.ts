import { ILifeCycle } from "../Type/ILifeCycle";
import { Singleton } from "./Singleton";

export class EntityCenter extends Singleton{
    private allEntities: Map<number, ILifeCycle> = new Map;
    
    add(entity: ILifeCycle): void {
        this.allEntities.set(entity.instanceId, entity);
    }

    remove(instanceId: number): void {
        this.allEntities.delete(instanceId);
    }

    get(instanceId: number): ILifeCycle {
        let component = this.allEntities.get(instanceId);

        return component;
    }
}