// @ts-check
const path = require('path');
const { forStrictNullCheckEligibleFiles } = require('./src/getStrictNullCheckEligibleFiles');

const vscodeRoot = path.join(process.cwd(), process.argv[2]);
const srcRoot = path.join(vscodeRoot, 'src');

forStrictNullCheckEligibleFiles(vscodeRoot, (file) => {
    console.log(toFormattedFilePath(file));
});

function toFormattedFilePath(file) {
    // return `"./${path.relative(srcRoot, file)}",`;
    return `- [ ] \`./${path.relative(srcRoot, file)}\``;
}