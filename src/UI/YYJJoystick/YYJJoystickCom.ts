import { EventTouch, Input, Vec3, misc } from "cc";
import { JoystickDataType, SpeedType, instance } from "./YYJJoystick";
import { Entity } from "../../Core/Core";

export interface IYYJJoystickEntity extends Entity {
    speedChange(type: SpeedType, speed: number): void;
    setPos(pos: Vec3): void;
    getPos(): Vec3;
    setAngle(angle: number): void;
}

export class YYJJoystickCom extends Entity {
    /**
     * "移动方向"
     */
    moveDir = new Vec3(0, 1, 0);

    /**
     * 速度级别
     */
    private _speedType: SpeedType = SpeedType.STOP;

    /**
     * 移动速度
     */
    private _moveSpeed = 0;

    /**
     * 停止时速度
     */
    stopSpeed = 0;

    /**
     * 正常速度
     */
    normalSpeed = 100;

    /**
     * 最快速度
     */
    fastSpeed = 200;

    /**
     * 是否设置角度
     */
    isRotation: boolean = true;

    private _entity: IYYJJoystickEntity;

    init(entity: IYYJJoystickEntity) {
        this._entity = entity;

        instance.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        instance.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        instance.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        return this;
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
        this.moveDir = data.moveVec;

        this.onSetMoveSpeed(this._speedType);

        if(oldSpeedType !== this._speedType){
            this._entity.speedChange(this._speedType, this._moveSpeed);
        }
    }

    onTouchEnd(event: EventTouch, data: JoystickDataType) {
        const oldSpeedType = this._speedType;
        this._speedType = data.speedType;

        this.onSetMoveSpeed(this._speedType);

        if(oldSpeedType !== this._speedType){
            this._entity.speedChange(this._speedType, this._moveSpeed);
        }

    }

    /**
    * set moveSpeed by SpeedType
    * @param speedType
    */
    onSetMoveSpeed(speedType: SpeedType) {
        switch (speedType) {
        case SpeedType.STOP:
            this._moveSpeed = this.stopSpeed;
            break;
        case SpeedType.NORMAL:
            this._moveSpeed = this.normalSpeed;
            break;
        case SpeedType.FAST:
            this._moveSpeed = this.fastSpeed;
            break;
        default:
            break;
        }
    }

    /**
     * 移动
     */
    move() {
        if (this.isRotation) {
            this._entity.setAngle(
                misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x)) - 90);
        }

        const oldPos = this._entity.getPos();
        const newPos = oldPos.add(
            // fps: 60
            this.moveDir.clone().multiplyScalar(this._moveSpeed / 60)
        );

        this._entity.setPos(newPos);
    }

    update() {
        if (this._speedType !== SpeedType.STOP) {
            this.move();
        }
    }
}