import { coreError } from "../../../../common/Core/Logger/CoreLogHelper"
import { Logger } from "../../../../common/Core/Logger/Logger"
import { Options } from "../../../../common/Core/Options/Options"
import { Game } from "../../../../common/Core/Singleton/Game"
import { WinstonLogger } from "../../Module/Logger/WinstonLogger"

export class LoggerLoader{
    static run(){
        Game.addSingleton(Logger).iLog = new WinstonLogger
        
        process.on('uncaughtException', function (err) {
            // 这里会导致进程结束
            coreError('[cocos-node.uncaughtException][processid: {2}], message= {1}, stack= {0}', err.stack, err.message, Options.getInst().process);
        })

        process.on('unhandledRejection', function (reason, promise) {
            if(reason instanceof Error){
                coreError('[cocos-node.unhandledRejection], message= {1}, stack= {0}', reason.stack, reason.message);
            }else{
                coreError('[cocos-node.unhandledRejection]', reason);
            }
        })
    }
}