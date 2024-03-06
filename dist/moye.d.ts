// Generated by dts-bundle-generator v8.0.1

import { Asset, AssetManager, Component, EventTouch, Label, Layout, Material, Node, SpriteAtlas, SpriteFrame, UIRenderer, UITransform } from 'cc';

/**
 * 构造函数
 */
export interface Type<T = any> extends Function {
	new (...args: any[]): T;
}
export interface ISceneInitArgs {
	id: bigint;
	instanceId?: bigint;
	sceneType: string;
	name: string;
	parent?: Entity;
}
export declare class Scene extends Entity {
	name: string;
	sceneType: string;
	set domain(value: Entity);
	get domain(): Entity;
	set parent(value: Entity);
	get parent(): Entity;
	init(args: ISceneInitArgs): void;
}
export declare abstract class Entity {
	get parent(): Entity;
	set parent(value: Entity);
	get domain(): Entity;
	set domain(value: Entity);
	instanceId: bigint;
	id: bigint;
	get isDisposed(): boolean;
	get children(): Map<bigint, Entity>;
	get components(): Map<Type<Entity>, Entity>;
	protected _domain: Entity;
	private _children;
	private _components;
	protected _parent: Entity;
	private _status;
	private get isFromPool();
	private set isFromPool(value);
	private get isComponent();
	private set isComponent(value);
	protected get isCreated(): boolean;
	protected set isCreated(value: boolean);
	protected get isNew(): boolean;
	protected set isNew(value: boolean);
	protected get isRegister(): boolean;
	protected set isRegister(value: boolean);
	private set componentParent(value);
	addCom(component: Entity): Entity;
	addCom<T extends Entity>(type: Type<T>): T;
	addCom<T extends Entity>(type: Type<T>, isFromPool: boolean): T;
	/**
	 * if not exist com will add new
	 * @param type
	 * @returns
	 */
	tryAddCom<T extends Entity>(type: Type<T>): T;
	private addComByEntity;
	private addComByType;
	addChild(entity: Entity): Entity;
	addChild<T extends Entity>(type: Type<T>): T;
	addChild<T extends Entity>(type: Type<T>, isFromPool: boolean): T;
	addChildWithId<T extends Entity>(type: Type<T>, id: bigint, isFromPool?: boolean): T;
	private addChildByEntity;
	private addChildByType;
	private createInst;
	private removeFromChildren;
	private removeFromComponents;
	private addToComponents;
	private addToChildren;
	getCom<K extends Entity>(type: new () => K): K;
	removeCom<T extends Entity>(type: Type<T>): T;
	getParent<T extends Entity>(type: Type<T>): T;
	getChild<T extends Entity>(type: Type<T>, id: bigint): T;
	removeChild(id: bigint): void;
	dispose(): void;
	domainScene(): Scene;
	getType(): Type;
	protected awake?(): void;
	protected update?(): void;
	protected lateUpdate?(): void;
	protected destroy?(): void;
}
export declare enum SceneType {
	NONE = "NONE",
	PROCESS = "PROCESS",
	CLIENT = "CLIENT",
	CURRENT = "CURRENT"
}
/**
 * 单例基类
 */
export declare abstract class Singleton {
	private static _inst;
	private _isDisposed;
	static get<T extends Singleton>(this: new () => T): T;
	get isDisposed(): boolean;
	dispose(): void;
	protected awake?(): void;
	/**
	 *
	 * @param dt ms
	 */
	protected update?(dt: number): void;
	/**
	 *
	 * @param dt ms
	 */
	protected lateUpdate?(dt: number): void;
	protected destroy?(): void;
	private _onPreDestroy;
}
/**
 * 保存根节点
 */
export declare class Root extends Singleton {
	get scene(): Scene;
	private _scene;
	awake(): void;
}
export interface IEntity {
	instanceId: bigint;
	isDisposed: boolean;
	awake(): void;
	update(): void;
	lateUpdate(): void;
	destroy(): void;
}
export declare class EntityCenter extends Singleton {
	private _allEntities;
	add(entity: IEntity): void;
	remove(instanceId: bigint): void;
	get(instanceId: bigint): IEntity;
}
export declare class ObjectPool extends Singleton {
	private _pool;
	fetch<T>(type: Type<T>): T;
	recycle(obj: object): void;
}
/**
 * 可回收对象
 */
export declare abstract class RecycleObj {
	private _isRecycle;
	/**
	 * 通过对象池创建
	 * @param this
	 * @param values
	 * @returns
	 */
	static create<T extends RecycleObj>(this: Type<T>, values?: Partial<T>): T;
	/**
	 * 如果是通过create方法创建的
	 * 那么dispose会回收到对象池
	 */
	dispose(): void;
}
export interface ILog {
	debug(...data: any[]): void;
	log(...data: any[]): void;
	warn(...data: any[]): void;
	error(...data: any[]): void;
}
declare enum LoggerLevel {
	Debug = 0,
	Log = 1,
	Warn = 2,
	Error = 3
}
/**
 * Logger
 */
