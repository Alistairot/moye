import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ILog } from '../../../../common/Core/Logger/ILog';
import { Options } from '../../../../common/Core/Options/Options';

const LOG = "info"
const WARN = "warn"
const ERROR = "error"

const customFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.align(),
    format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
);

const defaultOptions = {
    format: customFormat,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
};

const logger = createLogger({
    format: customFormat,
    transports: [
        new DailyRotateFile({
            filename: "logs/info-%DATE%.log",
            level: LOG,
            ...defaultOptions,
        }),
        new DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            level: ERROR,
            ...defaultOptions,
        }),
    ],
});


export class WinstonLogger implements ILog {
    log(str: string): void {
        // 服务端开发阶段会输出到控制台
        if (Options.getInst().develop) {
            console.log(str);
        }

        logger.log(LOG, str);
    }

    warn(str: string): void {
        // 服务端开发阶段会输出到控制台
        if (Options.getInst().develop) {
            console.warn(str);
        }

        logger.log(WARN, str);
    }
    error(str: string): void {
        // 服务端开发阶段会输出到控制台
        if (Options.getInst().develop) {
            console.error(str);
        }

        logger.log(ERROR, str);
    }
}