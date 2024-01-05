import { AEventHandler, EventDecorator, Scene, SceneType } from "../Core/Core";
import { IRpcResponse } from "./IRpcMessage";
import { MessageDispatcherMgr } from "./MsgHandler/MessageDispatcherMgr";
import { MsgMgr } from "./MsgMgr";
import { MsgSerializeMgr } from "./MsgSerializeMgr";
import { NetComReadEvent } from "./NetComReadEvent";


@EventDecorator(NetComReadEvent, SceneType.CLIENT)
export class NetComReadEventHandler extends AEventHandler<NetComReadEvent>{
    protected run(scene: Scene, args: NetComReadEvent) {
        const session = args.session;
        const data = args.data;
        const [opcode, msg] = MsgSerializeMgr.get().deserialize(data);
        const isResponse = MsgMgr.get().isResponse(opcode);

        if (isResponse) {
            session.onResponse(msg as IRpcResponse);
            return;
        }

        MessageDispatcherMgr.get().handle(session, msg);
    }
}