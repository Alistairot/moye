import { Collection, Db, Filter, MongoClient } from "mongodb";
import { coreError, coreLog, coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { Entity } from "../../../../common/Entity/Entity";
import { CoroutineLock } from "../../../../common/CoroutineLock/CoroutineLock";
import { LockTypeCore } from "../../Game/CoroutineLock/LockTypeCore";
import { DBSerializeMgr } from "./DBSerializeMgr";
import { RandomGenerator } from "../../../../common/Math/RandomGenerator";
import { Type } from "../../../../common/Core/Type/Type";
import { DEVELOP } from "../../../../common/Macro";

/**
 * 数据库组件
 * 用于连接数据库
 * 存取都需要靠这个组件
 * todo 改成单例
 */
export class DBComponent extends Entity {
    public static inst: DBComponent
    public static readonly TaskCount = 32;

    public mongoClient: MongoClient;
    public database: Db;

    awake() {
        DBComponent.inst = this
    }

    destroy(): void {
        DBComponent.inst = null
    }

    async init(dbAddress: string, dbName: string) {
        this.mongoClient = new MongoClient(dbAddress);
        await this.mongoClient.connect();
        this.database = this.mongoClient.db(dbName);

        coreLog(`数据库连接完成`);

        this.mongoClient.on('close', () => {
            coreError(`数据库连接断开`);
        });

        return this
    }

    private getCollection(name: string): Collection {
        return this.database.collection(name)
    }

    async query<T>(type: Type<T>, filter: Filter<Document>): Promise<T> {
        if (this.database == null) {
            return
        }

        let random = RandomGenerator.RandomInt(1, 10086) % DBComponent.TaskCount
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.DB, random.toString());
        try {
            let filteredDocs = await this.getCollection(type.name).findOne(filter)
            if (filteredDocs) {
                let time1: number;
                if (DEVELOP) {
                    time1 = Date.now();
                }

                let cls = DBSerializeMgr.getInst().deserialize(filteredDocs);

                if (DEVELOP) {
                    let cost = Date.now() - time1;

                    if (cost > 1) {
                        coreWarn(`DBComponent deserialize cost time=${cost}ms, 请考虑优化!`)
                    }
                }
                return cls;
            }
        } finally {
            lock.dispose();
        }
    }

    async save(classObj: any, filter: Filter<Document>) {
        if (this.database == null) {
            return
        }

        if (!classObj.constructor) {
            coreWarn(`储存的对象必须是class`)
            return
        }

        let num = RandomGenerator.RandomInt(1, 10086);
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.DB, (num % DBComponent.TaskCount).toString())
        try {
            let time1: number;
            if (DEVELOP) {
                time1 = Date.now();
            }

            // 先转化成普通的object
            let normalObj = DBSerializeMgr.getInst().serializeToObject(classObj);

            if (DEVELOP) {
                let cost = Date.now() - time1;

                if (cost > 1) {
                    coreWarn(`DBComponent serialize cost time=${cost}ms, 请考虑优化!`)
                }
            }

            coreLog('DBComponent save obj={0}', JSON.stringify(normalObj));

            await this.getCollection(classObj.constructor.name).replaceOne(filter, normalObj, { upsert: true })

        } finally {
            lock.dispose();
        }
    }

    async remove(type: Type, filter: Filter<Document>) {
        if (this.database == null) {
            return
        }

        let num = RandomGenerator.RandomInt(1, 10086);
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.DB, (num % DBComponent.TaskCount).toString())
        try {
            await this.getCollection(type.name).deleteOne(filter)
        } finally {
            lock.dispose();
        }
    }
}