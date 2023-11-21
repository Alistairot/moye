const fs = require('fs');
let moyeModule = require('./moye-module');

let codePaths = [];

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--code') {
        let paths = process.argv[i + 1];

        codePaths = paths.split(',');
    }
}

exportModuleFile = 'modules.txt';

// 获取原有模块列表信息
let oldExportModule = moyeModule.parseINI(exportModuleFile);

// 获取模块信息
let moduleList = []

for (const p of codePaths) {
    let modules = moyeModule.searchModule("../" + p);

    console.log('serchModule', modules, "../" + p);

    moduleList = moduleList.concat(modules);
}

let exportContent = '';

for (const m of moduleList) {
    let info = moyeModule.getModuleInfo(m);
    exportContent += `[name=${info.name}]\n`;

    if(oldExportModule[info.name]){
        exportContent += `[export=${oldExportModule[info.name].export}]\n`;
    }else{
        exportContent += `[export=true]\n`;
    }

    exportContent += `${info.description}\n\n`;
}


// 写入模块信息
fs.writeFileSync(exportModuleFile, exportContent, 'utf8');