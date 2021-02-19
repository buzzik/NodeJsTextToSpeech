const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
module.exports = class FileReader {
    constructor(dir) {
        this.dir = dir || 'txt';
    }
    async readDir(dir, extFilter) {
        extFilter = extFilter || false;
        dir = dir || this.dir;
        let arr = [];
        let names;
        try {
            names = await readdir(dir);
        } catch (err) {
            console.log(err);
        }
        if (names === undefined) {
            console.log('readdir undefined');
        } else {
            names.forEach(file => {
                let filePath = dir + file;
                let fileName = path.basename(filePath, path.extname(filePath));
                let fileExt = path.extname(filePath);
                let data = fs.readFileSync(filePath, "utf8");
                let obj = {
                    path: filePath,
                    name: fileName,
                    ext: fileExt,
                    data: data
                };
                if (extFilter && obj.ext == `.${extFilter}`) {
                    arr.push(obj);
                }
            });
        }
        return arr;
    }

};