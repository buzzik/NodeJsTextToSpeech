const fs = require('fs');
const stream = require('stream');
const getDirFiles = require('./src/get-dir-files.js');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { ttsParse } = require('./src/text-to-speech.js');
const { getCreds } = require('json-credentials');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const pressToExit = require('./src/press-to-exit.js');
const pipeline = promisify(stream.pipeline);
const got = require('got');
const configFile = 'config.json';
let iterator = 0;
let ttsAPI, credentials, txtArr;

(async () => {
  const configData = await readFile(configFile);
  const config = JSON.parse(configData);
  const params = {
    voice: config.voice,
    accept: `audio/${config.extension}`
  };
  txtArr = await getDirFiles(config.textDir, 'txt');
  if (txtArr.length === 0) {
    return pressToExit('No *.txt files in source folder. Please put the source text files into /txt/ directory. \n Press any key to exit...');
  }
  if (config.mode === 'api') {
    credentials = await getCreds(['key']);
    ttsAPI = new TextToSpeechV1({
      authenticator: new IamAuthenticator({ apikey: credentials.key }),
      serviceUrl: config.serviceUrl
    });
  }

  for (const txtFileObj of txtArr) {
    params.text = txtFileObj.data;
    const resultFilePath = `${config.exportDir}${txtFileObj.name}.${config.extension}`;
    iterator++;
    console.log(`Downloading ${iterator} of ${txtArr.length} : ${txtFileObj.name}`);
    if (config.mode === 'parser') {
      try {
        await ttsParse(params.text, resultFilePath, config.voice, config.extension);
      } catch (err) {
        console.log(err);
      }
      params.text = txtFileObj.data;
    } else {
      try {
        const result = await ttsAPI.synthesize(params);
        let audio = result.result;
        if (config.extension === 'wav' && config.mode === 'api') {
          audio = await ttsAPI.repairWavHeaderStream(audio);
          fs.writeFileSync(resultFilePath, audio);
        } else {
          let newFile = fs.createWriteStream(resultFilePath);
          await pipeline(audio, newFile);
          // audio.pipe(writeableStream);
        }

        //
        // console.log(`${resultFilePath} saved.`);
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }
  pressToExit('Conversion done.\nPress any key to exit');
})();
