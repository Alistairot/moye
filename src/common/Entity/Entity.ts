import { IgnoreSerialize } from "../Decorator/Decorators/IgnoreSerialize";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { FlagMgr } from "../Decorator/FlagMgr";
// import { EventSystem } from "../EventSystem/EventSystem";
import { IEventSystem } from "../EventSystem/IEventSystem";
import { IdGenerator } from "../Core/IdGenerator/IdGenerator";
import { ObjectPool } from "../Core/ObjectPool/ObjectPool";
import { Type } from "../Core/Type/Type";
import { IRoot } from "./IRoot";
import { type Scene } from "./Scene";

enum EntityStatus {
    None = 0,
    IsFromPool = 1,
    IsRegister = 1 << 1,
    IsComponent = 1 << 2,
    IsCreated = 1 << 3,
    IsNew = 1 << 4,
}

export abstract class Entity {
    public static IRoot: IRoot;
    public static IEventSystem: IEventSystem;

    public get parent() {
        return this._parent
    }
    public set parent(value: Entity) {
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

    public get domain() {
        return this._domain
    }

    public set domain(value) {
        if (value == null) {
            throw new Error(`domain cant set null: ${this.constructor.name}`);
        }

        if (this._domain == value) {
            return;
        }

        let preDomain = this._domain;
        this._domain = value;

        if (preDomain == null) {
            this.instanceId = IdGenerator.getInst().generateInstanceId();
            this.isRegister = true;

            // 反序列化出来的需要设置父子关系
            if (this.componentsDB != null) {
                for (let component of this.componentsDB) {
                    component.isComponent = true;
                    this.components.set(component.constructor as Type<Entity>, component);
                    component._parent = this;
                }
            }

            if (this.childrenDB != null) {
                for (let child of this.childrenDB) {
                    child.isComponent = false;
                    this.children.set(child.id, child);
                    child._parent = this;
                }
            }
        }

        // 递归设置孩子的Domain
        if (this._children != null) {
            for (let [id, entity] of this._children.entries()) {
                entity.domain = this._domain;
            }
        }

        if (this._components != null) {
            for (let [type, component] of this._components.entries()) {
                component.domain = this._domain;
            }
        }

        if (!this.isCreated) {
            this.isCreated = true;
        }
    }

    @IgnoreSerialize
    public instanceId: number
    public id: number

    public get isDisposed() {
        return this.instanceId == 0;
    }

    public get children(): Map<number, Entity> {
        return this._children ??= ObjectPool.getInst().fetch(Map) as Map<number, Entity>;
    }

    public get components(): Map<Type<Entity>, Entity> {
        return this._components ??= ObjectPool.getInst().fetch(Map) as Map<Type<Entity>, Entity>;
    }

    @IgnoreSerialize
    protected _domain: Entity
    @IgnoreSerialize
    private _children: Map<number, Entity>
    @IgnoreSerialize
    private _components: Map<Type<Entity>, Entity>
    @IgnoreSerialize
    protected _parent: Entity
    @IgnoreSerialize
    private status: EntityStatus = EntityStatus.None

    private componentsDB: Set<Entity>
    private childrenDB: Set<Entity>

    private get isFromPool() {
        return (this.status & EntityStatus.IsFromPool) == EntityStatus.IsFromPool
    }
    private set isFromPool(value: boolean) {
        if (value) {
            this.status |= EntityStatus.IsFromPool;
        }
        else {
            this.status &= ~EntityStatus.IsFromPool;
        }
    }

    private get isComponent() {
        return (this.status & EntityStatus.IsComponent) == EntityStatus.IsComponent
    }
    private set isComponent(value: boolean) {
        if (value) {
            this.status |= EntityStatus.IsComponent;
        }
        else {
            this.status &= ~EntityStatus.IsComponent;
        }
    }

    protected get isCreated() {
        return (this.status & EntityStatus.IsCreated) == EntityStatus.IsCreated
    }
    protected set isCreated(value: boolean) {
        if (value) {
            this.status |= EntityStatus.IsCreated;
        }
        else {
            this.status &= ~EntityStatus.IsCreated;
        }
    }

    protected get isNew() {
        return (this.status & EntityStatus.IsNew) == EntityStatus.IsNew
    }
    protected set isNew(value: boolean) {
        if (value) {
            this.status |= EntityStatus.IsNew;
        }
        else {
            this.status &= ~EntityStatus.IsNew;
        }
    }

    protected get isRegister() {
        return (this.status & EntityStatus.IsRegister) == EntityStatus.IsRegister
    }
    protected set isRegister(value: boolean) {
        if (this.isRegister == value) {
            return;
        }

        if (value) {
            this.status |= EntityStatus.IsRegister;
        }
        else {
            this.status &= ~EntityStatus.IsRegister;
        }

        if (!value) {
            Entity.IRoot.remove(this.instanceId);
        }
        else {
            Entity.IRoot.add(this);
            Entity.IEventSystem.registerSystem(this);
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

    public addComponent(component: Entity): Entity;
    public addComponent<T extends Entity>(type: Type<T>): T;
    public addComponent<T extends Entity>(type: Type<T>, isFromPool: boolean): T;
    public addComponent<T extends Entity>(componentOrType: Type<T> | Entity, isFromPool?: boolean): Entity | T {
        if (componentOrType instanceof Entity) {
            return this.addComponentByEntity(componentOrType)
        } else {
            return this.addComponentByCtor(componentOrType, isFromPool)
        }
    }

    public tryAddComponent<T extends Entity>(type: Type<T>): T {
        let com = this.getComponent(type)

        if (com == null) {
            com = this.addComponent(type)
        }

        return com
    }

    private addComponentByEntity(component: Entity): Entity {
        let type = component.constructor as Type<Entity>;

        if (this._components != null && this._components.has(type)) {
            throw new Error(`entity already has component: ${type.name}`);
        }

        component.componentParent = this;

        return component;
    }

    private addComponentByCtor<T extends Entity>(type: Type<T>, isFromPool: boolean = false): T {
        if (this._components != null && this._components.has(type as Type<Entity>)) {
            throw new Error(`entity already has component: ${type.name}`);
        }

        let component = this.create(type, isFromPool);
        component.id = this.id;
        component.componentParent = this;

        if (component.awake) {
            Entity.IEventSystem.awakeComEvent(component)
        }

        return component as T;
    }

    public addChild(entity: Entity): Entity;
    public addChild<T extends Entity>(type: Type<T>): T;
    public addChild<T extends Entity>(type: Type<T>, isFromPool: boolean): T;
    public addChild<T extends Entity>(entityOrType: Type<T> | Entity, isFromPool?: boolean): Entity | T {
        if (entityOrType instanceof Entity) {
            return this.addChildByEntity(entityOrType)
        } else {
            return this.addChildByCtor(entityOrType, isFromPool)
        }
    }

    public addChildWithId<T extends Entity>(type: Type<T>, id: number, isFromPool: boolean = false): T {
        let component = this.create(type, isFromPool);
        component.id = id;
        component.parent = this;

        if (component.awake) {
            Entity.IEventSystem.awakeComEvent(component);
        }

        return component as T;
    }

    private addChildByEntity(entity: Entity): Entity {
        entity.parent = this;
        return entity;
    }

    private addChildByCtor<T extends Entity>(type: Type<T>, isFromPool: boolean = false): T {
        let component = this.create(type, isFromPool);
        component.id = IdGenerator.getInst().generateId();
        component.parent = this;

        if (component.awake) {
            Entity.IEventSystem.awakeComEvent(component);
        }

        return component as T;
    }

    private create(type: Type, isFromPool: boolean): Entity {
        let component: Entity

        if (isFromPool) {
            component = ObjectPool.getInst().fetch(type);
        }
        else {
            component = new type;
        }

        component.isFromPool = isFromPool;
        component.isCreated = true;
        component.isNew = true;
        component.id = 0;

        return component;
    }

    private removeFromChildren(entity: Entity): void {
        if (this._children == null) {
            return;
        }

        this._children.delete(entity.id);

        if (this._children.size == 0) {
            ObjectPool.getInst().recycle(this._children);
            this._children = null;
        }

        this.removeFromChildrenDB(entity);
    }

    private removeFromChildrenDB(entity: Entity) {
        if (!FlagMgr.getInst().hasFlag(DecoratorTypeCore.DB, entity.constructor as Type)) {
            return;
        }

        if (this.childrenDB == null) {
            return;
        }

        this.childrenDB.delete(entity);

        if (this.childrenDB.size == 0 && this.isNew) {
            ObjectPool.getInst().recycle(this.childrenDB);
            this.childrenDB = null;
        }
    }

    private removeFromComponents(component: Entity): void {
        if (this._components == null) {
            return;
        }

        this._components.delete(component.constructor as Type);

        if (this._components.size == 0) {
            ObjectPool.getInst().recycle(this._components);
            this._components = null;
        }

        this.removeFromComponentsDB(component);
    }

    private removeFromComponentsDB(component: Entity) {
        if (!FlagMgr.getInst().hasFlag(DecoratorTypeCore.DB, component.constructor as Type)) {
            return;
        }

        if (this.componentsDB == null) {
            return;
        }

        this.componentsDB.delete(component);
        if (this.componentsDB.size == 0 && this.isNew) {
            ObjectPool.getInst().recycle(this.componentsDB);
            this.componentsDB = null;
        }
    }

    private addToComponents(component: Entity): void {
        this.components.set(component.constructor as Type, component);
        this.AddToComponentsDB(component);
    }

    private AddToComponentsDB(component: Entity) {
        // 没有db这个标志就不添加到componentsDB
        if (!FlagMgr.getInst().hasFlag(DecoratorTypeCore.DB, component.constructor as Type)) {
            return;
        }

        this.componentsDB ??= ObjectPool.getInst().fetch(Set) as Set<Entity>;
        this.componentsDB.add(component);
    }

    private AddToChildrenDB(entity: Entity) {
        if (!FlagMgr.getInst().hasFlag(DecoratorTypeCore.DB, entity.constructor as Type)) {
            return;
        }

        this.childrenDB ??= ObjectPool.getInst().fetch(Set) as Set<Entity>;
        this.childrenDB.add(entity);
    }

    private addToChildren(entity: Entity): void {
        if (this.children.has(entity.id)) {
            throw new Error(`entity already has child: ${entity.id}`);
        }

        this.children.set(entity.id, entity);

        this.AddToChildrenDB(entity);
    }

    public getComponent<K extends Entity>(type: new () => K): K {
        if (this._components == null) {
            return null;
        }

        let component = this._components.get(type);

        if (!component) {
            return null;
        }

        return component as K;
    }

    public removeComponent<T extends Entity>(type: Type<T>): T {
        if (this.isDisposed) {
            return;
        }

        if (this._components == null) {
            return;
        }

        let c = this.getComponent(type);

        if (c == null) {
            return;
        }

        this.removeFromComponents(c);

        c.dispose();
    }

    public getParent<T extends Entity>(type: Type<T>): T {
        return this.parent as T;
    }

    public getChild<T extends Entity>(type: Type<T>, id: number): T {
        if (this._children == null) {
            return null;
        }
        let child = this._children.get(id);
        return child as T;
    }

    public removeChild(id: number): void {
        if (this._children == null) {
            return;
        }

        let child = this._children.get(id)
        if (!child) {
            return;
        }

        this._children.delete(id);
        child.dispose();
    }

    public dispose(): void {
        if (this.isDisposed) {
            return;
        }

        this.isRegister = false;
        this.instanceId = 0;


        // 清理Children
        if (this._children != null) {
            for (let [id, entity] of this._children.entries()) {
                entity.dispose()
            }

            this._children.clear();
            ObjectPool.getInst().recycle(this._children);
            this._children = null;

            if (this.childrenDB != null) {
                this.childrenDB.clear();
                // 创建的才需要回到池中,从db中不需要回收
                if (this.isNew) {
                    ObjectPool.getInst().recycle(this.childrenDB);
                    this.childrenDB = null;
                }
            }
        }

        // 清理Component
        if (this._components != null) {
            for (let [entityCtor, entity] of this._components.entries()) {
                entity.dispose()
            }

            this._components.clear();
            ObjectPool.getInst().recycle(this._components);
            this._components = null;

            if (this.componentsDB != null) {
                this.componentsDB.clear();
                if (this.isNew) {
                    ObjectPool.getInst().recycle(this.componentsDB);
                    this.componentsDB = null;
                }
            }
        }

        // 触发Destroy事件
        if (this.destroy) {
            Entity.IEventSystem.destroyComEvent(this);
        }

        this._domain = null;

        if (this._parent != null && !this._parent.isDisposed) {
            if (this.isComponent) {
                this._parent.removeComponent(this.getType());
            }
            else {
                this._parent.removeFromChildren(this);
            }
        }

        this._parent = null;

        if (this.isFromPool) {
            ObjectPool.getInst().recycle(this);
        }

        this.status = EntityStatus.None;
    }

    domainScene() {
        return this.domain as Scene;
    }

    getType(): Type {
        return this.constructor as Type;
    }

    awake?(): void
    update?(): void
    lateUpdate?(): void
    destroy?(): void
}