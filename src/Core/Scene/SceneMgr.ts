import { Scene } from "../Entity/Scene";
import { Singleton } from "../Singleton/Singleton";

export class SceneMgr extends Singleton {
    process: Scene;
    client: Scene;
    current: Scene;
}