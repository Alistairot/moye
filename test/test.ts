import { IdStruct } from "../src/Core/IdGenerator/IdStruct";

const idStruct1 = new IdStruct();
idStruct1.init(123, 456, 789);

const result = idStruct1.result;

const idStruct2 = new IdStruct();
idStruct2.initById(result);

console.log('result', result);
console.log('idStruct1', idStruct1);
console.log('idStruct2', idStruct2);
