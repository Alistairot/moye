import { Options } from "../Options/Options";
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
    private static lastTime = 0;
    private static idCount: number = 0;
    
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

        
        let struct = IdStruct.inst;
        struct.init(this.lastTime, Options.getInst().process, this.idCount);

        return struct.result;
    }

    static convertToId(time: number, process: number, value: number): bigint {
        let id = IdStruct.inst.init(time, process, value).result;

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
        let a = (TimeInfo.getInst().clientNow() - epoch) / 1000;
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