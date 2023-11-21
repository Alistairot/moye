import { ObjectPool } from "../src/common/Core/ObjectPool/ObjectPool";
import { Options } from "../src/common/Core/Options/Options";

export function run(){
    console.log(ObjectPool.getInst().fetch)
    console.log(Options.getInst().process)
};
