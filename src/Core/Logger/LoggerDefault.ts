import { ILog } from "./ILog";

export class LoggerDefault implements ILog {
    log(str: string): void {
        console.log(str);
    }

    warn(str: string): void {
        console.warn(str);
    }

    error(str: string): void {
        console.error(str);
    }
}