export declare class Logger extends Singleton {
	level: LoggerLevel;
	set iLog(value: ILog);
	private _logInst;
	private get _iLog();
	debug(...args: any[]): void;
	debugF(str: string, ...args: any[]): void;
	log(...args: any[]): void;
	logF(str: string, ...args: any[]): void;
	warn(...args: any[]): void;
	warnF(str: string, ...args: any[]): void;
	error(...args: any[]): void;
	errorF(str: string, ...args: any[]): void;
	private checkLogLevel;
}
export declare function debug(...args: any[]): void;
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
export declare function debugF(str: string, ...args: any[]): void;
export declare function log(...args: any[]): void;
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
export declare function logF(str: string, ...args: any[]): void;
export declare function warn(...args: any[]): void;
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
export declare function warnF(str: string, ...args: any[]): void;
export declare function error(...args: any[]): void;
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
export declare function errorF(str: string, ...args: any[]): void;
export declare class IdGenerator extends Singleton {
	generateInstanceId(): bigint;
	generateId(): bigint;
}
export declare class IdStruct {
	private static _lastTime;
	private static _idCount;
	private static _inst;
	private static get inst();
	time: bigint;
	process: bigint;
	value: bigint;
	result: bigint;
	static generate(): bigint;
	static convertToId(time: number, process: number, value: number): bigint;
	/**
	 * convert id to 3 args
	 * not reference return value
	 * @param id bigint
	 * @returns
	 */
	static parseId(id: bigint): IdStruct;
	private static timeSinceEpoch;
	/**
	 * convert id to 3 args
	 * @param id bigint
	 * @returns
	 */
	initById(id: bigint): this;
	init(time: number, process: number, value: number): this;
	private updateResult;
}
export declare class InstanceIdStruct {
	private static _lastTime;
	private static _idCount;
	private static _inst;
	private static get inst();
	time: bigint;
	value: bigint;
	result: bigint;
	static generate(): bigint;
	static convertToId(time: number, value: number): bigint;
	/**
	 * convert id to 2 args
	 * not reference return value
	 * @param id bigint
	 * @returns
	 */
	static parseId(id: bigint): InstanceIdStruct;
	private static timeSinceEpoch;
	/**
	 * convert id to 3 args
	 * @param id bigint
	 * @returns
	 */
	initById(id: bigint): this;
	init(time: number, value: number): this;
	private updateResult;
}
export declare class Program {
	static init(rootNode: Node): void;
	/**
	 * 确保所有脚本已经加载之后调用start
	 */
	static start(): void;
}
export declare class Game {
	private static _singletonMap;
	private static _singletons;
	private static _destroys;
	private static _updates;
	private static _lateUpdates;
	private static _frameFinishTaskQueue;
	static addSingleton<T extends Singleton>(singletonType: new () => T, isNotify?: boolean): T;
	static waitFrameFinish(): Promise<void>;
	static update(dt: number): void;
	static lateUpdate(dt: number): void;
	static frameFinishUpdate(): void;
	static dispose(): void;
}
export interface IScene {
	sceneType: string;
}
export type T = Scene;
export declare const EventHandlerTag = "EventHandler";
export declare abstract class AEventHandler<A> {
	protected abstract run(scene: T, args: A): any;
	handleAsync(scene: IScene, a: A): Promise<void>;
	handle(scene: IScene, a: A): void;
}
/**
 * 事件基类
 */
export declare abstract class AEvent extends RecycleObj {
}
/**
 * before singleton add
 *
 * NOTE: scene is null
 */
export declare class BeforeSingletonAdd extends AEvent {
	singletonType: Type<Singleton>;
}
/**
 * after singleton add
 *
 * NOTE: scene is null
 */
export declare class AfterSingletonAdd extends AEvent {
	singletonType: Type<Singleton>;
}
/**
 * before program init
 *
 * NOTE: scene is null
 */
export declare class BeforeProgramInit extends AEvent {
}
/**
 * after program init
 *
 * NOTE: scene is null
 */
export declare class AfterProgramInit extends AEvent {
}
/**
 * before program start
 *
 * NOTE: scene is null
 */
export declare class BeforeProgramStart extends AEvent {
}
/**
 * after program start,
 * you can listen this event and start your game logic
 *
 * NOTE: scene is null
 */
export declare class AfterProgramStart extends AEvent {
}
/**
 * 创建ClientScene后
 */
export declare class AfterCreateClientScene extends AEvent {
}
/**
 * 创建CurrentScene后
 */
export declare class AfterCreateCurrentScene extends AEvent {
}
export declare const EventDecoratorType = "EventDecoratorType";
/**
 * 事件装饰器
 * @param event
 * @param sceneType
 * @returns
 */
export declare function EventDecorator(event: Type<AEvent>, sceneType: string): (target: Type) => void;
export declare class EventSystem extends Singleton {
	publishAsync<T extends AEvent>(scene: IScene, eventType: T): Promise<void>;
	/**
	 * 一定要确保事件处理函数不是异步方法
	 * 否则会导致事件处理顺序不一致和错误无法捕获
	 * @param scene
	 * @param eventType
	 * @returns
	 */
	publish<T extends AEvent>(scene: IScene, eventType: T): void;
}
export declare class TimeInfo extends Singleton {
	/**
	 * server time - client time
	 */
	serverMinusClientTime: number;
	/**
	 * 上一帧的增量时间，以毫秒为单位
	 */
	deltaTime: number;
	protected awake(): void;
	/**
	 * Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
	 * @returns
	 */
	clientNow(): number;
	serverNow(): number;
	protected update(dt: number): void;
}
export declare class TimeHelper {
	static readonly oneDay: number;
	static readonly oneHour: number;
	static readonly oneMinute: number;
	static clientNow(): number;
	static clientNowSeconds(): number;
	static serverNow(): number;
}
export declare class JsHelper {
	static getMethodName(): string;
	static getRootDirName(path: string): string;
	static sleep(ms: number): Promise<void>;
	static isNullOrEmpty(str: string): boolean;
	static getStringHashCode(str: string): number;
	static modeString(str: string, mode: number): number;
	static powBigInt(base: bigint, exp: bigint): bigint;
	/**
	 * 格式化字符串
	 * @param str 包含有 0 个或者多个格式符的字符串
	 * @param args
	 * @returns 格式化后的新字符串
	 * @performance 性能是+号拼接10分之1, 也就是比较慢, 要注意性能
	 * ```
	 * formatStr("hello {0}", "world") => hello world
	 * formatStr("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
	 * formatStr("hello {{qaq}} {0}", "world") => hello {qaq} world
	 * ```
	 */
	static formatStr(str: string, ...args: any[]): string;
}
/**
 * 这个方法执行一个promise，如果promise出现异常，会打印异常信息
 * @param promise
 * @returns
 */
