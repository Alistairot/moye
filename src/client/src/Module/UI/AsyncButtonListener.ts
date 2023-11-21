/**
 * 按钮监听器 可以让按钮监听的回调执行完再执行下一次
 */
export class AsyncButtonListener {
    private _callback: Function
    private _isClick: boolean

    constructor(func: Function) {
        this._callback = func
    }

    async invoke(...args: any[]) {
        if(this._isClick)
        {
            return
        }

        this._isClick = true

        await this._callback(...args)

        this._isClick = false
    }
}