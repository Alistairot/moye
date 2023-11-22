import { AfterSingletonAdd, BeforeSingletonAdd } from "../EventSystem/EventCore";
import { MoyeEventCenter } from "../EventSystem/MoyeEventCenter";
import { Task } from "../Task/Task";
import { ILifeCycle } from "../Type/ILifeCycle";
import { Singleton } from "./Singleton";

export class Game {
    private static _singletonMap: Map<new () => Singleton, Singleton> = new Map;
    private static _singletons: Array<Singleton> = [];
    private static _destroys: Array<ILifeCycle> = [];
    private static _updates: Array<ILifeCycle> = [];
    private static _lateUpdates: Array<ILifeCycle> = [];
    private static _frameFinishTaskQueue: Task<any>[] = [];

    static addSingleton<T extends Singleton>(singletonType: new () => T, isNotify: boolean = true): T {
        if (Game._singletonMap.has(singletonType)) {
            throw new Error(`already exist singleton: ${singletonType.name}`);
        }

        if (isNotify) {
            MoyeEventCenter.inst.publish(BeforeSingletonAdd.create({ singletonType: singletonType }));
        }

        const singleton = new singletonType();

        singletonType['_inst'] = singleton;

        Game._singletonMap.set(singletonType, singleton);
        Game._singletons.push(singleton);

        const inst = singleton as unknown as ILifeCycle;

        if (inst.awake) {
            inst.awake();
        }

        Game._destroys.push(inst);

        if (inst.update) {
            Game._updates.push(inst);
        }

        if (inst.lateUpdate) {
            Game._lateUpdates.push(inst);
        }

        if (isNotify) {
            MoyeEventCenter.inst.publish(AfterSingletonAdd.create({ singletonType: singletonType }));
        }

        return singleton as T;
    }

    static async waitFrameFinish(): Promise<void> {
        const task = Task.create();

        Game._frameFinishTaskQueue.push(task);

        await task;
    }

    static update(): void {
        for (let index = 0; index < Game._updates.length; index++) {
            const update = Game._updates[index];
            const singleton = update;

            if (singleton.isDisposed) {
                continue;
            }

            update.update();
        }
    }

    static lateUpdate(): void {
        for (let index = 0; index < Game._lateUpdates.length; index++) {
            const lateUpdate = Game._lateUpdates[index];
            const singleton = lateUpdate;

            if (singleton.isDisposed) {
                continue;
            }

            lateUpdate.lateUpdate();
        }
    }

    static frameFinishUpdate(): void {
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

    static dispose() {
        for (let index = Game._singletons.length - 1; index >= 0; index--) {
            const inst = Game._singletons[index] as unknown as ILifeCycle;

            if (inst.isDisposed) {
                continue;
            }

            inst._onPreDestroy();
        }
    }
}