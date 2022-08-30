// @ts-check
const path = require("path");
const ts = require("typescript");
const fs = require("fs");

module.exports.getImportsForFile = function getImportsForFile(file, srcRoot) {
  const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());

  return (
    fileInfo.importedFiles
      .map((importedFile) => importedFile.fileName)
      // .filter(fileName => !/^vs\/css!/.test(fileName)) // remove css imports
      .filter((x) => /\//.test(x)) // remove node modules (the import must contain '/')
      .filter((x) => /\@/.test(x) == false) // remove node modules with @
      .filter((x) => /next/.test(x) == false) // filter next/xyz imports
      .filter((x) => /lodash/.test(x) == false) // filter lodash/xyz imports
      .filter((x) => !/.svg|.js/.test(x)) // filter .svg and .js imports
      .map((fileName) => {
        if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
          return path.join(path.dirname(file), fileName);
        }
        if (/^vs/.test(fileName)) {
          return path.join(srcRoot, fileName);
        }
        return fileName;
      })
      .map((fileName) => {
        if (fs.existsSync(`${fileName}.ts`)) {
          return `${fileName}.ts`;
        }
        if (fs.existsSync(`${fileName}/index.ts`)) {
          return `${fileName}/index.ts`;
        }
        if (fs.existsSync(`${fileName}.tsx`)) {
          return `${fileName}.tsx`;
        }
        if (fs.existsSync(`${fileName}/index.tsx`)) {
          return `${fileName}/index.tsx`;
        }
        if (fs.existsSync(`${fileName}.js`)) {
          return `${fileName}.js`;
        }
        if (fs.existsSync(`${fileName}.d.ts`)) {
          return `${fileName}.d.ts`;
        }
        throw new Error(`Unresolved import ${fileName} in ${file}`);
      })
  );
};
