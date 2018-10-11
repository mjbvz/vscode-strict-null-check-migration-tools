// @ts-check
const path = require('path');
const dependencyTree = require('dependency-tree');
const glob = require('glob')

const vscodeRoot = path.join(process.cwd(), process.argv[2]);
const srcRoot = path.join(vscodeRoot, 'src');
const targetTsconfig = 'tsconfig.strictNullChecks.json';

const checkedFiles = new Set(
    require(path.join(srcRoot, targetTsconfig)).include
        .map(include => path.join(srcRoot, include)));

const visited = {};

glob(`${srcRoot}/vs/**/*.ts`, (err, files) => {
    for (const file of files) {
        if (file.endsWith('.d.ts') || file.endsWith('.test.ts')) {
            continue;
        }

        if (checkedFiles.has(file)) {
            continue;
        }

        const nonCheckedImports = dependencyTree.toList({
            filename: file,
            directory: srcRoot,
            visited: visited
        })
            .filter(x => x !== file)
            .filter(x => !checkedFiles.has(x));

        if (nonCheckedImports.length === 0) {
            console.log(toFormattedFilePath(file));
        }
    }
})

function toFormattedFilePath(file) {
    // return `"./${path.relative(srcRoot, file)}",`;
    return `- [ ] \`./${path.relative(srcRoot, file)}\``;
}
