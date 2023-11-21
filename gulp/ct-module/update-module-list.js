const fs = require('fs');
let ctModule = require('./ct-module');

let filePath = '';
let codePaths = [];
let exportModuleFile = '../../';

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--module') {
        filePath = process.argv[i + 1];
    } else if (process.argv[i] === '--code') {
        let paths = process.argv[i + 1];

        codePaths = paths.split(',');
    }
}

exportModuleFile = exportModuleFile + filePath + '/modules.txt';

// 获取原有模块列表信息
let oldExportModule = ctModule.parseINI(exportModuleFile);

// 获取模块信息
let moduleList = []

for (const p of codePaths) {
    let modules = ctModule.searchModule("../../" + p);

    moduleList = moduleList.concat(modules);
}

let exportContent = '';

for (const m of moduleList) {
    let info = ctModule.getModuleInfo(m);
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