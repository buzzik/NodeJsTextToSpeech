const got = require('got');
class TTSParser {
  async synthesize(config) {
    const url = `https://text-to-speech-demo.ng.bluemix.net/api/v3/synthesize?text=${config.text}&voice=${config.voice}&ssmlLabel=SSML&download=true&accept=audio%2F${config.extension}`;
    return got.stream(url);
  }
}
module.exports = TTSParser;
