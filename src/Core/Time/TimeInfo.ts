import { Singleton } from "../Singleton/Singleton";

export class TimeInfo extends Singleton {
    /**
     * server time - client time
     */
    serverMinusClientTime: number;

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
}