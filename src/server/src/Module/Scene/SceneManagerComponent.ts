import { Entity } from "../../../../common/Entity/Entity";

/**
 * StartScene的父节点 其它的Scene也可以挂在这下面 看个人需求
 * StartScene: 启动的时候就创建的scene
 */
export class SceneManagerComponent extends Entity{
    public static inst: SceneManagerComponent

    awake(): void {
        SceneManagerComponent.inst = this
    }

    destroy(): void {
        SceneManagerComponent.inst = null
    }
}