import { AEventHandler, AfterProgramInit, EventDecorator, Game, Root, Scene, SceneType } from "../Core/Core";
import { NetServices } from "./NetServices";

@EventDecorator(AfterProgramInit, SceneType.PROCESS)
export class AfterProgramInitHandler extends AEventHandler<AfterProgramInit>{
    protected run(scene: Scene, args: AfterProgramInit) {
        Game.addSingleton(NetServices);
    }
}