import { Component, _decorator, director, game } from "cc";
import { Game } from "../Singleton/Game";

const { ccclass, property } = _decorator;

@ccclass('MoyeRuntime')
export class MoyeRuntime extends Component {
    start() {
        director.addPersistRootNode(this.node);
    }

    protected update(dt: number): void {
        Game.update(dt * 1000);
    }

    protected lateUpdate(dt: number): void {
        Game.lateUpdate(dt * 1000);
        Game.frameFinishUpdate();
    }

    protected onDestroy(): void {
        Game.dispose();
    }
}