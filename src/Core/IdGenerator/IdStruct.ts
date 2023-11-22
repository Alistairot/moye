import { TimeInfo } from "../Time/TimeInfo";
import { coreError, coreWarn } from '../Logger/CoreLogHelper';

/**
 * 可用时间 s
 * 34年
 */
const timeBit = 30n;
/**
 * 最大进程数量
 * 16384
 */
const processBit = 14n;
/**
 * 每秒可以产生的数量
 * 100w/s
 */
const valueBit = 20n;

const powTimeBit = 2n ** timeBit - 1n;
const powProcessBit = 2n ** processBit - 1n;
const powValueBit = 2n ** valueBit - 1n;

const epoch = new Date(2023, 4, 1).getTime();

export class IdStruct {
    private static _lastTime = 0;
    private static _idCount: number = 0;
    
    private static _inst: IdStruct;
    private static get inst() {
        if (IdStruct._inst == null) {
            IdStruct._inst = new IdStruct();
        }

        return IdStruct._inst;
    }

    time: bigint;
    process: bigint;
    value: bigint;
    result: bigint;

    static generate(): bigint {
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

        
        const struct = IdStruct.inst;
        struct.init(this._lastTime, 1, this._idCount);

        return struct.result;
    }

    static convertToId(time: number, process: number, value: number): bigint {
        const id = IdStruct.inst.init(time, process, value).result;

        return id;
    }

    /**
     * convert id to 3 args
     * not reference return value
     * @param id bigint
     * @returns 
     */
    static parseId(id: bigint): IdStruct {
        return IdStruct.inst.initById(id);
    }

    private static timeSinceEpoch(): number {
        const a = (TimeInfo.getInst().clientNow() - epoch) / 1000;
        return Math.floor(a);
    }

    /**
     * convert id to 3 args
     * @param id bigint
     * @returns 
     */
    initById(id: bigint) {
        this.result = id;

        this.time = id & powTimeBit;
        id >>= timeBit;

        this.process = id & powProcessBit;
        id >>= processBit;

        this.value = id & powValueBit;

        return this;
    }

    init(time: number, process: number, value: number) {
        this.time = BigInt(time);
        this.process = BigInt(process);
        this.value = BigInt(value);

        this.updateResult();

        return this;
    }

    private updateResult() {
        this.result = this.value;

        this.result <<= processBit;
        this.result |= this.process;

        this.result <<= timeBit;
        this.result |= this.time;
    }
}