const fs = require('fs');
const process = require('process');
const FileReader = require('./src/file-reader.js');
const config = require('./config.js');
const { parseTTS } = require('./src/text-to-speech.js');
const { getCreds } = require('json-credentials');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const reader = new FileReader();

(async () => {
  const txtArr = await reader.readDir(config.textDir, 'txt');
  const credsData = await getCreds(['key']);
  const textToSpeech = new TextToSpeechV1({
    authenticator: new IamAuthenticator({ apikey: credsData.key }),
    serviceUrl: 'https://api.eu-gb.text-to-speech.watson.cloud.ibm.com/instances/ba27ef29-55aa-4a36-bc6e-13c55c530442'
  });
  const params = {
    text: '',
    voice: config.voice, // Optional voice
    accept: `audio/${config.extension}`
  };
  if (txtArr.length === 0) {
    console.log('No *.txt files in source folder. Please put the source text files into /txt/ directory. Exiting...');
    return;
  }
  let iterator = 0;
  for (const txtFileObj of txtArr) {
    params.text = txtFileObj.data;
    const resultFilePath = config.exportDir + txtFileObj.name + config.extension;
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
  exit();
})();

function exit() {
  console.log('Conversion done.\nPress any key to exit');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
}
