import { DB } from "../Decorator/Decorators/DB";
import { Entity } from "../Entity/Entity";
import { NumericChange } from "../EventSystem/EventCore";
import { EventSystem } from "../EventSystem/EventSystem";

/**
 * 数值组件
 */
@DB
export class NumericComponent extends Entity {
    public NumericDic: Map<number, number> = new Map();

    public add(nt: number, value: number) {
        let oldValue = this.get(nt);

        this.set(nt, oldValue + value)
    }

    public addNoEvent(nt: number, value: number) {
        let oldValue = this.get(nt);

        this.set(nt, oldValue + value, false)
    }

    public sub(nt: number, value: number) {
        let oldValue = this.get(nt);

        this.set(nt, oldValue - value)
    }

    public subNoEvent(nt: number, value: number) {
        let oldValue = this.get(nt);

        this.set(nt, oldValue - value, false)
    }

    public set(nt: number, value: number, isPublicEvent: boolean = true) {
        let oldValue = this.get(nt);

        if (oldValue == value) {
            return
        }

        this.NumericDic.set(nt, value)

        if (isPublicEvent) {
            EventSystem.getInst().publish(this.domainScene(), NumericChange.create({
                entity: this.parent,
                new: value,
                old: oldValue,
                numericType: nt
            }))
        }
    }

    public setNoEvent(nt: number, value: number) {
        this.set(nt, value, false)
    }

    public get(nt: number): number {
        return this.NumericDic.get(nt) || 0
    }

    public updateKey(numericType: number, isPublicEvent: boolean = true) {
        if (numericType < 1000) {
            return
        }

        let final = Math.floor(numericType / 10)
        let bas = final * 10 + 1;
        let add = final * 10 + 2;
        let pct = final * 10 + 3;
        let finalAdd = final * 10 + 4;
        let finalPct = final * 10 + 5;

        let finalValue = ((this.get(bas) + this.get(add)) * (100 + this.get(pct)) / 100 + this.get(finalAdd)) * (100 + this.get(finalPct)) / 100
        finalValue = Math.floor(finalValue)

        this.set(final, finalValue, isPublicEvent)
    }

    resetBase(numericType: number) {
        let final = Math.floor(numericType / 10)
        let bas = final * 10 + 1;
        let add = final * 10 + 2;
        let pct = final * 10 + 3;
        let finalAdd = final * 10 + 4;
        let finalPct = final * 10 + 5;

        this.NumericDic.delete(bas)
        this.NumericDic.delete(add)
        this.NumericDic.delete(pct)
        this.NumericDic.delete(finalAdd)
        this.NumericDic.delete(finalPct)
    }
}