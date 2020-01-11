const https = require("https");
const fs = require("fs");
const path = require("path");
const testFolder = "./txt/";
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
        var self = this;
        let newFilePath =
            this.exportFolder + this.txtArray[this.currentFile].name + this.exportExt;
        let newFile = fs.createWriteStream(newFilePath);
        let body = "";
        let delay = 1000;
        console.log(`converting ${newFilePath} ...`);
        console.log(this.txtArray[this.currentFile].content);
        let request = https.get(
            "https://text-to-speech-demo.ng.bluemix.net/api/v1/synthesize?text=" +
            this.txtArray[this.currentFile].content +
            "&voice=en-US_LisaV3Voice&ssmlLabel=SSML&download=true&accept=audio%2Fmp3",
            function(response) {
                console.log(`done`);
                response.on("data", function(chunk) {
                    body = chunk;
                });
                response.on("end", () => {
                    // if (body.includes('Too many requests')) {
                    //   delay = 30100;
                    //   console.log('Too many requests. Wait 30 sec');
                    //   setTimeout(()=>self.convertFiles(), delay);
                    // } else {
                    //   console.log(body);
                    //   response.pipe(newFile);
                    //   self.currentFile++;
                    //   if (self.currentFile <self.txtArray.length) {
                    //     setTimeout(()=>self.convertFiles(), delay);
                    //   } else {
                    //     console.log(`conversion over.`);
                    //   }
                    // }
                });
                response.pipe(newFile);
                self.currentFile++;
                if (self.currentFile < self.txtArray.length) {
                    setTimeout(() => self.convertFiles(), delay);
                } else {
                    console.log(`conversion over.`);
                }
            }
        );
    }
}
new TextToSpeech();