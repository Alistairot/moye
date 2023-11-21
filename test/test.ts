import { Program } from "../src/server/src/Program/Program"
import * as TestSingleton from "./TestSingleton"
import * as TestObjectPool from "./TestObjectPool"

const red = (str)=>{
    console.log(`%c${str}`,'color: red')
  }

Program.init()
Program.start()

red('start TestSingleton')
TestSingleton.run()
red('end TestSingleton')

red('start TestObjectPool')
TestObjectPool.run()
red('end TestObjectPool')