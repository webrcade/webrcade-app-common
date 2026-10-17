import React, { Component } from "react";

import styles from './style.scss'

// Stick magnitude past which the ring shows/stays up; below it, cancels.
// Single threshold, no hysteresis -- same convention gamepadnotifier.js
// already uses for its own digital-from-analog UP/DOWN/LEFT/RIGHT.
const SHOW_THRESHOLD = 0.5;

// .radial-keypad-ring's own width/height in style.scss -- 1rem is
// viewport-WIDTH-relative app-wide (html{font-size:1vw}), which knows
// nothing about height, so this ring can outgrow the actual viewport on
// an extreme aspect ratio (very wide-but-short, or narrow-but-tall).
// Used by updateScale() to compute how far over the smaller viewport
// dimension the ring's natural rem size actually is.
const RING_REM = 32;
// Leaves a small margin so the ring doesn't touch the viewport's edges
// exactly at the cap.
const SCALE_MARGIN = 0.9;

// Generic stick-driven radial/pie-menu keypad selector, originally built
// for the Jaguar app and moved here so other numpad-style consoles
// (5200, Coleco, etc.) can reuse it -- the ring geometry, aim/press
// state machine, and rendering are identical regardless of which
// console it's for, only the key set and how a key maps to whatever the
// emulator expects differ, so those are props rather than baked in.
//
// Props:
//   keys        - array of key label strings, clockwise from 12 o'clock.
//   keyToValue  - object map, key label -> the emulator property NAME
//                 (string) holding the packed value for that key, e.g.
//                 {"1": "KEYPAD_1", ...}. Looked up as
//                 emulator[keyToValue[key]] at confirm time.
//   descriptions - object map, key label -> human-readable description
//                 shown in the center circle while aimed at that key.
//   emulator    - must expose onKeypad(controller, value), matching the
//                 grid keypad screen's own onKeypad() convention.
//
// Per-app wiring this does NOT include (stays in each app for now, see
// [[project_jaguar_port_todo]] for the fuller discussion of what could
// also move to common later): the per-frame Emulator.sendInput() call
// site, the App.js ref-forwarding methods, and any app-specific
// button-masking while a selection is active.
export class RadialKeypad extends Component {
  constructor(props) {
    super(props);

    const { keys } = props;
    this.keys = keys;
    this.segmentAngle = 360 / keys.length;

    this.rootRef = React.createRef();
    this.scaleWrapperRef = React.createRef();
    this.wedgeRef = React.createRef();
    this.dotRef = React.createRef();
    this.playerRef = React.createRef();
    this.descriptionRef = React.createRef();
    this.segmentRefs = keys.map(() => React.createRef());

    // Plain instance fields, not React state -- this is written from
    // Emulator.sendInput()'s per-frame call (see App.js's
    // updateRadialStick()), so it needs direct DOM writes rather than
    // setState/render on every frame.
    this.activeController = null;
    this.highlightedIndex = -1;
    // Separate from highlightedIndex -- highlightedIndex tracks live aim
    // (follows the stick, always), pressedIndex is fixed at whichever
    // segment was actually confirmed, until the confirm button releases.
    // They can diverge if the stick moves while still holding the
    // button; the fixed one is what's actually being sent to the game
    // (see getKeypadValue()'s hold tracking in the app's emulator), so
    // it shouldn't visually jump to wherever the aim currently is.
    this.pressedIndex = -1;
    this.prevConfirm = [false, false];
  }

