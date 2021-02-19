/* jshint esversion: 8 */
// const https = require("https");
const stream = require('stream');
const fs = require("fs");
const { promisify } = require('util');
const process = require('process');
const FileReader = require('./src/FileReader.js');
const TextToSpeech = require('./src/TextToSpeech.js');
const path = require("path");
const textDir = "./txt/";
const exportDir = "./export/";
const exportExt = ".mp3";

// const fetch = require("node-fetch");
const got = require("got");
const pipeline = promisify(stream.pipeline);
const reader = new FileReader();
const tts = new TextToSpeech();

(async() => {
    let txtArr = await reader.readDir(textDir, 'txt');
    if (txtArr.length == 0) {
        console.log('No *.txt files in source folder. Please put the source text files into /txt/ directory. Exiting...');
        return;
    }
    let iterator = 0;
    for (const txtFileObj of txtArr) {
        let resultFilePath = exportDir + txtFileObj.name + exportExt;
        iterator++;
        console.log(`Downloading ${iterator} of ${txtArr.length} : ${txtFileObj.name}`);
        try {
            let res = await tts.convertFile(txtFileObj.data, resultFilePath);
        } catch (err) {
            console.log(err);
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