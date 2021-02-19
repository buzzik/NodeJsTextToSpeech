/* jshint esversion: 8 */
// const https = require("https");
const stream = require('stream');
const fs = require("fs");
const { promisify } = require('util');
const process = require('process');
const axios = require('axios');
const path = require("path");
const ProgressBar = require('progress')
const textStorage = "./txt/";
const soundStorage = "./export/";

// const fetch = require("node-fetch");
const got = require("got");
const pipeline = promisify(stream.pipeline);
class TextToSpeech {
    constructor() {
        this.txtFolder = textStorage;
        this.exportFolder = soundStorage;
        this.exportExt = ".mp3";
        this.txtArray = [];
        this.currentFile = 0;
        this.init();
    }
    init() {
        this.readFiles();
    }
    readFiles() {
        var self = this;
        fs.readdir(textStorage, (err, files) => {
            files.forEach(file => {
                let filePath = textStorage + file;
                // let fileName = path.basename(filePath);
                let fileName = path.basename(filePath, path.extname(filePath));
                let fileExt = path.extname(filePath);
                let contents = fs.readFileSync(filePath, "utf8");
                let currentFileObj = {
                    path: filePath,
                    name: fileName,
                    ext: fileExt,
                    content: contents
                };
                this.txtArray.push(currentFileObj);
            });
            // console.log(this.txtArray);
            self.convertFiles();
        });
    }
    convertFiles() {
        let self = this;
        let newFilePath =
            this.exportFolder + this.txtArray[this.currentFile].name + this.exportExt;
        let writer = fs.createWriteStream(newFilePath);
        let body = "";
        let delay = 2000;
        console.log(`Converting: ${newFilePath} ...`);
        console.log(`Text: ${this.txtArray[this.currentFile].content}`);
        let url = "https://text-to-speech-demo.ng.bluemix.net/api/v3/synthesize?text=" +
            self.txtArray[self.currentFile].content +
            "&voice=en-US_LisaV3Voice&ssmlLabel=SSML&download=true&accept=audio%2Fmp3";
        (async() => {
            try {
                console.log("Downloading...");
                console.log(url);

                const response = await axios({ url, method: 'GET', responseType: 'stream' });
                // .on('downloadProgress', progress => {
                //     // Report download progress

                //     // console.log(progress.transferred);
                //     process.stdout.clearLine();
                //     process.stdout.cursorTo(0);
                //     process.stdout.write(progress.transferred + '  bytes');
                // });


                // console.log(response);
                // const totalLength = response.headers['content-length'];
                console.log(response.headers);
                const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
                    width: 40,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: 100000
                });
                response.data.on('data', (chunk) => progressBar.tick(chunk.length));
                response.data.pipe(writer);

                // await pipeline(response.data, newFile);
                self.currentFile++;
                console.log(` done! File ${self.currentFile} of ${self.txtArray.length}`);
                if (self.currentFile < self.txtArray.length) {
                    self.convertFiles();
                } else {
                    console.log(`conversion over.`);
                }
            } catch (error) {
                console.log("\n We get an error!!!111");
                console.log(error);
                setTimeout(() => self.convertFiles(), 15000);
            }

        })();
    }
}
new TextToSpeech();