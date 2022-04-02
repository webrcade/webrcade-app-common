import * as LOG from '../log'

const registerAudioResume = (obj, cb, interval) => {
  // Audio resume
  let audioCtx = obj;
  let isProcessor = false;

  if (obj.audioCtx) {
    audioCtx = obj.audioCtx;
    isProcessor = true;
  }

  const docElement = document.documentElement;

  let audioSucceeded = false;

  const resumeFunc = () => {
    if (isProcessor && obj.paused) {
      return;
    }

    console.log('### resume func.');
    const fSuccess = () => {
      if (audioSucceeded) return;
      audioSucceeded = true;

      console.log('### success.');
      if (cb) cb(true);

      docElement.removeEventListener("keydown", resumeFunc);
      docElement.removeEventListener("click", resumeFunc);
      docElement.removeEventListener("drop", resumeFunc);
      docElement.removeEventListener("dragdrop", resumeFunc);
      docElement.removeEventListener("touchend", resumeFunc);
    };

    if (audioCtx.state !== 'running') {
      audioCtx.resume()
        .then(() => {
          if (audioCtx.state === 'running') {
            fSuccess();
          } else {
            if (interval !== undefined) {
              setTimeout(resumeFunc, interval);
            }
          }
        });
    } else {
      fSuccess();
    }
  }

  if (interval !== undefined) {
    setTimeout(resumeFunc, interval);
  }

  docElement.addEventListener("keydown", resumeFunc);
  docElement.addEventListener("click", resumeFunc);
  docElement.addEventListener("drop", resumeFunc);
  docElement.addEventListener("dragdrop", resumeFunc);
  docElement.addEventListener("touchend", resumeFunc);
}

class ScriptAudioProcessor {
  constructor(
    channelCount = 2,
    frequency = 48000,
    bufferSize = 16384,
    scriptBufferSize = 2048) {
    this.frequency = frequency;
    this.bufferSize = bufferSize;
    this.scriptBufferSize = scriptBufferSize;
// this.bufferSize = 16384;
// this.scriptBufferSize = 4096;
    this.channelCount = channelCount;
    this.paused = true;

    this.audioCtx = null;
    this.audioNode = null;
    this.mixhead = 0;
    this.mixtail = 0;
    this.callback = null;
    this.debug = false;
    this.adjustVol = 0;

    this.tmpBuffers = new Array(channelCount);
    this.mixbuffer = new Array(channelCount);
    for (let i = 0; i < channelCount; i++) {
      this.mixbuffer[i] = new Array(bufferSize);
    }
  }

  adjustVolume(adjust) {
    if (adjust === 0) {
      return;
    }
    if (adjust > 99) {
      adjust = 99;
    }
    if (adjust < -99) {
      adjust = -99
    }
    if (adjust < 0) {
      this.adjustVol = (100 + adjust) / 99;
    } else {
      this.adjustVol = 1 + (adjust / 5);
    }
    LOG.info("## adjustVolume: " + this.adjustVol);
  }

  setDebug(debug) {
    this.debug = debug;
    return this;
  }

  isPlaying() {
    const { audioCtx } = this;
    return audioCtx && audioCtx.state === 'running';
  }

  setCallback(cb) {
    this.callback = cb;
  }

  getFrequency() { return this.frequency; }

  pause(p) {
    if (p == this.paused)
      return;
    if (this.audioCtx) {
      if (!p) {
        this.audioCtx.resume();
      } else {
        this.audioCtx.suspend();
      }
    }
    this.paused = p;
  }

  start() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      this.audioCtx = window.AudioContext ?
        new window.AudioContext({ sampleRate: this.frequency }) :
        new window.webkitAudioContext();
      if (this.audioCtx.sampleRate) {
        this.frequency = this.audioCtx.sampleRate;
      }
      this.audioNode = this.audioCtx.createScriptProcessor(
        this.scriptBufferSize, 0, this.channelCount);
      this.audioNode.onaudioprocess = (e) => {
        for (let i = 0; i < this.channelCount; i++) {
          this.tmpBuffers[i] = e.outputBuffer.getChannelData(i);
        }
        let done = 0;
        let len = this.tmpBuffers[0].length;
        while ((this.mixtail != this.mixhead) && (done < len)) {
          for (let i = 0; i < this.channelCount; i++) {
            this.tmpBuffers[i][done] = this.mixbuffer[i][this.mixtail];
          }
          done++;
          this.mixtail++;
          if (this.mixtail == this.bufferSize) {
            this.mixtail = 0;
          }
        }

        if (this.debug) {
          if ((this.mixtail === this.mixhead) && (done < len)) {
            LOG.info("Not enough samples available: " + (len-done));
          }
        }

        while (done < len) {
          for (let i = 0; i < this.channelCount; i++) {
            this.tmpBuffers[i] = 0;
          }
          done++;
        }
      }
      this.audioNode.connect(this.audioCtx.destination);
      this.paused = false;

     // Add audio resume
     setTimeout(() => {
      if (!this.isPlaying()) {
        registerAudioResume(this, this.callback);
        if (this.callback) this.callback(false);
      }}, 100);
    }
  }

  storeSound(channels, length) {
    // TODO: Add adjust volume?
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < channels.length; j++) {
        this.mixbuffer[j][this.mixhead] = channels[j][i];
      }
      this.mixhead++;
      if (this.mixhead == this.bufferSize)
        this.mixhead = 0;
    }
  }

  //max = 0;

  storeSoundCombinedInput(channels, channelCount, length, offset = 0, divisor = 1) {
    const adjust = this.adjustVol == 0 ? 1 : this.adjustVol;
    for (let i = 0; i < length;) {
      for (let j = 0; j < channelCount; j++) {
        const val = ((channels[offset + i++]) / divisor) * adjust;
        // if (val > this.max) {
        //   this.max = val;
        //   console.log("## new max = " + this.max);
        // }
        this.mixbuffer[j][this.mixhead] = val;
      }
      this.mixhead++;
      if (this.mixhead == this.bufferSize)
        this.mixhead = 0;
      if (this.debug) {
        if (this.mixtail === (this.mixhead + 1)) {
          LOG.info('head hit tail!');
        }
      }
    }
  }
}

export { ScriptAudioProcessor, registerAudioResume }
