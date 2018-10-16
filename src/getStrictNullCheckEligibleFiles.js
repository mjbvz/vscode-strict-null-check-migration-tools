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

    const tsconfig = require(path.join(srcRoot, config.targetTsconfig));
    const checkedFiles = await getCheckedFiles(tsconfig, srcRoot);

    const files = await forEachFileInSrc(srcRoot);
    return files
        .filter(file => !checkedFiles.has(file))
        .filter(file => !config.skippedFiles.has(path.relative(srcRoot, file)))
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

async function getCheckedFiles(tsconfig, srcRoot) {
    const set = new Set(tsconfig.files.map(include => path.join(srcRoot, include)));
    const includes = tsconfig.include.map(include => {
        return new Promise((resolve, reject) => {
            glob(path.join(srcRoot, include), (err, files) => {
                if (err) {
                    return reject(err);
                }

                for (const file of files) {
                    set.add(file);
                }
                resolve();
            })
        });
    });
    await Promise.all(includes);
    return set;
}
