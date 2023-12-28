import { AEventHandler, AfterSingletonAdd, EventDecorator, Game, Scene, SceneType } from "../Core/Core";
import { MsgMgr } from "./MsgMgr";
import { MsgSerializeMgr } from "./MsgSerializeMgr";

@EventDecorator(AfterSingletonAdd, SceneType.PROCESS)
export class AfterSingletonAddHandler extends AEventHandler<AfterSingletonAdd>{
    protected run(scene: Scene, args: AfterSingletonAdd) {
        switch (args.singletonType) {
        case MsgMgr: {
            Game.addSingleton(MsgSerializeMgr);
            break;
        }

        default: {
            break;
        }
        }
    }
}