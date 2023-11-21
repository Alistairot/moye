import { type Entity } from "../Entity/Entity"

export interface IEventSystem {
    registerSystem(component: Entity): void
    awakeComEvent(component: Entity): void
    destroyComEvent(component: Entity): void
}