export declare function safeCall(promise: Promise<any>): Promise<any>;
export declare class DecoratorCollector {
	private static _inst;
	static get inst(): DecoratorCollector;
	private _decorators;
	add(decoratorType: string, ...args: any[]): void;
	get(decoratorType: string): Array<any>;
}
export type Action<T = any> = () => T;
export type ActionAnyArgs<T = any> = (...args: any) => T;
export declare const CancellationTokenTag = "CancellationToken";
/**
 * cancel token
 */
export declare class CancellationToken {
	private _actions;
	/**
	 * add one cancel action
	 * @param callback 添加取消动作
	 * @returns
	 */
	add(callback: Action): void;
	remove(callback: Action): void;
	/**
	 * 执行取消动作
	 * @returns
	 */
	cancel(): void;
	isCancel(): boolean;
	private invoke;
}
export declare class TimerMgr extends Singleton {
	private _timerMap;
	private _timers;
	/**
	 * 不断重复的定时器
	 * @param interval ms
	 * @param callback
	 * @param immediately 是否立即执行
	 * @returns
	 */
	newRepeatedTimer(interval: number, callback: Action, immediately?: boolean): number;
	/**
	 *
	 * @param timeout ms
	 * @param callback
	 * @returns
	 */
	newOnceTimer(timeout: number, callback: Action): number;
	newFrameTimer(callback: Action): number;
	remove(id: number): boolean;
	/**
	 * 浏览器上会有一个问题
	 * 就是cocos的update后台不执行,但是js脚本依然执行，导致大量的timer没回收
	 * 暂时不处理这个问题 应该没什么影响
	 */
	protected update(): void;
	/**
	 *
	 * @param time ms
	 * @param cancellationToken
	 * @returns
	 */
	waitAsync(time: number, cancellationToken?: CancellationToken): Promise<void>;
}
export declare class Task<T = any> extends Promise<T> {
	private _resolve;
	/**
	 * 创建一个新的task
	 * @param type
	 * @returns
	 */
	static create<T = any>(type?: Type<T>): Task<T>;
	setResult(result?: T): void;
	/**
	 * 不允许直接new
	 * @param executor
	 */
	private constructor();
	private dispose;
}
export declare const CoroutineLockTag = "CoroutineLock";
export declare class CoroutineLockItem {
	key: string;
	task: Task;
	private _timeoutInfo;
	private _timerId;
	init(key: string): void;
	/**
	 * timeout tips
	 * @param timeout ms
	 * @param info
	 * @returns
	 */
	private setTimeout;
	private deleteTimeout;
	private timeout;
	dispose(): void;
}
export declare class CoroutineLock extends Singleton {
	private _lockMap;
	wait(lockType: string, key: string): Promise<CoroutineLockItem>;
	runNextLock(lock: CoroutineLockItem): void;
}
export declare class SceneFactory {
	static createClientScene(): Scene;
	static createCurrentScene(id: bigint, name: string): Scene;
}
/**
 * manage client scene
 */
export declare class SceneRefCom extends Entity {
	scene: Scene;
}
/**
 * key对应value数组的map
 */
export declare class MultiMap<T, K> {
	private _map;
	private readonly _empty;
	constructor();
	add(t: T, k: K): void;
	remove(t: T, k: K): boolean;
	getAll(t: T): K[];
	get(t: T): K[];
	getOne(t: T): K | undefined;
	contains(t: T, k: K): boolean;
}
export interface Entity {
	currentScene(): Scene;
	clientScene(): Scene;
}
/**
 * 事件组件 可以发送事件给监听的对象
 * 不允许取消订阅
 */
export declare class EventCom extends Entity {
	private _eventMap;
	protected destroy(): void;
	/**
	 * evtCom.subscribe(123, this.onEvent, this)
	 * handler不需要绑定entity 也就是不需要bind
	 * @param eventType
	 * @param handler
	 * @param entity
	 */
	subscribe(eventType: string, handler: Function, entity: Entity): void;
	publish(eventType: string, ...args: any[]): void;
}
export declare class LocalStorageHelper {
	static getNumber(key: string, defaultValue: number): number;
	static setNumber(key: string, value: number): void;
	static getString(key: string, defaultValue: string): string;
	static setString(key: string, value: string): void;
	static setBoolean(key: string, value: boolean): void;
	static getBoolean(key: string, defaultValue: boolean): boolean;
	static setObject(value: object): void;
	static getObject<T>(obj: Type<T>): T | null;
}
export interface ILoginExecutor {
	/**
	 * 登录
	 * 返回错误码
	 */
	login(clientScene: Scene, args: any): Promise<number>;
}
export declare class LoginCom extends Entity {
	private _loginExecutor;
	private _loginArgs;
	/**
	 * 是否登录了gate
	 */
	private _isLogin;
	/**
	 * 是否正在重连
	 */
	private _isReconnecting;
	/**
	 * 重新登录最大尝试次数
	 */
	private _reLoginTryMaxCount;
	registerExecutor(loginExecutor: ILoginExecutor): void;
	login(args: any): Promise<number>;
}
export declare class AfterAddLoginCom extends AEvent {
}
export declare class IPEndPoint {
	host: string;
	port: number;
	constructor(host: string, port?: number);
	toString(): string;
}
declare enum ServiceType {
	Outer = 0,
	Inner = 1
}
export type AServiceDataType = Uint8Array | string | ArrayBuffer;
declare abstract class AService {
	serviceType: ServiceType;
	id: number;
	abstract send(channelId: bigint, data: AServiceDataType): void;
	abstract create(id: bigint, address: IPEndPoint): void;
	abstract remove(id: bigint, error: number): void;
	abstract dispose(): void;
}
export interface IRpcResquest {
	rpcId: number;
}
export interface IRpcResponse {
	rpcId: number;
	error: number;
}
/**
 * session的id跟channel的id是一样的
 */
