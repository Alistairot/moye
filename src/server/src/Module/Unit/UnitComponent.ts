import { Entity } from "../../../../common/Entity/Entity";
import { Unit } from "./Unit";

export class UnitComponent extends Entity {
    get(id: number): Unit {
        let unit = this.getChild(Unit, id);
        return unit;
    }

    remove(id: number) {
        let unit = this.getChild(Unit, id);
        unit?.dispose();
    }
}