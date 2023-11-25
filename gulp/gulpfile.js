/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const moyeModule = require('./moye-module');
const gulp = require('gulp');
const rollup = require('rollup');
const ts = require('gulp-typescript');
const rename = require("gulp-rename");
const { minify } = require("terser");
const uglify = require('gulp-uglify-es').default;
const { generateDtsBundle } = require('dts-bundle-generator');
const { writeFileSync, readFileSync } = require('fs');
const tsProject = ts.createProject('tsconfig.json', { declaration: true });

gulp.task('updateExportFile', async function () {
    let cfgPath = 'modules.txt';
    let importFilePath = '../src/moye.ts';
    moyeModule.updateImportFile(cfgPath, importFilePath, [
        '../src/',
    ]);

    return;
});

gulp.task('buildJs', () => {
    return tsProject.src().pipe(tsProject()).pipe(gulp.dest('../build'));
});

gulp.task("rollup", async function () {
    let config = {
        input: "../build/moye.js",
        external: ['cc', 'cc/env'],  // 这里似乎不需要填写也可以
        output: {
            file: 'dist/moye.mjs',
            format: 'esm',
            extend: true,
            name: 'moye',
        }
    };
    const subTask = await rollup.rollup(config);

    let config2 = {
        file: '../dist/moye.mjs',
        format: 'esm',
        extend: true,
        name: 'moye',

    };
    await subTask.write(config2);
});

gulp.task("uglify", async function () {
    let content = readFileSync('../dist/moye.mjs', 'utf8');
    let text = content;
    let output = await minify(text, { sourceMap: false });

    writeFileSync('../dist/moye.min.mjs', output.code, { encoding: 'utf8', flag: 'w' });
    return;
});

gulp.task('buildDts', function () {
    return new Promise(function (resolve, reject) {
        let strs = generateDtsBundle([
            {
                filePath: '../build/moye.d.ts',
                output: {
                    inlineDeclareExternals: true
                }
            }],
        {
            preferredConfigPath: "tsconfig.json",
            // followSymlinks: true,
        });

        let content = '';

        strs.forEach(str => {
            content += str;
        });

        writeFileSync('../dist/moye.d.ts', content, { encoding: 'utf8', flag: 'w' });

        resolve();
    });
});

gulp.task('build', gulp.series(
    'updateExportFile',
    'buildJs',
    'rollup',
    'uglify',
    'buildDts'
));