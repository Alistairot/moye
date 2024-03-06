export interface ILog {
    debug(...data: any[]): void
    log(...data: any[]): void
    warn(...data: any[]): void
    error(...data: any[]): void
}