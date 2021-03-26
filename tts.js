const fs = require('fs');
const fsPromises = fs.promises;
const got = require('got');
const getDirFiles = require('./src/get-dir-files.js');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const TextToSpeech = require('./src/TextToSpeech.js');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const pressToExit = require('./src/press-to-exit.js');
const configFile = 'config.json';
let iterator = 0;
let ttsAPI, credentials, txtArr;

(async () => {
  const configData = await readFile(configFile);
  const config = JSON.parse(configData);
  config.accept = `audio/${config.extension}`;

  txtArr = await getDirFiles(config.textDir, 'txt');
  if (txtArr.length === 0) {
    return pressToExit('No *.txt files in source folder. Please put the source text files into /txt/ directory. \n Press any key to exit...');
  }
  const tts = new TextToSpeech(config);
  await tts.init();

  for (const txt of txtArr) {
    config.text = txt.data;
    config.resultFilePath = `${config.exportDir}${txt.name}.${config.extension}`;
    let audioData;
    iterator++;
    console.log(`Downloading ${iterator} of ${txtArr.length} : ${txt.name}`);
    tts
      .synthesize(config)
      .then((res) => {
        // console.log(res);
        // return pipeline(res, config.resultFilePath);
        // return fsPromises.writeFile(config.resultFilePath, res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  pressToExit('Conversion done.\nPress any key to exit');
})();
