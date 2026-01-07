import * as LOG from '../log'
import { settings } from '../settings';
import { addDebugDiv } from './debug.js'

export class DisplayLoop {
  constructor(freq = 60, vsync = true, debug = false, forceNative = false, noWait = false) {

// forceNative = false;
// vsync = false;//
// noWait = true;

    this.frequency = freq;
    this.forceAdjustTimestamp = false;
    this.vsync = forceNative ? true : (vsync && settings.isVsyncEnabled());
    this.debug = debug;
    this.paused = true;
    this.isNative = false;
    this.isNativeCheckDone = false;
    this.fps = '';
    this.debugDiv = null;
    this.debugCb = null;
    this.isAdjustTimestampEnabled = true;
    this.isNoWait = noWait;

    if (this.debug) {
      this.debugDiv = addDebugDiv();
    }

    if (forceNative) {
      this.isNative = true;
      this.isNativeCheckDone = true;
    } else {
      if (!this.isNoWait) {
        this.checkNativeFps();
      }
    }
  }

  setAdjustTimestampEnabled(val) {
    this.isAdjustTimestampEnabled = val;
  }

  checkNativeFps() {
    if (!this.vsync || ((this.frequency % 1) !== 0)) {
      this.isNativeCheckDone = true;
      return;
    }

    this.TEST_BEGIN = this.frequency * 5;
    this.TEST_COUNT = this.frequency * 5;

    let fc = 0;
    let start = 0;
    let end = start;

    const f = () => {
      const NOW = performance.now();
      fc++; end = NOW;
      if (start === 0 && fc === this.TEST_BEGIN) {
        start = NOW;
        fc = 0;
        LOG.info('native fps test beginning.')
        requestAnimationFrame(f);
      } else if (fc === this.TEST_COUNT) {
        this.isNativeCheckDone = true;

        const fps = (1000/((end - start)/fc));
        const round = Math.round(fps/10)*10;
        // const diff = Math.abs(round - fps);
        // const nFaster = fps > this.frequency;

        LOG.info('Native FPS: ' + fps + ", round: " + round);

        const tolerance = 0.5;       // acceptable small error
        // const maxDeviation = 5;      // optional, bigger margin for high FPS

        if (Math.abs(fps - this.frequency) <= tolerance && this.vsync) {
          // FPS is within acceptable range
          LOG.info('Native matches frequency.');
          this.isNative = true;
          this.forceAdjustTimestamp = true;
        } else {
          // FPS is too slow or too fast
          LOG.info('Native frequency out of bounds: ' + fps);

          const is60 = (fps > 59.8 && fps <= 60.2);
          console.log("is60: " + is60);
          const retainVsync = this.frequency === 50 && is60;
          console.log("retainVsync: " + retainVsync);
          if (!retainVsync) {
            console.log("Disabling vsync");
            this.vsync = false;
          }
          this.forceAdjustTimestamp = true;
        }

        // LOG.info('Native FPS: ' + fps + ", round: " + round);
        // if ((round === this.frequency) && (diff < 0.5) && this.vsync) {
        //   LOG.info('Native matches frequency.');
        //   this.isNative = true;
        //   this.forceAdjustTimestamp = true;
        // } else if (round < this.frequency || (!nFaster && diff >= 5 /*0.5*/)) {
        //   LOG.info('Native frequency too slow, vsync disabled.');
        //   this.vsync = false;
        //   this.forceAdjustTimestamp = true;
        // } else {
        //   LOG.info('Native not close enough to frequency: ' + fps + ', vsync: ' + this.vsync);
        // }
      } else {
        requestAnimationFrame(f);
      }
    }
    requestAnimationFrame(f)
  }

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

  waitCount = 0;

