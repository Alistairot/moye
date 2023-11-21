import { Entity } from "../../../../../common/Entity/Entity"
import { InjectorDecorator } from "../../../../../common/Injector/InjectorDecorator"
import { type UIManager } from "./UIManager"

export class UILifeComponent extends Entity {
    @InjectorDecorator("UIManager")
    static UIManager: UIManager
    
    private _uiTypes: Set<string> = new Set

    add(uiType: string) {
        this._uiTypes.add(uiType)
    }

    remove(uiType: string) {
        this._uiTypes.delete(uiType)
    }

    destroy(): void {
        for (const uiType of this._uiTypes) {
            UILifeComponent.UIManager.hide(uiType)
        }
    }
}