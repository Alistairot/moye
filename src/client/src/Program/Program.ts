import "./Import"

import { CoroutineLock } from "../../../common/CoroutineLock/CoroutineLock"
import { IdGenerator } from "../../../common/Core/IdGenerator/IdGenerator"
import { ObjectPool } from "../../../common/Core/ObjectPool/ObjectPool"
import { Options } from "../../../common/Core/Options/Options"
import { Game } from "../../../common/Core/Singleton/Game"
import { TimeInfo } from "../../../common/Core/Time/TimeInfo"
import { TimerMgr } from "../../../common/Timer/TimerMgr"
import { LoggerLoader } from "./Loader/LoggerLoader"
import { CTFramework } from "./Loader/CTFramework"
import { EventSystem } from "../../../common/EventSystem/EventSystem"
import { NetServices } from "../../../common/Network/NetServices"
import { Root } from "../../../common/Entity/Root"
import { Node } from "cc"
import { TAssets } from "../Module/TAsset/TAssets"
import { EntryEvent } from "../../../common/EventSystem/EventCore"
import { MessageTypeMgr } from "../../../common/Message/MessageTypeMgr"
import { MessageDispatcherMgr } from "../../../common/Message/MessageDispatcherMgr"
import { EventSendHelper } from "../Module/Event/EventSendHelper"
import { NumericWatcherMgr } from "../../../common/Numeric/NumericWatcherMgr"
import { ClientSceneComponent } from "../Module/Scene/ClientSceneComponent"
import { MessageParserMgr } from "../../../common/Message/MessageParserMgr"
import { FlagMgr } from "../../../common/Decorator/FlagMgr"
import { InvokeMgr } from "../../../common/Invoke/InvokeMgr"
import { MsgPrinter } from "../../../common/Message/MsgPrinter"
import { FrameFinishActionMgr } from "../../../common/FrameFinishAction/FrameFinishActionMgr"

export class Program {
    static init(node: Node) {
        console.log('try program-init')

        LoggerLoader.run()

        Game.addSingleton(Options)
        Game.addSingleton(TimeInfo)
        Game.addSingleton(IdGenerator)
        Game.addSingleton(ObjectPool)
        Game.addSingleton(CoroutineLock)
        Game.addSingleton(TimerMgr)
        Game.addSingleton(TAssets)
        Game.addSingleton(MsgPrinter)
        node.addComponent(CTFramework)

        console.log('program-init done')
    }

    /**
     * 确保所有脚本已经加载之后调用start
     * 结束后会发布EntryEvent事件
     */
    static start() {
        console.log('try program-start')

        this.onStartLoadSingleton()
        this.onStartLoadRootScene()

        EventSendHelper.publishAsync(Root.getInst().scene, new EntryEvent());

        console.log('program-start done')
    }

    private static onStartLoadSingleton() {
        Game.addSingleton(FlagMgr)
        Game.addSingleton(InvokeMgr)
        Game.addSingleton(EventSystem)
        Game.addSingleton(NetServices)
        Game.addSingleton(Root)
        Game.addSingleton(MessageTypeMgr)
        Game.addSingleton(MessageDispatcherMgr)
        Game.addSingleton(NumericWatcherMgr)
        Game.addSingleton(MessageParserMgr)
        Game.addSingleton(FrameFinishActionMgr)
    }

    private static onStartLoadRootScene() {
        Root.getInst().scene.addComponent(ClientSceneComponent)
    }
}