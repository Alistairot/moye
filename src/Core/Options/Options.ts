import { Singleton } from "../Singleton/Singleton";

export class Options extends Singleton {
    /**
     * 是否是服务端
     */
    readonly isServer: boolean = false;

    /**
     * log等级 越低输出信息越多
     * 不能控制框架层的输出
     */
    logLevel: number = 1;
}