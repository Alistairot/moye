import { Transfer } from "../../../../common/Decorator/Decorators/Transfer";
import { Entity } from "../../../../common/Entity/Entity";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { DBHelper } from "../DB/DBHelper";
import { UnitRemoveHelper } from "./UnitRemoveHelper";

/**
 * unit的引用组件
 * 当引用大于0的时候 不允许被销毁
 * 比如进入战斗 必须等战斗结束再销毁
 */
@Transfer
export class UnitRefComponent extends Entity{
    private _ref: number = 0

    addRef() {
        this._ref++;
        coreLog(`unit引用增加, unitId=${this.parent.id}, ref=${this._ref}`)
    }

    subRef() {
        this._ref--;

        coreLog(`unit引用减少, unitId=${this.parent.id}, ref=${this._ref}`)

        this.tryDispose();
    }

    private async tryDispose() {
        if(this.isDisposed){
            return;
        }
        
        // 等个3秒 如果又增加了引用 就不销毁了
        await TimerMgr.getInst().waitAsync(3000);

        if (this._ref > 0) {
            return;
        }

        if(this.parent == null){
            coreLog(`UnitRefComponent: unit已经销毁, 不再保存`);
            return;
        }

        if(this.parent.isDisposed){
            coreLog(`UnitRefComponent: unit 已经销毁2, 不再保存`);
            return;
        }

        let ret = await DBHelper.save(this.parent);

        // 保存失败 等待一段时间再试
        if(!ret){
            await TimerMgr.getInst().waitAsync(10 * 1000);
            this.tryDispose();
            return;
        }
        
        // 异步回来可能又增加了引用
        if (this._ref > 0) {
            return;
        }
        
        UnitRemoveHelper.remove(this.parent);
        
        coreLog(`unit离线, unitId=${this.parent.id}`)
        this.parent.dispose();
    }
}