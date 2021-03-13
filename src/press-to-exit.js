const process = require('process');
function pressToExit(text) {
  console.log(text);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
}
module.exports = pressToExit;
