import { Singleton } from "../Singleton/Singleton";

export class TimeInfo extends Singleton {
    /**
     * server time - client time
     */
    serverMinusClientTime: number;

    /**
     * 上一帧的增量时间，以毫秒为单位
     */
    deltaTime: number = 0;

    protected awake() {
        this.serverMinusClientTime = 0;
    }

    /**
     * Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
     * @returns 
     */
    clientNow(): number {
        return Date.now();
    }

    serverNow(): number {
        return this.clientNow() + this.serverMinusClientTime;
    }

    protected update(dt: number): void {
        this.deltaTime = dt;
    }
}