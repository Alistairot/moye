import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { ProcessMgr } from "./ProcessMgr";
import mri from "mri";
import { ChildProcess, exec, fork } from "child_process";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";

/**
 * 用于守护进程启动其他进程
 */
export class ProcessStartMgr extends Singleton {
    run() {
        let processMgr = ProcessMgr.getInst();
        let processInfos = processMgr.getThisMachineProcessInfos();
        let startArgsMap: Map<string, any> = new Map();
        let args = mri(process.argv.slice(2))

        // 将启动参数原样传递给其他进程
        for (const key in args) {
            let value = args[key]
            startArgsMap.set(key, value)
        }

        for (let processInfo of processInfos) {
            startArgsMap.set('appType', "Server");
            startArgsMap.set('process', processInfo.id);
            let newMap = new Map(startArgsMap);
            this.startProcess(newMap)
        }
    }

    private startProcess(startArgsMap: Map<string, any>) {
        let entryScriptPath = process.argv[1];
        let processName = `process${startArgsMap.get('process')}`;
        // 这句应该可以process.argv获取到 后面再看
        let cmd = `node --es-module-specifier-resolution=node --no-warnings ${entryScriptPath}`
        let cmds = [];

        for (let [key, value] of startArgsMap) {
            cmd += ` --${key}=${value}`
            cmds.push(`--${key}=${value}`)
        }

        coreLog('启动子进程参数: {0}', cmd)

        let childProcess = fork(entryScriptPath, cmds);
        childProcess.disconnect();

        childProcess.on('error', (err) => {
            // This will be called with err being an AbortError if the controller aborts
            coreLog('子进程{0}错误: {1}: {2}', processName, err.message, err.stack);
            coreLog('重启子进程{0}', processName);
            return this.startProcess(startArgsMap)
        });

        childProcess.on('exit', (code, signal) => {
            coreLog('子进程{0}退出: code= {1}, signal= {2}', processName, code, signal);
            coreLog('重启子进程{0}', processName);
            return this.startProcess(startArgsMap)
        });
        
        childProcess.on('close', (code, signal) => {
            coreLog('子进程{0}关闭: code= {1}, signal= {2}', processName, code, signal);
            coreLog('重启子进程{0}', processName);
            return this.startProcess(startArgsMap)
        });
    }
}