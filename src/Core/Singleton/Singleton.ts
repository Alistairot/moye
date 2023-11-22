/**
 * 单例基类
 */
export abstract class Singleton {
    private static _inst: any;
    private _isDisposed: boolean = false;

    static getInst<T extends Singleton>(this: new () => T): T {
        const self = this as typeof Singleton & (new () => T);

        if (self._inst == null) {
            throw new Error(`Singleton is not initialized or destroyed, name is ${self.name}`);
        }

        return self._inst as T;
    }

    get isDisposed() {
        return this._isDisposed;
    }

    dispose() {
        this._onPreDestroy();
    }

    protected destroy?(): void;

    private _onPreDestroy(): void {
        if (this._isDisposed) {
            return;
        }

        if (this.destroy) {
            this.destroy();
        }

        Singleton._inst = null;

        this._isDisposed = true;
    }
}