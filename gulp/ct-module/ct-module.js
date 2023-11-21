const fs = require('fs');
const path = require('path');

function walk(dir, list) {
    let files = fs.readdirSync(dir);

    files.forEach((item) => {
        let filePath = path.join(dir, item);
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, list);
        } else {
            if (path.basename(filePath) == 'ct-module.json') {
                list.push(filePath);
            }
        }
    });
}

function searchModule(path) {
    let result = [];
    let moduleList = [];
    walk(path, moduleList)

    return moduleList;
}

function getModuleInfo(path) {
    let content = fs.readFileSync(path, 'utf8');
    let json = JSON.parse(content);

    return json;
}

function parseINI(filepath) {
    if (fs.existsSync(filepath) == false) {
        return {};
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let result = {};
    let lines = content.split('\n');
    let curObj = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // 可能是空行 也可能是描述
        if (!line.startsWith('[') || !line.endsWith(']')) {
            // 有点长度就按描述处理
            if (line.length > 3) {
                curObj.desc = line;
            }

            continue
        }

        let symbol = line.substring(1, line.length - 1);

        if (symbol.startsWith('name=')) {
            symbol = symbol.substring('name='.length);
            curObj = {};
            curObj.name = symbol;
            result[curObj.name] = curObj;
        } else if (symbol.startsWith('export=')) {
            symbol = symbol.substring('export='.length);
            curObj.export = symbol.toLowerCase() == 'true';
        }
    }

    return result;
}

// 收集所有的代码模块
// 对比配置文件 如果没有配置文件 提示更新
// 如果配置文件没有设置导出 不进行导出操作
// 将所有需要导出的写入cocos-node.ts
function updateImportFile(iniPath, importFilePath, codePaths){
    // 获取导出的模块信息
    let cfgModules = parseINI(iniPath);

    // 获取模块信息
    let moduleList = [];
    for (const codePath of codePaths) {
        let modules = searchModule(codePath);
    
        moduleList = moduleList.concat(modules);
    }

    // console.log('moduleList', moduleList);

    let moduleInfos = {};
    let needExportModules = {};

    for (const m of moduleList) {
        let info = getModuleInfo(m);

        // console.log('info', info);

        if(moduleInfos[info.name]){
            console.warn('模块' + info.name + '重复');
        }

        info.filepath = m;

        moduleInfos[info.name] = info;

        // 配置模块中不存在的模块 不导出
        if(!cfgModules[info.name]){
            continue
        }

        // 配置不导出
        if(!cfgModules[info.name].export){
            continue
        }

        needExportModules[info.name] = info;

        // 处理下依赖模块
        info._deps = {};
        for (const dep of info.deps) {
            info._deps[dep] = true;
        }
    }

    // 检查配置中的模块是否都存在
    for(const name in cfgModules){
        if(!moduleInfos[name]){
            console.warn('模块' + name + '不存在');
        }
    }

    // 写入cocos-node.ts
    let content = '// 自动生成 请勿在此处添加代码\n';

    for(const name in needExportModules){
        let info = needExportModules[name];

        // 检查依赖是否导出
        for (const depModule of info.deps) {
            if(!moduleInfos[depModule]){
                console.warn(`模块${info.name}依赖的模块${depModule}未导出`);
            }
        }

        let state = fs.statSync(info.filepath);

        // 获取文件所在路径
        let dir = path.dirname(info.filepath);
        let filename = info.entry;
        filename = filename.substring(0, filename.length - path.extname(filename).length);
        let str = `export * from '${dir}/${filename}';\n`;

        str = str.replace(`..\\..\\src\\`, '../../').replace(/\\/g, '/');

        content += str;
    }

    // console.log('写入文件', importFilePath)
    fs.writeFileSync(importFilePath, content, 'utf8');
}

module.exports = {
    searchModule,
    getModuleInfo,
    parseINI,
    updateImportFile,
}