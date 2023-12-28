import { IdGenerator } from "../IdGenerator/IdGenerator";
import { ObjectPool } from "../ObjectPool/ObjectPool";
import { IEntity } from "../Type/IEntity";
import { Type } from "../Type/Type";
import { EntityCenter } from "./EntityCenter";
import { EntityLifiCycleMgr } from "./EntityLifiCycleMgr";
import { type Scene } from "./Scene";

enum EntityStatus {
    NONE = 0,
    IS_FROM_POOL = 1,
    IS_REGISTER = 1 << 1,
    IS_COMPONENT = 1 << 2,
    IS_CREATED = 1 << 3,
    IS_NEW = 1 << 4,
}

export abstract class Entity {
    get parent() {
        return this._parent;
    }
    set parent(value: Entity) {
        if (value == null) {
            throw new Error(`cant set parent null: ${this.constructor.name}`);
        }

        if (value == this) {
            throw new Error(`cant set parent self: ${this.constructor.name}`);
        }

        if (value.domain == null) {
            throw new Error(`cant set parent because parent domain is null: ${this.constructor.name} ${value.constructor.name}`);
        }

        if (this._parent != null) // 之前有parent
        {
            // parent相同，不设置
            if (this._parent == value) {
                throw new Error(`重复设置了Parent: ${this.constructor.name} parent: ${this._parent.constructor.name}`);
            }

            this._parent.removeFromChildren(this);
        }

        this._parent = value;
        this.isComponent = false;
        this._parent.addToChildren(this);
        this.domain = this.parent.domain;
    }

    get domain() {
        return this._domain;
    }

    set domain(value) {
        if (value == null) {
            throw new Error(`domain cant set null: ${this.constructor.name}`);
        }

        if (this._domain == value) {
            return;
        }

        const preDomain = this._domain;
        this._domain = value;

        if (preDomain == null) {
            this.instanceId = IdGenerator.get().generateInstanceId();
            this.isRegister = true;
        }

        // 递归设置孩子的Domain
        if (this._children != null) {
            for (const [id, entity] of this._children.entries()) {
                entity.domain = this._domain;
            }
        }

        if (this._components != null) {
            for (const [type, component] of this._components.entries()) {
                component.domain = this._domain;
            }
        }

        if (!this.isCreated) {
            this.isCreated = true;
        }
    }

    instanceId: bigint;
    id: bigint;

    get isDisposed() {
        return this.instanceId == 0n;
    }

    get children(): Map<bigint, Entity> {
        return this._children ??= ObjectPool.get().fetch(Map<bigint, Entity>);
    }

    get components(): Map<Type<Entity>, Entity> {
        return this._components ??= ObjectPool.get().fetch(Map<Type<Entity>, Entity>);
    }

    protected _domain: Entity;
    private _children: Map<bigint, Entity>;
    private _components: Map<Type<Entity>, Entity>;
    protected _parent: Entity;
    private _status: EntityStatus = EntityStatus.NONE;

    private get isFromPool() {
        return (this._status & EntityStatus.IS_FROM_POOL) == EntityStatus.IS_FROM_POOL;
    }
    private set isFromPool(value: boolean) {
        if (value) {
            this._status |= EntityStatus.IS_FROM_POOL;
        } else {
            this._status &= ~EntityStatus.IS_FROM_POOL;
        }
    }

    private get isComponent() {
        return (this._status & EntityStatus.IS_COMPONENT) == EntityStatus.IS_COMPONENT;
    }
    private set isComponent(value: boolean) {
        if (value) {
            this._status |= EntityStatus.IS_COMPONENT;
        }
        else {
            this._status &= ~EntityStatus.IS_COMPONENT;
        }
    }

    protected get isCreated() {
        return (this._status & EntityStatus.IS_CREATED) == EntityStatus.IS_CREATED;
    }
    protected set isCreated(value: boolean) {
        if (value) {
            this._status |= EntityStatus.IS_CREATED;
        }
        else {
            this._status &= ~EntityStatus.IS_CREATED;
        }
    }

