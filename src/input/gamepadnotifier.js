import { GamepadEnum } from './gamepadenum.js'

class GamepadNotifier {
  running = false;
  callbacks = [];
  padDown = false;
  firstPollDelayEnd = -1;
  defaultCallback = null;

  FIRST_POLL_DELAY = 100;

  fireEvent(type) {
    const { callbacks, defaultCallback } = this;
    const e = { "type": type }
    for (let i = 0; i < callbacks.length; i++) {
      if (callbacks[i](e)) return;
    }
    if (defaultCallback) defaultCallback(e);
  }

  pollGamepads = () => {
    const { running, FIRST_POLL_DELAY } = this;
    const gamepads = navigator.getGamepads ?
      navigator.getGamepads() : (navigator.webkitGetGamepads ?
        navigator.webkitGetGamepads : []);

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
        let buttons = pad.buttons;

        if (buttons && buttons.length >= 16) {
          hit = true;
          if (buttons[12].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.UP);
          } else if (buttons[13].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.DOWN);
          } else if (buttons[14].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.LEFT);
          } else if (buttons[15].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.RIGHT);
          } else if (buttons[4].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.LBUMP);
          } else if (buttons[5].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.RBUMP);
          } else if (buttons[0].pressed) {
            if (!padDown && !firstPoll) this.fireEvent(GamepadEnum.A);
          } else {
            hit = false;
          }
        }

        if (!hit) {
          let axes = pad.axes;
          if (axes && axes.length >= 2) {
            let valx = axes[0], valy = axes[1];
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

  setDefaultCallback(cb) {
    this.defaultCallback = cb;
  }
};

export { GamepadNotifier };
