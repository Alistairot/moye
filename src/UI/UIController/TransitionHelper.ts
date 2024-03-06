import { Node, Size, Tween, UITransform, Vec3, tween } from "cc";
import { UIController_Transition } from "./UIController_Transition";

const TransitionTag_Size = 465;
const TransitionTag_Position = 466;
const TransitionTag_Scale = 467;
const TransitionTag_Angle = 468;

export class TransitionHelper {
    static position(target: Node, value: Vec3, transition: UIController_Transition) {
        Tween.stopAllByTag(TransitionTag_Position, target);
        tween(target).
            tag(TransitionTag_Position).
            delay(transition.delay).
            to(transition.duration, { position: value }).
            start();
    }

    static size(target: UITransform, value: Size, transition: UIController_Transition) {
        Tween.stopAllByTag(TransitionTag_Size, target);
        tween(target).
            tag(TransitionTag_Size).
            delay(transition.delay).
            to(transition.duration, { contentSize: value }).
            start();
    }

    static scale(target: Node, value: Vec3, transition: UIController_Transition) {
        Tween.stopAllByTag(TransitionTag_Scale, target);
        tween(target).
            tag(TransitionTag_Scale).
            delay(transition.delay).
            to(transition.duration, { scale: value }).
            start();
    }

    static angle(target: Node, value: number, transition: UIController_Transition) {
        Tween.stopAllByTag(TransitionTag_Angle, target);
        tween(target).
            tag(TransitionTag_Angle).
            delay(transition.delay).
            to(transition.duration, { angle: value }).
            start();
    }
}