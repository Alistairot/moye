import { Entity } from "../Core/Core";
import { Session } from "./Session";

/**
 * 保存客户端的session
 */
export class SessionCom extends Entity {
    session: Session;

    protected destroy(): void {
        this.session?.dispose();
        this.session = null;
    }
}