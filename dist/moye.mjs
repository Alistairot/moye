import { UITransform, CCFloat, _decorator, Component, Size, NodeEventType, Enum, Vec3, Label, v3, dynamicAtlasManager, Sprite, SpriteAtlas, CCInteger, SpriteFrame, UIRenderer, cclegacy, InstanceMaterialType, RenderTexture, Material } from 'cc';
import { EDITOR, BUILD } from 'cc/env';

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

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$2, property: property$2, menu: menu$2 } = _decorator;
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
        let selfTrans = this.node.getComponent(UITransform);
        let targetTrans = this._target;
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
        let selfTrans = this.node.getComponent(UITransform);
        let targetTrans = this._target;
        if (this._widthFollow) {
            let selfWidth = selfTrans.width;
            let targetWidth = targetTrans.width;
            this._widthOffset = selfWidth - targetWidth;
        }
        if (this._heightFollow) {
            let selfHeight = selfTrans.height;
            let targetHeight = targetTrans.height;
            this._heightOffset = selfHeight - targetHeight;
        }
    }
};
__decorate$2([
    property$2({ type: UITransform })
], SizeFollow.prototype, "target", null);
__decorate$2([
    property$2({ type: UITransform })
], SizeFollow.prototype, "_target", void 0);
__decorate$2([
    property$2
], SizeFollow.prototype, "heightFollow", null);
__decorate$2([
    property$2
], SizeFollow.prototype, "_heightFollow", void 0);
__decorate$2([
    property$2
], SizeFollow.prototype, "widthFollow", null);
__decorate$2([
    property$2
], SizeFollow.prototype, "_widthFollow", void 0);
__decorate$2([
    property$2({ type: CCFloat })
], SizeFollow.prototype, "_heightOffset", void 0);
__decorate$2([
    property$2({ type: CCFloat })
], SizeFollow.prototype, "_widthOffset", void 0);
SizeFollow = __decorate$2([
    ccclass$2('SizeFollow'),
    menu$2('moye/SizeFollow')
], SizeFollow);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass: ccclass$1, property: property$1, executeInEditMode, menu: menu$1 } = _decorator;
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
            let posChange = this._targetOldPos.y - this._target.node.position.y;
            let sizeChange = this._target.height - this._targetOldSize;
            let anchorY = this._trans.anchorY;
            this._changePos.set(this._selfOldPos);
            if (this._target.getComponent(Label) && !this._target.node.active) {
                sizeChange = this._targetOldSize;
            }
            let realChange = posChange + sizeChange;
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
        let selfTrans = this._trans;
        let targetTrans = this._target;
        let targetPos = this.getPos(targetTrans, this._targetDir);
        let pos = targetPos - this._distance;
        this._changePos.set(this.node.worldPosition);
        if (this._isVertical) {
            switch (this._dir) {
                case WidgetDirection.TOP: {
                    let height = selfTrans.height;
                    let anchorY = selfTrans.anchorY;
                    pos -= height * (1 - anchorY);
                    break;
                }
                case WidgetDirection.BOTTOM: {
                    let height = selfTrans.height;
                    let anchorY = selfTrans.anchorY;
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
        let selfTrans = this.node.getComponent(UITransform);
        let targetTrans = this._target;
        let selfPos = this.getPos(selfTrans, this._dir);
        let targetPos = this.getPos(targetTrans, this._targetDir);
        this._distance = targetPos - selfPos;
    }
    getPos(trans, dir) {
        if (this._isVertical) {
            let y = trans.node.worldPosition.y;
            let height = trans.height;
            let anchorY = trans.anchorY;
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
            let x = trans.node.worldPosition.x;
            let width = trans.width;
            let anchorX = trans.anchorX;
            switch (dir) {
                case WidgetDirection.LEFT:
                    return x - width * anchorX;
                case WidgetDirection.RIGHT:
                    return x + width * (1 - anchorX);
            }
        }
    }
};
__decorate$1([
    property$1({ type: UITransform })
], CTWidget.prototype, "target", null);
__decorate$1([
    property$1({ type: UITransform })
], CTWidget.prototype, "_target", void 0);
__decorate$1([
    property$1({ type: Enum(WidgetBase) })
], CTWidget.prototype, "targetDir", null);
__decorate$1([
    property$1
], CTWidget.prototype, "_targetDir", void 0);
__decorate$1([
    property$1({ type: Enum(WidgetDirection) })
], CTWidget.prototype, "dir", null);
__decorate$1([
    property$1
], CTWidget.prototype, "_dir", void 0);
__decorate$1([
    property$1({ type: CCFloat })
], CTWidget.prototype, "visibleOffset", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_isVertical", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_distance", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_changePos", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_targetOldPos", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_targetOldSize", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_selfOldPos", void 0);
__decorate$1([
    property$1
], CTWidget.prototype, "_selfOldSize", void 0);
CTWidget = __decorate$1([
    ccclass$1('CTWidget'),
    menu$1('moye/CTWidget'),
    executeInEditMode
], CTWidget);

const RoundBoxAssembler = {
    // 根据圆角segments参数，构造网格的顶点索引列表
    GetIndexBuffer(sprite) {
        let indexBuffer = [
            0, 1, 2, 2, 3, 0,
            4, 5, 6, 6, 7, 4,
            8, 9, 10, 10, 11, 8
        ];
        // 为四个角的扇形push进索引值
        let index = 12;
        let fanIndexBuild = function (center, start, end) {
            let last = start;
            for (let i = 0; i < sprite.segments - 1; i++) {
                // 左上角 p2为扇形圆心，p1/p5为两个边界
                let cur = index;
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
        let vNum = 12 + (sprite.segments - 1) * corner;
        renderData.dataLength = vNum;
        renderData.resize(vNum, 18 + sprite.segments * 3 * corner);
        let indexBuffer = RoundBoxAssembler.GetIndexBuffer(sprite);
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
        let indexBuffer = RoundBoxAssembler.GetIndexBuffer(sprite);
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
        let fanPosBuild = function (center, startAngle) {
            for (let i = 1; i < sprite.segments; i++) {
                // 我这里顶点都是按顺时针分配的，所以角度要从开始角度减
                // 每个扇形都是90度
                let angle = startAngle * Math.PI / 180 - i / sprite.segments * 0.5 * Math.PI;
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

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { ccclass, property, type, menu } = _decorator;
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
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_sizeMode", void 0);
__decorate([
    type(Sprite.SizeMode)
], RoundBoxSprite.prototype, "sizeMode", null);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_atlas", void 0);
__decorate([
    type(SpriteAtlas)
], RoundBoxSprite.prototype, "spriteAtlas", null);
__decorate([
    property({ type: CCInteger, serializable: true })
], RoundBoxSprite.prototype, "_segments", void 0);
__decorate([
    property({ type: CCInteger, serializable: true, min: 1 })
], RoundBoxSprite.prototype, "segments", null);
__decorate([
    property({ type: CCFloat, serializable: true })
], RoundBoxSprite.prototype, "_radius", void 0);
__decorate([
    property({ type: CCFloat, serializable: true, min: 0 })
], RoundBoxSprite.prototype, "radius", null);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_spriteFrame", void 0);
__decorate([
    type(SpriteFrame)
], RoundBoxSprite.prototype, "spriteFrame", null);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_leftTop", void 0);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "leftTop", null);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_rightTop", void 0);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "rightTop", null);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_leftBottom", void 0);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "leftBottom", null);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "_rightBottom", void 0);
__decorate([
    property({ serializable: true })
], RoundBoxSprite.prototype, "rightBottom", null);
RoundBoxSprite = __decorate([
    ccclass('RoundBoxSprite'),
    menu('moye/RoundBoxSprite')
], RoundBoxSprite);

export { CTWidget, IdGenerator, Logger, ObjectPool, RoundBoxSprite, SizeFollow, error, log, warn };
