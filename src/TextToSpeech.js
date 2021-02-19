const stream = require('stream');
const fs = require("fs");
const process = require('process');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const got = require("got");

module.exports = class TextToSpeech {
    constructor() {}
    async convertFile(txtFileData, resultPath) {
        let newFile = fs.createWriteStream(resultPath);
        let body = "";
        let url = "https://text-to-speech-demo.ng.bluemix.net/api/v3/synthesize?text=" +
            txtFileData +
            "&voice=en-US_LisaV3Voice&ssmlLabel=SSML&download=true&accept=audio%2Fmp3";
        const response = await got.stream(url)
            .on('downloadProgress', progress => {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(progress.transferred + '  bytes ');
            });
        await pipeline(response, newFile);
        console.log(` Done.`);
        return true;
    }
};