import { Session } from "../../../../../common/Message/Session";
import { GateMapComponent } from "./GateMapComponent";

export class GateMapHelper{
    static getGateMapInstanceId(session: Session): number{
        let gateMapCom = session.domainScene().getComponent(GateMapComponent);

        return gateMapCom.mapScene.instanceId;
    }
}