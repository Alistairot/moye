import { Logger } from "../../../../common/Core/Logger/Logger"
import { Game } from "../../../../common/Core/Singleton/Game"
import { CocosLogger } from "../../Module/Logger/CocosLogger"

export class LoggerLoader{
    static run(){
        Game.addSingleton(Logger).iLog = new CocosLogger
    }
}