export declare class Session extends Entity {
	private static _rpcId;
	serviceId: number;
	requestCallbacks: Map<number, Task>;
	lastRecvTime: number;
	lastSendTime: number;
	error: number;
	remoteAddress: IPEndPoint;
	init(serviceId: number): void;
	onResponse(response: IRpcResponse): void;
	send(msg: object): void;
	call(req: IRpcResquest): Promise<IRpcResponse>;
	protected destroy(): void;
}
export declare const MsgHandlerDecoratorType = "MsgHandlerDecorator";
/**
 * 消息处理器
 * @param opcode
 * @param messageType
 * @returns
 */
export declare function MsgHandlerDecorator(messageType: Type): (target: Function) => void;
/**
 * 消息处理器基类
 */
export declare abstract class AMHandler<A> {
	/**
	 * 请不要用异步 因为异步的话可能没办法保证消息的顺序
	 * @param session
	 * @param message
	 */
	protected abstract run(session: Session, message: A): void;
	handle(session: Session, msg: A): void;
}
export declare class MsgMgr extends Singleton {
	private _responseTypeMap;
	private _typeOpcodeMap;
	private _opcodeTypeMap;
	protected awake(): void;
	register(type: Type, opcode: number, isResponse?: boolean): void;
	isResponse(opcode: number): boolean;
	getOpcode(type: Type): number;
	getType(opcode: number): Type;
}
export interface IMsgSerializeExecutor {
	encode(opcode: number, obj: object): AServiceDataType;
	decode(bytes: AServiceDataType): [
		number,
		object
	];
}
/**
 * 消息序列化
 */
export declare class MsgSerializeMgr extends Singleton {
	private _serialize;
	register(serialize: IMsgSerializeExecutor): void;
	serialize(opcode: number, obj: object): AServiceDataType;
	deserialize(bytes: AServiceDataType): [
		number,
		object
	];
}
/**
 * 保存客户端的session
 */
export declare class SessionCom extends Entity {
	session: Session;
	protected destroy(): void;
}
/**
 * 用于处理网络消息的组件
 * 这个组件只接受二进制数据
 */
