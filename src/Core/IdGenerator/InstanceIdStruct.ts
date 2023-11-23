import { TimeInfo } from "../Time/TimeInfo";
import { coreError, coreWarn } from '../Logger/CoreLogHelper';
import { IdGeneratorTag } from "./LogTag";

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

export class InstanceIdStruct {
    private static _lastTime = 0;
    private static _idCount: number = 0;

    private static _inst: InstanceIdStruct;
    private static get inst() {
        if (InstanceIdStruct._inst == null) {
            InstanceIdStruct._inst = new InstanceIdStruct();
        }

        return InstanceIdStruct._inst;
    }

    time: bigint;
    value: bigint;
    result: bigint;

    static generate(): bigint {
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

    static convertToId(time: number, value: number): bigint {
        const id = InstanceIdStruct.inst.init(time, value).result;

        return id;
    }

    /**
     * convert id to 2 args
     * not reference return value
     * @param id bigint
     * @returns 
     */
    static parseId(id: bigint): InstanceIdStruct {
        return InstanceIdStruct.inst.initById(id);
    }

    private static timeSinceEpoch(): number {
        const a = (TimeInfo.get().clientNow() - epoch) / 1000;
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

        this.value = id & powValueBit;

        return this;
    }

    init(time: number, value: number) {
        this.time = BigInt(time);
        this.value = BigInt(value);

        this.updateResult();

        return this;
    }

    private updateResult() {
        this.result = this.value;

        this.result <<= timeBit;
        this.result |= this.time;
    }
}