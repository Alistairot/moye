import { Entity } from "../../../../../common/Entity/Entity";
import { EntitySceneFactory } from "../../../../../common/Entity/EntitySceneFactory";
import { Scene } from "../../../../../common/Entity/Scene";
import { IdGenerator } from "../../../../../common/Core/IdGenerator/IdGenerator";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";
import { Unit } from "../../../Module/Unit/Unit";
import { UnitComponent } from "../../../Module/Unit/UnitComponent";

/**
 * 管理Gate上的MapScene
 */
export class GateMapComponent extends Entity {
    mapScene: Scene

    awake(): void {
        this.mapScene = EntitySceneFactory.createScene({
            sceneType: SceneTypeCore.Map,
            id: IdGenerator.getInst().generateId(),
            name: 'GateMap',
            parent: this,
        });

        this.mapScene.addComponent(UnitComponent);
    }

    addUnit(unit: Unit){
        this.mapScene.getComponent(UnitComponent).addChild(unit);
    }
}