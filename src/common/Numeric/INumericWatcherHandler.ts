import { type Entity } from "../Entity/Entity";
import { type NumericChange } from "../EventSystem/EventCore";

export interface INumericWatcherHandler {
    run(unit: Entity, args: NumericChange): void;
}