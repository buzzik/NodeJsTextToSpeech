const TTSParser = require('./TTSParser.js');
const TTSApi = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { getCreds } = require('json-credentials');
const fs = require('fs');

class TextToSpeech {
  constructor(config) {
    this.mode = config.mode;
    this.config = config;
  }
  async init() {
    if (this.mode === 'api') {
      this.tts = await this.initApi();
    } else {
      this.tts = this.initParser();
    }
    return this.tts;
  }
  initParser() {
    return new TTSParser();
  }
  async initApi() {
    const credentials = await getCreds(['key']);
    return new TTSApi({
      authenticator: new IamAuthenticator({ apikey: credentials.key }),
      serviceUrl: this.config.serviceUrl
    });
  }
  async synthesize(params) {
    if (this.mode === 'api') {
      try {
        const result = await this.tts.synthesize(params);
        let audio = result.result;
        console.log(audio);
        if (params.extension === 'wav') {
          audio = await this.tts.repairWavHeaderStream(audio);
        }
        fs.writeFileSync(params.resultFilePath, audio);

        console.log(`${params.resultFilePath} saved.`);
      } catch (error) {
        console.log(error);
        return;
      }
      return audio;
    } else {
      return this.tts.synthesize(params);
    }
  }
}

module.exports = TextToSpeech;
