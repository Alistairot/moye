import { TypeNameCore } from '../TypeCollector/TypeNameCore';
import { coreLog } from '../Core/Logger/CoreLogHelper';
import { Entity } from './Entity';
import { TypeCollectorDecorator } from '../TypeCollector/TypeCollectorDecorator';

export interface SceneInitArgs{
    id: number
    instanceId?: number
    sceneType: string
    name: string
    parent?: Entity
}

@TypeCollectorDecorator(TypeNameCore.Scene)
export class Scene extends Entity {
    public name: string
    public sceneType: string

    public set domain(value: Entity) {
        this._domain = value
    }

    public get domain() {
        return this._domain
    }

    public set parent(value: Entity) {
        if (value == null) {
            return;
        }

        this._parent = value;
        this._parent.children.set(this.id, this);
    }

    public init(args: SceneInitArgs) {
        this.id = args.id;
        this.instanceId = args.instanceId;
        this.sceneType = args.sceneType;
        this.name = args.name;
        this.parent = args.parent;

        this.isCreated = true;
        this.isNew = true;
        this.domain = this;
        this.isRegister = true;

        coreLog(`scene create sceneType = {0}, name = {1}, id = {2}`, this.sceneType, this.name, this.id);
    }
}


