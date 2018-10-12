// @ts-check
const path = require('path');
const { getImportsForFile } = require('./tsHelper');
const glob = require('glob');
const config = require('./config');

const forEachFileInSrc = (srcRoot) => {
    return new Promise((resolve, reject) => {
        glob(`${srcRoot}/vs/**/*.ts`, (err, files) => {
            if (err) {
                return reject(err);
            }

            return resolve(files.filter(file => !file.endsWith('.d.ts') && !file.endsWith('.test.ts')));
        })
    });
};
module.exports.forEachFileInSrc = forEachFileInSrc;


module.exports.forStrictNullCheckEligibleFiles = async (vscodeRoot, forEach) => {
    const srcRoot = path.join(vscodeRoot, 'src');

    const checkedFiles = new Set(
        require(path.join(srcRoot, config.targetTsconfig)).files
            .map(include => path.join(srcRoot, include)));

    const files = await forEachFileInSrc(srcRoot);
    return files
        .filter(file => !checkedFiles.has(file))
        .filter(file => {
            const allProjImports = getImportsForFile(file, srcRoot);

            const nonCheckedImports = allProjImports
                .filter(x => x !== file)
                .filter(x => !checkedFiles.has(x));

            const isEdge = nonCheckedImports.length === 0;
            if (isEdge) {
                forEach(file);
            }
            return isEdge;
        });
}