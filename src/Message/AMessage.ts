import { RecycleObj } from "../moye";

export class AMessage<T = any> {
    constructor(args?: Partial<T>) {
        Object.assign(this, args);
    }
}

// export class AResponse<T> extends AMessage<T> {
//     /**
//      * 错误码 0表示成功
//      */
//     error: number;
// }