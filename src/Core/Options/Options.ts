import { DEVELOP } from "../../Macro";
import { Singleton } from "../Singleton/Singleton";
import { AppType } from "./AppType";

export class Options extends Singleton {
    /**
     * 是否是服务端
     */
    isServer: boolean = false;

    /**
     * 进程序号
     */
    process: number = 1;
    /**
     * 区id
     */
    zone: number = 1;
    /**
     * log等级 越低输出信息越多
     * 不能控制框架层的输出
     */
    logLevel: number = 1;
    /**
     * 是否开发阶段
     * 开发阶段log会输出到控制台
     * 所以不要在生产环境设置为true
     */
    develop: boolean = true;
    /**
     * 控制台命令行输入
     */
    console: boolean = false;
    /**
     * 启动类型
     */
    appType: AppType;

    private _argsMap: Map<string, any> = new Map<string, any>();

    _setArgs(key: string, value: any) {
        this._argsMap.set(key, value);
    }

    /**
     * 获取启动参数
     * key 大小写敏感
     * @param key 
     * @returns 
     */
    getArgs(key: string){
        if (DEVELOP) {
            if (!this._argsMap.has(key)) {
                throw new Error(`Options.getArgs ${key} not exist`);
            }
        }

        return this._argsMap.get(key);
    }
}