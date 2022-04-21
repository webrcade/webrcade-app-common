import { GamepadEnum } from './gamepadenum.js'
import { isXbox } from '../util/browser.js'
import { StandardPadMapping, CIDS } from './controls.js'


class GamepadNotifier {
  constructor() {
    this.isXbox = isXbox();
    this.running = false;
    this.callbacks = [];
    this.analogCallbacks = [];
    this.globalCallbacks = [];
    this.padDown = false;
    this.firstPollDelayEnd = -1;
    this.defaultCallback = null;
    this.escapePressed = null;
    this.aPressed = null;
    this.mapping = new StandardPadMapping();
    this.buttons = new Array(16);
    this.padCount = 0;
    this.nextAnalog = 0;
    this.analogStep = 1000 / 60.0;
  }

  FIRST_POLL_DELAY = 100;
  NULL_BUTTON = { pressed: false };

  fireEvent(type) {
    const { callbacks, globalCallbacks, defaultCallback } = this;
    const e = { "type": type }
    for (let i = 0; i < globalCallbacks.length; i++) {
      globalCallbacks[i](e);
    }
    for (let i = 0; i < callbacks.length; i++) {
      if (callbacks[i](e)) return;
    }
    if (defaultCallback) defaultCallback(e);
  }

  fireAnalogEvent(type, value) {
    const { analogCallbacks } = this;

    if (value > -.20 && value < .20) {
      return;
    }

    value = (value > 0 ? (value - .20) : (value + .20)) * (1.0 / .80);

    const e = { "type": type, "value": value }
    for (let i = 0; i < analogCallbacks.length; i++) {
      analogCallbacks[i](e);
    }
  }

