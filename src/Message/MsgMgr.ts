import { DecoratorCollector, Singleton, Type } from "../Core/Core";
// import { MsgResponseDecoratorType } from "./MsgResponseDecorator";

export class MsgMgr extends Singleton {
    // private _requestResponse: Map<Type, Type> = new Map();
    // private _messageTypeMap: Map<number, string> = new Map;
    // private _typeToMessageTypeMap: Map<Type, string> = new Map;
    private _responseTypeMap: Set<number> = new Set;
    // opcodeToTypeMap: Map<number, Type> = new Map;
    private _typeOpcodeMap: Map<Type, number> = new Map;
    private _opcodeTypeMap: Map<number, Type> = new Map;

    protected awake(): void {
        // const list1 = DecoratorCollector.inst.get(MsgResponseDecoratorType);

        // for (const args of list1) {
        //     const request = args[0];
        //     const response = args[1];

        //     this._requestResponse.set(request, response);
        // }

        // const list2 = DecoratorCollector.inst.get(MsgDecoratorType);

        // for (const args of list2) {
        //     const type: Type = args[0];
        //     const msgType: string = args[1];
        //     const opcode: number = args[2];

        //     const response = this._requestResponse.get(type);

        //     if(response){
        //         this.opcodeToTypeMap.set(opcode + 1, response);
        //     }

        //     this._messageTypeMap.set(opcode, msgType);
        //     this._typeToMessageTypeMap.set(type, msgType);
        //     this.opcodeToTypeMap.set(opcode, type);
        // }
    }

    register(type: Type, opcode: number, isResponse: boolean = false) {
        this._typeOpcodeMap.set(type, opcode);

        this._opcodeTypeMap.set(opcode, type);

        if (isResponse) {
            this._responseTypeMap.add(opcode);
        }
    }

    isResponse(opcode: number): boolean {
        return this._responseTypeMap.has(opcode);
    }

    getOpcode(type: Type): number {
        return this._typeOpcodeMap.get(type);
    }

    getType(opcode: number): Type {
        return this._opcodeTypeMap.get(opcode);
    }
}