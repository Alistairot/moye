/**
 * key对应value数组的map
 */
export class MultiMap<T, K> {
    private _map: Map<T, K[]>;
    private readonly _empty: K[] = [];

    constructor() {
        this._map = new Map();
    }

    public add(t: T, k: K) {
        let list = this._map.get(t);
        if (list === undefined) {
            list = [];
            this._map.set(t, list);
        }
        list.push(k);
    }

    public remove(t: T, k: K) {
        const list = this._map.get(t);
        if (list === undefined) {
            return false;
        }
        const index = list.indexOf(k);
        if (index === -1) {
            return false;
        }
        list.splice(index, 1);
        if (list.length === 0) {
            this._map.delete(t);
        }
        return true;
    }

    public getAll(t: T): K[] {
        const list = this._map.get(t);
        if (list === undefined) {
            return [];
        }
        return list;
    }

    public get(t: T): K[] {
        return this._map.get(t) ?? this._empty;
    }

    public getOne(t: T): K | undefined {
        const list = this._map.get(t);
        if (list !== undefined && list.length > 0) {
            return list[0];
        }
        return undefined;
    }

    public contains(t: T, k: K) {
        const list = this._map.get(t);
        if (list === undefined) {
            return false;
        }
        return list.includes(k);
    }
}
