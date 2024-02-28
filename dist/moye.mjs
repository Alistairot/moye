import { _decorator, Component, director, SpriteFrame, Texture2D, instantiate, native, assetManager, Node, UITransform, Widget, CCFloat, Size, NodeEventType, Enum, Vec3, Label, v3, dynamicAtlasManager, Sprite, SpriteAtlas, CCInteger, UIRenderer, cclegacy, InstanceMaterialType, RenderTexture, Material, BitMask, CCString, EventTarget, Vec2, UIOpacity, Input, misc, CCBoolean, RigidBody2D } from 'cc';
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
    constructor() {
        super(...arguments);
        /**
         * 上一帧的增量时间，以毫秒为单位
         */
        this.deltaTime = 0;
    }
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
    update(dt) {
        this.deltaTime = dt;
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
        const com = this.createInst(type, isFromPool);
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
        const entity = this.createInst(type, isFromPool);
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
        const entity = this.createInst(type, isFromPool);
        entity.id = IdGenerator.get().generateId();
        entity.parent = this;
        if (entity.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(entity);
        }
        return entity;
    }
    createInst(type, isFromPool) {
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
    get parent() {
        return this._parent;
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
    /**
     * 通过对象池创建
     * @param this
     * @param values
     * @returns
     */
    static create(values) {
        const obj = ObjectPool.get().fetch(this);
        if (values) {
            Object.assign(obj, values);
        }
        obj._isRecycle = true;
        return obj;
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
    static update(dt) {
        for (let index = 0; index < Game._updates.length; index++) {
            const update = Game._updates[index];
            const singleton = update;
            if (singleton.isDisposed) {
                continue;
            }
            update.update(dt);
        }
    }
    static lateUpdate(dt) {
        for (let index = 0; index < Game._lateUpdates.length; index++) {
            const lateUpdate = Game._lateUpdates[index];
            const singleton = lateUpdate;
            if (singleton.isDisposed) {
                continue;
            }
            lateUpdate.lateUpdate(dt);
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

var __decorate$g = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$8, property: property$8 } = _decorator;
let MoyeRuntime = class MoyeRuntime extends Component {
    start() {
        director.addPersistRootNode(this.node);
    }
    update(dt) {
        Game.update(dt * 1000);
    }
    lateUpdate(dt) {
        Game.lateUpdate(dt * 1000);
        Game.frameFinishUpdate();
    }
    onDestroy() {
        Game.dispose();
    }
};
MoyeRuntime = __decorate$g([
    ccclass$8('MoyeRuntime')
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
        if (immediately) {
            callback();
        }
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
            coreError(EventHandlerTag, 'error:{0}', e.stack);
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
            coreError(EventHandlerTag, 'error:{0}', e.stack);
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
        this._actions?.delete(callback);
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

/**
 * key对应value数组的map
 */
class MultiMap {
    constructor() {
        this._empty = [];
        this._map = new Map();
    }
    add(t, k) {
        let list = this._map.get(t);
        if (list === undefined) {
            list = [];
            this._map.set(t, list);
        }
        list.push(k);
    }
    remove(t, k) {
        const list = this._map.get(t);
        if (list === undefined) {
            return false;
        }
        const index = list.indexOf(k);
        if (index === -1) {
            return false;
        }
        list.splice(index, 1);
        if (list.length === 0) {
            this._map.delete(t);
        }
        return true;
    }
    getAll(t) {
        const list = this._map.get(t);
        if (list === undefined) {
            return [];
        }
        return list;
    }
    get(t) {
        return this._map.get(t) ?? this._empty;
    }
    getOne(t) {
        const list = this._map.get(t);
        if (list !== undefined && list.length > 0) {
            return list[0];
        }
        return undefined;
    }
    contains(t, k) {
        const list = this._map.get(t);
        if (list === undefined) {
            return false;
        }
        return list.includes(k);
    }
}

Entity.prototype.clientScene = function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const domainScene = self.domainScene();
    if (domainScene.sceneType == SceneType.CLIENT) {
        return domainScene;
    }
    else if (domainScene.sceneType == SceneType.CURRENT) {
        return domainScene.parent.parent;
    }
    else if (domainScene.sceneType == SceneType.PROCESS) {
        return domainScene.getCom(SceneRefCom).scene;
    }
};
Entity.prototype.currentScene = function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const clientScene = self.clientScene();
    return clientScene.getCom(SceneRefCom).scene;
};

/**
 * 在entity销毁的时候自动取消订阅
 */
class EventAutoReleaseCom extends Entity {
    constructor() {
        super(...arguments);
        this.events = [];
    }
    addItem(item) {
        this.events.push(item);
    }
    destroy() {
        const eventMap = this.eventCom['eventMap'];
        for (const item of this.events) {
            const eventSet = eventMap.get(item.eventType);
            eventSet.delete(item);
            item.entity = null;
            item.handler = null;
            item.eventType = null;
            item.dispose();
        }
        this.events = null;
        this.eventCom = null;
    }
}

class EventItem extends RecycleObj {
}

/**
 * 事件组件 可以发送事件给监听的对象
 * 不允许取消订阅
 */
class EventCom extends Entity {
    constructor() {
        super(...arguments);
        this._eventMap = new Map;
    }
    destroy() {
        const eventMap = this._eventMap;
        for (const eventSet of eventMap.values()) {
            for (const item of eventSet) {
                item.entity = null;
                item.handler = null;
                item.eventType = null;
                item.dispose();
            }
            eventSet.clear();
        }
        eventMap.clear();
    }
    /**
     * evtCom.subscribe(123, this.onEvent, this)
     * handler不需要绑定entity 也就是不需要bind
     * @param eventType
     * @param handler
     * @param entity
     */
    subscribe(eventType, handler, entity) {
        const item = EventItem.create({
            entity: entity,
            handler: handler,
            eventType: eventType
        });
        let eventSet = this._eventMap.get(eventType);
        if (!eventSet) {
            eventSet = new Set();
            this._eventMap.set(eventType, eventSet);
        }
        eventSet.add(item);
        let autoReleaseCom = entity.getCom(EventAutoReleaseCom);
        if (!autoReleaseCom) {
            autoReleaseCom = entity.addCom(EventAutoReleaseCom);
            autoReleaseCom.eventCom = this;
        }
        autoReleaseCom.addItem(item);
    }
    publish(eventType, ...args) {
        const eventSet = this._eventMap.get(eventType);
        if (eventSet) {
            for (const item of eventSet) {
                item.handler.apply(item.entity, args);
            }
        }
    }
}

class LoginCom extends Entity {
    constructor() {
        super(...arguments);
        /**
         * 是否登录了gate
         */
        this._isLogin = false;
        /**
         * 是否正在重连
         */
        this._isReconnecting = false;
        /**
         * 重新登录最大尝试次数
         */
        this._reLoginTryMaxCount = 3;
    }
    registerExecutor(loginExecutor) {
        this._loginExecutor = loginExecutor;
    }
    async login(args) {
        const err = await this._loginExecutor.login(this.domainScene(), args);
        if (err == 0) {
            this._isLogin = true;
            this._loginArgs = args;
        }
        return err;
    }
}

class AfterAddLoginCom extends AEvent {
}

var __decorate$f = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AfterCreateClientSceneHandler$1 = class AfterCreateClientSceneHandler extends AEventHandler {
    run(scene, args) {
        scene.addCom(LoginCom);
        EventSystem.get().publish(scene, new AfterAddLoginCom());
    }
};
AfterCreateClientSceneHandler$1 = __decorate$f([
    EventDecorator(AfterCreateClientScene, SceneType.CLIENT)
], AfterCreateClientSceneHandler$1);

// import { MsgResponseDecoratorType } from "./MsgResponseDecorator";
class MsgMgr extends Singleton {
    constructor() {
        super(...arguments);
        // private _requestResponse: Map<Type, Type> = new Map();
        // private _messageTypeMap: Map<number, string> = new Map;
        // private _typeToMessageTypeMap: Map<Type, string> = new Map;
        this._responseTypeMap = new Set;
        // opcodeToTypeMap: Map<number, Type> = new Map;
        this._typeOpcodeMap = new Map;
        this._opcodeTypeMap = new Map;
    }
    awake() {
        // const list1 = DecoratorCollector.inst.get(MsgResponseDecoratorType);
        // for (const args of list1) {
        //     const request = args[0];
        //     const response = args[1];
        //     this._requestResponse.set(request, response);
        // }
        // const list2 = DecoratorCollector.inst.get(MsgDecoratorType);
        // for (const args of list2) {
        //     const type: Type = args[0];
        //     const msgType: string = args[1];
        //     const opcode: number = args[2];
        //     const response = this._requestResponse.get(type);
        //     if(response){
        //         this.opcodeToTypeMap.set(opcode + 1, response);
        //     }
        //     this._messageTypeMap.set(opcode, msgType);
        //     this._typeToMessageTypeMap.set(type, msgType);
        //     this.opcodeToTypeMap.set(opcode, type);
        // }
    }
    register(type, opcode, isResponse = false) {
        this._typeOpcodeMap.set(type, opcode);
        this._opcodeTypeMap.set(opcode, type);
        if (isResponse) {
            this._responseTypeMap.add(opcode);
        }
    }
    isResponse(opcode) {
        return this._responseTypeMap.has(opcode);
    }
    getOpcode(type) {
        return this._typeOpcodeMap.get(type);
    }
    getType(opcode) {
        return this._opcodeTypeMap.get(opcode);
    }
}

/**
 * 消息序列化
 */
class MsgSerializeMgr extends Singleton {
    register(serialize) {
        this._serialize = serialize;
    }
    serialize(opcode, obj) {
        return this._serialize.encode(opcode, obj);
    }
    deserialize(bytes) {
        return this._serialize.decode(bytes);
    }
}

var __decorate$e = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AfterSingletonAddHandler = class AfterSingletonAddHandler extends AEventHandler {
    run(scene, args) {
        switch (args.singletonType) {
            case MsgMgr: {
                Game.addSingleton(MsgSerializeMgr);
                break;
            }
        }
    }
};
AfterSingletonAddHandler = __decorate$e([
    EventDecorator(AfterSingletonAdd, SceneType.PROCESS)
], AfterSingletonAddHandler);

const MsgHandlerDecoratorType = 'MsgHandlerDecorator';
/**
 * 消息处理器
 * @param opcode
 * @param messageType
 * @returns
 */
function MsgHandlerDecorator(messageType) {
    return function (target) {
        DecoratorCollector.inst.add(MsgHandlerDecoratorType, target, messageType);
    };
}

/**
 * 消息分发
 */
class MessageDispatcherMgr extends Singleton {
    constructor() {
        super(...arguments);
        this._handlers = new Map;
    }
    awake() {
        const list = DecoratorCollector.inst.get(MsgHandlerDecoratorType);
        for (const args of list) {
            const msgHandlerType = args[0];
            const msgType = args[1];
            const handler = new msgHandlerType();
            if (!this._handlers.has(msgType)) {
                this._handlers.set(msgType, []);
            }
            this._handlers.get(msgType).push(handler);
        }
    }
    destroy() {
        this._handlers.clear();
    }
    handle(session, msg) {
        const type = msg.constructor;
        const actions = this._handlers.get(type);
        if (!actions) {
            console.error(`[MessageDispatcherMgr] msg not found handler`, msg);
            return;
        }
        for (const handler of actions) {
            handler.handle(session, msg);
        }
    }
}

var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let BeforeProgramStartHandler = class BeforeProgramStartHandler extends AEventHandler {
    run(scene, args) {
        Game.addSingleton(MsgMgr);
        Game.addSingleton(MessageDispatcherMgr);
    }
};
BeforeProgramStartHandler = __decorate$d([
    EventDecorator(BeforeProgramStart, SceneType.PROCESS)
], BeforeProgramStartHandler);

class NetClientComponentOnRead extends AEvent {
}

var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let NetClientComponentOnReadEvent = class NetClientComponentOnReadEvent extends AEventHandler {
    run(scene, args) {
        args.session;
        const data = args.data;
        // 屏蔽非Uint8Array类型的数据
        if (!(data instanceof Uint8Array)) {
            return;
        }
    }
};
NetClientComponentOnReadEvent = __decorate$c([
    EventDecorator(NetClientComponentOnRead, SceneType.CLIENT)
], NetClientComponentOnReadEvent);

const NetworkTag = 'Network';

class NetServices extends Singleton {
    constructor() {
        super(...arguments);
        this._acceptIdGenerator = Number.MAX_SAFE_INTEGER - 1;
        this._services = new Map;
        this._serviceIdGenerator = 0;
        this._acceptCallback = new Map;
        this._readCallback = new Map;
        this._errorCallback = new Map;
    }
    sendMessage(serviceId, channelId, message) {
        const service = this.get(serviceId);
        if (service != null) {
            service.send(channelId, message);
        }
    }
    addService(aService) {
        aService.id = ++this._serviceIdGenerator;
        this.add(aService);
        return aService.id;
    }
    removeService(serviceId) {
        this.remove(serviceId);
    }
    createChannel(serviceId, channelId, address) {
        const service = this.get(serviceId);
        if (service != null) {
            service.create(channelId, address);
        }
    }
    removeChannel(serviceId, channelId, error) {
        const service = this.get(serviceId);
        if (service != null) {
            service.remove(channelId, error);
        }
    }
    registerAcceptCallback(serviceId, action) {
        this._acceptCallback.set(serviceId, action);
    }
    registerReadCallback(serviceId, action) {
        this._readCallback.set(serviceId, action);
    }
    /**
     * 一个serviceId只能注册一个
     * @param serviceId
     * @param action
     */
    registerErrorCallback(serviceId, action) {
        {
            if (this._errorCallback.has(serviceId)) {
                coreError(NetworkTag, '重复注册servece的errorCallback, serviceId={0}', serviceId);
            }
        }
        this._errorCallback.set(serviceId, action);
    }
    onAccept(serviceId, channelId, ipEndPoint) {
        const cb = this._acceptCallback.get(serviceId);
        if (!cb) {
            return;
        }
        cb(channelId, ipEndPoint);
    }
    onRead(serviceId, channelId, message) {
        const cb = this._readCallback.get(serviceId);
        if (!cb) {
            return;
        }
        cb(channelId, message);
    }
    onError(serviceId, channelId, error) {
        const cb = this._errorCallback.get(serviceId);
        if (!cb) {
            return;
        }
        cb(channelId, error);
    }
    get(id) {
        return this._services.get(id);
    }
    createAcceptChannelId() {
        return --this._acceptIdGenerator;
    }
    add(aService) {
        this._services.set(aService.id, aService);
    }
    remove(id) {
        const service = this._services.get(id);
        if (service) {
            service.dispose();
        }
    }
}

var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AfterProgramInitHandler$1 = class AfterProgramInitHandler extends AEventHandler {
    run(scene, args) {
        Game.addSingleton(NetServices);
    }
};
AfterProgramInitHandler$1 = __decorate$b([
    EventDecorator(AfterProgramInit, SceneType.PROCESS)
], AfterProgramInitHandler$1);

class NetworkErrorCode {
}
NetworkErrorCode.ERR_SendMessageNotFoundChannel = 1;
NetworkErrorCode.ERR_ChannelReadError = 2;
NetworkErrorCode.ERR_WebSocketError = 3;

class IPEndPoint {
    constructor(host, port = 0) {
        if (port == 0) {
            const strs = host.split(":");
            this.host = strs[0];
            this.port = parseInt(strs[1]);
        }
        else {
            this.host = host;
            this.port = port;
        }
    }
    toString() {
        return `${this.host}:${this.port}`;
    }
}

var ServiceType;
(function (ServiceType) {
    ServiceType[ServiceType["Outer"] = 0] = "Outer";
    ServiceType[ServiceType["Inner"] = 1] = "Inner";
})(ServiceType || (ServiceType = {}));

class AChannel {
    constructor() {
        this.id = 0n;
    }
    get isDisposed() {
        return this.id == 0n;
    }
}

const NetworkWebsocketTag = 'WService';

class WChannel extends AChannel {
    constructor() {
        super(...arguments);
        this._isConnected = false;
        this._msgQueue = [];
    }
    /**
     * 通过地址建立连接
     * 也就是客户端
     * @param address
     * @param id
     * @param service
     */
    initByAddress(address, id, service) {
        this.wSocket = new WebSocket(`ws://${address}`);
        this.wSocket.binaryType = "arraybuffer";
        this.id = id;
        this._service = service;
        this.remoteAddress = address;
        this.wSocket.onopen = this.onConnectComplete.bind(this);
        this.wSocket.onclose = this.onSocketClose.bind(this);
        this.wSocket.onerror = this.onWsSocketError.bind(this);
        this.wSocket.onmessage = this.onMessage.bind(this);
    }
    onConnectComplete() {
        this._isConnected = true;
        for (const msg of this._msgQueue) {
            this.innerSend(msg);
        }
        this._msgQueue = [];
    }
    onMessage(evt) {
        try {
            const channelId = this.id;
            NetServices.get().onRead(this._service.id, channelId, evt.data);
        }
        catch (error) {
            coreError(NetworkWebsocketTag, 'Channel onMessage, remoteAddress={1} error={0}', error.stack, this.remoteAddress.toString());
            // 出现任何消息解析异常都要断开Session，防止客户端伪造消息
            this.onError(NetworkErrorCode.ERR_ChannelReadError);
        }
    }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.id = 0n;
        this.wSocket = null;
        this._msgQueue = null;
        this._service = null;
        this._isConnected = false;
        this.remoteAddress = null;
    }
    onWsSocketError(e) {
        this.onSocketClose(NetworkErrorCode.ERR_WebSocketError);
    }
    /**
     * socket被动关闭
     * @param code
     */
    onSocketClose(code) {
        if (this._service) {
            this._service.channelClose(this, code);
        }
    }
    /**
     * 这里的只能是主动关闭
     */
    closeSocket(code) {
        if (code < 4000) {
            if (this.wSocket != null) {
                this.wSocket.close();
            }
        }
        else {
            if (this.wSocket != null) {
                this.wSocket.close(code);
            }
        }
    }
    onError(error) {
        this._service.remove(this.id, error);
    }
    innerSend(data) {
        this.wSocket.send(data);
    }
    send(data) {
        if (this.isDisposed) {
            return;
        }
        if (this._isConnected) {
            this.innerSend(data);
        }
        else {
            this._msgQueue.push(data);
        }
    }
}

class AService {
}

class WService extends AService {
    constructor() {
        super(...arguments);
        this._idChannels = new Map;
    }
    initSender(serviceType) {
        this.serviceType = serviceType;
    }
    send(channelId, data) {
        const channel = this._idChannels.get(channelId);
        if (channel == null) {
            NetServices.get().onError(this.id, channelId, NetworkErrorCode.ERR_SendMessageNotFoundChannel);
            return;
        }
        channel.send(data);
    }
    create(id, address) {
        if (this._idChannels.has(id)) {
            return;
        }
        this.innerCreate(id, address);
    }
    remove(id, error) {
        const channel = this._idChannels.get(id);
        if (!channel) {
            return;
        }
        channel.closeSocket(error);
        this._idChannels.delete(id);
        channel.dispose();
    }
    dispose() {
    }
    innerCreate(id, address) {
        const channel = new WChannel();
        channel.initByAddress(address, id, this);
        this._idChannels.set(channel.id, channel);
    }
    /**
     * channel 被动关闭 调用这个
     * @param channel
     * @param code
     */
    channelClose(channel, code) {
        this._idChannels.delete(channel.id);
        NetServices.get().onError(this.id, channel.id, code);
        channel.dispose();
    }
}

class NetComReadEvent extends AEvent {
}

const MessageTag = 'Message';

class MessageErrorCode extends NetworkErrorCode {
}
MessageErrorCode.ERR_SessionDisposed = 101;

class RpcResponse {
    constructor(values) {
        Object.assign(this, values);
    }
}

/**
 * session的id跟channel的id是一样的
 */
class Session extends Entity {
    constructor() {
        super(...arguments);
        this.requestCallbacks = new Map;
        this.error = 0;
    }
    init(serviceId) {
        this.serviceId = serviceId;
        const timeNow = TimeHelper.clientNow();
        this.lastRecvTime = timeNow;
        this.lastSendTime = timeNow;
    }
    onResponse(response) {
        const task = this.requestCallbacks.get(response.rpcId);
        if (!task) {
            return;
        }
        this.requestCallbacks.delete(response.rpcId);
        task.setResult(response);
    }
    send(msg) {
        if (this.isDisposed) {
            coreLog(MessageTag, 'session已经销毁,不能发送消息, message={0}, sessionId={1}', msg.constructor.name, this.id);
            return;
        }
        try {
            const opcode = MsgMgr.get().getOpcode(msg.constructor);
            const data = MsgSerializeMgr.get().serialize(opcode, msg);
            this.lastSendTime = TimeHelper.clientNow();
            NetServices.get().sendMessage(this.serviceId, this.id, data);
        }
        catch (error) {
            coreError(MessageTag, 'session send error={0}', error.stack);
        }
    }
    async call(req) {
        if (this.isDisposed) {
            coreLog(MessageTag, 'session已经销毁,不能发送消息, message={0}, sessionId={1}', req.constructor.name, this.id);
            const response = new RpcResponse({ error: MessageErrorCode.ERR_SessionDisposed });
            return response;
        }
        const rpcId = ++Session._rpcId;
        const task = Task.create();
        this.requestCallbacks.set(rpcId, task);
        req.rpcId = rpcId;
        this.send(req);
        const result = await task;
        return result;
    }
    destroy() {
        if (this.error > 0) {
            NetServices.get().onError(this.serviceId, this.id, this.error);
        }
        NetServices.get().removeChannel(this.serviceId, this.id, this.error);
        if (this.requestCallbacks.size > 0) {
            const response = new RpcResponse({ error: MessageErrorCode.ERR_SessionDisposed });
            for (const [_, responseCallback] of this.requestCallbacks) {
                responseCallback.setResult(response);
            }
            this.requestCallbacks.clear();
        }
    }
}
Session._rpcId = 0;

/**
 * 用于处理网络消息的组件
 * 这个组件只接受二进制数据
 */
class NetCom extends Entity {
    awake() {
        const service = new WService();
        service.initSender(ServiceType.Outer);
        const netServices = NetServices.get();
        this.serviceId = netServices.addService(service);
        netServices.registerReadCallback(this.serviceId, this.onRead.bind(this));
        netServices.registerErrorCallback(this.serviceId, this.onError.bind(this));
    }
    destroy() {
        const netServices = NetServices.get();
        netServices.removeService(this.serviceId);
    }
    onRead(channelId, data) {
        const session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }
        // if(DEVELOP){
        //     // 屏蔽非Uint8Array类型的数据
        //     if(!(data instanceof Uint8Array)){
        //         coreError('NetCom', '非Uint8Array类型的数据');
        //         return;
        //     }
        // }
        session.lastRecvTime = TimeHelper.clientNow();
        const event = NetComReadEvent.create({ data: data, session: session });
        EventSystem.get().publish(this.domainScene(), event);
    }
    onError(channelId, error) {
        const session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }
        session.error = error;
        session.dispose();
        // EventSendHelper.publish(this.domainScene(), NetErrorEvent.create({channelId: channelId, error: error}));
    }
    create(address) {
        const session = this.addChild(Session);
        session.init(this.serviceId);
        session.remoteAddress = address;
        NetServices.get().createChannel(this.serviceId, session.id, address);
        return session;
    }
}

/**
 * 保存客户端的session
 */
class SessionCom extends Entity {
    destroy() {
        this.session?.dispose();
        this.session = null;
    }
}

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AfterCreateClientSceneHandler = class AfterCreateClientSceneHandler extends AEventHandler {
    run(scene, args) {
        scene.addCom(NetCom);
        scene.addCom(SessionCom);
    }
};
AfterCreateClientSceneHandler = __decorate$a([
    EventDecorator(AfterCreateClientScene, SceneType.CLIENT)
], AfterCreateClientSceneHandler);

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let NetComReadEventHandler = class NetComReadEventHandler extends AEventHandler {
    run(scene, args) {
        const session = args.session;
        const data = args.data;
        const [opcode, msg] = MsgSerializeMgr.get().deserialize(data);
        const isResponse = MsgMgr.get().isResponse(opcode);
        if (isResponse) {
            session.onResponse(msg);
            return;
        }
        MessageDispatcherMgr.get().handle(session, msg);
    }
};
NetComReadEventHandler = __decorate$9([
    EventDecorator(NetComReadEvent, SceneType.CLIENT)
], NetComReadEventHandler);

/**
 * 消息处理器基类
 */
class AMHandler {
    handle(session, msg) {
        // session可能已经断开了，所以这里需要判断
        if (session.isDisposed) {
            return;
        }
        {
            // 开发阶段检测
            const ret = this.run(session, msg);
            if (ret instanceof Promise) {
                coreWarn('AMHandler', '{0}.run 请不要使用异步, 因为异步没办法保证消息接收后的处理顺序', this.constructor.name);
                safeCall(ret);
            }
        }
    }
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
            if (bundleAsset.refCount != 0) {
                continue;
            }
            if (!bundleAsset.isAutoRelease) {
                continue;
            }
            bundleAsset.unloadUnusedAssets();
            MoyeAssets.releaseBundle(bundleAsset);
        }
    }
}
MoyeAssets._bundleMap = new Map();
MoyeAssets._bundlePathMap = new Map();

