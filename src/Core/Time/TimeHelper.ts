import { TimeInfo } from "./TimeInfo";

export class TimeHelper {
    public static readonly OneDay: number = 86400000;
    public static readonly Hour: number = 3600000;
    public static readonly Minute: number = 60000;

    public static clientNow(): number {
        return TimeInfo.getInst().clientNow();
    }

    public static clientNowSeconds(): number {
        return Math.floor(TimeHelper.clientNow() / 1000);
    }

    public static dateTimeNow(): Date {
        return new Date();
    }

    public static serverNow(): number {
        return TimeInfo.getInst().serverNow();
    }

    public static clientFrameTime(): number {
        return TimeInfo.getInst().clientFrameTime();
    }

    public static serverFrameTime(): number {
        return TimeInfo.getInst().serverFrameTime();
    }
}
