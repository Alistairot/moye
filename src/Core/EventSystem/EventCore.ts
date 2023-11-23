import { Singleton } from "../Singleton/Singleton";
import { Type } from "../Type/Type";
import { AEvent } from "./AEvent";

/**
 * before singleton add
 * 
 * NOTE: scene is null
 */
export class BeforeSingletonAdd extends AEvent {
    singletonType: Type<Singleton>;
}

/**
 * after singleton add
 * 
 * NOTE: scene is null
 */
export class AfterSingletonAdd extends AEvent {
    singletonType: Type<Singleton>;
}

/**
 * before program init
 * 
 * NOTE: scene is null
 */
export class BeforeProgramInit extends AEvent {
}

/**
 * after program init
 * 
 * NOTE: scene is null
 */
export class AfterProgramInit extends AEvent {
}

/**
 * before program start
 * 
 * NOTE: scene is null
 */
export class BeforeProgramStart extends AEvent {
}

/**
 * after program start,
 * you can listen this event and start your game logic
 * 
 * NOTE: scene is null
 */
export class AfterProgramStart extends AEvent {
}

/**
 * 创建ClientScene后
 */
export class AfterCreateClientScene extends AEvent {
}

/**
 * 创建CurrentScene后
 */
export class AfterCreateCurrentScene extends AEvent {
}