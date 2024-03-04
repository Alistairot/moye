import { _decorator, CCBoolean, CCObject, Component, Node } from 'cc';
import { EDITOR } from 'cc/env';

const { ccclass, property, executeInEditMode, menu } = _decorator;

/**
 * 节点不参与构建
 * 也就是构建后的文件不会存在该节点
 */
@ccclass('NodeNotBuild')
@menu('moye/NodeNotBuild')
@executeInEditMode
export class NodeNotBuild extends Component {
    @property
    private _destroyOnRun: boolean = true;

    @property({type: CCBoolean, tooltip: "运行时销毁节点", displayName: "运行时销毁节点"})
    set destroyOnRun(value: boolean) {
        this._destroyOnRun = value;
    }

    get destroyOnRun(): boolean {
        return this._destroyOnRun;
    }

    protected onLoad(): void {
    }

    protected onEnable(): void {
        if(EDITOR){
            this.node.hideFlags = this.node.hideFlags | CCObject.Flags.EditorOnly;
        }else{
            if(this._destroyOnRun)
            {
                this.node.destroy();
            }
        }
    }

    protected onDisable(): void {
        // 取消标志位
        this.node.hideFlags = this.node.hideFlags & ~CCObject.Flags.EditorOnly;
    }

    protected onDestroy(): void {
        // 取消标志位
        this.node.hideFlags = this.node.hideFlags & ~CCObject.Flags.EditorOnly;
    }
}