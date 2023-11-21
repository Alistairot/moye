import { AEvent } from "../../../../common/Event/AEvent";
import { IMessage } from "../../../../common/Message/IMessage";
import { Session } from "../../../../common/Message/Session";

export class NetClientComponentOnRead extends AEvent {
    session: Session;
    message: IMessage;
}