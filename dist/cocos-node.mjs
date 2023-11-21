import Long from 'long';

/**
 * 单例基类
 */
class Singleton {
    constructor() {
        this._isDisposed = false;
    }
    static getInst() {
        let self = this;
        ///@ts-ignore
        let inst = self._inst;
        if (inst == null) {
            throw new Error(`Singleton is not initialized, name is ${self.name}`);
        }
        return inst;
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

class Options extends Singleton {
    constructor() {
        super(...arguments);
        /**
         * 是否是服务端
         */
        this.isServer = false;
        /**
         * 进程序号
         */
        this.process = 1;
        /**
         * 区id
         */
        this.zone = 1;
        /**
         * log等级 越低输出信息越多
         * 不能控制框架层的输出
         */
        this.logLevel = 1;
        /**
         * 是否开发阶段
         * 开发阶段log会输出到控制台
         * 所以不要在生产环境设置为true
         */
        this.develop = true;
        /**
         * 控制台命令行输入
         */
        this.console = false;
        this._argsMap = new Map();
    }
    _setArgs(key, value) {
        this._argsMap.set(key, value);
    }
    /**
     * 获取启动参数
     * key 大小写敏感
     * @param key
     * @returns
     */
    getArgs(key) {
        {
            if (!this._argsMap.has(key)) {
                throw new Error(`Options.getArgs ${key} not exist`);
            }
        }
        return this._argsMap.get(key);
    }
}

class TimeInfo extends Singleton {
    awake() {
        this.serverMinusClientTime = 0;
        this.frameTime = this.clientNow();
    }
    get ServerMinusClientTime() {
        return this.serverMinusClientTime;
    }
    set ServerMinusClientTime(value) {
        this.serverMinusClientTime = value;
    }
    update() {
        this.frameTime = this.clientNow();
    }
    clientNow() {
        return Math.floor(Date.now());
    }
    serverNow() {
        return this.clientNow() + this.serverMinusClientTime;
    }
    clientFrameTime() {
        return this.frameTime;
    }
    serverFrameTime() {
        return this.frameTime + this.serverMinusClientTime;
    }
}

class JsHelper {
    static getMethodName() {
        let e = new Error();
        let str = e.stack.split("at ")[2];
        let endPos = str.indexOf(" ");
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
        let hash = this.getStringHashCode(str);
        let result = hash % mode;
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
        let ret;
        // 开发阶段打印出错误
        if (typeof str != "string") {
            {
                let err = new Error('formatStr args[0] is not string');
                return err.name + err.stack;
            }
        }
        if (args.length == 0) {
            return str;
        }
        // 将{0}{1}替换成对应的参数 同时允许{{}}转化为{} 
        ret = str.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
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

/**
 * Logger
 */
class Logger extends Singleton {
    set iLog(value) {
        this._iLog = value;
    }
    log(str, ...args) {
        if (this.checkLogLevel(Logger.LOG_LEVEL)) {
            let formatStr = JsHelper.formatStr(str, ...args);
            this._iLog.log(formatStr);
        }
    }
    warn(str, ...args) {
        if (this.checkLogLevel(Logger.WARN_LEVEL)) {
            let formatStr = JsHelper.formatStr(str, ...args);
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
        let formatStr = JsHelper.formatStr(str, ...args);
        let e = new Error();
        let errStr = JsHelper.formatStr('{0}, stack: {1}', formatStr, e.stack);
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
        let formatStr = JsHelper.formatStr(str, ...args);
        this._iLog.log(formatStr);
    }
    /**
     * 不受logLevel影响的log
     * @param str
     * @param args
     */
    coreWarn(str, ...args) {
        let formatStr = JsHelper.formatStr(str, ...args);
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
        let formatStr = JsHelper.formatStr(str, ...args);
        let e = new Error();
        let errStr = JsHelper.formatStr('{0}, stack: {1}', formatStr, e.stack);
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
    let formatStr = JsHelper.formatStr(str, ...args);
    let output = `[core]: ${formatStr}`;
    try {
        let inst = Logger.getInst();
        inst.coreLog(output);
    }
    catch (e) {
        console.log(output);
    }
}
function coreWarn(str, ...args) {
    let formatStr = JsHelper.formatStr(str, ...args);
    let output = `[core]: ${formatStr}`;
    try {
        let inst = Logger.getInst();
        inst.coreWarn(output);
    }
    catch (e) {
        console.warn(output);
    }
}
function coreError(str, ...args) {
    let formatStr = JsHelper.formatStr(str, ...args);
    let output = `[core]: ${formatStr}`;
    try {
        let inst = Logger.getInst();
        inst.coreError(output);
    }
    catch (e) {
        console.error(output);
    }
}

class IdStruct {
    static generate() {
        if (this.lastTime == 0) {
            this.lastTime = this.timeSinceEpoch();
            if (this.lastTime <= 0) {
                coreWarn(`${(new this).constructor.name}: lastTime less than 0: ${this.lastTime}`);
                this.lastTime = 1;
            }
        }
        let time = this.timeSinceEpoch();
        if (time > this.lastTime) {
            this.lastTime = time;
            this.idCount = 0;
        }
        else {
            ++this.idCount;
            if (this.idCount > IdStruct.PowValueBit) {
                ++this.lastTime; // 借用下一秒
                this.idCount = 0;
                coreError(`${(new this).constructor.name}: idCount per sec overflow: ${time} ${this.lastTime}`);
            }
        }
        let struct = new this();
        struct.initArgs3(this.lastTime, Options.getInst().process, this.idCount);
        return struct.ToLong();
    }
    static timeSinceEpoch() {
        let a = (TimeInfo.getInst().frameTime - this.epoch) / 1000;
        return Math.floor(a);
    }
    ToLong() {
        let result = this.result.toNumber();
        return result;
    }
    initArgs1(id) {
        this.result = Long.fromNumber(id, true);
        this.Time = this.result.and(IdStruct.PowTimeBit).toNumber();
        this.Process = this.result.shiftRight(IdStruct.TimeBit)
            .and(IdStruct.PowProcessBit).toNumber();
        this.Value = this.result.shiftRight(IdStruct.TimeBit + IdStruct.ProcessBit)
            .and(IdStruct.PowValueBit).toNumber();
        return this;
    }
    initArgs2(process, value) {
        this.Time = 0;
        this.Process = process;
        this.Value = value;
        this.updateResult();
    }
    initArgs3(time, process, value) {
        this.Time = time;
        this.Process = process;
        this.Value = value;
        this.updateResult();
        return this;
    }
    updateResult() {
        this.result = Long.fromInt(0, true).or(this.Value)
            .shiftLeft(IdStruct.ProcessBit).or(this.Process)
            .shiftLeft(IdStruct.TimeBit).or(this.Time);
    }
}
IdStruct.epoch = new Date(2023, 4, 1).getTime();
IdStruct.lastTime = 0;
IdStruct.idCount = 0;
/**
 * 可用时间(s)
 * 8.5年
 */
IdStruct.TimeBit = 28; // 可用时间(s)
/**
 * 最大进程数量
 * 单区255进程
 */
IdStruct.ProcessBit = 8; // 最大进程数量
/**
 * 每秒可以产生的数量
 * 13w每秒
 */
IdStruct.ValueBit = 17; // 每秒可以产生的数量
IdStruct.PowTimeBit = Math.pow(2, IdStruct.TimeBit) - 1;
IdStruct.PowProcessBit = Math.pow(2, IdStruct.ProcessBit) - 1;
IdStruct.PowValueBit = Math.pow(2, IdStruct.ValueBit) - 1;

class InstanceIdStruct {
    static generate() {
        if (this.lastTime == 0) {
            this.lastTime = this.timeSinceEpoch();
            if (this.lastTime <= 0) {
                coreWarn(`${(new this).constructor.name}: lastTime less than 0: ${this.lastTime}`);
                this.lastTime = 1;
            }
        }
        let time = this.timeSinceEpoch();
        if (time > this.lastTime) {
            this.lastTime = time;
            this.idCount = 0;
        }
        else {
            ++this.idCount;
            if (this.idCount > InstanceIdStruct.PowValueBit) {
                ++this.lastTime; // 借用下一秒
                this.idCount = 0;
                coreError(`${(new this).constructor.name}: idCount per sec overflow: ${time} ${this.lastTime}`);
            }
        }
        let struct = new this();
        struct.initArgs3(this.lastTime, Options.getInst().process, this.idCount);
        return struct.ToLong();
    }
    static timeSinceEpoch() {
        let a = (TimeInfo.getInst().frameTime - this.epoch) / 1000;
        return Math.floor(a);
    }
    ToLong() {
        let result = this.result.toNumber();
        return result;
    }
    initArgs1(id) {
        this.result = Long.fromNumber(id, true);
        this.Time = this.result.and(InstanceIdStruct.PowTimeBit).toNumber();
        this.Process = this.result.shiftRight(InstanceIdStruct.TimeBit)
            .and(InstanceIdStruct.PowProcessBit).toNumber();
        this.Value = this.result.shiftRight(InstanceIdStruct.TimeBit + InstanceIdStruct.ProcessBit)
            .and(InstanceIdStruct.PowValueBit).toNumber();
        return this;
    }
    initArgs2(process, value) {
        this.Time = 0;
        this.Process = process;
        this.Value = value;
        this.updateResult();
    }
    initArgs3(time, process, value) {
        this.Time = time;
        this.Process = process;
        this.Value = value;
        this.updateResult();
        return this;
    }
    updateResult() {
        this.result = Long.fromInt(0, true).or(this.Value)
            .shiftLeft(InstanceIdStruct.ProcessBit).or(this.Process)
            .shiftLeft(InstanceIdStruct.TimeBit).or(this.Time);
    }
}
InstanceIdStruct.epoch = new Date(2023, 4, 2).getTime();
InstanceIdStruct.lastTime = 0;
InstanceIdStruct.idCount = 0;
/**
 * 可用时间(s)
 * 8.5年
 */
InstanceIdStruct.TimeBit = 28;
/**
 * 最大进程数量
 * 单区255进程
 */
InstanceIdStruct.ProcessBit = 8;
/**
 * 每秒可以产生的数量
 * 13w每秒
 */
InstanceIdStruct.ValueBit = 17;
InstanceIdStruct.PowTimeBit = Math.pow(2, InstanceIdStruct.TimeBit) - 1;
InstanceIdStruct.PowProcessBit = Math.pow(2, InstanceIdStruct.ProcessBit) - 1;
InstanceIdStruct.PowValueBit = Math.pow(2, InstanceIdStruct.ValueBit) - 1;

class IdGenerator extends Singleton {
    awake() {
    }
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
        let queue = this._pool.get(type);
        if (!queue) {
            return new type();
        }
        if (queue.length === 0) {
            return new type();
        }
        return queue.shift();
    }
    recycle(obj) {
        let type = obj.constructor;
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
        this.allEntities = new Map;
    }
    add(entity) {
        this.allEntities.set(entity.instanceId, entity);
    }
    remove(instanceId) {
        this.allEntities.delete(instanceId);
    }
    get(instanceId) {
        let component = this.allEntities.get(instanceId);
        return component;
    }
}

var InstanceQueueIndex;
(function (InstanceQueueIndex) {
    InstanceQueueIndex[InstanceQueueIndex["None"] = -1] = "None";
    InstanceQueueIndex[InstanceQueueIndex["Update"] = 0] = "Update";
    InstanceQueueIndex[InstanceQueueIndex["LateUpdate"] = 1] = "LateUpdate";
    InstanceQueueIndex[InstanceQueueIndex["Max"] = 2] = "Max";
})(InstanceQueueIndex || (InstanceQueueIndex = {}));

/**
 * 管理实体组件的生命周期
 */
class EntityLifiCycleMgr extends Singleton {
    constructor() {
        super(...arguments);
        this.queues = new Array(InstanceQueueIndex.Max);
    }
    awake() {
        for (let i = 0; i < this.queues.length; i++) {
            this.queues[i] = new Array;
        }
    }
    registerSystem(component) {
        if (component.update) {
            this.queues[InstanceQueueIndex.Update].push(component.instanceId);
        }
        if (component.lateUpdate) {
            this.queues[InstanceQueueIndex.LateUpdate].push(component.instanceId);
        }
    }
    awakeComEvent(component) {
        component.awake();
    }
    destroyComEvent(component) {
        component.destroy();
    }
    update() {
        let queue = this.queues[InstanceQueueIndex.Update];
        let entityCenter = EntityCenter.getInst();
        for (let i = queue.length - 1; i >= 0; i--) {
            let instanceId = queue[i];
            let component = entityCenter.get(instanceId);
            if (!component) {
                queue.splice(i, 1);
                continue;
            }
            if (component.isDisposed) {
                queue.splice(i, 1);
                continue;
            }
            component.update();
        }
    }
    lateUpdate() {
        let queue = this.queues[InstanceQueueIndex.LateUpdate];
        let entityCenter = EntityCenter.getInst();
        for (let i = queue.length - 1; i >= 0; i--) {
            let instanceId = queue[i];
            let component = entityCenter.get(instanceId);
            if (!component) {
                queue.splice(i, 1);
                continue;
            }
            if (component.isDisposed) {
                queue.splice(i, 1);
                continue;
            }
            component.lateUpdate();
        }
    }
}

var EntityStatus;
(function (EntityStatus) {
    EntityStatus[EntityStatus["None"] = 0] = "None";
    EntityStatus[EntityStatus["IsFromPool"] = 1] = "IsFromPool";
    EntityStatus[EntityStatus["IsRegister"] = 2] = "IsRegister";
    EntityStatus[EntityStatus["IsComponent"] = 4] = "IsComponent";
    EntityStatus[EntityStatus["IsCreated"] = 8] = "IsCreated";
    EntityStatus[EntityStatus["IsNew"] = 16] = "IsNew";
})(EntityStatus || (EntityStatus = {}));
class Entity {
    constructor() {
        this.status = EntityStatus.None;
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
        let preDomain = this._domain;
        this._domain = value;
        if (preDomain == null) {
            this.instanceId = IdGenerator.getInst().generateInstanceId();
            this.isRegister = true;
        }
        // 递归设置孩子的Domain
        if (this._children != null) {
            for (let [id, entity] of this._children.entries()) {
                entity.domain = this._domain;
            }
        }
        if (this._components != null) {
            for (let [type, component] of this._components.entries()) {
                component.domain = this._domain;
            }
        }
        if (!this.isCreated) {
            this.isCreated = true;
        }
    }
    get isDisposed() {
        return this.instanceId == 0;
    }
    get children() {
        return this._children ?? (this._children = ObjectPool.getInst().fetch((Map)));
    }
    get components() {
        return this._components ?? (this._components = ObjectPool.getInst().fetch((Map)));
    }
    get isFromPool() {
        return (this.status & EntityStatus.IsFromPool) == EntityStatus.IsFromPool;
    }
    set isFromPool(value) {
        if (value) {
            this.status |= EntityStatus.IsFromPool;
        }
        else {
            this.status &= ~EntityStatus.IsFromPool;
        }
    }
    get isComponent() {
        return (this.status & EntityStatus.IsComponent) == EntityStatus.IsComponent;
    }
    set isComponent(value) {
        if (value) {
            this.status |= EntityStatus.IsComponent;
        }
        else {
            this.status &= ~EntityStatus.IsComponent;
        }
    }
    get isCreated() {
        return (this.status & EntityStatus.IsCreated) == EntityStatus.IsCreated;
    }
    set isCreated(value) {
        if (value) {
            this.status |= EntityStatus.IsCreated;
        }
        else {
            this.status &= ~EntityStatus.IsCreated;
        }
    }
    get isNew() {
        return (this.status & EntityStatus.IsNew) == EntityStatus.IsNew;
    }
    set isNew(value) {
        if (value) {
            this.status |= EntityStatus.IsNew;
        }
        else {
            this.status &= ~EntityStatus.IsNew;
        }
    }
    get isRegister() {
        return (this.status & EntityStatus.IsRegister) == EntityStatus.IsRegister;
    }
    set isRegister(value) {
        if (this.isRegister == value) {
            return;
        }
        if (value) {
            this.status |= EntityStatus.IsRegister;
        }
        else {
            this.status &= ~EntityStatus.IsRegister;
        }
        if (!value) {
            EntityCenter.getInst().remove(this.instanceId);
        }
        else {
            EntityCenter.getInst().add(this);
            EntityLifiCycleMgr.getInst().registerSystem(this);
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
    addComponent(componentOrType, isFromPool) {
        if (componentOrType instanceof Entity) {
            return this.addComponentByEntity(componentOrType);
        }
        else {
            return this.addComponentByCtor(componentOrType, isFromPool);
        }
    }
    tryAddComponent(type) {
        let com = this.getComponent(type);
        if (com == null) {
            com = this.addComponent(type);
        }
        return com;
    }
    addComponentByEntity(component) {
        let type = component.constructor;
        if (this._components != null && this._components.has(type)) {
            throw new Error(`entity already has component: ${type.name}`);
        }
        component.componentParent = this;
        return component;
    }
    addComponentByCtor(type, isFromPool = false) {
        if (this._components != null && this._components.has(type)) {
            throw new Error(`entity already has component: ${type.name}`);
        }
        let component = this.create(type, isFromPool);
        component.id = this.id;
        component.componentParent = this;
        if (component.awake) {
            EntityLifiCycleMgr.getInst().awakeComEvent(component);
        }
        return component;
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
        let component = this.create(type, isFromPool);
        component.id = id;
        component.parent = this;
        if (component.awake) {
            EntityLifiCycleMgr.getInst().awakeComEvent(component);
        }
        return component;
    }
    addChildByEntity(entity) {
        entity.parent = this;
        return entity;
    }
    addChildByType(type, isFromPool = false) {
        let component = this.create(type, isFromPool);
        component.id = IdGenerator.getInst().generateId();
        component.parent = this;
        if (component.awake) {
            EntityLifiCycleMgr.getInst().awakeComEvent(component);
        }
        return component;
    }
    create(type, isFromPool) {
        let component;
        if (isFromPool) {
            component = ObjectPool.getInst().fetch(type);
        }
        else {
            component = new type;
        }
        component.isFromPool = isFromPool;
        component.isCreated = true;
        component.isNew = true;
        component.id = 0;
        return component;
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
    getComponent(type) {
        if (this._components == null) {
            return null;
        }
        let component = this._components.get(type);
        if (!component) {
            return null;
        }
        return component;
    }
    removeComponent(type) {
        if (this.isDisposed) {
            return;
        }
        if (this._components == null) {
            return;
        }
        let c = this.getComponent(type);
        if (c == null) {
            return;
        }
        this.removeFromComponents(c);
        c.dispose();
    }
    getParent(type) {
        return this.parent;
    }
    getChild(type, id) {
        if (this._children == null) {
            return null;
        }
        let child = this._children.get(id);
        return child;
    }
    removeChild(id) {
        if (this._children == null) {
            return;
        }
        let child = this._children.get(id);
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
        this.instanceId = 0;
        // 清理Children
        if (this._children != null) {
            for (let [id, entity] of this._children.entries()) {
                entity.dispose();
            }
            this._children.clear();
            ObjectPool.getInst().recycle(this._children);
            this._children = null;
        }
        // 清理Component
        if (this._components != null) {
            for (let [entityCtor, entity] of this._components.entries()) {
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
                this._parent.removeComponent(this.getType());
            }
            else {
                this._parent.removeFromChildren(this);
            }
        }
        this._parent = null;
        if (this.isFromPool) {
            ObjectPool.getInst().recycle(this);
        }
        this.status = EntityStatus.None;
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
    SceneType["None"] = "None";
    SceneType["Process"] = "Process";
    SceneType["Client"] = "Client";
    SceneType["Current"] = "Current";
})(SceneType || (SceneType = {}));

/**
 * 保存根节点
 */
class Root extends Singleton {
    get scene() {
        return this._scene;
    }
    awake() {
        let scene = new Scene();
        scene.init({
            id: 0,
            sceneType: SceneType.Process,
            name: "Process",
            instanceId: IdGenerator.getInst().generateInstanceId(),
        });
        this._scene = scene;
    }
}

export { Entity, EntityLifiCycleMgr, Logger, ObjectPool, Root, Scene, SceneType, error, log, warn };
