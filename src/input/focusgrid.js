import { GamepadEnum } from './gamepadenum.js'

class FocusGrid {
  comps = [];
  unhandledCb = null;

  setUnhandledGamepadInputCallback(cb) {
    this.unhandledCb = cb;
  }

  setComponents(comps) {
    this.comps = comps;
  }

  getComponents() {
    return this.comps;
  }

  setDefaultComponent(comp) {
    this.defaultComp = comp;
  }

  getComponentLocation(comp) {
    const { comps } = this;

    for (let y = 0; y < comps.length; y++) {
      let xarr = comps[y];
      for (let x = 0; x < xarr.length; x++) {
        if (comps[y][x] === comp) {
          return [y, x];
        }
      }
    }
    return null;
  }

  checkComp(c) {
    if (c && c.current && c.current.focus &&
      (c.current.isFocusable === undefined ||
        c.current.isFocusable())) {
      return c;
    }
    return null;
  }

  _spatialEnabled = false;
  _lastX = {};

  enableSpatialNavigation() {
    this._spatialEnabled = true;
  }

  _findSpatialComp(fromRow, fromX, toRow) {
    const fromActive = fromRow.filter(c => this.checkComp(c));
    const toActive = toRow.filter(c => this.checkComp(c));
    if (toActive.length === 0) return null;
    const fromPos = (fromX + 0.5) / (fromActive.length || 1);
    let best = toActive[0];
    let bestDist = Infinity;
    for (let j = 0; j < toActive.length; j++) {
      const dist = Math.abs(fromPos - (j + 0.5) / toActive.length);
      if (dist < bestDist) { bestDist = dist; best = toActive[j]; }
    }
    return best;
  }

  moveFocus(dir, comp) {
    const that = this;
    const { comps } = this;
    const loc = this.getComponentLocation(comp);

    const checkRowForComp = row => {
      let comp = null;
      for (let x = 0; x < row.length && !comp; x++) {
        comp = that.checkComp(row[x]);
      }
      return comp;
    }

    if (loc) {
      let y = loc[0], x = loc[1];
      let row = comps[y];

      // Spatial navigation between primary (row 0) and secondary (last row)
      if (this._spatialEnabled && comps.length > 1) {
        const lastRow = comps.length - 1;
        if (dir === GamepadEnum.DOWN && y === 0) {
          const targetX = this._lastX[lastRow];
          const targetRow = comps[lastRow];
          const comp = (targetX !== undefined && this.checkComp(targetRow[targetX]))
            ? targetRow[targetX]
            : this._findSpatialComp(comps[0], x, targetRow);
          if (comp) { this._lastX[0] = x; return comp.current.focus(); }
        }
        if (dir === GamepadEnum.UP && y === lastRow) {
          const targetX = this._lastX[0];
          const targetRow = comps[0];
          const comp = (targetX !== undefined && this.checkComp(targetRow[targetX]))
            ? targetRow[targetX]
            : this._findSpatialComp(comps[lastRow], x, targetRow);
          if (comp) { this._lastX[lastRow] = x; return comp.current.focus(); }
        }
      }

      let comp = null;
      switch (dir) {
        case GamepadEnum.LEFT:
          x--;
          while (x >= 0 && !comp) {
            comp = this.checkComp(row[x]);
            x--;
          }
          break;
        case GamepadEnum.RIGHT:
          x++;
          while (x < row.length && !comp) {
            comp = this.checkComp(row[x]);
            x++;
          }
          break;
        case GamepadEnum.UP:
          y--;
          while (y >= 0 && !comp) {
            comp = checkRowForComp(comps[y]);
            y--;
          }
          break;
        case GamepadEnum.DOWN:
          y++;
          while (y < comps.length && !comp) {
            comp = checkRowForComp(comps[y]);
            y++;
          }
          break;
        default:
          if (this.unhandledCb) {
            this.unhandledCb(dir);
          }
          break;
      }
      if (comp) return comp.current.focus();
    }
    return false;
  }

  focus() {
    const { comps, defaultComp } = this;

    if (defaultComp && this.checkComp(defaultComp)) {
      return defaultComp.current.focus();
    }

    for (let y = 0; y < comps.length; y++) {
      let xarr = comps[y];
      for (let x = 0; x < xarr.length; x++) {
        let comp = comps[y][x];
        if (this.checkComp(comp)) {
          return comp.current.focus();
        }
      }
    }

    return false;
  }
}

export { FocusGrid };
