
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
        console.log(`Trying to auto add '${file}'`);

        const tsconfigPath = path.join(srcRoot, config.targetTsconfig);
        const initialConfig = JSON.parse(fs.readFileSync(tsconfigPath).toString());

        const newConfig = Object.assign({}, initialConfig);
        newConfig.include = Array.from(initialConfig.include)
        newConfig.include.push('./' + path.relative(srcRoot, file));
        fs.writeFileSync(tsconfigPath, JSON.stringify(newConfig, null, '\t'));

        child_process.exec(`tsc -p ${tsconfigPath}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`Reverting`);
                fs.writeFileSync(tsconfigPath, JSON.stringify(initialConfig, null, '\t'));
            } else {
                console.log(`Accepting`);
            }
            resolve();
        });
    });
}