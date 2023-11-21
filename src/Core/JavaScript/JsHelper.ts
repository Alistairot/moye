import { DEVELOP } from "../../Macro";

export class JsHelper {
    public static getMethodName(): string {
        let e = new Error()
        let str = e.stack.split("at ")[2]
        let endPos = str.indexOf(" ")

        return str.substring(0, endPos)
    }

    public static getRootDirName(path: string): string {
        return path.split("/")[0];
    }

    public static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static isNullOrEmpty(str: string) {
        if (str == null) {
            return true
        }

        if (str.length == 0) {
            return true
        }
    }

    static getStringHashCode(str: string): number {
        let hash = 5381;
        let i = str.length;

        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        return hash >>> 0;
    }

    static modeString(str: string, mode: number): number {
        let hash = this.getStringHashCode(str)
        let result = hash % mode

        return result
    }

    /**
     * 格式化字符串
     * @param str 包含有 0 个或者多个格式符的字符串
     * @param args
     * @returns 格式化后的新字符串
     * @performance 性能是+号拼接10分之1, 也就是比较慢, 要注意性能
     * ```
     * formatStr("hello {0}", "world") => hello world
     * formatStr("hello {0} {1} {0}", "world1", "world2") => hello world1 world2 world1
     * formatStr("hello {{qaq}} {0}", "world") => hello {qaq} world
     * ```
     */
    static formatStr(str: string, ...args: any[]): string {
        let ret: string;

        // 开发阶段打印出错误
        if (typeof str != "string") {
            if (DEVELOP) {
                let err = new Error('formatStr args[0] is not string');
                return err.name + err.stack;
            } else {
                return `${str}`;
            }
        }

        if (args.length == 0) {
            return str;
        }

        // 将{0}{1}替换成对应的参数 同时允许{{}}转化为{} 
        ret = str.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
            if (m == "{{") {
                return "{";
            }

            if (m == "}}") {
                return "}";
            }

            return args[n];
        });

        return ret;
    }
}