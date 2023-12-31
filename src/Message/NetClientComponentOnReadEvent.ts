import { AEventHandler, EventDecorator, Scene, SceneType } from "../Core/Core";
import { NetClientComponentOnRead } from "./NetClientComponentOnRead";


@EventDecorator(NetClientComponentOnRead, SceneType.CLIENT)
export class NetClientComponentOnReadEvent extends AEventHandler<NetClientComponentOnRead>{
    protected run(scene: Scene, args: NetClientComponentOnRead) {
        const session = args.session;
        const data = args.data;

        // 屏蔽非Uint8Array类型的数据
        if(!(data instanceof Uint8Array)){
            return;
        }

        
    }
}