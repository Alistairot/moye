import { AEventHandler, BeforeProgramStart, EventDecorator, Game, Root, Scene, SceneType } from "../Core/Core";
import { MessageDispatcherMgr } from "./MsgHandler/MessageDispatcherMgr";
import { MsgMgr } from "./MsgMgr";

@EventDecorator(BeforeProgramStart, SceneType.PROCESS)
export class BeforeProgramStartHandler extends AEventHandler<BeforeProgramStart>{
    protected run(scene: Scene, args: BeforeProgramStart) {
        Game.addSingleton(MsgMgr);
        Game.addSingleton(MessageDispatcherMgr);
    }
}