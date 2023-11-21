import { FUIEvent, GComponent, GRoot, RelationType, Window } from "fairygui-cc";
import { IUIManager } from "./IUIManager";

export class WindowBase extends Window {
    public uiParent: IUIManager

    protected onInit(): void {
        this.contentPane.setSize(GRoot.inst.width, GRoot.inst.height);
        this.contentPane.addRelation(GRoot.inst, RelationType.Size);

        // this.center()

        this.uiParent.onLoadAsync(this)
    }

    protected doShowAnimation(): void {
        this.doShowAnimationAsync()
    }

    protected async doShowAnimationAsync() {
        this.onShown()
    }

    protected doHideAnimation(): void {
        this.doHideAnimationAsync();
    }

    protected async doHideAnimationAsync() {
        this.hideImmediately()
    }

    protected onShown(): void {
        this.uiParent.onShownAsync(this)
    }

    protected onHide(): void {
        this.uiParent.onHideAsync(this)
    }

    protected closeEventHandler(evt: FUIEvent): void {
        this.hide()
    }


    public dispose(): void {
        super.dispose();
        this.uiParent.onDisposeAsync(this)
    }
}
