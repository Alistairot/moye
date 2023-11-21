import { Singleton } from "../Singleton/Singleton";

export class TimeInfo extends Singleton {
    private serverMinusClientTime: number;
    public frameTime: number;

    awake() {
        this.serverMinusClientTime = 0;
        this.frameTime = this.clientNow();
    }

    public get ServerMinusClientTime() {
        return this.serverMinusClientTime;
    }

    public set ServerMinusClientTime(value: number) {
        this.serverMinusClientTime = value;
    }

    public update() {
        this.frameTime = this.clientNow();
    }

    public clientNow(): number {
        return Math.floor(Date.now());
    }

    public serverNow(): number {
        return this.clientNow() + this.serverMinusClientTime;
    }

    public clientFrameTime(): number {
        return this.frameTime;
    }

    public serverFrameTime(): number {
        return this.frameTime + this.serverMinusClientTime;
    }
}