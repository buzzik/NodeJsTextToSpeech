class Throttler {
  constructor(ms) {
    this.ms = ms;
    this.queue = [];
    this.timer;
    this.isDone = false;
  }
  add(callback) {
    this.queue.push(callback);
    this.resetTimer();
  }
  remove() {}
  do() {
    // console.log(this.queue.length);
    if (this.queue.length === 0) {
      this.isDone = true;
      return;
    }
    let func = this.queue.shift();
    // console.log(func);
    func();
    this.resetTimer();
  }
  resetTimer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.do();
    }, this.ms);
  }
}
module.exports = Throttler;
