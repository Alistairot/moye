import { Entity } from "../../../../common/Entity/Entity";
import { UnitDisconnectHelper } from "../Unit/UnitDisconnectHelper";

export class SessionDisconnectUnitCom extends Entity {
    private _sessionInstanceId: number
    private _unitId: number

    init(sessionInstanceId: number, unitId: number) {
        this._sessionInstanceId = sessionInstanceId;
        this._unitId = unitId;
    }

    destroy(): void {
        UnitDisconnectHelper.disconnect(this._unitId, this._sessionInstanceId, this.domainScene());
    }
}