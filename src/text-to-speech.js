const stream = require('stream');
const fs = require('fs');
const process = require('process');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const got = require('got');

async function parseTTS(text, fiePath, voice, extension) {
  const newFile = fs.createWriteStream(fiePath);
  const url = `https://text-to-speech-demo.ng.bluemix.net/api/v3/synthesize?text=${text}&voice=${voice}&ssmlLabel=SSML&download=true&accept=audio%2F${extension}`;
  const response = await got.stream(url).on('downloadProgress', (progress) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress.transferred + '  bytes ');
  });
  await pipeline(response, newFile);
  console.log(' Done.');
  return true;
}
module.exports = { parseTTS };
