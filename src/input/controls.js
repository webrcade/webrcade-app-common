export const CIDS = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
  A: 4,
  B: 5,
  X: 6,
  Y: 7,
  LBUMP: 8,
  RBUMP: 9,
  LTRIG: 10,
  RTRIG: 11,
  SELECT: 12,
  START: 13,
  LANALOG: 14,
  RANALOG: 15,
  ESCAPE: 16
}

export const KCODES = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  Z: 'KeyZ',
  A: 'KeyA',
  X: 'KeyX',
  S: 'KeyS',
  Q: 'KeyQ',
  W: 'KeyW',
  SHIFT_RIGHT: 'ShiftRight',
  ENTER: 'Enter',
  ESCAPE: 'Escape'
}

export class PadMapping {
  constructor(idToButtonNum, axisMappings = []) {
    this.idToButtonNum = idToButtonNum;
    this.buttonNumToId = {};

    for (const [id, num] of Object.entries(idToButtonNum)) {
      this.buttonNumToId[num] = id;
    }
  }

  getButtonNum(cid) {
    const bid = this.idToButtonNum[cid];
    return (bid === undefined ? -1 : bid);
  }

  getAxisIndex(stick, isX) { return -1 };

  getAxisValue(pad, stick, isX) {
    if (pad && pad.axes) {
      const idx = this.getAxisIndex(stick, isX);
      if (idx >= 0 && idx < pad.axes.length) {
        return pad.axes[idx];
      }
    }
    return 0;
  }
}

export class StandardPadMapping extends PadMapping {
  constructor() {
    super({
      [CIDS.UP]: 12,
      [CIDS.DOWN]: 13,
      [CIDS.LEFT]: 14,
      [CIDS.RIGHT]: 15,
      [CIDS.A]: 0,
      [CIDS.B]: 1,
      [CIDS.X]: 2,
      [CIDS.Y]: 3,
      [CIDS.LBUMP]: 4,
      [CIDS.RBUMP]: 5,
      [CIDS.LTRIG]: 6,
      [CIDS.RTRIG]: 7,
      [CIDS.SELECT]: 8,
      [CIDS.START]: 9,
      [CIDS.LANALOG]: 10,
      [CIDS.RANALOG]: 11,
    });
  }

  getAxisIndex(stick, isX) {
    if (stick === 0)
      return isX ? 0 : 1;
    else if (stick === 1) {
      return isX ? 3 : 4;
    } else {
      return -1;
    }
  }
}

export class KeyCodeToControlMapping {
  constructor(keyCodeToControlId = {}) {
    this.keyCodeToControlId = keyCodeToControlId;
    this.controlIdState = {};

    for (const [code, id] of Object.entries(keyCodeToControlId)) {
      this.controlIdState[id] = false;

      this.leftLast = false;
      this.upLast = false;
      this.upHeld = false;
      this.downHeld = false;
      this.rightHeld = false;
      this.leftHeld = false;
    }
  }

  handleKeyEvent(e, down) {
    const cid = this.keyCodeToControlId[e.code];
    if (cid !== undefined) {
      this.controlIdState[cid] = down;

      switch (cid) {
        case CIDS.UP:
          this.upHeld = down;
          if (down) this.upLast = true;
          break;
        case CIDS.DOWN:
          this.downHeld = down;
          if (down) this.upLast = false;
          break;
        case CIDS.RIGHT:
          this.rightHeld = down;
          if (down) this.leftLast = false;
          break;
        case CIDS.LEFT:
          this.leftHeld = down;
          if (down) this.leftLast = true;
          break;
      }
    }
  }

  isControlDown(cid) {
    let down = this.controlIdState[cid];

    if (down !== undefined && down) {
      switch (cid) {
        case CIDS.UP:
          down = !(this.downHeld && !this.upLast);
          break;
        case CIDS.DOWN:
          down = !(this.upHeld && this.upLast);
          break;
        case CIDS.RIGHT:
          down = !(this.leftHeld && this.leftLast);
          break;
        case CIDS.LEFT:
          down = !(this.rightHeld && !this.leftLast);
          break;
      }
    } else {
      down = false;
    }

    return down;
  }
}

