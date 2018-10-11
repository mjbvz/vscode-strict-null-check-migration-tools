Scripts to help [migrate VS Code to use strict null checks](https://github.com/Microsoft/vscode/issues/60565)

## Usage

```bash
$ npm install
```

The main script prints of list of files that are eligible for strict null checks. This includes all files that only import files thare are already strict null checked. 

```bash
$ node index /path/to/vscode
```