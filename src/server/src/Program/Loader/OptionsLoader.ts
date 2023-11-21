import mri from "mri";
import { Options } from "../../../../common/Core/Options/Options";
import { AppType } from "../../../../common/Core/Options/AppType";
import { Game } from "../../../../common/Core/Singleton/Game";
import { DEVELOP } from "../../../../common/Macro";

/**
 * 解析命令行参数
 * 服务端才需要命令行 客户端不需要
 */
export class OptionsLoader {
    static run() {
        Game.addSingleton(Options)

        let options = Options.getInst()
        let args = mri(process.argv.slice(2))

        for (const key in args) {
            let value = args[key]

            if (DEVELOP) {
                if (value == null) {
                    console.error(`参数${key}没有值`);
                    continue;
                }
            }

            switch (typeof value) {
                case 'string':
                    if (value == 'true' || value == 'false') {
                        options._setArgs(key, (value == 'true'))
                        break;
                    }
                default:
                    options._setArgs(key, value)
                    break;
            }
        }

        if (options.getArgs('appType') != null) {
            options.appType = AppType[options.getArgs('appType') as string]
        }

        if (options.getArgs('logLevel') != null) {
            options.logLevel = options.getArgs('logLevel')
        }

        if (options.getArgs('develop') != null) {
            options.develop = options.getArgs('develop')
        }

        if (options.getArgs('process') != null) {
            options.process = options.getArgs('process')
        }

        options.isServer = true
    }
}