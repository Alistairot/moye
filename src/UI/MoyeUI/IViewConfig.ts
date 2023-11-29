import { Type } from "../../Core/Core";
import { AMoyeView } from "./AMoyeView";
import { ViewLayer } from "./ViewLayer";
import { IMoyeViewConfig } from "./IMoyeViewConfig";
import { ViewCleanCom } from "./ViewCleanCom";

export interface IViewConfig extends IMoyeViewConfig{
    layer?: ViewLayer
    name?: string
    viewType?: Type<AMoyeView>
    expireTime?: number
    cleanEntitys?: Set<ViewCleanCom>
}