export declare class NetCom extends Entity {
	serviceId: number;
	protected awake(): void;
	protected destroy(): void;
	private onRead;
	private onError;
	create(address: IPEndPoint): Session;
}
export interface IAssetOperationHandle {
}
export interface IBundleAssetProvider {
	asset: Asset;
	releaseHandle(handle: IAssetOperationHandle): any;
	internalLoad(): any;
}
export declare class AssetOperationHandle {
	provider: IBundleAssetProvider;
	isDisposed: boolean;
	getAsset<T extends Asset>(assetType: Type<T>): T;
	dispose(): void;
	instantiateSync(): Node;
	instantiateAsync(): Promise<Node>;
}
declare class AssetSystem {
	/**
	 * 同时加载的最大数量
	 */
	private static _maxLoadingProvider;
	/**
	 * 每一帧最多添加几个到加载列表
	 */
	private static _frameMaxAddQueueProvider;
	private _waitLoads;
	private _loadingSet;
	private _frameAddCount;
	update(): void;
	addProvider(provider: IBundleAssetProvider): void;
	updateLoadingSet(): void;
	removeProvider(provider: IBundleAssetProvider): void;
}
declare class AssetInfo {
	bundleName: string;
	assetPath: string;
	assetType: Type<Asset>;
	uuid: string;
	init<T extends Asset>(assetType: Type<T>, location: string): void;
	private parseLocation;
}
export declare class BundleAsset {
	bundleName: string;
	bundle: AssetManager.Bundle;
	refCount: number;
	isAutoRelease: boolean;
	assetSystem: AssetSystem;
	private _providerMap;
	loadAssetAsync(assetInfo: AssetInfo): Promise<IAssetOperationHandle>;
	private createProvider;
	unloadUnusedAssets(): void;
}
export declare class MoyeAssets extends Singleton {
	static assetSystem: AssetSystem;
	private static readonly _bundleMap;
	private static readonly _bundlePathMap;
	awake(): void;
	update(): void;
	static loadAssetAsync<T extends Asset>(assetType: new () => T, location: string): Promise<AssetOperationHandle>;
	static loadBundleAsync(bundleName: string): Promise<BundleAsset>;
	static releaseBundle(bundleAsset: BundleAsset): void;
	static unloadUnusedAssets(): void;
}
export type AcceptCallback = (channelId: bigint, ipEndPoint: IPEndPoint) => void;
export type ReadCallback = (channelId: bigint, data: AServiceDataType) => void;
export type ErrorCallback = (channelId: bigint, error: number) => void;
export declare class NetServices extends Singleton {
	private _acceptIdGenerator;
	private _services;
	private _serviceIdGenerator;
	private _acceptCallback;
	private _readCallback;
	private _errorCallback;
	sendMessage(serviceId: number, channelId: bigint, message: AServiceDataType): void;
	addService(aService: AService): number;
	removeService(serviceId: number): void;
	createChannel(serviceId: number, channelId: bigint, address: IPEndPoint): void;
	removeChannel(serviceId: number, channelId: bigint, error: number): void;
	registerAcceptCallback(serviceId: number, action: AcceptCallback): void;
	registerReadCallback(serviceId: number, action: ReadCallback): void;
	/**
	 * 一个serviceId只能注册一个
	 * @param serviceId
	 * @param action
	 */
	registerErrorCallback(serviceId: number, action: ErrorCallback): void;
	onAccept(serviceId: number, channelId: bigint, ipEndPoint: IPEndPoint): void;
	onRead(serviceId: number, channelId: bigint, message: AServiceDataType): void;
	onError(serviceId: number, channelId: bigint, error: number): void;
	get(id: number): AService;
	createAcceptChannelId(): number;
	private add;
	private remove;
}
export declare class NetworkErrorCode {
	static ERR_SendMessageNotFoundChannel: number;
	static ERR_ChannelReadError: number;
	static ERR_WebSocketError: number;
}
export declare class WService extends AService {
	private readonly _idChannels;
	initSender(serviceType: ServiceType): void;
	send(channelId: bigint, data: AServiceDataType): void;
	create(id: bigint, address: IPEndPoint): void;
	remove(id: bigint, error: number): void;
	dispose(): void;
	private innerCreate;
	/**
	 * channel 被动关闭 调用这个
	 * @param channel
	 * @param code
	 */
	channelClose(channel: WChannel, code: number): void;
}
declare abstract class AChannel {
	id: bigint;
	error: number;
	/**
	 * 通过socket初始化的是客户端地址
	 * 通过地址初始化的是服务器地址
	 */
	remoteAddress: IPEndPoint;
	get isDisposed(): boolean;
	abstract dispose(): void;
}
export declare class WChannel extends AChannel {
	wSocket: WebSocket;
	private _service;
	private _isConnected;
	private _msgQueue;
	/**
	 * 通过地址建立连接
	 * 也就是客户端
	 * @param address
	 * @param id
	 * @param service
	 */
	initByAddress(address: IPEndPoint, id: bigint, service: WService): void;
	private onConnectComplete;
	onMessage(evt: MessageEvent): void;
	dispose(): void;
	private onWsSocketError;
	/**
	 * socket被动关闭
	 * @param code
	 */
	onSocketClose(code: number): void;
	/**
	 * 这里的只能是主动关闭
	 */
	closeSocket(code: number): void;
	private onError;
	private innerSend;
	send(data: AServiceDataType): void;
}
export declare enum WaitError {
	SUCCESS = 0,
	DESTROY = 1,
	CANCEL = 2,
	TIMEOUT = 3
}
export declare class AWait extends RecycleObj {
	error: WaitError;
}
export declare class ObjectWait extends Entity {
	private _tasks;
	protected destroy(): void;
	/**
	 * 一直等待 知道notify了 永不超时
	 * @param type
	 * @param cancellationToken
	 * @returns
	 */
	wait<T extends AWait>(type: Type<T>, cancellationToken?: CancellationToken): Promise<T>;
	/**
	 * 等待且有超时限制 超时将会取消等待
	 * @param type
	 * @param timeout ms
	 * @param cancellationToken
	 * @returns
	 */
	waitWithTimeout<T extends AWait>(type: Type<T>, timeout: number, cancellationToken?: CancellationToken): Promise<T>;
	/**
	 * 取消上一个等待
	 * @param type
	 */
	private cancelLastWait;
	/**
	 * 超时取消等待
	 * @param type
	 * @param time
	 * @param cancellationToken
	 * @returns
	 */
	private timeoutRun;
	private createWaitInstance;
	notify<T extends AWait>(obj: T): void;
}
/**
 * button async listener
 * wait for the callback to complete
 */
export declare class AsyncButtonListener {
	private _callback;
	private _isClick;
	constructor(func: ActionAnyArgs);
	invoke(...args: any[]): Promise<void>;
	static create(func: ActionAnyArgs): Action<void>;
}
/**
 * 在不变形的情况下，适配背景
 * 完全覆盖目标节点
 */
export declare class BgAdapter extends Component {
	coverNode: UITransform;
	isShowMax: boolean;
	private _selfTransform;
	start(): void;
	protected onDestroy(): void;
	private updateSize;
}
declare enum CenterHorizontalDirection {
	LEFT_TO_RIGHT = 0,
	RIGHT_TO_LEFT = 1,
	CENTER_TO_SIDE = 2
}
/**
 * 扩展cocos的layout
 * 使其支持居中
 */
export declare class CenterLayout extends Layout {
	centerHorizontalDirection: CenterHorizontalDirection;
	protected _doLayoutHorizontally(baseWidth: number, rowBreak: boolean, fnPositionY: (...args: any[]) => number, applyChildren: boolean): number;
	_getUsedScaleValue(value: number): number;
}
export declare class MoyeLabel extends Label {
	private _tempString;
	private _clearOnRun;
	set clearOnRun(value: boolean);
	get clearOnRun(): boolean;
	set string(value: string);
	get string(): string;
}
/**
 * 富文本点击事件监听
 */