    protected get isNew() {
        return (this._status & EntityStatus.IS_NEW) == EntityStatus.IS_NEW;
    }
    protected set isNew(value: boolean) {
        if (value) {
            this._status |= EntityStatus.IS_NEW;
        }
        else {
            this._status &= ~EntityStatus.IS_NEW;
        }
    }

    protected get isRegister() {
        return (this._status & EntityStatus.IS_REGISTER) == EntityStatus.IS_REGISTER;
    }
    protected set isRegister(value: boolean) {
        if (this.isRegister == value) {
            return;
        }

        if (value) {
            this._status |= EntityStatus.IS_REGISTER;
        }
        else {
            this._status &= ~EntityStatus.IS_REGISTER;
        }

        if (!value) {
            EntityCenter.get().remove(this.instanceId);
        }
        else {
            const self = this as unknown as IEntity;
            EntityCenter.get().add(self);
            EntityLifiCycleMgr.get().registerSystem(self);
        }
    }

    private set componentParent(value: Entity) {
        if (value == null) {
            throw new Error(`cant set parent null: ${this.constructor.name}`);
        }

        if (value == this) {
            throw new Error(`cant set parent self: ${this.constructor.name}`);
        }

        // 严格限制parent必须要有domain,也就是说parent必须在数据树上面
        if (value.domain == null) {
            throw new Error(`cant set parent because parent domain is null: ${this.constructor.name} ${value.constructor.name}`);
        }

        if (this.parent != null) // 之前有parent
        {
            // parent相同，不设置
            if (this.parent == value) {
                throw new Error(`重复设置了Parent: ${this.constructor.name} parent: ${this.parent.constructor.name}`);
            }
            this.parent.removeFromComponents(this);
        }

        this._parent = value;
        this.isComponent = true;
        this._parent.addToComponents(this);
        this.domain = this.parent.domain;
    }

    addCom(component: Entity): Entity;
    addCom<T extends Entity>(type: Type<T>): T;
    addCom<T extends Entity>(type: Type<T>, isFromPool: boolean): T;
    addCom<T extends Entity>(componentOrType: Type<T> | Entity, isFromPool?: boolean): Entity | T {
        if (componentOrType instanceof Entity) {
            return this.addComByEntity(componentOrType);
        } else {
            return this.addComByType(componentOrType, isFromPool);
        }
    }

    /**
     * if not exist com will add new
     * @param type 
     * @returns 
     */
    tryAddCom<T extends Entity>(type: Type<T>): T {
        let com = this.getCom(type);

        if (com == null) {
            com = this.addCom(type);
        }

        return com;
    }

    private addComByEntity(com: Entity): Entity {
        const type = com.constructor as Type<Entity>;

        if (this._components != null && this._components.has(type)) {
            throw new Error(`entity already has component: ${type.name}`);
        }

        com.componentParent = this;

        return com;
    }

    private addComByType<T extends Entity>(type: Type<T>, isFromPool: boolean = false): T {
        if (this._components != null && this._components.has(type as Type<Entity>)) {
            throw new Error(`entity already has component: ${type.name}`);
        }

        const com = this.createInst(type, isFromPool);
        com.id = this.id;
        com.componentParent = this;

        if (com.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(com as unknown as IEntity);
        }

        return com as T;
    }

    addChild(entity: Entity): Entity;
    addChild<T extends Entity>(type: Type<T>): T;
    addChild<T extends Entity>(type: Type<T>, isFromPool: boolean): T;
    addChild<T extends Entity>(entityOrType: Type<T> | Entity, isFromPool?: boolean): Entity | T {
        if (entityOrType instanceof Entity) {
            return this.addChildByEntity(entityOrType);
        } else {
            return this.addChildByType(entityOrType, isFromPool);
        }
    }

    addChildWithId<T extends Entity>(type: Type<T>, id: bigint, isFromPool: boolean = false): T {
        const entity = this.createInst(type, isFromPool);
        entity.id = id;
        entity.parent = this;

        if (entity.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(entity as unknown as IEntity);
        }

        return entity as T;
    }

