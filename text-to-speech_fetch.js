/* jshint esversion: 8 */
const https = require("https");
const fs = require("fs");
const util = require('util');
const streamPipeline = util.promisify(require('stream').pipeline);
const path = require("path");
const testFolder = "./txt/";
const fetch = require("node-fetch");
// const got = require("got");
class TextToSpeech {
    constructor() {
        this.txtFolder = "./txt/";
        this.exportFolder = "./export/";
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
        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                let filePath = testFolder + file;
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
        let newFile = fs.createWriteStream(newFilePath);
        let body = "";
        let delay = 2000;
        console.log(`converting ${newFilePath} ...`);
        console.log(this.txtArray[this.currentFile].content);
        (async() => {
            try {
                let url = "https://text-to-speech-demo.ng.bluemix.net/api/v3/synthesize?text=" +
                    self.txtArray[self.currentFile].content +
                    "&voice=en-US_LisaV3Voice&ssmlLabel=SSML&download=true&accept=audio%2Fmp3";
                let response = await fetch(url);
                console.log(response.body);
                console.log("Downloading.....");
                // response.pipe(newFile);

                if (response.ok) {
                    let saveFile = await streamPipeline(response.body, newFile);
                    self.currentFile++;
                    if (self.currentFile < self.txtArray.length) {
                        // setTimeout(() => self.convertFiles(), 1);
                        // await new Promise((resolve)=> setTimeout(self.convertFiles),delay);
                        self.convertFiles();
                    } else {
                        console.log(`conversion over.`);
                    }
                }
            } catch (error) {
                console.log(error.response.body);
            }

        })();
    }
}
new TextToSpeech();