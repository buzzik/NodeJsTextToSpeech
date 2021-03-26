const fs = require('fs');
const getDirFiles = require('./src/get-dir-files.js');
const pressToExit = require('./src/press-to-exit.js');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const TextToSpeech = require('./src/TextToSpeech.js');
const Throttler = require('./src/Throttler.js');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const startTime = new Date();
const configFile = 'config.json';
let counter = 0;
const errArr = [];
let txtArr;

(async () => {
  const configData = await readFile(configFile);
  const config = JSON.parse(configData);
  const queue = new Throttler(config.delay, config.sameTimeLimit);
  config.accept = `audio/${config.extension}`;

  txtArr = await getDirFiles(config.textDir, 'txt');
  if (txtArr.length === 0) {
    return pressToExit('No *.txt files in source folder. Please put the source text files into /txt/ directory. \n Press any key to exit...');
  }
  const tts = new TextToSpeech(config);
  await tts.init();
  console.log('Synthetize started.');
  for (const txt of txtArr) {
    config.text = txt.data;
    const resultFilePath = `${config.exportDir}${txt.name}.${config.extension}`;
    const params = Object.assign({}, config);
    const filePath = JSON.parse(JSON.stringify(resultFilePath));
    queue.add(() => {
      tts
        .synthesize(params)
        .then((stream) => {
          // stream.on('downloadProgress', (progress) => {
          //   process.stdout.clearLine();
          //   process.stdout.cursorTo(0);
          //   process.stdout.write(progress.transferred + '  bytes ');
          // });
          // return pipeline(stream, newFile);
          saveStream(stream, filePath);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
  function saveStream(stream, filename) {
    const newFile = fs.createWriteStream(filename);
    pipeline(stream, newFile)
      .then((res) => {
        counter++;
        queue.checkout();
        console.log(`${counter} of ${txtArr.length} converted. ${filename}`);
        if (counter + errArr.length >= txtArr.length) {
          const executionTime = new Date() - startTime;
          pressToExit(`Conversion done in ${executionTime} ms. With ${errArr.length} errors.\n ${errArr.length ? 'Files with errors\n' + errArr.join('\n') : ''}\nPress any key to exit`);
        }
      })
      .catch((err) => {
        errArr.push(filename);
        console.log(err);
      });
  }
  //
})();
