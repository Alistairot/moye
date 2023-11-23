export interface ICoreLog{
    coreLog(str: string): void
    coreWarn(str: string): void
    coreError(str: string): void
}