    private addChildByEntity(entity: Entity): Entity {
        entity.parent = this;
        return entity;
    }

    private addChildByType<T extends Entity>(type: Type<T>, isFromPool: boolean = false): T {
        const entity = this.createInst(type, isFromPool);
        entity.id = IdGenerator.get().generateId();
        entity.parent = this;

        if (entity.awake) {
            EntityLifiCycleMgr.get().awakeComEvent(entity as unknown as IEntity);
        }

        return entity as T;
    }

    private createInst(type: Type, isFromPool: boolean): Entity {
        let inst: Entity;

        if (isFromPool) {
            inst = ObjectPool.get().fetch(type);
        }
        else {
            inst = new type();
        }

        inst.isFromPool = isFromPool;
        inst.isCreated = true;
        inst.isNew = true;
        inst.id = 0n;

        return inst;
    }

    private removeFromChildren(entity: Entity): void {
        if (this._children == null) {
            return;
        }

        this._children.delete(entity.id);

        if (this._children.size == 0) {
            ObjectPool.get().recycle(this._children);
            this._children = null;
        }
    }

    private removeFromComponents(component: Entity): void {
        if (this._components == null) {
            return;
        }

        this._components.delete(component.constructor as Type);

        if (this._components.size == 0) {
            ObjectPool.get().recycle(this._components);
            this._components = null;
        }
    }

    private addToComponents(component: Entity): void {
        this.components.set(component.constructor as Type, component);
    }

    private addToChildren(entity: Entity): void {
        if (this.children.has(entity.id)) {
            throw new Error(`entity already has child: ${entity.id}`);
        }

        this.children.set(entity.id, entity);
    }

    getCom<K extends Entity>(type: new () => K): K {
        if (this._components == null) {
            return null;
        }

        const component = this._components.get(type);

        if (!component) {
            return null;
        }

        return component as K;
    }

    removeCom<T extends Entity>(type: Type<T>): T {
        if (this.isDisposed) {
            return;
        }

        if (this._components == null) {
            return;
        }

        const com = this.getCom(type);

        if (com == null) {
            return;
        }

        this.removeFromComponents(com);

        com.dispose();
    }

    getParent<T extends Entity>(type: Type<T>): T {
        return this.parent as T;
    }

    getChild<T extends Entity>(type: Type<T>, id: bigint): T {
        if (this._children == null) {
            return null;
        }
        const child = this._children.get(id);
        return child as T;
    }

    removeChild(id: bigint): void {
        if (this._children == null) {
            return;
        }

        const child = this._children.get(id);
        if (!child) {
            return;
        }

        this._children.delete(id);
        child.dispose();
    }

    dispose(): void {
        if (this.isDisposed) {
            return;
        }

        this.isRegister = false;
        this.instanceId = 0n;

        // 清理Children
        if (this._children != null) {
            for (const [id, entity] of this._children.entries()) {
                entity.dispose();
            }

            this._children.clear();
            ObjectPool.get().recycle(this._children);
            this._children = null;
        }

        // 清理Component
        if (this._components != null) {
            for (const [entityCtor, entity] of this._components.entries()) {
                entity.dispose();
            }

            this._components.clear();
            ObjectPool.get().recycle(this._components);
            this._components = null;
        }

        // 触发Destroy事件
        if (this.destroy) {
            EntityLifiCycleMgr.get().destroyComEvent(this as unknown as IEntity);
        }

        this._domain = null;

        if (this._parent != null && !this._parent.isDisposed) {
            if (this.isComponent) {
                this._parent.removeCom(this.getType());
            }
            else {
                this._parent.removeFromChildren(this);
            }
        }

        this._parent = null;

        if (this.isFromPool) {
            ObjectPool.get().recycle(this);
        }

        this._status = EntityStatus.NONE;
    }

    domainScene() {
        return this.domain as Scene;
    }

    getType(): Type {
        return this.constructor as Type;
    }

    protected awake?(): void
    protected update?(): void
    protected lateUpdate?(): void
    protected destroy?(): void
}