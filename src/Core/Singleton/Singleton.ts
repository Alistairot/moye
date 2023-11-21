/**
 * 单例基类
 */
export abstract class Singleton{
    private static _inst: any
    private _isDisposed: boolean = false

    static getInst<T extends Singleton>(this: new () => T): T {
        let self = this
        ///@ts-ignore
        let inst = self._inst

        if (inst == null) {
            throw new Error(`Singleton is not initialized, name is ${self.name}`)
        }

        return inst
    }

    get isDisposed() {
        return this._isDisposed
    }

    destroy?():void;

    dispose(){
        this._onPreDestroy()
    }

    _onPreDestroy(): void {
        if (this._isDisposed) {
            return
        }

        if (this.destroy) {
            this.destroy()
        }

        Singleton._inst = null;

        this._isDisposed = true;
    }
}