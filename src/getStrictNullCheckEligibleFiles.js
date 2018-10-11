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
                    const allProjImports = fileInfo.importedFiles
                        .map(importedFile => importedFile.fileName)
                        .filter(fileName => !/^vs\/css!/.test(fileName)) // remove css imports
                        .filter(x => /\//.test(x)) // remove node modules (the import must contain '/')
                        .map(fileName => {
                            if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
                                return path.join(path.dirname(file), fileName);
                            }
                            if (/^vs/.test(fileName)) {
                                return path.join(srcRoot, fileName);
                            }
                            return fileName;
                        }).map(fileName => {
                            if (fs.existsSync(`${fileName}.ts`)) {
                                return `${fileName}.ts`;
                            }
                            if (fs.existsSync(`${fileName}.d.ts`)) {
                                return `${fileName}.d.ts`;
                            }
                            throw new Error(`Unresolved import ${fileName} in ${file}`);
                        });

                    const nonCheckedImports = allProjImports
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