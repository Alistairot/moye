
import { Type } from "../Type/Type";

export class Task<T = any> extends Promise<T> {
    private _resolve: (value: T | PromiseLike<T>) => void;

    /**
     * 创建一个新的task
     * @param type
     * @returns
     */
    static create<T = any>(type?: Type<T>): Task<T> {
        let resolveVar: (value: T | PromiseLike<T>) => void;
        const task = new Task<T>((resolve) => {
            resolveVar = resolve;
        });

        task._resolve = resolveVar;

        return task;
    }

    setResult(result?: T) {
        if (!this._resolve) {
            throw new Error(`setResult but task has been disposed`);
        }

        this._resolve(result);
        this.dispose();
    }

    /**
     * 不允许直接new
     * @param executor
     */
    private constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        super(executor);
    }

    private dispose() {
        this._resolve = null;
    }
}