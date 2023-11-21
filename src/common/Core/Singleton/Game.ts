import { ILifecycle } from "../../Entity/ILifecycle";
import { Task } from "../Task/Task";

export class Game {
    private static readonly singletonMap: Map<new () => ILifecycle, ILifecycle> = new Map
    private static readonly singletons: Array<ILifecycle> = new Array
    private static readonly destroys: Array<ILifecycle> = new Array
    private static readonly updates: Array<ILifecycle> = new Array
    private static readonly lateUpdates: Array<ILifecycle> = new Array
    private static frameFinishTaskQueue: Task<any>[] = new Array

    public static addSingleton<T extends ILifecycle>(singletonCtor: new () => T): T {
        if (Game.singletonMap.has(singletonCtor)) {
            throw new Error(`already exist singleton: ${singletonCtor.name}`);
        }

        let singleton = new singletonCtor()

        ///@ts-ignore
        singletonCtor._inst = singleton

        Game.singletonMap.set(singletonCtor, singleton)
        Game.singletons.push(singleton)

        if (singleton.awake) {
            singleton.awake()
        }

        Game.destroys.push(singleton)

        if (singleton.update) {
            Game.updates.push(singleton)
        }

        if (singleton.lateUpdate) {
            Game.lateUpdates.push(singleton)
        }

        return singleton as T
    }

    public static async waitFrameFinish(): Promise<void> {
        let task = Task.create()

        Game.frameFinishTaskQueue.push(task);

        await task;
    }

    public static update(): void {
        for (let index = 0; index < Game.updates.length; index++) {
            let update = Game.updates[index];
            let singleton = update

            if (singleton.isDisposed) {
                continue
            }

            ///@ts-ignore
            update.update()
        }
    }

    public static lateUpdate(): void {
        for (let index = 0; index < Game.lateUpdates.length; index++) {
            let lateUpdate = Game.lateUpdates[index];
            let singleton = lateUpdate

            if (singleton.isDisposed) {
                continue
            }

            ///@ts-ignore
            lateUpdate.lateUpdate()
        }
    }

    public static frameFinishUpdate(): void {
        let len = Game.frameFinishTaskQueue.length

        if (len == 0) {
            return
        }

        for (let index = 0; index < len; index++) {
            const task = Game.frameFinishTaskQueue[index]

            task.setResult()
        }

        Game.frameFinishTaskQueue = []
    }

    public static dispose() {
        for (let index = Game.singletons.length - 1; index >= 0; index--) {
            let singleton = Game.singletons[index]

            if (singleton.isDisposed) {
                continue
            }

            singleton._onPreDestroy()
        }
    }
}