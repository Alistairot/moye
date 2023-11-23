import { Scene } from "../Core/Entity/Scene";
import { SceneType } from "../Core/Entity/SceneType";
import { AEventHandler } from "../Core/EventSystem/AEventHandler";
import { AfterProgramInit } from "../Core/EventSystem/EventCore";
import { EventDecorator } from "../Core/EventSystem/EventDecorator";
import { Game } from "../Core/Singleton/Game";
import { MoyeAssets } from "./MoyeAssets";

@EventDecorator(AfterProgramInit, SceneType.NONE)
class AfterProgramInitHandler extends AEventHandler<AfterProgramInit>{
    protected run(scene: Scene, args: AfterProgramInit) {
        Game.addSingleton(MoyeAssets);
    }
}