  start(cb) {
    let { frequency } = this;
    let frameTicks = (1000.0 / frequency);
    let adjustTolerance = (frameTicks * frequency * 2); // 2 secs
    let checkFrequency = frequency * 5;

    LOG.info("Frame ticks: " + frameTicks);
    LOG.info("Frequency: " + frequency);

    const initialStart = performance.now();
    let start = initialStart;
    let fc = 0;
    let avgWait = 0;
    let checkSync = (this.isNoWait || this.isNative) ? 2 : 0;
    let vsyncLow = 0;

    const f = () => {
      let NOW = performance.now();

      if (!this.paused) {
        let waitNow = nextTimestamp === -1 ? 0 : (nextTimestamp - NOW);
        if (!this.isNative && waitNow > 0) {
          const delay = (waitNow > 10) ? 5 : 0;
          if (!this.vsync) {
            // if (nextTimestamp !== -1 && waitNow <= 2) {
            //   while (performance.now() < nextTimestamp) {}
            //   // Update NOW after spin
            //   NOW = performance.now();
            // } else {
              setTimeout(() => this.sync(f, true), delay);
              return;
            // }
          } else {
            this.sync(f, false);
            return;
          }
        }

        nextTimestamp = (nextTimestamp === -1 ?
          NOW + frameTicks : nextTimestamp + frameTicks);

        const freq = cb();
        if (freq) {
          if (this.debug) {
            LOG.info("Frequency changed! : " + freq);
          }
          frequency = freq;
          frameTicks = (1000.0 / freq);
          adjustTolerance = (frameTicks * freq * 2); // 2 secs
          checkFrequency = freq * 5;

          // TODO: Rethink all of this
          this.frequency = freq;
          //this.vsync = false;
        }
        fc++;

        if (this.isAdjustTimestampEnabled) {
          if (((nextTimestamp + adjustTolerance) < NOW) || this.forceAdjustTimestamp) {
            this.forceAdjustTimestamp = false;
            nextTimestamp = -1; fc = 0; start = NOW; avgWait = 0;
            if (this.debug) {
              LOG.info("adjusted next timestamp.");
            }
          }
        }

        if (this.isNoWait) {
          this.sync(f, false);
        } else {
          let wait = nextTimestamp == -1 ? 0 : (nextTimestamp - NOW);
          avgWait += wait;

          if (!this.isNative && !this.vsync && wait > 0) {
            this.waitCount++;
            const delay = (wait > 10) ? 5 : 0;
            setTimeout(() => this.sync(f, true), delay);
          } else {
            this.sync(f, false);
          }
        }

        if (fc > checkFrequency) {
          let elapsed = NOW - start;
          const fpsVal = (1000.0 / (elapsed / fc));

          if (this.debug && checkSync === 1) {
            LOG.info("Checking VSYNC");
          }

          if (this.vsync && (checkSync === 1)) {
            if (fpsVal < (frequency - 0.2)) {
              vsyncLow++;
              if (this.debug) {
                LOG.info("VSYNC low: " + vsyncLow);
              }
              if (vsyncLow === 2) {
                this.isNative = false;
                this.vsync = false;
                this.forceAdjustTimestamp = true;
                checkSync = 2;
                LOG.info('Disabling native and vsync, too slow: ' + fpsVal);
              }
            } else {
              vsyncLow = 0;
            }
          }

          if (this.debug) {
            const fps = (fpsVal).toFixed(2);
            const w = ((avgWait / fc) * frequency).toFixed(2);
            this.fps = `FPS: ${fps}, Vsync: ${this.vsync}, Wait: ${w}, Native: ${this.isNative}, Wait count: ${this.waitCount}`;
            this.debugDiv.innerHTML = this.debugCb ? this.debugCb(this.fps) : this.fps;
            LOG.info(this.fps);
          }

          if (checkSync === 0 && this.isNativeCheckDone) {
            if (this.debug) {
              LOG.info("Check sync start: " + (NOW - initialStart) / 1000.0);
            }
            checkSync = 1;
          } else if (checkSync === 1) {
            if (((NOW - initialStart) / 1000.0) > 60.0) {
              if (this.debug) {
                LOG.info("1 minute has elapsed, disabling vsync check.");
              }
              checkSync = 2;
            }
          }

          start = NOW; fc = 0; avgWait = 0;
        }
      } else {
        this.sync(f, false);
      }
    }

    let nextTimestamp = -1;
    this.pause(false);
    setTimeout(() => this.sync(f, true), 0);
  }

  setDebugCallback(cb) {
    this.debugCb = cb;
  }

  getFps() {
    return this.fps;
  }
}
