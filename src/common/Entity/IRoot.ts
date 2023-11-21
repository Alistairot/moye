import { type Entity } from "./Entity"

export interface IRoot {
    add(entity: Entity): void
    remove(instanceId: number): void
    get(instanceId: number): Entity
}