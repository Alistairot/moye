import { WindowBase } from "./WindowBase"

export interface IUI{
    afterLoadRes?(win: WindowBase)
    onLoadAsync()
    onShownAsync()
    onHideAsync()
    onDisposeAsync()
}
