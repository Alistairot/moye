import { CCBoolean, CCString, Enum, Label, Layout, UITransform, Vec3, _decorator } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, inspector, property, disallowMultiple, menu } = _decorator;

@ccclass("MoyeLabel")
@disallowMultiple()
@menu('moye/MoyeLabel')
// @inspector("packages://custom_inspector/moyeLabel.js")
export class MoyeLabel extends Label {
    @property({
        editorOnly: true,
    })
    private _tempString: string = '';

    @property
    private _clearOnRun: boolean = false;

    @property({
        type: CCBoolean,
        displayName: "运行时清空",
        tooltip: "运行时清空",
    })
    set clearOnRun(value: boolean) {
        if (value == this._clearOnRun) {
            return;
        }

        this._clearOnRun = value;

        if (value) {
            this.string = this._string;
        } else {
            this.string = this._tempString;
        }
    }

    get clearOnRun(): boolean {
        return this._clearOnRun;
    }

    set string(value: string) {
        if (this.clearOnRun && EDITOR) {
            this._tempString = value;
            this._string = ' ';
            this.markForUpdateRenderData();
        } else {
            if (value === null || value === undefined) {
                value = '';
            } else {
                value = value.toString();
            }
    
            if (this._string === value) {
                return;
            }
    
            this._string = value;
            this.markForUpdateRenderData();
        }
    }

    get string() {
        if (this.clearOnRun && EDITOR) {
            return this._tempString;
        } else {
            return this._string;
        }
    }
}