import { GatePlayer } from "../Scene/Gate/GatePlayer/GatePlayer";
import { Unit } from "../../Module/Unit/Unit";
import { ISceneInfo } from "../../Module/Scene/ISceneInfo";
import { Scene } from "../../../../common/Entity/Scene";
import { Session } from "../../../../common/Message/Session";
import { AEvent } from "../../../../common/Event/AEvent";

/**
 * 创建Unit后的事件
 * 可以在这里为Unit添加组件
 */
export class AfterCreateUnit extends AEvent {
    unit: Unit
    args: any
}

/**
 * 创建GatePlayer后的事件
 * 可以在这里为GatePlayer添加组件
 */
export class AfterCreateGatePlayer extends AEvent {
    player: GatePlayer
}

/**
 * unit传送之后的处理
 * 这个事件不会等待
 */
export class AfterUnitTransfer extends AEvent {
    unit: Unit
}

export class SceneCreateEvent extends AEvent {
    sceneInfo: ISceneInfo
    scene: Scene
}

/**
 * 只有gate可以收到这个事件
 */
export class AfterConnectUnit extends AEvent {
    unitId: number
    session: Session
}

/**
 * 只有gate可以收到这个事件
 */
export class AfterDisconnectUnit extends AEvent {
    unitId: number
}