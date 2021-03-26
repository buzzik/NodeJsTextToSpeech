const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
module.exports = class FileReader {
  constructor(dir) {
    this.dir = dir || 'txt';
  }
  async readDir(dir, extFilter) {
    extFilter = extFilter || false;
    dir = dir || this.dir;
    const arr = [];
    let names;
    try {
      names = await readdir(dir);
    } catch (err) {
      console.log(err);
    }
    if (names === undefined) {
      console.log('readdir undefined');
    } else {
      names.forEach((file) => {
        const filePath = dir + file;
        const fileName = path.basename(filePath, path.extname(filePath));
        const fileExt = path.extname(filePath);
        const data = fs.readFileSync(filePath, 'utf8');
        const obj = {
          path: filePath,
          name: fileName,
          ext: fileExt,
          data: data
        };
        if (extFilter && obj.ext === `.${extFilter}`) {
          arr.push(obj);
        }
      });
    }
    return arr;
  }
};
