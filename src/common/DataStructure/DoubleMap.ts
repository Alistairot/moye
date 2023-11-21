/**
 * 可通过value获取key的map
 */
export class DoubleMap<K, V>
{
    private readonly kv: Map<K, V> = new Map;
    private readonly vk: Map<V, K> = new Map;

    *iterator(): IterableIterator<K> {
        for (const [k, v] of this.kv) {
            yield k
        }
    }

    public Add(key: K, value: V) {
        if (key == null || value == null || this.kv.has(key) || this.vk.has(value)) {
            return;
        }

        this.kv.set(key, value);
        this.vk.set(value, key);
    }

    public GetValueByKey(key: K): V {
        if (key != null && this.kv.has(key)) {
            return this.kv.get(key);
        }

        return null;
    }

    public GetKeyByValue(value: V): K {
        if (value != null && this.vk.has(value)) {
            return this.vk.get(value);
        }
        return null
    }

    public RemoveByKey(key: K) {
        if (key == null) {
            return;
        }

        let value = this.kv.get(key)
        if (!value) {
            return;
        }

        this.kv.delete(key);
        this.vk.delete(value);
    }

    public Clear() {
        this.kv.clear();
        this.vk.clear();
    }
}
