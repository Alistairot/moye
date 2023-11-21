import { AEvent } from "../../../../common/Event/AEvent";
import { ReLoginState } from "../Login/ReLoginState";

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

export class ReLoginEvent extends AEvent {
    state: ReLoginState;
}