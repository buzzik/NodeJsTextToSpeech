const stream = require('stream');
const fs = require('fs');
const process = require('process');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const got = require('got');
class TTSParser {
  async synthesize(config) {
    // const newFile = fs.createWriteStream(config.resultFilePath);
    const url = `https://text-to-speech-demo.ng.bluemix.net/api/v3/synthesize?text=${config.text}&voice=${config.voice}&ssmlLabel=SSML&download=true&accept=audio%2F${config.extension}`;
    return got.stream(url);
    // const response = await got.stream(url).on('downloadProgress', (progress) => {
    //   process.stdout.clearLine();
    //   process.stdout.cursorTo(0);
    //   process.stdout.write(progress.transferred + '  bytes ');
    // });
    // await pipeline(response, newFile);
    // console.log(' Done.');
    // return true;
  }
}
module.exports = TTSParser;
