/**
 * 登录账号密码检测规则
 */
export interface IAccountInspector{
    run(account: string, password: string): number;
}