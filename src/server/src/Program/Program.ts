import "./Import"
import { CoroutineLock } from "../../../common/CoroutineLock/CoroutineLock"
import { FlagMgr } from "../../../common/Decorator/FlagMgr"
import { Root } from "../../../common/Entity/Root"
import { EventSystem } from "../../../common/EventSystem/EventSystem"
import { IdGenerator } from "../../../common/Core/IdGenerator/IdGenerator"
import { MessageTypeMgr } from "../../../common/Message/MessageTypeMgr"
import { NetServices } from "../../../common/Network/NetServices"
import { ObjectPool } from "../../../common/Core/ObjectPool/ObjectPool"
import { Game } from "../../../common/Core/Singleton/Game"
import { TimeInfo } from "../../../common/Core/Time/TimeInfo"
import { TimerMgr } from "../../../common/Timer/TimerMgr"
import { LoggerLoader } from "./Loader/LoggerLoader"
import { OptionsLoader } from "./Loader/OptionsLoader"
import { coreError, coreLog } from "../../../common/Core/Logger/CoreLogHelper"
import { DBSerializeMgr } from "../Module/DB/DBSerializeMgr"
import { ProcessMgr } from "../Module/Process/ProcessMgr"
import { Options } from "../../../common/Core/Options/Options"
import { AppType } from "../../../common/Core/Options/AppType"
import { InvokeMgr } from "../../../common/Invoke/InvokeMgr"
import { ProcessStartMgr } from "../Module/Process/ProcessStartMgr"
import { EntryEvent } from "../../../common/EventSystem/EventCore"
import { SceneMgr } from "../Module/Scene/SceneMgr"
import { ActorMessageSenderMgr } from "../Module/Actor/ActorMessageSenderMgr"
import { ActorLocationSenderComponent } from "../Module/ActorLocation/ActorLocationSenderComponent"
import { NetInnerComponent } from "../Module/Message/InnerMessage/NetInnerComponent"
import { MachineMgr } from "../Module/Machine/MachineMgr"
import { InitHelper } from "./InitHelper"
import { SceneCreator } from "../Module/Scene/SceneCreator"
import { LoginMgr } from "../Game/Scene/Realm/LoginMgr"
import { FrameFinishActionMgr } from "../../../common/FrameFinishAction/FrameFinishActionMgr"
import { MessageParserMgr } from "../../../common/Message/MessageParserMgr"
import { MsgPrinter } from "../../../common/Message/MsgPrinter"
import { OuterMessageMsgDispatcher } from "../Module/Message/OuterMessage/OuterMessageMsgDispatcher"
import { InnerMessageDispatcher } from "../Module/Message/InnerMessage/InnerMessageDispatcher"
import { MessageDispatcherMgr } from "../../../common/Message/MessageDispatcherMgr"
import { ActorMessageDispatcherMgr } from "../Module/Actor/ActorMessageDispatcherMgr"
import { OuterMessageCoreOpcode } from "../Game/Message/OuterMessageCore/OuterMessageCoreOpcode"
import { LocationProxyComponent } from "../Module/ActorLocation/LocationProxyComponent"
import { ResponseTypeMgr } from "../Module/Actor/ResponseTypeMgr"
import { ObjectSerializeMgr } from "../Module/Serialize/ObjectSerializeMgr"
import { TaskQueueMgr } from "../../../common/Task/TaskQueueMgr"

export class Program {
    /**
     * 框架初始化 必须调用
     */
    static init() {
        coreLog('try program-init')

        OptionsLoader.run()
        LoggerLoader.run()

        Game.addSingleton(MachineMgr)
        Game.addSingleton(ProcessMgr)
        Game.addSingleton(SceneMgr)

        coreLog('program-init done')
    }

    /**
     * 确保所有脚本已经加载之后调用start
     */
    static async start() {
        if(!InitHelper.checkInitStatus()){
            coreError(`初始化失败`);
            return
        }

        Game.addSingleton(ObjectPool);

        MachineMgr.getInst().start();
        ProcessMgr.getInst().start();
        SceneMgr.getInst().start();

        // 守护进程的话 负责其他进程的启动就好了
        if(Options.getInst().appType == AppType.Watcher){
            coreLog('Watcher 启动')
            Game.addSingleton(ProcessStartMgr).run()
            return
        }

        coreLog('try program-start')

        this.addSingleton()
        this.addRootSceneCom()
        this.startTimer()

        // 发送入口事件
        await EventSystem.getInst().publishAsync(Root.getInst().scene, new EntryEvent())

        // 入口事件处理完就该创建scene了
        SceneCreator.run();

        // 忽略ping消息
        MsgPrinter.getInst().ignore(OuterMessageCoreOpcode.C2G_Ping)
        MsgPrinter.getInst().ignore(OuterMessageCoreOpcode.G2C_Ping)
        
        coreLog('program-start done');
    }

    /**
     * 启动update定时器
     */
    private static startTimer() {
        setInterval(() => {
            try {
                this.update();
                this.lateUpdate();
            }
            catch (e) {
                coreError(e);
            }
        }, 1)
    }

    private static update(): void {
        Game.update()
    }

    private static lateUpdate(): void {
        Game.lateUpdate();
        Game.frameFinishUpdate();
    }

    private static addSingleton() {
        Game.addSingleton(InvokeMgr);
        Game.addSingleton(EventSystem);
        Game.addSingleton(TimeInfo)
        Game.addSingleton(IdGenerator);
        Game.addSingleton(CoroutineLock);
        Game.addSingleton(TimerMgr)
        Game.addSingleton(MessageTypeMgr);
        Game.addSingleton(NetServices);
        Game.addSingleton(FlagMgr)
        Game.addSingleton(Root)
        Game.addSingleton(DBSerializeMgr);
        Game.addSingleton(ActorMessageSenderMgr);
        Game.addSingleton(LoginMgr)
        Game.addSingleton(FrameFinishActionMgr);
        Game.addSingleton(MessageParserMgr);
        Game.addSingleton(MsgPrinter);
        Game.addSingleton(OuterMessageMsgDispatcher);
        Game.addSingleton(InnerMessageDispatcher);
        Game.addSingleton(MessageDispatcherMgr);
        Game.addSingleton(ActorMessageDispatcherMgr);
        Game.addSingleton(ResponseTypeMgr);
        Game.addSingleton(ObjectSerializeMgr);
        Game.addSingleton(TaskQueueMgr);
    }

    private static addRootSceneCom() {
        let rootScene = Root.getInst().scene;

        rootScene.addComponent(ActorLocationSenderComponent);
        rootScene.addComponent(NetInnerComponent);
        rootScene.addComponent(LocationProxyComponent);
    }
}