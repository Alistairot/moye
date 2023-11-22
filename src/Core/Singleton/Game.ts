import { Task } from "../Task/Task";
import { ILifeCycle } from "../Type/ILifeCycle";

export class Game {
    private static readonly _singletonMap: Map<new () => ILifeCycle, ILifeCycle> = new Map;
    private static readonly _singletons: Array<ILifeCycle> = [];
    private static readonly _destroys: Array<ILifeCycle> = [];
    private static readonly _updates: Array<ILifeCycle> = [];
    private static readonly _lateUpdates: Array<ILifeCycle> = [];
    private static _frameFinishTaskQueue: Task<any>[] = [];

    public static addSingleton<T extends ILifeCycle>(singletonType: new () => T): T {
        if (Game._singletonMap.has(singletonType)) {
            throw new Error(`already exist singleton: ${singletonType.name}`);
        }

        const singleton = new singletonType();

        singletonType['_inst'] = singleton;

        Game._singletonMap.set(singletonType, singleton);
        Game._singletons.push(singleton);

        if (singleton.awake) {
            singleton.awake();
        }

        Game._destroys.push(singleton);

        if (singleton.update) {
            Game._updates.push(singleton);
        }

        if (singleton.lateUpdate) {
            Game._lateUpdates.push(singleton);
        }

        return singleton as T;
    }

    public static async waitFrameFinish(): Promise<void> {
        const task = Task.create();

        Game._frameFinishTaskQueue.push(task);

        await task;
    }

    public static update(): void {
        for (let index = 0; index < Game._updates.length; index++) {
            const update = Game._updates[index];
            const singleton = update;

            if (singleton.isDisposed) {
                continue;
            }

            update.update();
        }
    }

    public static lateUpdate(): void {
        for (let index = 0; index < Game._lateUpdates.length; index++) {
            const lateUpdate = Game._lateUpdates[index];
            const singleton = lateUpdate;

            if (singleton.isDisposed) {
                continue;
            }

            lateUpdate.lateUpdate();
        }
    }

    public static frameFinishUpdate(): void {
        const len = Game._frameFinishTaskQueue.length;

        if (len == 0) {
            return;
        }

        for (let index = 0; index < len; index++) {
            const task = Game._frameFinishTaskQueue[index];

            task.setResult();
        }

        Game._frameFinishTaskQueue = [];
    }

    public static dispose() {
        for (let index = Game._singletons.length - 1; index >= 0; index--) {
            const singleton = Game._singletons[index];

            if (singleton.isDisposed) {
                continue;
            }

            singleton._onPreDestroy();
        }
    }
}