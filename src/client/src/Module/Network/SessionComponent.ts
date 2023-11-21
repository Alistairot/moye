import { Entity } from "../../../../common/Entity/Entity"
import { Session } from "../../../../common/Message/Session"

/**
 * 保存客户端的session
 */
export class SessionComponent extends Entity {
    public session: Session

    destroy(): void {
        this.session?.dispose()
        this.session = null
    }
}