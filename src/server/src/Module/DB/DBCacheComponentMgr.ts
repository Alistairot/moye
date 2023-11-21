import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore";
import { Entity } from "../../../../common/Entity/Entity";
import { coreLog, coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { Type } from "../../../../common/Core/Type/Type";
import { DBCacheComponent } from "./DBCacheComponent";

export class DBCacheComponentMgr extends Entity {
    private _cacheList: DBCacheComponent[] = []
    private _type2ComMap: Map<Type, DBCacheComponent> = new Map()

    awake(): void {
        let list = DecoratorCollector.inst.get(DecoratorTypeCore.DB);
        for (const args of list) {
            // 不需要查询的类型不处理
            if(args.length == 1){
                continue;
            }

            let type: Type = args[0];
            let key: string = args[1];
            let isNumberKey: boolean = args[2];
            let maxCache: number = args[3];

            let cacheCom = this.addChild(DBCacheComponent).init({
                isNumberKey: isNumberKey,
                key: key,
                maxCache: maxCache,
                type: type,
            });

            this._cacheList.push(cacheCom);
            this._type2ComMap.set(type, cacheCom);
        }
    }

    /**
     * 缓存间隔时间
     * 也就是多长时间存一次数据库
     * @param cacheInterval 
     * @returns 
     */
    init(cacheInterval: number): DBCacheComponentMgr {
        if(DEVELOP){
            coreLog(`[DBCacheComponentMgr] init, cacheInterval: ${cacheInterval}`)
        }

        this.startTimer(cacheInterval)

        return this
    }

    async startTimer(cacheInterval: number) {
        while (true) {
            if(this.isDisposed){
                break
            }

            await TimerMgr.getInst().waitAsync(cacheInterval)
            await this.saveNow()
        }
    }

    async saveNow() {
        let start = Date.now();

        let list: Promise<void>[] = [];

        for (let cache of this._cacheList) {
            list.push(cache.saveToDB());
        }

        await Promise.all(list);

        if (DEVELOP) {
            let cost = Date.now() - start;

            if(cost > 3000){
                coreWarn(`[DBCacheComponentMgr]储存数据到db消耗时间过长,请考虑优化,cost=${cost}ms`);
            }
        }
    }

    getCacheCom(type: Type): DBCacheComponent {
        return this._type2ComMap.get(type);
    }
}