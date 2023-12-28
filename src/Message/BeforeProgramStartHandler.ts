import { AEventHandler, BeforeProgramStart, EventDecorator, Game, Root, Scene, SceneType } from "../Core/Core";
import { MsgMgr } from "./MsgMgr";

@EventDecorator(BeforeProgramStart, SceneType.PROCESS)
export class BeforeProgramStartHandler extends AEventHandler<BeforeProgramStart>{
    protected run(scene: Scene, args: BeforeProgramStart) {
        Game.addSingleton(MsgMgr);
    }
}