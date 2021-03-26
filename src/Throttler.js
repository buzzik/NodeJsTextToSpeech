class Throttler {
  constructor(ms, limit) {
    this.ms = ms;
    this.queue = [];
    this.timer;
    this.isDone = false;
    this.limitCounter = 0;
    this.limit = limit || false;
  }
  add(callback) {
    this.queue.push(callback);
    this.resetTimer();
  }
  proceed() {
    if (this.queue.length === 0) {
      this.isDone = true;
      return;
    }
    if (this.limitCounter < this.limit || !this.limit) {
      const callback = this.queue.shift();
      callback();
      this.limitCounter++;
    }
    this.resetTimer();
  }
  resetTimer() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.proceed();
    }, this.ms);
  }
  checkout() {
    this.limitCounter--;
  }
}
module.exports = Throttler;
