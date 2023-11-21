import { ObjectPool } from "../src/common/Core/ObjectPool/ObjectPool"

export function run() {
    for(let i = 0; i < 1000; i++){
        let ainst = ObjectPool.getInst().fetch(A)
        ObjectPool.getInst().recycle(ainst)
    }
};

class A {
    constructor(){
        console.log('A ctor')
    }
}