export declare class RichTextListener extends Component {
	private _cbs;
	protected onDestroy(): void;
	protected onClicked(eventTouch: EventTouch, param: string): void;
	addListener(cb: ActionAnyArgs): void;
}
export declare enum ViewLayer {
	/**
	 * 场景UI，如：点击建筑查看建筑信息---一般置于场景之上，界面UI之下
	 */
	SCENE = 1,
	/**
	 * 背景UI，如：主界面---一般情况下用户不能主动关闭，永远处于其它UI的最底层
	 */
	BACKGROUND = 2,
	/**
	 * 普通UI，一级、二级、三级等窗口---一般由用户点击打开的多级窗口
	 */
	NORMAL = 3,
	/**
	 * 信息UI---如：跑马灯、广播等---一般永远置于用户打开窗口顶层
	 */
	INFO = 4,
	/**
	 * 提示UI，如：错误弹窗，网络连接弹窗等
	 */
	TIPS = 5,
	/**
	 * 顶层UI，如：场景加载
	 */
	TOP = 6
}
export declare abstract class AMoyeView extends Entity {
	viewName: string;
	layer: ViewLayer;
	node: Node;
	private _viewMgr;
	/**
	 * on node load, this method will be called
	 */
	protected onLoad?(): void;
	/**
	 * on view visible, this method will be called
	 */
	protected onShow?(): void;
	/**
	 * on view invisible, this method will be called
	 */
	protected onHide?(): void;
	/**
	 * on node destroy, this method will be called
	 */
	protected destroy?(): void;
	/**
	 * the mothod can't get this.node, if you want get node on node load, use onLoad
	 */
	protected awake?(): void;
	private _realDispose;
	dispose(): void;
	bringToFront(): void;
}
export interface IMoyeViewConfig {
	/**
	 * after view hide, destroy view after expire(ms),
	 */
	expire: number;
	/**
	 * on view load, this method will be called, should return a node,
	 * @param viewName
	 */
	load(viewName: string): Promise<Node>;
	/**
	 * on view destroy, you can do some clean in this method,
	 */
	destroy(): void;
	/**
	 * before show do animation
	 * if animation done, you should call task.setResult()
	 * @param task
	 */
	doShowAnimation?(view: AMoyeView, task: Task): void;
	/**
	 * before hide do animation
	 * if animation done, you should call task.setResult()
	 * @param task
	 */
	doHideAnimation?(view: AMoyeView, task: Task): void;
}
export declare class MoyeViewMgr extends Entity {
	static inst: MoyeViewMgr;
	/**
	 * all views
	 */
	private _views;
	private _type2Names;
	private _showingViews;
	private _hideViews;
	private _viewCfgs;
	private _layers;
	private _globalViewCfgType;
	private _uiRoot;
	private _checkTimerId;
	private _checkInterval;
	protected awake(): void;
	protected destroy(): void;
	/**
	 * init view manager
	 * @param uiRoot
	 * @param globalViewCfg all field need to set
	 * @returns
	 */
	init(uiRoot: Node, globalViewCfg: Type<IMoyeViewConfig>): void | this;
	show<T extends AMoyeView>(type: Type<T>, bindEntity?: Entity): Promise<T>;
	show(name: string, bindEntity?: Entity): Promise<AMoyeView>;
	hide(name: string): Promise<void>;
	getView<T extends AMoyeView>(type: Type<T>): T;
	getView(name: string): AMoyeView;
	/**
	 * reload confog
	 */
	reload(): void;
	private check;
	private getLayerNode;
	private addToCleanCom;
	private enterViewShow;
	private enterViewHide;
	private enterViewDestroy;
}
export declare const ViewDecoratorType = "ViewDecorator";
export declare function ViewDecorator(name: string, layer: ViewLayer, viewCfg?: Type<IMoyeViewConfig>): (target: Type<AMoyeView>) => void;
/**
 * 节点不参与构建
 * 也就是构建后的文件不会存在该节点
 */
export declare class NodeNotBuild extends Component {
	note: string;
	private _destroyOnRun;
	set destroyOnRun(value: boolean);
	get destroyOnRun(): boolean;
	protected onLoad(): void;
	protected onEnable(): void;
	protected onDisable(): void;
	protected onDestroy(): void;
}
export declare class SizeFollow extends Component {
	get target(): UITransform;
	set target(value: UITransform);
	private _target;
	set heightFollow(val: boolean);
	get heightFollow(): boolean;
	private _heightFollow;
	set widthFollow(val: boolean);
	get widthFollow(): boolean;
	private _widthFollow;
	private _heightOffset;
	private _widthOffset;
	private _changeSize;
	protected onLoad(): void;
	protected onDestroy(): void;
	private onTargetSizeChange;
	private onSelfSizeChange;
	private updateSelfSize;
	private updateSizeOffset;
}
declare enum WidgetDirection {
	LEFT = 1,
	RIGHT = 2,
	TOP = 3,
	BOTTOM = 4,
	LEFT_EXTEND = 5,
	RIGHT_EXTEND = 6,
	TOP_EXTEND = 7,
	BOTTOM_EXTEND = 8
}
/**
 * 关联组件
 * 不允许直系亲属互相关联
 * 同父支持size跟pos关联
 * 异父仅支持pos关联 size关联未做测试
 */
