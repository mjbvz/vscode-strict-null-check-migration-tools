module.exports.targetTsconfig = 'tsconfig.strictNullChecks.json';

module.exports.skippedFiles = new Set([
    'vs/workbench/parts/terminal/node/windowsShellHelper.ts',
    'vs/base/node/ps.ts',
    'vs/code/electron-browser/processExplorer/processExplorerMain.ts'
])