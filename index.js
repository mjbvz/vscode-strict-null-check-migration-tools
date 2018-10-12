// @ts-check
const path = require('path');
const glob = require('glob');
const { forStrictNullCheckEligibleFiles, forEachFileInSrc } = require('./src/getStrictNullCheckEligibleFiles');
const { getImportsForFile } = require('./src/tsHelper');

const vscodeRoot = path.join(process.cwd(), process.argv[2]);
const srcRoot = path.join(vscodeRoot, 'src');

forStrictNullCheckEligibleFiles(vscodeRoot, () => { }).then(async eligibleFiles => {
    const eligibleSet = new Set(eligibleFiles);

    const dependedOnCount = new Map(eligibleFiles.map(file => [file, 0]));

    for (const file of await forEachFileInSrc(srcRoot)) {
        if (eligibleSet.has(file)) {
            // Already added
            continue;
        }

        for (const imp of getImportsForFile(file, srcRoot)) {
            if (dependedOnCount.has(imp)) {
                dependedOnCount.set(imp, dependedOnCount.get(imp) + 1);
            }
        }
    }

    const sortedCounts = Array.from(dependedOnCount.entries()).sort((a, b) => b[1] - a[1]);
    for (const pair of sortedCounts) {
        console.log(`${toFormattedFilePath(pair[0])} — Depended on by ${pair[1]} files`);
    }
});


function toFormattedFilePath(file) {
    // return `"./${path.relative(srcRoot, file)}",`;
    return `- [ ] './${path.relative(srcRoot, file)}'`;
}