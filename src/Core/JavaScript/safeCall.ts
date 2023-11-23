import { coreError } from "../Logger/CoreLogHelper";

/**
 * 这个方法执行一个promise，如果promise出现异常，会打印异常信息
 * @param promise 
 * @returns 
 */
export async function safeCall(promise: Promise<any>) {
    try {
        return await promise;
    } catch (e) {
        coreError('safeCall', e);
    }
}