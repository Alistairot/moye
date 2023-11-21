import { Component } from 'cc';

/**
 * 单例基类
 */
class Singleton {
    constructor() {
        this._isDisposed = false;
    }
    static getInst() {
        let self = this;
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

class SizeFollow extends Component {
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
            if (this.idCount > powValueBit$1) {
                ++this.lastTime; // 借用下一秒
                this.idCount = 0;
                coreError(`${(new this).constructor.name}: idCount per sec overflow: ${time} ${this.lastTime}`);
            }
        }
        let struct = IdStruct.inst;
        struct.init(this.lastTime, Options.getInst().process, this.idCount);
        return struct.result;
    }
    static convertToId(time, process, value) {
        let id = IdStruct.inst.init(time, process, value).result;
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
        let a = (TimeInfo.getInst().clientNow() - epoch$1) / 1000;
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
IdStruct.lastTime = 0;
IdStruct.idCount = 0;

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
            if (this.idCount > powValueBit) {
                ++this.lastTime; // 借用下一秒
                this.idCount = 0;
                coreError(`${(new this).constructor.name}: idCount per sec overflow: ${time} ${this.lastTime}`);
            }
        }
        let struct = InstanceIdStruct.inst;
        struct.init(this.lastTime, this.idCount);
        return struct.result;
    }
    static convertToId(time, value) {
        let id = InstanceIdStruct.inst.init(time, value).result;
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
        let a = (TimeInfo.getInst().clientNow() - epoch) / 1000;
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
InstanceIdStruct.lastTime = 0;
InstanceIdStruct.idCount = 0;

class IdGenerator extends Singleton {
    generateInstanceId() {
        return InstanceIdStruct.generate();
    }
    generateId() {
        return IdStruct.generate();
    }
}

export { IdGenerator, Logger, ObjectPool, SizeFollow, error, log, warn };
