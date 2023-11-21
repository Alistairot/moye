import { IdStruct } from "../src/Core/IdGenerator/IdStruct";
import { Type } from "../src/Core/Type/Type";

let idStruct1 = new IdStruct();
idStruct1.init(123, 456, 789);

let result = idStruct1.result;

let idStruct2 = new IdStruct();
idStruct2.initById(result);

console.log('result', result)
console.log('idStruct1', idStruct1)
console.log('idStruct2', idStruct2)