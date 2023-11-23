import { _decorator, Component, director } from 'cc';

/**
 * 单例基类
 */
class Singleton {
    constructor() {
        this._isDisposed = false;
    }
    static getInst() {
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
                const err = new Error('formatStr args[0] is not string');
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
        const e = new Error();
        const errStr = JsHelper.formatStr('{0}, stack: {1}', formatStr, e.stack);
        this._iLog.error(errStr);
    }
    checkLogLevel(level) {
        return Options.getInst().logLevel <= level;
    }
    /**
     * 不受logLevel影响的log
     * @param str
     * @param args
     */
    coreLog(str, ...args) {
        const formatStr = JsHelper.formatStr(str, ...args);
        this._iLog.log(formatStr);
    }
    /**
     * 不受logLevel影响的log
     * @param str
     * @param args
     */
    coreWarn(str, ...args) {
        const formatStr = JsHelper.formatStr(str, ...args);
        this._iLog.warn(formatStr);
    }
    /**
     * 错误打印会带上堆栈 用于定位错误
     * 错误打印不会受到logLevel的影响 一定会打印
     * 非必要不要调用这个 特别是不要在在循环里面调用 否则日志文件两下就爆炸了
     * @param str
     * @param args
     */
    coreError(str, ...args) {
        const formatStr = JsHelper.formatStr(str, ...args);
        const e = new Error();
        const errStr = JsHelper.formatStr('{0}, stack: {1}', formatStr, e.stack);
        this._iLog.error(errStr);
    }
}
Logger.LOG_LEVEL = 1;
Logger.WARN_LEVEL = 2;
function log(str, ...args) {
    Logger.getInst().log(str, ...args);
}
function warn(str, ...args) {
    Logger.getInst().warn(str, ...args);
}
function error(str, ...args) {
    Logger.getInst().error(str, ...args);
}

// 框架内部用这个log 区分外部的log 不进行导出
function coreLog(str, ...args) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[core]: ${formatStr}`;
    try {
        const inst = Logger.getInst();
        inst.coreLog(output);
    }
    catch (e) {
        console.log(output);
    }
}
function coreWarn(str, ...args) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[core]: ${formatStr}`;
    try {
        const inst = Logger.getInst();
        inst.coreWarn(output);
    }
    catch (e) {
        console.warn(output);
    }
}
function coreError(str, ...args) {
    const formatStr = JsHelper.formatStr(str, ...args);
    const output = `[core]: ${formatStr}`;
    try {
        const inst = Logger.getInst();
        inst.coreError(output);
    }
    catch (e) {
        console.error(output);
    }
}

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
const powTimeBit$1 = 2n ** timeBit$1 - 1n;
const powProcessBit = 2n ** processBit - 1n;
const powValueBit$1 = 2n ** valueBit$1 - 1n;
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
                coreWarn(`${(new this).constructor.name}: lastTime less than 0: ${this._lastTime}`);
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
                coreError(`${(new this).constructor.name}: idCount per sec overflow: ${time} ${this._lastTime}`);
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
        const a = (TimeInfo.getInst().clientNow() - epoch$1) / 1000;
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
const powTimeBit = 2n ** timeBit - 1n;
const powValueBit = 2n ** valueBit - 1n;
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
                coreWarn(`${(new this).constructor.name}: lastTime less than 0: ${this._lastTime}`);
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
                coreError(`${(new this).constructor.name}: idCount per sec overflow: ${time} ${this._lastTime}`);
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
        const a = (TimeInfo.getInst().clientNow() - epoch) / 1000;
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
        const entityCenter = EntityCenter.getInst();
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
        const entityCenter = EntityCenter.getInst();
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
            this.instanceId = IdGenerator.getInst().generateInstanceId();
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
        return this._children ?? (this._children = ObjectPool.getInst().fetch((Map)));
    }
    get components() {
        return this._components ?? (this._components = ObjectPool.getInst().fetch((Map)));
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
            EntityCenter.getInst().remove(this.instanceId);
        }
        else {
            const self = this;
            EntityCenter.getInst().add(self);
            EntityLifiCycleMgr.getInst().registerSystem(self);
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
            EntityLifiCycleMgr.getInst().awakeComEvent(com);
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
            EntityLifiCycleMgr.getInst().awakeComEvent(entity);
        }
        return entity;
    }
    addChildByEntity(entity) {
        entity.parent = this;
        return entity;
    }
    addChildByType(type, isFromPool = false) {
        const entity = this.create(type, isFromPool);
        entity.id = IdGenerator.getInst().generateId();
        entity.parent = this;
        if (entity.awake) {
            EntityLifiCycleMgr.getInst().awakeComEvent(entity);
        }
        return entity;
    }
    create(type, isFromPool) {
        let inst;
        if (isFromPool) {
            inst = ObjectPool.getInst().fetch(type);
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
            ObjectPool.getInst().recycle(this._children);
            this._children = null;
        }
    }
    removeFromComponents(component) {
        if (this._components == null) {
            return;
        }
        this._components.delete(component.constructor);
        if (this._components.size == 0) {
            ObjectPool.getInst().recycle(this._components);
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
            ObjectPool.getInst().recycle(this._children);
            this._children = null;
        }
        // 清理Component
        if (this._components != null) {
            for (const [entityCtor, entity] of this._components.entries()) {
                entity.dispose();
            }
            this._components.clear();
            ObjectPool.getInst().recycle(this._components);
            this._components = null;
        }
        // 触发Destroy事件
        if (this.destroy) {
            EntityLifiCycleMgr.getInst().destroyComEvent(this);
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
            ObjectPool.getInst().recycle(this);
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
        coreLog(`scene create sceneType = {0}, name = {1}, id = {2}`, this.sceneType, this.name, this.id);
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
        const event = ObjectPool.getInst().fetch(this);
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
            ObjectPool.getInst().recycle(this);
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

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass, property } = _decorator;
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
MoyeRuntime = __decorate([
    ccclass('MoyeRuntime')
], MoyeRuntime);

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
            instanceId: IdGenerator.getInst().generateInstanceId(),
        });
        this._scene = scene;
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
        coreError(e?.stack);
    }
}

class AEventHandler {
    async handleAsync(scene, a) {
        try {
            await this.run(scene, a);
        }
        catch (e) {
            if (e instanceof Error) {
                coreError(e.stack);
            }
            else {
                coreError(e);
            }
        }
    }
    handle(scene, a) {
        try {
            const ret = this.run(scene, a);
            if (ret instanceof Promise) {
                coreWarn('{0}的run方法是异步的, 请尽量不要用publish来通知', this.constructor.name);
                safeCall(ret);
            }
        }
        catch (e) {
            if (e instanceof Error) {
                coreError(e.stack);
            }
            else {
                coreError(e);
            }
        }
    }
}

export { AEvent, AEventHandler, AfterProgramInit, AfterProgramStart, AfterSingletonAdd, BeforeProgramInit, BeforeProgramStart, BeforeSingletonAdd, DecoratorCollector, Entity, EntityCenter, EventDecorator, EventDecoratorType, EventSystem, Game, IdGenerator, IdStruct, InstanceIdStruct, JsHelper, Logger, ObjectPool, Options, Program, RecycleObj, Scene, SceneType, Singleton, TimeInfo, error, log, safeCall, warn };
