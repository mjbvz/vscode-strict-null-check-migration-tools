// @ts-check
const path = require('path');
const dependencyTree = require('dependency-tree');
const glob = require('glob')
const config = require('./config')


module.exports.forStrictNullCheckEligibleFiles = (vscodeRoot, forEach) => {
    const srcRoot = path.join(vscodeRoot, 'src');

    const checkedFiles = new Set(
        require(path.join(srcRoot, config.targetTsconfig)).include
            .map(include => path.join(srcRoot, include)));

    const visited = {};

    return new Promise((resolve, reject) => {
        glob(`${srcRoot}/vs/**/*.ts`, (err, files) => {
            if (err) {
                return reject(err);
            }

            return resolve(files
                .filter(file => !file.endsWith('.d.ts') && !file.endsWith('.test.ts'))
                .filter(file => !checkedFiles.has(file))
                .filter(file => {
                    const nonCheckedImports = dependencyTree.toList({
                        filename: file,
                        directory: srcRoot,
                        visited: visited
                    })
                        .filter(x => x !== file)
                        .filter(x => !checkedFiles.has(x));

                    const isEdge = nonCheckedImports.length === 0;
                    if (isEdge) {
                        forEach(file);
                    }
                    return isEdge;
                }));
        });
    });
}