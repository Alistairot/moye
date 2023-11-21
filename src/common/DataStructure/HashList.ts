type KeyType = string | number

/**
 * 可以移动顺序的map
 */
export class HashList<K extends KeyType, V> {

    private _hashTable: { [key: KeyType]: LinkedListItem<K, V> }
    private _head: LinkedListItem<K, V>;
    private _tail: LinkedListItem<K, V>;
    private _length: number;

    constructor() {
        this._hashTable = {};
        this._head = this._tail = null;
        this._length = 0;
    }

    *iterator(): IterableIterator<V> {
        let currentItem = this._head;
        let count = 0
        while (currentItem) {
            yield currentItem.value
            currentItem = currentItem.next
            count++

            if(count > 1000000){
                console.error('HashList possible circle loop')
                break
            }
        }
    }

    [Symbol.iterator]() {
        return this.iterator();
    }

    get head(): V {
        return this._head ? this._head.value : null;
    }

    get tail(): V {
        return this._tail ? this._tail.value : null;
    }

    get length(): number {
        return this._length;
    }

    // Adds the element at a specific position inside the linked list
    insert(key: K, val: V, previousKey: string, checkDuplicates: boolean = false): K {
        if (checkDuplicates && this.isDuplicate(val)) {
            return null;
        }

        if(this._hashTable[key] != null){
            console.error(`key has exist, key=${key}`)
            return null
        }

        let newItem: LinkedListItem<K, V> = new LinkedListItem<K, V>(key, val);

        this._hashTable[key] = newItem;

        let previousItem = this._hashTable[previousKey];

        if (!previousItem) {
            return null;
        } else {
            newItem.prev = previousItem;
            newItem.next = previousItem.next;

            if (!previousItem.next) {
                this._tail = newItem;
            } else {
                previousItem.next.prev = newItem;
            }

            previousItem.next = newItem
            this._length++;
            return key;
        }
    }

    public get(key: K){
        let item = this._hashTable[key]

        if(item == null){
            return
        }

        return item.value
    }

    /**
     * 移动到最前面
     * @param key 
     * @returns 
     */
    moveToHead(key: K){
        let currentItem = this._hashTable[key]

        if(currentItem == null){
            return
        }

        if (currentItem === this._head){
            return
        }else if (currentItem === this._tail) {
            this._tail = currentItem.prev;
            this._tail.next = null
        } else {
            currentItem.prev.next = currentItem.next;
            currentItem.next.prev = currentItem.prev;
        }

        this._head.prev = currentItem
        currentItem.prev = null
        currentItem.next = this._head
        this._head = currentItem
    }

    // Adds the element at the end of the linked list
    append(key: K, val: V, checkDuplicates: boolean = false): K {

        if (checkDuplicates && this.isDuplicate(val)) {
            return null;
        }

        if(this._hashTable[key] != null){
            console.error(`key has exist, key=${key}`)
            return null
        }

        let newItem = new LinkedListItem<K, V>(key, val);
        this._hashTable[key] = newItem;

        if (!this._tail) {
            this._head = this._tail = newItem;
        } else {
            newItem.prev = this._tail;
            this._tail.next = newItem;
            this._tail = newItem;
        }
        this._length++;
        return key;
    }

    /**
     * 添加到最前面
     * @param key 
     * @param val 
     * @param checkDuplicates 
     * @returns 
     */
    prepend(key: K, val: V, checkDuplicates: boolean = false): K {

        if (checkDuplicates && this.isDuplicate(val)) {
            return null;
        }

        if(this._hashTable[key] != null){
            console.error(`key has exist, key=${key}`)
            return null
        }

        let newItem = new LinkedListItem<K, V>(key, val);
        this._hashTable[key] = newItem;

        if (!this._head) {
            this._head = this._tail = newItem;
        } else {
            newItem.next = this._head;
            this._head.prev = newItem;
            this._head = newItem;
        }

        this._length++;
        return key;
    }

    remove(key: K): V {
        let currentItem = this._hashTable[key]

        if (!currentItem) {
            return;
        }

        if (currentItem === this._head) {
            this._head = currentItem.next;
        } else if (currentItem === this._tail) {
            this._tail = currentItem.prev;
        } else {
            currentItem.prev.next = currentItem.next;
            currentItem.next.prev = currentItem.prev;
        }

        currentItem.next = null;
        currentItem.prev = null;
        delete this._hashTable[key];
        this._length--;
        return currentItem.value;
    }

    removeHead(): V {

        let currentItem = this._head;

        // empty list
        if (!currentItem) {
            return;
        }

        // single item list
        if (!this._head.next) {
            this._head = null;
            this._tail = null;

            // full list
        } else {
            this._head.next.prev = null;
            this._head = this._head.next;
        }

        currentItem.next = currentItem.prev = null;
        delete this._hashTable[currentItem.key];
        this._length--;
        return currentItem.value;
    }

    removeTail(): V {
        let currentItem = this._tail;

        // empty list
        if (!currentItem) {
            return;
        }

        // single item list
        if (!this._tail.prev) {
            this._head = null;
            this._tail = null;

            // full list
        } else {
            this._tail.prev.next = null;
            this._tail = this._tail.prev;
        }

        currentItem.next = currentItem.prev = null;
        delete this._hashTable[currentItem.key]
        this._length--;
        return currentItem.value;
    }

    toArray(): V[] {
        return [...this];
    }

    private isDuplicate(val: V): boolean {
        let set = new Set(this.toArray());
        return set.has(val);
    }
}


export class LinkedListItem<K, V> {
    value: V;
    key: K;
    next: LinkedListItem<K, V>;
    prev: LinkedListItem<K, V>;

    constructor(key: K, val: V) {
        this.key = key;
        this.value = val;
        this.next = null;
        this.prev = null;
    }
}