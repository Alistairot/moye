import Long from 'long'
import { Options } from "../Options/Options";
import { TimeInfo } from "../Time/TimeInfo";
import { coreError, coreWarn } from '../Logger/CoreLogHelper';

export class IdStruct {
    public static epoch = new Date(2023, 4, 1).getTime();
    public static lastTime = 0;
    public static idCount: number = 0;
    /**
     * 可用时间(s)
     * 8.5年
     */
    public static TimeBit = 28;     // 可用时间(s)
    /**
     * 最大进程数量
     * 单区255进程
     */
    public static ProcessBit = 8;   // 最大进程数量
    /**
     * 每秒可以产生的数量
     * 13w每秒
     */
    public static ValueBit = 17;    // 每秒可以产生的数量
    public static PowTimeBit = Math.pow(2, IdStruct.TimeBit) - 1;
    public static PowProcessBit = Math.pow(2, IdStruct.ProcessBit) - 1;
    public static PowValueBit = Math.pow(2, IdStruct.ValueBit) - 1;

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

            if (this.idCount > IdStruct.PowValueBit) {
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

        this.Time = this.result.and(IdStruct.PowTimeBit).toNumber();
        this.Process = this.result.shiftRight(IdStruct.TimeBit)
            .and(IdStruct.PowProcessBit).toNumber();
        this.Value = this.result.shiftRight(IdStruct.TimeBit + IdStruct.ProcessBit)
            .and(IdStruct.PowValueBit).toNumber();

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
            .shiftLeft(IdStruct.ProcessBit).or(this.Process)
            .shiftLeft(IdStruct.TimeBit).or(this.Time)
    }
}