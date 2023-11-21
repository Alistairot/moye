import { LocationProxyComponent } from "../ActorLocation/LocationProxyComponent";
import { Unit } from "./Unit";

export class UnitRemoveHelper{
    static remove(unit: Unit){
        LocationProxyComponent.inst.remove(unit.id);
    }
}