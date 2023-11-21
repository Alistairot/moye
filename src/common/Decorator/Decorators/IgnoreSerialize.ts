/**
 * 需要忽略序列化的字段
 * 只能用在类的字段上
 * 原理就是禁止枚举 序列化的时候就不会序列化这个字段
 * @param target 
 * @param name 
 * @param desc 
 * @returns 
 */
export const IgnoreSerialize: {
    (target: any, name: string): void;
    (target: any, name: string, desc: PropertyDescriptor): PropertyDescriptor;
} = (target: any, name: string, desc?: any) => {
    if(desc) {
        desc.enumerable = false;
        return desc;
    }
    Object.defineProperty(target, name,  {
        set(value) {
            Object.defineProperty(this, name, {
                value, writable: true, configurable: true,
            });
        },
        configurable: true,
    });
};