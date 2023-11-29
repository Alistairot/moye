import { ViewLayer } from "./ViewLayer";
import { AMoyeView } from "./AMoyeView";
import { IMoyeViewConfig } from "./IMoyeViewConfig";
import { DecoratorCollector, Type } from "../../Core/Core";

export const ViewDecoratorType = "ViewDecorator";

export function ViewDecorator(name: string, layer: ViewLayer, viewCfg?: Type<IMoyeViewConfig>) {
    return function (target: Type<AMoyeView>) {
        DecoratorCollector.inst.add(ViewDecoratorType, target, name, layer, viewCfg);
    };
}