export declare class CTWidget extends Component {
	get target(): UITransform;
	set target(value: UITransform);
	private _target;
	set targetDir(val: WidgetDirection);
	get targetDir(): WidgetDirection;
	private _targetDir;
	set dir(val: WidgetDirection);
	get dir(): WidgetDirection;
	private _dir;
	visibleOffset: number;
	private _isVertical;
	private _distance;
	private _changePos;
	private _targetOldPos;
	private _targetOldSize;
	private _selfOldPos;
	private _selfOldSize;
	private _trans;
	protected onEnable(): void;
	protected onDisable(): void;
	protected onLoad(): void;
	protected onDestroy(): void;
	private registerEvt;
	private unregisterEvt;
	private updateData;
	private onTargetChange;
	private updateSize;
	private updatePos;
	private updateTargetPos;
	private updateDistance;
	private getPos;
}
export declare class RoundBoxSprite extends UIRenderer {
	protected _sizeMode: import("cc").__private._cocos_2d_components_sprite__SizeMode;
	get sizeMode(): import("cc").__private._cocos_2d_components_sprite__SizeMode;
	set sizeMode(value: import("cc").__private._cocos_2d_components_sprite__SizeMode);
	/**
	 * @en Grayscale mode.
	 * @zh 是否以灰度模式渲染。
	 */
	protected _useGrayscale: boolean;
	get grayscale(): boolean;
	set grayscale(value: boolean);
	protected _atlas: SpriteAtlas | null;
	get spriteAtlas(): SpriteAtlas;
	set spriteAtlas(value: SpriteAtlas);
	_segments: number;
	get segments(): number;
	set segments(segments: number);
	_radius: number;
	get radius(): number;
	set radius(radius: number);
	protected _spriteFrame: SpriteFrame | null;
	get spriteFrame(): SpriteFrame;
	set spriteFrame(value: SpriteFrame);
	protected _leftTop: boolean;
	get leftTop(): boolean;
	set leftTop(value: boolean);
	protected _rightTop: boolean;
	get rightTop(): boolean;
	set rightTop(value: boolean);
	protected _leftBottom: boolean;
	get leftBottom(): boolean;
	set leftBottom(value: boolean);
	protected _rightBottom: boolean;
	get rightBottom(): boolean;
	set rightBottom(value: boolean);
	onLoad(): void;
	__preload(): void;
	onEnable(): void;
	onDestroy(): void;
	/**
	 * @en
	 * Quickly switch to other sprite frame in the sprite atlas.
	 * If there is no atlas, the switch fails.
	 *
	 * @zh
	 * 选取使用精灵图集中的其他精灵。
	 * @param name @en Name of the spriteFrame to switch. @zh 要切换的 spriteFrame 名字。
	 */
	changeSpriteFrameFromAtlas(name: string): void;
	/**
	 * @deprecated Since v3.7.0, this is an engine private interface that will be removed in the future.
	 */
	changeMaterialForDefine(): void;
	protected _updateBuiltinMaterial(): Material;
	protected _render(render: any): void;
	protected _canRender(): boolean;
	protected resetAssembler(): void;
	protected _flushAssembler(): void;
	private _applySpriteSize;
	private _resized;
	private _activateMaterial;
	private _updateUVs;
	private _applySpriteFrame;
}
export declare enum UIControllerIndex {
	Index_0 = 1,
	Index_1 = 2,
	Index_2 = 4,
	Index_3 = 8,
	Index_4 = 16,
	Index_5 = 32,
	Index_6 = 64,
	Index_7 = 128,
	Index_8 = 256,
	Index_9 = 512,
	Index_10 = 1024,
	Index_11 = 2048,
	Index_12 = 4096
}
export interface IUIControllerIndexListener {
	onChangeIndex(index: number): void;
}
export declare class UIController extends Component {
	private _index;
	set index(v: UIControllerIndex);
	get index(): UIControllerIndex;
	private _listeners;
	protected onDestroy(): void;
	addListener(listener: IUIControllerIndexListener): void;
	removeListener(listener: IUIControllerIndexListener): void;
	notifyListeners(): void;
}
declare enum UIControlType {
	None = 0,
	Visible = 1,
	Position = 2,
	Size = 3,
	Scale = 4,
	Angle = 5,
	Anchor = 6,
	UIController = 7
}
declare class UIController_Transition {
	duration: number;
	delay: number;
}
declare enum UIControllerIndexMask {
	Index_0 = 1,
	Index_1 = 2,
	Index_2 = 4,
	Index_3 = 8,
	Index_4 = 16,
	Index_5 = 32,
	Index_6 = 64,
	Index_7 = 128,
	Index_8 = 256,
	Index_9 = 512,
	Index_10 = 1024,
	Index_11 = 2048,
	Index_12 = 4096
}
declare class UIControlType_Position {
	set transition(value: boolean);
	get transition(): boolean;
	transitionAttr: UIController_Transition;
	private _transition;
	private _records;
	getRecord(indexMask: UIControllerIndexMask): Vec3;
	setRecord(indexMask: UIControllerIndexMask, value: Vec3): void;
}
declare class UIControlType_Size {
	set transition(value: boolean);
	get transition(): boolean;
	transitionAttr: UIController_Transition;
	private _transition;
	private _records;
	getRecord(indexMask: UIControllerIndexMask): Size;
	setRecord(indexMask: UIControllerIndexMask, value: Size): void;
}
declare class UIControlType_Scale {
	set transition(value: boolean);
	get transition(): boolean;
	transitionAttr: UIController_Transition;
	private _transition;
	private _records;
	getRecord(indexMask: UIControllerIndexMask): Vec3;
	setRecord(indexMask: UIControllerIndexMask, value: Vec3): void;
}
declare class UIControlType_Controller {
	private _records;
	getRecord(indexMask: UIControllerIndexMask): number;
	setRecord(indexMask: UIControllerIndexMask, value: number): void;
}
declare class UIControlType_Angle {
	set transition(value: boolean);
	get transition(): boolean;
	transitionAttr: UIController_Transition;
	private _transition;
	private _records;
	getRecord(indexMask: UIControllerIndexMask): number;
	setRecord(indexMask: UIControllerIndexMask, value: number): void;
}
declare class UIControlType_Anchor {
	private _records;
	getRecord(indexMask: UIControllerIndexMask): Vec2;
	setRecord(indexMask: UIControllerIndexMask, value: Vec2): void;
}
declare class UIControlType_Visible {
	indexMask: UIControllerIndexMask;
	isVisible(index: UIControllerIndexMask): boolean;
}
export declare class UIControllerAttr {
	set controlType(v: UIControlType);
	get controlType(): UIControlType;
	private _controlType;
	position: UIControlType_Position;
	anchor: UIControlType_Anchor;
	angle: UIControlType_Angle;
	controller: UIControlType_Controller;
	scale: UIControlType_Scale;
	size: UIControlType_Size;
	visible: UIControlType_Visible;
	isVisible(indexMask: number): boolean;
	setPosition(indexMask: number, pos: Vec3): void;
	getPosition(indexMask: number): Vec3;
	setSize(indexMask: number, size: Size): void;
	getSize(indexMask: number): Size;
	setScale(indexMask: number, scale: Vec3): void;
	getScale(indexMask: number): Vec3;
	setAngle(indexMask: number, angle: number): void;
	getAngle(indexMask: number): number;
	setAnchor(indexMask: number, anchor: Vec2): void;
	getAnchor(indexMask: number): Vec2;
	setUIController(indexMask: number, controllerIndex: number): void;
	getUIController(indexMask: number): number;
	getTransition(): UIController_Transition | null;
	private resetData;
}
export declare class UIControllerListener extends Component {
	private _controller;
	set controller(v: UIController);
	get controller(): UIController;
	get curIndex(): string;
	private _attrs;
	set attrs(v: UIControllerAttr[]);
	get attrs(): UIControllerAttr[];
	protected onLoad(): void;
	protected onDestroy(): void;
	protected onDisable(): void;
	onFocusInEditor(): void;
	onLostFocusInEditor(): void;
	private registerEditorEvent;
	private unRegisterEditorEvent;
	private listenController;
	private onChangeActive;
	private onTransformChange;
	private onSizeChange;
	private onAnchorChange;
	private registerTransform;
	private registerSize;
	private registerAnchor;
	private registerUIController;
	private updateAttr;
	onChangeIndex(indexMask: number): void;
}
declare enum DirectionType {
	FOUR = 0,
	EIGHT = 1,
	ALL = 2
}
/**
 * 速度类型
 */
