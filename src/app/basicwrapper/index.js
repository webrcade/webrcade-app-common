import { AppWrapper } from '../wrapper';
import { SCREEN_CONTROLS } from '../prefs';

// A thin, purely-additive extension of AppWrapper for the plain
// (non-RetroAppWrapper) apps -- adds the shared touch/mouse/keyboard
// interaction-detection + on-screen touch overlay support that Coleco,
// A5200, and Jaguar each previously hand-copied into their own
// emulator/index.js. Deliberately its own class rather than added
// directly to AppWrapper: RetroAppWrapper also extends AppWrapper and
// defines its own onFrame() (called every frame from its main loop,
// webrcade-app-common/src/app/retrowrapper/index.js), which would
// permanently shadow anything added to AppWrapper's own onFrame() for
// every RetroAppWrapper-based app -- but putting it here instead means
// nothing outside the apps that explicitly opt in (by extending this
// class instead of AppWrapper) is touched at all.
//
// None of this fires on its own -- AppWrapper has no built-in per-frame
// loop, so a subclass must still call this.onFrame() once per frame from
// wherever its own loop already lives (same as every app that's used this
// pattern so far), and must still override createTouchListener() to `{}`
// to disable the inherited tap-anywhere-pauses default.
export class BasicAppWrapper extends AppWrapper {

  // Drives the upper-right touch overlay (keypad/pause icons) -- latch
  // the first time each interaction type is observed, and react via
  // checkOnScreenControls(). See onFrame() for where the listeners
  // actually get attached.
  firstFrame = true;
  touchEvent = false;
  mouseEvent = false;
  keyboardEvent = false;

  // Attaches the touch/mouse/keyboard interaction listeners once, on the
  // real first frame, and flips on the touch overlay's gating state
  // (App.js's showCanvas()) so it can't render before the emulator
  // actually exists. Call once per frame from the subclass's own loop.
  onFrame() {
    if (!this.firstFrame) return;
    this.firstFrame = false;

    this.app.showCanvas();

    setTimeout(() => {
      const onTouch = () => { this.onTouchEvent() };
      window.addEventListener("touchstart", onTouch);
      window.addEventListener("touchend", onTouch);
      window.addEventListener("touchcancel", onTouch);
      window.addEventListener("touchmove", onTouch);

      const onMouse = () => { this.onMouseEvent() };
      window.addEventListener("mousedown", onMouse);
      window.addEventListener("mouseup", onMouse);
      window.addEventListener("mousemove", onMouse);

      document.onkeydown = (e) => {
        if (this.paused) return;
        this.onKeyboardEvent(e);
      };
    }, 0);
  }

  onTouchEvent() {
    if (!this.touchEvent) {
      this.touchEvent = true;
      this.checkOnScreenControls();
    }
  }

  onMouseEvent() {
    if (!this.mouseEvent) {
      this.mouseEvent = true;
      this.checkOnScreenControls();
    }
  }

  onKeyboardEvent(e) {
    if (e.code && !this.keyboardEvent) {
      this.keyboardEvent = true;
      this.checkOnScreenControls();
    }
  }

  showTouchOverlay(show) {
    const to = document.getElementById("touch-overlay");
    if (to) {
      to.style.display = show ? 'block' : 'none';
    }
  }

  // Reacts immediately to a just-detected interaction (see
  // onTouchEvent()/onMouseEvent()/onKeyboardEvent() above) -- only SC_AUTO
  // needs to do anything here, since SC_ON/SC_OFF are already handled
  // unconditionally by updateOnScreenControls() at startup and whenever
  // the Settings preference itself changes.
  checkOnScreenControls() {
    const controls = this.prefs.getScreenControls();
    if (controls === SCREEN_CONTROLS.SC_AUTO) {
      setTimeout(() => {
        this.showTouchOverlay(true);
        this.app.forceRefresh();
      }, 0);
    }
  }

  // Broader lifecycle hook -- call once at real startup with initial=true,
  // and again whenever the Settings screen's "Screen Controls" preference
  // changes. Unlike checkOnScreenControls(), this has to explicitly handle
  // all three preference values, and skips SC_AUTO entirely on the
  // initial call so the overlay doesn't flash before any real interaction
  // has happened yet.
  updateOnScreenControls(initial = false) {
    const controls = this.prefs.getScreenControls();
    if (controls === SCREEN_CONTROLS.SC_OFF) {
      this.showTouchOverlay(false);
    } else if (controls === SCREEN_CONTROLS.SC_ON) {
      this.showTouchOverlay(true);
    } else if (controls === SCREEN_CONTROLS.SC_AUTO) {
      if (!initial) {
        setTimeout(() => {
          this.showTouchOverlay(this.touchEvent || this.mouseEvent);
          this.app.forceRefresh();
        }, 0);
      }
    }
  }

  // Base class default pauses on any tap anywhere on screen -- redundant
  // (and disruptive) once a dedicated Pause button exists in the touch
  // overlay. Subclasses using this wrapper are expected to override this
  // to `{}` themselves (kept as the inherited default here, not forced,
  // so a subclass that hasn't added the overlay yet still gets the old
  // tap-to-pause behavior rather than silently losing touch-pause access).
}
