export interface IUIManager {
    onLoadAsync(win: any)
    onShownAsync(win: any)
    onHideAsync(win: any)
    onDisposeAsync(win: any)
    hide(uiType: string): void
}
