const fs = require('fs');
const fsPromises = fs.promises;
const got = require('got');
const getDirFiles = require('./src/get-dir-files.js');
const pressToExit = require('./src/press-to-exit.js');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const TextToSpeech = require('./src/TextToSpeech.js');
const Throttler = require('./src/Throttler.js');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const startTime = new Date();
const configFile = 'config.json';
let iterator = 0;
let counter = 0;
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
        console.log(`${counter} of ${txtArr.length} converted. ${filename}`);
        if (counter >= txtArr.length) {
          let executionTime = new Date() - startTime;
          pressToExit(`Conversion done in ${executionTime} ms.\nPress any key to exit`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //
})();
