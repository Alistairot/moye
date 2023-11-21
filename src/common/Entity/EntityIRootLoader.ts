import { Entity } from "./Entity";
import { IRoot } from "./IRoot";

export class EntityIRootLoader{
    static run(root: IRoot){
        Entity.IRoot = root
    }
}