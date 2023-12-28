import { AEvent } from "../Core/Core";
import { AServiceDataType } from "../Network/AService";
import { Session } from "./Session";


export class NetClientComponentOnRead extends AEvent {
    session: Session;
    data: AServiceDataType;
}