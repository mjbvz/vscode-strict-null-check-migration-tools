
// @ts-check
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const config = require('./src/config');
const { forStrictNullCheckEligibleFiles } = require('./src/getStrictNullCheckEligibleFiles');

const vscodeRoot = path.join(process.cwd(), process.argv[2]);
const srcRoot = path.join(vscodeRoot, 'src');

forStrictNullCheckEligibleFiles(vscodeRoot, () => { }).then(async (files) => {
    for (const file of files) {
        await tryAutoAddStrictNulls(file);
    }
});

function tryAutoAddStrictNulls(file) {
    return new Promise(resolve => {
        const relativeFilePath = path.relative(srcRoot, file);
        console.log(`Trying to auto add '${relativeFilePath}'`);

        const tsconfigPath = path.join(srcRoot, config.targetTsconfig);
        const originalConifg = JSON.parse(fs.readFileSync(tsconfigPath).toString());
        originalConifg.include = Array.from(new Set(originalConifg.include.sort()));

        // Config on accept
        const newConfig = Object.assign({}, originalConifg);
        newConfig.include = Array.from(new Set(originalConifg.include.concat('./' + relativeFilePath).sort()));

        fs.writeFileSync(tsconfigPath, JSON.stringify(newConfig, null, '\t'));

        child_process.exec(`tsc -p ${tsconfigPath}`, (error, stdout) => {
            if (error) {
                console.log(`💥 - ${stdout.match(/ error TS/gi).length}`);
                fs.writeFileSync(tsconfigPath, JSON.stringify(originalConifg, null, '\t'));
            } else {
                console.log(`👍`);
                fs.writeFileSync(tsconfigPath, JSON.stringify(newConfig, null, '\t'));
            }

            resolve();
        });
    });
}