import { Entity } from "../../../../../common/Entity/Entity";
import { RandomGenerator } from "../../../../../common/Math/RandomGenerator";
import { TimerMgr } from "../../../../../common/Timer/TimerMgr";

/**
 * 生成一个key， 用于客户端连接gate，客户端如果没有这个key，是无法连接gate的
 */
export class GateSessionKeyComponent extends Entity {
    private _sessionKey: Map<number, string> = new Map();

    newKey(account: string): number {
        let key: number;

        for (let i = 0; i < 1000; i++) {
            key = RandomGenerator.RandomInt(1, 9999999);

            if (!this._sessionKey.has(key)) {
                break;
            }
        }

        this.add(key, account);
        
        return key;
    }

    add(key: number, account: string) {
        this._sessionKey.set(key, account);
        this.timeoutRemoveKey(key)
    }

    getAccount(key: number): string {
        let account = this._sessionKey.get(key);
        return account;
    }

    remove(key: number) {
        this._sessionKey.delete(key);
    }

    /**
     * 20秒还不来验证，就删除这个key
     * @param key 
     */
    private async timeoutRemoveKey(key: number) {
        await TimerMgr.getInst().waitAsync(20 * 1000);
        this._sessionKey.delete(key);
    }
}