  pollGamepads = () => {
    const { running, FIRST_POLL_DELAY, mapping, buttons, NULL_BUTTON } = this;
    let gamepads = navigator.getGamepads ?
      navigator.getGamepads() : (navigator.webkitGetGamepads ?
        navigator.webkitGetGamepads : []);

    let pCount = 0;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) pCount++;
    }
    this.padCount = pCount;
    if (pCount === 0) {
      gamepads = [{ buttons: [] }]; // Fake gamepad to allow loop to process
    }

    // This is a bit of a hack to avoid having a button press accepted
    // when the page is initally displayed. There is a pause before
    // accepting any button presses
    let firstPoll = false;
    if (this.firstPollDelayEnd !== 0) {
      if (this.firstPollDelayEnd === -1) {
        firstPoll = true;
        this.firstPollDelayEnd = Date.now() + FIRST_POLL_DELAY;
      } else if (Date.now() < this.firstPollDelayEnd) {
        firstPoll = true;
      } else {
        this.firstPollDelayEnd = 0;
      }
    }

    let hit = false;
    for (let i = 0; i < gamepads.length && !hit; i++) {
      if (gamepads[i]) {

        let padDown = this.padDown;
        let pad = gamepads[i];

        if (pad.buttons) {
          hit = true;

          for (let i = 0; i < buttons.length; i++) {
            if (i < pad.buttons.length) {
              buttons[i] = pad.buttons[i];
            } else {
              buttons[i] = NULL_BUTTON;
            }
          }

          // Left trigger + (start/right analog/select/left analog) = escape
          if ((buttons[mapping.getButtonNum(CIDS.LTRIG)].pressed && (
            buttons[mapping.getButtonNum(CIDS.START)].pressed ||
            buttons[mapping.getButtonNum(CIDS.SELECT)].pressed ||
            buttons[mapping.getButtonNum(CIDS.RANALOG)].pressed ||
            buttons[mapping.getButtonNum(CIDS.LANALOG)].pressed)) ||
            (buttons[mapping.getButtonNum(CIDS.SELECT)].pressed &&
              buttons[mapping.getButtonNum(CIDS.X)].pressed)) {
            if (!padDown && !firstPoll && this.escapePressed === false) {
              this.escapePressed = true;
            }
          } else if ((this.escapePressed == true) && (
            buttons[mapping.getButtonNum(CIDS.LTRIG)].pressed ||
            buttons[mapping.getButtonNum(CIDS.RANALOG)].pressed ||
            buttons[mapping.getButtonNum(CIDS.LANALOG)].pressed ||
            buttons[mapping.getButtonNum(CIDS.X)].pressed ||
            buttons[mapping.getButtonNum(CIDS.SELECT)].pressed ||
            buttons[mapping.getButtonNum(CIDS.START)].pressed)) {
            // Nothing... just make sure buttons are released prior to escape handling
          } else if (buttons[mapping.getButtonNum(CIDS.UP)].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.UP);
          } else if (buttons[mapping.getButtonNum(CIDS.DOWN)].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.DOWN);
          } else if (buttons[mapping.getButtonNum(CIDS.LEFT)].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.LEFT);
          } else if (buttons[mapping.getButtonNum(CIDS.RIGHT)].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.RIGHT);
          } else if (buttons[mapping.getButtonNum(CIDS.LBUMP)].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.LBUMP);
          } else if (buttons[mapping.getButtonNum(CIDS.RBUMP)].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.RBUMP);
          } else if (buttons[mapping.getButtonNum(CIDS.A)].pressed) {
            if (!padDown && !firstPoll && this.aPressed === false) {
              this.aPressed = true;
            }
          } else {
            hit = false;

            if (this.escapePressed !== false) {
              if (this.escapePressed === true) {
                this.fireEvent(GamepadEnum.ESC);
              }
              this.escapePressed = false;
            }

            if (this.aPressed !== false) {
              if (this.aPressed === true) {
                this.fireEvent(GamepadEnum.A);
              }
              this.aPressed = false;
            }
          }
        }

        let axes = pad.axes;
        if (axes) {

          // if (!this.startTime) {
          //   this.startTime = Date.now();
          //   this.count = 0;
          // }

          const time = Date.now();
          const fireAnalog = (time >= this.nextAnalog);
          if (fireAnalog) {
            // this.count++;
            // if ((this.count % 240) === 0) {
            //   console.log((this.count / (time - this.startTime)) * 1000);
            //   this.startTime = Date.now();
            //   this.count = 0;
            // }
            this.nextAnalog += this.analogStep;
            if (time >= this.nextAnalog) {
              this.nextAnalog = (time + this.analogStep);
            }
          }

          if (axes.length >= 2) {
            let valx = axes[0], valy = axes[1];

            if (fireAnalog) {
              this.fireAnalogEvent(GamepadEnum.L_ANALOG_X, valx);
              this.fireAnalogEvent(GamepadEnum.L_ANALOG_Y, valy);
            }

            if (!hit) {
              hit = true;
              if (valy < -0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.UP);
              } else if (valy > 0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.DOWN);
              } else if (valx < -0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.LEFT);
              } else if (valx > 0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.RIGHT);
              } else {
                hit = false;
              }
            }
          }

          if (axes.length >= 4) {
            let valx = axes[2], valy = axes[3];

            if (fireAnalog) {
              this.fireAnalogEvent(GamepadEnum.R_ANALOG_X, valx);
              this.fireAnalogEvent(GamepadEnum.R_ANALOG_Y, valy);
            }

            if (!hit) {
              hit = true;
              if (valy < -0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.R_UP);
              } else if (valy > 0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.R_DOWN);
              } else if (valx < -0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.R_LEFT);
              } else if (valx > 0.5) {
                if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.R_RIGHT);
              } else {
                hit = false;
              }
            }
          }
        }

      }
    }
    this.padDown = hit;

    if (running) {
      requestAnimationFrame(this.pollGamepads);
    }
  };

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.pollGamepads);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
  }

  addCallback(cb) {
    this.callbacks.push(cb);
  }

  removeCallback(cb) {
    this.callbacks = this.callbacks.filter(value => value !== cb);
  }

  addGlobalCallback(cb) {
    this.globalCallbacks.push(cb);
  }

  removeGlobalCallback(cb) {
    this.globalCallbacks = this.globalCallbacks.filter(value => value !== cb);
  }

  addAnalogCallback(cb) {
    this.analogCallbacks.push(cb);
  }

  removeAnalogCallback(cb) {
    this.analogCallbacks = this.analogCallbacks.filter(value => value !== cb);
  }

  setDefaultCallback(cb) {
    this.defaultCallback = cb;
  }
};

export { GamepadNotifier };