  componentDidMount() {
    this.onResize = () => this.updateScale();
    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  // Sets --radial-keypad-scale (see style.scss's .radial-keypad-scale-
  // wrapper, which the ring and dot are both scaled by) to whatever
  // factor keeps the ring's natural rem-based size from exceeding the
  // smaller of the viewport's two dimensions. min(1, ...) so it only
  // ever scales down, never up past natural size. Recomputed on resize
  // and once whenever the ring shows (root font-size and viewport
  // dimensions can both change between one showing and the next).
  updateScale() {
    if (!this.scaleWrapperRef.current) return;

    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const ringPx = RING_REM * rootPx;
    const available = Math.min(window.innerWidth, window.innerHeight) * SCALE_MARGIN;
    const scale = Math.min(1, available / ringPx);

    this.scaleWrapperRef.current.style.setProperty('--radial-keypad-scale', scale);
  }

  // Called once per frame per controller (index 0/1) from the app's own
  // per-frame hook -- never runs while paused, since that stops the
  // frame loop this is ultimately driven by. x/y are the raw right-
  // stick axes (-1..1).
  updateStick(controller, x, y, confirmDown) {
    const { activeController } = this;
    const prevConfirm = this.prevConfirm[controller];
    this.prevConfirm[controller] = confirmDown;

    const magnitude = Math.sqrt(x * x + y * y);

    if (activeController === null) {
      if (magnitude > SHOW_THRESHOLD) {
        this.activeController = controller;
        this.show(controller);
        this.updateAngle(x, y);
      }
      return;
    }

    // Another controller already owns the ring -- ignore this one until
    // the owner confirms or cancels.
    if (activeController !== controller) {
      return;
    }

    if (magnitude <= SHOW_THRESHOLD) {
      this.hide();
      return;
    }

    this.updateAngle(x, y);

    if (confirmDown && !prevConfirm) {
      this.setPressed(true);
      this.confirm();
    } else if (!confirmDown && prevConfirm) {
      this.setPressed(false);
    }
  }

  show(controller) {
    if (this.rootRef.current) {
      this.rootRef.current.classList.add(styles['radial-keypad-visible']);
    }
    if (this.playerRef.current) {
      this.playerRef.current.textContent = `Player ${controller + 1}`;
    }
    this.updateScale();
  }

  // Recentering the stick is the only thing that closes the ring --
  // confirming (LB/RB) does not, since the stick is typically still
  // deflected right after a confirm and closing/reopening on the same
  // frame caused a visible flicker/jump in the center text.
  hide() {
    if (this.rootRef.current) {
      this.rootRef.current.classList.remove(styles['radial-keypad-visible']);
    }
    this.activeController = null;
    this.setPressed(false);
    this.setHighlighted(-1);
  }

  // Only the wedge fill indicates "pressed" -- the pill itself keeps
  // whatever setHighlighted() already gave it (red while aimed at, dark
  // otherwise), unchanged by press state.
  setPressed(pressed) {
    const { wedgeRef } = this;

    if (!pressed) {
      this.pressedIndex = -1;
      if (wedgeRef.current) {
        wedgeRef.current.style.background = "";
      }
      return;
    }

    this.pressedIndex = this.highlightedIndex;
    if (wedgeRef.current) {
      wedgeRef.current.style.background = this.pressedIndex >= 0
        ? this.getWedgeGradient(this.pressedIndex)
        : "";
    }
  }

  // A conic-gradient wedge spanning just the pressed segment's angular
  // range, gray -- everything else transparent. `from -HALFdeg` shifts
  // the gradient's own 0deg reference back by half a segment, so every
  // segment's [start, end] stop pair lands on plain non-negative,
  // increasing degree values (index*segmentAngle to
  // (index+1)*segmentAngle) instead of needing to wrap around 0/360 for
  // the segment straddling the top (index 0). The wedge element itself
  // is masked down to just the ring band (see style.scss), so this
  // doesn't need to worry about staying out of the center circle.
  //
  // FEATHER softens both color-stop transitions instead of an instant
  // cut, which otherwise rendered as a visibly jagged/pixelated edge
  // along each straight radial boundary. No explicit 0deg/360deg
  // bookend stops are needed -- conic-gradient already extends a
  // gradient's first/last stop color backward/forward to fill the rest
  // of the circle, and omitting them avoids a monotonic-ordering
  // conflict for index 0, whose feathered start lands just below 0deg.
  getWedgeGradient(index) {
    const FEATHER = 0.5;
    const { segmentAngle } = this;
    const start = index * segmentAngle;
    const end = start + segmentAngle;
    const color = "#c8c8c8";
    return `conic-gradient(from -${segmentAngle / 2}deg, transparent ${start - FEATHER}deg, ${color} ${start + FEATHER}deg, ${color} ${end - FEATHER}deg, transparent ${end + FEATHER}deg)`;
  }

  updateAngle(x, y) {
    const { keys, segmentAngle } = this;
    const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;

    if (this.dotRef.current) {
      this.dotRef.current.style.transform = `rotate(${angle}deg)`;
    }

    const index = Math.round(angle / segmentAngle) % keys.length;
    if (index !== this.highlightedIndex) {
      this.setHighlighted(index);
    }
  }

  setHighlighted(index) {
    const { segmentRefs, highlightedIndex, keys } = this;

    if (highlightedIndex >= 0 && segmentRefs[highlightedIndex].current) {
      segmentRefs[highlightedIndex].current.classList.remove(styles['radial-keypad-segment-highlighted']);
    }
    if (index >= 0 && segmentRefs[index] && segmentRefs[index].current) {
      segmentRefs[index].current.classList.add(styles['radial-keypad-segment-highlighted']);
    }
    this.highlightedIndex = index;

    if (this.descriptionRef.current) {
      const { descriptions } = this.props;
      const key = index >= 0 ? keys[index] : null;
      this.descriptionRef.current.textContent =
        key === null ? "" : ((descriptions && descriptions[key]) || key);
    }
  }

  // Fires once per press (see updateStick()'s rising-edge check) -- the
  // continued hold-to-repeat behavior is expected to live entirely on
  // the app's emulator side (see getKeypadValue()/virtualKeypadDown in
  // the Jaguar app for the reference implementation), which keeps
  // resending this same value for as long as the confirm button stays
  // down, matching how the grid keypad screen's own selection holds.
  confirm() {
    const { emulator, keyToValue } = this.props;
    const { activeController, highlightedIndex, keys } = this;
    const key = highlightedIndex >= 0 ? keys[highlightedIndex] : null;

    if (emulator && key !== null) {
      emulator.onKeypad(activeController, emulator[keyToValue[key]]);
    }
  }

  render() {
    const { keys, segmentAngle } = this;

    return (
      <div className={styles['radial-keypad']} ref={this.rootRef}>
        {/* Scales the ring and dot together (as one unit, via
            --radial-keypad-scale -- see updateScale()) so the ring
            never outgrows the actual viewport on an extreme aspect
            ratio. One level up from both rather than on
            .radial-keypad-ring directly, since the dot is a sibling of
            the ring (not a descendant -- see the comment further down),
            and its rotation is written as an inline style each frame,
            which would silently replace rather than combine with a
            scale set directly on that same element. */}
        <div className={styles['radial-keypad-scale-wrapper']} ref={this.scaleWrapperRef}>
        <div className={styles['radial-keypad-ring']}>
          <div className={styles['radial-keypad-wedge']} ref={this.wedgeRef} />
          {keys.map((key, i) => {
            const angle = i * segmentAngle;
            return (
              <div
                className={styles['radial-keypad-divider']}
                key={"divider-" + i}
                style={{ transform: `rotate(${angle - (segmentAngle / 2)}deg)` }}
              />
            );
          })}
          {keys.map((key, i) => {
            const angle = i * segmentAngle;
            return (
              <div
                className={styles['radial-keypad-segment-pos']}
                key={key}
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className={styles['radial-keypad-segment']}
                  ref={this.segmentRefs[i]}
                  style={{ transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}
                >
                  {key}
                </div>
              </div>
            );
          })}
          <div className={styles['radial-keypad-center']}>
            <div className={styles['radial-keypad-center-player']} ref={this.playerRef}>Player 1</div>
            <div className={styles['radial-keypad-center-description']} ref={this.descriptionRef}></div>
          </div>
        </div>
        {/* Sibling of .radial-keypad-ring, not a child -- the dot rides
            exactly on the ring's edge (half in/half out), which the
            ring's own overflow: hidden would otherwise clip. Positioned
            the same way (top/left 50% of a 0x0 box) relative to this
            wrapper instead, which stays centered on the same point since
            the ring itself is centered within it via flexbox. */}
        <div className={styles['radial-keypad-dot-pos']} ref={this.dotRef}>
          <div className={styles['radial-keypad-dot']} />
        </div>
        </div>
      </div>
    );
  }
}
