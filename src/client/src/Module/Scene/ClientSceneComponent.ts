import { Entity } from "../../../../common/Entity/Entity";
import { Scene } from "../../../../common/Entity/Scene";

/**
 * 客户端的clientscene添加到该组件下面
 */
export class ClientSceneComponent extends Entity {
    public static inst: ClientSceneComponent

    awake(): void {
        ClientSceneComponent.inst = this
    }

    destroy(): void {
        ClientSceneComponent.inst = null
    }

    public get(id: number): Scene {
        let scene = this.getChild(Scene, id);
        return scene;
    }

    public remove(id: number) {
        this.removeChild(id);
    }
}