var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
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
AfterProgramInitHandler = __decorate$8([
    EventDecorator(AfterProgramInit, SceneType.NONE)
], AfterProgramInitHandler);

var WaitError;
(function (WaitError) {
    WaitError[WaitError["SUCCESS"] = 0] = "SUCCESS";
    WaitError[WaitError["DESTROY"] = 1] = "DESTROY";
    WaitError[WaitError["CANCEL"] = 2] = "CANCEL";
    WaitError[WaitError["TIMEOUT"] = 3] = "TIMEOUT";
})(WaitError || (WaitError = {}));

class AWait extends RecycleObj {
    constructor() {
        super(...arguments);
        this.error = WaitError.SUCCESS;
    }
}

class ObjectWait extends Entity {
    constructor() {
        super(...arguments);
        this._tasks = new Map;
    }
    destroy() {
        for (const [type, task] of this._tasks) {
            const obj = this.createWaitInstance(type, WaitError.DESTROY);
            this.notify(obj);
        }
    }
    /**
     * 一直等待 知道notify了 永不超时
     * @param type
     * @param cancellationToken
     * @returns
     */
    async wait(type, cancellationToken) {
        this.cancelLastWait(type);
        const tcs = Task.create(type);
        this._tasks.set(type, tcs);
        let cancelAction;
        let ret;
        if (cancellationToken) {
            cancelAction = () => {
                const obj = this.createWaitInstance(type, WaitError.CANCEL);
                this.notify(obj);
            };
            cancellationToken.add(cancelAction);
        }
        try {
            ret = await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null;
        }
        return ret;
    }
    /**
     * 等待且有超时限制 超时将会取消等待
     * @param type
     * @param timeout ms
     * @param cancellationToken
     * @returns
     */
    async waitWithTimeout(type, timeout, cancellationToken) {
        this.cancelLastWait(type);
        const tcs = Task.create(type);
        this._tasks.set(type, tcs);
        this.timeoutRun(type, timeout, cancellationToken);
        let cancelAction;
        let ret;
        if (cancellationToken) {
            cancelAction = () => {
                const obj = this.createWaitInstance(type, WaitError.CANCEL);
                this.notify(obj);
            };
            cancellationToken.add(cancelAction);
        }
        try {
            ret = await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null;
        }
        return ret;
    }
    /**
     * 取消上一个等待
     * @param type
     */
    cancelLastWait(type) {
        if (!this._tasks.has(type)) {
            return;
        }
        coreWarn('上一个wait已经取消, {0}', type.name);
        const obj = this.createWaitInstance(type, WaitError.CANCEL);
        this.notify(obj);
    }
    /**
     * 超时取消等待
     * @param type
     * @param time
     * @param cancellationToken
     * @returns
     */
    async timeoutRun(type, time, cancellationToken) {
        await TimerMgr.get().waitAsync(time, cancellationToken);
        if (cancellationToken?.isCancel()) {
            return;
        }
        // 已经执行完毕 不需要执行超时的逻辑
        if (!this._tasks.has(type)) {
            return;
        }
        const obj = this.createWaitInstance(type, WaitError.TIMEOUT);
        this.notify(obj);
    }
    createWaitInstance(type, error) {
        const obj = type.create();
        obj.error = error;
        return obj;
    }
    notify(obj) {
        const tcs = this._tasks.get(obj.constructor);
        if (!tcs) {
            return;
        }
        this._tasks.delete(obj.constructor);
        tcs.setResult(obj);
        obj.dispose();
    }
}

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
            coreError(MoyeViewTag, 'show view errr, {0}', e.stack);
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
            coreError(MoyeViewTag, 'hide view errr, {0}', e.stack);
        }
        finally {
            lock.dispose();
        }
    }
    getView(nameOrType) {
        let name;
        if (typeof nameOrType == 'string') {
            name = nameOrType;
        }
        else {
            name = this._type2Names.get(nameOrType);
        }
        if (this._showingViews.has(name)) {
            const view = this._views.get(name);
            return view;
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
            const layerWidget = layerNode.addComponent(Widget);
            layerWidget.top = 0;
            layerWidget.bottom = 0;
            layerWidget.left = 0;
            layerWidget.right = 0;
            layerWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
            layerWidget.isAlignBottom = true;
            layerWidget.isAlignLeft = true;
            layerWidget.isAlignRight = true;
            layerWidget.isAlignTop = true;
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

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$7, property: property$7, menu: menu$4 } = _decorator;
let SizeFollow = class SizeFollow extends Component {
    constructor() {
        super(...arguments);
        this._heightFollow = true;
        this._widthFollow = true;
        this._heightOffset = 0;
        this._widthOffset = 0;
        this._changeSize = new Size();
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
__decorate$7([
    property$7({ type: UITransform })
], SizeFollow.prototype, "target", null);
__decorate$7([
    property$7({ type: UITransform })
], SizeFollow.prototype, "_target", void 0);
__decorate$7([
    property$7
], SizeFollow.prototype, "heightFollow", null);
__decorate$7([
    property$7
], SizeFollow.prototype, "_heightFollow", void 0);
__decorate$7([
    property$7
], SizeFollow.prototype, "widthFollow", null);
__decorate$7([
    property$7
], SizeFollow.prototype, "_widthFollow", void 0);
__decorate$7([
    property$7({ type: CCFloat })
], SizeFollow.prototype, "_heightOffset", void 0);
__decorate$7([
    property$7({ type: CCFloat })
], SizeFollow.prototype, "_widthOffset", void 0);
SizeFollow = __decorate$7([
    ccclass$7('SizeFollow'),
    menu$4('moye/SizeFollow')
], SizeFollow);

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$6, property: property$6, executeInEditMode: executeInEditMode$2, menu: menu$3 } = _decorator;
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
        this._changePos = new Vec3(0, 0, 0);
        this._targetOldPos = new Vec3(0, 0, 0);
        this._targetOldSize = 0;
        this._selfOldPos = new Vec3(0, 0, 0);
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
                this.node.setPosition(v3(this._changePos));
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
                this._changePos = v3();
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
__decorate$6([
    property$6({ type: UITransform })
], CTWidget.prototype, "target", null);
__decorate$6([
    property$6({ type: UITransform })
], CTWidget.prototype, "_target", void 0);
__decorate$6([
    property$6({ type: Enum(WidgetBase) })
], CTWidget.prototype, "targetDir", null);
__decorate$6([
    property$6
], CTWidget.prototype, "_targetDir", void 0);
__decorate$6([
    property$6({ type: Enum(WidgetDirection) })
], CTWidget.prototype, "dir", null);
__decorate$6([
    property$6
], CTWidget.prototype, "_dir", void 0);
__decorate$6([
    property$6({ type: CCFloat })
], CTWidget.prototype, "visibleOffset", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_isVertical", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_distance", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_changePos", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_targetOldPos", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_targetOldSize", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_selfOldPos", void 0);
__decorate$6([
    property$6
], CTWidget.prototype, "_selfOldSize", void 0);
CTWidget = __decorate$6([
    ccclass$6('CTWidget'),
    menu$3('moye/CTWidget'),
    executeInEditMode$2
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

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$5, property: property$5, type, menu: menu$2 } = _decorator;
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
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_sizeMode", void 0);
__decorate$5([
    type(Sprite.SizeMode)
], RoundBoxSprite.prototype, "sizeMode", null);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_atlas", void 0);
__decorate$5([
    type(SpriteAtlas)
], RoundBoxSprite.prototype, "spriteAtlas", null);
__decorate$5([
    property$5({ type: CCInteger, serializable: true })
], RoundBoxSprite.prototype, "_segments", void 0);
__decorate$5([
    property$5({ type: CCInteger, serializable: true, min: 1 })
], RoundBoxSprite.prototype, "segments", null);
__decorate$5([
    property$5({ type: CCFloat, serializable: true })
], RoundBoxSprite.prototype, "_radius", void 0);
__decorate$5([
    property$5({ type: CCFloat, serializable: true, min: 0 })
], RoundBoxSprite.prototype, "radius", null);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_spriteFrame", void 0);
__decorate$5([
    type(SpriteFrame)
], RoundBoxSprite.prototype, "spriteFrame", null);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_leftTop", void 0);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "leftTop", null);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_rightTop", void 0);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "rightTop", null);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_leftBottom", void 0);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "leftBottom", null);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "_rightBottom", void 0);
__decorate$5([
    property$5({ serializable: true })
], RoundBoxSprite.prototype, "rightBottom", null);
RoundBoxSprite = __decorate$5([
    ccclass$5('RoundBoxSprite'),
    menu$2('moye/RoundBoxSprite')
], RoundBoxSprite);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$4, property: property$4, executeInEditMode: executeInEditMode$1 } = _decorator;
var UIControllerIndex;
(function (UIControllerIndex) {
    UIControllerIndex[UIControllerIndex["Index_0"] = 1] = "Index_0";
    UIControllerIndex[UIControllerIndex["Index_1"] = 2] = "Index_1";
    UIControllerIndex[UIControllerIndex["Index_2"] = 4] = "Index_2";
    UIControllerIndex[UIControllerIndex["Index_3"] = 8] = "Index_3";
    UIControllerIndex[UIControllerIndex["Index_4"] = 16] = "Index_4";
    UIControllerIndex[UIControllerIndex["Index_5"] = 32] = "Index_5";
    UIControllerIndex[UIControllerIndex["Index_6"] = 64] = "Index_6";
    UIControllerIndex[UIControllerIndex["Index_7"] = 128] = "Index_7";
    UIControllerIndex[UIControllerIndex["Index_8"] = 256] = "Index_8";
    UIControllerIndex[UIControllerIndex["Index_9"] = 512] = "Index_9";
    UIControllerIndex[UIControllerIndex["Index_10"] = 1024] = "Index_10";
    UIControllerIndex[UIControllerIndex["Index_11"] = 2048] = "Index_11";
    UIControllerIndex[UIControllerIndex["Index_12"] = 4096] = "Index_12";
})(UIControllerIndex || (UIControllerIndex = {}));
let UIController = class UIController extends Component {
    constructor() {
        super(...arguments);
        this._index = UIControllerIndex.Index_0;
        this._listeners = [];
    }
    set index(v) {
        if (this._index == v) {
            return;
        }
        this._index = v;
        this.notifyListeners();
    }
    get index() {
        return this._index;
    }
    onDestroy() {
        this._listeners = [];
    }
    addListener(listener) {
        if (this._listeners.indexOf(listener) == -1) {
            this._listeners.push(listener);
        }
        if (EDITOR) {
            // 检查是否有null或者undefined 如果有就移除
            for (let i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i] == null || this._listeners[i] == undefined) {
                    this._listeners.splice(i, 1);
                }
            }
        }
    }
    removeListener(listener) {
        const index = this._listeners.indexOf(listener);
        if (index != -1) {
            this._listeners.splice(index, 1);
        }
        if (EDITOR) {
            // 检查是否有null或者undefined 如果有就移除
            for (let i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i] == null || this._listeners[i] == undefined) {
                    this._listeners.splice(i, 1);
                }
            }
        }
    }
    notifyListeners() {
        for (let i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i]) {
                this._listeners[i].onChangeIndex(this._index);
            }
        }
        if (EDITOR) {
            // 检查是否有null或者undefined 如果有就移除
            for (let i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i] == null || this._listeners[i] == undefined) {
                    this._listeners.splice(i, 1);
                }
            }
            const selfListener = this.node.getComponent("UIControllerListener");
            if (selfListener) {
                selfListener['registerUIController']();
            }
        }
    }
};
__decorate$4([
    property$4
], UIController.prototype, "_index", void 0);
__decorate$4([
    property$4({ type: Enum(UIControllerIndex), displayOrder: 1 })
], UIController.prototype, "index", null);
__decorate$4([
    property$4
], UIController.prototype, "_listeners", void 0);
UIController = __decorate$4([
    ccclass$4('UIController'),
    executeInEditMode$1
], UIController);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$3, property: property$3, } = _decorator;
var UIControllerIndexMask;
(function (UIControllerIndexMask) {
    UIControllerIndexMask[UIControllerIndexMask["Index_0"] = 1] = "Index_0";
    UIControllerIndexMask[UIControllerIndexMask["Index_1"] = 2] = "Index_1";
    UIControllerIndexMask[UIControllerIndexMask["Index_2"] = 4] = "Index_2";
    UIControllerIndexMask[UIControllerIndexMask["Index_3"] = 8] = "Index_3";
    UIControllerIndexMask[UIControllerIndexMask["Index_4"] = 16] = "Index_4";
    UIControllerIndexMask[UIControllerIndexMask["Index_5"] = 32] = "Index_5";
    UIControllerIndexMask[UIControllerIndexMask["Index_6"] = 64] = "Index_6";
    UIControllerIndexMask[UIControllerIndexMask["Index_7"] = 128] = "Index_7";
    UIControllerIndexMask[UIControllerIndexMask["Index_8"] = 256] = "Index_8";
    UIControllerIndexMask[UIControllerIndexMask["Index_9"] = 512] = "Index_9";
    UIControllerIndexMask[UIControllerIndexMask["Index_10"] = 1024] = "Index_10";
    UIControllerIndexMask[UIControllerIndexMask["Index_11"] = 2048] = "Index_11";
    UIControllerIndexMask[UIControllerIndexMask["Index_12"] = 4096] = "Index_12";
})(UIControllerIndexMask || (UIControllerIndexMask = {}));
var UIControlType;
(function (UIControlType) {
    UIControlType[UIControlType["None"] = 0] = "None";
    UIControlType[UIControlType["Visible"] = 1] = "Visible";
    UIControlType[UIControlType["Position"] = 2] = "Position";
    UIControlType[UIControlType["Size"] = 3] = "Size";
    UIControlType[UIControlType["Scale"] = 4] = "Scale";
    UIControlType[UIControlType["Angle"] = 5] = "Angle";
    UIControlType[UIControlType["Anchor"] = 6] = "Anchor";
    UIControlType[UIControlType["UIController"] = 7] = "UIController";
})(UIControlType || (UIControlType = {}));
let UIControllerAttr = class UIControllerAttr {
    constructor() {
        this.controlType = UIControlType.None;
        this.indexMask = UIControllerIndexMask.Index_0;
        this._positionMap = {};
        this._sizeMap = {};
        this._scaleMap = {};
        this._angleMap = {};
        this._anchorMap = {};
        this._uiControllerMap = {};
    }
    hasIndex(index) {
        return (this.indexMask & index) != 0;
    }
    setPosition(index, pos) {
        this._positionMap[index] = pos.clone();
    }
    getPosition(index) {
        return this._positionMap[index];
    }
    setSize(index, size) {
        this._sizeMap[index] = size.clone();
    }
    getSize(index) {
        return this._sizeMap[index];
    }
    setScale(index, scale) {
        this._scaleMap[index] = scale.clone();
    }
    getScale(index) {
        return this._scaleMap[index];
    }
    setAngle(index, angle) {
        this._angleMap[index] = angle;
    }
    getAngle(index) {
        return this._angleMap[index];
    }
    setAnchor(index, anchor) {
        this._anchorMap[index] = anchor.clone();
    }
    getAnchor(index) {
        return this._anchorMap[index];
    }
    setUIController(index, controllerIndex) {
        this._uiControllerMap[index] = controllerIndex;
    }
    getUIController(index) {
        return this._uiControllerMap[index];
    }
    clearOtherData() {
        switch (this.controlType) {
            case UIControlType.Visible:
                this.clearPositionData();
                this.clearSizeData();
                this.clearScaleData();
                this.clearAngleData();
                this.clearAnchorData();
                this.clearUIControllerData();
                break;
            case UIControlType.Position:
                this.clearSizeData();
                this.clearScaleData();
                this.clearAngleData();
                this.clearAnchorData();
                this.clearUIControllerData();
                break;
            case UIControlType.Size:
                this.clearPositionData();
                this.clearScaleData();
                this.clearAngleData();
                this.clearAnchorData();
                this.clearUIControllerData();
                break;
            case UIControlType.Scale:
                this.clearPositionData();
                this.clearSizeData();
                this.clearAngleData();
                this.clearAnchorData();
                this.clearUIControllerData();
                break;
            case UIControlType.Angle:
                this.clearPositionData();
                this.clearSizeData();
                this.clearScaleData();
                this.clearAnchorData();
                this.clearUIControllerData();
                break;
            case UIControlType.Anchor:
                this.clearPositionData();
                this.clearSizeData();
                this.clearScaleData();
                this.clearAngleData();
                this.clearUIControllerData();
                break;
            case UIControlType.UIController:
                this.clearPositionData();
                this.clearSizeData();
                this.clearScaleData();
                this.clearAngleData();
                this.clearAnchorData();
                break;
        }
    }
    clearPositionData() {
        this._positionMap = {};
    }
    clearSizeData() {
        this._sizeMap = {};
    }
    clearScaleData() {
        this._scaleMap = {};
    }
    clearAngleData() {
        this._angleMap = {};
    }
    clearAnchorData() {
        this._anchorMap = {};
    }
    clearUIControllerData() {
        this._uiControllerMap = {};
    }
};
__decorate$3([
    property$3({ type: Enum(UIControlType) })
], UIControllerAttr.prototype, "controlType", void 0);
__decorate$3([
    property$3({
        type: BitMask(UIControllerIndexMask),
        visible() { return this.controlType == UIControlType.Visible; }
    })
], UIControllerAttr.prototype, "indexMask", void 0);
__decorate$3([
    property$3
], UIControllerAttr.prototype, "_positionMap", void 0);
__decorate$3([
    property$3
], UIControllerAttr.prototype, "_sizeMap", void 0);
__decorate$3([
    property$3
], UIControllerAttr.prototype, "_scaleMap", void 0);
__decorate$3([
    property$3
], UIControllerAttr.prototype, "_angleMap", void 0);
__decorate$3([
    property$3
], UIControllerAttr.prototype, "_anchorMap", void 0);
__decorate$3([
    property$3
], UIControllerAttr.prototype, "_uiControllerMap", void 0);
UIControllerAttr = __decorate$3([
    ccclass$3('UIControllerAttr')
], UIControllerAttr);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$2, property: property$2, executeInEditMode } = _decorator;
let UIControllerListener = class UIControllerListener extends Component {
    constructor() {
        super(...arguments);
        this._controller = null;
        this._attrs = [];
    }
    set controller(v) {
        if (this._controller == v) {
            return;
        }
        if (this._controller) {
            this._controller.removeListener(this);
        }
        this._controller = v;
        this.listenController();
    }
    get controller() {
        return this._controller;
    }
    get curIndex() {
        if (!this._controller) {
            return '';
        }
        const str = `${UIControllerIndex[this._controller.index]}`;
        return str;
    }
    set attrs(v) {
        this._attrs = v;
        this.updateAttr();
    }
    get attrs() {
        return this._attrs;
    }
    onLoad() {
        this.listenController();
    }
    onDestroy() {
        if (EDITOR) {
            this.unRegisterEditorEvent();
        }
        else {
            if (!this._controller) {
                return;
            }
            this._controller.removeListener(this);
        }
    }
    onDisable() {
        // if(EDITOR){
        //     setTimeout(() => {
        //         if(!this.node.isValid){
        //             if (!this._controller) {
        //                 return;
        //             }
        //             console.log('移除监听22');
        //             this._controller.removeListener(this);
        //         }
        //     });
        // }
    }
    onFocusInEditor() {
        this.registerEditorEvent();
    }
    onLostFocusInEditor() {
        this.unRegisterEditorEvent();
        // if(!this.node.isValid){
        //     if (!this._controller) {
        //         return;
        //     }
        //     console.log('移除监听22');
        //     this._controller.removeListener(this);
        // }
    }
    registerEditorEvent() {
        this.unRegisterEditorEvent();
        this.node.on(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onChangeActive, this);
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this.onTransformChange, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChange, this);
        this.node.on(Node.EventType.ANCHOR_CHANGED, this.onAnchorChange, this);
    }
    unRegisterEditorEvent() {
        this.node.off(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onChangeActive, this);
        this.node.off(Node.EventType.TRANSFORM_CHANGED, this.onTransformChange, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this.onSizeChange, this);
        this.node.off(Node.EventType.ANCHOR_CHANGED, this.onAnchorChange, this);
    }
    listenController() {
        if (!this._controller) {
            return;
        }
        // this._controller.removeListener(this);
        this._controller.addListener(this);
    }
    onChangeActive() {
        // this.registerVisible();
    }
    onTransformChange() {
        this.registerTransform();
    }
    onSizeChange() {
        this.registerSize();
    }
    onAnchorChange() {
        this.registerAnchor();
    }
    // private registerVisible() {
    //     if (!this._controller) {
    //         return;
    //     }
    //     let index = this._controller.index;
    //     for (let i = 0; i < this._attrs.length; i++) {
    //         let attr = this._attrs[i];
    //         if (attr.controlType == UIControlType.Visible) {
    //             // attr.visibleSet.add(index);
    //         }
    //     }
    // }
    registerTransform() {
        if (!this._controller) {
            return;
        }
        const index = this._controller.index;
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            if (attr.controlType == UIControlType.Position) {
                attr.setPosition(index, this.node.position);
            }
            else if (attr.controlType == UIControlType.Scale) {
                attr.setScale(index, this.node.scale);
            }
            else if (attr.controlType == UIControlType.Angle) {
                attr.setAngle(index, this.node.angle);
            }
        }
    }
    registerSize() {
        if (!this._controller) {
            return;
        }
        const index = this._controller.index;
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            if (attr.controlType == UIControlType.Size) {
                const uiTransform = this.node.getComponent(UITransform);
                attr.setSize(index, uiTransform.contentSize);
            }
        }
    }
    registerAnchor() {
        if (!this._controller) {
            return;
        }
        const index = this._controller.index;
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            if (attr.controlType == UIControlType.Anchor) {
                const uiTransform = this.node.getComponent(UITransform);
                attr.setAnchor(index, uiTransform.anchorPoint);
            }
        }
    }
    registerUIController() {
        if (!this._controller) {
            return;
        }
        const index = this._controller.index;
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            if (attr.controlType == UIControlType.UIController) {
                attr.setUIController(index, this.node.getComponent(UIController).index);
            }
        }
    }
    updateAttr() {
        if (!this._controller) {
            return;
        }
        const index = this._controller.index;
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            attr.clearOtherData();
        }
        this.onChangeIndex(index);
    }
    onChangeIndex(index) {
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            switch (attr.controlType) {
                case UIControlType.Visible: {
                    this.node.active = attr.hasIndex(index);
                    break;
                }
                case UIControlType.Position: {
                    const pos = attr.getPosition(index);
                    if (pos) {
                        this.node.position = pos;
                    }
                    else {
                        attr.setPosition(index, this.node.position);
                    }
                    break;
                }
                case UIControlType.Size: {
                    const size = attr.getSize(index);
                    const uiTransform = this.node.getComponent(UITransform);
                    if (size) {
                        uiTransform.setContentSize(size);
                    }
                    else {
                        attr.setSize(index, uiTransform.contentSize);
                    }
                    break;
                }
                case UIControlType.Scale:
                    {
                        const scale = attr.getScale(index);
                        if (scale) {
                            this.node.scale = scale;
                        }
                        else {
                            attr.setScale(index, this.node.scale);
                        }
                        break;
                    }
                case UIControlType.Angle: {
                    const angle = attr.getAngle(index);
                    if (angle == null || angle == undefined) {
                        attr.setAngle(index, this.node.angle);
                    }
                    else {
                        this.node.angle = angle;
                    }
                    break;
                }
                case UIControlType.Anchor: {
                    const anchor = attr.getAnchor(index);
                    if (anchor) {
                        const uiTransform = this.node.getComponent(UITransform);
                        uiTransform.setAnchorPoint(anchor);
                    }
                    else {
                        attr.setAnchor(index, this.node.getComponent(UITransform).anchorPoint);
                    }
                    break;
                }
                case UIControlType.UIController: {
                    const controllerIndex = attr.getUIController(index);
                    if (controllerIndex != null && controllerIndex != undefined) {
                        this.node.getComponent(UIController).index = controllerIndex;
                    }
                    else {
                        attr.setUIController(index, this.node.getComponent(UIController).index);
                    }
                    break;
                }
            }
        }
    }
};
__decorate$2([
    property$2
], UIControllerListener.prototype, "_controller", void 0);
__decorate$2([
    property$2(UIController)
], UIControllerListener.prototype, "controller", null);
__decorate$2([
    property$2({
        type: [CCString],
        visible() { return this._controller != null; }
    })
], UIControllerListener.prototype, "curIndex", null);
__decorate$2([
    property$2
], UIControllerListener.prototype, "_attrs", void 0);
__decorate$2([
    property$2({
        type: [UIControllerAttr],
        visible() { return this._controller != null; }
    })
], UIControllerListener.prototype, "attrs", null);
UIControllerListener = __decorate$2([
    ccclass$2('UIControllerListener'),
    executeInEditMode
], UIControllerListener);

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
        this._stickPos = new Vec3();
        this._touchLocation = new Vec2();
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
        const ringSize = new Size(size, size);
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
        const touchPos = new Vec3(location.x, location.y);
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
            this.dot.setPosition(new Vec3());
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
        const touchPos = new Vec3(location.x, location.y);
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
        this.dot.setPosition(new Vec3());
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
        type: Vec3,
        tooltip: "摇杆所在位置",
    })
], YYJJoystick.prototype, "_stickPos", void 0);
__decorate$1([
    property$1({
        type: Vec2,
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
        this.moveDir = new Vec3(0, 1, 0);
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
        this.moveDir = new Vec3(0, 1, 0);
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
            const force = new Vec2(moveVec.x, moveVec.y);
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

class YYJJoystickSpeedChangeEvent extends AEvent {
}
class YYJJoystickMoveEvent extends AEvent {
}
class YYJJoystickListener extends Entity {
    constructor() {
        super(...arguments);
        this._speedType = SpeedType.STOP;
    }
    awake() {
        instance.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
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
        if (oldSpeedType !== this._speedType) {
            EventSystem.get().publish(this.domainScene(), YYJJoystickSpeedChangeEvent.create({
                speedType: this._speedType
            }));
        }
        EventSystem.get().publish(this.domainScene(), YYJJoystickMoveEvent.create({
            dir: data.moveVec
        }));
    }
    onTouchEnd(event, data) {
        this.onTouchMove(event, data);
    }
}

export { AEvent, AEventHandler, AMHandler, AMoyeView, AWait, AfterAddLoginCom, AfterCreateClientScene, AfterCreateCurrentScene, AfterProgramInit, AfterProgramStart, AfterSingletonAdd, AssetOperationHandle, AsyncButtonListener, BeforeProgramInit, BeforeProgramStart, BeforeSingletonAdd, BundleAsset, CTWidget, CancellationToken, CancellationTokenTag, CoroutineLock, CoroutineLockItem, CoroutineLockTag, DecoratorCollector, Entity, EntityCenter, EventCom, EventDecorator, EventDecoratorType, EventHandlerTag, EventSystem, Game, IPEndPoint, IdGenerator, IdStruct, InstanceIdStruct, JsHelper, Logger, LoginCom, MoyeAssets, MoyeViewMgr, MsgHandlerDecorator, MsgHandlerDecoratorType, MsgMgr, MsgSerializeMgr, MultiMap, NetCom, NetServices, NetworkErrorCode, ObjectPool, ObjectWait, Options, Program, RecycleObj, Root, RoundBoxSprite, Scene, SceneFactory, SceneRefCom, SceneType, Session, SessionCom, Singleton, SizeFollow, SpeedType, Task, TimeHelper, TimeInfo, TimerMgr, UIControlType, UIController, UIControllerAttr, UIControllerIndex, UIControllerIndexMask, UIControllerListener, ViewDecorator, ViewDecoratorType, ViewLayer, WChannel, WService, WaitError, YYJJoystick, YYJJoystickCom, YYJJoystickListener, YYJJoystickMoveEvent, YYJJoystickSpeedChangeEvent, error, log, safeCall, warn };