export class DefaultKeyCodeToControlMapping extends KeyCodeToControlMapping {
  constructor() {
    super({
      [KCODES.ARROW_UP]: CIDS.UP,
      [KCODES.ARROW_DOWN]: CIDS.DOWN,
      [KCODES.ARROW_RIGHT]: CIDS.RIGHT,
      [KCODES.ARROW_LEFT]: CIDS.LEFT,
      [KCODES.Z]: CIDS.A,
      [KCODES.A]: CIDS.X,
      [KCODES.X]: CIDS.B,
      [KCODES.S]: CIDS.Y,
      [KCODES.Q]: CIDS.LBUMP,
      [KCODES.W]: CIDS.RBUMP,
      [KCODES.SHIFT_RIGHT]: CIDS.SELECT,
      [KCODES.ENTER]: CIDS.START,
      [KCODES.ESCAPE]: CIDS.ESCAPE
    });
  }
}

export class Controller {
  constructor(keyCodeToControlMapping = new KeyCodeToControlMapping()) {
    this.keyCodeToControlMapping = keyCodeToControlMapping;
    this.padMapping = new StandardPadMapping();
    this.pad = null;
    this.isXbox = navigator.userAgent.toLowerCase().includes("xbox");
  }

  setPad(pad) {
    this.pad = pad;
  }

  handleKeyEvent(e, down) {
    this.keyCodeToControlMapping.handleKeyEvent(e, down);
  }

  isPadButtonDown(cid) {
    const { padMapping } = this;
    const { pad } = this;
    const bid = padMapping.getButtonNum(cid);
    let bdown = false;
    if (bid >= 0 && pad && pad.buttons.length > bid) {
      bdown = pad.buttons[bid].pressed;
    }

    if (!bdown) {
      switch (cid) {
        case CIDS.LEFT:
          bdown = padMapping.getAxisValue(this.pad, 0, true) < -0.5;
          break;
        case CIDS.RIGHT:
          bdown = padMapping.getAxisValue(this.pad, 0, true) > 0.5;
          break;
        case CIDS.UP:
          bdown = padMapping.getAxisValue(this.pad, 0, false) < -0.5;
          break;
        case CIDS.DOWN:
          bdown = padMapping.getAxisValue(this.pad, 0, false) > 0.5;
          break;
      }
    }

    return bdown;
  }

  isControlDown(cid) {
    if (this.keyCodeToControlMapping.isControlDown(cid)) {
      return true;
    }

    if ((cid === CIDS.ESCAPE) ||
      (this.isXbox && (cid === CIDS.START || cid == CIDS.SELECT))) {
      if (this.isXbox) {
        if (this.isPadButtonDown(CIDS.LTRIG) || this.isPadButtonDown(CIDS.RTRIG)) {
          if (cid === CIDS.ESCAPE) {
            return (this.isPadButtonDown(CIDS.RANALOG) &&
              this.isPadButtonDown(CIDS.LANALOG))
          } else if (cid == CIDS.START) {
            return this.isPadButtonDown(CIDS.RANALOG);
          } else if (cid === CIDS.SELECT) {
            return this.isPadButtonDown(CIDS.LANALOG);
          }
        }
      } else {
        if (cid === CIDS.ESCAPE) {
          return (this.isPadButtonDown(CIDS.START) &&
            this.isPadButtonDown(CIDS.SELECT));
        }
      }
      return false;
    }

    return this.isPadButtonDown(cid);
  }
}

export class Controllers {
  constructor(controllerArray) {
    this.controllers = controllerArray;

    const docElement = document.documentElement;
    docElement.addEventListener("keydown", e => this.handleKeyEvent(e, true));
    docElement.addEventListener("keyup", e => this.handleKeyEvent(e, false));
  }

  handleKeyEvent(e, down) {
    for (let i = 0; i < this.controllers.length; i++) {
      this.controllers[i].handleKeyEvent(e, down);
    }
  }

  poll() {
    const clen = this.controllers.length;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() :
      (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

    let padIdx = 0;
    for (let idx = 0; padIdx < clen && idx < gamepads.length; idx++) {
      let pad = gamepads[idx];
      if (pad) {
        this.controllers[padIdx].setPad(pad);
        // TODO: Set mapping (IOS, etc.)
        padIdx++;
      }
    }

    for (; padIdx < clen; padIdx++) {
      this.controllers[padIdx].setPad(null);
    }
  }

  isControlDown(controllerIdx, cid) {
    return this.controllers[controllerIdx].isControlDown(cid);
  }
}