export declare enum SpeedType {
	STOP = 0,
	NORMAL = 1,
	FAST = 2
}
declare enum JoystickType {
	FIXED = 0,
	FOLLOW = 1
}
export interface JoystickDataType {
	speedType: SpeedType;
	/**
	 * 移动向量
	 */
	moveVec: Vec3;
}
/**
 * 摇杆类
 */
export declare class YYJJoystick extends Component {
	dot: Node | null;
	ring: Node | null;
	joystickType: JoystickType;
	directionType: DirectionType;
	_stickPos: Vec3;
	_touchLocation: Vec2;
	radius: number;
	onLoad(): void;
	/**
	 * 启用时
	 */
	onEnable(): void;
	/**
	 * 禁用时
	 */
	onDisable(): void;
	/**
	 * 改变摇杆类型
	 * @param type
	 */
	_onSetJoystickType(type: JoystickType): void;
	/**
	 * 初始化触摸事件
	 */
	_initTouchEvent(): void;
	/**
	 * 触摸开始回调函数
	 * @param event
	 */
	_touchStartEvent(event: EventTouch): void;
	/**
	 * 触摸移动回调函数
	 * @param event
	 */
	_touchMoveEvent(event: EventTouch): boolean;
	/**
	 * 触摸结束回调函数
	 * @param event
	 */
	_touchEndEvent(event: EventTouch): void;
}
export interface IYYJJoystickEntity extends Entity {
	speedChange(type: SpeedType, speed: number): void;
	setPos(pos: Vec3): void;
	getPos(): Vec3;
	setAngle(angle: number): void;
}
export declare class YYJJoystickCom extends Entity {
	/**
	 * "移动方向"
	 */
	moveDir: Vec3;
	/**
	 * 速度级别
	 */
	private _speedType;
	/**
	 * 移动速度
	 */
	private _moveSpeed;
	/**
	 * 停止时速度
	 */
	stopSpeed: number;
	/**
	 * 正常速度
	 */
	normalSpeed: number;
	/**
	 * 最快速度
	 */
	fastSpeed: number;
	/**
	 * 是否设置角度
	 */
	isRotation: boolean;
	private _entity;
	init(entity: IYYJJoystickEntity): this;
	protected destroy(): void;
	onTouchStart(): void;
	onTouchMove(event: EventTouch, data: JoystickDataType): void;
	onTouchEnd(event: EventTouch, data: JoystickDataType): void;
	/**
	* set moveSpeed by SpeedType
	* @param speedType
	*/
	onSetMoveSpeed(speedType: SpeedType): void;
	/**
	 * 移动
	 */
	move(): void;
	update(): void;
}
export declare class YYJJoystickSpeedChangeEvent extends AEvent {
	speedType: SpeedType;
}
export declare class YYJJoystickMoveEvent extends AEvent {
	dir: Vec3;
}
export declare class YYJJoystickListener extends Entity {
	private _speedType;
	protected awake(): void;
	protected destroy(): void;
	onTouchStart(): void;
	onTouchMove(event: EventTouch, data: JoystickDataType): void;
	onTouchEnd(event: EventTouch, data: JoystickDataType): void;
}

export {};
