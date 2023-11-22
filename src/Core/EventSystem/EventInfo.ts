export class EventInfo {
    public eventHandler: any;
    public sceneType: string;

    constructor(handler: any, sceneType: string) {
        this.eventHandler = handler;
        this.sceneType = sceneType;
    }
}