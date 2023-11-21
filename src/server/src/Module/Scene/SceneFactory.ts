import { Entity } from "../../../../common/Entity/Entity";
import { EntitySceneFactory } from "../../../../common/Entity/EntitySceneFactory";
import { Root } from "../../../../common/Entity/Root";
import { Scene } from "../../../../common/Entity/Scene";
import { EventSystem } from "../../../../common/EventSystem/EventSystem";
import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { SceneCreateEvent } from "../../Game/Event/EventTypeCore";
import { MailBoxComponent } from "../Actor/MailBoxComponent";
import { MailboxType } from "../Actor/MailboxType";
import { NetServerComponent } from "../Message/OuterMessage/NetServerComponent";
import { AfterCreateSceneHandler } from "./AfterCreateSceneHandler";
import { IChildSceneCfg } from "./IChildSceneCfg";
import { ISceneInfo } from "./ISceneInfo";
import { InstanceIdHelper } from "./InstanceIdHelper";
import { SceneMgr } from "./SceneMgr";

/**
 * scene工厂
 */
export class SceneFactory {
    static createByInfo(parent: Entity, info: ISceneInfo): Scene {
        let scene = EntitySceneFactory.createScene({
            id: info.id,
            instanceId: info.instanceId,
            sceneType: info.sceneType,
            name: info.name,
            parent: parent,
        });

        scene.addComponent(MailBoxComponent).init(MailboxType.UnOrderMessageDispatcher);

        /**
         * 如果有外网端口的话 就开启外网服务
         */
        if (info.outerPort) {
            let listenAddress = new IPEndPoint(info.innerIp, info.outerPort);

            scene.addComponent(NetServerComponent).init(listenAddress)
        }

        // 方便在框架内部先进行一些处理
        AfterCreateSceneHandler.run(scene, info);

        let rootScene = Root.getInst().scene;
        EventSystem.getInst().publish(rootScene, SceneCreateEvent.create({
            scene: scene,
            sceneInfo: info,
        }))

        return scene;
    }

    /**
     * child scene不会注册到scenemgr 需要自己管理
     * @param parent 
     * @param args 
     */
    static createChildScene(parent: Scene, args: IChildSceneCfg): Scene {
        let sceneMgr = SceneMgr.getInst();
        let parentSceneInfo = sceneMgr.getSceneById(parent.id)
        let instanceId = args.instanceId;

        if (!instanceId) {
            instanceId = InstanceIdHelper.getSceneInstanceId(parentSceneInfo.processId, args.id)
        }

        return this.createByInfo(parent, {
            id: args.id,
            name: args.name,
            innerIp: parentSceneInfo.innerIp,
            outerIp: parentSceneInfo.outerIp,
            machineId: parentSceneInfo.machineId,
            processId: parentSceneInfo.processId,
            sceneType: args.sceneType,
            instanceId: instanceId,
        });
    }
}