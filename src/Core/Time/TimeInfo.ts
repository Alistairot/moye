import { Singleton } from "../Singleton/Singleton";

export class TimeInfo extends Singleton {
    /**
     * server time - client time
     */
    serverMinusClientTime: number;

    awake() {
        this.serverMinusClientTime = 0;
    }

    clientNow(): number {
        return Date.now();
    }

    serverNow(): number {
        return this.clientNow() + this.serverMinusClientTime;
    }
}