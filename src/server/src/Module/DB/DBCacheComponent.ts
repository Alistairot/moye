import { HashList } from "../../../../common/DataStructure/HashList"
import { Entity } from "../../../../common/Entity/Entity"
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper"
import { DEVELOP } from "../../../../common/Macro"
import { CacheItem } from "./CacheItem"
import { DBComponent } from "./DBComponent"
import { IDBTypeInfo } from "./IDBTypeInfo"

export class DBCacheComponent extends Entity {
    private _config: IDBTypeInfo
    private _filter: any
    private cacheList: HashList<any, CacheItem> = new HashList()

    init(config: IDBTypeInfo) {
        this._config = config
        this._filter = {}
        return this
    }

    async saveToDB() {
        let dbNotExist = DBComponent.inst == null

        if (dbNotExist) {
            return
        }

        let list = this.cacheList
        let changeCount = 0

        for (let item of list) {
            if (!item.isChange) {
                continue
            }

            item.isChange = false
            changeCount++

            this._filter[this._config.key] = item.data[this._config.key]

            await DBComponent.inst.save(item.data, this._filter)
        }

        // if (DEVELOP) {
        //     coreLog(`[DBCacheComponent] cache ${this._config.type.name}, change=${changeCount}, list=${list.length}`)
        // }

        let cacheDropNum = list.length - this._config.maxCache

        for (let i = 0; i < cacheDropNum; i++) {
            list.removeTail()
        }
    }

    async query(value: any) {
        let cacheList = this.cacheList
        let cacheItem = cacheList.get(value)
        let data: any

        if (cacheItem == null) {
            let dbNotExist = DBComponent.inst == null
            if (dbNotExist) {
                return
            }

            this._filter[this._config.key] = value
            data = await DBComponent.inst?.query(this._config.type, this._filter)

            if (data == null) {
                return
            }

            cacheItem = new CacheItem()
            cacheItem.data = data

            cacheList.prepend(value, cacheItem)
        } else {
            cacheList.moveToHead(value)
            data = cacheItem.data
        }

        return data
    }

    /**
     * 这是一个class的实例
     * @param data 
     */
    save(data: any) {
        let cacheList = this.cacheList;
        let key = data[this._config.key];
        let cacheItem = cacheList.get(key);

        if (cacheItem == null) {
            cacheItem = new CacheItem()
            cacheList.prepend(key, cacheItem)
        } else {
            cacheList.moveToHead(key)
        }

        cacheItem.data = data
        cacheItem.isChange = true
    }

    async delete(value: any){
        let cacheList = this.cacheList
        let cacheItem = cacheList.get(value)

        if (cacheItem != null) {
            cacheList.remove(value)
        }

        this._filter[this._config.key] = value

        await DBComponent.inst.remove(this._config.type, this._filter)
    }
}