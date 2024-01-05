import { Scene } from "../Core/Core";

export interface ILoginExecutor {
    /**
     * 登录
     * 返回错误码
     */
    login(clientScene: Scene, args: any): Promise<number>;
}