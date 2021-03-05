export class DisplayLoop {
  constructor(freq = 60, vsync = true) {
    this.frequency = freq;
    this.forceAdjustTimestamp = false;
    this.vsync = vsync;
    this.debug = false;
    this.paused = true;
    this.fps = '';
  }

  setDebug(debug) { this.debug = debug; }

  getFrequency() { return this.frequency; }

  sync(cb, afterTimeout) {
    if (this.vsync) {
      requestAnimationFrame(cb);
    } else {
      if (!afterTimeout) {
        setTimeout(cb, 0);
      } else {
        cb();
      }
    }
  }

  pause(p) {
    if (p == this.paused)
      return;
    if (!p) {
      this.forceAdjustTimestamp = true;
    }
    this.paused = p;
  }

  start(cb) {
    const { frequency } = this;
    const frameTicks = (1000.0 / frequency);
    const adjustTolerance = (frameTicks * frequency * 2); // 2 secs
    const debugFrequency = frequency * 10;

    console.log("Frame ticks: " + frameTicks);
    console.log("Frequency: " + frequency);

    let start = Date.now();
    let fc = 0;
    let avgWait = 0;

    const f = () => {
      if (!this.paused) {
        cb();
        nextTimestamp += frameTicks;

        let now = Date.now();
        if (((nextTimestamp + adjustTolerance) < now) || this.forceAdjustTimestamp) {
          this.forceAdjustTimestamp = false;
          nextTimestamp = now; fc = 0; start = now; avgWait = 0;
          console.log("adjusted next timestamp.");
        }

        let wait = (nextTimestamp - now);
        avgWait += wait;
        if (wait > 0) {
          setTimeout(() => this.sync(f, true), wait);
        } else {
          this.sync(f, false);
        }

        fc++;
        if ((fc % debugFrequency) == 0) {
          let elapsed = Date.now() - start;
          if (this.debug) {
            const fps = (1000.0 / (elapsed / fc)).toFixed(2);
            this.fps = `FPS: ${fps} VSYNC: ${this.vsync}`;
            console.log("v:%s, vsync: %d",
              fps,
              this.vsync ? 1 : 0,
              (this.vsync ? "" : ("wait: " + ((avgWait / fc) * frequency).toFixed(2) + ", ")));
          }
          start = Date.now(); fc = 0; avgWait = 0;
        }
      } else {
        this.sync(f, false);
      }
    }

    let nextTimestamp = Date.now();
    this.pause(false);
    setTimeout(() => this.sync(f, true), 0);
  }

  getFps() {
    return this.fps;
  }
}
