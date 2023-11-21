import { DEVELOP } from "../Macro"

interface IStaticFieldInfo {
    target: any
    key: any
}

export class Injector {
    private static _inst: Injector
    static get inst() {
        if (!this._inst) {
            this._inst = new Injector()
        }
        return this._inst
    }

    private _map: Map<string, IStaticFieldInfo[]> = new Map

    addField(type: string, target: any, key: any) {
        let list = this._map.get(type)
        if (!list) {
            list = []
            this._map.set(type, list)
        }
        list.push({ target, key })
    }

    staticField(type: string, inst: any) {
        let list = this._map.get(type)

        if (DEVELOP) {
            if (!list) {
                console.error(`StaticFieldDecorator: ${type} not found`)
            }
        }

        for (const info of list) {
            info.target[info.key] = inst
        }
    }
}