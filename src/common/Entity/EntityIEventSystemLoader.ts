import { IEventSystem } from "../EventSystem/IEventSystem";
import { Entity } from "./Entity";

/**
 * 注册实体上的事件系统接口
 */
export class EntityIEventSystemLoader{
    static run(iSys: IEventSystem){
        Entity.IEventSystem = iSys
    }
}