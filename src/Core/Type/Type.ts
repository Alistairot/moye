/**
 * 构造函数
 */

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/ban-types
export interface Type<T = any> extends Function {
    new(...args: any[]): T;
}