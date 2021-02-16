/* jshint esversion: 8 */
// const https = require("https");
const stream = require('stream');
const fs = require("fs");
const { promisify } = require('util');
const process = require('process');
const path = require("path");
const textStorage = "./txt/";
const exportStorage = "./export/";

// const fetch = require("node-fetch");
const got = require("got");
const pipeline = promisify(stream.pipeline);
class TextToSpeech {
    constructor() {
        this.txtFolder = textStorage;
        this.exportFolder = exportStorage;
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
                let fileName = path.basename(filePath, path.extname(filePath));
                let fileExt = path.extname(filePath);
                let contents = fs.readFileSync(filePath, "utf8");
                let currentFileObj = {
                    path: filePath,
                    name: fileName,
                    ext: fileExt,
                    content: contents
                };
                if (currentFileObj.ext == ".txt") {
                    this.txtArray.push(currentFileObj);
                }
            });
            if (this.txtArray.length == 0) {
                console.log("No *.txt files in source folder. Please put the source text files into /txt/ directory. Exiting...");
                return;
            }
            self.convertFiles();

        });
    }
    convertFiles() {
        let self = this;
        let newFilePath =
            this.exportFolder + this.txtArray[this.currentFile].name + this.exportExt;
        let newFile = fs.createWriteStream(newFilePath);
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
                const response = await got.stream(url)
                    .on('downloadProgress', progress => {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(progress.transferred + '  bytes');
                    });
                await pipeline(response, newFile);
                self.currentFile++;
                console.log(`Done. File ${self.currentFile} of ${self.txtArray.length} Converted successfully.`);
                if (self.currentFile < self.txtArray.length) {
                    self.convertFiles();
                } else {
                    console.log(`conversion over.`);
                }
            } catch (error) {
                console.log("\n We got an error!!!");
                console.log(error.response.body);
                setTimeout(() => self.convertFiles(), 15000);
            }

        })();
    }
}
new TextToSpeech();