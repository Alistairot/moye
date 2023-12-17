import { EventTouch, Input, Vec3 } from "cc";
import { AEvent, Entity, EventSystem } from "../../Core/Core";
import { JoystickDataType, SpeedType, instance } from "./YYJJoystick";

export class YYJJoystickSpeedChangeEvent extends AEvent{
    speedType: SpeedType;
}

export class YYJJoystickMoveEvent extends AEvent{
    dir: Vec3;
}

export class YYJJoystickListener extends Entity{
    private _speedType = SpeedType.STOP;

    protected awake(): void {
        instance.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected destroy(): void {
        instance.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart() { }

    onTouchMove(event: EventTouch, data: JoystickDataType) {
        const oldSpeedType = this._speedType;
        this._speedType = data.speedType;

        if(oldSpeedType !== this._speedType){
            EventSystem.get().publish(this.domainScene(), YYJJoystickSpeedChangeEvent.create({
                speedType: this._speedType
            }));
        }

        EventSystem.get().publish(this.domainScene(), YYJJoystickMoveEvent.create({
            dir: data.moveVec
        }));
    }

    onTouchEnd(event: EventTouch, data: JoystickDataType) {
        this.onTouchMove(event, data);
    }
}