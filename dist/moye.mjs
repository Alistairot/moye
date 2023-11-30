import { _decorator, Component, director, SpriteFrame, Texture2D, instantiate, native, assetManager, Node, UITransform, CCFloat, Size as Size$1, NodeEventType, Enum, Vec3 as Vec3$1, Label, v3 as v3$1, dynamicAtlasManager, Sprite, SpriteAtlas, CCInteger, UIRenderer, cclegacy, InstanceMaterialType, RenderTexture, Material, EventTarget, Vec2 as Vec2$1, UIOpacity, Input, misc, CCBoolean, RigidBody2D } from 'cc';
import { NATIVE, EDITOR, BUILD } from 'cc/env';

/**
 * 单例基类
 */
class Singleton {
    constructor() {
        this._isDisposed = false;
    }
    static get() {
        const self = this;
        if (self._inst == null) {
            throw new Error(`Singleton is not initialized or destroyed, name is ${self.name}`);
        }
        return self._inst;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    dispose() {
        this._onPreDestroy();
    }
    _onPreDestroy() {
        if (this._isDisposed) {
            return;
        }
        if (this.destroy) {
            this.destroy();
        }
        Singleton._inst = null;
        this._isDisposed = true;
    }
}

class TimeInfo extends Singleton {
    awake() {
        this.serverMinusClientTime = 0;
    }
    /**
     * Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
     * @returns
     */
    clientNow() {
        return Date.now();
    }
    serverNow() {
        return this.clientNow() + this.serverMinusClientTime;
    }
}

class JsHelper {
    static getMethodName() {
        const e = new Error();
        const str = e.stack.split("at ")[2];
        const endPos = str.indexOf(" ");
        return str.substring(0, endPos);
    }
    static getRootDirName(path) {
        return path.split("/")[0];
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static isNullOrEmpty(str) {
        if (str == null) {
            return true;
        }
        if (str.length == 0) {
            return true;
        }
    }
    static getStringHashCode(str) {
        let hash = 5381;
        let i = str.length;
        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        return hash >>> 0;
    }
    static modeString(str, mode) {
        const hash = this.getStringHashCode(str);
        const result = hash % mode;
        return result;
    }
    static powBigInt(base, exp) {
        let result = BigInt(1);
        for (let i = 0; i < exp; i++) {
            result *= base;
        }
        return result;
    }
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
    static formatStr(str, ...args) {
        // 开发阶段打印出错误
        if (typeof str != "string") {
            {
                const err = new Error('formatStr args err');
                return err.name + err.stack;
            }
        }
        if (args.length == 0) {
            return str;
        }
        // 将{0}{1}替换成对应的参数 同时允许{{}}转化为{} 
        const ret = str.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
            if (m == "{{") {
                return "{";
            }
            if (m == "}}") {
                return "}";
            }
            return args[n];
        });
        return ret;
    }
}

class Options extends Singleton {
    constructor() {
        super(...arguments);
        /**
         * 是否是服务端
         */
        this.isServer = false;
        /**
         * log等级 越低输出信息越多
         * 不能控制框架层的输出
         */
        this.logLevel = 1;
        /**
         * 是否开发阶段
         */
        this.develop = true;
    }
}

class LoggerDefault {
    log(str) {
        console.log(str);
    }
    warn(str) {
        console.warn(str);
    }
    error(str) {
        console.error(str);
    }
}

/**
 * Logger
 */
class Logger extends Singleton {
    set iLog(value) {
        this._logInst = value;
    }
    get _iLog() {
        if (!this._logInst) {
            this._logInst = new LoggerDefault();
            this._logInst.warn('not set iLog, use default logger');
        }
        return this._logInst;
    }
    log(str, ...args) {
        if (this.checkLogLevel(Logger.LOG_LEVEL)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.log(formatStr);
        }
    }
    warn(str, ...args) {
        if (this.checkLogLevel(Logger.WARN_LEVEL)) {
            const formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.warn(formatStr);
        }
    }
    /**
     * 错误打印会带上堆栈 用于定位错误
     * 错误打印不会受到logLevel的影响 一定会打印
     * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
     * @param str
     * @param args
     */
    error(str, ...args) {
        const formatStr = JsHelper.formatStr(str, ...args);
        this._iLog.error(formatStr);
    }
    checkLogLevel(level) {
        return Options.get().logLevel <= level;
    }
    /**
     * 不受logLevel影响的log
     * @param str
     * @param args
     */
    coreLog(str) {
        this._iLog.log(str);
    }
    /**
     * 不受logLevel影响的log
     * @param str
     * @param args
     */
    coreWarn(str) {
        this._iLog.warn(str);
    }
    /**
     * 错误打印会带上堆栈 用于定位错误
     * 错误打印不会受到logLevel的影响 一定会打印
     * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
     * @param str
     * @param args
     */
    coreError(str) {
        this._iLog.error(str);
    }
}
Logger.LOG_LEVEL = 1;
Logger.WARN_LEVEL = 2;
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
function log(str, ...args) {
    Logger.get().log(str, ...args);
}
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
function warn(str, ...args) {
    Logger.get().warn(str, ...args);
}
/**
 * ```
 * log("hello {0}", "world") => hello world
 * log("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
 * log("hello {{qaq}} {0}", "world") => hello {qaq} world
 * ```
 * @param str
 * @param args
 */
function error(str, ...args) {
    Logger.get().error(str, ...args);
}

// 框架内部用这个log 区分外部的log 不进行导出
function coreLog(tag, str, ...args) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;
    try {
        const inst = Logger.get();
        inst.coreLog(output);
    }
    catch (e) {
        console.log(output);
    }
}
function coreWarn(tag, str, ...args) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;
    try {
        const inst = Logger.get();
        inst.coreWarn(output);
    }
    catch (e) {
        console.warn(output);
    }
}
function coreError(tag, str, ...args) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[${tag}]: ${formatStr}`;
    try {
        const inst = Logger.get();
        inst.coreError(output);
    }
    catch (e) {
        console.error(output);
    }
}

const IdGeneratorTag = "IdGenerator";

/**
 * 可用时间 s
 * 34年
 */
const timeBit$1 = 30n;
/**
 * 最大进程数量
 * 16384
 */
const processBit = 14n;
/**
 * 每秒可以产生的数量
 * 100w/s
 */
const valueBit$1 = 20n;
const powTimeBit$1 = JsHelper.powBigInt(2n, timeBit$1) - 1n;
const powProcessBit = JsHelper.powBigInt(2n, processBit) - 1n;
const powValueBit$1 = JsHelper.powBigInt(2n, valueBit$1) - 1n;
const epoch$1 = new Date(2023, 4, 1).getTime();
class IdStruct {
    static get inst() {
        if (IdStruct._inst == null) {
            IdStruct._inst = new IdStruct();
        }
        return IdStruct._inst;
    }
    static generate() {
        if (this._lastTime == 0) {
            this._lastTime = this.timeSinceEpoch();
            if (this._lastTime <= 0) {
                coreWarn(IdGeneratorTag, '{0}: lastTime less than 0: {1}', (new this).constructor.name, this._lastTime);
                this._lastTime = 1;
            }
        }
        const time = this.timeSinceEpoch();
        if (time > this._lastTime) {
            this._lastTime = time;
            this._idCount = 0;
        }
        else {
            ++this._idCount;
            if (this._idCount > powValueBit$1) {
                ++this._lastTime; // 借用下一秒
                this._idCount = 0;
                coreError(IdGeneratorTag, '{0}: idCount per sec overflow: {1} {2}', (new this).constructor.name, time, this._lastTime);
            }
        }
        const struct = IdStruct.inst;
        struct.init(this._lastTime, 1, this._idCount);
        return struct.result;
    }
    static convertToId(time, process, value) {
        const id = IdStruct.inst.init(time, process, value).result;
        return id;
    }
    /**
     * convert id to 3 args
     * not reference return value
     * @param id bigint
     * @returns
     */
    static parseId(id) {
        return IdStruct.inst.initById(id);
    }
    static timeSinceEpoch() {
        const a = (TimeInfo.get().clientNow() - epoch$1) / 1000;
        return Math.floor(a);
    }
    /**
     * convert id to 3 args
     * @param id bigint
     * @returns
     */
    initById(id) {
        this.result = id;
        this.time = id & powTimeBit$1;
        id >>= timeBit$1;
        this.process = id & powProcessBit;
        id >>= processBit;
        this.value = id & powValueBit$1;
        return this;
    }
    init(time, process, value) {
        this.time = BigInt(time);
        this.process = BigInt(process);
        this.value = BigInt(value);
        this.updateResult();
        return this;
    }
    updateResult() {
        this.result = this.value;
        this.result <<= processBit;
        this.result |= this.process;
        this.result <<= timeBit$1;
        this.result |= this.time;
    }
}
IdStruct._lastTime = 0;
IdStruct._idCount = 0;

/**
 * 可用时间 s
 */
const timeBit = 32n;
/**
 * 每秒可以产生的数量
 */
const valueBit = 32n;
const powTimeBit = JsHelper.powBigInt(2n, timeBit) - 1n;
const powValueBit = JsHelper.powBigInt(2n, valueBit) - 1n;
const epoch = new Date(2023, 4, 1).getTime();
class InstanceIdStruct {
    static get inst() {
        if (InstanceIdStruct._inst == null) {
            InstanceIdStruct._inst = new InstanceIdStruct();
        }
        return InstanceIdStruct._inst;
    }
    static generate() {
        if (this._lastTime == 0) {
            this._lastTime = this.timeSinceEpoch();
            if (this._lastTime <= 0) {
                coreWarn(IdGeneratorTag, '{0}: lastTime less than 0: {1}', (new this).constructor.name, this._lastTime);
                this._lastTime = 1;
            }
        }
        const time = this.timeSinceEpoch();
        if (time > this._lastTime) {
            this._lastTime = time;
            this._idCount = 0;
        }
        else {
            ++this._idCount;
            if (this._idCount > powValueBit) {
                ++this._lastTime; // 借用下一秒
                this._idCount = 0;
                coreError(IdGeneratorTag, '{0}: idCount per sec overflow: {1} {2}', (new this).constructor.name, time, this._lastTime);
            }
        }
        const struct = InstanceIdStruct.inst;
        struct.init(this._lastTime, this._idCount);
        return struct.result;
    }
    static convertToId(time, value) {
        const id = InstanceIdStruct.inst.init(time, value).result;
        return id;
    }
    /**
     * convert id to 2 args
     * not reference return value
     * @param id bigint
     * @returns
     */
    static parseId(id) {
        return InstanceIdStruct.inst.initById(id);
    }
    static timeSinceEpoch() {
        const a = (TimeInfo.get().clientNow() - epoch) / 1000;
        return Math.floor(a);
    }
    /**
     * convert id to 3 args
     * @param id bigint
     * @returns
     */
    initById(id) {
        this.result = id;
        this.time = id & powTimeBit;
        id >>= timeBit;
        this.value = id & powValueBit;
        return this;
    }
    init(time, value) {
        this.time = BigInt(time);
        this.value = BigInt(value);
        this.updateResult();
        return this;
    }
    updateResult() {
        this.result = this.value;
        this.result <<= timeBit;
        this.result |= this.time;
    }
}
InstanceIdStruct._lastTime = 0;
InstanceIdStruct._idCount = 0;

class IdGenerator extends Singleton {
    generateInstanceId() {
        return InstanceIdStruct.generate();
    }
    generateId() {
        return IdStruct.generate();
    }
}

class ObjectPool extends Singleton {
    constructor() {
        super(...arguments);
        this._pool = new Map;
    }
    fetch(type) {
        const queue = this._pool.get(type);
        if (!queue) {
            return new type();
        }
        if (queue.length === 0) {
            return new type();
        }
        return queue.shift();
    }
    recycle(obj) {
        const type = obj.constructor;
        let queue = this._pool.get(type);
        if (!queue) {
            queue = [];
            this._pool.set(type, queue);
        }
        if (queue.length > 1000) {
            // 报个警告 不进行缓存了
            console.warn(`pool ${type.name} is too large`);
            return;
        }
        queue.push(obj);
    }
}

class EntityCenter extends Singleton {
    constructor() {
        super(...arguments);
        this._allEntities = new Map;
    }
    add(entity) {
        this._allEntities.set(entity.instanceId, entity);
    }
    remove(instanceId) {
        this._allEntities.delete(instanceId);
    }
    get(instanceId) {
        const component = this._allEntities.get(instanceId);
        return component;
    }
}

var InstanceQueueIndex;
(function (InstanceQueueIndex) {
    InstanceQueueIndex[InstanceQueueIndex["NONE"] = -1] = "NONE";
    InstanceQueueIndex[InstanceQueueIndex["UPDATE"] = 0] = "UPDATE";
    InstanceQueueIndex[InstanceQueueIndex["LATE_UPDATE"] = 1] = "LATE_UPDATE";
    InstanceQueueIndex[InstanceQueueIndex["MAX"] = 2] = "MAX";
})(InstanceQueueIndex || (InstanceQueueIndex = {}));

/**
 * 管理实体组件的生命周期
 */
class EntityLifiCycleMgr extends Singleton {
    constructor() {
        super(...arguments);
        this._queues = new Array(InstanceQueueIndex.MAX);
    }
    awake() {
        for (let i = 0; i < this._queues.length; i++) {
            this._queues[i] = [];
        }
    }
    registerSystem(entity) {
        if (entity.update) {
            this._queues[InstanceQueueIndex.UPDATE].push(entity.instanceId);
        }
        if (entity.lateUpdate) {
            this._queues[InstanceQueueIndex.LATE_UPDATE].push(entity.instanceId);
        }
    }
    awakeComEvent(entity) {
        entity.awake();
    }
    destroyComEvent(entity) {
        entity.destroy();
    }
    update() {
        const queue = this._queues[InstanceQueueIndex.UPDATE];
        const entityCenter = EntityCenter.get();
        for (let i = queue.length - 1; i >= 0; i--) {
            const instanceId = queue[i];
            const entity = entityCenter.get(instanceId);
            if (!entity) {
                queue.splice(i, 1);
                continue;
            }
            if (entity.isDisposed) {
                queue.splice(i, 1);
                continue;
            }
            entity.update();
        }
    }
    lateUpdate() {
        const queue = this._queues[InstanceQueueIndex.LATE_UPDATE];
        const entityCenter = EntityCenter.get();
        for (let i = queue.length - 1; i >= 0; i--) {
            const instanceId = queue[i];
            const entity = entityCenter.get(instanceId);
            if (!entity) {
                queue.splice(i, 1);
                continue;
            }
            if (entity.isDisposed) {
                queue.splice(i, 1);
                continue;
            }
            entity.lateUpdate();
        }
    }
}

var EntityStatus;
(function (EntityStatus) {
    EntityStatus[EntityStatus["NONE"] = 0] = "NONE";
    EntityStatus[EntityStatus["IS_FROM_POOL"] = 1] = "IS_FROM_POOL";
    EntityStatus[EntityStatus["IS_REGISTER"] = 2] = "IS_REGISTER";
    EntityStatus[EntityStatus["IS_COMPONENT"] = 4] = "IS_COMPONENT";
    EntityStatus[EntityStatus["IS_CREATED"] = 8] = "IS_CREATED";
    EntityStatus[EntityStatus["IS_NEW"] = 16] = "IS_NEW";
})(EntityStatus || (EntityStatus = {}));
class Entity {
    constructor() {
        this._status = EntityStatus.NONE;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        if (value == null) {
            throw new Error(`cant set parent null: ${this.constructor.name}`);
        }
        if (value == this) {
            throw new Error(`cant set parent self: ${this.constructor.name}`);
        }
        if (value.domain == null) {
            throw new Error(`cant set parent because parent domain is null: ${this.constructor.name} ${value.constructor.name}`);
        }
        if (this._parent != null) // 之前有parent
         {
            // parent相同，不设置
            if (this._parent == value) {
                throw new Error(`重复设置了Parent: ${this.constructor.name} parent: ${this._parent.constructor.name}`);
            }
            this._parent.removeFromChildren(this);
        }
        this._parent = value;
        this.isComponent = false;
        this._parent.addToChildren(this);
        this.domain = this.parent.domain;
    }
    get domain() {
        return this._domain;
    }
    set domain(value) {
        if (value == null) {
            throw new Error(`domain cant set null: ${this.constructor.name}`);
        }
        if (this._domain == value) {
            return;
        }
        const preDomain = this._domain;
        this._domain = value;
        if (preDomain == null) {
            this.instanceId = IdGenerator.get().generateInstanceId();
            this.isRegister = true;
        }
        // 递归设置孩子的Domain
        if (this._children != null) {
            for (const [id, entity] of this._children.entries()) {
                entity.domain = this._domain;
            }
        }
        if (this._components != null) {
            for (const [type, component] of this._components.entries()) {
                component.domain = this._domain;
            }
        }
        if (!this.isCreated) {
            this.isCreated = true;
        }
    }
    get isDisposed() {
        return this.instanceId == 0n;
    }
    get children() {
        return this._children ?? (this._children = ObjectPool.get().fetch((Map)));
    }
    get components() {
        return this._components ?? (this._components = ObjectPool.get().fetch((Map)));
    }
    get isFromPool() {
        return (this._status & EntityStatus.IS_FROM_POOL) == EntityStatus.IS_FROM_POOL;
    }
    set isFromPool(value) {
        if (value) {
            this._status |= EntityStatus.IS_FROM_POOL;
        }
        else {
            this._status &= ~EntityStatus.IS_FROM_POOL;
        }
    }
    get isComponent() {
        return (this._status & EntityStatus.IS_COMPONENT) == EntityStatus.IS_COMPONENT;
    }
    set isComponent(value) {
        if (value) {
            this._status |= EntityStatus.IS_COMPONENT;
        }
        else {
            this._status &= ~EntityStatus.IS_COMPONENT;
        }
    }
    get isCreated() {
        return (this._status & EntityStatus.IS_CREATED) == EntityStatus.IS_CREATED;
    }
    set isCreated(value) {
        if (value) {
            this._status |= EntityStatus.IS_CREATED;
        }
        else {
            this._status &= ~EntityStatus.IS_CREATED;
        }
    }
    get isNew() {
        return (this._status & EntityStatus.IS_NEW) == EntityStatus.IS_NEW;
    }
    set isNew(value) {
        if (value) {
            this._status |= EntityStatus.IS_NEW;
        }
        else {
            this._status &= ~EntityStatus.IS_NEW;
        }
    }
    get isRegister() {
        return (this._status & EntityStatus.IS_REGISTER) == EntityStatus.IS_REGISTER;
    }
    set isRegister(value) {
        if (this.isRegister == value) {
            return;
        }
        if (value) {
            this._status |= EntityStatus.IS_REGISTER;
        }
        else {
            this._status &= ~EntityStatus.IS_REGISTER;
        }
        if (!value) {
            EntityCenter.get().remove(this.instanceId);
        }
        else {
            const self = this;
            EntityCenter.get().add(self);
            EntityLifiCycleMgr.get().registerSystem(self);
        }
    }
    set componentParent(value) {
        if (value == null) {
            throw new Error(`cant set parent null: ${this.constructor.name}`);
        }
        if (value == this) {
            throw new Error(`cant set parent self: ${this.constructor.name}`);
        }
        // 严格限制parent必须要有domain,也就是说parent必须在数据树上面
        if (value.domain == null) {
            throw new Error(`cant set parent because parent domain is null: ${this.constructor.name} ${value.constructor.name}`);
        }
        if (this.parent != null) // 之前有parent
         {
            // parent相同，不设置
            if (this.parent == value) {
                throw new Error(`重复设置了Parent: ${this.constructor.name} parent: ${this.parent.constructor.name}`);
            }
            this.parent.removeFromComponents(this);
        }
        this._parent = value;
        this.isComponent = true;
        this._parent.addToComponents(this);
        this.domain = this.parent.domain;
    }
    addCom(componentOrType, isFromPool) {
        if (componentOrType instanceof Entity) {
            return this.addComByEntity(componentOrType);
        }
        else {
            return this.addComByType(componentOrType, isFromPool);
        }
    }
    /**
     * if not exist com will add new
     * @param type
     * @returns
     */
    tryAddCom(type) {
        let com = this.getCom(type);
        if (com == null) {
            com = this.addCom(type);
        }
        return com;
    }
    addComByEntity(com) {
        const type = com.constructor;
        if (this._components != null && this._components.has(type)) {
            throw new Error(`entity already has component: ${type.name}`);
        }
        com.componentParent = this;
        return com;
    }
    addComByType(type, isFromPool = false) {
        if (this._components != null && this._components.has(type)) {
            throw new Error(`entity already has component: ${type.name}`);
        }
        const com = this.create(type, isFromPool);
        com.id = this.id;
        com.componentParent = this;
        if (com.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(com);
        }
        return com;
    }
    addChild(entityOrType, isFromPool) {
        if (entityOrType instanceof Entity) {
            return this.addChildByEntity(entityOrType);
        }
        else {
            return this.addChildByType(entityOrType, isFromPool);
        }
    }
    addChildWithId(type, id, isFromPool = false) {
        const entity = this.create(type, isFromPool);
        entity.id = id;
        entity.parent = this;
        if (entity.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(entity);
        }
        return entity;
    }
    addChildByEntity(entity) {
        entity.parent = this;
        return entity;
    }
    addChildByType(type, isFromPool = false) {
        const entity = this.create(type, isFromPool);
        entity.id = IdGenerator.get().generateId();
        entity.parent = this;
        if (entity.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(entity);
        }
        return entity;
    }
    create(type, isFromPool) {
        let inst;
        if (isFromPool) {
            inst = ObjectPool.get().fetch(type);
        }
        else {
            inst = new type();
        }
        inst.isFromPool = isFromPool;
        inst.isCreated = true;
        inst.isNew = true;
        inst.id = 0n;
        return inst;
    }
    removeFromChildren(entity) {
        if (this._children == null) {
            return;
        }
        this._children.delete(entity.id);
        if (this._children.size == 0) {
            ObjectPool.get().recycle(this._children);
            this._children = null;
        }
    }
    removeFromComponents(component) {
        if (this._components == null) {
            return;
        }
        this._components.delete(component.constructor);
        if (this._components.size == 0) {
            ObjectPool.get().recycle(this._components);
            this._components = null;
        }
    }
    addToComponents(component) {
        this.components.set(component.constructor, component);
    }
    addToChildren(entity) {
        if (this.children.has(entity.id)) {
            throw new Error(`entity already has child: ${entity.id}`);
        }
        this.children.set(entity.id, entity);
    }
    getCom(type) {
        if (this._components == null) {
            return null;
        }
        const component = this._components.get(type);
        if (!component) {
            return null;
        }
        return component;
    }
    removeCom(type) {
        if (this.isDisposed) {
            return;
        }
        if (this._components == null) {
            return;
        }
        const com = this.getCom(type);
        if (com == null) {
            return;
        }
        this.removeFromComponents(com);
        com.dispose();
    }
    getParent(type) {
        return this.parent;
    }
    getChild(type, id) {
        if (this._children == null) {
            return null;
        }
        const child = this._children.get(id);
        return child;
    }
    removeChild(id) {
        if (this._children == null) {
            return;
        }
        const child = this._children.get(id);
        if (!child) {
            return;
        }
        this._children.delete(id);
        child.dispose();
    }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.isRegister = false;
        this.instanceId = 0n;
        // 清理Children
        if (this._children != null) {
            for (const [id, entity] of this._children.entries()) {
                entity.dispose();
            }
            this._children.clear();
            ObjectPool.get().recycle(this._children);
            this._children = null;
        }
        // 清理Component
        if (this._components != null) {
            for (const [entityCtor, entity] of this._components.entries()) {
                entity.dispose();
            }
            this._components.clear();
            ObjectPool.get().recycle(this._components);
            this._components = null;
        }
        // 触发Destroy事件
        if (this.destroy) {
            EntityLifiCycleMgr.get().destroyComEvent(this);
        }
        this._domain = null;
        if (this._parent != null && !this._parent.isDisposed) {
            if (this.isComponent) {
                this._parent.removeCom(this.getType());
            }
            else {
                this._parent.removeFromChildren(this);
            }
        }
        this._parent = null;
        if (this.isFromPool) {
            ObjectPool.get().recycle(this);
        }
        this._status = EntityStatus.NONE;
    }
    domainScene() {
        return this.domain;
    }
    getType() {
        return this.constructor;
    }
}

class Scene extends Entity {
    set domain(value) {
        this._domain = value;
    }
    get domain() {
        return this._domain;
    }
    set parent(value) {
        if (value == null) {
            return;
        }
        this._parent = value;
        this._parent.children.set(this.id, this);
    }
    init(args) {
        this.id = args.id;
        this.instanceId = args.instanceId;
        this.sceneType = args.sceneType;
        this.name = args.name;
        this.parent = args.parent;
        this.isCreated = true;
        this.isNew = true;
        this.domain = this;
        this.isRegister = true;
        coreLog('scene', 'scene create sceneType = {0}, name = {1}, id = {2}', this.sceneType, this.name, this.id);
    }
}

var SceneType;
(function (SceneType) {
    SceneType["NONE"] = "NONE";
    SceneType["PROCESS"] = "PROCESS";
    SceneType["CLIENT"] = "CLIENT";
    SceneType["CURRENT"] = "CURRENT";
})(SceneType || (SceneType = {}));

/**
 * 保存根节点
 */
class Root extends Singleton {
    get scene() {
        return this._scene;
    }
    awake() {
        const scene = new Scene();
        scene.init({
            id: 0n,
            sceneType: SceneType.PROCESS,
            name: "Process",
            instanceId: IdGenerator.get().generateInstanceId(),
        });
        this._scene = scene;
    }
}

/**
 * 可回收对象
 */
class RecycleObj {
    constructor() {
        this._isRecycle = false;
    }
    /**
     * 通过对象池创建
     * @param this
     * @param values
     * @returns
     */
    static create(values) {
        const event = ObjectPool.get().fetch(this);
        if (values) {
            Object.assign(event, values);
        }
        event._isRecycle = true;
        return event;
    }
    /**
     * 如果是通过create方法创建的
     * 那么dispose会回收到对象池
     */
    dispose() {
        if (this._isRecycle) {
            ObjectPool.get().recycle(this);
        }
    }
}

/**
 * 事件基类
 */
class AEvent extends RecycleObj {
}

/**
 * before singleton add
 *
 * NOTE: scene is null
 */
class BeforeSingletonAdd extends AEvent {
}
/**
 * after singleton add
 *
 * NOTE: scene is null
 */
class AfterSingletonAdd extends AEvent {
}
/**
 * before program init
 *
 * NOTE: scene is null
 */
class BeforeProgramInit extends AEvent {
}
/**
 * after program init
 *
 * NOTE: scene is null
 */
class AfterProgramInit extends AEvent {
}
/**
 * before program start
 *
 * NOTE: scene is null
 */
class BeforeProgramStart extends AEvent {
}
/**
 * after program start,
 * you can listen this event and start your game logic
 *
 * NOTE: scene is null
 */
class AfterProgramStart extends AEvent {
}
/**
 * 创建ClientScene后
 */
class AfterCreateClientScene extends AEvent {
}
/**
 * 创建CurrentScene后
 */
class AfterCreateCurrentScene extends AEvent {
}

class DecoratorCollector {
    constructor() {
        this._decorators = new Map;
    }
    static get inst() {
        if (DecoratorCollector._inst == null) {
            DecoratorCollector._inst = new DecoratorCollector;
        }
        return DecoratorCollector._inst;
    }
    add(decoratorType, ...args) {
        let array = this._decorators.get(decoratorType);
        if (!array) {
            array = [];
            this._decorators.set(decoratorType, array);
        }
        array.push(args);
    }
    get(decoratorType) {
        const array = this._decorators.get(decoratorType);
        return array || [];
    }
}

const EventDecoratorType = "EventDecoratorType";
/**
 * 事件装饰器
 * @param event
 * @param sceneType
 * @returns
 */
function EventDecorator(event, sceneType) {
    return function (target) {
        {
            if (sceneType == null) {
                console.error(`EventDecorator必须要传 sceneType`);
            }
        }
        DecoratorCollector.inst.add(EventDecoratorType, event, target, sceneType);
    };
}

class EventInfo {
    constructor(handler, sceneType) {
        this.eventHandler = handler;
        this.sceneType = sceneType;
    }
}

/**
 * cache all event
 */
class MoyeEventCenter {
    constructor() {
        this.allEvents = new Map;
    }
    static get inst() {
        if (this._inst == null) {
            this._inst = new MoyeEventCenter();
            this._inst.reloadEvent();
        }
        return this._inst;
    }
    reloadEvent() {
        const argsList = DecoratorCollector.inst.get(EventDecoratorType);
        this.allEvents.clear();
        for (const args of argsList) {
            const eventType = args[0];
            const handlerType = args[1];
            const sceneType = args[2];
            let list = this.allEvents.get(eventType);
            if (!list) {
                list = [];
                this.allEvents.set(eventType, list);
            }
            list.push(new EventInfo(new handlerType(), sceneType));
        }
    }
    publish(event) {
        const list = this.allEvents.get(event.constructor);
        if (!list) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const eventInfo = list[i];
            const handler = eventInfo.eventHandler;
            handler.handle(null, event);
        }
        event.dispose();
    }
}

class Task extends Promise {
    /**
     * 创建一个新的task
     * @param type
     * @returns
     */
    static create(type) {
        let resolveVar;
        const task = new Task((resolve) => {
            resolveVar = resolve;
        });
        task._resolve = resolveVar;
        return task;
    }
    setResult(result) {
        if (!this._resolve) {
            throw new Error(`setResult but task has been disposed`);
        }
        this._resolve(result);
        this.dispose();
    }
    /**
     * 不允许直接new
     * @param executor
     */
    constructor(executor) {
        super(executor);
    }
    dispose() {
        this._resolve = null;
    }
}

class Game {
    static addSingleton(singletonType, isNotify = true) {
        if (Game._singletonMap.has(singletonType)) {
            throw new Error(`already exist singleton: ${singletonType.name}`);
        }
        if (isNotify) {
            MoyeEventCenter.inst.publish(BeforeSingletonAdd.create({ singletonType: singletonType }));
        }
        const singleton = new singletonType();
        singletonType['_inst'] = singleton;
        Game._singletonMap.set(singletonType, singleton);
        Game._singletons.push(singleton);
        const inst = singleton;
        if (inst.awake) {
            inst.awake();
        }
        Game._destroys.push(inst);
        if (inst.update) {
            Game._updates.push(inst);
        }
        if (inst.lateUpdate) {
            Game._lateUpdates.push(inst);
        }
        if (isNotify) {
            MoyeEventCenter.inst.publish(AfterSingletonAdd.create({ singletonType: singletonType }));
        }
        return singleton;
    }
    static async waitFrameFinish() {
        const task = Task.create();
        Game._frameFinishTaskQueue.push(task);
        await task;
    }
    static update() {
        for (let index = 0; index < Game._updates.length; index++) {
            const update = Game._updates[index];
            const singleton = update;
            if (singleton.isDisposed) {
                continue;
            }
            update.update();
        }
    }
    static lateUpdate() {
        for (let index = 0; index < Game._lateUpdates.length; index++) {
            const lateUpdate = Game._lateUpdates[index];
            const singleton = lateUpdate;
            if (singleton.isDisposed) {
                continue;
            }
            lateUpdate.lateUpdate();
        }
    }
    static frameFinishUpdate() {
        const len = Game._frameFinishTaskQueue.length;
        if (len == 0) {
            return;
        }
        for (let index = 0; index < len; index++) {
            const task = Game._frameFinishTaskQueue[index];
            task.setResult();
        }
        Game._frameFinishTaskQueue = [];
    }
    static dispose() {
        for (let index = Game._singletons.length - 1; index >= 0; index--) {
            const inst = Game._singletons[index];
            if (inst.isDisposed) {
                continue;
            }
            inst._onPreDestroy();
        }
    }
}
Game._singletonMap = new Map;
Game._singletons = [];
Game._destroys = [];
Game._updates = [];
Game._lateUpdates = [];
Game._frameFinishTaskQueue = [];

class EventSystem extends Singleton {
    async publishAsync(scene, eventType) {
        const list = MoyeEventCenter.inst.allEvents.get(eventType.constructor);
        if (!list) {
            return;
        }
        const tasks = [];
        for (let i = 0; i < list.length; i++) {
            const eventInfo = list[i];
            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != "None") {
                continue;
            }
            tasks.push(eventInfo.eventHandler.handleAsync(scene, eventType));
        }
        await Promise.all(tasks);
        eventType.dispose();
    }
    /**
     * 一定要确保事件处理函数不是异步方法
     * 否则会导致事件处理顺序不一致和错误无法捕获
     * @param scene
     * @param eventType
     * @returns
     */
    publish(scene, eventType) {
        const list = MoyeEventCenter.inst.allEvents.get(eventType.constructor);
        if (!list) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const eventInfo = list[i];
            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != "None") {
                continue;
            }
            eventInfo.eventHandler.handle(scene, eventType);
        }
        eventType.dispose();
    }
}

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$5, property: property$5 } = _decorator;
let MoyeRuntime = class MoyeRuntime extends Component {
    start() {
        director.addPersistRootNode(this.node);
    }
    update(dt) {
        Game.update();
    }
    lateUpdate(dt) {
        Game.lateUpdate();
        Game.frameFinishUpdate();
    }
    onDestroy() {
        Game.dispose();
    }
};
MoyeRuntime = __decorate$6([
    ccclass$5('MoyeRuntime')
], MoyeRuntime);

class TimeHelper {
    static clientNow() {
        return TimeInfo.get().clientNow();
    }
    static clientNowSeconds() {
        return Math.floor(TimeHelper.clientNow() / 1000);
    }
    static serverNow() {
        return TimeInfo.get().serverNow();
    }
}
TimeHelper.oneDay = 86400000;
TimeHelper.oneHour = 3600000;
TimeHelper.oneMinute = 60000;

var TimerType;
(function (TimerType) {
    TimerType[TimerType["ONCE"] = 0] = "ONCE";
    TimerType[TimerType["REPEAT"] = 1] = "REPEAT";
})(TimerType || (TimerType = {}));
class Timer {
    static create() {
        const timer = ObjectPool.get().fetch(Timer);
        timer.reset();
        timer.id = Timer.getId();
        return timer;
    }
    static getId() {
        return ++this._idGenerator;
    }
    reset() {
        this.cb = null;
        this.tcs = null;
        this.id = 0;
        this.expireTime = 0;
        this.interval = 0;
    }
    dispose() {
        this.reset();
        ObjectPool.get().recycle(this);
    }
}
Timer._idGenerator = 1000;

class TimerMgr extends Singleton {
    constructor() {
        super(...arguments);
        this._timerMap = new Map;
        this._timers = [];
    }
    /**
     * 不断重复的定时器
     * @param interval ms
     * @param callback
     * @param immediately 是否立即执行
     * @returns
     */
    newRepeatedTimer(interval, callback, immediately = false) {
        const timer = Timer.create();
        timer.type = TimerType.REPEAT;
        timer.cb = callback;
        timer.interval = interval;
        timer.expireTime = interval + TimeHelper.clientNow();
        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);
        return timer.id;
    }
    /**
     *
     * @param timeout ms
     * @param callback
     * @returns
     */
    newOnceTimer(timeout, callback) {
        const timer = Timer.create();
        timer.type = TimerType.ONCE;
        timer.cb = callback;
        timer.expireTime = timeout + TimeHelper.clientNow();
        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);
        return timer.id;
    }
    newFrameTimer(callback) {
        const timer = Timer.create();
        timer.type = TimerType.REPEAT;
        timer.cb = callback;
        timer.interval = 1;
        timer.expireTime = timer.interval + TimeHelper.clientNow();
        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);
        return timer.id;
    }
    remove(id) {
        const timer = this._timerMap.get(id);
        if (!timer) {
            return false;
        }
        timer.id = 0;
        this._timerMap.delete(id);
        return true;
    }
    /**
     * 浏览器上会有一个问题
     * 就是cocos的update后台不执行,但是js脚本依然执行，导致大量的timer没回收
     * 暂时不处理这个问题 应该没什么影响
     */
    update() {
        const nowTime = TimeHelper.clientNow();
        for (let i = this._timers.length - 1; i >= 0; i--) {
            const timer = this._timers[i];
            if (timer.id == 0) {
                this._timers.splice(i, 1);
                timer.dispose();
                continue;
            }
            if (timer.expireTime > nowTime) {
                continue;
            }
            if (timer.cb != null) {
                timer.cb();
            }
            if (timer.tcs != null) {
                timer.tcs.setResult();
            }
            if (timer.type == TimerType.REPEAT) {
                timer.expireTime += timer.interval;
            }
            else {
                this.remove(timer.id);
                continue;
            }
        }
    }
    /**
     *
     * @param time ms
     * @param cancellationToken
     * @returns
     */
    async waitAsync(time, cancellationToken) {
        if (time <= 0) {
            return;
        }
        const tcs = Task.create();
        const timer = Timer.create();
        timer.type = TimerType.ONCE;
        timer.tcs = tcs;
        timer.expireTime = time + TimeHelper.clientNow();
        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);
        let cancelAction;
        if (cancellationToken) {
            cancelAction = () => {
                if (this.remove(timer.id)) {
                    tcs.setResult();
                }
            };
            cancellationToken.add(cancelAction);
        }
        try {
            await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null;
        }
    }
}

const CoroutineLockTag = 'CoroutineLock';
class CoroutineLockItem {
    init(key) {
        this.key = key;
        this.task = Task.create();
        // 开发阶段进行检查 60s还没解锁一般都是bug了
        if (Options.get().develop) {
            this.setTimeout(60 * 1000, 'CoroutineLock timeout');
        }
    }
    /**
     * timeout tips
     * @param timeout ms
     * @param info
     * @returns
     */
    setTimeout(timeout, info) {
        this.deleteTimeout();
        this._timerId = TimerMgr.get().newOnceTimer(timeout, this.timeout.bind(this));
        this._timeoutInfo = info;
    }
    deleteTimeout() {
        if (this._timerId == null) {
            return;
        }
        TimerMgr.get().remove(this._timerId);
        this._timerId = null;
    }
    async timeout() {
        coreWarn(CoroutineLockTag, 'CoroutineLock timeout key: {0}, info: {1}', this.key, this._timeoutInfo);
    }
    dispose() {
        if (this.key == null) {
            coreWarn(CoroutineLockTag, 'repeat dispose CoroutineLockItem');
            return;
        }
        this.deleteTimeout();
        CoroutineLock.get().runNextLock(this);
        this.key = null;
        this.task = null;
    }
}
class CoroutineLock extends Singleton {
    constructor() {
        super(...arguments);
        this._lockMap = new Map;
    }
    async wait(lockType, key) {
        const newKey = `${lockType}_${key}`;
        let lockSet = this._lockMap.get(newKey);
        if (!lockSet) {
            lockSet = new Set;
            this._lockMap.set(newKey, lockSet);
        }
        const lock = ObjectPool.get().fetch(CoroutineLockItem);
        lock.init(newKey);
        lockSet.add(lock);
        if (lockSet.size > 1) {
            await lock.task;
        }
        else {
            lock.task.setResult();
        }
        return lock;
    }
    runNextLock(lock) {
        const lockSet = this._lockMap.get(lock.key);
        lockSet.delete(lock);
        ObjectPool.get().recycle(lock);
        for (const nextLock of Array.from(lockSet.values())) {
            nextLock.task.setResult();
            break;
        }
    }
}

/**
 * manage client scene
 */
class SceneRefCom extends Entity {
}

class SceneFactory {
    static createClientScene() {
        const parent = Root.get().scene.getCom(SceneRefCom);
        parent.scene?.dispose();
        const scene = new Scene();
        scene.init({
            id: 1n,
            sceneType: SceneType.CLIENT,
            name: "Game",
            instanceId: IdGenerator.get().generateInstanceId(),
            parent: parent
        });
        scene.addCom(SceneRefCom);
        parent.scene = scene;
        EventSystem.get().publish(scene, AfterCreateClientScene.create());
        return scene;
    }
    static createCurrentScene(id, name) {
        const clientSceneRef = Root.get().scene.getCom(SceneRefCom);
        const clientScene = clientSceneRef.scene;
        const parent = clientScene.getCom(SceneRefCom);
        parent.scene?.dispose();
        const scene = new Scene();
        scene.init({
            id: id,
            sceneType: SceneType.CURRENT,
            name: name,
            instanceId: IdGenerator.get().generateInstanceId(),
            parent: parent
        });
        parent.scene = scene;
        EventSystem.get().publish(scene, AfterCreateCurrentScene.create());
        return scene;
    }
}

class Program {
    static init(rootNode) {
        MoyeEventCenter.inst.publish(new BeforeProgramInit());
        Game.addSingleton(ObjectPool, false);
        Game.addSingleton(Options);
        Game.addSingleton(Logger);
        Game.addSingleton(EventSystem);
        Game.addSingleton(TimeInfo);
        Game.addSingleton(TimerMgr);
        Game.addSingleton(CoroutineLock);
        Game.addSingleton(IdGenerator);
        Game.addSingleton(EntityCenter);
        Game.addSingleton(EntityLifiCycleMgr);
        Game.addSingleton(Root);
        // add client runtime
        rootNode.addComponent(MoyeRuntime);
        MoyeEventCenter.inst.publish(new AfterProgramInit());
    }
    /**
     * 确保所有脚本已经加载之后调用start
     */
    static start() {
        // when loaded new scripts, need reload event
        MoyeEventCenter.inst.reloadEvent();
        MoyeEventCenter.inst.publish(new BeforeProgramStart());
        MoyeEventCenter.inst.publish(new AfterProgramStart());
        // create client scene
        Root.get().scene.addCom(SceneRefCom);
        SceneFactory.createClientScene();
    }
}

/**
 * 这个方法执行一个promise，如果promise出现异常，会打印异常信息
 * @param promise
 * @returns
 */
async function safeCall(promise) {
    try {
        return await promise;
    }
    catch (e) {
        coreError('safeCall', e);
    }
}

const EventHandlerTag = 'EventHandler';
class AEventHandler {
    async handleAsync(scene, a) {
        try {
            await this.run(scene, a);
        }
        catch (e) {
            coreError(EventHandlerTag, e);
        }
    }
    handle(scene, a) {
        try {
            const ret = this.run(scene, a);
            if (ret instanceof Promise) {
                coreWarn(EventHandlerTag, '{0}的run方法是异步的, 请尽量不要用publish来通知', this.constructor.name);
                safeCall(ret);
            }
        }
        catch (e) {
            coreError(EventHandlerTag, e);
        }
    }
}

const CancellationTokenTag = "CancellationToken";
/**
 * cancel token
 */
class CancellationToken {
    constructor() {
        this._actions = new Set();
    }
    /**
     * add one cancel action
     * @param callback 添加取消动作
     * @returns
     */
    add(callback) {
        if (callback == null) {
            coreError(CancellationTokenTag, 'CancellationToken add error, callback is null');
            return;
        }
        this._actions.add(callback);
    }
    remove(callback) {
        this._actions.delete(callback);
    }
    /**
     * 执行取消动作
     * @returns
     */
    cancel() {
        if (this._actions == null) {
            coreError(CancellationTokenTag, 'CancellationToken cancel error, repeat cancel');
            return;
        }
        this.invoke();
    }
    isCancel() {
        return this._actions == null;
    }
    invoke() {
        const runActions = this._actions;
        this._actions = null;
        try {
            for (const action of runActions) {
                action();
            }
            runActions.clear();
        }
        catch (e) {
            coreError(CancellationTokenTag, e);
        }
    }
}

/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */
/**
 * @en
 * Number of bits in an integer
 * @zh
 * 整型类型的 bit 数
 */
const INT_BITS = 32;
/**
 * @en
 * The maximal signed integer number
 * @zh
 * 最大有符号整型数
 */
const INT_MAX = 0x7fffffff;
/**
 * @en
 * The minimal signed integer number
 * @zh
 * 最小有符号整型数
 */
const INT_MIN = -1 << (INT_BITS - 1);
/**
 * @en Returns -1, 0, +1 depending on sign of x.
 * @zh 根据x的符号返回 -1，0，+1。
 */
function sign(v) {
    return (v > 0) - (v < 0);
}
/**
 * @en Computes absolute value of integer.
 * @zh 计算整数的绝对值。
 */
function abs(v) {
    const mask = v >> (INT_BITS - 1);
    return (v ^ mask) - mask;
}
/**
 * @en Computes minimum of integers x and y.
 * @zh 计算整数x和y中的最小值。
 */
function min(x, y) {
    return y ^ ((x ^ y) & -(x < y));
}
/**
 * @en Computes maximum of integers x and y.
 * @zh 计算整数x和y中的最大值。
 */
function max(x, y) {
    return x ^ ((x ^ y) & -(x < y));
}
/**
 * @en Checks if a number is a power of two.
 * @zh 检查一个数字是否是2的幂。
 */
function isPow2(v) {
    return !(v & (v - 1)) && (!!v);
}
/**
 * @en Computes log base 2 of v.
 * @zh 计算以 2 为底的 v 的对数。
 */
function log2(v) {
    let r;
    let shift;
    r = (v > 0xFFFF) << 4;
    v >>>= r;
    shift = (v > 0xFF) << 3;
    v >>>= shift;
    r |= shift;
    shift = (v > 0xF) << 2;
    v >>>= shift;
    r |= shift;
    shift = (v > 0x3) << 1;
    v >>>= shift;
    r |= shift;
    return r | (v >> 1);
}
/**
 * @en Computes log base 10 of v.
 * @zh 计算以 10 为底的 v 的对数。
 */
function log10(v) {
    return (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7
        : (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4
            : (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}
/**
 * @en Counts number of bits.
 * @zh 计算传入数字二进制表示中 1 的数量。
 */
function popCount(v) {
    v -= ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}
/**
 * @en Counts number of trailing zeros.
 * @zh 计算传入数字二进制表示尾随零的数量。
 */
function countTrailingZeros(v) {
    let c = 32;
    v &= -v;
    if (v) {
        c--;
    }
    if (v & 0x0000FFFF) {
        c -= 16;
    }
    if (v & 0x00FF00FF) {
        c -= 8;
    }
    if (v & 0x0F0F0F0F) {
        c -= 4;
    }
    if (v & 0x33333333) {
        c -= 2;
    }
    if (v & 0x55555555) {
        c -= 1;
    }
    return c;
}
/**
 * @en Rounds to next power of 2.
 * @zh 计算大于等于v的最小的二的整数次幂的数字。
 */
function nextPow2$1(v) {
    --v;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return v + 1;
}
/**
 * @en Rounds down to previous power of 2.
 * @zh 计算小于等于v的最小的二的整数次幂的数字。
 */
function prevPow2(v) {
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return v - (v >>> 1);
}
/**
 * @en Computes parity of word.
 * @zh 奇偶校验。
 */
function parity(v) {
    v ^= v >>> 16;
    v ^= v >>> 8;
    v ^= v >>> 4;
    v &= 0xf;
    return (0x6996 >>> v) & 1;
}
const REVERSE_TABLE = new Array(256);
((tab) => {
    for (let i = 0; i < 256; ++i) {
        let v = i;
        let r = i;
        let s = 7;
        for (v >>>= 1; v; v >>>= 1) {
            r <<= 1;
            r |= v & 1;
            --s;
        }
        tab[i] = (r << s) & 0xff;
    }
})(REVERSE_TABLE);
/**
 * @en Reverse bits in a 32 bit word.
 * @zh 翻转 32 位二进制数字。
 */
function reverse(v) {
    return (REVERSE_TABLE[v & 0xff] << 24)
        | (REVERSE_TABLE[(v >>> 8) & 0xff] << 16)
        | (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)
        | REVERSE_TABLE[(v >>> 24) & 0xff];
}
/**
 * @en Interleave bits of 2 coordinates with 16 bits. Useful for fast quadtree codes.
 * @zh 将两个 16 位数字按位交错编码。有利于在快速四叉树中使用。
 */
function interleave2(x, y) {
    x &= 0xFFFF;
    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;
    y &= 0xFFFF;
    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;
    return x | (y << 1);
}
/**
 * @en Extracts the nth interleaved component.
 * @zh 提取第 n 个交错分量。
 */
function deinterleave2(v, n) {
    v = (v >>> n) & 0x55555555;
    v = (v | (v >>> 1)) & 0x33333333;
    v = (v | (v >>> 2)) & 0x0F0F0F0F;
    v = (v | (v >>> 4)) & 0x00FF00FF;
    v = (v | (v >>> 16)) & 0x000FFFF;
    return (v << 16) >> 16;
}
/**
 * @en Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes.
 * @zh 将三个数字按位交错编码，每个数字占十位。有利于在八叉树中使用。
 */
function interleave3(x, y, z) {
    x &= 0x3FF;
    x = (x | (x << 16)) & 4278190335;
    x = (x | (x << 8)) & 251719695;
    x = (x | (x << 4)) & 3272356035;
    x = (x | (x << 2)) & 1227133513;
    y &= 0x3FF;
    y = (y | (y << 16)) & 4278190335;
    y = (y | (y << 8)) & 251719695;
    y = (y | (y << 4)) & 3272356035;
    y = (y | (y << 2)) & 1227133513;
    x |= (y << 1);
    z &= 0x3FF;
    z = (z | (z << 16)) & 4278190335;
    z = (z | (z << 8)) & 251719695;
    z = (z | (z << 4)) & 3272356035;
    z = (z | (z << 2)) & 1227133513;
    return x | (z << 2);
}
/**
 * @en Extracts nth interleaved component of a 3-tuple.
 * @zh 提取三个数字中的第n个交错分量。
 */
function deinterleave3(v, n) {
    v = (v >>> n) & 1227133513;
    v = (v | (v >>> 2)) & 3272356035;
    v = (v | (v >>> 4)) & 251719695;
    v = (v | (v >>> 8)) & 4278190335;
    v = (v | (v >>> 16)) & 0x3FF;
    return (v << 22) >> 22;
}
/**
 * @en Compute the lexicographically next bit permutation
 * @zh 计算下一组字典序的比特排列
 */
function nextCombination(v) {
    const t = v | (v - 1);
    return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}

var bits = /*#__PURE__*/Object.freeze({
    __proto__: null,
    INT_BITS: INT_BITS,
    INT_MAX: INT_MAX,
    INT_MIN: INT_MIN,
    abs: abs,
    countTrailingZeros: countTrailingZeros,
    deinterleave2: deinterleave2,
    deinterleave3: deinterleave3,
    interleave2: interleave2,
    interleave3: interleave3,
    isPow2: isPow2,
    log10: log10,
    log2: log2,
    max: max,
    min: min,
    nextCombination: nextCombination,
    nextPow2: nextPow2$1,
    parity: parity,
    popCount: popCount,
    prevPow2: prevPow2,
    reverse: reverse,
    sign: sign
});

/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
const _d2r = Math.PI / 180.0;
const _r2d = 180.0 / Math.PI;
let _random = Math.random;
const HALF_PI = Math.PI * 0.5;
const TWO_PI = Math.PI * 2.0;
const EPSILON = 0.000001;
/**
 * @en Tests whether or not the arguments have approximately the same value, within an absolute<br/>
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less<br/>
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 * @zh 在glMatrix的绝对或相对容差范围内，测试参数是否具有近似相同的值。<br/>
 * EPSILON(小于等于1.0的值采用绝对公差，大于1.0的值采用相对公差)
 * @param a The first number to test.
 * @param b The second number to test.
 * @return True if the numbers are approximately equal, false otherwise.
 */
function equals(a, b) {
    return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
/**
 * @en Tests whether or not the arguments have approximately the same value by given maxDiff<br/>
 * @zh 通过给定的最大差异，测试参数是否具有近似相同的值。
 * @param a The first number to test.
 * @param b The second number to test.
 * @param maxDiff Maximum difference.
 * @return True if the numbers are approximately equal, false otherwise.
 */
function approx(a, b, maxDiff) {
    maxDiff = maxDiff || EPSILON;
    return Math.abs(a - b) <= maxDiff;
}
/**
 * @en Clamps a value between a minimum float and maximum float value.<br/>
 * @zh 返回最小浮点数和最大浮点数之间的一个数值。可以使用 clamp 函数将不断变化的数值限制在范围内。
 * @param val
 * @param min
 * @param max
 */
function clamp(val, min, max) {
    if (min > max) {
        const temp = min;
        min = max;
        max = temp;
    }
    return val < min ? min : val > max ? max : val;
}
/**
 * @en Clamps a value between 0 and 1.<br/>
 * @zh 将值限制在0和1之间。
 * @param val
 */
function clamp01(val) {
    return val < 0 ? 0 : val > 1 ? 1 : val;
}
/**
 * @en Linear interpolation between two numbers
 * @zh 两个数之间的线性插值。
 * @param from - The starting number.
 * @param to - The ending number.
 * @param ratio - The interpolation coefficient, t should be in the range [0, 1].
 */
function lerp(from, to, ratio) {
    return from + (to - from) * ratio;
}
/**
 * @en Convert Degree To Radian<br/>
 * @zh 把角度换算成弧度。
 * @param {Number} a Angle in Degrees
 */
function toRadian(a) {
    return a * _d2r;
}
/**
 * @en Convert Radian To Degree<br/>
 * @zh 把弧度换算成角度。
 * @param {Number} a Angle in Radian
 */
function toDegree(a) {
    return a * _r2d;
}
/**
 * @method random
 */
function random() {
    return _random();
}
/**
 * @en Set a custom random number generator, default to Math.random
 * @zh 设置自定义随机数生成器，默认为 Math.random
 * @param func custom random number generator
 */
function setRandGenerator(func) {
    _random = func;
}
/**
 * @en Returns a floating-point random number between min (inclusive) and max (exclusive).<br/>
 * @zh 返回最小(包含)和最大(不包含)之间的浮点随机数。
 * @method randomRange
 * @param min
 * @param max
 * @return {Number} The random number.
 */
function randomRange(min, max) {
    return random() * (max - min) + min;
}
/**
 * @en Returns a random integer between min (inclusive) and max (exclusive).<br/>
 * @zh 返回最小(包含)和最大(不包含)之间的随机整数。
 * @param min
 * @param max
 * @return The random integer.
 */
function randomRangeInt(min, max) {
    return Math.floor(randomRange(min, max));
}
/**
 * @en
 * Linear congruence generator using Hull-Dobell Theorem.
 * @zh
 * 使用 Hull-Dobell 算法的线性同余生成器构造伪随机数
 *
 * @param seed The random seed.
 * @return The pseudo random.
 */
function pseudoRandom(seed) {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
}
/**
 * @en
 * Returns a floating-point pseudo-random number between min (inclusive) and max (exclusive).
 * @zh
 * 返回一个在范围内的浮点伪随机数，注意，不包含边界值
 *
 * @param seed
 * @param min
 * @param max
 * @return The random number.
 */
function pseudoRandomRange(seed, min, max) {
    return pseudoRandom(seed) * (max - min) + min;
}
/**
 * @en Returns a pseudo-random integer between min (inclusive) and max (exclusive).<br/>
 * @zh 返回最小(包含)和最大(不包含)之间的浮点伪随机数。
 * @param seed
 * @param min
 * @param max
 * @return The random integer.
 */
function pseudoRandomRangeInt(seed, min, max) {
    return Math.floor(pseudoRandomRange(seed, min, max));
}
/**
 * @en
 * Returns the next power of two for the value.<br/>
 * @zh
 * 返回下一个最接近的 2 的幂
 *
 * @param val
 * @return The the next power of two.
 */
function nextPow2(val) {
    return nextPow2$1(val);
}
/**
 * @en Returns float remainder for t / length.<br/>
 * @zh 返回t / length的浮点余数。
 * @param t Time start at 0.
 * @param length Time of one cycle.
 * @return The Time wrapped in the first cycle.
 */
function repeat(t, length) {
    return t - Math.floor(t / length) * length;
}
/**
 * @en
 * Returns time wrapped in ping-pong mode.
 * @zh
 * 返回乒乓模式下的相对时间
 *
 * @param t Time start at 0.
 * @param length Time of one cycle.
 * @return The time wrapped in the first cycle.
 */
function pingPong(t, length) {
    t = repeat(t, length * 2);
    t = length - Math.abs(t - length);
    return t;
}
/**
 * @en Returns ratio of a value within a given range.<br/>
 * @zh 返回给定范围内的值的比率。
 * @param from Start value.
 * @param to End value.
 * @param value Given value.
 * @return The ratio between [from, to].
 */
function inverseLerp(from, to, value) {
    return (value - from) / (to - from);
}
/**
 * @en Compare the absolute values of all components and the component with the largest absolute value will be returned.
 * @zh 对所有分量的绝对值进行比较大小，返回绝对值最大的分量。
 * @param v vec3 like value
 * @returns max absolute component
 */
function absMaxComponent(v) {
    if (Math.abs(v.x) > Math.abs(v.y)) {
        if (Math.abs(v.x) > Math.abs(v.z)) {
            return v.x;
        }
        else {
            return v.z;
        }
    }
    else if (Math.abs(v.y) > Math.abs(v.z)) {
        return v.y;
    }
    else {
        return v.z;
    }
}
/**
 * @en Compare the absolute value of two values and return the value with the largest absolute value
 * @zh 对 a b 的绝对值进行比较大小，返回绝对值最大的值。
 * @param a number
 * @param b number
 */
function absMax(a, b) {
    if (Math.abs(a) > Math.abs(b)) {
        return a;
    }
    else {
        return b;
    }
}
/**
 * @en
 * Make the attributes of the specified class available to be enumerated
 * @zh
 * 使指定类的特定属性可被枚举
 * @param prototype Inherit the prototype chain of the ValueType class
 * @param attrs List of attributes that need to be enumerated
 */
function enumerableProps(prototype, attrs) {
    attrs.forEach((key) => {
        Object.defineProperty(prototype, key, { enumerable: true });
    });
}
/**
 * convert float to half (short)
 */
const toHalf = (function () {
    // https://stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);
    return function toHalf(fval) {
        floatView[0] = fval;
        const fbits = int32View[0];
        const s = (fbits >> 16) & 0x8000; // sign
        const em = fbits & 0x7fffffff; // exp and mantissa
        let h = (em - (112 << 23) + (1 << 12)) >> 13;
        h = (em < (113 << 23)) ? 0 : h; // denormals-as-zero
        h = (em >= (143 << 23)) ? 0x7c00 : h; // overflow
        h = (em > (255 << 23)) ? 0x7e00 : h; // NaN
        int32View[0] = (s | h); // pack sign and half
        return int32View[0];
    };
}());
const fromHalf = (function () {
    const floatView = new Float32Array(1);
    const int32View = new Int32Array(floatView.buffer);
    return function fromHalf(hval /* uint16 */) {
        const s = (hval >> 15) & 0x00000001; // sign
        const em = hval & 0x00007fff; // exp and mantissa
        let h = (em << 13); // exponent/mantissa bits
        let fbits = 0;
        if (h !== 0x7c00) { // // NaN/Inf
            h += (112 << 23); // exp adjust
            if (em === 0) { // // Denormals-as-zero
                h = (h & 0xfffff) >> 1; // // Mantissa shift
            }
            else if (em === 0x7fff) { // // Inf/NaN?
                h = 0x7fffffff; // // NaN
            }
        }
        else {
            h = 0x7f800000; // // +/-Inf
        }
        fbits = (s << 31) | h; // // Sign | Exponent | Mantissa
        int32View[0] = fbits;
        return floatView[0];
    };
}());
function floatToHalf(val) {
    return toHalf(val);
}
function halfToFloat(val) {
    return fromHalf(val);
}

/*
 Copyright (c) 2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en Representation of 3D vectors and points.
 * @zh 三维向量。
 */
class Vec3 {
    /**
     * @en return a Vec3 object with x = 0, y = 0, z = 0.
     * @zh 将目标赋值为零向量
     */
    static zero(out) {
        out.x = 0;
        out.y = 0;
        out.z = 0;
        return out;
    }
    /**
     * @en Obtains a clone of the given vector object
     * @zh 获得指定向量的拷贝
     */
    static clone(a) {
        return new Vec3(a.x, a.y, a.z);
    }
    /**
     * @en Copy the target vector and save the results to out vector object
     * @zh 复制目标向量
     */
    static copy(out, a) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        return out;
    }
    /**
     * @en Sets the out vector with the given x, y and z values
     * @zh 设置向量值
     */
    static set(out, x, y, z) {
        out.x = x;
        out.y = y;
        out.z = z;
        return out;
    }
    /**
     * @en Element-wise vector addition and save the results to out vector object
     * @zh 逐元素向量加法
     */
    static add(out, a, b) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        return out;
    }
    /**
     * @en Element-wise vector subtraction and save the results to out vector object
     * @zh 逐元素向量减法
     */
    static subtract(out, a, b) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        return out;
    }
    /**
     * @en Element-wise vector multiplication and save the results to out vector object
     * @zh 逐元素向量乘法 (分量积)
     */
    static multiply(out, a, b) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        return out;
    }
    /**
     * @en Element-wise vector division and save the results to out vector object
     * @zh 逐元素向量除法
     */
    static divide(out, a, b) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        out.z = a.z / b.z;
        return out;
    }
    /**
     * @en Rounds up by elements of the vector and save the results to out vector object
     * @zh 逐元素向量向上取整
     */
    static ceil(out, a) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        out.z = Math.ceil(a.z);
        return out;
    }
    /**
     * @en Element-wise rounds down of the current vector and save the results to the out vector
     * @zh 逐元素向量向下取整
     */
    static floor(out, a) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        out.z = Math.floor(a.z);
        return out;
    }
    /**
     * @en Calculates element-wise minimum values and save to the out vector
     * @zh 逐元素向量最小值
     */
    static min(out, a, b) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        return out;
    }
    /**
     * @en Calculates element-wise maximum values and save to the out vector
     * @zh 逐元素向量最大值
     */
    static max(out, a, b) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        return out;
    }
    /**
     * @en Calculates element-wise round results and save to the out vector
     * @zh 逐元素向量四舍五入取整
     */
    static round(out, a) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        out.z = Math.round(a.z);
        return out;
    }
    /**
     * @en Vector scalar multiplication and save the results to out vector object
     * @zh 向量标量乘法
     */
    static multiplyScalar(out, a, b) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        return out;
    }
    /**
     * @en Element-wise multiplication and addition with the equation: a + b * scale
     * @zh 逐元素向量乘加: A + B * scale
     */
    static scaleAndAdd(out, a, b, scale) {
        out.x = a.x + b.x * scale;
        out.y = a.y + b.y * scale;
        out.z = a.z + b.z * scale;
        return out;
    }
    /**
     * @en Calculates the euclidean distance of two vectors
     * @zh 求两向量的欧氏距离
     */
    static distance(a, b) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        return Math.sqrt(x * x + y * y + z * z);
    }
    /**
     * @en Calculates the squared euclidean distance of two vectors
     * @zh 求两向量的欧氏距离平方
     */
    static squaredDistance(a, b) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        return x * x + y * y + z * z;
    }
    /**
     * @en Calculates the length of the vector
     * @zh 求向量长度
     */
    static len(a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        return Math.sqrt(x * x + y * y + z * z);
    }
    /**
     * @en Calculates the squared length of the vector
     * @zh 求向量长度平方
     */
    static lengthSqr(a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        return x * x + y * y + z * z;
    }
    /**
     * @en Sets each element to its negative value
     * @zh 逐元素向量取负
     */
    static negate(out, a) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;
        return out;
    }
    /**
     * @en Sets each element to its inverse value, zero value will become Infinity
     * @zh 逐元素向量取倒数，接近 0 时返回 Infinity
     */
    static invert(out, a) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        out.z = 1.0 / a.z;
        return out;
    }
    /**
     * @en Sets each element to its inverse value, zero value will remain zero
     * @zh 逐元素向量取倒数，接近 0 时返回 0
     */
    static invertSafe(out, a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        if (Math.abs(x) < EPSILON) {
            out.x = 0;
        }
        else {
            out.x = 1.0 / x;
        }
        if (Math.abs(y) < EPSILON) {
            out.y = 0;
        }
        else {
            out.y = 1.0 / y;
        }
        if (Math.abs(z) < EPSILON) {
            out.z = 0;
        }
        else {
            out.z = 1.0 / z;
        }
        return out;
    }
    /**
     * @en Sets the normalized vector to the out vector, returns a zero vector if input is a zero vector.
     * @zh 归一化向量，输入零向量将会返回零向量。
     */
    static normalize(out, a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        let len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
            out.z = z * len;
        }
        else {
            out.x = 0;
            out.y = 0;
            out.z = 0;
        }
        return out;
    }
    /**
     * @en Calculates the dot product of the vector
     * @zh 向量点积（数量积）
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    /**
     * @en Calculates the cross product of the vector
     * @zh 向量叉积（向量积）
     */
    static cross(out, a, b) {
        const { x: ax, y: ay, z: az } = a;
        const { x: bx, y: by, z: bz } = b;
        out.x = ay * bz - az * by;
        out.y = az * bx - ax * bz;
        out.z = ax * by - ay * bx;
        return out;
    }
    /**
     * @en Calculates the linear interpolation between two vectors with a given ratio: A + t * (B - A)
     * @zh 逐元素向量线性插值： A + t * (B - A)
     */
    static lerp(out, a, b, t) {
        out.x = a.x + t * (b.x - a.x);
        out.y = a.y + t * (b.y - a.y);
        out.z = a.z + t * (b.z - a.z);
        return out;
    }
    /**
     * @en Generates a uniformly distributed random vector points from center to the surface of the unit sphere
     * @zh 生成一个在单位球体上均匀分布的随机向量
     * @param scale vector length
     */
    static random(out, scale) {
        scale = scale || 1.0;
        const phi = random() * 2.0 * Math.PI;
        const cosTheta = random() * 2 - 1;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        out.x = sinTheta * Math.cos(phi) * scale;
        out.y = sinTheta * Math.sin(phi) * scale;
        out.z = cosTheta * scale;
        return out;
    }
    /**
     * @en Vector and fourth order matrix multiplication, will complete the vector with a fourth value as one
     * @zh 向量与四维矩阵乘法，默认向量第四位为 1。
     */
    static transformMat4(out, a, m) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        let rhw = m.m03 * x + m.m07 * y + m.m11 * z + m.m15;
        rhw = rhw ? 1 / rhw : 1;
        out.x = (m.m00 * x + m.m04 * y + m.m08 * z + m.m12) * rhw;
        out.y = (m.m01 * x + m.m05 * y + m.m09 * z + m.m13) * rhw;
        out.z = (m.m02 * x + m.m06 * y + m.m10 * z + m.m14) * rhw;
        return out;
    }
    /**
     * @en Vector and fourth order matrix multiplication, will complete the vector with a fourth element as one
     * @zh 向量与四维矩阵乘法，默认向量第四位为 0。
     */
    static transformMat4Normal(out, a, m) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        let rhw = m.m03 * x + m.m07 * y + m.m11 * z;
        rhw = rhw ? 1 / rhw : 1;
        out.x = (m.m00 * x + m.m04 * y + m.m08 * z) * rhw;
        out.y = (m.m01 * x + m.m05 * y + m.m09 * z) * rhw;
        out.z = (m.m02 * x + m.m06 * y + m.m10 * z) * rhw;
        return out;
    }
    /**
     * @en Vector and third order matrix multiplication
     * @zh 向量与三维矩阵乘法
     */
    static transformMat3(out, a, m) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        out.x = x * m.m00 + y * m.m03 + z * m.m06;
        out.y = x * m.m01 + y * m.m04 + z * m.m07;
        out.z = x * m.m02 + y * m.m05 + z * m.m08;
        return out;
    }
    /**
     * @en Affine transformation vector
     * @zh 向量仿射变换
     */
    static transformAffine(out, v, m) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12;
        out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13;
        out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14;
        return out;
    }
    /**
     * @en Vector quaternion multiplication: q*a*q^{-1}.
     * @zh 向量四元数乘法：q*a*q^{-1}。
     */
    static transformQuat(out, a, q) {
        // benchmarks: http://jsperf.com/quaternion-transform-Vec3-implementations
        // calculate quat * vec
        const ix = q.w * a.x + q.y * a.z - q.z * a.y;
        const iy = q.w * a.y + q.z * a.x - q.x * a.z;
        const iz = q.w * a.z + q.x * a.y - q.y * a.x;
        const iw = -q.x * a.x - q.y * a.y - q.z * a.z;
        // calculate result * inverse quat
        out.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
        out.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
        out.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
        return out;
    }
    /**
     * @en Transforms the current vector with given scale, rotation and translation in order
     * @zh 以缩放 -> 旋转 -> 平移顺序变换向量
     */
    static transformRTS(out, a, r, t, s) {
        const x = a.x * s.x;
        const y = a.y * s.y;
        const z = a.z * s.z;
        const ix = r.w * x + r.y * z - r.z * y;
        const iy = r.w * y + r.z * x - r.x * z;
        const iz = r.w * z + r.x * y - r.y * x;
        const iw = -r.x * x - r.y * y - r.z * z;
        out.x = ix * r.w + iw * -r.x + iy * -r.z - iz * -r.y + t.x;
        out.y = iy * r.w + iw * -r.y + iz * -r.x - ix * -r.z + t.y;
        out.z = iz * r.w + iw * -r.z + ix * -r.y - iy * -r.x + t.z;
        return out;
    }
    /**
     * @en Transforms the current vector with given scale, rotation and translation in reverse order
     * @zh 以平移 -> 旋转 -> 缩放顺序逆变换向量
     */
    static transformInverseRTS(out, a, r, t, s) {
        const x = a.x - t.x;
        const y = a.y - t.y;
        const z = a.z - t.z;
        const ix = r.w * x - r.y * z + r.z * y;
        const iy = r.w * y - r.z * x + r.x * z;
        const iz = r.w * z - r.x * y + r.y * x;
        const iw = r.x * x + r.y * y + r.z * z;
        out.x = (ix * r.w + iw * r.x + iy * r.z - iz * r.y) / s.x;
        out.y = (iy * r.w + iw * r.y + iz * r.x - ix * r.z) / s.y;
        out.z = (iz * r.w + iw * r.z + ix * r.y - iy * r.x) / s.z;
        return out;
    }
    /**
     * @en Rotates the vector with specified angle around X axis
     * @zh 绕 X 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param a radiance of rotation
     */
    static rotateX(out, v, o, a) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;
        // perform rotation
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = x;
        const ry = y * cos - z * sin;
        const rz = y * sin + z * cos;
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    }
    /**
     * @en Rotates the vector with specified angle around Y axis
     * @zh 绕 Y 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param a radiance of rotation
     */
    static rotateY(out, v, o, a) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;
        // perform rotation
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = z * sin + x * cos;
        const ry = y;
        const rz = z * cos - x * sin;
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    }
    /**
     * @en Rotates the vector with specified angle around Z axis
     * @zh 绕 Z 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param a radiance of rotation
     */
    static rotateZ(out, v, o, a) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;
        // perform rotation
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        const rz = z;
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    }
    /**
     * @en Rotates the vector with specified angle around any n axis
     * @zh 绕任意 n 轴旋转向量指定弧度
     * @param v rotation vector
     * @param o center of rotation
     * @param n axis of rotation
     * @param a radiance of rotation
     */
    static rotateN(out, v, o, n, a) {
        // Translate point to the origin
        const x = v.x - o.x;
        const y = v.y - o.y;
        const z = v.z - o.z;
        // perform rotation
        const nx = n.x;
        const ny = n.y;
        const nz = n.z;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rx = x * (nx * nx * (1.0 - cos) + cos) + y * (nx * ny * (1.0 - cos) - nx * sin) + z * (nx * nz * (1.0 - cos) + ny * sin);
        const ry = x * (nx * ny * (1.0 - cos) + nz * sin) + y * (ny * ny * (1.0 - cos) + cos) + z * (ny * nz * (1.0 - cos) - nx * sin);
        const rz = x * (nx * nz * (1.0 - cos) - ny * sin) + y * (ny * nz * (1.0 - cos) + nx * sin) + z * (nz * nz * (1.0 - cos) + cos);
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    }
    /**
     * @en Converts the given vector to an array
     * @zh 向量转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, v, ofs = 0) {
        out[ofs + 0] = v.x;
        out[ofs + 1] = v.y;
        out[ofs + 2] = v.z;
        return out;
    }
    /**
     * @en Converts the given array to a vector
     * @zh 数组转向量
     * @param ofs Array Start Offset
     */
    static fromArray(out, arr, ofs = 0) {
        out.x = arr[ofs + 0];
        out.y = arr[ofs + 1];
        out.z = arr[ofs + 2];
        return out;
    }
    /**
     * @en Check the equality of the two given vectors
     * @zh 向量等价判断
     */
    static strictEquals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }
    /**
     * @en Check whether the two given vectors are approximately equivalent
     * @zh 排除浮点数误差的向量近似等价判断
     */
    static equals(a, b, epsilon = EPSILON) {
        const { x: a0, y: a1, z: a2 } = a;
        const { x: b0, y: b1, z: b2 } = b;
        return (Math.abs(a0 - b0)
            <= epsilon * Math.max(1.0, Math.abs(a0), Math.abs(b0))
            && Math.abs(a1 - b1)
                <= epsilon * Math.max(1.0, Math.abs(a1), Math.abs(b1))
            && Math.abs(a2 - b2)
                <= epsilon * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
    }
    /**
     * @en Calculates the radian angle between two vectors
     * @zh 求两向量夹角弧度
     */
    static angle(a, b) {
        const magSqr1 = a.x * a.x + a.y * a.y + a.z * a.z;
        const magSqr2 = b.x * b.x + b.y * b.y + b.z * b.z;
        if (magSqr1 === 0 || magSqr2 === 0) {
            return 0.0;
        }
        const dot = a.x * b.x + a.y * b.y + a.z * b.z;
        let cosine = dot / (Math.sqrt(magSqr1 * magSqr2));
        cosine = clamp(cosine, -1.0, 1.0);
        return Math.acos(cosine);
    }
    /**
     * @en Calculates the projection vector on the specified plane
     * @zh 计算向量在指定平面上的投影
     * @param a projection vector
     * @param n the normal line of specified plane
     */
    static projectOnPlane(out, a, n) {
        return Vec3.subtract(out, a, Vec3.project(out, a, n));
    }
    /**
     * @en Calculates the projection on the specified vector
     * @zh 计算向量在指定向量上的投影
     * @param a projection vector
     * @param b target vector
     */
    static project(out, a, b) {
        const sqrLen = Vec3.lengthSqr(b);
        if (sqrLen < 0.000001) {
            return Vec3.set(out, 0, 0, 0);
        }
        else {
            return Vec3.multiplyScalar(out, b, Vec3.dot(a, b) / sqrLen);
        }
    }
    /**
     * @en Calculates a new position from current to target no more than `maxStep` distance.
     * @zh 计算一个新位置从当前位置移动不超过 `maxStep` 距离到目标位置。
     * @param current current position
     * @param target target position
     * @param maxStep maximum moving distance
     */
    static moveTowards(out, current, target, maxStep) {
        const deltaX = target.x - current.x;
        const deltaY = target.y - current.y;
        const deltaZ = target.z - current.z;
        const distanceSqr = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
        if (distanceSqr === 0 || (maxStep >= 0 && distanceSqr < maxStep * maxStep)) {
            out.x = target.x;
            out.y = target.y;
            out.z = target.z;
            return out;
        }
        const distance = Math.sqrt(distanceSqr);
        const scale = maxStep / distance;
        out.x = current.x + deltaX * scale;
        out.y = current.y + deltaY * scale;
        out.z = current.z + deltaZ * scale;
        return out;
    }
    /**
     * @zh 生成指定向量的一个正交单位向量。如果指定的向量 **精确地** 是零向量，则返回 **精确的** 零向量。
     * @en Generates an unit vector orthogonal to specified vector.
     * If the specified vector is **strictly** zero vector, the result is **strict** zero vector.
     * @param out @zh 生成的向量。@en The generated vector.
     * @param n @zh 输入向量。该向量 **不必** 是标准化的。 @en The input vector. **Need not** to be normalized.
     * @returns `out`
     */
    static generateOrthogonal(out, n) {
        const { x, y, z } = n;
        // 1. Drop the component with minimal magnitude.
        // 2. Negate one of the remain components.
        // 3. Swap the remain components.
        const absX = Math.abs(x);
        const absY = Math.abs(y);
        const absZ = Math.abs(z);
        if (absX < absY && absX < absZ) {
            Vec3.set(out, 0.0, z, -y);
        }
        else if (absY < absZ) {
            Vec3.set(out, z, 0.0, -x);
        }
        else {
            Vec3.set(out, y, -x, 0.0);
        }
        return Vec3.normalize(out, out);
    }
    constructor(x, y, z) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
    }
    /**
     * @en clone a Vec3 value
     * @zh 克隆当前向量。
     */
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    set(x, y, z) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        return this;
    }
    /**
     * @en Check whether the vector approximately equals another one.
     * @zh 判断当前向量是否在误差范围内与指定向量相等。
     * @param other Specified vector
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    equals(other, epsilon = EPSILON) {
        return (Math.abs(this.x - other.x) <= epsilon
            && Math.abs(this.y - other.y) <= epsilon
            && Math.abs(this.z - other.z) <= epsilon);
    }
    /**
     * @en Check whether the vector approximately equals another one.
     * @zh 判断当前向量是否在误差范围内与指定分量的向量相等。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    equals3f(x, y, z, epsilon = EPSILON) {
        return (Math.abs(this.x - x) <= epsilon
            && Math.abs(this.y - y) <= epsilon
            && Math.abs(this.z - z) <= epsilon);
    }
    /**
     * @en Check whether the current vector strictly equals another Vec3.
     * @zh 判断当前向量是否与指定向量相等。
     * @param other specified vector
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    strictEquals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }
    /**
     * @en Check whether the current vector strictly equals another Vec3.
     * @zh 判断当前向量是否与指定分量的向量相等。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    strictEquals3f(x, y, z) {
        return this.x === x && this.y === y && this.z === z;
    }
    /**
     * @en Transform to string with vector information.
     * @zh 返回当前向量的字符串表示。
     * @returns The string with vector information
     */
    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
    /**
     * @en Calculate linear interpolation result between this vector and another one with given ratio.
     * @zh 根据指定的插值比率，从当前向量到目标向量之间做插值。
     * @param to Target vector
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    lerp(to, ratio) {
        this.x += ratio * (to.x - this.x);
        this.y += ratio * (to.y - this.y);
        this.z += ratio * (to.z - this.z);
        return this;
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定分量的向量相加
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    add3f(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }
    /**
     * @en Subtracts one vector from this, and returns this.
     * @zh 向量减法。将当前向量减去指定向量的结果。
     * @param other specified vector
     */
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    }
    /**
     * @en Subtracts one vector from this, and returns this.
     * @zh 向量减法。将当前向量减去指定分量的向量
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    subtract3f(x, y, z) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }
    /**
     * @en Multiplies the current vector with a number, and returns this.
     * @zh 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    multiplyScalar(scalar) {
        if (typeof scalar === 'object') {
            console.warn('should use Vec3.multiply for vector * vector operation');
        }
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    /**
     * @en Multiplies the current vector with another one and return this
     * @zh 向量乘法。将当前向量乘以与指定向量的结果赋值给当前向量。
     * @param other specified vector
     */
    multiply(other) {
        if (typeof other !== 'object') {
            console.warn('should use Vec3.scale for vector * scalar operation');
        }
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        return this;
    }
    /**
     * @en Multiplies the current vector with another one and return this
     * @zh 向量乘法。将当前向量与指定分量的向量相乘的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    multiply3f(x, y, z) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }
    /**
     * @en Element-wisely divides this vector with another one, and return this.
     * @zh 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param other specified vector
     */
    divide(other) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
        return this;
    }
    /**
     * @en Element-wisely divides this vector with another one, and return this.
     * @zh 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     */
    divide3f(x, y, z) {
        this.x /= x;
        this.y /= y;
        this.z /= z;
        return this;
    }
    /**
     * @en Sets each component of this vector with its negative value
     * @zh 将当前向量的各个分量取反
     */
    negative() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }
    /**
     * @en Clamp the vector between minInclusive and maxInclusive.
     * @zh 设置当前向量的值，使其各个分量都处于指定的范围内。
     * @param minInclusive Minimum value allowed
     * @param maxInclusive Maximum value allowed
     * @returns `this`
     */
    clampf(minInclusive, maxInclusive) {
        this.x = clamp(this.x, minInclusive.x, maxInclusive.x);
        this.y = clamp(this.y, minInclusive.y, maxInclusive.y);
        this.z = clamp(this.z, minInclusive.z, maxInclusive.z);
        return this;
    }
    /**
     * @en Calculates the dot product with another vector
     * @zh 向量点乘。
     * @param other specified vector
     * @returns The result of calculates the dot product with another vector
     */
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
    /**
     * @en Calculates the cross product with another vector.
     * @zh 向量叉乘。将当前向量左叉乘指定向量
     * @param other specified vector
     */
    cross(other) {
        const { x: ax, y: ay, z: az } = this;
        const { x: bx, y: by, z: bz } = other;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }
    /**
     * @en Returns the length of this vector.
     * @zh 计算向量的长度（模）。
     * @returns Length of vector
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    /**
     * @en Returns the squared length of this vector.
     * @zh 计算向量长度（模）的平方。
     * @returns the squared length of this vector
     */
    lengthSqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    /**
     * @en Normalize the current vector.
     * @zh 将当前向量归一化
     */
    normalize() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        let len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
        }
        return this;
    }
    /**
     * @en Transforms the vec3 with a mat4. 4th vector component is implicitly '1'
     * @zh 将当前向量视为 w 分量为 1 的四维向量，应用四维矩阵变换到当前矩阵
     * @param matrix matrix to transform with
     */
    transformMat4(matrix) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        let rhw = matrix.m03 * x + matrix.m07 * y + matrix.m11 * z + matrix.m15;
        rhw = rhw ? 1 / rhw : 1;
        this.x = (matrix.m00 * x + matrix.m04 * y + matrix.m08 * z + matrix.m12) * rhw;
        this.y = (matrix.m01 * x + matrix.m05 * y + matrix.m09 * z + matrix.m13) * rhw;
        this.z = (matrix.m02 * x + matrix.m06 * y + matrix.m10 * z + matrix.m14) * rhw;
        return this;
    }
}
Vec3.UNIT_X = Object.freeze(new Vec3(1, 0, 0));
Vec3.UNIT_Y = Object.freeze(new Vec3(0, 1, 0));
Vec3.UNIT_Z = Object.freeze(new Vec3(0, 0, 1));
Vec3.RIGHT = Object.freeze(new Vec3(1, 0, 0));
Vec3.UP = Object.freeze(new Vec3(0, 1, 0));
Vec3.FORWARD = Object.freeze(new Vec3(0, 0, -1)); // we use -z for view-dir
Vec3.ZERO = Object.freeze(new Vec3(0, 0, 0));
Vec3.ONE = Object.freeze(new Vec3(1, 1, 1));
Vec3.NEG_ONE = Object.freeze(new Vec3(-1, -1, -1));
/**
 * @zh 球面线性插值。多用于插值两个方向向量。
 * @en Spherical linear interpolation. Commonly used in interpolation between directional vectors.
 * @param out @zh 输出向量。 @en Output vector.
 * @param from @zh 起点向量。 @en Start vector.
 * @param to @zh 终点向量。 @en Destination vector.
 * @param t @zh 插值参数。@en Interpolation parameter.
 * @returns `out`
 * @description
 * @zh
 * - 如果 `from`、`to` 中任何一个接近零向量，则结果就是 `from` 到 `to` 线性插值的结果；
 *
 * - 否则，如果 `from`、`to` 方向刚好接近相反，
 * 则结果向量是满足以下条件的一个向量：结果向量和两个输入向量的夹角之比是 `t`，其长度是 `from` 到 `to` 的长度线性插值的结果；
 *
 * - 否则，结果是从标准化后的 `from` 到 标准化后的 `to`
 * 进行球面线性插值的结果乘以 `from` 到 `to` 的长度线性插值后的长度。
 * @en
 * - If either `from` or `to` is close to zero vector,
 * the result would be the (non-spherical) linear interpolation result from `from` to `to`.
 *
 * - Otherwise, if `from` and `to` have almost opposite directions,
 * the result would be such a vector so that:
 * The angle ratio between result vector and input vectors is `t`,
 * the length of result vector is the linear interpolation of lengths from `from` to `to`.
 *
 * - Otherwise, the result would be the spherical linear interpolation result
 * from normalized `from` to normalized `to`,
 * then scaled by linear interpolation of lengths from `from` to `to`.
 */
Vec3.slerp = (() => {
    const cacheV1 = new Vec3();
    const cacheV2 = new Vec3();
    const cacheV3 = new Vec3();
    return (out, from, to, t) => {
        const EPSILON = 1e-5;
        const lenFrom = Vec3.len(from);
        const lenTo = Vec3.len(to);
        if (lenFrom < EPSILON || lenTo < EPSILON) {
            return Vec3.lerp(out, from, to, t);
        }
        const lenLerped = lerp(lenFrom, lenTo, t);
        const dot = Vec3.dot(from, to) / (lenFrom * lenTo);
        if (dot > 1.0 - EPSILON) {
            // If the directions are almost same, slerp should be close to lerp.
            return Vec3.lerp(out, from, to, t);
        }
        else if (dot < -1.0 + EPSILON) {
            // If the directions are almost opposite,
            // every vector that orthonormal to the directions can be the rotation axis.
            const fromNormalized = Vec3.multiplyScalar(cacheV1, from, 1.0 / lenFrom);
            const axis = Vec3.generateOrthogonal(cacheV2, fromNormalized);
            const angle = Math.PI * t;
            rotateAxisAngle(cacheV3, fromNormalized, axis, angle);
            Vec3.multiplyScalar(out, cacheV3, lenLerped);
            return out;
        }
        else {
            // Do not have to clamp. We done it before.
            const dotClamped = dot;
            const theta = Math.acos(dotClamped) * t;
            const fromNormalized = Vec3.multiplyScalar(cacheV1, from, 1.0 / lenFrom);
            const toNormalized = Vec3.multiplyScalar(cacheV2, to, 1.0 / lenTo);
            Vec3.scaleAndAdd(cacheV3, toNormalized, fromNormalized, -dotClamped);
            Vec3.normalize(cacheV3, cacheV3);
            Vec3.multiplyScalar(cacheV3, cacheV3, Math.sin(theta));
            Vec3.scaleAndAdd(cacheV3, cacheV3, fromNormalized, Math.cos(theta));
            Vec3.multiplyScalar(out, cacheV3, lenLerped);
            return out;
        }
    };
})();
function v3(x, y, z) {
    return new Vec3(x, y, z);
}
/**
 * Rotates `input` around `axis` for `angle` radians.
 */
const rotateAxisAngle = (() => {
    // TODO: can this cause v8 hidden class problem?
    const cacheQ = { x: 0.0, y: 0.0, z: 0.0, w: 0.0 };
    return (out, input, axis, angle) => {
        // This should be equivalent to `Quat.fromAxisAngle(cacheQ, axis, angle)`.
        // Here we duplicate the code to avoid circular reference.
        const rad = angle * 0.5;
        const s = Math.sin(rad);
        cacheQ.x = s * axis.x;
        cacheQ.y = s * axis.y;
        cacheQ.z = s * axis.z;
        cacheQ.w = Math.cos(rad);
        Vec3.transformQuat(out, input, cacheQ);
        return out;
    };
})();

/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en Representation of 2D vectors and points.
 * @zh 二维向量。
 */
class Vec2 {
    /**
     * @en Obtains a clone of the given vector object
     * @zh 获得指定向量的拷贝
     */
    static clone(a) {
        return new Vec2(a.x, a.y);
    }
    /**
     * @en Copy the target vector and save the results to out vector object
     * @zh 复制目标向量
     */
    static copy(out, a) {
        out.x = a.x;
        out.y = a.y;
        return out;
    }
    /**
     * @en Sets the out vector with the given x and y values
     * @zh 设置向量值
     */
    static set(out, x, y) {
        out.x = x;
        out.y = y;
        return out;
    }
    /**
     * @en Element-wise vector addition and save the results to out vector object
     * @zh 逐元素向量加法
     */
    static add(out, a, b) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        return out;
    }
    /**
     * @en Element-wise vector subtraction and save the results to out vector object
     * @zh 逐元素向量减法
     */
    static subtract(out, a, b) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        return out;
    }
    /**
     * @en Element-wise vector multiplication and save the results to out vector object
     * @zh 逐元素向量乘法
     */
    static multiply(out, a, b) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        return out;
    }
    /**
     * @en Element-wise vector division and save the results to out vector object
     * @zh 逐元素向量除法
     */
    static divide(out, a, b) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        return out;
    }
    /**
     * @en Rounds up by elements of the vector and save the results to out vector object
     * @zh 逐元素向量向上取整
     */
    static ceil(out, a) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        return out;
    }
    /**
     * @en Element-wise rounds down of the current vector and save the results to the out vector
     * @zh 逐元素向量向下取整
     */
    static floor(out, a) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        return out;
    }
    /**
     * @en Calculates element-wise minimum values and save to the out vector
     * @zh 逐元素向量最小值
     */
    static min(out, a, b) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        return out;
    }
    /**
     * @en Calculates element-wise maximum values and save to the out vector
     * @zh 逐元素向量最大值
     */
    static max(out, a, b) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        return out;
    }
    /**
     * @en Calculates element-wise round results and save to the out vector
     * @zh 逐元素向量四舍五入取整
     */
    static round(out, a) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        return out;
    }
    /**
     * @en Vector scalar multiplication and save the results to out vector object
     * @zh 向量标量乘法
     */
    static multiplyScalar(out, a, b) {
        out.x = a.x * b;
        out.y = a.y * b;
        return out;
    }
    /**
     * @en Element-wise multiplication and addition with the equation: a + b * scale
     * @zh 逐元素向量乘加: A + B * scale
     */
    static scaleAndAdd(out, a, b, scale) {
        out.x = a.x + (b.x * scale);
        out.y = a.y + (b.y * scale);
        return out;
    }
    /**
     * @en Calculates the euclidean distance of two vectors
     * @zh 求两向量的欧氏距离
     */
    static distance(a, b) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        return Math.sqrt(x * x + y * y);
    }
    /**
     * @en Calculates the squared euclidean distance of two vectors
     * @zh 求两向量的欧氏距离平方
     */
    static squaredDistance(a, b) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        return x * x + y * y;
    }
    /**
     * @en Calculates the length of the vector
     * @zh 求向量长度
     */
    static len(a) {
        const x = a.x;
        const y = a.y;
        return Math.sqrt(x * x + y * y);
    }
    /**
     * @en Calculates the squared length of the vector
     * @zh 求向量长度平方
     */
    static lengthSqr(a) {
        const x = a.x;
        const y = a.y;
        return x * x + y * y;
    }
    /**
     * @en Sets each element to its negative value
     * @zh 逐元素向量取负
     */
    static negate(out, a) {
        out.x = -a.x;
        out.y = -a.y;
        return out;
    }
    /**
     * @en Sets each element to its inverse value, zero value will become Infinity
     * @zh 逐元素向量取倒数，接近 0 时返回 Infinity
     */
    static inverse(out, a) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        return out;
    }
    /**
     * @en Sets each element to its inverse value, zero value will remain zero
     * @zh 逐元素向量取倒数，接近 0 时返回 0
     */
    static inverseSafe(out, a) {
        const x = a.x;
        const y = a.y;
        if (Math.abs(x) < EPSILON) {
            out.x = 0;
        }
        else {
            out.x = 1.0 / x;
        }
        if (Math.abs(y) < EPSILON) {
            out.y = 0;
        }
        else {
            out.y = 1.0 / y;
        }
        return out;
    }
    /**
     * @en Sets the normalized vector to the out vector, returns a zero vector if input is a zero vector.
     * @zh 归一化向量，输入零向量将会返回零向量。
     */
    static normalize(out, a) {
        const x = a.x;
        const y = a.y;
        let len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
        }
        else {
            out.x = 0;
            out.y = 0;
        }
        return out;
    }
    /**
     * @en Calculates the dot product of the vector
     * @zh 向量点积（数量积）
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static cross(out, a, b) {
        if (out instanceof Vec3) {
            out.x = out.y = 0;
            out.z = a.x * b.y - a.y * b.x;
            return out;
        }
        else {
            return out.x * a.y - out.y * a.x;
        }
    }
    /**
     * @en Calculates the linear interpolation between two vectors with a given ratio: A + t * (B - A)
     * @zh 逐元素向量线性插值： A + t * (B - A)
     */
    static lerp(out, a, b, t) {
        const x = a.x;
        const y = a.y;
        out.x = x + t * (b.x - x);
        out.y = y + t * (b.y - y);
        return out;
    }
    /**
     * @en Generates a uniformly distributed random vector points from center to the surface of the unit sphere
     * @zh 生成一个在单位圆上均匀分布的随机向量
     * @param scale vector length
     */
    static random(out, scale) {
        scale = scale || 1.0;
        const r = random() * 2.0 * Math.PI;
        out.x = Math.cos(r) * scale;
        out.y = Math.sin(r) * scale;
        return out;
    }
    /**
     * @en Vector and third order matrix multiplication, will complete the vector with a third value as one
     * @zh 向量与三维矩阵乘法，默认向量第三位为 1。
     */
    static transformMat3(out, a, m) {
        const x = a.x;
        const y = a.y;
        out.x = m.m00 * x + m.m03 * y + m.m06;
        out.y = m.m01 * x + m.m04 * y + m.m07;
        return out;
    }
    /**
     * @en Vector and third order matrix multiplication, will complete the vector with a third and a fourth element as one
     * @zh 向量与四维矩阵乘法，默认向量第三位为 0，第四位为 1。
     */
    static transformMat4(out, a, m) {
        const x = a.x;
        const y = a.y;
        out.x = m.m00 * x + m.m04 * y + m.m12;
        out.y = m.m01 * x + m.m05 * y + m.m13;
        return out;
    }
    /**
     * @en Gets the string representation of the given vector
     * @zh 返回向量的字符串表示
     */
    static str(a) {
        return `Vec2(${a.x}, ${a.y})`;
    }
    /**
     * @en Converts the given vector to an array
     * @zh 向量转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, v, ofs = 0) {
        out[ofs + 0] = v.x;
        out[ofs + 1] = v.y;
        return out;
    }
    /**
     * @en Converts the given array to a vector
     * @zh 数组转向量
     * @param ofs Array Start Offset
     */
    static fromArray(out, arr, ofs = 0) {
        out.x = arr[ofs + 0];
        out.y = arr[ofs + 1];
        return out;
    }
    /**
     * @en Check the equality of the two given vectors
     * @zh 向量等价判断
     */
    static strictEquals(a, b) {
        return a.x === b.x && a.y === b.y;
    }
    /**
     * @en Check whether the two given vectors are approximately equivalent
     * @zh 排除浮点数误差的向量近似等价判断
     */
    static equals(a, b, epsilon = EPSILON) {
        return (Math.abs(a.x - b.x)
            <= epsilon * Math.max(1.0, Math.abs(a.x), Math.abs(b.x))
            && Math.abs(a.y - b.y)
                <= epsilon * Math.max(1.0, Math.abs(a.y), Math.abs(b.y)));
    }
    /**
     * @en Calculates the radian angle between two vectors, returns zero if either vector is a zero vector.
     * @zh 求两向量夹角弧度，任意一个向量是零向量则返回零。
     */
    static angle(a, b) {
        const magSqr1 = a.x * a.x + a.y * a.y;
        const magSqr2 = b.x * b.x + b.y * b.y;
        if (magSqr1 === 0 || magSqr2 === 0) {
            return 0.0;
        }
        const dot = a.x * b.x + a.y * b.y;
        let cosine = dot / (Math.sqrt(magSqr1 * magSqr2));
        cosine = clamp(cosine, -1.0, 1.0);
        return Math.acos(cosine);
    }
    constructor(x, y) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
        }
    }
    /**
     * @en clone a Vec2 value
     * @zh 克隆当前向量。
     */
    clone() {
        return new Vec2(this.x, this.y);
    }
    set(x, y) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
        }
        return this;
    }
    /**
     * @en Check whether the vector approximately equals another one.
     * @zh 判断当前向量是否在误差范围内与指定向量相等。
     * @param other Specified vector
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @return Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    equals(other, epsilon = EPSILON) {
        return (Math.abs(this.x - other.x)
            <= epsilon * Math.max(1.0, Math.abs(this.x), Math.abs(other.x))
            && Math.abs(this.y - other.y)
                <= epsilon * Math.max(1.0, Math.abs(this.y), Math.abs(other.y)));
    }
    /**
     * @en Check whether the vector approximately equals another one.
     * @zh 判断当前向量是否在误差范围内与指定分量的向量相等。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @return Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    equals2f(x, y, epsilon = EPSILON) {
        return (Math.abs(this.x - x)
            <= epsilon * Math.max(1.0, Math.abs(this.x), Math.abs(x))
            && Math.abs(this.y - y)
                <= epsilon * Math.max(1.0, Math.abs(this.y), Math.abs(y)));
    }
    /**
     * @en Check whether the current vector strictly equals another Vec2.
     * @zh 判断当前向量是否与指定向量相等。
     * @param other specified vector
     * @return Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    strictEquals(other) {
        return other && this.x === other.x && this.y === other.y;
    }
    /**
     * @en Check whether the current vector strictly equals another Vec2.
     * @zh 判断当前向量是否与指定分量的向量相等。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @return Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    strictEquals2f(x, y) {
        return this.x === x && this.y === y;
    }
    /**
     * @en Transform to string with vector information.
     * @zh 返回当前向量的字符串表示。
     * @returns The string with vector information
     */
    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
    /**
     * @en Calculate linear interpolation result between this vector and another one with given ratio.
     * @zh 根据指定的插值比率，从当前向量到目标向量之间做插值。
     * @param to Target vector
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    lerp(to, ratio) {
        const x = this.x;
        const y = this.y;
        this.x = x + ratio * (to.x - x);
        this.y = y + ratio * (to.y - y);
        return this;
    }
    /**
     * @en Clamp the vector between minInclusive and maxInclusive.
     * @zh 设置当前向量的值，使其各个分量都处于指定的范围内。
     * @param minInclusive Minimum value allowed
     * @param maxInclusive Maximum value allowed
     * @return `this`
     */
    clampf(minInclusive, maxInclusive) {
        this.x = clamp(this.x, minInclusive.x, maxInclusive.x);
        this.y = clamp(this.y, minInclusive.y, maxInclusive.y);
        return this;
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定分量的向量相加
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    add2f(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    /**
     * @en Subtracts one vector from this, and returns this.
     * @zh 向量减法。将当前向量减去指定向量
     * @param other specified vector
     */
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    /**
     * @en Subtracts one vector from this, and returns this.
     * @zh 向量减法。将当前向量减去指定分量的向量
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    subtract2f(x, y) {
        this.x -= x;
        this.y -= y;
        return this;
    }
    /**
     * @en Multiplies the current vector with a number, and returns this.
     * @zh 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    multiplyScalar(scalar) {
        if (typeof scalar === 'object') {
            console.warn('should use Vec2.multiply for vector * vector operation');
        }
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    /**
     * @en Multiplies the current vector with another one and return this
     * @zh 向量乘法。将当前向量乘以与指定向量的结果赋值给当前向量。
     * @param other specified vector
     */
    multiply(other) {
        if (typeof other !== 'object') {
            console.warn('should use Vec2.scale for vector * scalar operation');
        }
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }
    /**
     * @en Multiplies the current vector with another one and return this
     * @zh 向量乘法。将当前向量与指定分量的向量相乘的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    multiply2f(x, y) {
        this.x *= x;
        this.y *= y;
        return this;
    }
    /**
     * @en Element-wisely divides this vector with another one, and return this.
     * @zh 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param other specified vector
     */
    divide(other) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }
    /**
     * @en Element-wisely divides this vector with another one, and return this.
     * @zh 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     */
    divide2f(x, y) {
        this.x /= x;
        this.y /= y;
        return this;
    }
    /**
     * @en Sets each component of this vector with its negative value
     * @zh 将当前向量的各个分量取反
     */
    negative() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    /**
     * @en Calculates the dot product with another vector
     * @zh 向量点乘。
     * @param other specified vector
     * @return The result of calculates the dot product with another vector
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    /**
     * @en Calculates the cross product with another vector.
     * @zh 向量叉乘。
     * @param other specified vector
     * @return `out`
     */
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    /**
     * @en Returns the length of this vector.
     * @zh 计算向量的长度（模）。
     * @return Length of vector
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    /**
     * @en Returns the squared length of this vector.
     * @zh 计算向量长度（模）的平方。
     * @return the squared length of this vector
     */
    lengthSqr() {
        return this.x * this.x + this.y * this.y;
    }
    /**
     * @en Normalize the current vector.
     * @zh 将当前向量归一化。
     */
    normalize() {
        const x = this.x;
        const y = this.y;
        let len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x *= len;
            this.y *= len;
        }
        return this;
    }
    /**
     * @en Calculates radian angle between two vectors, returns zero if either vector is a zero vector.
     * @zh 获取当前向量和指定向量之间的弧度，任意一个向量是零向量则返回零。
     * @param other specified vector.
     * @return The angle between the current vector and the specified vector.
     */
    angle(other) {
        const magSqr1 = this.lengthSqr();
        const magSqr2 = other.lengthSqr();
        if (magSqr1 === 0 || magSqr2 === 0) {
            return 0.0;
        }
        const dot = this.dot(other);
        let cosine = dot / (Math.sqrt(magSqr1 * magSqr2));
        cosine = clamp(cosine, -1.0, 1.0);
        return Math.acos(cosine);
    }
    /**
     * @en Get angle in radian between this and vector with direction.
     * @zh 获取当前向量和指定向量之间的有符号弧度。<br/>
     * 有符号弧度的取值范围为 (-PI, PI]，当前向量可以通过逆时针旋转有符号角度与指定向量同向。<br/>
     * @param other specified vector
     * @return The signed angle between the current vector and the specified vector (in radians); if there is a zero vector in the current vector and the specified vector, 0 is returned.
     */
    signAngle(other) {
        const angle = this.angle(other);
        return this.cross(other) < 0 ? -angle : angle;
    }
    /**
     * @en Rotates the current vector by an angle in radian value. Counterclockwise is the positive direction.
     * @zh 将当前向量进行旋转，逆时针为正方向。
     * @param radians radians of rotation.
     */
    rotate(radians) {
        const x = this.x;
        const y = this.y;
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);
        this.x = cos * x - sin * y;
        this.y = sin * x + cos * y;
        return this;
    }
    /**
     * @en Projects the current vector on another one
     * @zh 计算当前向量在指定向量上的投影向量。
     * @param other specified vector
     */
    project(other) {
        const scalar = this.dot(other) / other.dot(other);
        this.x = other.x * scalar;
        this.y = other.y * scalar;
        return this;
    }
    /**
     * @en Transforms the vec2 with a mat4. 3rd vector component is implicitly '0', 4th vector component is implicitly '1'
     * @zh 将当前向量视为 z 分量为 0、w 分量为 1 的四维向量，<br/>
     * 应用四维矩阵变换到当前矩阵<br/>
     * @param matrix matrix to transform with
     */
    transformMat4(matrix) {
        const x = this.x;
        const y = this.y;
        this.x = matrix.m00 * x + matrix.m04 * y + matrix.m12;
        this.y = matrix.m01 * x + matrix.m05 * y + matrix.m13;
        return this;
    }
}
Vec2.ZERO = Object.freeze(new Vec2(0, 0));
Vec2.ONE = Object.freeze(new Vec2(1, 1));
Vec2.NEG_ONE = Object.freeze(new Vec2(-1, -1));
Vec2.UNIT_X = Object.freeze(new Vec2(1, 0));
Vec2.UNIT_Y = Object.freeze(new Vec2(0, 1));
function v2(x, y) {
    return new Vec2(x, y);
}

/*
 Copyright (c) 2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en Representation of four-dimensional vectors.
 * @zh 四维向量。
 */
class Vec4 {
    /**
     * @en Obtains a clone of the given vector object
     * @zh 获得指定向量的拷贝
     */
    static clone(a) {
        return new Vec4(a.x, a.y, a.z, a.w);
    }
    /**
     * @en Copy the target vector and save the results to out vector object
     * @zh 复制目标向量
     */
    static copy(out, a) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        out.w = a.w;
        return out;
    }
    /**
     * @en Sets the out vector with the given x, y, z and w values
     * @zh 设置向量值
     */
    static set(out, x, y, z, w) {
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
        return out;
    }
    /**
     * @en set value from color
     * @zh 从颜色值设置向量
     * @param out
     * @param color
     */
    static fromColor(out, color) {
        out.x = color.r;
        out.y = color.g;
        out.z = color.b;
        out.w = color.a;
        return out;
    }
    /**
     * @en The angle between two vectors
     * @zh 两个向量之间的夹角
     */
    static angle(a, b) {
        // use atan2 to get the sign of the angle correctly
        const dx = (a.y * b.z - a.z * b.y);
        const dy = (a.z * b.x - a.x * b.z);
        const dz = (a.x * b.y - a.y * b.x);
        const dotVal = (a.x * b.x + a.y * b.y + a.z * b.z);
        return Math.atan2(Math.sqrt(dx * dx + dy * dy + dz * dz), dotVal);
    }
    /**
     * @en Element-wise vector addition and save the results to out vector object
     * @zh 逐元素向量加法
     */
    static add(out, a, b) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        out.w = a.w + b.w;
        return out;
    }
    /**
     * @en Element-wise vector subtraction and save the results to out vector object
     * @zh 逐元素向量减法
     */
    static subtract(out, a, b) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        out.w = a.w - b.w;
        return out;
    }
    /**
     * @en Element-wise vector multiplication and save the results to out vector object
     * @zh 逐元素向量乘法
     */
    static multiply(out, a, b) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        out.w = a.w * b.w;
        return out;
    }
    /**
     * @en Element-wise vector division and save the results to out vector object
     * @zh 逐元素向量除法
     */
    static divide(out, a, b) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        out.z = a.z / b.z;
        out.w = a.w / b.w;
        return out;
    }
    /**
     * @en Rounds up by elements of the vector and save the results to out vector object
     * @zh 逐元素向量向上取整
     */
    static ceil(out, a) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        out.z = Math.ceil(a.z);
        out.w = Math.ceil(a.w);
        return out;
    }
    /**
     * @en Element-wise rounds down of the current vector and save the results to the out vector
     * @zh 逐元素向量向下取整
     */
    static floor(out, a) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        out.z = Math.floor(a.z);
        out.w = Math.floor(a.w);
        return out;
    }
    /**
     * @en Calculates the minimum values by elements of the vector and save the results to the out vector
     * @zh 逐元素向量最小值
     */
    static min(out, a, b) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
        return out;
    }
    /**
     * @en Calculates the maximum values by elements of the vector and save the results to the out vector
     * @zh 逐元素向量最大值
     */
    static max(out, a, b) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
        return out;
    }
    /**
     * @en Calculates element-wise round results and save to the out vector
     * @zh 逐元素向量四舍五入取整
     */
    static round(out, a) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        out.z = Math.round(a.z);
        out.w = Math.round(a.w);
        return out;
    }
    /**
     * @en Vector scalar multiplication and save the results to out vector object
     * @zh 向量标量乘法
     */
    static multiplyScalar(out, a, b) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
        return out;
    }
    /**
     * @en Element-wise multiplication and addition with the equation: a + b * scale
     * @zh 逐元素向量乘加: A + B * scale
     */
    static scaleAndAdd(out, a, b, scale) {
        out.x = a.x + (b.x * scale);
        out.y = a.y + (b.y * scale);
        out.z = a.z + (b.z * scale);
        out.w = a.w + (b.w * scale);
        return out;
    }
    /**
     * @en Calculates the euclidean distance of two vectors
     * @zh 求两向量的欧氏距离
     */
    static distance(a, b) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        const w = b.w - a.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    /**
     * @en Calculates the squared euclidean distance of two vectors
     * @zh 求两向量的欧氏距离平方
     */
    static squaredDistance(a, b) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        const w = b.w - a.w;
        return x * x + y * y + z * z + w * w;
    }
    /**
     * @en Calculates the length of the vector
     * @zh 求向量长度
     */
    static len(a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    /**
     * @en Calculates the squared length of the vector
     * @zh 求向量长度平方
     */
    static lengthSqr(a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        return x * x + y * y + z * z + w * w;
    }
    /**
     * @en Sets each element to its negative value
     * @zh 逐元素向量取负
     */
    static negate(out, a) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;
        out.w = -a.w;
        return out;
    }
    /**
     * @en Sets each element to its inverse value, zero value will become Infinity
     * @zh 逐元素向量取倒数，接近 0 时返回 Infinity
     */
    static inverse(out, a) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        out.z = 1.0 / a.z;
        out.w = 1.0 / a.w;
        return out;
    }
    /**
     * @en Sets each element to its inverse value, zero value will remain zero
     * @zh 逐元素向量取倒数，接近 0 时返回 0
     */
    static inverseSafe(out, a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        if (Math.abs(x) < EPSILON) {
            out.x = 0;
        }
        else {
            out.x = 1.0 / x;
        }
        if (Math.abs(y) < EPSILON) {
            out.y = 0;
        }
        else {
            out.y = 1.0 / y;
        }
        if (Math.abs(z) < EPSILON) {
            out.z = 0;
        }
        else {
            out.z = 1.0 / z;
        }
        if (Math.abs(w) < EPSILON) {
            out.w = 0;
        }
        else {
            out.w = 1.0 / w;
        }
        return out;
    }
    /**
     * @en Sets the normalized vector to the out vector, returns a zero vector if input is a zero vector.
     * @zh 归一化向量，输入零向量将会返回零向量。
     */
    static normalize(out, a) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
            out.z = z * len;
            out.w = w * len;
        }
        else {
            out.x = 0;
            out.y = 0;
            out.z = 0;
            out.w = 0;
        }
        return out;
    }
    /**
     * @en Calculates the dot product of the vector
     * @zh 向量点积（数量积）
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    }
    /**
     * @en Calculates the linear interpolation between two vectors with a given ratio
     * @zh 逐元素向量线性插值： A + t * (B - A)
     */
    static lerp(out, a, b, t) {
        out.x = a.x + t * (b.x - a.x);
        out.y = a.y + t * (b.y - a.y);
        out.z = a.z + t * (b.z - a.z);
        out.w = a.w + t * (b.w - a.w);
        return out;
    }
    /**
     * @en Scales all ell elements of this vector by the specified scalar value
     * @zh 逐元素向量缩放
     */
    static scale(out, a, b) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
        return out;
    }
    /**
     * @en Generates a uniformly distributed random vector points from center to the surface of the unit sphere
     * @zh 生成一个在单位球体上均匀分布的随机向量
     * @param scale vector length
     */
    static random(out, scale) {
        scale = scale || 1.0;
        const phi = random() * 2.0 * Math.PI;
        const cosTheta = random() * 2 - 1;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        out.x = sinTheta * Math.cos(phi) * scale;
        out.y = sinTheta * Math.sin(phi) * scale;
        out.z = cosTheta * scale;
        out.w = 0;
        return out;
    }
    /**
     * @en Vector and fourth order matrix multiplication
     * @zh 向量与四维矩阵乘法
     */
    static transformMat4(out, a, m) {
        const x = a.x;
        const y = a.y;
        const z = a.z;
        const w = a.w;
        out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12 * w;
        out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13 * w;
        out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14 * w;
        out.w = m.m03 * x + m.m07 * y + m.m11 * z + m.m15 * w;
        return out;
    }
    /**
     * @en Transform the vector with the given affine transformation
     * @zh 向量仿射变换
     */
    static transformAffine(out, v, m) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        const w = v.w;
        out.x = m.m00 * x + m.m04 * y + m.m08 * z + m.m12 * w;
        out.y = m.m01 * x + m.m05 * y + m.m09 * z + m.m13 * w;
        out.z = m.m02 * x + m.m06 * y + m.m10 * z + m.m14 * w;
        out.w = v.w;
        return out;
    }
    /**
     * @en Vector quaternion multiplication
     * @zh 向量四元数乘法
     */
    static transformQuat(out, a, q) {
        // qpq^{-1} https://en.wikipedia.org/wiki/Quaternion#Hamilton_product
        const { x, y, z } = a;
        const _x = q.x;
        const _y = q.y;
        const _z = q.z;
        const _w = q.w;
        // calculate quat * vec
        const ix = _w * x + _y * z - _z * y;
        const iy = _w * y + _z * x - _x * z;
        const iz = _w * z + _x * y - _y * x;
        const iw = -_x * x - _y * y - _z * z;
        // calculate result * inverse quat
        out.x = ix * _w + iw * -_x + iy * -_z - iz * -_y;
        out.y = iy * _w + iw * -_y + iz * -_x - ix * -_z;
        out.z = iz * _w + iw * -_z + ix * -_y - iy * -_x;
        out.w = a.w;
        return out;
    }
    /**
     * @en Converts the given vector to an array
     * @zh 向量转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, v, ofs = 0) {
        out[ofs + 0] = v.x;
        out[ofs + 1] = v.y;
        out[ofs + 2] = v.z;
        out[ofs + 3] = v.w;
        return out;
    }
    /**
     * @en Converts the given array to a vector
     * @zh 数组转向量
     * @param ofs Array Start Offset
     */
    static fromArray(out, arr, ofs = 0) {
        out.x = arr[ofs + 0];
        out.y = arr[ofs + 1];
        out.z = arr[ofs + 2];
        out.w = arr[ofs + 3];
        return out;
    }
    /**
     * @en Check the equality of the two given vectors
     * @zh 向量等价判断
     */
    static strictEquals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
    }
    /**
     * @en Check whether the two given vectors are approximately equivalent
     * @zh 排除浮点数误差的向量近似等价判断
     */
    static equals(a, b, epsilon = EPSILON) {
        // relative epsilon comparison with small number guard:
        // https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
        const hasInf = Math.abs(a.x) === Infinity || Math.abs(a.y) === Infinity || Math.abs(a.z) === Infinity || Math.abs(a.w) === Infinity
            || Math.abs(b.x) === Infinity || Math.abs(b.y) === Infinity || Math.abs(b.z) === Infinity || Math.abs(b.w) === Infinity;
        return !hasInf && (Math.abs(a.x - b.x) <= epsilon * Math.max(1.0, Math.abs(a.x), Math.abs(b.x))
            && Math.abs(a.y - b.y) <= epsilon * Math.max(1.0, Math.abs(a.y), Math.abs(b.y))
            && Math.abs(a.z - b.z) <= epsilon * Math.max(1.0, Math.abs(a.z), Math.abs(b.z))
            && Math.abs(a.w - b.w) <= epsilon * Math.max(1.0, Math.abs(a.w), Math.abs(b.w)));
    }
    constructor(x, y, z, w) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w || 0;
        }
    }
    /**
     * @en clone the current Vec4 value.
     * @zh 克隆当前向量。
     */
    clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }
    set(x, y, z, w) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w || 0;
        }
        return this;
    }
    /**
     * @en Check whether the vector approximately equals another one.
     * @zh 判断当前向量是否在误差范围内与指定向量相等。
     * @param other Specified vector
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    equals(other, epsilon = EPSILON) {
        return (Math.abs(this.x - other.x) <= epsilon * Math.max(1.0, Math.abs(this.x), Math.abs(other.x))
            && Math.abs(this.y - other.y) <= epsilon * Math.max(1.0, Math.abs(this.y), Math.abs(other.y))
            && Math.abs(this.z - other.z) <= epsilon * Math.max(1.0, Math.abs(this.z), Math.abs(other.z))
            && Math.abs(this.w - other.w) <= epsilon * Math.max(1.0, Math.abs(this.w), Math.abs(other.w)));
    }
    /**
     * @en Check whether the vector approximately equals another one.
     * @zh 判断当前向量是否在误差范围内与指定分量的向量相等。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    equals4f(x, y, z, w, epsilon = EPSILON) {
        return (Math.abs(this.x - x) <= epsilon * Math.max(1.0, Math.abs(this.x), Math.abs(x))
            && Math.abs(this.y - y) <= epsilon * Math.max(1.0, Math.abs(this.y), Math.abs(y))
            && Math.abs(this.z - z) <= epsilon * Math.max(1.0, Math.abs(this.z), Math.abs(z))
            && Math.abs(this.w - w) <= epsilon * Math.max(1.0, Math.abs(this.w), Math.abs(w)));
    }
    /**
     * @en Check whether the current vector strictly equals another Vec4.
     * @zh 判断当前向量是否与指定向量相等。
     * @param other specified vector
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    strictEquals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
    }
    /**
     * @en Check whether the current vector strictly equals another Vec4.
     * @zh 判断当前向量是否与指定分量的向量相等。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     * @returns Returns `true` when the components of both vectors are equal within the specified range of error; otherwise it returns `false`.
     */
    strictEquals4f(x, y, z, w) {
        return this.x === x && this.y === y && this.z === z && this.w === w;
    }
    /**
     * @en Calculate linear interpolation result between this vector and another one with given ratio.
     * @zh 根据指定的插值比率，从当前向量到目标向量之间做插值。
     * @param to Target vector
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    lerp(to, ratio) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        this.x = x + ratio * (to.x - x);
        this.y = y + ratio * (to.y - y);
        this.z = z + ratio * (to.z - z);
        this.w = w + ratio * (to.w - w);
        return this;
    }
    /**
     * @en Return the information of the vector in string
     * @zh 返回当前向量的字符串表示。
     * @returns The string with vector information
     */
    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}, ${this.w.toFixed(2)})`;
    }
    /**
     * @en Clamp the vector between minInclusive and maxInclusive.
     * @zh 设置当前向量的值，使其各个分量都处于指定的范围内。
     * @param minInclusive Minimum value allowed
     * @param maxInclusive Maximum value allowed
     * @returns `this`
     */
    clampf(minInclusive, maxInclusive) {
        this.x = clamp(this.x, minInclusive.x, maxInclusive.x);
        this.y = clamp(this.y, minInclusive.y, maxInclusive.y);
        this.z = clamp(this.z, minInclusive.z, maxInclusive.z);
        this.w = clamp(this.w, minInclusive.w, maxInclusive.w);
        return this;
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        this.w += other.w;
        return this;
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定分量的向量相加
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    add4f(x, y, z, w) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.w += w;
        return this;
    }
    /**
     * @en Subtracts one vector from this, and returns this.
     * @zh 向量减法。将当前向量减去指定向量
     * @param other specified vector
     */
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        this.w -= other.w;
        return this;
    }
    /**
     * @en Subtracts one vector from this, and returns this.
     * @zh 向量减法。将当前向量减去指定分量的向量
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    subtract4f(x, y, z, w) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        this.w -= w;
        return this;
    }
    /**
     * @en Multiplies the current vector with a number, and returns this.
     * @zh 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    multiplyScalar(scalar) {
        if (typeof scalar === 'object') {
            console.warn('should use Vec4.multiply for vector * vector operation');
        }
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
        return this;
    }
    /**
     * @en Multiplies the current vector with another one and return this
     * @zh 向量乘法。将当前向量乘以指定向量
     * @param other specified vector
     */
    multiply(other) {
        if (typeof other !== 'object') {
            console.warn('should use Vec4.scale for vector * scalar operation');
        }
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        this.w *= other.w;
        return this;
    }
    /**
     * @en Multiplies the current vector with another one and return this
     * @zh 向量乘法。将当前向量与指定分量的向量相乘的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    multiply4f(x, y, z, w) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        this.w *= w;
        return this;
    }
    /**
     * @en Element-wisely divides this vector with another one, and return this.
     * @zh 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param other specified vector
     */
    divide(other) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
        this.w /= other.w;
        return this;
    }
    /**
     * @en Element-wisely divides this vector with another one, and return this.
     * @zh 向量逐元素相除。将当前向量与指定分量的向量相除的结果赋值给当前向量。
     * @param x The x value of specified vector
     * @param y The y value of specified vector
     * @param z The z value of specified vector
     * @param w The w value of specified vector
     */
    divide4f(x, y, z, w) {
        this.x /= x;
        this.y /= y;
        this.z /= z;
        this.w /= w;
        return this;
    }
    /**
     * @en Sets each component of this vector with its negative value
     * @zh 将当前向量的各个分量取反
     */
    negative() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        this.w = -this.w;
        return this;
    }
    /**
     * @en Calculates the dot product with another vector
     * @zh 向量点乘。
     * @param other specified vector
     * @returns 当前向量与指定向量点乘的结果。
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z + this.w * vector.w;
    }
    /**
     * @en Calculates the cross product with another vector.
     * @zh 向量叉乘。视当前向量和指定向量为三维向量（舍弃 w 分量），将当前向量左叉乘指定向量
     * @param other specified vector
     *
     * @deprecated since v3.8 cross product only defined in 3D space, use [[Vec3.cross]] instead.
     */
    cross(vector) {
        const { x: ax, y: ay, z: az } = this;
        const { x: bx, y: by, z: bz } = vector;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }
    /**
     * @en Returns the length of this vector.
     * @zh 计算向量的长度（模）。
     * @returns Length of vector
     */
    length() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    /**
     * @en Returns the squared length of this vector.
     * @zh 计算向量长度（模）的平方。
     * @returns the squared length of this vector
     */
    lengthSqr() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return x * x + y * y + z * z + w * w;
    }
    /**
     * @en Normalize the current vector.
     * @zh 将当前向量归一化
     */
    normalize() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
            this.w = w * len;
        }
        return this;
    }
    /**
     * @en Scales the current vector by a scalar number.
     * @zh 向量数乘。
     */
    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
        return this;
    }
    /**
     * @en Transforms the vec4 with a mat4
     * @zh 应用四维矩阵变换到当前矩阵
     * @param matrix matrix to transform with
     */
    transformMat4(matrix) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        this.x = matrix.m00 * x + matrix.m04 * y + matrix.m08 * z + matrix.m12 * w;
        this.y = matrix.m01 * x + matrix.m05 * y + matrix.m09 * z + matrix.m13 * w;
        this.z = matrix.m02 * x + matrix.m06 * y + matrix.m10 * z + matrix.m14 * w;
        this.w = matrix.m03 * x + matrix.m07 * y + matrix.m11 * z + matrix.m15 * w;
        return this;
    }
}
Vec4.ZERO = Object.freeze(new Vec4(0, 0, 0, 0));
Vec4.ONE = Object.freeze(new Vec4(1, 1, 1, 1));
Vec4.NEG_ONE = Object.freeze(new Vec4(-1, -1, -1, -1));
Vec4.UNIT_X = Object.freeze(new Vec4(1, 0, 0, 0));
Vec4.UNIT_Y = Object.freeze(new Vec4(0, 1, 0, 0));
Vec4.UNIT_Z = Object.freeze(new Vec4(0, 0, 1, 0));
Vec4.UNIT_W = Object.freeze(new Vec4(0, 0, 0, 1));
function v4(x, y, z, w) {
    return new Vec4(x, y, z, w);
}

/*
 Copyright (c) 2018-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en Mathematical 3x3 matrix.
 * @zh 表示三维（3x3）矩阵。
 */
class Mat3 {
    /**
     * @en Clone a matrix and save the results to out matrix
     * @zh 获得指定矩阵的拷贝
     */
    static clone(a) {
        return new Mat3(a.m00, a.m01, a.m02, a.m03, a.m04, a.m05, a.m06, a.m07, a.m08);
    }
    /**
     * @en Copy content of a matrix into another and save the results to out matrix
     * @zh 复制目标矩阵
     */
    static copy(out, a) {
        out.m00 = a.m00;
        out.m01 = a.m01;
        out.m02 = a.m02;
        out.m03 = a.m03;
        out.m04 = a.m04;
        out.m05 = a.m05;
        out.m06 = a.m06;
        out.m07 = a.m07;
        out.m08 = a.m08;
        return out;
    }
    /**
     * @en Sets the elements of a matrix with the given values and save the results to out matrix
     * @zh 设置矩阵值
     */
    static set(out, m00, m01, m02, m03, m04, m05, m06, m07, m08) {
        out.m00 = m00;
        out.m01 = m01;
        out.m02 = m02;
        out.m03 = m03;
        out.m04 = m04;
        out.m05 = m05;
        out.m06 = m06;
        out.m07 = m07;
        out.m08 = m08;
        return out;
    }
    /**
     * @en Reset the out matrix to an identity matrix
     * @zh 将目标赋值为单位矩阵
     */
    static identity(out) {
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 1;
        out.m05 = 0;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 1;
        return out;
    }
    /**
     * @en Transposes a matrix and save the results to out matrix
     * @zh 转置矩阵
     */
    static transpose(out, a) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            const a01 = a.m01;
            const a02 = a.m02;
            const a12 = a.m05;
            out.m01 = a.m03;
            out.m02 = a.m06;
            out.m03 = a01;
            out.m05 = a.m07;
            out.m06 = a02;
            out.m07 = a12;
        }
        else {
            out.m00 = a.m00;
            out.m01 = a.m03;
            out.m02 = a.m06;
            out.m03 = a.m01;
            out.m04 = a.m04;
            out.m05 = a.m07;
            out.m06 = a.m02;
            out.m07 = a.m05;
            out.m08 = a.m08;
        }
        return out;
    }
    /**
     * @en Inverts a matrix. When matrix is not invertible the matrix will be set to zeros.
     * @zh 矩阵求逆，注意，在矩阵不可逆时，会返回一个全为 0 的矩阵。
     */
    static invert(out, a) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a10 = a.m03;
        const a11 = a.m04;
        const a12 = a.m05;
        const a20 = a.m06;
        const a21 = a.m07;
        const a22 = a.m08;
        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;
        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;
        if (det === 0) {
            out.m00 = 0;
            out.m01 = 0;
            out.m02 = 0;
            out.m03 = 0;
            out.m04 = 0;
            out.m05 = 0;
            out.m06 = 0;
            out.m07 = 0;
            out.m08 = 0;
            return out;
        }
        det = 1.0 / det;
        out.m00 = b01 * det;
        out.m01 = (-a22 * a01 + a02 * a21) * det;
        out.m02 = (a12 * a01 - a02 * a11) * det;
        out.m03 = b11 * det;
        out.m04 = (a22 * a00 - a02 * a20) * det;
        out.m05 = (-a12 * a00 + a02 * a10) * det;
        out.m06 = b21 * det;
        out.m07 = (-a21 * a00 + a01 * a20) * det;
        out.m08 = (a11 * a00 - a01 * a10) * det;
        return out;
    }
    /**
     * @en Calculates the determinant of a matrix
     * @zh 矩阵行列式
     */
    static determinant(a) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a10 = a.m03;
        const a11 = a.m04;
        const a12 = a.m05;
        const a20 = a.m06;
        const a21 = a.m07;
        const a22 = a.m08;
        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }
    /**
     * @en Multiply two matrices explicitly and save the results to out matrix: a * b
     * @zh 矩阵乘法：a * b
     */
    static multiply(out, a, b) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a10 = a.m03;
        const a11 = a.m04;
        const a12 = a.m05;
        const a20 = a.m06;
        const a21 = a.m07;
        const a22 = a.m08;
        const b00 = b.m00;
        const b01 = b.m01;
        const b02 = b.m02;
        const b10 = b.m03;
        const b11 = b.m04;
        const b12 = b.m05;
        const b20 = b.m06;
        const b21 = b.m07;
        const b22 = b.m08;
        out.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        out.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        out.m02 = b00 * a02 + b01 * a12 + b02 * a22;
        out.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        out.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        out.m05 = b10 * a02 + b11 * a12 + b12 * a22;
        out.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        out.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        out.m08 = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
    /**
     * @en Take the first third order of the fourth order matrix and multiply by the third order matrix: a * b
     * @zh 取四阶矩阵的前三阶，与三阶矩阵相乘：a * b
     */
    static multiplyMat4(out, a, b) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a10 = a.m03;
        const a11 = a.m04;
        const a12 = a.m05;
        const a20 = a.m06;
        const a21 = a.m07;
        const a22 = a.m08;
        const b00 = b.m00;
        const b01 = b.m01;
        const b02 = b.m02;
        const b10 = b.m04;
        const b11 = b.m05;
        const b12 = b.m06;
        const b20 = b.m08;
        const b21 = b.m09;
        const b22 = b.m10;
        out.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        out.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        out.m02 = b00 * a02 + b01 * a12 + b02 * a22;
        out.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        out.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        out.m05 = b10 * a02 + b11 * a12 + b12 * a22;
        out.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        out.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        out.m08 = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
    /**
     * @en Multiply a matrix with a translation vector given by a translation offset, first translate, then transform：a * T(v).
     * @zh 在给定矩阵变换基础上加入位移变换，先位移，再变换，即a * T(v)。
     */
    /**
     * @deprecated since v3.8.0, the function name is misleading, please use translate instead.
     */
    static transform(out, a, v) {
        this.translate(out, a, v);
    }
    /**
     * @en Multiply a matrix with a translation vector given by a translation offset, first translate, then transform：a * T(v).
     * @zh 在给定矩阵变换基础上加入位移变换，先位移，再变换，即a * T(v)。
     */
    static translate(out, a, v) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a10 = a.m03;
        const a11 = a.m04;
        const a12 = a.m05;
        const a20 = a.m06;
        const a21 = a.m07;
        const a22 = a.m08;
        const x = v.x;
        const y = v.y;
        out.m00 = a00;
        out.m01 = a01;
        out.m02 = a02;
        out.m03 = a10;
        out.m04 = a11;
        out.m05 = a12;
        out.m06 = x * a00 + y * a10 + a20;
        out.m07 = x * a01 + y * a11 + a21;
        out.m08 = x * a02 + y * a12 + a22;
        return out;
    }
    /**
     * @en Multiply a matrix with a scale matrix given by a scale vector and save the results to out matrix, first scale, then transform：a * S(v).
     * @zh 在给定矩阵变换基础上加入新缩放变换，先缩放，再变换，即a * S(v)。
     */
    static scale(out, a, v) {
        const x = v.x;
        const y = v.y;
        out.m00 = x * a.m00;
        out.m01 = x * a.m01;
        out.m02 = x * a.m02;
        out.m03 = y * a.m03;
        out.m04 = y * a.m04;
        out.m05 = y * a.m05;
        out.m06 = a.m06;
        out.m07 = a.m07;
        out.m08 = a.m08;
        return out;
    }
    /**
     * @en Rotates the transform by the given angle and save the results into the out matrix, first rotate, then transform：a * R(rad).
     * @zh 在给定矩阵变换基础上加入新旋转变换，先旋转，再变换，即a * R(rad)。
     * @param rad radian of rotation
     */
    static rotate(out, a, rad) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a10 = a.m03;
        const a11 = a.m04;
        const a12 = a.m05;
        const a20 = a.m06;
        const a21 = a.m07;
        const a22 = a.m08;
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        out.m00 = c * a00 + s * a10;
        out.m01 = c * a01 + s * a11;
        out.m02 = c * a02 + s * a12;
        out.m03 = c * a10 - s * a00;
        out.m04 = c * a11 - s * a01;
        out.m05 = c * a12 - s * a02;
        out.m06 = a20;
        out.m07 = a21;
        out.m08 = a22;
        return out;
    }
    /**
     * @en Copies the first third order matrix of a fourth order matrix to the out third order matrix
     * @zh 取四阶矩阵的前三阶
     */
    static fromMat4(out, a) {
        out.m00 = a.m00;
        out.m01 = a.m01;
        out.m02 = a.m02;
        out.m03 = a.m04;
        out.m04 = a.m05;
        out.m05 = a.m06;
        out.m06 = a.m08;
        out.m07 = a.m09;
        out.m08 = a.m10;
        return out;
    }
    /**
     * @en Sets a third order matrix with view direction and up direction. Then save the results to out matrix
     * @zh 根据视口前方向和上方向计算矩阵
     * @param view The view direction, it`s must be normalized.
     * @param up The view up direction, it`s must be normalized, default value is (0, 1, 0).
     */
    static fromViewUp(out, view, up) {
        if (Vec3.lengthSqr(view) < EPSILON * EPSILON) {
            Mat3.identity(out);
            return out;
        }
        up = up || Vec3.UNIT_Y;
        Vec3.normalize(v3_1$2, Vec3.cross(v3_1$2, up, view));
        if (Vec3.lengthSqr(v3_1$2) < EPSILON * EPSILON) {
            Mat3.identity(out);
            return out;
        }
        Vec3.cross(v3_2, view, v3_1$2);
        Mat3.set(out, v3_1$2.x, v3_1$2.y, v3_1$2.z, v3_2.x, v3_2.y, v3_2.z, view.x, view.y, view.z);
        return out;
    }
    /**
     * @en Sets the given matrix with a translation vector and save the results to out matrix
     * @zh 计算位移矩阵
     */
    static fromTranslation(out, v) {
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 1;
        out.m05 = 0;
        out.m06 = v.x;
        out.m07 = v.y;
        out.m08 = 1;
        return out;
    }
    /**
     * @en Sets the given matrix with a scale vector and save the results to out matrix
     * @zh 计算缩放矩阵
     */
    static fromScaling(out, v) {
        out.m00 = v.x;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = v.y;
        out.m05 = 0;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 1;
        return out;
    }
    /**
     * @en Sets the given matrix with a given angle and save the results to out matrix
     * @zh 计算旋转矩阵
     */
    static fromRotation(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        out.m00 = c;
        out.m01 = s;
        out.m02 = 0;
        out.m03 = -s;
        out.m04 = c;
        out.m05 = 0;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 1;
        return out;
    }
    /**
     * @en Sets the given matrix with the given quaternion and save the results to out matrix
     * @zh 根据四元数旋转信息计算矩阵
     */
    static fromQuat(out, q) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        out.m00 = 1 - yy - zz;
        out.m03 = yx - wz;
        out.m06 = zx + wy;
        out.m01 = yx + wz;
        out.m04 = 1 - xx - zz;
        out.m07 = zy - wx;
        out.m02 = zx - wy;
        out.m05 = zy + wx;
        out.m08 = 1 - xx - yy;
        return out;
    }
    /**
     * @deprecated since v3.8.0, this function is too complicated, and should be split into several functions.
     */
    /**
     * @en Calculates the upper-left 3x3 matrix of a 4x4 matrix's inverse transpose
     * @zh 计算指定四维矩阵的逆转置三维矩阵
     */
    static inverseTransposeMat4(out, a) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        const a30 = a.m12;
        const a31 = a.m13;
        const a32 = a.m14;
        const a33 = a.m15;
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out.m03 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out.m04 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out.m05 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out.m06 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out.m07 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out.m08 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    }
    /**
     * @en Transform a matrix object to a flat array
     * @zh 矩阵转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, m, ofs = 0) {
        out[ofs + 0] = m.m00;
        out[ofs + 1] = m.m01;
        out[ofs + 2] = m.m02;
        out[ofs + 3] = m.m03;
        out[ofs + 4] = m.m04;
        out[ofs + 5] = m.m05;
        out[ofs + 6] = m.m06;
        out[ofs + 7] = m.m07;
        out[ofs + 8] = m.m08;
        return out;
    }
    /**
     * @en Generates or sets a matrix with a flat array
     * @zh 数组转矩阵
     * @param ofs Array Start Offset
     */
    static fromArray(out, arr, ofs = 0) {
        out.m00 = arr[ofs + 0];
        out.m01 = arr[ofs + 1];
        out.m02 = arr[ofs + 2];
        out.m03 = arr[ofs + 3];
        out.m04 = arr[ofs + 4];
        out.m05 = arr[ofs + 5];
        out.m06 = arr[ofs + 6];
        out.m07 = arr[ofs + 7];
        out.m08 = arr[ofs + 8];
        return out;
    }
    /**
     * @en Adds two matrices and save the results to out matrix
     * @zh 逐元素矩阵加法
     */
    static add(out, a, b) {
        out.m00 = a.m00 + b.m00;
        out.m01 = a.m01 + b.m01;
        out.m02 = a.m02 + b.m02;
        out.m03 = a.m03 + b.m03;
        out.m04 = a.m04 + b.m04;
        out.m05 = a.m05 + b.m05;
        out.m06 = a.m06 + b.m06;
        out.m07 = a.m07 + b.m07;
        out.m08 = a.m08 + b.m08;
        return out;
    }
    /**
     * @en Subtracts matrix b from matrix a and save the results to out matrix
     * @zh 逐元素矩阵减法
     */
    static subtract(out, a, b) {
        out.m00 = a.m00 - b.m00;
        out.m01 = a.m01 - b.m01;
        out.m02 = a.m02 - b.m02;
        out.m03 = a.m03 - b.m03;
        out.m04 = a.m04 - b.m04;
        out.m05 = a.m05 - b.m05;
        out.m06 = a.m06 - b.m06;
        out.m07 = a.m07 - b.m07;
        out.m08 = a.m08 - b.m08;
        return out;
    }
    /**
     * @en Multiply each element of a matrix by a scalar number and save the results to out matrix
     * @zh 矩阵标量乘法
     */
    static multiplyScalar(out, a, b) {
        out.m00 = a.m00 * b;
        out.m01 = a.m01 * b;
        out.m02 = a.m02 * b;
        out.m03 = a.m03 * b;
        out.m04 = a.m04 * b;
        out.m05 = a.m05 * b;
        out.m06 = a.m06 * b;
        out.m07 = a.m07 * b;
        out.m08 = a.m08 * b;
        return out;
    }
    /**
     * @en Adds two matrices after multiplying each element of the second operand by a scalar number. And save the results to out matrix.
     * @zh 逐元素矩阵标量乘加: A + B * scale
     */
    static multiplyScalarAndAdd(out, a, b, scale) {
        out.m00 = b.m00 * scale + a.m00;
        out.m01 = b.m01 * scale + a.m01;
        out.m02 = b.m02 * scale + a.m02;
        out.m03 = b.m03 * scale + a.m03;
        out.m04 = b.m04 * scale + a.m04;
        out.m05 = b.m05 * scale + a.m05;
        out.m06 = b.m06 * scale + a.m06;
        out.m07 = b.m07 * scale + a.m07;
        out.m08 = b.m08 * scale + a.m08;
        return out;
    }
    /**
     * @en Returns whether the specified matrices are equal.
     * @zh 矩阵等价判断
     */
    static strictEquals(a, b) {
        return a.m00 === b.m00 && a.m01 === b.m01 && a.m02 === b.m02
            && a.m03 === b.m03 && a.m04 === b.m04 && a.m05 === b.m05
            && a.m06 === b.m06 && a.m07 === b.m07 && a.m08 === b.m08;
    }
    /**
     * @en Returns whether the specified matrices are approximately equal.
     * @zh 排除浮点数误差的矩阵近似等价判断
     */
    static equals(a, b, epsilon = EPSILON) {
        return (Math.abs(a.m00 - b.m00) <= epsilon * Math.max(1.0, Math.abs(a.m00), Math.abs(b.m00))
            && Math.abs(a.m01 - b.m01) <= epsilon * Math.max(1.0, Math.abs(a.m01), Math.abs(b.m01))
            && Math.abs(a.m02 - b.m02) <= epsilon * Math.max(1.0, Math.abs(a.m02), Math.abs(b.m02))
            && Math.abs(a.m03 - b.m03) <= epsilon * Math.max(1.0, Math.abs(a.m03), Math.abs(b.m03))
            && Math.abs(a.m04 - b.m04) <= epsilon * Math.max(1.0, Math.abs(a.m04), Math.abs(b.m04))
            && Math.abs(a.m05 - b.m05) <= epsilon * Math.max(1.0, Math.abs(a.m05), Math.abs(b.m05))
            && Math.abs(a.m06 - b.m06) <= epsilon * Math.max(1.0, Math.abs(a.m06), Math.abs(b.m06))
            && Math.abs(a.m07 - b.m07) <= epsilon * Math.max(1.0, Math.abs(a.m07), Math.abs(b.m07))
            && Math.abs(a.m08 - b.m08) <= epsilon * Math.max(1.0, Math.abs(a.m08), Math.abs(b.m08)));
    }
    /**
     * @en Convert Matrix to euler angle, resulting angle y, z in the range of [-PI, PI],
     *  x in the range of [-PI/2, PI/2], the rotation order is YXZ, first rotate around Y, then around X, and finally around Z.
     * @zh 将矩阵转换成欧拉角, 返回角度 y,z 在 [-PI, PI] 区间内, x 在 [-PI/2, PI/2] 区间内，旋转顺序为 YXZ，即先绕Y旋转，再绕X，最后绕Z旋转。
     */
    static toEuler(matrix, v) {
        //a[col][row]
        const a00 = matrix.m00;
        const a01 = matrix.m01;
        matrix.m02;
        const a10 = matrix.m03;
        const a11 = matrix.m04;
        matrix.m05;
        const a20 = matrix.m06;
        const a21 = matrix.m07;
        const a22 = matrix.m08;
        // from http://www.geometrictools.com/Documentation/EulerAngles.pdf
        // YXZ order
        if (a21 < 0.999) {
            if (a21 > -0.999) {
                v.x = Math.asin(-a21);
                v.y = Math.atan2(a20, a22);
                v.z = Math.atan2(a01, a11);
                return true;
            }
            else {
                // Not unique.  YA - ZA = atan2(r01,r00)
                v.x = HALF_PI;
                v.y = Math.atan2(a10, a00);
                v.z = 0.0;
                return false;
            }
        }
        else {
            // Not unique.  YA + ZA = atan2(-r01,r00)
            v.x = -HALF_PI;
            v.y = Math.atan2(-a10, a00);
            v.z = 0.0;
            return false;
        }
    }
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 1, m05 = 0, m06 = 0, m07 = 0, m08 = 1) {
        if (typeof m00 === 'object') {
            this.m00 = m00.m00;
            this.m01 = m00.m01;
            this.m02 = m00.m02;
            this.m03 = m00.m03;
            this.m04 = m00.m04;
            this.m05 = m00.m05;
            this.m06 = m00.m06;
            this.m07 = m00.m07;
            this.m08 = m00.m08;
        }
        else {
            this.m00 = m00;
            this.m01 = m01;
            this.m02 = m02;
            this.m03 = m03;
            this.m04 = m04;
            this.m05 = m05;
            this.m06 = m06;
            this.m07 = m07;
            this.m08 = m08;
        }
    }
    /**
     * @en Clone a new matrix from the current matrix.
     * @zh 克隆当前矩阵。
     */
    clone() {
        const t = this;
        return new Mat3(t.m00, t.m01, t.m02, t.m03, t.m04, t.m05, t.m06, t.m07, t.m08);
    }
    set(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 1, m05 = 0, m06 = 0, m07 = 0, m08 = 1) {
        if (typeof m00 === 'object') {
            this.m00 = m00.m00;
            this.m01 = m00.m01;
            this.m02 = m00.m02;
            this.m03 = m00.m03;
            this.m04 = m00.m04;
            this.m05 = m00.m05;
            this.m06 = m00.m06;
            this.m07 = m00.m07;
            this.m08 = m00.m08;
        }
        else {
            this.m00 = m00;
            this.m01 = m01;
            this.m02 = m02;
            this.m03 = m03;
            this.m04 = m04;
            this.m05 = m05;
            this.m06 = m06;
            this.m07 = m07;
            this.m08 = m08;
        }
        return this;
    }
    /**
     * @en Returns whether the specified matrices are approximately equal.
     * @zh 判断当前矩阵是否在误差范围内与指定矩阵相等。
     * @param other Comparative matrix
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @return Returns `true' when the elements of both matrices are equal; otherwise returns `false'.
     */
    equals(other, epsilon = EPSILON) {
        return (Math.abs(this.m00 - other.m00) <= epsilon * Math.max(1.0, Math.abs(this.m00), Math.abs(other.m00))
            && Math.abs(this.m01 - other.m01) <= epsilon * Math.max(1.0, Math.abs(this.m01), Math.abs(other.m01))
            && Math.abs(this.m02 - other.m02) <= epsilon * Math.max(1.0, Math.abs(this.m02), Math.abs(other.m02))
            && Math.abs(this.m03 - other.m03) <= epsilon * Math.max(1.0, Math.abs(this.m03), Math.abs(other.m03))
            && Math.abs(this.m04 - other.m04) <= epsilon * Math.max(1.0, Math.abs(this.m04), Math.abs(other.m04))
            && Math.abs(this.m05 - other.m05) <= epsilon * Math.max(1.0, Math.abs(this.m05), Math.abs(other.m05))
            && Math.abs(this.m06 - other.m06) <= epsilon * Math.max(1.0, Math.abs(this.m06), Math.abs(other.m06))
            && Math.abs(this.m07 - other.m07) <= epsilon * Math.max(1.0, Math.abs(this.m07), Math.abs(other.m07))
            && Math.abs(this.m08 - other.m08) <= epsilon * Math.max(1.0, Math.abs(this.m08), Math.abs(other.m08)));
    }
    /**
     * @en Returns whether the specified matrices are equal.
     * @zh 判断当前矩阵是否与指定矩阵相等。
     * @param other Comparative matrix
     * @return Returns `true' when the elements of both matrices are equal; otherwise returns `false'.
     */
    strictEquals(other) {
        return this.m00 === other.m00 && this.m01 === other.m01 && this.m02 === other.m02
            && this.m03 === other.m03 && this.m04 === other.m04 && this.m05 === other.m05
            && this.m06 === other.m06 && this.m07 === other.m07 && this.m08 === other.m08;
    }
    /**
     * @en Returns a string representation of a matrix.
     * @zh 返回当前矩阵的字符串表示。
     * @return The string representation of this matrix
     */
    toString() {
        const t = this;
        return `[\n${t.m00}, ${t.m01}, ${t.m02},\n${t.m03},\n${t.m04}, ${t.m05},\n${t.m06}, ${t.m07},\n${t.m08}\n`
            + `]`;
    }
    /**
     * @en set the current matrix to an identity matrix.
     * @zh 将当前矩阵设为单位矩阵。
     * @return `this`
     */
    identity() {
        this.m00 = 1;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 1;
        this.m05 = 0;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 1;
        return this;
    }
    /**
     * @en Transposes the current matrix.
     * @zh 计算当前矩阵的转置矩阵。
     */
    transpose() {
        const a01 = this.m01;
        const a02 = this.m02;
        const a12 = this.m05;
        this.m01 = this.m03;
        this.m02 = this.m06;
        this.m03 = a01;
        this.m05 = this.m07;
        this.m06 = a02;
        this.m07 = a12;
        return this;
    }
    /**
     * @en Inverts the current matrix. When matrix is not invertible the matrix will be set to zeros.
     * @zh 计算当前矩阵的逆矩阵。注意，在矩阵不可逆时，会返回一个全为 0 的矩阵。
     */
    invert() {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a10 = this.m03;
        const a11 = this.m04;
        const a12 = this.m05;
        const a20 = this.m06;
        const a21 = this.m07;
        const a22 = this.m08;
        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;
        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;
        if (det === 0) {
            this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
            return this;
        }
        det = 1.0 / det;
        this.m00 = b01 * det;
        this.m01 = (-a22 * a01 + a02 * a21) * det;
        this.m02 = (a12 * a01 - a02 * a11) * det;
        this.m03 = b11 * det;
        this.m04 = (a22 * a00 - a02 * a20) * det;
        this.m05 = (-a12 * a00 + a02 * a10) * det;
        this.m06 = b21 * det;
        this.m07 = (-a21 * a00 + a01 * a20) * det;
        this.m08 = (a11 * a00 - a01 * a10) * det;
        return this;
    }
    /**
     * @en Calculates the determinant of the current matrix.
     * @zh 计算当前矩阵的行列式。
     * @return 当前矩阵的行列式。
     */
    determinant() {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a10 = this.m03;
        const a11 = this.m04;
        const a12 = this.m05;
        const a20 = this.m06;
        const a21 = this.m07;
        const a22 = this.m08;
        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }
    /**
     * @en Adds the current matrix and another matrix to the current matrix.
     * @zh 矩阵加法。将当前矩阵与指定矩阵的相加，结果返回给当前矩阵。
     * @param mat the second operand
     */
    add(mat) {
        this.m00 += mat.m00;
        this.m01 += mat.m01;
        this.m02 += mat.m02;
        this.m03 += mat.m03;
        this.m04 += mat.m04;
        this.m05 += mat.m05;
        this.m06 += mat.m06;
        this.m07 += mat.m07;
        this.m08 += mat.m08;
        return this;
    }
    /**
     * @en Subtracts another matrix from the current matrix.
     * @zh 计算矩阵减法。将当前矩阵减去指定矩阵的结果赋值给当前矩阵。
     * @param mat the second operand
     */
    subtract(mat) {
        this.m00 -= mat.m00;
        this.m01 -= mat.m01;
        this.m02 -= mat.m02;
        this.m03 -= mat.m03;
        this.m04 -= mat.m04;
        this.m05 -= mat.m05;
        this.m06 -= mat.m06;
        this.m07 -= mat.m07;
        this.m08 -= mat.m08;
        return this;
    }
    /**
     * @en Multiply the current matrix with another matrix.
     * @zh 矩阵乘法。将当前矩阵左乘指定矩阵的结果赋值给当前矩阵。
     * @param mat the second operand
     */
    multiply(mat) {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a10 = this.m03;
        const a11 = this.m04;
        const a12 = this.m05;
        const a20 = this.m06;
        const a21 = this.m07;
        const a22 = this.m08;
        const b00 = mat.m00;
        const b01 = mat.m01;
        const b02 = mat.m02;
        const b10 = mat.m03;
        const b11 = mat.m04;
        const b12 = mat.m05;
        const b20 = mat.m06;
        const b21 = mat.m07;
        const b22 = mat.m08;
        this.m00 = b00 * a00 + b01 * a10 + b02 * a20;
        this.m01 = b00 * a01 + b01 * a11 + b02 * a21;
        this.m02 = b00 * a02 + b01 * a12 + b02 * a22;
        this.m03 = b10 * a00 + b11 * a10 + b12 * a20;
        this.m04 = b10 * a01 + b11 * a11 + b12 * a21;
        this.m05 = b10 * a02 + b11 * a12 + b12 * a22;
        this.m06 = b20 * a00 + b21 * a10 + b22 * a20;
        this.m07 = b20 * a01 + b21 * a11 + b22 * a21;
        this.m08 = b20 * a02 + b21 * a12 + b22 * a22;
        return this;
    }
    /**
     * @en Multiply each element of the current matrix by a scalar number.
     * @zh 矩阵数乘。将当前矩阵与指定标量的数乘结果赋值给当前矩阵。
     * @param scalar amount to scale the matrix's elements by
     */
    multiplyScalar(scalar) {
        this.m00 *= scalar;
        this.m01 *= scalar;
        this.m02 *= scalar;
        this.m03 *= scalar;
        this.m04 *= scalar;
        this.m05 *= scalar;
        this.m06 *= scalar;
        this.m07 *= scalar;
        this.m08 *= scalar;
        return this;
    }
    /**
     * @en Multiply the current matrix with a scale matrix given by a scale vector, that is M * S(vec).
     * @zh 将当前矩阵左乘缩放矩阵的结果赋值给当前矩阵，缩放矩阵由各个轴的缩放给出，即M * S(vec)。
     * @param vec vector to scale by
     */
    scale(vec) {
        const x = vec.x;
        const y = vec.y;
        this.m00 = x * this.m00;
        this.m01 = x * this.m01;
        this.m02 = x * this.m02;
        this.m03 = y * this.m03;
        this.m04 = y * this.m04;
        this.m05 = y * this.m05;
        this.m06 = this.m06;
        this.m07 = this.m07;
        this.m08 = this.m08;
        return this;
    }
    /**
     * @en Rotates the current matrix by the given angle, that is M * R(rad).
     * @zh 将当前矩阵左乘旋转矩阵的结果赋值给当前矩阵，旋转矩阵由旋转轴和旋转角度给出，即M * R(rad)。
     * @param rad radian of rotation
     */
    rotate(rad) {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a10 = this.m03;
        const a11 = this.m04;
        const a12 = this.m05;
        const a20 = this.m06;
        const a21 = this.m07;
        const a22 = this.m08;
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        this.m00 = c * a00 + s * a10;
        this.m01 = c * a01 + s * a11;
        this.m02 = c * a02 + s * a12;
        this.m03 = c * a10 - s * a00;
        this.m04 = c * a11 - s * a01;
        this.m05 = c * a12 - s * a02;
        this.m06 = a20;
        this.m07 = a21;
        this.m08 = a22;
        return this;
    }
    /**
     * @en Resets the current matrix from the given quaternion.
     * @zh 重置当前矩阵的值，使其表示指定四元数表示的旋转变换。
     * @param q The quaternion.
     * @returns this
     */
    fromQuat(q) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        this.m00 = 1 - yy - zz;
        this.m03 = yx - wz;
        this.m06 = zx + wy;
        this.m01 = yx + wz;
        this.m04 = 1 - xx - zz;
        this.m07 = zy - wx;
        this.m02 = zx - wy;
        this.m05 = zy + wx;
        this.m08 = 1 - xx - yy;
        return this;
    }
}
Mat3.IDENTITY = Object.freeze(new Mat3());
const v3_1$2 = new Vec3();
const v3_2 = new Vec3();

/*
 Copyright (c) 2018-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en quaternion
 * @zh 四元数
 */
class Quat {
    /**
     * @en Obtain a copy of the given quaternion
     * @zh 获得指定四元数的拷贝
     */
    static clone(a) {
        return new Quat(a.x, a.y, a.z, a.w);
    }
    /**
     * @en Copy the given quaternion to the out quaternion
     * @zh 复制目标四元数
     */
    static copy(out, a) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        out.w = a.w;
        return out;
    }
    /**
     * @en Sets the out quaternion with values of each component
     * @zh 设置四元数值
     */
    static set(out, x, y, z, w) {
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
        return out;
    }
    /**
     * @en Sets the out quaternion to an identity quaternion
     * @zh 将目标赋值为单位四元数
     */
    static identity(out) {
        out.x = 0;
        out.y = 0;
        out.z = 0;
        out.w = 1;
        return out;
    }
    /**
     * @en Sets the out quaternion with the shortest path orientation between two vectors, considering both vectors normalized
     * @zh 设置四元数为两向量间的最短路径旋转，默认两向量都已归一化
     */
    static rotationTo(out, a, b) {
        const dot = Vec3.dot(a, b);
        if (dot < -0.999999) {
            Vec3.cross(v3_1$1, Vec3.UNIT_X, a);
            if (v3_1$1.length() < 0.000001) {
                Vec3.cross(v3_1$1, Vec3.UNIT_Y, a);
            }
            Vec3.normalize(v3_1$1, v3_1$1);
            Quat.fromAxisAngle(out, v3_1$1, Math.PI);
            return out;
        }
        else if (dot > 0.999999) {
            out.x = 0;
            out.y = 0;
            out.z = 0;
            out.w = 1;
            return out;
        }
        else {
            Vec3.cross(v3_1$1, a, b);
            out.x = v3_1$1.x;
            out.y = v3_1$1.y;
            out.z = v3_1$1.z;
            out.w = 1 + dot;
            return Quat.normalize(out, out);
        }
    }
    /**
     * @en Gets the rotation axis and the arc of rotation from the quaternion
     * @zh 获取四元数的旋转轴和旋转弧度
     * @param outAxis output axis
     * @param q input quaternion
     * @return radian of rotation
     */
    static getAxisAngle(outAxis, q) {
        const rad = Math.acos(q.w) * 2.0;
        const s = Math.sin(rad / 2.0);
        if (s !== 0.0) {
            outAxis.x = q.x / s;
            outAxis.y = q.y / s;
            outAxis.z = q.z / s;
        }
        else {
            // If s is zero, return any axis (no rotation - axis does not matter)
            outAxis.x = 1;
            outAxis.y = 0;
            outAxis.z = 0;
        }
        return rad;
    }
    /**
     * @en Quaternion multiplication and save the results to out quaternion, that is a * b.
     * @zh 四元数乘法，即a * b。
     */
    static multiply(out, a, b) {
        const x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
        const y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
        const z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
        const w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
        return out;
    }
    /**
     * @en Quaternion scalar multiplication and save the results to out quaternion
     * @zh 四元数标量乘法
     */
    static multiplyScalar(out, a, b) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
        return out;
    }
    /**
     * @en Quaternion multiplication and addition: A + B * scale
     * @zh 四元数乘加：A + B * scale
     */
    static scaleAndAdd(out, a, b, scale) {
        out.x = a.x + b.x * scale;
        out.y = a.y + b.y * scale;
        out.z = a.z + b.z * scale;
        out.w = a.w + b.w * scale;
        return out;
    }
    /**
     * @en Sets the out quaternion to represent a radian rotation around x axis
     * @zh 绕 X 轴旋转指定四元数
     * @param rad radian of rotation
     */
    static rotateX(out, a, rad) {
        rad *= 0.5;
        const bx = Math.sin(rad);
        const bw = Math.cos(rad);
        const { x, y, z, w } = a;
        out.x = x * bw + w * bx;
        out.y = y * bw + z * bx;
        out.z = z * bw - y * bx;
        out.w = w * bw - x * bx;
        return out;
    }
    /**
     * @en Sets the out quaternion to represent a radian rotation around y axis
     * @zh 绕 Y 轴旋转指定四元数
     * @param rad radian of rotation
     */
    static rotateY(out, a, rad) {
        rad *= 0.5;
        const by = Math.sin(rad);
        const bw = Math.cos(rad);
        const { x, y, z, w } = a;
        out.x = x * bw - z * by;
        out.y = y * bw + w * by;
        out.z = z * bw + x * by;
        out.w = w * bw - y * by;
        return out;
    }
    /**
     * @en Sets the out quaternion to represent a radian rotation around z axis
     * @zh 绕 Z 轴旋转指定四元数
     * @param rad radian of rotation
     */
    static rotateZ(out, a, rad) {
        rad *= 0.5;
        const bz = Math.sin(rad);
        const bw = Math.cos(rad);
        const { x, y, z, w } = a;
        out.x = x * bw + y * bz;
        out.y = y * bw - x * bz;
        out.z = z * bw + w * bz;
        out.w = w * bw - z * bz;
        return out;
    }
    /**
     * @en Sets the out quaternion to represent a radian rotation around a given rotation axis in world space
     * @zh 绕世界空间下指定轴旋转四元数
     * @param axis axis of rotation, normalized by default
     * @param rad radian of rotation
     */
    static rotateAround(out, rot, axis, rad) {
        // get inv-axis (local to rot)
        Quat.invert(qt_1, rot);
        Vec3.transformQuat(v3_1$1, axis, qt_1);
        // rotate by inv-axis
        Quat.fromAxisAngle(qt_1, v3_1$1, rad);
        Quat.multiply(out, rot, qt_1);
        return out;
    }
    /**
     * @en Sets the out quaternion to represent a radian rotation around a given rotation axis in local space
     * @zh 绕本地空间下指定轴旋转四元数
     * @param axis axis of rotation
     * @param rad radian of rotation
     */
    static rotateAroundLocal(out, rot, axis, rad) {
        Quat.fromAxisAngle(qt_1, axis, rad);
        Quat.multiply(out, rot, qt_1);
        return out;
    }
    /**
     * @en Calculates the w component with xyz components, considering the given quaternion normalized
     * @zh 根据 xyz 分量计算 w 分量，默认已归一化
     */
    static calculateW(out, a) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        out.w = Math.sqrt(Math.abs(1.0 - a.x * a.x - a.y * a.y - a.z * a.z));
        return out;
    }
    /**
     * @en Quaternion dot product (scalar product)
     * @zh 四元数点积（数量积）
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    }
    /**
     * @en Element by element linear interpolation: A + t * (B - A)
     * @zh 逐元素线性插值： A + t * (B - A)
     */
    static lerp(out, a, b, t) {
        out.x = a.x + t * (b.x - a.x);
        out.y = a.y + t * (b.y - a.y);
        out.z = a.z + t * (b.z - a.z);
        out.w = a.w + t * (b.w - a.w);
        return out;
    }
    /**
     * @en Spherical quaternion interpolation
     * @zh 四元数球面插值
     */
    static slerp(out, a, b, t) {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations
        let scale0 = 0;
        let scale1 = 0;
        let bx = b.x;
        let by = b.y;
        let bz = b.z;
        let bw = b.w;
        // calc cosine
        let cosom = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if ((1.0 - cosom) > 0.000001) {
            // standard case (slerp)
            const omega = Math.acos(cosom);
            const sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        }
        else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        out.x = scale0 * a.x + scale1 * bx;
        out.y = scale0 * a.y + scale1 * by;
        out.z = scale0 * a.z + scale1 * bz;
        out.w = scale0 * a.w + scale1 * bw;
        return out;
    }
    /**
     * @en Spherical quaternion interpolation with two control points
     * @zh 带两个控制点的四元数球面插值
     * @param out the receiving quaternion
     * @param a the first operand
     * @param b the second operand
     * @param c the third operand
     * @param d the fourth operand
     * @param t interpolation amount, in the range [0-1], between the two inputs
     * @returns out
     */
    static sqlerp(out, a, b, c, d, t) {
        Quat.slerp(qt_1, a, d, t);
        Quat.slerp(qt_2, b, c, t);
        Quat.slerp(out, qt_1, qt_2, 2 * t * (1 - t));
        return out;
    }
    /**
     * @en Sets the inverse of the given quaternion to out quaternion
     * @zh 四元数求逆
     */
    static invert(out, a) {
        const dot = a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
        const invDot = dot ? 1.0 / dot : 0;
        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        out.x = -a.x * invDot;
        out.y = -a.y * invDot;
        out.z = -a.z * invDot;
        out.w = a.w * invDot;
        return out;
    }
    /**
     * @en Conjugating a quaternion, it's equivalent to the inverse of the unit quaternion, but more efficient
     * @zh 求共轭四元数，对单位四元数与求逆等价，但更高效
     */
    static conjugate(out, a) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;
        out.w = a.w;
        return out;
    }
    /**
     * @en Calculates the length of the quaternion
     * @zh 求四元数长度
     */
    static len(a) {
        return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w);
    }
    /**
     * @en Calculates the squared length of the quaternion
     * @zh 求四元数长度平方
     */
    static lengthSqr(a) {
        return a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
    }
    /**
     * @en Normalize the given quaternion, returns a zero quaternion if input is a zero quaternion.
     * @zh 归一化四元数，输入零四元数将会返回零四元数。
     */
    static normalize(out, a) {
        let len = a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = a.x * len;
            out.y = a.y * len;
            out.z = a.z * len;
            out.w = a.w * len;
        }
        else {
            out.x = 0;
            out.y = 0;
            out.z = 0;
            out.w = 0;
        }
        return out;
    }
    /**
     * @en Calculated the quaternion represents the given coordinates, considering all given vectors are normalized and mutually perpendicular
     * @zh 根据本地坐标轴朝向计算四元数，默认三向量都已归一化且相互垂直
     */
    static fromAxes(out, xAxis, yAxis, zAxis) {
        Mat3.set(m3_1$1, xAxis.x, xAxis.y, xAxis.z, yAxis.x, yAxis.y, yAxis.z, zAxis.x, zAxis.y, zAxis.z);
        return Quat.normalize(out, Quat.fromMat3(out, m3_1$1));
    }
    /**
     * @en Calculates the quaternion with the up direction and the direction of the viewport
     * @zh 根据视口的前方向和上方向计算四元数
     * @param view The view direction, it`s must be normalized.
     * @param up The view up direction, it`s must be normalized, default value is (0, 1, 0).
     */
    static fromViewUp(out, view, up) {
        Mat3.fromViewUp(m3_1$1, view, up);
        return Quat.normalize(out, Quat.fromMat3(out, m3_1$1));
    }
    /**
     * @en Calculates the quaternion from a given rotary shaft and a radian rotation around it.
     * @zh 根据旋转轴和旋转弧度计算四元数
     */
    static fromAxisAngle(out, axis, rad) {
        rad *= 0.5;
        const s = Math.sin(rad);
        out.x = s * axis.x;
        out.y = s * axis.y;
        out.z = s * axis.z;
        out.w = Math.cos(rad);
        return out;
    }
    /**
     * @en Calculates the quaternion with the three-dimensional transform matrix, considering no scale included in the matrix
     * @zh 根据三维矩阵信息计算四元数，默认输入矩阵不含有缩放信息
     */
    static fromMat3(out, m) {
        const { m00, m01, m02, //colum 0
        m03: m10, m04: m11, m05: m12, //colum 1
        m06: m20, m07: m21, m08: m22, //colum 2
         } = m;
        const fourXSquaredMinus1 = m00 - m11 - m22;
        const fourYSquaredMinus1 = m11 - m00 - m22;
        const fourZSquaredMinus1 = m22 - m00 - m11;
        const fourWSquaredMinus1 = m00 + m11 + m22;
        let biggestIndex = 0;
        let fourBiggestSquaredMinus1 = fourWSquaredMinus1;
        if (fourXSquaredMinus1 > fourBiggestSquaredMinus1) {
            fourBiggestSquaredMinus1 = fourXSquaredMinus1;
            biggestIndex = 1;
        }
        if (fourYSquaredMinus1 > fourBiggestSquaredMinus1) {
            fourBiggestSquaredMinus1 = fourYSquaredMinus1;
            biggestIndex = 2;
        }
        if (fourZSquaredMinus1 > fourBiggestSquaredMinus1) {
            fourBiggestSquaredMinus1 = fourZSquaredMinus1;
            biggestIndex = 3;
        }
        const biggestVal = Math.sqrt(fourBiggestSquaredMinus1 + 1) * 0.5;
        const mult = 0.25 / biggestVal;
        switch (biggestIndex) {
            case 0:
                out.w = biggestVal;
                out.x = (m12 - m21) * mult;
                out.y = (m20 - m02) * mult;
                out.z = (m01 - m10) * mult;
                break;
            case 1:
                out.w = (m12 - m21) * mult;
                out.x = biggestVal;
                out.y = (m01 + m10) * mult;
                out.z = (m20 + m02) * mult;
                break;
            case 2:
                out.w = (m20 - m02) * mult;
                out.x = (m01 + m10) * mult;
                out.y = biggestVal;
                out.z = (m12 + m21) * mult;
                break;
            case 3:
                out.w = (m01 - m10) * mult;
                out.x = (m20 + m02) * mult;
                out.y = (m12 + m21) * mult;
                out.z = biggestVal;
                break;
            default:
                out.w = 1;
                out.x = 0;
                out.y = 0;
                out.z = 0;
                break;
        }
        return out;
    }
    /**
     * @en Calculates the quaternion with Euler angles, the rotation order is YZX, first rotate around Y, then around Z, and finally around X.
     * @zh 根据欧拉角信息计算四元数，旋转顺序为 YZX，即先绕Y旋转，再绕Z，最后绕X旋转。
     */
    static fromEuler(out, x, y, z) {
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;
        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);
        out.x = sx * cy * cz + cx * sy * sz;
        out.y = cx * sy * cz + sx * cy * sz;
        out.z = cx * cy * sz - sx * sy * cz;
        out.w = cx * cy * cz - sx * sy * sz;
        return out;
    }
    /**
     * @en Calculates the quaternion with given 2D angle (0, 0, z).
     * @zh 根据 2D 角度（0, 0, z）计算四元数
     *
     * @param out Output quaternion
     * @param z Angle to rotate around Z axis in degrees.
     */
    static fromAngleZ(out, z) {
        z *= halfToRad;
        out.x = out.y = 0;
        out.z = Math.sin(z);
        out.w = Math.cos(z);
        return out;
    }
    /**
     * @en This returns the X-axis vector of the quaternion
     * @zh 返回定义此四元数的坐标系 X 轴向量
     */
    static toAxisX(out, q) {
        const fy = 2.0 * q.y;
        const fz = 2.0 * q.z;
        out.x = 1.0 - fy * q.y - fz * q.z;
        out.y = fy * q.x + fz * q.w;
        out.z = fz * q.x - fy * q.w;
        return out;
    }
    /**
     * @en This returns the Y-axis vector of the quaternion
     * @zh 返回定义此四元数的坐标系 Y 轴向量
     */
    static toAxisY(out, q) {
        const fx = 2.0 * q.x;
        const fy = 2.0 * q.y;
        const fz = 2.0 * q.z;
        out.x = fy * q.x - fz * q.w;
        out.y = 1.0 - fx * q.x - fz * q.z;
        out.z = fz * q.y + fx * q.w;
        return out;
    }
    /**
     * @en This returns the Z-axis vector of the quaternion
     * @zh 返回定义此四元数的坐标系 Z 轴向量
     */
    static toAxisZ(out, q) {
        const fx = 2.0 * q.x;
        const fy = 2.0 * q.y;
        const fz = 2.0 * q.z;
        out.x = fz * q.x + fy * q.w;
        out.y = fz * q.y - fx * q.w;
        out.z = 1.0 - fx * q.x - fy * q.y;
        return out;
    }
    /**
     * @en Converts the quaternion to angles, result angle x, y in the range of [-180, 180], z in the range of [-90, 90] interval,
     * the rotation order is YZX, first rotate around Y, then around Z, and finally around X
     * @zh 根据四元数计算欧拉角，返回角度 x, y 在 [-180, 180] 区间内, z 默认在 [-90, 90] 区间内，旋转顺序为 YZX，即先绕Y旋转，再绕Z，最后绕X旋转。
     * @param outerZ change z value range to [-180, -90] U [90, 180]
     */
    static toEuler(out, q, outerZ) {
        const { x, y, z, w } = q;
        let bank = 0;
        let heading = 0;
        let attitude = 0;
        const test = x * y + z * w;
        if (test > 0.499999) {
            bank = 0; // default to zero
            heading = toDegree(2 * Math.atan2(x, w));
            attitude = 90;
        }
        else if (test < -0.499999) {
            bank = 0; // default to zero
            heading = -toDegree(2 * Math.atan2(x, w));
            attitude = -90;
        }
        else {
            const sqx = x * x;
            const sqy = y * y;
            const sqz = z * z;
            bank = toDegree(Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz));
            heading = toDegree(Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz));
            attitude = toDegree(Math.asin(2 * test));
            if (outerZ) {
                bank = -180 * Math.sign(bank + 1e-6) + bank;
                heading = -180 * Math.sign(heading + 1e-6) + heading;
                attitude = 180 * Math.sign(attitude + 1e-6) - attitude;
            }
        }
        out.x = bank;
        out.y = heading;
        out.z = attitude;
        return out;
    }
    /**
     * @en Converts the quaternion to euler angles, result angle y, z in the range of [-180, 180], x in the range of [-90, 90],
     * the rotation order is YXZ, first rotate around Y, then around X, and finally around Z.
     * @zh 根据四元数计算欧拉角，返回角度 yz 在 [-180, 180], x 在 [-90, 90]，旋转顺序为 YXZ，即先绕Y旋转，再绕X，最后绕Z旋转。
     */
    static toEulerInYXZOrder(out, q) {
        Mat3.fromQuat(m3_1$1, q);
        Mat3.toEuler(m3_1$1, out);
        out.x = toDegree(out.x);
        out.y = toDegree(out.y);
        out.z = toDegree(out.z);
    }
    /**
     * @en Converts quaternion to an array
     * @zh 四元数转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, q, ofs = 0) {
        out[ofs + 0] = q.x;
        out[ofs + 1] = q.y;
        out[ofs + 2] = q.z;
        out[ofs + 3] = q.w;
        return out;
    }
    /**
     * @en Array to a quaternion
     * @zh 数组转四元数
     * @param ofs Array Start Offset
     */
    static fromArray(out, arr, ofs = 0) {
        out.x = arr[ofs + 0];
        out.y = arr[ofs + 1];
        out.z = arr[ofs + 2];
        out.w = arr[ofs + 3];
        return out;
    }
    /**
     * @en Check whether two quaternions are equal
     * @zh 四元数等价判断
     */
    static strictEquals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
    }
    /**
     * @en Check whether two quaternions are approximately equal
     * @zh 排除浮点数误差的四元数近似等价判断
     */
    static equals(a, b, epsilon = EPSILON) {
        return (Math.abs(a.x - b.x) <= epsilon * Math.max(1.0, Math.abs(a.x), Math.abs(b.x))
            && Math.abs(a.y - b.y) <= epsilon * Math.max(1.0, Math.abs(a.y), Math.abs(b.y))
            && Math.abs(a.z - b.z) <= epsilon * Math.max(1.0, Math.abs(a.z), Math.abs(b.z))
            && Math.abs(a.w - b.w) <= epsilon * Math.max(1.0, Math.abs(a.w), Math.abs(b.w)));
    }
    /**
     * @en Gets the angular distance between two unit quaternions
     * @zh 获取两个单位四元数的夹角
     * @param a The first unit quaternion
     * @param b The second unit quaternion
     * @returns Angle between the two quaternions in radians
     */
    static angle(a, b) {
        const dot = Math.min(Math.abs(Quat.dot(a, b)), 1.0);
        return Math.acos(dot) * 2.0;
    }
    /**
     * @en Rotate a `from` unit quaternion towards `to` unit quaternion
     * @zh 将一个起始单位四元数旋转到一个目标单位四元数
     * @param from The first unit quaternion
     * @param to The second unit quaternion
     * @param maxStep The maximum angle of rotation in degrees
     * @returns new unit quaternion generated during rotation
     */
    static rotateTowards(out, from, to, maxStep) {
        const angle = Quat.angle(from, to);
        if (angle === 0) {
            out.x = to.x;
            out.y = to.y;
            out.z = to.z;
            out.w = to.w;
            return out;
        }
        const t = Math.min(maxStep / toDegree(angle), 1.0);
        return Quat.slerp(out, from, to, t);
    }
    constructor(x, y, z, w) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w ?? 1;
        }
    }
    /**
     * @en clone the current Quat
     * @zh 克隆当前四元数。
     */
    clone() {
        return new Quat(this.x, this.y, this.z, this.w);
    }
    set(x, y, z, w) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w ?? 1;
        }
        return this;
    }
    /**
     * @en Check whether the quaternion approximately equals another one
     * @zh 判断当前四元数是否在误差范围内与指定向量相等。
     * @param other Comparative quaternion
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @returns Returns `true' when the components of the two quaternions are equal within the specified error range; otherwise, returns `false'.
     */
    equals(other, epsilon = EPSILON) {
        return (Math.abs(this.x - other.x) <= epsilon * Math.max(1.0, Math.abs(this.x), Math.abs(other.x))
            && Math.abs(this.y - other.y) <= epsilon * Math.max(1.0, Math.abs(this.y), Math.abs(other.y))
            && Math.abs(this.z - other.z) <= epsilon * Math.max(1.0, Math.abs(this.z), Math.abs(other.z))
            && Math.abs(this.w - other.w) <= epsilon * Math.max(1.0, Math.abs(this.w), Math.abs(other.w)));
    }
    /**
     * @en Check whether the current quaternion strictly equals other quaternion
     * @zh 判断当前四元数是否与指定四元数相等。
     * @param other Comparative quaternion
     * @returns Returns `true' when the components of the two quaternions are equal within the specified error range; otherwise, returns `false'.
     */
    strictEquals(other) {
        return other && this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
    }
    /**
     * @en Convert quaternion to Euler angles
     * @zh 将当前四元数转化为欧拉角（x-y-z）并赋值给输出向量。
     * @param out the output vector
     */
    getEulerAngles(out) {
        return Quat.toEuler(out, this);
    }
    /**
     * @en Calculate the linear interpolation result between this quaternion and another one with given ratio
     * @zh 根据指定的插值比率，从当前四元数到目标四元数之间做线性插值。
     * @param to The target quaternion
     * @param ratio The interpolation coefficient. The range is [0,1].
     */
    lerp(to, ratio) {
        this.x += ratio * (to.x - this.x);
        this.y += ratio * (to.y - this.y);
        this.z += ratio * (to.z - this.z);
        this.w += ratio * (to.w - this.w);
        return this;
    }
    /**
     * @en Calculates the spherical interpolation result between this quaternion and another one with the given ratio
     * @zh 根据指定的插值比率，从当前四元数到目标四元数之间做球面插值。
     * @param to The target quaternion
     * @param ratio The interpolation coefficient. The range is [0,1].
     */
    slerp(to, ratio) {
        return Quat.slerp(this, this, to, ratio);
    }
    /**
     * @en Calculates the length of the quaternion
     * @zh 求四元数长度
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    /**
     * @en Calculates the squared length of the quaternion
     * @zh 求四元数长度平方
     */
    lengthSqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
}
Quat.IDENTITY = Object.freeze(new Quat());
const qt_1 = new Quat();
const qt_2 = new Quat();
const v3_1$1 = new Vec3();
const m3_1$1 = new Mat3();
const halfToRad = 0.5 * Math.PI / 180.0;
function quat(x = 0, y = 0, z = 0, w = 1) {
    return new Quat(x, y, z, w);
}

/*
 Copyright (c) 2018-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @engineInternal
 */
const preTransforms = Object.freeze([
    Object.freeze([1, 0, 0, 1]),
    Object.freeze([0, 1, -1, 0]),
    Object.freeze([-1, 0, 0, -1]),
    Object.freeze([0, -1, 1, 0]), // SurfaceTransform.ROTATE_270
]);
/**
 * @en Mathematical 4x4 matrix.
 * @zh 表示四维（4x4）矩阵。
 */
class Mat4 {
    /**
     * @en Clone a matrix and save the results to out matrix
     * @zh 获得指定矩阵的拷贝
     */
    static clone(a) {
        return new Mat4(a.m00, a.m01, a.m02, a.m03, a.m04, a.m05, a.m06, a.m07, a.m08, a.m09, a.m10, a.m11, a.m12, a.m13, a.m14, a.m15);
    }
    /**
     * @en Copy a matrix into the out matrix
     * @zh 复制目标矩阵
     */
    static copy(out, a) {
        out.m00 = a.m00;
        out.m01 = a.m01;
        out.m02 = a.m02;
        out.m03 = a.m03;
        out.m04 = a.m04;
        out.m05 = a.m05;
        out.m06 = a.m06;
        out.m07 = a.m07;
        out.m08 = a.m08;
        out.m09 = a.m09;
        out.m10 = a.m10;
        out.m11 = a.m11;
        out.m12 = a.m12;
        out.m13 = a.m13;
        out.m14 = a.m14;
        out.m15 = a.m15;
        return out;
    }
    /**
     * @en Sets a matrix with the given values and save the results to out matrix
     * @zh 设置矩阵值
     *
     * @param out The receive matrix
     * @param m00 Component in column 0, row 0 position (index 0)
     * @param m01 Component in column 0, row 1 position (index 1)
     * @param m02 Component in column 0, row 2 position (index 2)
     * @param m03 Component in column 0, row 3 position (index 3)
     * @param m10 Component in column 1, row 0 position (index 4)
     * @param m11 Component in column 1, row 1 position (index 5)
     * @param m12 Component in column 1, row 2 position (index 6)
     * @param m13 Component in column 1, row 3 position (index 7)
     * @param m20 Component in column 2, row 0 position (index 8)
     * @param m21 Component in column 2, row 1 position (index 9)
     * @param m22 Component in column 2, row 2 position (index 10)
     * @param m23 Component in column 2, row 3 position (index 11)
     * @param m30 Component in column 3, row 0 position (index 12)
     * @param m31 Component in column 3, row 1 position (index 13)
     * @param m32 Component in column 3, row 2 position (index 14)
     * @param m33 Component in column 3, row 3 position (index 15)
     * @returns The receive matrix
     */
    static set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        out.m00 = m00;
        out.m01 = m01;
        out.m02 = m02;
        out.m03 = m03;
        out.m04 = m10;
        out.m05 = m11;
        out.m06 = m12;
        out.m07 = m13;
        out.m08 = m20;
        out.m09 = m21;
        out.m10 = m22;
        out.m11 = m23;
        out.m12 = m30;
        out.m13 = m31;
        out.m14 = m32;
        out.m15 = m33;
        return out;
    }
    /**
     * @en return an identity matrix.
     * @zh 将目标赋值为单位矩阵
     */
    static identity(out) {
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 0;
        out.m05 = 1;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = 0;
        out.m10 = 1;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Transposes a matrix and save the results to out matrix
     * @zh 转置矩阵
     */
    static transpose(out, a) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            const a01 = a.m01;
            const a02 = a.m02;
            const a03 = a.m03;
            const a12 = a.m06;
            const a13 = a.m07;
            const a23 = a.m11;
            out.m01 = a.m04;
            out.m02 = a.m08;
            out.m03 = a.m12;
            out.m04 = a01;
            out.m06 = a.m09;
            out.m07 = a.m13;
            out.m08 = a02;
            out.m09 = a12;
            out.m11 = a.m14;
            out.m12 = a03;
            out.m13 = a13;
            out.m14 = a23;
        }
        else {
            out.m00 = a.m00;
            out.m01 = a.m04;
            out.m02 = a.m08;
            out.m03 = a.m12;
            out.m04 = a.m01;
            out.m05 = a.m05;
            out.m06 = a.m09;
            out.m07 = a.m13;
            out.m08 = a.m02;
            out.m09 = a.m06;
            out.m10 = a.m10;
            out.m11 = a.m14;
            out.m12 = a.m03;
            out.m13 = a.m07;
            out.m14 = a.m11;
            out.m15 = a.m15;
        }
        return out;
    }
    /**
     * @en Inverts a matrix. When matrix is not invertible the matrix will be set to zeros.
     * @zh 矩阵求逆，注意，在矩阵不可逆时，会返回一个全为 0 的矩阵。
     */
    static invert(out, a) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        const a30 = a.m12;
        const a31 = a.m13;
        const a32 = a.m14;
        const a33 = a.m15;
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det === 0) {
            out.m00 = 0;
            out.m01 = 0;
            out.m02 = 0;
            out.m03 = 0;
            out.m04 = 0;
            out.m05 = 0;
            out.m06 = 0;
            out.m07 = 0;
            out.m08 = 0;
            out.m09 = 0;
            out.m10 = 0;
            out.m11 = 0;
            out.m12 = 0;
            out.m13 = 0;
            out.m14 = 0;
            out.m15 = 0;
            return out;
        }
        det = 1.0 / det;
        // calculate factors
        out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out.m01 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out.m02 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out.m03 = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out.m04 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out.m06 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out.m07 = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out.m08 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out.m09 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out.m11 = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out.m12 = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out.m13 = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out.m14 = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out.m15 = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }
    /**
     * @en Calculates the determinant of a matrix
     * @zh 矩阵行列式
     */
    static determinant(a) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        const a30 = a.m12;
        const a31 = a.m13;
        const a32 = a.m14;
        const a33 = a.m15;
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }
    /**
     * @en Multiply two matrices and save the results to out matrix, (out = a * b)
     * @zh 矩阵乘法 (out = a * b)
     *
     * @param out The out matrix
     * @param a The first operand
     * @param b The second operand
     * @returns out matrix
     */
    static multiply(out, a, b) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        const a30 = a.m12;
        const a31 = a.m13;
        const a32 = a.m14;
        const a33 = a.m15;
        // Cache only the current line of the second matrix
        let b0 = b.m00;
        let b1 = b.m01;
        let b2 = b.m02;
        let b3 = b.m03;
        out.m00 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.m01 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.m02 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.m03 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b.m04;
        b1 = b.m05;
        b2 = b.m06;
        b3 = b.m07;
        out.m04 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.m05 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.m06 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.m07 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b.m08;
        b1 = b.m09;
        b2 = b.m10;
        b3 = b.m11;
        out.m08 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.m09 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.m10 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.m11 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = b.m12;
        b1 = b.m13;
        b2 = b.m14;
        b3 = b.m15;
        out.m12 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.m13 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.m14 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.m15 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
    }
    /**
     * @en Translate a matrix with the given vector and save results to the out matrix, the translate is applied before the matrix, i.e. (out = a * T)
     * @zh 在给定矩阵变换基础上加入平移变换，并将结果保存到 out 矩阵中，平移变换将应用在矩阵变换之前，即 (out = a * T)
     *
     * @param out The out matrix
     * @param a The matrix to translate
     * @param v The vector to translate with
     */
    static transform(out, a, v) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        if (a === out) {
            out.m12 = a.m00 * x + a.m04 * y + a.m08 * z + a.m12;
            out.m13 = a.m01 * x + a.m05 * y + a.m09 * z + a.m13;
            out.m14 = a.m02 * x + a.m06 * y + a.m10 * z + a.m14;
            out.m15 = a.m03 * x + a.m07 * y + a.m11 * z + a.m15;
        }
        else {
            const a00 = a.m00;
            const a01 = a.m01;
            const a02 = a.m02;
            const a03 = a.m03;
            const a10 = a.m04;
            const a11 = a.m05;
            const a12 = a.m06;
            const a13 = a.m07;
            const a20 = a.m08;
            const a21 = a.m09;
            const a22 = a.m10;
            const a23 = a.m11;
            out.m00 = a00;
            out.m01 = a01;
            out.m02 = a02;
            out.m03 = a03;
            out.m04 = a10;
            out.m05 = a11;
            out.m06 = a12;
            out.m07 = a13;
            out.m08 = a20;
            out.m09 = a21;
            out.m10 = a22;
            out.m11 = a23;
            out.m12 = a00 * x + a10 * y + a20 * z + a.m12;
            out.m13 = a01 * x + a11 * y + a21 * z + a.m13;
            out.m14 = a02 * x + a12 * y + a22 * z + a.m14;
            out.m15 = a03 * x + a13 * y + a23 * z + a.m15;
        }
        return out;
    }
    /**
     * @en Transform a matrix with the given translation vector and save results to the out matrix,
     * the translate is applied after the transformation, i.e. (out = T * a)
     * @zh 在给定矩阵变换基础上加入新位移变换，平移变换在变换之后应用，即 (out = T * a)
     *
     * @param out The out matrix
     * @param a The matrix to translate
     * @param v The vector to translate with
     * @deprecated Since 3.8.0, please use [[transform]] instead
     */
    static translate(out, a, v) {
        if (a === out) {
            out.m12 += v.x;
            out.m13 += v.y;
            out.m14 += v.z;
        }
        else {
            out.m00 = a.m00;
            out.m01 = a.m01;
            out.m02 = a.m02;
            out.m03 = a.m03;
            out.m04 = a.m04;
            out.m05 = a.m05;
            out.m06 = a.m06;
            out.m07 = a.m07;
            out.m08 = a.m08;
            out.m09 = a.m09;
            out.m10 = a.m10;
            out.m11 = a.m11;
            out.m12 = a.m12 + v.x;
            out.m13 = a.m13 + v.y;
            out.m14 = a.m14 + v.z;
            out.m15 = a.m15;
        }
        return out;
    }
    /**
     * @en Multiply a matrix with a scale matrix given by a scale vector and save the results into the out matrix,
     * the scale is applied before the matrix, i.e. (out = a * S)
     * @zh 在给定矩阵变换基础上加入新缩放变换，并将结果保存到 out 矩阵中，缩放变换将应用在矩阵变换之前，即 (out = a * S)
     */
    static scale(out, a, v) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        out.m00 = a.m00 * x;
        out.m01 = a.m01 * x;
        out.m02 = a.m02 * x;
        out.m03 = a.m03 * x;
        out.m04 = a.m04 * y;
        out.m05 = a.m05 * y;
        out.m06 = a.m06 * y;
        out.m07 = a.m07 * y;
        out.m08 = a.m08 * z;
        out.m09 = a.m09 * z;
        out.m10 = a.m10 * z;
        out.m11 = a.m11 * z;
        out.m12 = a.m12;
        out.m13 = a.m13;
        out.m14 = a.m14;
        out.m15 = a.m15;
        return out;
    }
    /**
     * @en Rotates the transform by the given angle and save the results into the out matrix, the rotate is applied before
     * the matrix, i.e. (out = a * R)
     * @zh 在给定矩阵变换基础上加入新旋转变换, 并将结果保存到 out 矩阵中，旋转变换将应用在矩阵变换之前，即 (out = a * R)
     * @param rad Angle of rotation (in radians)
     * @param axis axis of rotation
     */
    static rotate(out, a, rad, axis) {
        let x = axis.x;
        let y = axis.y;
        let z = axis.z;
        let len = Math.sqrt(x * x + y * y + z * z);
        if (Math.abs(len) < EPSILON) {
            return null;
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        // ref: https://en.wikipedia.org/wiki/Rotation_matrix#Axis_and_angle
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = 1 - c;
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        // Construct the elements of the rotation matrix
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        // Perform rotation-specific matrix multiplication
        out.m00 = a00 * b00 + a10 * b01 + a20 * b02;
        out.m01 = a01 * b00 + a11 * b01 + a21 * b02;
        out.m02 = a02 * b00 + a12 * b01 + a22 * b02;
        out.m03 = a03 * b00 + a13 * b01 + a23 * b02;
        out.m04 = a00 * b10 + a10 * b11 + a20 * b12;
        out.m05 = a01 * b10 + a11 * b11 + a21 * b12;
        out.m06 = a02 * b10 + a12 * b11 + a22 * b12;
        out.m07 = a03 * b10 + a13 * b11 + a23 * b12;
        out.m08 = a00 * b20 + a10 * b21 + a20 * b22;
        out.m09 = a01 * b20 + a11 * b21 + a21 * b22;
        out.m10 = a02 * b20 + a12 * b21 + a22 * b22;
        out.m11 = a03 * b20 + a13 * b21 + a23 * b22;
        // If the source and destination differ, copy the unchanged last row
        if (a !== out) {
            out.m12 = a.m12;
            out.m13 = a.m13;
            out.m14 = a.m14;
            out.m15 = a.m15;
        }
        return out;
    }
    /**
     * @en Transform a matrix with a given angle around X axis and save the results to the out matrix, the rotate is applied
     * before the matrix, i.e. (out = a * R)
     * @zh 在给定矩阵变换基础上加入绕 X 轴的旋转变换, 并将结果保存到 out 矩阵中，旋转变换将应用在矩阵变换之前，即 (out = a * R)
     * @param rad Angle of rotation (in radians)
     */
    static rotateX(out, a, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        if (a !== out) { // If the source and destination differ, copy the unchanged rows
            out.m00 = a.m00;
            out.m01 = a.m01;
            out.m02 = a.m02;
            out.m03 = a.m03;
            out.m12 = a.m12;
            out.m13 = a.m13;
            out.m14 = a.m14;
            out.m15 = a.m15;
        }
        // Perform axis-specific matrix multiplication
        out.m04 = a10 * c + a20 * s;
        out.m05 = a11 * c + a21 * s;
        out.m06 = a12 * c + a22 * s;
        out.m07 = a13 * c + a23 * s;
        out.m08 = a20 * c - a10 * s;
        out.m09 = a21 * c - a11 * s;
        out.m10 = a22 * c - a12 * s;
        out.m11 = a23 * c - a13 * s;
        return out;
    }
    /**
     * @en Transform a matrix with a given angle around Y axis and save the results to the out matrix
     * @zh 在给定矩阵变换基础上加入绕 Y 轴的旋转变换
     * @param rad Angle of rotation (in radians)
     */
    static rotateY(out, a, rad) {
        // ref: https://en.wikipedia.org/wiki/Rotation_matrix#Axis_and_angle
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        if (a !== out) { // If the source and destination differ, copy the unchanged rows
            out.m04 = a.m04;
            out.m05 = a.m05;
            out.m06 = a.m06;
            out.m07 = a.m07;
            out.m12 = a.m12;
            out.m13 = a.m13;
            out.m14 = a.m14;
            out.m15 = a.m15;
        }
        // Perform axis-specific matrix multiplication
        out.m00 = a00 * c - a20 * s;
        out.m01 = a01 * c - a21 * s;
        out.m02 = a02 * c - a22 * s;
        out.m03 = a03 * c - a23 * s;
        out.m08 = a00 * s + a20 * c;
        out.m09 = a01 * s + a21 * c;
        out.m10 = a02 * s + a22 * c;
        out.m11 = a03 * s + a23 * c;
        return out;
    }
    /**
     * @en Transform a matrix with a given angle around Z axis and save the results to the out matrix
     * @zh 在给定矩阵变换基础上加入绕 Z 轴的旋转变换
     * @param rad Angle of rotation (in radians)
     */
    static rotateZ(out, a, rad) {
        // ref: https://en.wikipedia.org/wiki/Rotation_matrix#Axis_and_angle
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        // If the source and destination differ, copy the unchanged last row
        if (a !== out) {
            out.m08 = a.m08;
            out.m09 = a.m09;
            out.m10 = a.m10;
            out.m11 = a.m11;
            out.m12 = a.m12;
            out.m13 = a.m13;
            out.m14 = a.m14;
            out.m15 = a.m15;
        }
        // Perform axis-specific matrix multiplication
        out.m00 = a00 * c + a10 * s;
        out.m01 = a01 * c + a11 * s;
        out.m02 = a02 * c + a12 * s;
        out.m03 = a03 * c + a13 * s;
        out.m04 = a10 * c - a00 * s;
        out.m05 = a11 * c - a01 * s;
        out.m06 = a12 * c - a02 * s;
        out.m07 = a13 * c - a03 * s;
        return out;
    }
    /**
     * @en Sets the out matrix with a translation vector
     * @zh 计算位移矩阵
     */
    static fromTranslation(out, v) {
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 0;
        out.m05 = 1;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = 0;
        out.m10 = 1;
        out.m11 = 0;
        out.m12 = v.x;
        out.m13 = v.y;
        out.m14 = v.z;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Sets the out matrix with a scale vector
     * @zh 计算缩放矩阵
     */
    static fromScaling(out, v) {
        out.m00 = v.x;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 0;
        out.m05 = v.y;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = 0;
        out.m10 = v.z;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Sets the out matrix with rotation angle
     * @zh 计算旋转矩阵
     */
    static fromRotation(out, rad, axis) {
        let x = axis.x;
        let y = axis.y;
        let z = axis.z;
        let len = Math.sqrt(x * x + y * y + z * z);
        if (Math.abs(len) < EPSILON) {
            return null;
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = 1 - c;
        // Perform rotation-specific matrix multiplication
        out.m00 = x * x * t + c;
        out.m01 = y * x * t + z * s;
        out.m02 = z * x * t - y * s;
        out.m03 = 0;
        out.m04 = x * y * t - z * s;
        out.m05 = y * y * t + c;
        out.m06 = z * y * t + x * s;
        out.m07 = 0;
        out.m08 = x * z * t + y * s;
        out.m09 = y * z * t - x * s;
        out.m10 = z * z * t + c;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Calculates the matrix representing a rotation around the X axis
     * @zh 计算绕 X 轴的旋转矩阵
     */
    static fromXRotation(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        // Perform axis-specific matrix multiplication
        out.m00 = 1;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 0;
        out.m05 = c;
        out.m06 = s;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = -s;
        out.m10 = c;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Calculates the matrix representing a rotation around the Y axis
     * @zh 计算绕 Y 轴的旋转矩阵
     */
    static fromYRotation(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        // Perform axis-specific matrix multiplication
        out.m00 = c;
        out.m01 = 0;
        out.m02 = -s;
        out.m03 = 0;
        out.m04 = 0;
        out.m05 = 1;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = s;
        out.m09 = 0;
        out.m10 = c;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Calculates the matrix representing a rotation around the Z axis
     * @zh 计算绕 Z 轴的旋转矩阵
     */
    static fromZRotation(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        // Perform axis-specific matrix multiplication
        out.m00 = c;
        out.m01 = s;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = -s;
        out.m05 = c;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = 0;
        out.m10 = 1;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Calculates the transform representing the combination of a rotation and a translation, and stores the result in out.
     * The order is rotation then translation.
     * @zh 根据旋转和位移信息计算矩阵
     */
    static fromRT(out, q, v) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        // ref: https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Conversion_to_and_from_the_matrix_representation
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        out.m00 = 1 - (yy + zz);
        out.m01 = xy + wz;
        out.m02 = xz - wy;
        out.m03 = 0;
        out.m04 = xy - wz;
        out.m05 = 1 - (xx + zz);
        out.m06 = yz + wx;
        out.m07 = 0;
        out.m08 = xz + wy;
        out.m09 = yz - wx;
        out.m10 = 1 - (xx + yy);
        out.m11 = 0;
        out.m12 = v.x;
        out.m13 = v.y;
        out.m14 = v.z;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Extracts the translation from the matrix, assuming it's composed in order of scale, rotation, translation
     * @zh 提取矩阵的位移信息, 默认矩阵中的变换以 S->R->T 的顺序应用
     */
    static getTranslation(out, mat) {
        out.x = mat.m12;
        out.y = mat.m13;
        out.z = mat.m14;
        return out;
    }
    /**
     * @en Extracts the scale vector from the matrix, assuming it's composed in order of scale, rotation, translation
     * @zh 提取矩阵的缩放信息, 默认矩阵中的变换以 S->R->T 的顺序应用
     */
    static getScaling(out, mat) {
        const m00 = m3_1.m00 = mat.m00;
        const m01 = m3_1.m01 = mat.m01;
        const m02 = m3_1.m02 = mat.m02;
        const m04 = m3_1.m03 = mat.m04;
        const m05 = m3_1.m04 = mat.m05;
        const m06 = m3_1.m05 = mat.m06;
        const m08 = m3_1.m06 = mat.m08;
        const m09 = m3_1.m07 = mat.m09;
        const m10 = m3_1.m08 = mat.m10;
        out.x = Math.sqrt(m00 * m00 + m01 * m01 + m02 * m02);
        out.y = Math.sqrt(m04 * m04 + m05 * m05 + m06 * m06);
        out.z = Math.sqrt(m08 * m08 + m09 * m09 + m10 * m10);
        // account for refections
        if (Mat3.determinant(m3_1) < 0) {
            out.x *= -1;
        }
        return out;
    }
    /**
     * @en Extracts the rotation from the matrix, assuming it's composed in order of scale, rotation, translation
     * @zh 提取矩阵的旋转信息, 默认输入矩阵不含有缩放信息，如考虑缩放应使用 `toRTS` 函数。
     */
    static getRotation(out, mat) {
        const trace = mat.m00 + mat.m05 + mat.m10;
        let S = 0;
        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            out.w = 0.25 * S;
            out.x = (mat.m06 - mat.m09) / S;
            out.y = (mat.m08 - mat.m02) / S;
            out.z = (mat.m01 - mat.m04) / S;
        }
        else if ((mat.m00 > mat.m05) && (mat.m00 > mat.m10)) {
            S = Math.sqrt(1.0 + mat.m00 - mat.m05 - mat.m10) * 2;
            out.w = (mat.m06 - mat.m09) / S;
            out.x = 0.25 * S;
            out.y = (mat.m01 + mat.m04) / S;
            out.z = (mat.m08 + mat.m02) / S;
        }
        else if (mat.m05 > mat.m10) {
            S = Math.sqrt(1.0 + mat.m05 - mat.m00 - mat.m10) * 2;
            out.w = (mat.m08 - mat.m02) / S;
            out.x = (mat.m01 + mat.m04) / S;
            out.y = 0.25 * S;
            out.z = (mat.m06 + mat.m09) / S;
        }
        else {
            S = Math.sqrt(1.0 + mat.m10 - mat.m00 - mat.m05) * 2;
            out.w = (mat.m01 - mat.m04) / S;
            out.x = (mat.m08 + mat.m02) / S;
            out.y = (mat.m06 + mat.m09) / S;
            out.z = 0.25 * S;
        }
        return out;
    }
    /**
     * @en Extracts the scale, rotation and translation from the matrix, assuming it's composed in order of scale, rotation, translation
     * @zh 提取旋转、位移、缩放信息， 默认矩阵中的变换以 S->R->T 的顺序应用
     *
     * @param m The input transform matrix
     * @param q The corresponding rotation quat
     * @param v The corresponding translate vector
     * @param s The corresponding scaling vector
     *
     * @deprecated Since 3.8.0, please use toSRT instead
     */
    static toRTS(m, q, v, s) {
        const sx = Vec3.set(v3_1, m.m00, m.m01, m.m02).length();
        const sy = Vec3.set(v3_1, m.m04, m.m05, m.m06).length();
        const sz = Vec3.set(v3_1, m.m08, m.m09, m.m10).length();
        m3_1.m00 = m.m00 / sx;
        m3_1.m01 = m.m01 / sx;
        m3_1.m02 = m.m02 / sx;
        m3_1.m03 = m.m04 / sy;
        m3_1.m04 = m.m05 / sy;
        m3_1.m05 = m.m06 / sy;
        m3_1.m06 = m.m08 / sz;
        m3_1.m07 = m.m09 / sz;
        m3_1.m08 = m.m10 / sz;
        const det = Mat3.determinant(m3_1);
        if (s) {
            Vec3.set(s, sx, sy, sz);
            if (det < 0) {
                s.x *= -1;
            }
        }
        if (v) {
            Vec3.set(v, m.m12, m.m13, m.m14);
        }
        if (q) {
            if (det < 0) {
                m3_1.m00 *= -1;
                m3_1.m01 *= -1;
                m3_1.m02 *= -1;
            }
            Quat.fromMat3(q, m3_1);
        }
    }
    /**
     * @en Extracts the scale, rotation and translation from the matrix, assuming it's composed in order of scale, rotation, translation
     * @zh 提取旋转、位移、缩放信息， 默认矩阵中的变换以 S->R->T 的顺序应用
     *
     * @param m The input transform matrix
     * @param q The corresponding rotation quat
     * @param v The corresponding translate vector
     * @param s The corresponding scaling vector
     */
    static toSRT(m, q, v, s) {
        const sx = Vec3.set(v3_1, m.m00, m.m01, m.m02).length();
        const sy = Vec3.set(v3_1, m.m04, m.m05, m.m06).length();
        const sz = Vec3.set(v3_1, m.m08, m.m09, m.m10).length();
        if (s) {
            s.x = sx;
            s.y = sy;
            s.z = sz;
        }
        if (v) {
            Vec3.set(v, m.m12, m.m13, m.m14);
        }
        if (q) {
            m3_1.m00 = m.m00 / sx;
            m3_1.m01 = m.m01 / sx;
            m3_1.m02 = m.m02 / sx;
            m3_1.m03 = m.m04 / sy;
            m3_1.m04 = m.m05 / sy;
            m3_1.m05 = m.m06 / sy;
            m3_1.m06 = m.m08 / sz;
            m3_1.m07 = m.m09 / sz;
            m3_1.m08 = m.m10 / sz;
            const det = Mat3.determinant(m3_1);
            if (det < 0) {
                if (s)
                    s.x *= -1;
                m3_1.m00 *= -1;
                m3_1.m01 *= -1;
                m3_1.m02 *= -1;
            }
            Quat.fromMat3(q, m3_1); // already normalized
        }
    }
    /**
     * @en Convert Matrix to euler angle, resulting angle y, z in the range of [-PI, PI],
     *  x in the range of [-PI/2, PI/2], the rotation order is YXZ.
     * @zh 将矩阵转换为欧拉角，结果角度 y, z 在 [-PI, PI] 范围内，x 在 [-PI/2, PI/2] 区间内，旋转顺序为 YXZ.
     */
    static toEuler(m, v) {
        Mat3.set(m3_1, m.m00, m.m01, m.m02, m.m04, m.m05, m.m06, m.m08, m.m09, m.m10);
        return Mat3.toEuler(m3_1, v);
    }
    /**
     * @en Compose a matrix from scale, rotation and translation, applied in order.
     * @zh 根据旋转、位移、缩放信息计算矩阵，以 S->R->T 的顺序应用
     * @deprecated Since 3.8.0, please use [[fromSRT]] instead.
     */
    static fromRTS(out, q, v, s) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s.x;
        const sy = s.y;
        const sz = s.z;
        out.m00 = (1 - (yy + zz)) * sx;
        out.m01 = (xy + wz) * sx;
        out.m02 = (xz - wy) * sx;
        out.m03 = 0;
        out.m04 = (xy - wz) * sy;
        out.m05 = (1 - (xx + zz)) * sy;
        out.m06 = (yz + wx) * sy;
        out.m07 = 0;
        out.m08 = (xz + wy) * sz;
        out.m09 = (yz - wx) * sz;
        out.m10 = (1 - (xx + yy)) * sz;
        out.m11 = 0;
        out.m12 = v.x;
        out.m13 = v.y;
        out.m14 = v.z;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Compose a matrix from scale, rotation and translation, applied in order.
     * @zh 根据旋转、位移、缩放信息计算矩阵，以 S->R->T 的顺序应用
     * @param out The receiving matrix
     * @param q Rotation quaternion
     * @param v Translation vector
     * @param s Scaling vector
     * @returns The receiving matrix
     */
    static fromSRT(out, q, v, s) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s.x;
        const sy = s.y;
        const sz = s.z;
        out.m00 = (1 - (yy + zz)) * sx;
        out.m01 = (xy + wz) * sx;
        out.m02 = (xz - wy) * sx;
        out.m03 = 0;
        out.m04 = (xy - wz) * sy;
        out.m05 = (1 - (xx + zz)) * sy;
        out.m06 = (yz + wx) * sy;
        out.m07 = 0;
        out.m08 = (xz + wy) * sz;
        out.m09 = (yz - wx) * sz;
        out.m10 = (1 - (xx + yy)) * sz;
        out.m11 = 0;
        out.m12 = v.x;
        out.m13 = v.y;
        out.m14 = v.z;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Compose a matrix from scale, rotation and translation, applied in order, from a given origin
     * @zh 根据指定的旋转、位移、缩放及变换中心信息计算矩阵，以 S->R->T 的顺序应用
     * @param q Rotation quaternion
     * @param v Translation vector
     * @param s Scaling vector
     * @param o transformation Center
     * @deprecated Please use [[fromSRTOrigin]] instead.
     */
    static fromRTSOrigin(out, q, v, s, o) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s.x;
        const sy = s.y;
        const sz = s.z;
        const ox = o.x;
        const oy = o.y;
        const oz = o.z;
        out.m00 = (1 - (yy + zz)) * sx;
        out.m01 = (xy + wz) * sx;
        out.m02 = (xz - wy) * sx;
        out.m03 = 0;
        out.m04 = (xy - wz) * sy;
        out.m05 = (1 - (xx + zz)) * sy;
        out.m06 = (yz + wx) * sy;
        out.m07 = 0;
        out.m08 = (xz + wy) * sz;
        out.m09 = (yz - wx) * sz;
        out.m10 = (1 - (xx + yy)) * sz;
        out.m11 = 0;
        out.m12 = v.x + ox - (out.m00 * ox + out.m04 * oy + out.m08 * oz);
        out.m13 = v.y + oy - (out.m01 * ox + out.m05 * oy + out.m09 * oz);
        out.m14 = v.z + oz - (out.m02 * ox + out.m06 * oy + out.m10 * oz);
        out.m15 = 1;
        return out;
    }
    /**
     * @en Compose a matrix from scale, rotation and translation, applied in order, from a given origin
     * @zh 根据指定的旋转、位移、缩放及变换中心信息计算矩阵，以 O^{-1}->S->R->O->T 的顺序应用
     * @param out The receiving matrix
     * @param q Rotation quaternion
     * @param v Translation vector
     * @param s Scaling vector
     * @param o transformation Center
     * @returns The receiving matrix
     */
    static fromSRTOrigin(out, q, v, s, o) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s.x;
        const sy = s.y;
        const sz = s.z;
        const ox = o.x;
        const oy = o.y;
        const oz = o.z;
        out.m00 = (1 - (yy + zz)) * sx;
        out.m01 = (xy + wz) * sx;
        out.m02 = (xz - wy) * sx;
        out.m03 = 0;
        out.m04 = (xy - wz) * sy;
        out.m05 = (1 - (xx + zz)) * sy;
        out.m06 = (yz + wx) * sy;
        out.m07 = 0;
        out.m08 = (xz + wy) * sz;
        out.m09 = (yz - wx) * sz;
        out.m10 = (1 - (xx + yy)) * sz;
        out.m11 = 0;
        out.m12 = v.x + ox - (out.m00 * ox + out.m04 * oy + out.m08 * oz);
        out.m13 = v.y + oy - (out.m01 * ox + out.m05 * oy + out.m09 * oz);
        out.m14 = v.z + oz - (out.m02 * ox + out.m06 * oy + out.m10 * oz);
        out.m15 = 1;
        return out;
    }
    /**
     * @en Sets the out matrix with the given quaternion
     * @zh 根据指定的旋转信息计算矩阵
     */
    static fromQuat(out, q) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        out.m00 = 1 - yy - zz;
        out.m01 = yx + wz;
        out.m02 = zx - wy;
        out.m03 = 0;
        out.m04 = yx - wz;
        out.m05 = 1 - xx - zz;
        out.m06 = zy + wx;
        out.m07 = 0;
        out.m08 = zx + wy;
        out.m09 = zy - wx;
        out.m10 = 1 - xx - yy;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Calculates the matrix representing the given frustum
     * @zh 根据指定的视锥体信息计算矩阵
     * @param out The receiving matrix.
     * @param left The X coordinate of the left side of the near projection plane in view space.
     * @param right The X coordinate of the right side of the near projection plane in view space.
     * @param bottom The Y coordinate of the bottom side of the near projection plane in view space.
     * @param top The Y coordinate of the top side of the near projection plane in view space.
     * @param near Z distance to the near plane from the origin in view space.
     * @param far Z distance to the far plane from the origin in view space.
     *
     * @return The receiving matrix.
     */
    static frustum(out, left, right, bottom, top, near, far) {
        const rl = 1 / (right - left);
        const tb = 1 / (top - bottom);
        const nf = 1 / (near - far);
        out.m00 = (near * 2) * rl;
        out.m01 = 0;
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = 0;
        out.m05 = (near * 2) * tb;
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = (right + left) * rl;
        out.m09 = (top + bottom) * tb;
        out.m10 = (far + near) * nf;
        out.m11 = -1;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = (far * near * 2) * nf;
        out.m15 = 0;
        return out;
    }
    /**
     * @en Calculates perspective projection matrix
     * @zh 计算透视投影矩阵
     * @param out The receiving matrix.
     * @param fovy Vertical field-of-view in degrees.
     * @param aspect Aspect ratio
     * @param near Near depth clipping plane value.
     * @param far Far depth clipping plane value.
     * @param isFOVY Whether the fovy is based on the vertical field-of-view.
     * @param minClipZ The minimum value of the near clipping plane, e.g. -1 for OpenGL, 0 for Vulkan and Metal.
     * @param projectionSignY The sign of the Y axis of the projection matrix, which is used to flip the Y axis.
     * @param orientation The orientation of the projection matrix, which is used to rotate the projection matrix.
     *
     * @return The receiving matrix.
     */
    static perspective(out, fov, aspect, near, far, isFOVY = true, minClipZ = -1, projectionSignY = 1, orientation = 0) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        const x = isFOVY ? f / aspect : f;
        const y = (isFOVY ? f : f * aspect) * projectionSignY;
        const preTransform = preTransforms[orientation];
        out.m00 = x * preTransform[0];
        out.m01 = x * preTransform[1];
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = y * preTransform[2];
        out.m05 = y * preTransform[3];
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = 0;
        out.m10 = (far - minClipZ * near) * nf;
        out.m11 = -1;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = far * near * nf * (1 - minClipZ);
        out.m15 = 0;
        return out;
    }
    /**
     * @en Calculates orthogonal projection matrix
     * @zh 计算正交投影矩阵
     * @param out The receiving matrix.
     * @param left Left-side x-coordinate.
     * @param right Right-side x-coordinate.
     * @param bottom Bottom y-coordinate.
     * @param top Top y-coordinate.
     * @param near Near depth clipping plane value.
     * @param far Far depth clipping plane value.
     * @param minClipZ The minimum value of the near clipping plane, e.g. -1 for OpenGL, 0 for Vulkan and Metal.
     * @param projectionSignY The sign of the Y axis of the projection matrix, which is used to flip the Y axis.
     * @param orientation The orientation of the projection matrix, which is used to rotate the projection matrix.
     *
     * @return The receiving matrix.
     */
    static ortho(out, left, right, bottom, top, near, far, minClipZ = -1, projectionSignY = 1, orientation = 0) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top) * projectionSignY;
        const nf = 1 / (near - far);
        const x = -2 * lr;
        const y = -2 * bt;
        const dx = (left + right) * lr;
        const dy = (top + bottom) * bt;
        const preTransform = preTransforms[orientation];
        out.m00 = x * preTransform[0];
        out.m01 = x * preTransform[1];
        out.m02 = 0;
        out.m03 = 0;
        out.m04 = y * preTransform[2];
        out.m05 = y * preTransform[3];
        out.m06 = 0;
        out.m07 = 0;
        out.m08 = 0;
        out.m09 = 0;
        out.m10 = nf * (1 - minClipZ);
        out.m11 = 0;
        out.m12 = dx * preTransform[0] + dy * preTransform[2];
        out.m13 = dx * preTransform[1] + dy * preTransform[3];
        out.m14 = (near - minClipZ * far) * nf;
        out.m15 = 1;
        return out;
    }
    /**
     * @en
     * Calculates the matrix with the view point information, given by eye position, target center and the up vector.
     * Note that center to eye vector can't be zero or parallel to the up vector
     * @zh
     * 计算视图矩阵，给定眼睛位置、目标中心和上向量。注意，中心到眼睛向量不能为零或与上向量平行。
     * @out The receiving matrix.
     * @param eye The source point.
     * @param center The target point.
     * @param up The vector describing the up direction.
     * @return The receiving matrix.
     */
    static lookAt(out, eye, center, up) {
        const eyex = eye.x;
        const eyey = eye.y;
        const eyez = eye.z;
        const upx = up.x;
        const upy = up.y;
        const upz = up.z;
        const centerx = center.x;
        const centery = center.y;
        const centerz = center.z;
        let z0 = eyex - centerx;
        let z1 = eyey - centery;
        let z2 = eyez - centerz;
        let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
        let x0 = upy * z2 - upz * z1;
        let x1 = upz * z0 - upx * z2;
        let x2 = upx * z1 - upy * z0;
        len = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        x0 *= len;
        x1 *= len;
        x2 *= len;
        const y0 = z1 * x2 - z2 * x1;
        const y1 = z2 * x0 - z0 * x2;
        const y2 = z0 * x1 - z1 * x0;
        out.m00 = x0;
        out.m01 = y0;
        out.m02 = z0;
        out.m03 = 0;
        out.m04 = x1;
        out.m05 = y1;
        out.m06 = z1;
        out.m07 = 0;
        out.m08 = x2;
        out.m09 = y2;
        out.m10 = z2;
        out.m11 = 0;
        out.m12 = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out.m13 = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out.m14 = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out.m15 = 1;
        return out;
    }
    /**
     * @en Calculates the inverse transpose of a matrix and save the results to out matrix
     * @zh 计算逆转置矩阵
     *
     * @deprecated This function is too complicated, and should be split into several functions.
     */
    static inverseTranspose(out, a) {
        const a00 = a.m00;
        const a01 = a.m01;
        const a02 = a.m02;
        const a03 = a.m03;
        const a10 = a.m04;
        const a11 = a.m05;
        const a12 = a.m06;
        const a13 = a.m07;
        const a20 = a.m08;
        const a21 = a.m09;
        const a22 = a.m10;
        const a23 = a.m11;
        const a30 = a.m12;
        const a31 = a.m13;
        const a32 = a.m14;
        const a33 = a.m15;
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out.m01 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out.m02 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out.m03 = 0;
        out.m04 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out.m06 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out.m07 = 0;
        out.m08 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out.m09 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out.m11 = 0;
        out.m12 = 0;
        out.m13 = 0;
        out.m14 = 0;
        out.m15 = 1;
        return out;
    }
    /**
     * @en Transform a matrix object to a flat array
     * @zh 矩阵转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, m, ofs = 0) {
        out[ofs + 0] = m.m00;
        out[ofs + 1] = m.m01;
        out[ofs + 2] = m.m02;
        out[ofs + 3] = m.m03;
        out[ofs + 4] = m.m04;
        out[ofs + 5] = m.m05;
        out[ofs + 6] = m.m06;
        out[ofs + 7] = m.m07;
        out[ofs + 8] = m.m08;
        out[ofs + 9] = m.m09;
        out[ofs + 10] = m.m10;
        out[ofs + 11] = m.m11;
        out[ofs + 12] = m.m12;
        out[ofs + 13] = m.m13;
        out[ofs + 14] = m.m14;
        out[ofs + 15] = m.m15;
        return out;
    }
    /**
     * @en Generates or sets a matrix with a flat array
     * @zh 数组转矩阵
     * @param ofs Array Start Offset
     */
    static fromArray(out, arr, ofs = 0) {
        out.m00 = arr[ofs + 0];
        out.m01 = arr[ofs + 1];
        out.m02 = arr[ofs + 2];
        out.m03 = arr[ofs + 3];
        out.m04 = arr[ofs + 4];
        out.m05 = arr[ofs + 5];
        out.m06 = arr[ofs + 6];
        out.m07 = arr[ofs + 7];
        out.m08 = arr[ofs + 8];
        out.m09 = arr[ofs + 9];
        out.m10 = arr[ofs + 10];
        out.m11 = arr[ofs + 11];
        out.m12 = arr[ofs + 12];
        out.m13 = arr[ofs + 13];
        out.m14 = arr[ofs + 14];
        out.m15 = arr[ofs + 15];
        return out;
    }
    /**
     * @en Adds two matrices and save the results to out matrix
     * @zh 逐元素矩阵加法
     */
    static add(out, a, b) {
        out.m00 = a.m00 + b.m00;
        out.m01 = a.m01 + b.m01;
        out.m02 = a.m02 + b.m02;
        out.m03 = a.m03 + b.m03;
        out.m04 = a.m04 + b.m04;
        out.m05 = a.m05 + b.m05;
        out.m06 = a.m06 + b.m06;
        out.m07 = a.m07 + b.m07;
        out.m08 = a.m08 + b.m08;
        out.m09 = a.m09 + b.m09;
        out.m10 = a.m10 + b.m10;
        out.m11 = a.m11 + b.m11;
        out.m12 = a.m12 + b.m12;
        out.m13 = a.m13 + b.m13;
        out.m14 = a.m14 + b.m14;
        out.m15 = a.m15 + b.m15;
        return out;
    }
    /**
     * @en Subtracts matrix b from matrix a and save the results to out matrix
     * @zh 逐元素矩阵减法
     */
    static subtract(out, a, b) {
        out.m00 = a.m00 - b.m00;
        out.m01 = a.m01 - b.m01;
        out.m02 = a.m02 - b.m02;
        out.m03 = a.m03 - b.m03;
        out.m04 = a.m04 - b.m04;
        out.m05 = a.m05 - b.m05;
        out.m06 = a.m06 - b.m06;
        out.m07 = a.m07 - b.m07;
        out.m08 = a.m08 - b.m08;
        out.m09 = a.m09 - b.m09;
        out.m10 = a.m10 - b.m10;
        out.m11 = a.m11 - b.m11;
        out.m12 = a.m12 - b.m12;
        out.m13 = a.m13 - b.m13;
        out.m14 = a.m14 - b.m14;
        out.m15 = a.m15 - b.m15;
        return out;
    }
    /**
     * @en Multiply each element of a matrix by a scalar number and save the results to out matrix
     * @zh 矩阵标量乘法
     */
    static multiplyScalar(out, a, b) {
        out.m00 = a.m00 * b;
        out.m01 = a.m01 * b;
        out.m02 = a.m02 * b;
        out.m03 = a.m03 * b;
        out.m04 = a.m04 * b;
        out.m05 = a.m05 * b;
        out.m06 = a.m06 * b;
        out.m07 = a.m07 * b;
        out.m08 = a.m08 * b;
        out.m09 = a.m09 * b;
        out.m10 = a.m10 * b;
        out.m11 = a.m11 * b;
        out.m12 = a.m12 * b;
        out.m13 = a.m13 * b;
        out.m14 = a.m14 * b;
        out.m15 = a.m15 * b;
        return out;
    }
    /**
     * @en Adds two matrices after multiplying each element of the second operand by a scalar number. And save the results to out matrix.
     * @zh 逐元素矩阵标量乘加: A + B * scale
     */
    static multiplyScalarAndAdd(out, a, b, scale) {
        out.m00 = a.m00 + (b.m00 * scale);
        out.m01 = a.m01 + (b.m01 * scale);
        out.m02 = a.m02 + (b.m02 * scale);
        out.m03 = a.m03 + (b.m03 * scale);
        out.m04 = a.m04 + (b.m04 * scale);
        out.m05 = a.m05 + (b.m05 * scale);
        out.m06 = a.m06 + (b.m06 * scale);
        out.m07 = a.m07 + (b.m07 * scale);
        out.m08 = a.m08 + (b.m08 * scale);
        out.m09 = a.m09 + (b.m09 * scale);
        out.m10 = a.m10 + (b.m10 * scale);
        out.m11 = a.m11 + (b.m11 * scale);
        out.m12 = a.m12 + (b.m12 * scale);
        out.m13 = a.m13 + (b.m13 * scale);
        out.m14 = a.m14 + (b.m14 * scale);
        out.m15 = a.m15 + (b.m15 * scale);
        return out;
    }
    /**
     * @en Returns whether the specified matrices are equal.
     * @zh 矩阵等价判断
     */
    static strictEquals(a, b) {
        return a.m00 === b.m00 && a.m01 === b.m01 && a.m02 === b.m02 && a.m03 === b.m03
            && a.m04 === b.m04 && a.m05 === b.m05 && a.m06 === b.m06 && a.m07 === b.m07
            && a.m08 === b.m08 && a.m09 === b.m09 && a.m10 === b.m10 && a.m11 === b.m11
            && a.m12 === b.m12 && a.m13 === b.m13 && a.m14 === b.m14 && a.m15 === b.m15;
    }
    /**
     * @en Returns whether the specified matrices are approximately equal.
     * @zh 排除浮点数误差的矩阵近似等价判断
     *
     * @param a The first matrix to be compared.
     * @param b The second matrix to be compared.
     * @param epsilon The tolerance value.
     * @return
     */
    static equals(a, b, epsilon = EPSILON) {
        // TAOCP vol.2, 3rd ed., s.4.2.4, p.213-225
        // defines a 'close enough' relationship between u and v that scales for magnitude
        return (Math.abs(a.m00 - b.m00) <= epsilon * Math.max(1.0, Math.abs(a.m00), Math.abs(b.m00))
            && Math.abs(a.m01 - b.m01) <= epsilon * Math.max(1.0, Math.abs(a.m01), Math.abs(b.m01))
            && Math.abs(a.m02 - b.m02) <= epsilon * Math.max(1.0, Math.abs(a.m02), Math.abs(b.m02))
            && Math.abs(a.m03 - b.m03) <= epsilon * Math.max(1.0, Math.abs(a.m03), Math.abs(b.m03))
            && Math.abs(a.m04 - b.m04) <= epsilon * Math.max(1.0, Math.abs(a.m04), Math.abs(b.m04))
            && Math.abs(a.m05 - b.m05) <= epsilon * Math.max(1.0, Math.abs(a.m05), Math.abs(b.m05))
            && Math.abs(a.m06 - b.m06) <= epsilon * Math.max(1.0, Math.abs(a.m06), Math.abs(b.m06))
            && Math.abs(a.m07 - b.m07) <= epsilon * Math.max(1.0, Math.abs(a.m07), Math.abs(b.m07))
            && Math.abs(a.m08 - b.m08) <= epsilon * Math.max(1.0, Math.abs(a.m08), Math.abs(b.m08))
            && Math.abs(a.m09 - b.m09) <= epsilon * Math.max(1.0, Math.abs(a.m09), Math.abs(b.m09))
            && Math.abs(a.m10 - b.m10) <= epsilon * Math.max(1.0, Math.abs(a.m10), Math.abs(b.m10))
            && Math.abs(a.m11 - b.m11) <= epsilon * Math.max(1.0, Math.abs(a.m11), Math.abs(b.m11))
            && Math.abs(a.m12 - b.m12) <= epsilon * Math.max(1.0, Math.abs(a.m12), Math.abs(b.m12))
            && Math.abs(a.m13 - b.m13) <= epsilon * Math.max(1.0, Math.abs(a.m13), Math.abs(b.m13))
            && Math.abs(a.m14 - b.m14) <= epsilon * Math.max(1.0, Math.abs(a.m14), Math.abs(b.m14))
            && Math.abs(a.m15 - b.m15) <= epsilon * Math.max(1.0, Math.abs(a.m15), Math.abs(b.m15)));
    }
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 0, m05 = 1, m06 = 0, m07 = 0, m08 = 0, m09 = 0, m10 = 1, m11 = 0, m12 = 0, m13 = 0, m14 = 0, m15 = 1) {
        if (typeof m00 === 'object') {
            this.m00 = m00.m00;
            this.m01 = m00.m01;
            this.m02 = m00.m02;
            this.m03 = m00.m03;
            this.m04 = m00.m04;
            this.m05 = m00.m05;
            this.m06 = m00.m06;
            this.m07 = m00.m07;
            this.m08 = m00.m08;
            this.m09 = m00.m09;
            this.m10 = m00.m10;
            this.m11 = m00.m11;
            this.m12 = m00.m12;
            this.m13 = m00.m13;
            this.m14 = m00.m14;
            this.m15 = m00.m15;
        }
        else {
            this.m00 = m00;
            this.m01 = m01;
            this.m02 = m02;
            this.m03 = m03;
            this.m04 = m04;
            this.m05 = m05;
            this.m06 = m06;
            this.m07 = m07;
            this.m08 = m08;
            this.m09 = m09;
            this.m10 = m10;
            this.m11 = m11;
            this.m12 = m12;
            this.m13 = m13;
            this.m14 = m14;
            this.m15 = m15;
        }
    }
    /**
     * @en Clone a new matrix from the current matrix.
     * @zh 克隆当前矩阵。
     */
    clone() {
        return new Mat4(this.m00, this.m01, this.m02, this.m03, this.m04, this.m05, this.m06, this.m07, this.m08, this.m09, this.m10, this.m11, this.m12, this.m13, this.m14, this.m15);
    }
    set(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m04 = 0, m05 = 1, m06 = 0, m07 = 0, m08 = 0, m09 = 0, m10 = 1, m11 = 0, m12 = 0, m13 = 0, m14 = 0, m15 = 1) {
        if (typeof m00 === 'object') {
            this.m01 = m00.m01;
            this.m02 = m00.m02;
            this.m03 = m00.m03;
            this.m04 = m00.m04;
            this.m05 = m00.m05;
            this.m06 = m00.m06;
            this.m07 = m00.m07;
            this.m08 = m00.m08;
            this.m09 = m00.m09;
            this.m10 = m00.m10;
            this.m11 = m00.m11;
            this.m12 = m00.m12;
            this.m13 = m00.m13;
            this.m14 = m00.m14;
            this.m15 = m00.m15;
            this.m00 = m00.m00;
        }
        else {
            this.m01 = m01;
            this.m02 = m02;
            this.m03 = m03;
            this.m04 = m04;
            this.m05 = m05;
            this.m06 = m06;
            this.m07 = m07;
            this.m08 = m08;
            this.m09 = m09;
            this.m10 = m10;
            this.m11 = m11;
            this.m12 = m12;
            this.m13 = m13;
            this.m14 = m14;
            this.m15 = m15;
            this.m00 = m00;
        }
        return this;
    }
    /**
     * @en Returns whether the specified matrices are approximately equal.
     * @zh 判断当前矩阵是否在误差范围内与指定矩阵相等。
     * @param other Comparative matrix
     * @param epsilon The error allowed. It`s should be a non-negative number.
     * @return Returns `true' when the elements of both matrices are equal; otherwise returns `false'.
     */
    equals(other, epsilon = EPSILON) {
        const hasInf = Math.abs(this.m00) === Infinity
            || Math.abs(this.m01) === Infinity
            || Math.abs(this.m02) === Infinity
            || Math.abs(this.m03) === Infinity
            || Math.abs(this.m04) === Infinity
            || Math.abs(this.m05) === Infinity
            || Math.abs(this.m06) === Infinity
            || Math.abs(this.m07) === Infinity
            || Math.abs(this.m08) === Infinity
            || Math.abs(this.m09) === Infinity
            || Math.abs(this.m10) === Infinity
            || Math.abs(this.m11) === Infinity
            || Math.abs(this.m12) === Infinity
            || Math.abs(this.m13) === Infinity
            || Math.abs(this.m14) === Infinity
            || Math.abs(this.m15) === Infinity;
        return (!hasInf
            && Math.abs(this.m00 - other.m00) <= epsilon * Math.max(1.0, Math.abs(this.m00), Math.abs(other.m00))
            && Math.abs(this.m01 - other.m01) <= epsilon * Math.max(1.0, Math.abs(this.m01), Math.abs(other.m01))
            && Math.abs(this.m02 - other.m02) <= epsilon * Math.max(1.0, Math.abs(this.m02), Math.abs(other.m02))
            && Math.abs(this.m03 - other.m03) <= epsilon * Math.max(1.0, Math.abs(this.m03), Math.abs(other.m03))
            && Math.abs(this.m04 - other.m04) <= epsilon * Math.max(1.0, Math.abs(this.m04), Math.abs(other.m04))
            && Math.abs(this.m05 - other.m05) <= epsilon * Math.max(1.0, Math.abs(this.m05), Math.abs(other.m05))
            && Math.abs(this.m06 - other.m06) <= epsilon * Math.max(1.0, Math.abs(this.m06), Math.abs(other.m06))
            && Math.abs(this.m07 - other.m07) <= epsilon * Math.max(1.0, Math.abs(this.m07), Math.abs(other.m07))
            && Math.abs(this.m08 - other.m08) <= epsilon * Math.max(1.0, Math.abs(this.m08), Math.abs(other.m08))
            && Math.abs(this.m09 - other.m09) <= epsilon * Math.max(1.0, Math.abs(this.m09), Math.abs(other.m09))
            && Math.abs(this.m10 - other.m10) <= epsilon * Math.max(1.0, Math.abs(this.m10), Math.abs(other.m10))
            && Math.abs(this.m11 - other.m11) <= epsilon * Math.max(1.0, Math.abs(this.m11), Math.abs(other.m11))
            && Math.abs(this.m12 - other.m12) <= epsilon * Math.max(1.0, Math.abs(this.m12), Math.abs(other.m12))
            && Math.abs(this.m13 - other.m13) <= epsilon * Math.max(1.0, Math.abs(this.m13), Math.abs(other.m13))
            && Math.abs(this.m14 - other.m14) <= epsilon * Math.max(1.0, Math.abs(this.m14), Math.abs(other.m14))
            && Math.abs(this.m15 - other.m15) <= epsilon * Math.max(1.0, Math.abs(this.m15), Math.abs(other.m15)));
    }
    /**
     * @en Returns whether the specified matrices are equal.
     * @zh 判断当前矩阵是否与指定矩阵相等。
     * @param other Comparative matrix
     * @return Returns `true' when the elements of both matrices are equal; otherwise returns `false'.
     */
    strictEquals(other) {
        return this.m00 === other.m00 && this.m01 === other.m01 && this.m02 === other.m02 && this.m03 === other.m03
            && this.m04 === other.m04 && this.m05 === other.m05 && this.m06 === other.m06 && this.m07 === other.m07
            && this.m08 === other.m08 && this.m09 === other.m09 && this.m10 === other.m10 && this.m11 === other.m11
            && this.m12 === other.m12 && this.m13 === other.m13 && this.m14 === other.m14 && this.m15 === other.m15;
    }
    /**
     * @en Returns a string representation of a matrix.
     * @zh 返回当前矩阵的字符串表示。
     * @return 当前矩阵的字符串表示。
     */
    toString() {
        return `[\n${this.m00}, ${this.m01}, ${this.m02}, ${this.m03},\n${this.m04}, ${this.m05}, ${this.m06}, ${this.m07},\n${this.m08}, ${this.m09}, ${this.m10}, ${this.m11},\n${this.m12}, ${this.m13}, ${this.m14}, ${this.m15}\n`
            + ']';
    }
    /**
     * @en set the current matrix to an identity matrix.
     * @zh 将当前矩阵设为单位矩阵。
     * @return `this`
     */
    identity() {
        this.m00 = 1;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = 1;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m10 = 1;
        this.m11 = 0;
        this.m12 = 0;
        this.m13 = 0;
        this.m14 = 0;
        this.m15 = 1;
        return this;
    }
    /**
     * @en set the current matrix to an zero matrix.
     * @zh 将当前矩阵设为 0矩阵。
     * @return `this`
     */
    zero() {
        this.m00 = 0;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m04 = 0;
        this.m05 = 0;
        this.m06 = 0;
        this.m07 = 0;
        this.m08 = 0;
        this.m09 = 0;
        this.m10 = 0;
        this.m11 = 0;
        this.m12 = 0;
        this.m13 = 0;
        this.m14 = 0;
        this.m15 = 0;
        return this;
    }
    /**
     * @en Transposes the current matrix.
     * @zh 计算当前矩阵的转置矩阵。
     */
    transpose() {
        const a01 = this.m01;
        const a02 = this.m02;
        const a03 = this.m03;
        const a12 = this.m06;
        const a13 = this.m07;
        const a23 = this.m11;
        this.m01 = this.m04;
        this.m02 = this.m08;
        this.m03 = this.m12;
        this.m04 = a01;
        this.m06 = this.m09;
        this.m07 = this.m13;
        this.m08 = a02;
        this.m09 = a12;
        this.m11 = this.m14;
        this.m12 = a03;
        this.m13 = a13;
        this.m14 = a23;
        return this;
    }
    /**
     * @en Inverts the current matrix. When matrix is not invertible the matrix will be set to zeros.
     * @zh 计算当前矩阵的逆矩阵。注意，在矩阵不可逆时，会返回一个全为 0 的矩阵。
     */
    invert() {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a03 = this.m03;
        const a10 = this.m04;
        const a11 = this.m05;
        const a12 = this.m06;
        const a13 = this.m07;
        const a20 = this.m08;
        const a21 = this.m09;
        const a22 = this.m10;
        const a23 = this.m11;
        const a30 = this.m12;
        const a31 = this.m13;
        const a32 = this.m14;
        const a33 = this.m15;
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (det === 0) {
            this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            return this;
        }
        det = 1.0 / det;
        this.m00 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        this.m01 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        this.m02 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        this.m03 = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        this.m04 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        this.m05 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        this.m06 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        this.m07 = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        this.m08 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        this.m09 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        this.m10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        this.m11 = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        this.m12 = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        this.m13 = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        this.m14 = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        this.m15 = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return this;
    }
    /**
     * @en Calculates the determinant of the current matrix.
     * @zh 计算当前矩阵的行列式。
     * @return 当前矩阵的行列式。
     */
    determinant() {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a03 = this.m03;
        const a10 = this.m04;
        const a11 = this.m05;
        const a12 = this.m06;
        const a13 = this.m07;
        const a20 = this.m08;
        const a21 = this.m09;
        const a22 = this.m10;
        const a23 = this.m11;
        const a30 = this.m12;
        const a31 = this.m13;
        const a32 = this.m14;
        const a33 = this.m15;
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }
    /**
     * @en Adds the current matrix and another matrix to the current matrix.
     * @zh 矩阵加法。将当前矩阵与指定矩阵的相加，结果返回给当前矩阵。
     * @param mat the second operand
     */
    add(mat) {
        this.m00 += mat.m00;
        this.m01 += mat.m01;
        this.m02 += mat.m02;
        this.m03 += mat.m03;
        this.m04 += mat.m04;
        this.m05 += mat.m05;
        this.m06 += mat.m06;
        this.m07 += mat.m07;
        this.m08 += mat.m08;
        this.m09 += mat.m09;
        this.m10 += mat.m10;
        this.m11 += mat.m11;
        this.m12 += mat.m12;
        this.m13 += mat.m13;
        this.m14 += mat.m14;
        this.m15 += mat.m15;
        return this;
    }
    /**
     * @en Subtracts another matrix from the current matrix.
     * @zh 计算矩阵减法。将当前矩阵减去指定矩阵的结果赋值给当前矩阵。
     * @param mat the second operand
     */
    subtract(mat) {
        this.m00 -= mat.m00;
        this.m01 -= mat.m01;
        this.m02 -= mat.m02;
        this.m03 -= mat.m03;
        this.m04 -= mat.m04;
        this.m05 -= mat.m05;
        this.m06 -= mat.m06;
        this.m07 -= mat.m07;
        this.m08 -= mat.m08;
        this.m09 -= mat.m09;
        this.m10 -= mat.m10;
        this.m11 -= mat.m11;
        this.m12 -= mat.m12;
        this.m13 -= mat.m13;
        this.m14 -= mat.m14;
        this.m15 -= mat.m15;
        return this;
    }
    /**
     * @en Multiply the current matrix with another matrix.
     * @zh 矩阵乘法。将当前矩阵左乘指定矩阵的结果赋值给当前矩阵。
     * @param mat the second operand
     */
    multiply(mat) {
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a03 = this.m03;
        const a10 = this.m04;
        const a11 = this.m05;
        const a12 = this.m06;
        const a13 = this.m07;
        const a20 = this.m08;
        const a21 = this.m09;
        const a22 = this.m10;
        const a23 = this.m11;
        const a30 = this.m12;
        const a31 = this.m13;
        const a32 = this.m14;
        const a33 = this.m15;
        // Cache only the current line of the second matrix
        let b0 = mat.m00;
        let b1 = mat.m01;
        let b2 = mat.m02;
        let b3 = mat.m03;
        this.m00 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m01 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m02 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m03 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = mat.m04;
        b1 = mat.m05;
        b2 = mat.m06;
        b3 = mat.m07;
        this.m04 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m05 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m06 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m07 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = mat.m08;
        b1 = mat.m09;
        b2 = mat.m10;
        b3 = mat.m11;
        this.m08 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m09 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m10 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m11 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        b0 = mat.m12;
        b1 = mat.m13;
        b2 = mat.m14;
        b3 = mat.m15;
        this.m12 = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        this.m13 = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        this.m14 = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        this.m15 = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return this;
    }
    /**
     * @en Multiply each element of the current matrix by a scalar number.
     * @zh 矩阵数乘。将当前矩阵与指定标量的数乘结果赋值给当前矩阵。
     * @param scalar amount to scale the matrix's elements by
     */
    multiplyScalar(scalar) {
        this.m00 *= scalar;
        this.m01 *= scalar;
        this.m02 *= scalar;
        this.m03 *= scalar;
        this.m04 *= scalar;
        this.m05 *= scalar;
        this.m06 *= scalar;
        this.m07 *= scalar;
        this.m08 *= scalar;
        this.m09 *= scalar;
        this.m10 *= scalar;
        this.m11 *= scalar;
        this.m12 *= scalar;
        this.m13 *= scalar;
        this.m14 *= scalar;
        this.m15 *= scalar;
        return this;
    }
    /**
     * @en Translate the current matrix by the given vector
     * @zh 将当前矩阵左乘位移矩阵的结果赋值给当前矩阵，位移矩阵由各个轴的位移给出。
     * @param vec vector to translate by
     *
     * @deprecated since v3.0, please use [[transform]] instead
     */
    translate(vec) {
        this.m12 += vec.x;
        this.m13 += vec.y;
        this.m14 += vec.z;
        return this;
    }
    /**
     * @en Translate the current matrix by the given vector
     * @zh 将当前矩阵左乘位移矩阵的结果赋值给当前矩阵，位移矩阵由各个轴的位移给出。
     * @param vec vector to translate by
     */
    transform(vec) {
        const { x, y, z } = vec;
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a03 = this.m03;
        const a10 = this.m04;
        const a11 = this.m05;
        const a12 = this.m06;
        const a13 = this.m07;
        const a20 = this.m08;
        const a21 = this.m09;
        const a22 = this.m10;
        const a23 = this.m11;
        this.m12 = a00 * x + a10 * y + a20 * z + this.m12;
        this.m13 = a01 * x + a11 * y + a21 * z + this.m13;
        this.m14 = a02 * x + a12 * y + a22 * z + this.m14;
        this.m15 = a03 * x + a13 * y + a23 * z + this.m15;
        return this;
    }
    /**
     * @en Multiply the current matrix with a scale vector.
     * @zh 将当前矩阵左乘缩放矩阵的结果赋值给当前矩阵，缩放矩阵由各个轴的缩放给出。
     * @param vec vector to scale by
     */
    scale(vec) {
        const x = vec.x;
        const y = vec.y;
        const z = vec.z;
        this.m00 *= x;
        this.m01 *= x;
        this.m02 *= x;
        this.m03 *= x;
        this.m04 *= y;
        this.m05 *= y;
        this.m06 *= y;
        this.m07 *= y;
        this.m08 *= z;
        this.m09 *= z;
        this.m10 *= z;
        this.m11 *= z;
        return this;
    }
    /**
     * @en Rotates the current matrix by the given angle around the given axis
     * @zh 将当前矩阵左乘旋转矩阵的结果赋值给当前矩阵，旋转矩阵由旋转轴和旋转角度给出。
     * @param rad Angle of rotation (in radians)
     * @param axis Axis of rotation
     */
    rotate(rad, axis) {
        let x = axis.x;
        let y = axis.y;
        let z = axis.z;
        let len = Math.sqrt(x * x + y * y + z * z);
        if (Math.abs(len) < EPSILON) {
            return null;
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = 1 - c;
        const a00 = this.m00;
        const a01 = this.m01;
        const a02 = this.m02;
        const a03 = this.m03;
        const a10 = this.m04;
        const a11 = this.m05;
        const a12 = this.m06;
        const a13 = this.m07;
        const a20 = this.m08;
        const a21 = this.m09;
        const a22 = this.m10;
        const a23 = this.m11;
        // Construct the elements of the rotation matrix
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        // Perform rotation-specific matrix multiplication
        this.m00 = a00 * b00 + a10 * b01 + a20 * b02;
        this.m01 = a01 * b00 + a11 * b01 + a21 * b02;
        this.m02 = a02 * b00 + a12 * b01 + a22 * b02;
        this.m03 = a03 * b00 + a13 * b01 + a23 * b02;
        this.m04 = a00 * b10 + a10 * b11 + a20 * b12;
        this.m05 = a01 * b10 + a11 * b11 + a21 * b12;
        this.m06 = a02 * b10 + a12 * b11 + a22 * b12;
        this.m07 = a03 * b10 + a13 * b11 + a23 * b12;
        this.m08 = a00 * b20 + a10 * b21 + a20 * b22;
        this.m09 = a01 * b20 + a11 * b21 + a21 * b22;
        this.m10 = a02 * b20 + a12 * b21 + a22 * b22;
        this.m11 = a03 * b20 + a13 * b21 + a23 * b22;
        return this;
    }
    /**
     * @en Returns the translation vector component of a transformation matrix.
     * @zh 从当前矩阵中计算出位移变换的部分，并以各个轴上位移的形式赋值给输出向量。
     * @param out Vector to receive translation component.
     */
    getTranslation(out) {
        out.x = this.m12;
        out.y = this.m13;
        out.z = this.m14;
        return out;
    }
    /**
     * @en Returns the scale factor component of a transformation matrix
     * @zh 从当前矩阵中计算出缩放变换的部分，并以各个轴上缩放的形式赋值给输出向量。
     * @param out Vector to receive scale component
     */
    getScale(out) {
        const m00 = m3_1.m00 = this.m00;
        const m01 = m3_1.m01 = this.m01;
        const m02 = m3_1.m02 = this.m02;
        const m04 = m3_1.m03 = this.m04;
        const m05 = m3_1.m04 = this.m05;
        const m06 = m3_1.m05 = this.m06;
        const m08 = m3_1.m06 = this.m08;
        const m09 = m3_1.m07 = this.m09;
        const m10 = m3_1.m08 = this.m10;
        out.x = Math.sqrt(m00 * m00 + m01 * m01 + m02 * m02);
        out.y = Math.sqrt(m04 * m04 + m05 * m05 + m06 * m06);
        out.z = Math.sqrt(m08 * m08 + m09 * m09 + m10 * m10);
        // account for reflections
        if (Mat3.determinant(m3_1) < 0) {
            out.x *= -1;
        }
        return out;
    }
    /**
     * @en Returns the rotation factor component of a transformation matrix
     * @zh 从当前矩阵中计算出旋转变换的部分，并以四元数的形式赋值给输出四元数。
     * @param out Vector to receive rotation component
     */
    getRotation(out) {
        // Extract rotation matrix first
        const sx = Vec3.set(v3_1, this.m00, this.m01, this.m02).length();
        const sy = Vec3.set(v3_1, this.m04, this.m05, this.m06).length();
        const sz = Vec3.set(v3_1, this.m08, this.m09, this.m10).length();
        m3_1.m00 = this.m00 / sx;
        m3_1.m01 = this.m01 / sx;
        m3_1.m02 = this.m02 / sx;
        m3_1.m03 = this.m04 / sy;
        m3_1.m04 = this.m05 / sy;
        m3_1.m05 = this.m06 / sy;
        m3_1.m06 = this.m08 / sz;
        m3_1.m07 = this.m09 / sz;
        m3_1.m08 = this.m10 / sz;
        const det = Mat3.determinant(m3_1);
        if (det < 0) {
            m3_1.m00 *= -1;
            m3_1.m01 *= -1;
            m3_1.m02 *= -1;
        }
        return Quat.fromMat3(out, m3_1);
    }
    /**
     * @en Resets the matrix values by the given rotation quaternion, translation vector and scale vector
     * @zh 重置当前矩阵的值，使其表示指定的旋转、缩放、位移依次组合的变换。
     * @param q Rotation quaternion
     * @param v Translation vector
     * @param s Scaling vector
     * @return `this`
     *
     * @deprecated Since 3.8.0, please use [[fromSRT]] instead
     */
    fromRTS(q, v, s) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s.x;
        const sy = s.y;
        const sz = s.z;
        this.m00 = (1 - (yy + zz)) * sx;
        this.m01 = (xy + wz) * sx;
        this.m02 = (xz - wy) * sx;
        this.m03 = 0;
        this.m04 = (xy - wz) * sy;
        this.m05 = (1 - (xx + zz)) * sy;
        this.m06 = (yz + wx) * sy;
        this.m07 = 0;
        this.m08 = (xz + wy) * sz;
        this.m09 = (yz - wx) * sz;
        this.m10 = (1 - (xx + yy)) * sz;
        this.m11 = 0;
        this.m12 = v.x;
        this.m13 = v.y;
        this.m14 = v.z;
        this.m15 = 1;
        return this;
    }
    /**
     * @en Resets the matrix values by the given rotation quaternion, translation vector and scale vector
     * @zh 重置当前矩阵的值，使其表示指定的旋转、缩放、位移依次组合的变换。
     * @param q Rotation quaternion
     * @param v Translation vector
     * @param s Scaling vector
     * @return `this`
     */
    fromSRT(q, v, s) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s.x;
        const sy = s.y;
        const sz = s.z;
        this.m00 = (1 - (yy + zz)) * sx;
        this.m01 = (xy + wz) * sx;
        this.m02 = (xz - wy) * sx;
        this.m03 = 0;
        this.m04 = (xy - wz) * sy;
        this.m05 = (1 - (xx + zz)) * sy;
        this.m06 = (yz + wx) * sy;
        this.m07 = 0;
        this.m08 = (xz + wy) * sz;
        this.m09 = (yz - wx) * sz;
        this.m10 = (1 - (xx + yy)) * sz;
        this.m11 = 0;
        this.m12 = v.x;
        this.m13 = v.y;
        this.m14 = v.z;
        this.m15 = 1;
        return this;
    }
    /**
     * @en Resets the current matrix from the given quaternion.
     * @zh 重置当前矩阵的值，使其表示指定四元数表示的旋转变换。
     * @param q Rotation quaternion
     * @return `this`
     */
    fromQuat(q) {
        const x = q.x;
        const y = q.y;
        const z = q.z;
        const w = q.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        this.m00 = 1 - yy - zz;
        this.m01 = yx + wz;
        this.m02 = zx - wy;
        this.m03 = 0;
        this.m04 = yx - wz;
        this.m05 = 1 - xx - zz;
        this.m06 = zy + wx;
        this.m07 = 0;
        this.m08 = zx + wy;
        this.m09 = zy - wx;
        this.m10 = 1 - xx - yy;
        this.m11 = 0;
        this.m12 = 0;
        this.m13 = 0;
        this.m14 = 0;
        this.m15 = 1;
        return this;
    }
}
Mat4.IDENTITY = Object.freeze(new Mat4());
const v3_1 = new Vec3();
const m3_1 = new Mat3();
function mat4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    return new Mat4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
}

/*
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en `AffineTransform` class represent an affine transform matrix. It's composed basically by translation, rotation, scale transformations.
 * @zh 二维仿射变换矩阵，描述了平移、旋转和缩放。
 */
class AffineTransform {
    /**
     * @en Create an identity transformation matrix.
     * @zh 创建单位二维仿射变换矩阵，它不进行任何变换。
     */
    static identity() {
        return new AffineTransform();
    }
    /**
     * @en Clone an `AffineTransform` object from the specified transform.
     * @zh 克隆指定的二维仿射变换矩阵。
     * @param affineTransform Specified `AffineTransform` objects
     */
    static clone(affineTransform) {
        return new AffineTransform(affineTransform.a, affineTransform.b, affineTransform.c, affineTransform.d, affineTransform.tx, affineTransform.ty);
    }
    /**
     * @en Concatenate a transform matrix to another. The results are reflected in the out `AffineTransform`.
     * First apply t1, then t2: out * v = t2 * (t1 * v).
     * @zh 将两个矩阵相乘的结果赋值给输出矩阵，先应用t1再应用t2: out * v = t2 * (t1 * v)。
     * @param out Out object to store the concat result
     * @param t1 The first transform object.
     * @param t2 The transform object to concatenate.
     */
    static concat(out, t1, t2) {
        const a = t1.a;
        const b = t1.b;
        const c = t1.c;
        const d = t1.d;
        const tx = t1.tx;
        const ty = t1.ty;
        out.a = a * t2.a + b * t2.c;
        out.b = a * t2.b + b * t2.d;
        out.c = c * t2.a + d * t2.c;
        out.d = c * t2.b + d * t2.d;
        out.tx = tx * t2.a + ty * t2.c + t2.tx;
        out.ty = tx * t2.b + ty * t2.d + t2.ty;
    }
    /**
     * @en Get the invert transform of an `AffineTransform` object.
     * @zh 将矩阵求逆的结果赋值给输出矩阵。
     * @param out Out object to store the invert result
     * @param t the input `AffineTransform` object
     */
    static invert(out, t) {
        const determinant = 1 / (t.a * t.d - t.b * t.c);
        out.a = determinant * t.d;
        out.b = -determinant * t.b;
        out.c = -determinant * t.c;
        out.d = determinant * t.a;
        out.tx = determinant * (t.c * t.ty - t.d * t.tx);
        out.ty = determinant * (t.b * t.tx - t.a * t.ty);
    }
    /**
     * @en Get an `AffineTransform` object from a given matrix 4x4.
     * @zh 将四维矩阵转换为二维仿射变换矩阵并赋值给输出矩阵。
     * @param out The output matrix to store the result
     * @param mat transform matrix.
     */
    static fromMat4(out, mat) {
        out.a = mat.m00;
        out.b = mat.m01;
        out.c = mat.m04;
        out.d = mat.m05;
        out.tx = mat.m12;
        out.ty = mat.m13;
    }
    static transformVec2(out, point, transOrY, t) {
        let x;
        let y;
        if (!t) {
            t = transOrY;
            x = point.x;
            y = point.y;
        }
        else {
            x = point;
            y = transOrY;
        }
        out.x = t.a * x + t.c * y + t.tx;
        out.y = t.b * x + t.d * y + t.ty;
    }
    /**
     * @en Apply the `AffineTransform` on a size.
     * @zh 应用二维仿射变换矩阵到二维尺寸上，并将结果赋值给输出尺寸。
     * @param out The output size to store the result
     * @param size The size to apply transform.
     * @param t transform matrix.
     */
    static transformSize(out, size, t) {
        out.width = t.a * size.width + t.c * size.height;
        out.height = t.b * size.width + t.d * size.height;
    }
    /**
     * @en Apply the `AffineTransform` on a rect.
     * @zh 应用二维仿射变换矩阵到矩形上，并将结果赋值给输出矩形。
     * @param out The output rect object to store the result
     * @param rect The rect object to apply transform.
     * @param t transform matrix.
     */
    static transformRect(out, rect, t) {
        const or = rect.x + rect.width;
        const ot = rect.y + rect.height;
        const lbx = t.a * rect.x + t.c * rect.y + t.tx;
        const lby = t.b * rect.x + t.d * rect.y + t.ty;
        const rbx = t.a * or + t.c * rect.y + t.tx;
        const rby = t.b * or + t.d * rect.y + t.ty;
        const ltx = t.a * rect.x + t.c * ot + t.tx;
        const lty = t.b * rect.x + t.d * ot + t.ty;
        const rtx = t.a * or + t.c * ot + t.tx;
        const rty = t.b * or + t.d * ot + t.ty;
        const minX = Math.min(lbx, rbx, ltx, rtx);
        const maxX = Math.max(lbx, rbx, ltx, rtx);
        const minY = Math.min(lby, rby, lty, rty);
        const maxY = Math.max(lby, rby, lty, rty);
        out.x = minX;
        out.y = minY;
        out.width = maxX - minX;
        out.height = maxY - minY;
    }
    /**
     * @en Apply the `AffineTransform` on a rect, and turns to an Oriented Bounding Box.
     * This function does not allocate any memory, you should create the output vectors by yourself and manage their memory.
     * @zh 应用二维仿射变换矩阵到矩形上, 并转换为有向包围盒。
     * 这个函数不创建任何内存，你需要先创建包围盒的四个 Vector 对象用来存储结果，并作为前四个参数传入函数。
     * @param out_bl Output vector for storing the bottom left corner coordinates of the Obb object
     * @param out_tl Output vector for storing the top left corner coordinates of the Obb object
     * @param out_tr Output vector for storing the top right corner coordinates of the Obb object
     * @param out_br Output vector for storing the bottom right corner coordinates of the Obb object
     * @param rect The rect object to apply transform.
     * @param anAffineTransform transform matrix.
     */
    static transformObb(out_bl, out_tl, out_tr, out_br, rect, anAffineTransform, flipY = true) {
        const tx = anAffineTransform.a * rect.x + anAffineTransform.c * rect.y + anAffineTransform.tx;
        const ty = anAffineTransform.b * rect.x + anAffineTransform.d * rect.y + anAffineTransform.ty;
        const xa = anAffineTransform.a * rect.width;
        const xb = anAffineTransform.b * rect.width;
        const yc = anAffineTransform.c * rect.height;
        const yd = anAffineTransform.d * rect.height;
        if (flipY) {
            out_tl.x = tx;
            out_tl.y = ty;
            out_tr.x = xa + tx;
            out_tr.y = xb + ty;
            out_bl.x = yc + tx;
            out_bl.y = yd + ty;
            out_br.x = xa + yc + tx;
            out_br.y = xb + yd + ty;
        }
        else {
            out_bl.x = tx;
            out_bl.y = ty;
            out_br.x = xa + tx;
            out_br.y = xb + ty;
            out_tl.x = yc + tx;
            out_tl.y = yd + ty;
            out_tr.x = xa + yc + tx;
            out_tr.y = xb + yd + ty;
        }
    }
    /**
     * @en constructor an `AffineTransform` object.
     * @zh 构造二维放射变换矩阵。
     * @param a a
     * @param b b
     * @param c c
     * @param d d
     * @param tx tx
     * @param ty ty
     */
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    }
}

/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en Two dimensional size type representing the width and height.
 * @zh 二维尺寸。
 */
class Size {
    /**
     * @en Calculate the interpolation result between this size and another one with given ratio
     * @zh 根据指定的插值比率，从当前尺寸到目标尺寸之间做插值。
     * @param out Output Size.
     * @param from Original Size.
     * @param to Target Size.
     * @param ratio The interpolation coefficient.The range is [0,1].
     * @returns A vector consisting of linear interpolation of the width and height of the current size to the width and height of the target size at a specified interpolation ratio, respectively.
     */
    static lerp(out, from, to, ratio) {
        out.width = from.width + (to.width - from.width) * ratio;
        out.height = from.height + (to.height - from.height) * ratio;
        return out;
    }
    /**
     * @en Check whether `Size` a is equal to `Size` b.
     * @zh 判断两个尺寸是否相等。
     * @param a Size a.
     * @param b Size b.
     * @returns Returns `true' when both dimensions are equal in width and height; otherwise returns `false'.
     */
    static equals(a, b) {
        return a.width === b.width
            && a.height === b.height;
    }
    // compatibility with vector interfaces
    set x(val) { this.width = val; }
    get x() { return this.width; }
    set y(val) { this.height = val; }
    get y() { return this.height; }
    constructor(width, height) {
        if (typeof width === 'object') {
            this.width = width.width;
            this.height = width.height;
        }
        else {
            this.width = width || 0;
            this.height = height || 0;
        }
    }
    /**
     * @en clone the current `Size`.
     * @zh 克隆当前尺寸。
     */
    clone() {
        return new Size(this.width, this.height);
    }
    set(width, height) {
        if (typeof width === 'object') {
            this.height = width.height;
            this.width = width.width;
        }
        else {
            this.width = width || 0;
            this.height = height || 0;
        }
        return this;
    }
    /**
     * @en Check whether the current `Size` equals another one.
     * @zh 判断当前尺寸是否与指定尺寸的相等。
     * @param other Specified Size
     * @returns Returns `true' when both dimensions are equal in width and height; otherwise returns `false'.
     */
    equals(other) {
        return this.width === other.width
            && this.height === other.height;
    }
    /**
     * @en Calculate the interpolation result between this size and another one with given ratio
     * @zh 根据指定的插值比率，从当前尺寸到目标尺寸之间做插值。
     * @param to Target Size.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    lerp(to, ratio) {
        this.width += (to.width - this.width) * ratio;
        this.height += (to.height - this.height) * ratio;
        return this;
    }
    /**
     * @en Return the information of the current size in string
     * @zh 返回当前尺寸的字符串表示。
     * @returns The information of the current size in string
     */
    toString() {
        return `(${this.width.toFixed(2)}, ${this.height.toFixed(2)})`;
    }
}
Size.ZERO = Object.freeze(new Size(0, 0));
Size.ONE = Object.freeze(new Size(1, 1));
function size(width = 0, height = 0) {
    return new Size(width, height);
}

/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @en
 * A 2D rectangle defined by x, y position at the bottom-left corner and width, height.
 * All points inside the rectangle are greater than or equal to the minimum point and less than or equal to the maximum point.
 * The width is defined as xMax - xMin and the height is defined as yMax - yMin.
 * @zh
 * 该类表示一个二维矩形，由其左下角的 x、y 坐标以及宽度和高度组成。
 * 矩形内的所有点都大于等于矩形的最小点 (xMin, yMin) 并且小于等于矩形的最大点 (xMax, yMax)。
 * 矩形的宽度定义为 xMax - xMin；高度定义为 yMax - yMin。
 */
class Rect {
    /**
     * @en Creates a rectangle from two coordinate values.
     * @zh 由任意两个点创建一个矩形，目标矩形即是这两个点各向 x、y 轴作线所得到的矩形。
     * @param v1 Specified point 1.
     * @param v2 Specified point 2.
     * @returns Target rectangle.
     */
    static fromMinMax(out, v1, v2) {
        const minX = Math.min(v1.x, v2.x);
        const minY = Math.min(v1.y, v2.y);
        const maxX = Math.max(v1.x, v2.x);
        const maxY = Math.max(v1.y, v2.y);
        out.x = minX;
        out.y = minY;
        out.width = maxX - minX;
        out.height = maxY - minY;
        return out;
    }
    /**
     * @en Calculate the interpolation result between this rect and another one with given ratio
     * @zh 根据指定的插值比率，从当前矩形到目标矩形之间做插值。
     * @param out Output rect.
     * @param from Original rect.
     * @param to Target rect.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    static lerp(out, from, to, ratio) {
        const x = from.x;
        const y = from.y;
        const w = from.width;
        const h = from.height;
        out.x = x + (to.x - x) * ratio;
        out.y = y + (to.y - y) * ratio;
        out.width = w + (to.width - w) * ratio;
        out.height = h + (to.height - h) * ratio;
        return out;
    }
    /**
     * @en Returns the overlapping portion of 2 rectangles.
     * @zh 计算当前矩形与指定矩形重叠部分的矩形，将其赋值给输出矩形。
     * @param out Output Rect.
     * @param one One of the specify Rect.
     * @param other Another of the specify Rect.
     */
    static intersection(out, one, other) {
        const axMin = one.x;
        const ayMin = one.y;
        const axMax = one.x + one.width;
        const ayMax = one.y + one.height;
        const bxMin = other.x;
        const byMin = other.y;
        const bxMax = other.x + other.width;
        const byMax = other.y + other.height;
        out.x = Math.max(axMin, bxMin);
        out.y = Math.max(ayMin, byMin);
        out.width = Math.min(axMax, bxMax) - out.x;
        out.height = Math.min(ayMax, byMax) - out.y;
        return out;
    }
    /**
     * @en Returns the smallest rectangle that contains the current rect and the given rect.
     * @zh 创建同时包含当前矩形和指定矩形的最小矩形，将其赋值给输出矩形。
     * @param out Output Rect.
     * @param one One of the specify Rect.
     * @param other Another of the specify Rect.
     */
    static union(out, one, other) {
        const x = one.x;
        const y = one.y;
        const w = one.width;
        const h = one.height;
        const bx = other.x;
        const by = other.y;
        const bw = other.width;
        const bh = other.height;
        out.x = Math.min(x, bx);
        out.y = Math.min(y, by);
        out.width = Math.max(x + w, bx + bw) - out.x;
        out.height = Math.max(y + h, by + bh) - out.y;
        return out;
    }
    /**
     * @en Returns whether rect a is equal to rect b.
     * @zh 判断两个矩形是否相等。
     * @param a The first rect to be compared.
     * @param b The second rect to be compared.
     * @returns Returns `true' when the minimum and maximum values of both rectangles are equal, respectively; otherwise, returns `false'.
     */
    static equals(a, b) {
        return a.x === b.x
            && a.y === b.y
            && a.width === b.width
            && a.height === b.height;
    }
    /**
     * @en The minimum x value.
     * @zh 获取或设置矩形在 x 轴上的最小值。
     */
    get xMin() {
        return this.x;
    }
    set xMin(value) {
        this.width += this.x - value;
        this.x = value;
    }
    /**
     * @en The minimum y value.
     * @zh 获取或设置矩形在 y 轴上的最小值。
     */
    get yMin() {
        return this.y;
    }
    set yMin(value) {
        this.height += this.y - value;
        this.y = value;
    }
    /**
     * @en The maximum x value.
     * @zh 获取或设置矩形在 x 轴上的最大值。
     */
    get xMax() {
        return this.x + this.width;
    }
    set xMax(value) {
        this.width = value - this.x;
    }
    /**
     * @en The maximum y value.
     * @zh 获取或设置矩形在 y 轴上的最大值。
     */
    get yMax() {
        return this.y + this.height;
    }
    set yMax(value) {
        this.height = value - this.y;
    }
    /**
     * @en The position of the center of the rectangle.
     * @zh 获取或设置矩形中心点的坐标。
     */
    get center() {
        return new Vec2(this.x + this.width * 0.5, this.y + this.height * 0.5);
    }
    set center(value) {
        this.x = value.x - this.width * 0.5;
        this.y = value.y - this.height * 0.5;
    }
    /**
     * @en Returns a new [[Vec2]] object representing the position of the rectangle
     * @zh 获取或设置矩形的 x 和 y 坐标。
     */
    get origin() {
        return new Vec2(this.x, this.y);
    }
    set origin(value) {
        this.x = value.x;
        this.y = value.y;
    }
    /**
     * @en Returns a new [[Size]] object represents the width and height of the rectangle
     * @zh 获取或设置矩形的尺寸。
     */
    get size() {
        return new Size(this.width, this.height);
    }
    set size(value) {
        this.width = value.width;
        this.height = value.height;
    }
    // compatibility with vector interfaces
    set z(val) { this.width = val; }
    get z() { return this.width; }
    set w(val) { this.height = val; }
    get w() { return this.height; }
    constructor(x, y, width, height) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.width = x.width;
            this.height = x.height;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
        }
    }
    /**
     * @en clone the current Rect.
     * @zh 克隆当前矩形。
     */
    clone() {
        return new Rect(this.x, this.y, this.width, this.height);
    }
    set(x, y, width, height) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.width = x.width;
            this.height = x.height;
        }
        else {
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
        }
        return this;
    }
    /**
     * @en Check whether the current Rect equals another one.
     * @zh 判断当前矩形是否与指定矩形相等。
     * @param other Specified rectangles.
     * @returns Returns `true' when the minimum and maximum values of both rectangles are equal, respectively; otherwise, returns `false'.
     */
    equals(other) {
        return this.x === other.x
            && this.y === other.y
            && this.width === other.width
            && this.height === other.height;
    }
    /**
     * @en Calculate the interpolation result between this Rect and another one with given ratio.
     * @zh 根据指定的插值比率，从当前矩形到目标矩形之间做插值。
     * @param to Target Rect.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    lerp(to, ratio) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;
        this.x = x + (to.x - x) * ratio;
        this.y = y + (to.y - y) * ratio;
        this.width = w + (to.width - w) * ratio;
        this.height = h + (to.height - h) * ratio;
        return this;
    }
    /**
     * @en Return the information of the current rect in string
     * @zh 返回当前矩形的字符串表示。
     * @returns The information of the current rect in string
     */
    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.width.toFixed(2)}, ${this.height.toFixed(2)})`;
    }
    /**
     * @en Check whether the current rectangle intersects with the given one.
     * @zh 判断当前矩形是否与指定矩形相交。
     * @param other Specified rectangles.
     * @returns If intersected, return `true', otherwise return `false'.
     */
    intersects(other) {
        const maxax = this.x + this.width;
        const maxay = this.y + this.height;
        const maxbx = other.x + other.width;
        const maxby = other.y + other.height;
        return !(maxax < other.x || maxbx < this.x || maxay < other.y || maxby < this.y);
    }
    /**
     * @en Check whether the current rect contains the given point.
     * @zh 判断当前矩形是否包含指定的点。
     * @param point Specified point.
     * @returns The specified point is included in the rectangle and returns `true', otherwise it returns `false'.
     */
    contains(point) {
        return (this.x <= point.x
            && this.x + this.width >= point.x
            && this.y <= point.y
            && this.y + this.height >= point.y);
    }
    /**
     * @en Returns true if the other rect entirely inside this rectangle.
     * @zh 判断当前矩形是否包含指定矩形。
     * @param other Specified rectangles.
     * @returns Returns `true' if all the points of the specified rectangle are included in the current rectangle, `false' otherwise.
     */
    containsRect(other) {
        return (this.x <= other.x
            && this.x + this.width >= other.x + other.width
            && this.y <= other.y
            && this.y + this.height >= other.y + other.height);
    }
    /**
     * @en Apply matrix4 to the rect.
     * @zh
     * 应用矩阵变换到当前矩形：
     * 应用矩阵变换到当前矩形的最小点得到新的最小点，
     * 将当前矩形的尺寸视为二维向量应用矩阵变换得到新的尺寸；
     * 并将如此构成的新矩形。
     * @param matrix The matrix4
     */
    transformMat4(mat) {
        const ol = this.x;
        const ob = this.y;
        const or = ol + this.width;
        const ot = ob + this.height;
        const lbx = mat.m00 * ol + mat.m04 * ob + mat.m12;
        const lby = mat.m01 * ol + mat.m05 * ob + mat.m13;
        const rbx = mat.m00 * or + mat.m04 * ob + mat.m12;
        const rby = mat.m01 * or + mat.m05 * ob + mat.m13;
        const ltx = mat.m00 * ol + mat.m04 * ot + mat.m12;
        const lty = mat.m01 * ol + mat.m05 * ot + mat.m13;
        const rtx = mat.m00 * or + mat.m04 * ot + mat.m12;
        const rty = mat.m01 * or + mat.m05 * ot + mat.m13;
        const minX = Math.min(lbx, rbx, ltx, rtx);
        const maxX = Math.max(lbx, rbx, ltx, rtx);
        const minY = Math.min(lby, rby, lty, rty);
        const maxY = Math.max(lby, rby, lty, rty);
        this.x = minX;
        this.y = minY;
        this.width = maxX - minX;
        this.height = maxY - minY;
        return this;
    }
    /**
     * @en
     * Applies a matrix transformation to the current rectangle and outputs the result to the four vertices.
     * @zh
     * 应用矩阵变换到当前矩形，并将结果输出到四个顶点上。
     *
     * @param mat The mat4 to apply
     * @param out_lb The left bottom point
     * @param out_lt The left top point
     * @param out_rb The right bottom point
     * @param out_rt The right top point
     */
    transformMat4ToPoints(mat, out_lb, out_lt, out_rt, out_rb) {
        const ol = this.x;
        const ob = this.y;
        const or = ol + this.width;
        const ot = ob + this.height;
        out_lb.x = mat.m00 * ol + mat.m04 * ob + mat.m12;
        out_lb.y = mat.m01 * ol + mat.m05 * ob + mat.m13;
        out_rb.x = mat.m00 * or + mat.m04 * ob + mat.m12;
        out_rb.y = mat.m01 * or + mat.m05 * ob + mat.m13;
        out_lt.x = mat.m00 * ol + mat.m04 * ot + mat.m12;
        out_lt.y = mat.m01 * ol + mat.m05 * ot + mat.m13;
        out_rt.x = mat.m00 * or + mat.m04 * ot + mat.m12;
        out_rt.y = mat.m01 * or + mat.m05 * ot + mat.m13;
    }
}
function rect(x = 0, y = 0, width = 0, height = 0) {
    return new Rect(x, y, width, height);
}

/*
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
const toFloat = 1 / 255;
/**
 * @en Representation of RGBA colors.<br/>
 * Each color component is an integer value with a range from 0 to 255.<br/>
 * @zh 通过 Red、Green、Blue 颜色通道表示颜色，并通过 Alpha 通道表示不透明度。<br/>
 * 每个通道都为取值范围 [0, 255] 的整数。<br/>
 */
class Color {
    /**
     * @en Copy content of a color into another and save the results to out color.
     * @zh 获得指定颜色的拷贝
     */
    static clone(a) {
        const out = new Color();
        if (a._val) {
            out._val = a._val;
        }
        else {
            out._val = ((a.a << 24) >>> 0) + (a.b << 16) + (a.g << 8) + a.r;
        }
        return out;
    }
    /**
     * @en Clone a color and save the results to out color.
     * @zh 复制目标颜色
     */
    static copy(out, a) {
        out.r = a.r;
        out.g = a.g;
        out.b = a.b;
        out.a = a.a;
        return out;
    }
    /**
     * @en Set the components of a color to the given values and save the results to out color.
     * @zh 设置颜色值
     */
    static set(out, r, g, b, a) {
        out.r = r;
        out.g = g;
        out.b = b;
        out.a = a;
        return out;
    }
    /**
     * @en Convert linear color from rgb8 0~255 to Vec4 0~1
     * @zh 将当前颜色转换为到 Vec4
     * @returns Vec4 as float color value
     * @example
     * ```
     * const color = Color.YELLOW;
     * color.toVec4();
     * ```
     */
    static toVec4(color, out) {
        out = out !== undefined ? out : new Vec4();
        out.x = color.r * toFloat;
        out.y = color.g * toFloat;
        out.z = color.b * toFloat;
        out.w = color.a * toFloat;
        return out;
    }
    /**
     * @en Convert 8bit linear color from Vec4
     * @zh 使用 Vec4 设置 8 bit 颜色
     * @returns 8 Bit srgb value
     * @example
     * ```
     * color.fromVec4(new Vec4(1,1,1,1));
     * ```
     */
    static fromVec4(value, out) {
        out = out === undefined ? new Color() : out;
        out.r = Math.floor(value.x / toFloat);
        out.g = Math.floor(value.y / toFloat);
        out.b = Math.floor(value.z / toFloat);
        out.a = Math.floor(value.w / toFloat);
        return out;
    }
    /**
     * @en Converts the hexadecimal formal color into rgb formal and save the results to out color.
     * @zh 从十六进制颜色字符串中读入颜色到 out 中
     */
    static fromHEX(out, hexString) {
        hexString = (hexString.indexOf('#') === 0) ? hexString.substring(1) : hexString;
        out.r = parseInt(hexString.substr(0, 2), 16) || 0;
        out.g = parseInt(hexString.substr(2, 2), 16) || 0;
        out.b = parseInt(hexString.substr(4, 2), 16) || 0;
        const a = parseInt(hexString.substr(6, 2), 16);
        out.a = !Number.isNaN(a) ? a : 255;
        out._val = ((out.a << 24) >>> 0) + (out.b << 16) + (out.g << 8) + out.r;
        return out;
    }
    /**
     * @en Add two colors by components. And save the results to out color.
     * @zh 逐通道颜色加法
     */
    static add(out, a, b) {
        out.r = a.r + b.r;
        out.g = a.g + b.g;
        out.b = a.b + b.b;
        out.a = a.a + b.a;
        return out;
    }
    /**
     * @en Subtract each components of color b from each components of color a. And save the results to out color.
     * @zh 逐通道颜色减法
     */
    static subtract(out, a, b) {
        out.r = a.r - b.r;
        out.g = a.g - b.g;
        out.b = a.b - b.b;
        out.a = a.a - b.a;
        return out;
    }
    /**
     * @en Multiply each components of two colors. And save the results to out color.
     * @zh 逐通道颜色乘法
     */
    static multiply(out, a, b) {
        out.r = a.r * b.r;
        out.g = a.g * b.g;
        out.b = a.b * b.b;
        out.a = a.a * b.a;
        return out;
    }
    /**
     * @en Divide each components of color a by each components of color b. And save the results to out color.
     * @zh 逐通道颜色除法
     */
    static divide(out, a, b) {
        out.r = a.r / b.r;
        out.g = a.g / b.g;
        out.b = a.b / b.b;
        out.a = a.a / b.a;
        return out;
    }
    /**
     * @en Multiply all channels in a color with the given scale factor, and save the results to out color.
     * @zh 全通道统一缩放颜色
     */
    static scale(out, a, b) {
        out.r = a.r * b;
        out.g = a.g * b;
        out.b = a.b * b;
        out.a = a.a * b;
        return out;
    }
    /**
     * @en Performs a linear interpolation between two colors.
     * @zh 逐通道颜色线性插值：A + t * (B - A)
     */
    static lerp(out, from, to, ratio) {
        let r = from.r;
        let g = from.g;
        let b = from.b;
        let a = from.a;
        r += (to.r - r) * ratio;
        g += (to.g - g) * ratio;
        b += (to.b - b) * ratio;
        a += (to.a - a) * ratio;
        out._val = Math.floor(((a << 24) >>> 0) + (b << 16) + (g << 8) + r);
        return out;
    }
    /**
     * @en Convert a color object to a RGBA array, and save the results to out color.
     * @zh 颜色转数组
     * @param ofs Array Start Offset
     */
    static toArray(out, a, ofs = 0) {
        const scale = (a instanceof Color || a.a > 1) ? 1 / 255 : 1;
        out[ofs + 0] = a.r * scale;
        out[ofs + 1] = a.g * scale;
        out[ofs + 2] = a.b * scale;
        out[ofs + 3] = a.a * scale;
        return out;
    }
    /**
     * @en Sets the given color with RGBA values in an array, and save the results to out color.
     * @zh 数组转颜色
     * @param ofs Array Start Offset
     */
    static fromArray(arr, out, ofs = 0) {
        out.r = arr[ofs + 0] * 255;
        out.g = arr[ofs + 1] * 255;
        out.b = arr[ofs + 2] * 255;
        out.a = arr[ofs + 3] * 255;
        return out;
    }
    /**
     * @zh 从无符号 32 位整数构造颜色，高 8 位为 alpha 通道，次高 8 位为蓝色通道，次低 8 位为绿色通道，低 8 位为红色通道。
     * @en Construct color from a unsigned 32 bit integer, the highest 8 bits is for alpha channel, the second highest 8 bits is for blue channel,
     * the second lowest 8 bits is for green channel, and the lowest 8 bits if for red channel.
     *
     * @param out @en Output color object. @zh 输出的颜色对象。
     * @param uint32 @en The unsigned 32 bit integer @zh 32 位无符号整数
     * @returns @en The `out` object @zh `out` 对象
     */
    static fromUint32(out, uint32) {
        out._val = uint32;
        return out;
    }
    /**
     * @zh 转换当前颜色为无符号 32 位整数, 高 8 位为 alpha 通道，次高 8 位为蓝色通道，次低 8 位为绿色通道，低 8 位为红色通道。
     * @en Convert the current color to a unsigned 32 bit integer, the highest 8 bits is for alpha channel,
     * the second highest 8 bits is for blue channel, the second lowest 8 bits is for green channel, and the lowest 8 bits if for red channel.
     *
     * @param color @en The color. @zh 颜色。
     * @returns @en The converted unsigned 32 bit integer. @zh 32 位无符号整数。
     */
    static toUint32(color) {
        return color._val;
    }
    /**
     * @en Check whether the two given colors are identical
     * @zh 颜色等价判断
     */
    static strictEquals(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
    }
    /**
     * @en Check whether the two given colors are approximately equivalent. Difference of each channel is smaller that the epsilon.
     * @zh 排除浮点数误差的颜色近似等价判断
     */
    static equals(a, b, epsilon = EPSILON) {
        const hasInf = Math.abs(a.r) === Infinity || Math.abs(a.g) === Infinity || Math.abs(a.b) === Infinity || Math.abs(a.a) === Infinity;
        return !hasInf && (Math.abs(a.r - b.r) <= epsilon * Math.max(1.0, Math.abs(a.r), Math.abs(b.r))
            && Math.abs(a.g - b.g) <= epsilon * Math.max(1.0, Math.abs(a.g), Math.abs(b.g))
            && Math.abs(a.b - b.b) <= epsilon * Math.max(1.0, Math.abs(a.b), Math.abs(b.b))
            && Math.abs(a.a - b.a) <= epsilon * Math.max(1.0, Math.abs(a.a), Math.abs(b.a)));
    }
    /**
     * @en Convert the given color to a hex color value. And save the results to out color.
     * @zh 获取指定颜色的整型数据表示
     */
    static hex(a) {
        return ((a.r * 255) << 24 | (a.g * 255) << 16 | (a.b * 255) << 8 | a.a * 255) >>> 0;
    }
    /**
     * @en Get or set red channel value.
     * @zh 获取或设置当前颜色的 Red 通道。
     */
    get r() {
        return this._val & 0x000000ff;
    }
    set r(red) {
        red = ~~clamp(red, 0, 255);
        this._val = ((this._val & 0xffffff00) | red) >>> 0;
    }
    /**
     * @en Get or set green channel value.
     * @zh 获取或设置当前颜色的 Green 通道。
     */
    get g() {
        return (this._val & 0x0000ff00) >> 8;
    }
    set g(green) {
        green = ~~clamp(green, 0, 255);
        this._val = ((this._val & 0xffff00ff) | (green << 8)) >>> 0;
    }
    /**
     * @en Get or set blue channel value.
     * @zh 获取或设置当前颜色的 Blue 通道。
     */
    get b() {
        return (this._val & 0x00ff0000) >> 16;
    }
    set b(blue) {
        blue = ~~clamp(blue, 0, 255);
        this._val = ((this._val & 0xff00ffff) | (blue << 16)) >>> 0;
    }
    /** @en Get or set alpha channel value.
     * @zh 获取或设置当前颜色的透明度通道。
     */
    get a() {
        return (this._val & 0xff000000) >>> 24;
    }
    set a(alpha) {
        alpha = ~~clamp(alpha, 0, 255);
        this._val = ((this._val & 0x00ffffff) | (alpha << 24)) >>> 0;
    }
    // compatibility with vector interfaces
    get x() { return this.r * toFloat; }
    set x(value) { this.r = value * 255; }
    get y() { return this.g * toFloat; }
    set y(value) { this.g = value * 255; }
    get z() { return this.b * toFloat; }
    set z(value) { this.b = value * 255; }
    get w() { return this.a * toFloat; }
    set w(value) { this.a = value * 255; }
    constructor(r, g, b, a) {
        /**
         * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
         */
        this._val = 0;
        if (typeof r === 'string') {
            this.fromHEX(r);
        }
        else if (g !== undefined) {
            this.set(r, g, b, a);
        }
        else {
            this.set(r);
        }
    }
    /**
     * @en Clone a new color from the current color.
     * @zh 克隆当前颜色。
     */
    clone() {
        const ret = new Color();
        ret._val = this._val;
        return ret;
    }
    /**
     * @en Check whether the current color is identical with the given color
     * @zh 判断当前颜色是否与指定颜色相等。
     * @param other Specified color
     * @returns Returns `true` when all channels of both colours are equal; otherwise returns `false`.
     */
    equals(other) {
        return other && this._val === other._val;
    }
    /**
     * @en Calculate linear interpolation result between this color and another one with given ratio。
     * @zh 根据指定的插值比率，从当前颜色到目标颜色之间做插值。
     * @param to Target color
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    lerp(to, ratio) {
        let r = this.r;
        let g = this.g;
        let b = this.b;
        let a = this.a;
        r += (to.r - r) * ratio;
        g += (to.g - g) * ratio;
        b += (to.b - b) * ratio;
        a += (to.a - a) * ratio;
        this._val = Math.floor(((a << 24) >>> 0) + (b << 16) + (g << 8) + r);
        return this;
    }
    /**
     * @en Convert to string with color informations
     * @zh 返回当前颜色的字符串表示。
     * @returns A string representation of the current color.
     */
    toString() {
        return `rgba(${this.r.toFixed()}, ${this.g.toFixed()}, ${this.b.toFixed()}, ${this.a.toFixed()})`;
    }
    /**
     * @en Convert color to css format.
     * @zh 将当前颜色转换为 CSS 格式。
     * @param opt "rgba", "rgb", "#rgb" or "#rrggbb".
     * @returns CSS format for the current color.
     * @example
     * ```ts
     * let color = cc.Color.BLACK;
     * color.toCSS();          // "rgba(0,0,0,1.00)";
     * color.toCSS("rgba");    // "rgba(0,0,0,1.00)";
     * color.toCSS("rgb");     // "rgba(0,0,0)";
     * color.toCSS("#rgb");    // "#000";
     * color.toCSS("#rrggbb"); // "#000000";
     * ```
     */
    toCSS(opt = 'rgba') {
        if (opt === 'rgba') {
            return `rgba(${this.r},${this.g},${this.b},${(this.a * toFloat).toFixed(2)})`;
        }
        else if (opt === 'rgb') {
            return `rgb(${this.r},${this.g},${this.b})`;
        }
        else {
            return `#${this.toHEX(opt)}`;
        }
    }
    /**
     * @en Read hex string and store color data into the current color object, the hex string must be formatted as rgba or rgb.
     * @zh 从十六进制颜色字符串中读入当前颜色。<br/>
     * 十六进制颜色字符串应该以可选的 "#" 开头，紧跟最多 8 个代表十六进制数字的字符；<br/>
     * 每两个连续字符代表的数值依次作为 Red、Green、Blue 和 Alpha 通道；<br/>
     * 缺省的颜色通道将视为 0；缺省的透明通道将视为 255。<br/>
     * @param hexString the hex string
     * @returns `this`
     */
    fromHEX(hexString) {
        hexString = (hexString.indexOf('#') === 0) ? hexString.substring(1) : hexString;
        const r = parseInt(hexString.substr(0, 2), 16) || 0;
        const g = parseInt(hexString.substr(2, 2), 16) || 0;
        const b = parseInt(hexString.substr(4, 2), 16) || 0;
        let a = parseInt(hexString.substr(6, 2), 16);
        a = !Number.isNaN(a) ? a : 255;
        this._val = ((a << 24) >>> 0) + (b << 16) + (g << 8) + (r | 0);
        return this;
    }
    /**
     * @en convert Color to HEX color string.
     * @zh 转换当前颜色为十六进制颜色字符串。
     * @param fmt "#rrggbb" or "#rrggbbaa".
     * - `'#rrggbbaa'` obtains the hexadecimal value of the Red, Green, Blue, Alpha channels (**two**, high complement 0) and connects them sequentially.
     * - `'#rrggbb'` is similar to `'#rrggbbaa'` but does not include the Alpha channel.
     * @returns the Hex color string
     * @example
     * ```
     * const color = new Color(255, 14, 0, 255);
     * color.toHEX("#rgb");      // "f00";
     * color.toHEX("#rrggbbaa"); // "ff0e00ff"
     * color.toHEX("#rrggbb");   // "ff0e00"
     * ```
     */
    toHEX(fmt = '#rrggbb') {
        const prefix = '0';
        // #rrggbb
        const hex = [
            (this.r < 16 ? prefix : '') + (this.r).toString(16),
            (this.g < 16 ? prefix : '') + (this.g).toString(16),
            (this.b < 16 ? prefix : '') + (this.b).toString(16),
        ];
        if (fmt === '#rgb') {
            hex[0] = hex[0][0];
            hex[1] = hex[1][0];
            hex[2] = hex[2][0];
        }
        else if (fmt === '#rrggbbaa') {
            hex.push((this.a < 16 ? prefix : '') + (this.a).toString(16));
        }
        return hex.join('');
    }
    /**
     * @en Convert to rgb value.
     * @zh 将当前颜色转换为 RGB 整数值。
     * @returns RGB integer value. Starting from the lowest valid bit, each 8 bits is the value of the Red, Green, and Blue channels respectively.
     * @example
     * ```
     * const color = Color.YELLOW;
     * color.toRGBValue();
     * ```
     */
    toRGBValue() {
        return this._val & 0x00ffffff;
    }
    /**
     * @en Read HSV model color and convert to RGB color.
     * @zh 从 HSV 颜色中读入当前颜色。
     * @param h H value。
     * @param s S value。
     * @param v V value。
     * @returns `this`
     * @example
     * ```
     * const color = Color.YELLOW;
     * color.fromHSV(0, 0, 1); // Color {r: 255, g: 255, b: 255, a: 255};
     * ```
     */
    fromHSV(h, s, v) {
        let r = 0;
        let g = 0;
        let b = 0;
        if (s === 0) {
            r = g = b = v;
        }
        else if (v === 0) {
            r = g = b = 0;
        }
        else {
            if (h === 1) {
                h = 0;
            }
            h *= 6;
            const i = Math.floor(h);
            const f = h - i;
            const p = v * (1 - s);
            const q = v * (1 - (s * f));
            const t = v * (1 - (s * (1 - f)));
            switch (i) {
                default:
                // eslint-disable-next-line no-fallthrough
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }
        }
        r *= 255;
        g *= 255;
        b *= 255;
        this._val = ((this.a << 24) >>> 0) + (b << 16) + (g << 8) + (r | 0);
        return this;
    }
    /**
     * @en Transform to HSV model color.
     * @zh 转换当前颜色为 HSV 颜色。
     * @returns HSV format color
     * @example
     * ```
     * import { Color } from 'cc';
     * const color = Color.YELLOW;
     * color.toHSV(); // {h: 0.1533864541832669, s: 0.9843137254901961, v: 1}
     * ```
     */
    toHSV() {
        const r = this.r * toFloat;
        const g = this.g * toFloat;
        const b = this.b * toFloat;
        const hsv = { h: 0, s: 0, v: 0 };
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let delta = 0;
        hsv.v = max;
        hsv.s = max ? (max - min) / max : 0;
        if (!hsv.s) {
            hsv.h = 0;
        }
        else {
            delta = max - min;
            if (r === max) {
                hsv.h = (g - b) / delta;
            }
            else if (g === max) {
                hsv.h = 2 + (b - r) / delta;
            }
            else {
                hsv.h = 4 + (r - g) / delta;
            }
            hsv.h /= 6;
            if (hsv.h < 0) {
                hsv.h += 1.0;
            }
        }
        return hsv;
    }
    set(r, g, b, a) {
        if (typeof r === 'object') {
            if (r._val != null) {
                this._val = r._val;
            }
            else {
                g = r.g || 0;
                b = r.b || 0;
                a = typeof r.a === 'number' ? r.a : 255;
                r = r.r || 0;
                this._val = ((a << 24) >>> 0) + (b << 16) + (g << 8) + (r | 0);
            }
        }
        else {
            r = r || 0;
            g = g || 0;
            b = b || 0;
            a = typeof a === 'number' ? a : 255;
            this._val = ((a << 24) >>> 0) + (b << 16) + (g << 8) + (r | 0);
        }
        return this;
    }
    /**
     * @en Multiplies the current color by the specified color.
     * @zh 将当前颜色乘以与指定颜色
     * @param other The specified color.
     */
    multiply(other) {
        const r = ((this._val & 0x000000ff) * other.r) >> 8;
        const g = ((this._val & 0x0000ff00) * other.g) >> 8;
        const b = ((this._val & 0x00ff0000) * other.b) >> 8;
        const a = ((this._val & 0xff000000) >>> 8) * other.a;
        this._val = (a & 0xff000000) | (b & 0x00ff0000) | (g & 0x0000ff00) | (r & 0x000000ff);
        return this;
    }
    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    _set_r_unsafe(red) {
        this._val = ((this._val & 0xffffff00) | red) >>> 0;
        return this;
    }
    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    _set_g_unsafe(green) {
        this._val = ((this._val & 0xffff00ff) | (green << 8)) >>> 0;
        return this;
    }
    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    _set_b_unsafe(blue) {
        this._val = ((this._val & 0xff00ffff) | (blue << 16)) >>> 0;
        return this;
    }
    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    _set_a_unsafe(alpha) {
        this._val = ((this._val & 0x00ffffff) | (alpha << 24)) >>> 0;
        return this;
    }
}
Color.WHITE = Object.freeze(new Color(255, 255, 255, 255));
Color.GRAY = Object.freeze(new Color(127, 127, 127, 255));
Color.BLACK = Object.freeze(new Color(0, 0, 0, 255));
Color.TRANSPARENT = Object.freeze(new Color(0, 0, 0, 0));
Color.RED = Object.freeze(new Color(255, 0, 0, 255));
Color.GREEN = Object.freeze(new Color(0, 255, 0, 255));
Color.BLUE = Object.freeze(new Color(0, 0, 255, 255));
Color.CYAN = Object.freeze(new Color(0, 255, 255, 255));
Color.MAGENTA = Object.freeze(new Color(255, 0, 255, 255));
Color.YELLOW = Object.freeze(new Color(255, 255, 0, 255));
function color(r, g, b, a) {
    return new Color(r, g, b, a);
}

class AssetInfo {
    init(assetType, location) {
        location = this.parseLocation(assetType, location);
        const strs = location.split("/");
        let assetPath = '';
        for (let i = 1; i < strs.length; i++) {
            assetPath += strs[i];
            if (i != strs.length - 1) {
                assetPath += "/";
            }
        }
        this.bundleName = strs[0];
        this.assetPath = assetPath;
        this.assetType = assetType;
        this.uuid = `${location}.${assetType.name}`;
    }
    parseLocation(assetType, location) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        if (assetType == SpriteFrame) {
            if (!location.endsWith("spriteFrame")) {
                location += '/spriteFrame';
            }
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        else if (assetType == Texture2D) {
            if (!location.endsWith("texture")) {
                location += '/texture';
            }
        }
        return location;
    }
}

class AssetSystem {
    constructor() {
        this._waitLoads = [];
        this._loadingSet = new Set;
        this._frameAddCount = 0;
    }
    update() {
        this._frameAddCount = 0;
        this.updateLoadingSet();
    }
    addProvider(provider) {
        this._waitLoads.push(provider);
        this.updateLoadingSet();
    }
    updateLoadingSet() {
        // 这一帧添加的到达上限
        if (this._frameAddCount >= AssetSystem._frameMaxAddQueueProvider) {
            return;
        }
        // 同时加载的到达上限
        if (this._loadingSet.size >= AssetSystem._maxLoadingProvider) {
            return;
        }
        // 没有需要加载的
        if (this._waitLoads.length == 0) {
            return;
        }
        const provider = this._waitLoads.shift();
        this._loadingSet.add(provider);
        provider.internalLoad();
    }
    removeProvider(provider) {
        this._loadingSet.delete(provider);
        this.updateLoadingSet();
    }
}
/**
 * 同时加载的最大数量
 */
AssetSystem._maxLoadingProvider = 1;
/**
 * 每一帧最多添加几个到加载列表
 */
AssetSystem._frameMaxAddQueueProvider = 1;

const MoyeAssetTag = "MoyeAsset";

class AssetOperationHandle {
    constructor() {
        this.isDisposed = false;
    }
    getAsset(assetType) {
        return this.provider.asset;
    }
    dispose() {
        if (this.isDisposed) {
            coreError(MoyeAssetTag, '重复销毁AssetOperationHandle');
            return;
        }
        this.isDisposed = true;
        this.provider.releaseHandle(this);
    }
    instantiateSync() {
        const node = instantiate(this.provider.asset);
        return node;
    }
    async instantiateAsync() {
        const node = instantiate(this.provider.asset);
        return node;
    }
}

class BundleAssetProvider {
    constructor() {
        this.refCount = 0;
        this._handleSet = new Set;
    }
    async internalLoad() {
        const assetPath = this.assetInfo.assetPath;
        const assetType = this.assetInfo.assetType;
        this.bundleAsset.bundle.load(assetPath, assetType, (err, asset) => {
            if (err) {
                coreError(MoyeAssetTag, '加载资源错误:{0},{1}', this.assetInfo.uuid, err);
            }
            else {
                this.asset = asset;
            }
            this._task.setResult();
            this.assetSystem.removeProvider(this);
        });
    }
    async load() {
        this._task = Task.create();
        this.assetSystem.addProvider(this);
        await this._task;
    }
    createHandle() {
        // 引用计数增加
        this.refCount++;
        const handle = new AssetOperationHandle;
        handle.provider = this;
        this._handleSet.add(handle);
        return handle;
    }
    releaseHandle(handle) {
        if (this.refCount <= 0) {
            coreWarn(MoyeAssetTag, "Asset provider reference count is already zero. There may be resource leaks !");
        }
        if (this._handleSet.delete(handle) == false) {
            coreError(MoyeAssetTag, "Should never get here !");
        }
        // 引用计数减少
        this.refCount--;
    }
}

var AssetLockType;
(function (AssetLockType) {
    AssetLockType["BUNDLE_ASSET_LOAD"] = "bundle_asset_load";
    AssetLockType["BUNDLE_LOAD"] = "bundle_load";
})(AssetLockType || (AssetLockType = {}));

class BundleAsset {
    constructor() {
        this.refCount = 0;
        this.isAutoRelease = true;
        this._providerMap = new Map;
    }
    async loadAssetAsync(assetInfo) {
        let provider = this._providerMap.get(assetInfo.uuid);
        if (!provider) {
            provider = await this.createProvider(assetInfo);
        }
        const handle = provider.createHandle();
        return handle;
    }
    async createProvider(assetInfo) {
        const lock = await CoroutineLock.get().wait(AssetLockType.BUNDLE_ASSET_LOAD, assetInfo.uuid);
        try {
            let provider = this._providerMap.get(assetInfo.uuid);
            if (provider) {
                return provider;
            }
            provider = new BundleAssetProvider;
            provider.assetInfo = assetInfo;
            provider.assetSystem = this.assetSystem;
            provider.bundleAsset = this;
            this.refCount++;
            await provider.load();
            this._providerMap.set(assetInfo.uuid, provider);
            return provider;
        }
        finally {
            lock.dispose();
        }
    }
    unloadUnusedAssets() {
        for (const [key, provider] of this._providerMap) {
            if (provider.refCount != 0) {
                continue;
            }
            this.bundle.release(provider.assetInfo.assetPath, provider.assetInfo.assetType);
            this._providerMap.delete(key);
            this.refCount--;
        }
    }
}

class MoyeAssets extends Singleton {
    awake() {
        MoyeAssets.assetSystem = new AssetSystem;
    }
    update() {
        MoyeAssets.assetSystem.update();
    }
    static async loadAssetAsync(assetType, location) {
        try {
            const assetInfo = new AssetInfo();
            assetInfo.init(assetType, location);
            const bundleName = assetInfo.bundleName;
            let bundleAsset = MoyeAssets._bundleMap.get(bundleName);
            if (!bundleAsset) {
                bundleAsset = await this.loadBundleAsync(bundleName);
            }
            const assetOperationHandle = await bundleAsset.loadAssetAsync(assetInfo);
            return assetOperationHandle;
        }
        catch (e) {
            coreError(MoyeAssetTag, e);
        }
    }
    static async loadBundleAsync(bundleName) {
        const lock = await CoroutineLock.get().wait(AssetLockType.BUNDLE_LOAD, bundleName);
        try {
            let bundleAsset = MoyeAssets._bundleMap.get(bundleName);
            if (bundleAsset) {
                return bundleAsset;
            }
            const task = Task.create();
            if (!this._bundlePathMap.has(bundleName)) {
                this._bundlePathMap.set(bundleName, bundleName);
                if (NATIVE) {
                    // check hot
                    const writePath = native.fileUtils.getWritablePath();
                    const bundlePath = `${writePath}hot/${bundleName}`;
                    if (native.fileUtils.isDirectoryExist(bundlePath)) {
                        this._bundlePathMap.set(bundleName, bundlePath);
                    }
                }
            }
            const bundlePath = this._bundlePathMap.get(bundleName);
            coreLog(MoyeAssetTag, '加载bundle: {0}', bundlePath);
            assetManager.loadBundle(bundlePath, (err, bundle) => {
                if (err) {
                    coreLog(MoyeAssetTag, '加载Bundle错误, bundle={0}, error={1}', bundleName, err);
                }
                else {
                    coreLog(MoyeAssetTag, '加载Bundle完成, bundle={0}', bundleName);
                }
                task.setResult(bundle);
            });
            const bundle = await task;
            bundleAsset = new BundleAsset;
            bundleAsset.bundle = bundle;
            bundleAsset.bundleName = bundleName;
            bundleAsset.assetSystem = MoyeAssets.assetSystem;
            MoyeAssets._bundleMap.set(bundleName, bundleAsset);
            return bundleAsset;
        }
        finally {
            lock.dispose();
        }
    }
    static releaseBundle(bundleAsset) {
        if (bundleAsset.refCount != 0) {
            coreError(MoyeAssetTag, '释放的bundle:{0}, 引用计数不为0', bundleAsset.bundleName);
            return;
        }
        this._bundleMap.delete(bundleAsset.bundleName);
        assetManager.removeBundle(bundleAsset.bundle);
        coreLog(MoyeAssetTag, '卸载bundle:{0}', bundleAsset.bundleName);
    }
    static unloadUnusedAssets() {
        for (const [name, bundleAsset] of this._bundleMap) {
            bundleAsset.unloadUnusedAssets();
            if (bundleAsset.refCount != 0) {
                continue;
            }
            if (!bundleAsset.isAutoRelease) {
                continue;
            }
            MoyeAssets.releaseBundle(bundleAsset);
        }
    }
}
MoyeAssets._bundleMap = new Map();
MoyeAssets._bundlePathMap = new Map();

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AfterProgramInitHandler = class AfterProgramInitHandler extends AEventHandler {
    run(scene, args) {
        Game.addSingleton(MoyeAssets);
    }
};
AfterProgramInitHandler = __decorate$5([
    EventDecorator(AfterProgramInit, SceneType.NONE)
], AfterProgramInitHandler);

/**
 * button async listener
 * wait for the callback to complete
 */
class AsyncButtonListener {
    constructor(func) {
        this._callback = func;
    }
    async invoke(...args) {
        if (this._isClick) {
            return;
        }
        this._isClick = true;
        await this._callback(...args);
        this._isClick = false;
    }
    static create(func) {
        const listener = new AsyncButtonListener(func);
        return listener.invoke.bind(listener);
    }
}

const ViewDecoratorType = "ViewDecorator";
function ViewDecorator(name, layer, viewCfg) {
    return function (target) {
        DecoratorCollector.inst.add(ViewDecoratorType, target, name, layer, viewCfg);
    };
}

var ViewLayer;
(function (ViewLayer) {
    /**
     * 场景UI，如：点击建筑查看建筑信息---一般置于场景之上，界面UI之下
     */
    ViewLayer[ViewLayer["SCENE"] = 1] = "SCENE";
    /**
     * 背景UI，如：主界面---一般情况下用户不能主动关闭，永远处于其它UI的最底层
     */
    ViewLayer[ViewLayer["BACKGROUND"] = 2] = "BACKGROUND";
    /**
     * 普通UI，一级、二级、三级等窗口---一般由用户点击打开的多级窗口
     */
    ViewLayer[ViewLayer["NORMAL"] = 3] = "NORMAL";
    /**
     * 信息UI---如：跑马灯、广播等---一般永远置于用户打开窗口顶层
     */
    ViewLayer[ViewLayer["INFO"] = 4] = "INFO";
    /**
     * 提示UI，如：错误弹窗，网络连接弹窗等
     */
    ViewLayer[ViewLayer["TIPS"] = 5] = "TIPS";
    /**
     * 顶层UI，如：场景加载
     */
    ViewLayer[ViewLayer["TOP"] = 6] = "TOP";
})(ViewLayer || (ViewLayer = {}));

class ViewCleanCom extends Entity {
    constructor() {
        super(...arguments);
        this._views = new Set;
    }
    init(viewMgr) {
        this._viewMgr = viewMgr;
        return this;
    }
    add(viewName) {
        this._views.add(viewName);
    }
    remove(viewName) {
        this._views.delete(viewName);
    }
    destroy() {
        for (const viewName of this._views) {
            this._viewMgr.hide(viewName);
        }
    }
}

const MoyeViewTag = "MoyeView";

const viewLoadLock = "MoyeViewLoadLock";
class MoyeViewMgr extends Entity {
    constructor() {
        super(...arguments);
        /**
         * all views
         */
        this._views = new Map();
        this._type2Names = new Map();
        this._showingViews = new Set();
        this._hideViews = new Set();
        this._viewCfgs = new Map();
        this._layers = new Map();
        this._checkInterval = 5 * 1000;
    }
    awake() {
        MoyeViewMgr.inst = this;
    }
    destroy() {
        if (this._checkTimerId != null) {
            TimerMgr.get().remove(this._checkTimerId);
            this._checkTimerId = null;
        }
        MoyeViewMgr.inst = null;
    }
    /**
     * init view manager
     * @param uiRoot
     * @param globalViewCfg all field need to set
     * @returns
     */
    init(uiRoot, globalViewCfg) {
        if (this._uiRoot != null) {
            return coreError(MoyeViewTag, 'MoyeViewMgr is already inited');
        }
        this._uiRoot = uiRoot;
        this._globalViewCfgType = globalViewCfg;
        this.reload();
        this._checkTimerId = TimerMgr.get().newRepeatedTimer(this._checkInterval, this.check.bind(this));
        return this;
    }
    async show(nameOrType, bindEntity) {
        let name;
        if (typeof nameOrType == 'string') {
            name = nameOrType;
        }
        else {
            name = this._type2Names.get(nameOrType);
        }
        if (JsHelper.isNullOrEmpty(name)) {
            coreError(MoyeViewTag, 'MoyeView name is null or empty, name={0}', name);
            return;
        }
        const lock = await CoroutineLock.get().wait(viewLoadLock, name);
        coreLog(MoyeViewTag, 'show view, name={0}', name);
        try {
            if (this._uiRoot == null) {
                throw new Error('MoyeViewMgr is not inited');
            }
            if (this._showingViews.has(name)) {
                const view = this._views.get(name);
                return view;
            }
            if (this._views.has(name)) {
                const view = this._views.get(name);
                await this.enterViewShow(view, bindEntity);
                return view;
            }
            const viewCfg = this._viewCfgs.get(name);
            const node = await viewCfg.load(name);
            const layerNode = this.getLayerNode(viewCfg.layer);
            node.parent = layerNode;
            const view = this.addCom(viewCfg.viewType);
            view.node = node;
            view.layer = viewCfg.layer;
            view.viewName = name;
            view['onLoad']?.();
            view['_viewMgr'] = this;
            this._views.set(name, view);
            await this.enterViewShow(view, bindEntity);
            return view;
        }
        catch (e) {
            coreError(MoyeViewTag, 'show view errr, {0}', e);
        }
        finally {
            lock.dispose();
        }
    }
    async hide(name) {
        const lock = await CoroutineLock.get().wait(viewLoadLock, name);
        coreLog(MoyeViewTag, 'hide view, name={0}', name);
        try {
            if (!this._showingViews.has(name)) {
                return;
            }
            const view = this._views.get(name);
            await this.enterViewHide(view);
        }
        catch (e) {
            coreError(MoyeViewTag, 'hide view errr, {0}', e);
        }
        finally {
            lock.dispose();
        }
    }
    /**
     * reload confog
     */
    reload() {
        const list = DecoratorCollector.inst.get(ViewDecoratorType);
        for (const args of list) {
            const viewType = args[0];
            const name = args[1];
            const layer = args[2];
            const viewCfgType = args[3];
            if (this._viewCfgs.has(name)) {
                continue;
            }
            let viewCfg;
            if (viewCfgType != null) {
                viewCfg = new viewCfgType();
            }
            else {
                viewCfg = new this._globalViewCfgType;
            }
            viewCfg.layer = layer;
            viewCfg.name = name;
            viewCfg.viewType = viewType;
            viewCfg.cleanEntitys = new Set();
            this._type2Names.set(viewType, name);
            this._viewCfgs.set(name, viewCfg);
        }
    }
    check() {
        const nowTime = TimeInfo.get().clientNow();
        for (const name of this._hideViews) {
            const cfg = this._viewCfgs.get(name);
            if (nowTime >= cfg.expireTime) {
                this.enterViewDestroy(this._views.get(name));
            }
        }
    }
    getLayerNode(layer) {
        let layerNode = this._layers.get(layer);
        if (layerNode == null) {
            layerNode = new Node();
            layerNode.name = ViewLayer[layer];
            layerNode.parent = this._uiRoot;
            layerNode.setSiblingIndex(layer);
            this._layers.set(layer, layerNode);
            const size = this._uiRoot.getComponent(UITransform).contentSize;
            layerNode.addComponent(UITransform).setContentSize(size);
        }
        return layerNode;
    }
    addToCleanCom(entity, viewName) {
        if (entity == null) {
            return;
        }
        let cleanCom = entity.getCom(ViewCleanCom);
        const viewCfg = this._viewCfgs.get(viewName);
        if (cleanCom == null) {
            cleanCom = entity.addCom(ViewCleanCom).init(this);
        }
        viewCfg.cleanEntitys.add(cleanCom);
        cleanCom.add(viewName);
    }
    async enterViewShow(view, bindEntity) {
        view.node.active = true;
        view.bringToFront();
        const cfg = this._viewCfgs.get(view.viewName);
        if (cfg.doShowAnimation != null) {
            const task = Task.create();
            cfg.doShowAnimation(view, task);
            await task;
        }
        this._showingViews.add(view.viewName);
        this._hideViews.delete(view.viewName);
        this.addToCleanCom(bindEntity, view.viewName);
        view['onShow']?.();
    }
    async enterViewHide(view) {
        const cfg = this._viewCfgs.get(view.viewName);
        if (cfg.doHideAnimation != null) {
            const task = Task.create();
            cfg.doHideAnimation(view, task);
            await task;
        }
        view['onHide']?.();
        view.node.active = false;
        this._hideViews.add(view.viewName);
        this._showingViews.delete(view.viewName);
        for (const cleanCom of cfg.cleanEntitys) {
            cleanCom.remove(view.viewName);
        }
        cfg.cleanEntitys.clear();
        cfg.expireTime = TimeInfo.get().clientNow() + (cfg.expire);
    }
    enterViewDestroy(view) {
        view['_realDispose']();
        view.node.destroy();
        this._views.delete(view.viewName);
        this._hideViews.delete(view.viewName);
        const cfg = this._viewCfgs.get(view.viewName);
        cfg.destroy();
    }
}

class AMoyeView extends Entity {
    _realDispose() {
        super.dispose();
    }
    dispose() {
        this._viewMgr.hide(this.viewName);
    }
    bringToFront() {
        this.node.setSiblingIndex(-1);
    }
}

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$4, property: property$4, menu: menu$4 } = _decorator;
let SizeFollow = class SizeFollow extends Component {
    constructor() {
        super(...arguments);
        this._heightFollow = true;
        this._widthFollow = true;
        this._heightOffset = 0;
        this._widthOffset = 0;
        this._changeSize = new Size$1();
    }
    get target() {
        return this._target;
    }
    set target(value) {
        this._target = value;
        this.updateSizeOffset();
    }
    set heightFollow(val) {
        this._heightFollow = val;
        this.updateSizeOffset();
    }
    get heightFollow() {
        return this._heightFollow;
    }
    set widthFollow(val) {
        this._widthFollow = val;
        this.updateSizeOffset();
    }
    get widthFollow() {
        return this._widthFollow;
    }
    onLoad() {
        if (this._target == null) {
            return;
        }
        this._target.node.on(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
    }
    onDestroy() {
        if (this._target == null) {
            return;
        }
        if (!this._target.isValid) {
            this._target = null;
            return;
        }
        this._target.node.off(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
        this._target = null;
    }
    onTargetSizeChange() {
        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;
        // console.log('onTargetSizeChange targetTrans', targetTrans);
        // console.log('onTargetSizeChange targetTrans.height', targetTrans.height);
        // console.log('onTargetSizeChange this._heightOffset', this._heightOffset);
        // console.log('onTargetSizeChange this._heightFollow', this._heightFollow);
        this._changeSize.set(selfTrans.contentSize);
        if (this._widthFollow) {
            this._changeSize.width = Math.max(0, targetTrans.width + this._widthOffset);
        }
        if (this._heightFollow) {
            this._changeSize.height = Math.max(0, targetTrans.height + this._heightOffset);
        }
        // console.log('onTargetSizeChange this._changeSize', this._changeSize);
        // console.log('onTargetSizeChange this.node', this.node);
        selfTrans.setContentSize(this._changeSize);
        // selfTrans.setContentSize(new Size(this._changeSize));
        // selfTrans.height = 300;
    }
    updateSizeOffset() {
        if (this._target == null) {
            return;
        }
        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;
        if (this._widthFollow) {
            const selfWidth = selfTrans.width;
            const targetWidth = targetTrans.width;
            this._widthOffset = selfWidth - targetWidth;
        }
        if (this._heightFollow) {
            const selfHeight = selfTrans.height;
            const targetHeight = targetTrans.height;
            this._heightOffset = selfHeight - targetHeight;
        }
    }
};
__decorate$4([
    property$4({ type: UITransform })
], SizeFollow.prototype, "target", null);
__decorate$4([
    property$4({ type: UITransform })
], SizeFollow.prototype, "_target", void 0);
__decorate$4([
    property$4
], SizeFollow.prototype, "heightFollow", null);
__decorate$4([
    property$4
], SizeFollow.prototype, "_heightFollow", void 0);
__decorate$4([
    property$4
], SizeFollow.prototype, "widthFollow", null);
__decorate$4([
    property$4
], SizeFollow.prototype, "_widthFollow", void 0);
__decorate$4([
    property$4({ type: CCFloat })
], SizeFollow.prototype, "_heightOffset", void 0);
__decorate$4([
    property$4({ type: CCFloat })
], SizeFollow.prototype, "_widthOffset", void 0);
SizeFollow = __decorate$4([
    ccclass$4('SizeFollow'),
    menu$4('moye/SizeFollow')
], SizeFollow);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$3, property: property$3, executeInEditMode, menu: menu$3 } = _decorator;
var WidgetBase;
(function (WidgetBase) {
    WidgetBase[WidgetBase["LEFT"] = 1] = "LEFT";
    WidgetBase[WidgetBase["RIGHT"] = 2] = "RIGHT";
    WidgetBase[WidgetBase["TOP"] = 3] = "TOP";
    WidgetBase[WidgetBase["BOTTOM"] = 4] = "BOTTOM";
})(WidgetBase || (WidgetBase = {}));
var WidgetDirection;
(function (WidgetDirection) {
    WidgetDirection[WidgetDirection["LEFT"] = 1] = "LEFT";
    WidgetDirection[WidgetDirection["RIGHT"] = 2] = "RIGHT";
    WidgetDirection[WidgetDirection["TOP"] = 3] = "TOP";
    WidgetDirection[WidgetDirection["BOTTOM"] = 4] = "BOTTOM";
    WidgetDirection[WidgetDirection["LEFT_EXTEND"] = 5] = "LEFT_EXTEND";
    WidgetDirection[WidgetDirection["RIGHT_EXTEND"] = 6] = "RIGHT_EXTEND";
    WidgetDirection[WidgetDirection["TOP_EXTEND"] = 7] = "TOP_EXTEND";
    WidgetDirection[WidgetDirection["BOTTOM_EXTEND"] = 8] = "BOTTOM_EXTEND";
})(WidgetDirection || (WidgetDirection = {}));
/**
 * 关联组件
 * 不允许直系亲属互相关联
 * 同父支持size跟pos关联
 * 异父仅支持pos关联 size关联未做测试
 */
let CTWidget = class CTWidget extends Component {
    constructor() {
        super(...arguments);
        this._targetDir = WidgetDirection.TOP;
        this._dir = WidgetDirection.TOP;
        this.visibleOffset = 0;
        this._isVertical = true;
        this._distance = 0;
        this._changePos = new Vec3$1(0, 0, 0);
        this._targetOldPos = new Vec3$1(0, 0, 0);
        this._targetOldSize = 0;
        this._selfOldPos = new Vec3$1(0, 0, 0);
        this._selfOldSize = 0;
    }
    get target() {
        return this._target;
    }
    set target(value) {
        this._target = value;
        this.unregisterEvt();
        this.registerEvt();
        this.updateData();
    }
    // 目标方向
    set targetDir(val) {
        if (!EDITOR) {
            return;
        }
        if (val == WidgetDirection.LEFT ||
            val == WidgetDirection.RIGHT) {
            switch (this._dir) {
                case WidgetDirection.TOP:
                case WidgetDirection.TOP_EXTEND:
                case WidgetDirection.BOTTOM:
                case WidgetDirection.BOTTOM_EXTEND:
                    this._dir = WidgetDirection.LEFT;
            }
            this._isVertical = false;
        }
        else {
            switch (this._dir) {
                case WidgetDirection.LEFT:
                case WidgetDirection.LEFT_EXTEND:
                case WidgetDirection.RIGHT:
                case WidgetDirection.RIGHT_EXTEND:
                    this._dir = WidgetDirection.TOP;
            }
            this._isVertical = true;
        }
        this._targetDir = val;
        this.updateData();
    }
    get targetDir() {
        return this._targetDir;
    }
    // 自身方向
    set dir(val) {
        if (!EDITOR) {
            return;
        }
        switch (val) {
            case WidgetDirection.LEFT:
            case WidgetDirection.LEFT_EXTEND:
            case WidgetDirection.RIGHT:
            case WidgetDirection.RIGHT_EXTEND: {
                switch (this._targetDir) {
                    case WidgetDirection.TOP:
                    case WidgetDirection.BOTTOM:
                        {
                            this._targetDir = WidgetDirection.LEFT;
                        }
                        break;
                }
                this._isVertical = false;
                break;
            }
            case WidgetDirection.TOP:
            case WidgetDirection.TOP_EXTEND:
            case WidgetDirection.BOTTOM:
            case WidgetDirection.BOTTOM_EXTEND: {
                switch (this._targetDir) {
                    case WidgetDirection.LEFT:
                    case WidgetDirection.RIGHT:
                        {
                            this._targetDir = WidgetDirection.TOP;
                        }
                        break;
                }
                this._isVertical = true;
                break;
            }
        }
        this._dir = val;
        this.updateData();
    }
    get dir() {
        return this._dir;
    }
    onEnable() {
        if (!EDITOR) {
            return;
        }
        this.registerEvt();
        this.updateData();
    }
    onDisable() {
        if (!EDITOR) {
            return;
        }
        this.unregisterEvt();
    }
    onLoad() {
        this._trans = this.node.getComponent(UITransform);
        if (EDITOR) {
            return;
        }
        this.registerEvt();
    }
    onDestroy() {
        if (EDITOR) {
            return;
        }
        this.unregisterEvt();
        this._trans = null;
        this._target = null;
        this._changePos = null;
    }
    registerEvt() {
        if (!this._target) {
            return;
        }
        if (EDITOR) {
            this._target.node.on(NodeEventType.ANCHOR_CHANGED, this.updateData, this);
            this.node.on(NodeEventType.TRANSFORM_CHANGED, this.updateData, this);
            this.node.on(NodeEventType.SIZE_CHANGED, this.updateData, this);
        }
        this._target.node.on(NodeEventType.SIZE_CHANGED, this.onTargetChange, this);
        this._target.node.on(NodeEventType.TRANSFORM_CHANGED, this.onTargetChange, this);
        this._target.node.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onTargetChange, this);
    }
    unregisterEvt() {
        if (!this._target) {
            return;
        }
        if (!this._target.isValid) {
            return;
        }
        if (EDITOR) {
            this._target.node.off(NodeEventType.ANCHOR_CHANGED, this.updateData, this);
            this.node.off(NodeEventType.TRANSFORM_CHANGED, this.updateData, this);
            this.node.off(NodeEventType.SIZE_CHANGED, this.updateData, this);
        }
        this._target.node.off(NodeEventType.SIZE_CHANGED, this.onTargetChange, this);
        this._target.node.off(NodeEventType.TRANSFORM_CHANGED, this.onTargetChange, this);
        this._target.node.off(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onTargetChange, this);
    }
    updateData() {
        if (this._target == null) {
            return;
        }
        switch (this._dir) {
            case WidgetDirection.TOP:
            case WidgetDirection.BOTTOM:
            case WidgetDirection.LEFT:
            case WidgetDirection.RIGHT:
                this.updateDistance();
                break;
            case WidgetDirection.TOP_EXTEND:
            case WidgetDirection.BOTTOM_EXTEND:
            case WidgetDirection.LEFT_EXTEND:
            case WidgetDirection.RIGHT_EXTEND:
                this.updateTargetPos();
                break;
        }
    }
    onTargetChange() {
        if (this._target == null) {
            return;
        }
        switch (this._dir) {
            case WidgetDirection.TOP:
            case WidgetDirection.BOTTOM:
            case WidgetDirection.LEFT:
            case WidgetDirection.RIGHT:
                this.updatePos();
                break;
            case WidgetDirection.TOP_EXTEND:
            case WidgetDirection.BOTTOM_EXTEND:
            case WidgetDirection.LEFT_EXTEND:
            case WidgetDirection.RIGHT_EXTEND:
                this.updateSize();
                break;
        }
    }
    updateSize() {
        if (this._isVertical) {
            const posChange = this._targetOldPos.y - this._target.node.position.y;
            let sizeChange = this._target.height - this._targetOldSize;
            const anchorY = this._trans.anchorY;
            this._changePos.set(this._selfOldPos);
            if (this._target.getComponent(Label) && !this._target.node.active) {
                sizeChange = this._targetOldSize;
            }
            const realChange = posChange + sizeChange;
            this._trans.height = this._selfOldSize + realChange;
            if (this._dir == WidgetDirection.TOP_EXTEND) {
                this.node.setPosition(this._changePos);
            }
            else if (this._dir == WidgetDirection.BOTTOM_EXTEND) {
                this._changePos.y -= (realChange * (1 - anchorY));
                this.node.setPosition(v3$1(this._changePos));
            }
        }
    }
    updatePos() {
        const selfTrans = this._trans;
        const targetTrans = this._target;
        const targetPos = this.getPos(targetTrans, this._targetDir);
        let pos = targetPos - this._distance;
        this._changePos.set(this.node.worldPosition);
        if (this._isVertical) {
            switch (this._dir) {
                case WidgetDirection.TOP: {
                    const height = selfTrans.height;
                    const anchorY = selfTrans.anchorY;
                    pos -= height * (1 - anchorY);
                    break;
                }
                case WidgetDirection.BOTTOM: {
                    const height = selfTrans.height;
                    const anchorY = selfTrans.anchorY;
                    pos += height * anchorY;
                    break;
                }
            }
            this._changePos.y = pos;
        }
        else {
            this._changePos.x = pos;
            // todo
        }
        this.node.worldPosition = this._changePos;
    }
    updateTargetPos() {
        if (EDITOR) {
            if (this._changePos == null) {
                console.error('编辑器数据错乱, 请重新添加本组件');
                this._changePos = v3$1();
            }
        }
        this.target.node.getPosition(this._targetOldPos);
        this.node.getPosition(this._selfOldPos);
        if (this._isVertical) {
            this._selfOldSize = this._trans.height;
            this._targetOldSize = this._target.height;
        }
        else {
            this._selfOldSize = this._trans.width;
            this._targetOldSize = this._target.height;
        }
    }
    updateDistance() {
        if (!EDITOR) {
            return;
        }
        if (this._target == null) {
            return;
        }
        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;
        const selfPos = this.getPos(selfTrans, this._dir);
        const targetPos = this.getPos(targetTrans, this._targetDir);
        this._distance = targetPos - selfPos;
    }
    getPos(trans, dir) {
        if (this._isVertical) {
            let y = trans.node.worldPosition.y;
            const height = trans.height;
            const anchorY = trans.anchorY;
            switch (dir) {
                case WidgetDirection.TOP:
                case WidgetDirection.TOP_EXTEND:
                    if (!trans.node.active) {
                        y = y - height - this.visibleOffset;
                    }
                    return y + height * (1 - anchorY);
                case WidgetDirection.BOTTOM:
                case WidgetDirection.BOTTOM_EXTEND:
                    if (!trans.node.active) {
                        y = y + height + this.visibleOffset;
                    }
                    return y - height * anchorY;
            }
        }
        else {
            const x = trans.node.worldPosition.x;
            const width = trans.width;
            const anchorX = trans.anchorX;
            switch (dir) {
                case WidgetDirection.LEFT:
                    return x - width * anchorX;
                case WidgetDirection.RIGHT:
                    return x + width * (1 - anchorX);
            }
        }
    }
};
__decorate$3([
    property$3({ type: UITransform })
], CTWidget.prototype, "target", null);
__decorate$3([
    property$3({ type: UITransform })
], CTWidget.prototype, "_target", void 0);
__decorate$3([
    property$3({ type: Enum(WidgetBase) })
], CTWidget.prototype, "targetDir", null);
__decorate$3([
    property$3
], CTWidget.prototype, "_targetDir", void 0);
__decorate$3([
    property$3({ type: Enum(WidgetDirection) })
], CTWidget.prototype, "dir", null);
__decorate$3([
    property$3
], CTWidget.prototype, "_dir", void 0);
__decorate$3([
    property$3({ type: CCFloat })
], CTWidget.prototype, "visibleOffset", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_isVertical", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_distance", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_changePos", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_targetOldPos", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_targetOldSize", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_selfOldPos", void 0);
__decorate$3([
    property$3
], CTWidget.prototype, "_selfOldSize", void 0);
CTWidget = __decorate$3([
    ccclass$3('CTWidget'),
    menu$3('moye/CTWidget'),
    executeInEditMode
], CTWidget);

const RoundBoxAssembler = {
    // 根据圆角segments参数，构造网格的顶点索引列表
    GetIndexBuffer(sprite) {
        const indexBuffer = [
            0, 1, 2, 2, 3, 0,
            4, 5, 6, 6, 7, 4,
            8, 9, 10, 10, 11, 8
        ];
        // 为四个角的扇形push进索引值
        let index = 12;
        const fanIndexBuild = function (center, start, end) {
            let last = start;
            for (let i = 0; i < sprite.segments - 1; i++) {
                // 左上角 p2为扇形圆心，p1/p5为两个边界
                const cur = index;
                index++;
                indexBuffer.push(center, last, cur);
                last = cur;
            }
            indexBuffer.push(center, last, end);
        };
        if (sprite.leftBottom)
            fanIndexBuild(3, 4, 0);
        if (sprite.leftTop)
            fanIndexBuild(2, 1, 5);
        if (sprite.rightTop)
            fanIndexBuild(9, 6, 10);
        if (sprite.rightBottom)
            fanIndexBuild(8, 11, 7);
        return indexBuffer;
    },
    createData(sprite) {
        const renderData = sprite.requestRenderData();
        let corner = 0;
        corner += sprite.leftBottom ? 1 : 0;
        corner += sprite.leftTop ? 1 : 0;
        corner += sprite.rightTop ? 1 : 0;
        corner += sprite.rightBottom ? 1 : 0;
        const vNum = 12 + (sprite.segments - 1) * corner;
        renderData.dataLength = vNum;
        renderData.resize(vNum, 18 + sprite.segments * 3 * corner);
        const indexBuffer = RoundBoxAssembler.GetIndexBuffer(sprite);
        renderData.chunk.setIndexBuffer(indexBuffer);
        return renderData;
    },
    // 照抄simple的
    updateRenderData(sprite) {
        const frame = sprite.spriteFrame;
        dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
        this.updateUVs(sprite); // dirty need
        //this.updateColor(sprite);// dirty need
        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            renderData.updateRenderData(sprite, frame);
        }
    },
    // 局部坐标转世界坐标 照抄的，不用改
    updateWorldVerts(sprite, chunk) {
        const renderData = sprite.renderData;
        const vData = chunk.vb;
        const dataList = renderData.data;
        const node = sprite.node;
        const m = node.worldMatrix;
        const stride = renderData.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; i++) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m.m03 * x + m.m07 * y + m.m15;
            rhw = rhw ? 1 / rhw : 1;
            offset = i * stride;
            vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
            vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
            vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
        }
    },
    // 每帧调用的，把数据和到一整个meshbuffer里
    fillBuffers(sprite) {
        if (sprite === null) {
            return;
        }
        const renderData = sprite.renderData;
        const chunk = renderData.chunk;
        if (sprite.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(sprite, chunk);
            renderData.vertDirty = false;
        }
        // quick version
        chunk.bufferId;
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;
        const vid = vidOrigin;
        // 沿着当前这个位置往后将我们这个对象的index放进去
        const indexBuffer = RoundBoxAssembler.GetIndexBuffer(sprite);
        for (let i = 0; i < renderData.indexCount; i++) {
            ib[indexOffset++] = vid + indexBuffer[i];
        }
        meshBuffer.indexOffset += renderData.indexCount;
    },
    // 计算每个顶点相对于sprite坐标的位置
    updateVertexData(sprite) {
        const renderData = sprite.renderData;
        if (!renderData) {
            return;
        }
        const uiTrans = sprite.node._uiProps.uiTransformComp;
        const dataList = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        const left = 0 - appX;
        const right = cw - appX;
        const top = ch - appY;
        const bottom = 0 - appY;
        const left_r = left + sprite.radius;
        const bottom_r = bottom + sprite.radius;
        const top_r = top - sprite.radius;
        const right_r = right - sprite.radius;
        // 三个矩形的顶点
        dataList[0].x = left;
        dataList[0].y = sprite.leftBottom ? bottom_r : bottom;
        dataList[1].x = left;
        dataList[1].y = sprite.leftTop ? top_r : top;
        dataList[2].x = left_r;
        dataList[2].y = sprite.leftTop ? top_r : top;
        dataList[3].x = left_r;
        dataList[3].y = sprite.leftBottom ? bottom_r : bottom;
        dataList[4].x = left_r;
        dataList[4].y = bottom;
        dataList[5].x = left_r;
        dataList[5].y = top;
        dataList[6].x = right_r;
        dataList[6].y = top;
        dataList[7].x = right_r;
        dataList[7].y = bottom;
        dataList[8].x = right_r;
        dataList[8].y = sprite.rightBottom ? bottom_r : bottom;
        dataList[9].x = right_r;
        dataList[9].y = sprite.rightTop ? top_r : top;
        dataList[10].x = right;
        dataList[10].y = sprite.rightTop ? top_r : top;
        dataList[11].x = right;
        dataList[11].y = sprite.rightBottom ? bottom_r : bottom;
        // 扇形圆角的顶点
        let index = 12;
        const fanPosBuild = function (center, startAngle) {
            for (let i = 1; i < sprite.segments; i++) {
                // 我这里顶点都是按顺时针分配的，所以角度要从开始角度减
                // 每个扇形都是90度
                const angle = startAngle * Math.PI / 180 - i / sprite.segments * 0.5 * Math.PI;
                dataList[index].x = center.x + Math.cos(angle) * sprite.radius;
                dataList[index].y = center.y + Math.sin(angle) * sprite.radius;
                index++;
            }
        };
        if (sprite.leftBottom)
            fanPosBuild(dataList[3], 270);
        if (sprite.leftTop)
            fanPosBuild(dataList[2], 180);
        if (sprite.rightTop)
            fanPosBuild(dataList[9], 90);
        if (sprite.rightBottom)
            fanPosBuild(dataList[8], 0);
        renderData.vertDirty = true;
    },
    // 更新计算uv
    updateUVs(sprite) {
        if (!sprite.spriteFrame)
            return;
        const renderData = sprite.renderData;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;
        // 这里我打印了一下uv的值，第一个看上去是左上角，但其实，opengl端的纹理存在上下颠倒问题，所以这里其实还是左下角
        // 左下，右下，左上，右上
        const uv_l = uv[0];
        const uv_b = uv[1];
        const uv_r = uv[2];
        const uv_t = uv[5];
        const uv_w = Math.abs(uv_r - uv_l);
        const uv_h = uv_t - uv_b;
        const uiTrans = sprite.node._uiProps.uiTransformComp;
        const dataList = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        // 用相对坐标，计算uv
        for (let i = 0; i < renderData.dataLength; i++) {
            vData[i * renderData.floatStride + 3] = uv_l + (dataList[i].x + appX) / cw * uv_w;
            vData[i * renderData.floatStride + 4] = uv_b + (dataList[i].y + appY) / ch * uv_h;
        }
    },
    // 照抄，不用改
    updateColor(sprite) {
        const renderData = sprite.renderData;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < renderData.dataLength; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },
};

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$2, property: property$2, type, menu: menu$2 } = _decorator;
var EventType;
(function (EventType) {
    EventType["SPRITE_FRAME_CHANGED"] = "spriteframe-changed";
})(EventType || (EventType = {}));
let RoundBoxSprite = class RoundBoxSprite extends UIRenderer {
    constructor() {
        super(...arguments);
        // 尺寸模式，可以看枚举原本定义的地方有注释说明
        this._sizeMode = Sprite.SizeMode.TRIMMED;
        // 图集
        this._atlas = null;
        // 圆角用三角形模拟扇形的线段数量，越大，则越圆滑
        this._segments = 10;
        // 圆角半径
        this._radius = 20;
        this._spriteFrame = null;
        this._leftTop = true;
        this._rightTop = true;
        this._leftBottom = true;
        this._rightBottom = true;
    }
    get sizeMode() {
        return this._sizeMode;
    }
    set sizeMode(value) {
        if (this._sizeMode === value) {
            return;
        }
        this._sizeMode = value;
        if (value !== Sprite.SizeMode.CUSTOM) {
            this._applySpriteSize();
        }
    }
    get spriteAtlas() {
        return this._atlas;
    }
    set spriteAtlas(value) {
        if (this._atlas === value) {
            return;
        }
        this._atlas = value;
    }
    get segments() {
        return this._segments;
    }
    set segments(segments) {
        this._segments = segments;
        this._renderData = null;
        this._flushAssembler();
    }
    get radius() {
        return this._radius;
    }
    set radius(radius) {
        this._radius = radius;
        this._updateUVs();
        this.markForUpdateRenderData(true);
    }
    get spriteFrame() {
        return this._spriteFrame;
    }
    set spriteFrame(value) {
        if (this._spriteFrame === value) {
            return;
        }
        const lastSprite = this._spriteFrame;
        this._spriteFrame = value;
        this.markForUpdateRenderData();
        this._applySpriteFrame(lastSprite);
        if (EDITOR) {
            this.node.emit(EventType.SPRITE_FRAME_CHANGED, this);
        }
    }
    get leftTop() {
        return this._leftTop;
    }
    set leftTop(value) {
        this._leftTop = value;
        this.resetAssembler();
    }
    get rightTop() {
        return this._rightTop;
    }
    set rightTop(value) {
        this._rightTop = value;
        this.resetAssembler();
    }
    get leftBottom() {
        return this._leftBottom;
    }
    set leftBottom(value) {
        this._leftBottom = value;
        this.resetAssembler();
    }
    get rightBottom() {
        return this._rightBottom;
    }
    set rightBottom(value) {
        this._rightBottom = value;
        this.resetAssembler();
    }
    onLoad() {
        this._flushAssembler();
    }
    __preload() {
        this.changeMaterialForDefine();
        super.__preload();
        if (EDITOR) {
            this._resized();
            this.node.on(NodeEventType.SIZE_CHANGED, this._resized, this);
        }
    }
    onEnable() {
        super.onEnable();
        // Force update uv, material define, active material, etc
        this._activateMaterial();
        const spriteFrame = this._spriteFrame;
        if (spriteFrame) {
            this._updateUVs();
        }
    }
    onDestroy() {
        if (EDITOR) {
            this.node.off(NodeEventType.SIZE_CHANGED, this._resized, this);
        }
        super.onDestroy();
    }
    /**
     * @en
     * Quickly switch to other sprite frame in the sprite atlas.
     * If there is no atlas, the switch fails.
     *
     * @zh
     * 选取使用精灵图集中的其他精灵。
     * @param name @en Name of the spriteFrame to switch. @zh 要切换的 spriteFrame 名字。
     */
    changeSpriteFrameFromAtlas(name) {
        if (!this._atlas) {
            console.warn('SpriteAtlas is null.');
            return;
        }
        const sprite = this._atlas.getSpriteFrame(name);
        this.spriteFrame = sprite;
    }
    /**
     * @deprecated Since v3.7.0, this is an engine private interface that will be removed in the future.
     */
    changeMaterialForDefine() {
        let texture;
        const lastInstanceMaterialType = this._instanceMaterialType;
        if (this._spriteFrame) {
            texture = this._spriteFrame.texture;
        }
        let value = false;
        if (texture instanceof cclegacy.TextureBase) {
            const format = texture.getPixelFormat();
            value = (format === cclegacy.TextureBase.PixelFormat.RGBA_ETC1 || format === cclegacy.TextureBase.PixelFormat.RGB_A_PVRTC_4BPPV1 || format === cclegacy.TextureBase.PixelFormat.RGB_A_PVRTC_2BPPV1);
        }
        if (value) {
            this._instanceMaterialType = InstanceMaterialType.USE_ALPHA_SEPARATED;
        }
        else {
            this._instanceMaterialType = InstanceMaterialType.ADD_COLOR_AND_TEXTURE;
        }
        if (lastInstanceMaterialType !== this._instanceMaterialType) {
            // this.updateMaterial();
            // d.ts里没有注上这个函数，直接调用会表红。
            this["updateMaterial"]();
        }
    }
    _updateBuiltinMaterial() {
        let mat = super._updateBuiltinMaterial();
        if (this.spriteFrame && this.spriteFrame.texture instanceof RenderTexture) {
            const defines = { SAMPLE_FROM_RT: true, ...mat.passes[0].defines };
            const renderMat = new Material();
            renderMat.initialize({
                effectAsset: mat.effectAsset,
                defines,
            });
            mat = renderMat;
        }
        return mat;
    }
    _render(render) {
        render.commitComp(this, this.renderData, this._spriteFrame, this._assembler, null);
    }
    _canRender() {
        if (!super._canRender()) {
            return false;
        }
        const spriteFrame = this._spriteFrame;
        if (!spriteFrame || !spriteFrame.texture) {
            return false;
        }
        return true;
    }
    resetAssembler() {
        this._assembler = null;
        this._flushAssembler();
    }
    _flushAssembler() {
        const assembler = RoundBoxAssembler;
        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }
        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this._renderData.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                if (this.spriteFrame) {
                    this._assembler.updateRenderData(this);
                }
                this._updateColor();
            }
        }
    }
    _applySpriteSize() {
        if (this._spriteFrame) {
            if (BUILD || !this._spriteFrame) {
                if (Sprite.SizeMode.RAW === this._sizeMode) {
                    const size = this._spriteFrame.originalSize;
                    this.node._uiProps.uiTransformComp.setContentSize(size);
                }
                else if (Sprite.SizeMode.TRIMMED === this._sizeMode) {
                    const rect = this._spriteFrame.rect;
                    this.node._uiProps.uiTransformComp.setContentSize(rect.width, rect.height);
                }
            }
            this.markForUpdateRenderData(true);
            this._assembler.updateRenderData(this);
        }
    }
    _resized() {
        if (!EDITOR) {
            return;
        }
        if (this._spriteFrame) {
            const actualSize = this.node._uiProps.uiTransformComp.contentSize;
            let expectedW = actualSize.width;
            let expectedH = actualSize.height;
            if (this._sizeMode === Sprite.SizeMode.RAW) {
                const size = this._spriteFrame.originalSize;
                expectedW = size.width;
                expectedH = size.height;
            }
            else if (this._sizeMode === Sprite.SizeMode.TRIMMED) {
                const rect = this._spriteFrame.rect;
                expectedW = rect.width;
                expectedH = rect.height;
            }
            if (expectedW !== actualSize.width || expectedH !== actualSize.height) {
                this._sizeMode = Sprite.SizeMode.CUSTOM;
            }
        }
    }
    _activateMaterial() {
        const spriteFrame = this._spriteFrame;
        const material = this.getRenderMaterial(0);
        if (spriteFrame) {
            if (material) {
                this.markForUpdateRenderData();
            }
        }
        if (this.renderData) {
            this.renderData.material = material;
        }
    }
    _updateUVs() {
        if (this._assembler) {
            this._assembler.updateUVs(this);
        }
    }
    _applySpriteFrame(oldFrame) {
        const spriteFrame = this._spriteFrame;
        let textureChanged = false;
        if (spriteFrame) {
            if (!oldFrame || oldFrame.texture !== spriteFrame.texture) {
                textureChanged = true;
            }
            if (textureChanged) {
                if (this.renderData)
                    this.renderData.textureDirty = true;
                this.changeMaterialForDefine();
            }
            this._applySpriteSize();
        }
    }
};
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_sizeMode", void 0);
__decorate$2([
    type(Sprite.SizeMode)
], RoundBoxSprite.prototype, "sizeMode", null);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_atlas", void 0);
__decorate$2([
    type(SpriteAtlas)
], RoundBoxSprite.prototype, "spriteAtlas", null);
__decorate$2([
    property$2({ type: CCInteger, serializable: true })
], RoundBoxSprite.prototype, "_segments", void 0);
__decorate$2([
    property$2({ type: CCInteger, serializable: true, min: 1 })
], RoundBoxSprite.prototype, "segments", null);
__decorate$2([
    property$2({ type: CCFloat, serializable: true })
], RoundBoxSprite.prototype, "_radius", void 0);
__decorate$2([
    property$2({ type: CCFloat, serializable: true, min: 0 })
], RoundBoxSprite.prototype, "radius", null);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_spriteFrame", void 0);
__decorate$2([
    type(SpriteFrame)
], RoundBoxSprite.prototype, "spriteFrame", null);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_leftTop", void 0);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "leftTop", null);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_rightTop", void 0);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "rightTop", null);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_leftBottom", void 0);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "leftBottom", null);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "_rightBottom", void 0);
__decorate$2([
    property$2({ serializable: true })
], RoundBoxSprite.prototype, "rightBottom", null);
RoundBoxSprite = __decorate$2([
    ccclass$2('RoundBoxSprite'),
    menu$2('moye/RoundBoxSprite')
], RoundBoxSprite);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$1, property: property$1, menu: menu$1 } = _decorator;
/**
 * 全局事件监听实例
 */
const instance = new EventTarget();
const SET_JOYSTICK_TYPE = "SET_JOYSTICK_TYPE";
/**
 * 方向类型
 */
var DirectionType;
(function (DirectionType) {
    DirectionType[DirectionType["FOUR"] = 0] = "FOUR";
    DirectionType[DirectionType["EIGHT"] = 1] = "EIGHT";
    DirectionType[DirectionType["ALL"] = 2] = "ALL";
})(DirectionType || (DirectionType = {}));
/**
 * 速度类型
 */
var SpeedType;
(function (SpeedType) {
    SpeedType[SpeedType["STOP"] = 0] = "STOP";
    SpeedType[SpeedType["NORMAL"] = 1] = "NORMAL";
    SpeedType[SpeedType["FAST"] = 2] = "FAST";
})(SpeedType || (SpeedType = {}));
/**
 * 摇杆类型
 */
var JoystickType;
(function (JoystickType) {
    JoystickType[JoystickType["FIXED"] = 0] = "FIXED";
    JoystickType[JoystickType["FOLLOW"] = 1] = "FOLLOW";
})(JoystickType || (JoystickType = {}));
/**
 * 摇杆类
 */
let YYJJoystick = class YYJJoystick extends Component {
    constructor() {
        super(...arguments);
        this.dot = null;
        this.ring = null;
        this.joystickType = JoystickType.FIXED;
        this.directionType = DirectionType.ALL;
        this._stickPos = new Vec3$1();
        this._touchLocation = new Vec2$1();
        this.radius = 50;
    }
    onLoad() {
        if (!this.dot) {
            console.warn("Joystick Dot is null!");
            return;
        }
        if (!this.ring) {
            console.warn("Joystick Ring is null!");
            return;
        }
        const uiTransform = this.ring.getComponent(UITransform);
        const size = this.radius * 2;
        const ringSize = new Size$1(size, size);
        uiTransform?.setContentSize(ringSize);
        this.ring
            .getChildByName("bg")
            .getComponent(UITransform)
            ?.setContentSize(ringSize);
        this._initTouchEvent();
        // hide joystick when follow
        const uiOpacity = this.node.getComponent(UIOpacity);
        if (this.joystickType === JoystickType.FOLLOW && uiOpacity) {
            uiOpacity.opacity = 0;
        }
    }
    /**
     * 启用时
     */
    onEnable() {
        instance.on(SET_JOYSTICK_TYPE, this._onSetJoystickType, this);
    }
    /**
     * 禁用时
     */
    onDisable() {
        instance.off(SET_JOYSTICK_TYPE, this._onSetJoystickType, this);
    }
    /**
     * 改变摇杆类型
     * @param type
     */
    _onSetJoystickType(type) {
        this.joystickType = type;
        const uiOpacity = this.node.getComponent(UIOpacity);
        if (uiOpacity) {
            uiOpacity.opacity = type === JoystickType.FIXED ? 255 : 0;
        }
    }
    /**
     * 初始化触摸事件
     */
    _initTouchEvent() {
        // set the size of joystick node to control scale
        this.node.on(Input.EventType.TOUCH_START, this._touchStartEvent, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this._touchMoveEvent, this);
        this.node.on(Input.EventType.TOUCH_END, this._touchEndEvent, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this._touchEndEvent, this);
    }
    /**
     * 触摸开始回调函数
     * @param event
     */
    _touchStartEvent(event) {
        if (!this.ring || !this.dot)
            return;
        instance.emit(Input.EventType.TOUCH_START, event);
        const location = event.getUILocation();
        const touchPos = new Vec3$1(location.x, location.y);
        if (this.joystickType === JoystickType.FIXED) {
            this._stickPos = this.ring.getPosition();
            // 相对中心的向量
            const moveVec = touchPos.subtract(this.ring.getPosition());
            // 触摸点与圆圈中心的距离
            const distance = moveVec.length();
            // 手指在圆圈内触摸,控杆跟随触摸点
            if (this.radius > distance) {
                this.dot.setPosition(moveVec);
            }
        }
        else if (this.joystickType === JoystickType.FOLLOW) {
            // 记录摇杆位置，给 touch move 使用
            this._stickPos = touchPos;
            this.node.getComponent(UIOpacity).opacity = 255;
            this._touchLocation = event.getUILocation();
            // 更改摇杆的位置
            this.ring.setPosition(touchPos);
            this.dot.setPosition(new Vec3$1());
        }
    }
    /**
     * 触摸移动回调函数
     * @param event
     */
    _touchMoveEvent(event) {
        if (!this.dot || !this.ring)
            return;
        // 如果 touch start 位置和 touch move 相同，禁止移动
        if (this.joystickType === JoystickType.FOLLOW &&
            this._touchLocation === event.getUILocation()) {
            return false;
        }
        // 以圆圈为锚点获取触摸坐标
        const location = event.getUILocation();
        const touchPos = new Vec3$1(location.x, location.y);
        // move vector
        const moveVec = touchPos.subtract(this.ring.getPosition());
        const distance = moveVec.length();
        let speedType = SpeedType.NORMAL;
        if (this.radius > distance) {
            this.dot.setPosition(moveVec);
            speedType = SpeedType.NORMAL;
        }
        else {
            // 控杆永远保持在圈内，并在圈内跟随触摸更新角度
            this.dot.setPosition(moveVec.normalize().multiplyScalar(this.radius));
            speedType = SpeedType.FAST;
        }
        instance.emit(Input.EventType.TOUCH_MOVE, event, {
            speedType,
            moveVec: moveVec.normalize(),
        });
    }
    /**
     * 触摸结束回调函数
     * @param event
     */
    _touchEndEvent(event) {
        if (!this.dot || !this.ring)
            return;
        this.dot.setPosition(new Vec3$1());
        if (this.joystickType === JoystickType.FOLLOW) {
            this.node.getComponent(UIOpacity).opacity = 0;
        }
        instance.emit(Input.EventType.TOUCH_END, event, {
            speedType: SpeedType.STOP,
        });
    }
};
__decorate$1([
    property$1({
        type: Node,
        displayName: "Dot",
        tooltip: "摇杆操纵点",
    })
], YYJJoystick.prototype, "dot", void 0);
__decorate$1([
    property$1({
        type: Node,
        displayName: "Ring",
        tooltip: "摇杆背景节点",
    })
], YYJJoystick.prototype, "ring", void 0);
__decorate$1([
    property$1({
        type: Enum(JoystickType),
        displayName: "Touch Type",
        tooltip: "触摸类型",
    })
], YYJJoystick.prototype, "joystickType", void 0);
__decorate$1([
    property$1({
        type: Enum(DirectionType),
        displayName: "Direction Type",
        tooltip: "方向类型",
    })
], YYJJoystick.prototype, "directionType", void 0);
__decorate$1([
    property$1({
        type: Vec3$1,
        tooltip: "摇杆所在位置",
    })
], YYJJoystick.prototype, "_stickPos", void 0);
__decorate$1([
    property$1({
        type: Vec2$1,
        tooltip: "触摸位置",
    })
], YYJJoystick.prototype, "_touchLocation", void 0);
__decorate$1([
    property$1({
        type: CCInteger,
        displayName: "Ring Radius",
        tooltip: "半径",
    })
], YYJJoystick.prototype, "radius", void 0);
YYJJoystick = __decorate$1([
    ccclass$1("YYJJoystick"),
    menu$1('moye/YYJJoystick')
], YYJJoystick);

class YYJJoystickCom extends Entity {
    constructor() {
        super(...arguments);
        /**
         * "移动方向"
         */
        this.moveDir = new Vec3$1(0, 1, 0);
        /**
         * 速度级别
         */
        this._speedType = SpeedType.STOP;
        /**
         * 移动速度
         */
        this._moveSpeed = 0;
        /**
         * 停止时速度
         */
        this.stopSpeed = 0;
        /**
         * 正常速度
         */
        this.normalSpeed = 100;
        /**
         * 最快速度
         */
        this.fastSpeed = 200;
        /**
         * 是否设置角度
         */
        this.isRotation = true;
    }
    init(entity) {
        this._entity = entity;
        instance.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        return this;
    }
    destroy() {
        instance.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    onTouchStart() { }
    onTouchMove(event, data) {
        const oldSpeedType = this._speedType;
        this._speedType = data.speedType;
        this.moveDir = data.moveVec;
        this.onSetMoveSpeed(this._speedType);
        if (oldSpeedType !== this._speedType) {
            this._entity.speedChange(this._speedType, this._moveSpeed);
        }
    }
    onTouchEnd(event, data) {
        const oldSpeedType = this._speedType;
        this._speedType = data.speedType;
        this.onSetMoveSpeed(this._speedType);
        if (oldSpeedType !== this._speedType) {
            this._entity.speedChange(this._speedType, this._moveSpeed);
        }
    }
    /**
    * set moveSpeed by SpeedType
    * @param speedType
    */
    onSetMoveSpeed(speedType) {
        switch (speedType) {
            case SpeedType.STOP:
                this._moveSpeed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._moveSpeed = this.normalSpeed;
                break;
            case SpeedType.FAST:
                this._moveSpeed = this.fastSpeed;
                break;
        }
    }
    /**
     * 移动
     */
    move() {
        if (this.isRotation) {
            this._entity.setAngle(misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x)) - 90);
        }
        const oldPos = this._entity.getPos();
        const newPos = oldPos.add(
        // fps: 60
        this.moveDir.clone().multiplyScalar(this._moveSpeed / 60));
        this._entity.setPos(newPos);
    }
    update() {
        if (this._speedType !== SpeedType.STOP) {
            this.move();
        }
    }
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass, property, menu } = _decorator;
// PhysicsSystem2D.instance.enable = true;
let YYJJoystickPlayer = class YYJJoystickPlayer extends Component {
    constructor() {
        super(...arguments);
        this.rigidbody = false;
        // from joystick
        this.moveDir = new Vec3$1(0, 1, 0);
        this._speedType = SpeedType.STOP;
        // from self
        this._moveSpeed = 0;
        this.stopSpeed = 0;
        this.normalSpeed = 100;
        this.fastSpeed = 200;
        this.isRotation = true;
        this._body = null;
    }
    onLoad() {
        if (this.rigidbody) {
            this._body = this.node.getComponent(RigidBody2D);
        }
        instance.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    onTouchStart() { }
    onTouchMove(event, data) {
        this._speedType = data.speedType;
        this.moveDir = data.moveVec;
        this.onSetMoveSpeed(this._speedType);
    }
    onTouchEnd(event, data) {
        this._speedType = data.speedType;
        this.onSetMoveSpeed(this._speedType);
    }
    /**
     * set moveSpeed by SpeedType
     * @param speedType
     */
    onSetMoveSpeed(speedType) {
        switch (speedType) {
            case SpeedType.STOP:
                this._moveSpeed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._moveSpeed = this.normalSpeed;
                break;
            case SpeedType.FAST:
                this._moveSpeed = this.fastSpeed;
                break;
        }
    }
    /**
     * 移动
     */
    move() {
        if (this.isRotation) {
            this.node.angle =
                misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x)) - 90;
        }
        if (this.rigidbody && this._body) {
            const moveVec = this.moveDir.clone().multiplyScalar(this._moveSpeed / 20);
            const force = new Vec2$1(moveVec.x, moveVec.y);
            this._body.applyForceToCenter(force, true);
        }
        else {
            const oldPos = this.node.getPosition();
            const newPos = oldPos.add(
            // fps: 60
            this.moveDir.clone().multiplyScalar(this._moveSpeed / 60));
            // console.log(this._moveSpeed / 60);
            this.node.setPosition(newPos);
            // console.log(newPos);
        }
    }
    update(deltaTime) {
        if (this._speedType !== SpeedType.STOP) {
            this.move();
        }
    }
};
__decorate([
    property({
        displayName: "刚体模式",
        tooltip: "不会立即停止",
    })
], YYJJoystickPlayer.prototype, "rigidbody", void 0);
__decorate([
    property({
        displayName: "Move Dir",
        tooltip: "移动方向",
    })
], YYJJoystickPlayer.prototype, "moveDir", void 0);
__decorate([
    property({
        tooltip: "速度级别",
    })
], YYJJoystickPlayer.prototype, "_speedType", void 0);
__decorate([
    property({
        type: CCInteger,
        tooltip: "移动速度",
    })
], YYJJoystickPlayer.prototype, "_moveSpeed", void 0);
__decorate([
    property({
        type: CCInteger,
        tooltip: "停止时速度",
    })
], YYJJoystickPlayer.prototype, "stopSpeed", void 0);
__decorate([
    property({
        type: CCInteger,
        tooltip: "正常速度",
    })
], YYJJoystickPlayer.prototype, "normalSpeed", void 0);
__decorate([
    property({
        type: CCInteger,
        tooltip: "最快速度",
    })
], YYJJoystickPlayer.prototype, "fastSpeed", void 0);
__decorate([
    property({
        type: CCBoolean,
        tooltip: "最快速度",
    })
], YYJJoystickPlayer.prototype, "isRotation", void 0);
YYJJoystickPlayer = __decorate([
    ccclass("YYJJoystickPlayer"),
    menu('moye/YYJJoystickPlayer')
], YYJJoystickPlayer);

export { AEvent, AEventHandler, AMoyeView, AffineTransform, AfterCreateClientScene, AfterCreateCurrentScene, AfterProgramInit, AfterProgramStart, AfterSingletonAdd, AssetOperationHandle, AsyncButtonListener, BeforeProgramInit, BeforeProgramStart, BeforeSingletonAdd, BundleAsset, CTWidget, CancellationToken, CancellationTokenTag, Color, CoroutineLock, CoroutineLockItem, CoroutineLockTag, DecoratorCollector, DirectionType, EPSILON, Entity, EntityCenter, EventDecorator, EventDecoratorType, EventHandlerTag, EventSystem, Game, HALF_PI, IdGenerator, IdStruct, InstanceIdStruct, JoystickType, JsHelper, Logger, Mat3, Mat4, MoyeAssets, MoyeViewMgr, ObjectPool, Options, Program, Quat, Rect, RecycleObj, Root, RoundBoxSprite, SET_JOYSTICK_TYPE, Scene, SceneFactory, SceneRefCom, SceneType, Singleton, Size, SizeFollow, SpeedType, TWO_PI, Task, TimeHelper, TimeInfo, TimerMgr, Vec2, Vec3, Vec4, ViewDecorator, ViewDecoratorType, ViewLayer, YYJJoystick, YYJJoystickCom, absMax, absMaxComponent, approx, bits, clamp, clamp01, color, enumerableProps, equals, error, floatToHalf, halfToFloat, instance, inverseLerp, lerp, log, mat4, nextPow2, pingPong, preTransforms, pseudoRandom, pseudoRandomRange, pseudoRandomRangeInt, quat, random, randomRange, randomRangeInt, rect, repeat, safeCall, setRandGenerator, size, toDegree, toRadian, v2, v3, v4, warn };
