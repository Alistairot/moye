import { Transfer } from "../../../../common/Decorator/Decorators/Transfer"
import { Entity } from "../../../../common/Entity/Entity"

/**
 * unit在map的时候借助这个组件找到对应session
 */
@Transfer
export class UnitGateComponent extends Entity {
    gateSessionActorId: number

    setSessionActorId(id: number) {
        this.gateSessionActorId = id
    }
}