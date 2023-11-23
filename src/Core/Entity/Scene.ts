import { coreLog } from '../Logger/CoreLogHelper';
import { Entity } from './Entity';


export interface ISceneInitArgs {
    id: bigint
    instanceId?: bigint
    sceneType: string
    name: string
    parent?: Entity
}

export class Scene extends Entity {
    name: string;
    sceneType: string;

    set domain(value: Entity) {
        this._domain = value;
    }

    get domain() {
        return this._domain;
    }

    set parent(value: Entity) {
        if (value == null) {
            return;
        }

        this._parent = value;
        this._parent.children.set(this.id, this);
    }

    init(args: ISceneInitArgs) {
        this.id = args.id;
        this.instanceId = args.instanceId;
        this.sceneType = args.sceneType;
        this.name = args.name;
        this.parent = args.parent;

        this.isCreated = true;
        this.isNew = true;
        this.domain = this;
        this.isRegister = true;

        coreLog('scene', 'scene create sceneType = {0}, name = {1}, id = {2}', this.sceneType, this.name, this.id);
    }
}


