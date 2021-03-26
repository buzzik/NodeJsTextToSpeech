class Throttler {
  constructor(ms, sameTimeLimit) {
    this.ms = ms;
    this.queue = [];
    this.timer;
    this.isDone = false;
    this.sameTimeCounter = 0;
    this.sameTimeLimit = sameTimeLimit || false;
  }
  add(callback) {
    this.queue.push(callback);
    this.resetTimer();
  }
  remove() {}
  do() {
    if (this.queue.length === 0) {
      this.isDone = true;
      return;
    }
    if (this.sameTimeCounter < this.sameTimeLimit || !this.sameTimeLimit) {
      const func = this.queue.shift();
      func();
      this.sameTimeCounter++;
    }

    this.resetTimer();
  }
  resetTimer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.do();
    }, this.ms);
  }
  checkout() {
    this.sameTimeCounter--;
  }
}
module.exports = Throttler;
