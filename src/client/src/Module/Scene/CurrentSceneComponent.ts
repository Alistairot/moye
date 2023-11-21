import { Entity } from "../../../../common/Entity/Entity";
import { Scene } from "../../../../common/Entity/Scene";

/**
 * 客户端CurrentScene添加到该组件下面
 */
export class CurrentSceneComponent extends Entity {
    public scene: Scene
}