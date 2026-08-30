import React, { Component, Fragment } from "react";

import { ImageButton } from '../image-button';
import { KeypadWhiteImage, PauseWhiteImage } from '../../../images';

import styles from './style.scss'

// Shared touch overlay (Pause, plus an optional Keypad/Keyboard button) --
// same shape Coleco/A5200/Jaguar each previously hand-copied into their
// own app-local touchoverlay/index.js. The show/hide of the whole overlay
// is driven by BasicAppWrapper's (or RetroAppWrapper's) touch/mouse/
// keyboard detection + SCREEN_CONTROLS handling, not by this component
// itself.
//
// showKeypad (default false) toggles whether the second button renders at
// all -- omit it entirely for apps with no on-screen keypad/virtual
// keyboard (see the GRP1 "no keypad" family in the control-mapping-audit
// doc). When true, onKeypadClick is called on click instead of the
// hardcoded emulator.showControllers(0) the original per-app copies used,
// so this one component can serve both the numeric-keypad family and the
// full-virtual-keyboard family without assuming which action "keypad"
// means.
export class TouchOverlay extends Component {
  constructor() {
    super();

    this.state = {
      initialShow: true
    }
  }

  render() {
    const { show, showKeypad, keypadImgSrc, onKeypadClick } = this.props;
    const { initialShow } = this.state;
    const { emulator } = window;

    if (!emulator || !show) return <></>;

    if (initialShow) {
      this.setState({ initialShow: false });
      setTimeout(() => {
        emulator.updateOnScreenControls(true);
      }, 0);
    }

    const app = emulator.app;

    const showPause = () => {
      if (!app.isShowOverlay() && emulator.pause(true)) {
        setTimeout(() => emulator.showPauseMenu(), 50);
      }
    }

    return (
      <Fragment>
        <div className={styles['touch-overlay']} id="touch-overlay">
          <div className={styles['touch-overlay-buttons']}>
            <div className={styles['touch-overlay-buttons-left']}></div>
            <div className={styles['touch-overlay-buttons-center']}></div>
            <div className={styles['touch-overlay-buttons-right']}>
              {showKeypad && (
                <ImageButton
                  className={styles['touch-overlay-button']}
                  imgSrc={keypadImgSrc || KeypadWhiteImage}
                  onClick={onKeypadClick}
                  onFocus={(e) => { e.target.blur() }}
                />
              )}
              <ImageButton
                className={styles['touch-overlay-button'] + (showKeypad ? "" : " " + styles['touch-overlay-button-last'])}
                onClick={showPause}
                imgSrc={PauseWhiteImage}
                onFocus={(e) => { e.target.blur() }}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
