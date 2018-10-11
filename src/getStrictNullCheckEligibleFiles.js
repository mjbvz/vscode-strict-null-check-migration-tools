// @ts-check
const path = require('path');
const ts = require('typescript');
const glob = require('glob');
const config = require('./config');
const fs = require('fs');


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
                    const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());
                    const allImports = fileInfo.importedFiles
                        .map(importedFile => importedFile.fileName)
                        .filter(fileName => !/^vs\/css!/.test(fileName))
                        .map(fileName => fileName + '.ts')
                        .map(fileName => {
                            if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
                                return path.join(path.dirname(file), fileName);
                            }
                            if (/^vs/.test(fileName)) {
                                return path.join(srcRoot, fileName);
                            }
                            return fileName;
                        });

                    const nonCheckedImports = allImports
                        .filter(x => /\//.test(x)) // remove node modules
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