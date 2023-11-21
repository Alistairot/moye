// Generated by dts-bundle-generator v8.0.1

import { Component } from 'cc';

declare abstract class Singleton {
	private static _inst;
	private _isDisposed;
	static getInst<T extends Singleton>(this: new () => T): T;
	get isDisposed(): boolean;
	destroy?(): void;
	dispose(): void;
	_onPreDestroy(): void;
}
/**
 * 构造函数
 */
export interface Type<T = any> extends Function {
	new (...args: any[]): T;
}
export declare class ObjectPool extends Singleton {
	private _pool;
	fetch<T>(type: Type<T>): T;
	recycle(obj: object): void;
}
export interface ILog {
	log(str: string): void;
	warn(str: string): void;
	error(str: string): void;
}
/**
 * Logger
 */
export declare class Logger extends Singleton {
	private _iLog;
	set iLog(value: ILog);
	private static readonly LOG_LEVEL;
	private static readonly WARN_LEVEL;
	log(str: string, ...args: any[]): void;
	warn(str: string, ...args: any[]): void;
	/**
	 * 错误打印会带上堆栈 用于定位错误
	 * 错误打印不会受到logLevel的影响 一定会打印
	 * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
	 * @param str
	 * @param args
	 */
	error(str: string, ...args: any[]): void;
	private checkLogLevel;
	/**
	 * 不受logLevel影响的log
	 * @param str
	 * @param args
	 */
	private coreLog;
	/**
	 * 不受logLevel影响的log
	 * @param str
	 * @param args
	 */
	private coreWarn;
	/**
	 * 错误打印会带上堆栈 用于定位错误
	 * 错误打印不会受到logLevel的影响 一定会打印
	 * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
	 * @param str
	 * @param args
	 */
	private coreError;
}
export declare function log(str: string, ...args: any[]): void;
export declare function warn(str: string, ...args: any[]): void;
export declare function error(str: string, ...args: any[]): void;
export declare class SizeFollow extends Component {
}

export {};
