import { Node } from "cc";
import { Game } from "../Singleton/Game";
import { Options } from "../Options/Options";
import { Logger } from "../Logger/Logger";
import { EventSystem } from "../EventSystem/EventSystem";
import { TimeInfo } from "../Time/TimeInfo";
import { MoyeEventCenter } from "../EventSystem/MoyeEventCenter";
import { AfterProgramInit, AfterProgramStart, BeforeProgramInit, BeforeProgramStart } from "../EventSystem/EventCore";
import { MoyeRuntime } from "./MoyeRuntime";
import { ObjectPool } from "../ObjectPool/ObjectPool";
import { IdGenerator } from "../IdGenerator/IdGenerator";
import { EntityCenter } from "../Entity/EntityCenter";
import { EntityLifiCycleMgr } from "../Entity/EntityLifiCycleMgr";
import { Root } from "../Entity/Root";
import { TimerMgr } from "../Timer/TimerMgr";
import { CoroutineLock } from "../CoroutineLock/CoroutineLock";
import { SceneRefCom } from "../Scene/SceneRefCom";
import { SceneFactory } from "../Scene/SceneFactory";

export class Program {
    static init(rootNode: Node) {
        MoyeEventCenter.inst.publish(new BeforeProgramInit());

        Game.addSingleton(ObjectPool, false);
        Game.addSingleton(Options);
        Game.addSingleton(Logger);
        Game.addSingleton(EventSystem);
        Game.addSingleton(TimeInfo);
        Game.addSingleton(TimerMgr);
        Game.addSingleton(CoroutineLock);
        Game.addSingleton(IdGenerator);
        Game.addSingleton(EntityCenter);
        Game.addSingleton(EntityLifiCycleMgr);
        Game.addSingleton(Root);

        // add client runtime
        rootNode.addComponent(MoyeRuntime);

        MoyeEventCenter.inst.publish(new AfterProgramInit());
    }

    /**
     * 确保所有脚本已经加载之后调用start
     */
    static start() {
        // when loaded new scripts, need reload event
        MoyeEventCenter.inst.reloadEvent();
        MoyeEventCenter.inst.publish(new BeforeProgramStart());
        MoyeEventCenter.inst.publish(new AfterProgramStart());

        // create client scene
        Root.get().scene.addCom(SceneRefCom);
        SceneFactory.createClientScene();
    }
}