import { Component, _decorator, director } from "cc";
import { Game } from "../Singleton/Game";

const { ccclass, property } = _decorator;

@ccclass('MoyeRuntime')
export class MoyeRuntime extends Component {
    start() {
        director.addPersistRootNode(this.node);
    }

    protected update(dt: number): void {
        Game.update();
    }

    protected lateUpdate(dt: number): void {
        Game.lateUpdate();
        Game.frameFinishUpdate();
    }

    protected onDestroy(): void {
        Game.dispose();
    }
}