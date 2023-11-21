import { Scene } from "../../../../common/Entity/Scene"
import { AEvent } from "../../../../common/Event/AEvent"
import { RecycleObj } from "../../../../common/Core/ObjectPool/RecycleObj"

export class EventItem extends RecycleObj {
    scene: Scene
    event: AEvent
}