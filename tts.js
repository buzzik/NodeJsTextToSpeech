const fs = require('fs');
const fsPromises = fs.promises;
const got = require('got');
const getDirFiles = require('./src/get-dir-files.js');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const TextToSpeech = require('./src/TextToSpeech.js');
const Throttler = require('./src/Throttler.js');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const configFile = 'config.json';
let iterator = 0;
let ttsAPI, credentials, txtArr;

(async () => {
  const configData = await readFile(configFile);
  const config = JSON.parse(configData);
  const queue = new Throttler(config.delay);
  config.accept = `audio/${config.extension}`;

  txtArr = await getDirFiles(config.textDir, 'txt');
  if (txtArr.length === 0) {
    return pressToExit('No *.txt files in source folder. Please put the source text files into /txt/ directory. \n Press any key to exit...');
  }
  const tts = new TextToSpeech(config);
  await tts.init();

  for (const txt of txtArr) {
    config.text = txt.data;
    let resultFilePath = `${config.exportDir}${txt.name}.${config.extension}`;
    iterator++;
    // console.log(`Downloading ${iterator} of ${txtArr.length} : ${txt.name}`);
    let params = Object.assign({}, config);
    let current = JSON.parse(JSON.stringify(iterator));
    let filePath = JSON.parse(JSON.stringify(resultFilePath));
    queue.add(() => {
      tts
        .synthesize(params)
        .then((stream) => {
          stream.on('downloadProgress', (progress) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(progress.transferred + '  bytes ');
          });
          // return pipeline(stream, newFile);
          saveStream(stream, current, txtArr.length, filePath);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
  function saveStream(stream, iterator, total, filename) {
    const newFile = fs.createWriteStream(filename);
    const counter = iterator;
    pipeline(stream, newFile)
      .then((res) => {
        console.log(`${counter} of ${txtArr.length} converted. ${filename}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // pressToExit('Conversion done.\nPress any key to exit');
})();
