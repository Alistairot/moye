export interface ICoreLog{
    coreLog(str: string, ...args: any[]): void
    coreWarn(str: string, ...args: any[]): void
    coreError(str: string, ...args: any[]): void
}