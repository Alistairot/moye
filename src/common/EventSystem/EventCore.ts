import { type Entity } from "../Entity/Entity";
import { AEvent } from "../Event/AEvent";

export class EntryEvent extends AEvent {
}

export class NumericChange extends AEvent{
    public entity: Entity;
    public numericType: number;
    public old: number;
    public new: number;
}

export class NetErrorEvent extends AEvent{
    channelId: number;
    error: number;
}