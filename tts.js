const fs = require('fs');
const FileReader = require('./src/file-reader.js');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { parseTTS } = require('./src/text-to-speech.js');
const { getCreds } = require('json-credentials');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const reader = new FileReader();
const pressToExit = require('./src/press-to-exit.js');
const configFile = 'config.json';

(async () => {
  const configData = await readFile(configFile);
  const config = JSON.parse(configData);
  const txtArr = await reader.readDir(config.textDir, 'txt');
  if (config.mode === 'api') {
    console.log(config.mode);
    const credsData = await getCreds(['key']);
    var textToSpeech = new TextToSpeechV1({
      authenticator: new IamAuthenticator({ apikey: credsData.key }),
      serviceUrl: config.serviceUrl
    });
  }
  const params = {
    text: '',
    voice: config.voice,
    accept: `audio/${config.extension}`
  };
  if (txtArr.length === 0) {
    console.log('No *.txt files in source folder. Please put the source text files into /txt/ directory. Exiting...');
    return;
  }
  let iterator = 0;
  for (const txtFileObj of txtArr) {
    params.text = txtFileObj.data;
    const resultFilePath = `${config.exportDir}${txtFileObj.name}.${config.extension}`;
    iterator++;
    console.log(`Downloading ${iterator} of ${txtArr.length} : ${txtFileObj.name}`);
    if (config.mode === 'parser') {
      try {
        await parseTTS(params.text, resultFilePath, config.voice, config.extension);
      } catch (err) {
        console.log(err);
      }
      params.text = txtFileObj.data;
    } else {
      try {
        const result = await textToSpeech.synthesize(params);
        let audio = result.result;
        if (config.extension === 'wav') {
          audio = await textToSpeech.repairWavHeaderStream(audio);
        }
        fs.writeFileSync(resultFilePath, audio);
        console.log(`${resultFilePath} saved.`);
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }
  pressToExit('Conversion done.\nPress any key to exit');
})();
