import Long from 'long'
import { Options } from "../Options/Options";
import { TimeInfo } from "../Time/TimeInfo";
import { coreError, coreWarn } from '../Logger/CoreLogHelper';

export class InstanceIdStruct {
    public static epoch = new Date(2023, 4, 2).getTime();
    public static lastTime = 0;
    public static idCount: number = 0;
    /**
     * 可用时间(s)
     * 8.5年
     */
    public static TimeBit = 28;
    /**
     * 最大进程数量
     * 单区255进程
     */
    public static ProcessBit = 8;
    /**
     * 每秒可以产生的数量
     * 13w每秒
     */
    public static ValueBit = 17;
    
    public static PowTimeBit = Math.pow(2, InstanceIdStruct.TimeBit) - 1;
    public static PowProcessBit = Math.pow(2, InstanceIdStruct.ProcessBit) - 1;
    public static PowValueBit = Math.pow(2, InstanceIdStruct.ValueBit) - 1;

    public Time: number;
    public Process: number;
    public Value: number;
    private result: Long;

    public static generate() {
        if (this.lastTime == 0) {
            this.lastTime = this.timeSinceEpoch()

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
        struct.initArgs3(this.lastTime, Options.getInst().process, this.idCount)

        return struct.ToLong();
    }

    private static timeSinceEpoch(): number {
        let a = (TimeInfo.getInst().frameTime - this.epoch) / 1000;
        return Math.floor(a);
    }

    public ToLong(): number {
        let result = this.result.toNumber()

        return result;
    }

    public initArgs1(id: number) {
        this.result = Long.fromNumber(id, true)

        this.Time = this.result.and(InstanceIdStruct.PowTimeBit).toNumber();
        this.Process = this.result.shiftRight(InstanceIdStruct.TimeBit)
            .and(InstanceIdStruct.PowProcessBit).toNumber();
        this.Value = this.result.shiftRight(InstanceIdStruct.TimeBit + InstanceIdStruct.ProcessBit)
            .and(InstanceIdStruct.PowValueBit).toNumber();

        return this
    }

    public initArgs2(process: number, value: number) {
        this.Time = 0;
        this.Process = process;
        this.Value = value;

        this.updateResult()
    }

    public initArgs3(time: number, process: number, value: number) {
        this.Time = time;
        this.Process = process;
        this.Value = value;

        this.updateResult()

        return this
    }

    public updateResult() {
        this.result = Long.fromInt(0, true).or(this.Value)
            .shiftLeft(InstanceIdStruct.ProcessBit).or(this.Process)
            .shiftLeft(InstanceIdStruct.TimeBit).or(this.Time)
    }
}