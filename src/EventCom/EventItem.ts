import { Entity, RecycleObj } from "../Core/Core";

export class EventItem extends RecycleObj {
    entity: Entity;
    handler: Function;
    eventCode: number;
}