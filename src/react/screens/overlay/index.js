import React from "react";
import { isTouchSupported } from "../../../util/browser";
import { Resources, TEXT_IDS } from "../../../resources";
import { Screen } from '../../components/screen'
import { VolumeOffBlack } from "../../../images/index.js"
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'

export class OverlayScreen extends Screen {
  constructor() {
    super();

    this.unmuteTextTimeoutId = null;
    this.state = {
      hideUnmuteText: false
    };
  }

  componentDidMount() {
    this.unmuteTextTimeoutId = setTimeout(() => {
      this.unmuteTextTimeoutId = null;
      this.setState({hideUnmuteText: true});
    }, 5000);
  }

  componentWillUnmount() {
    const { unmuteTextTimeoutId } = this;

    if (unmuteTextTimeoutId) {
      clearTimeout(unmuteTextTimeoutId);
    }
  }

  render() {
    const { screenContext, screenStyles, } = this;
    const { hideUnmuteText } = this.state;

    const buttonPrefix = "overlay-screen-inner-unmute-button";

    const tapText = Resources.getText(
      isTouchSupported() ? TEXT_IDS.TAP_TO_UNMUTE : TEXT_IDS.CLICK_TO_UNMUTE);

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={styles['overlay-screen']}>
          <div className={styles['overlay-screen-inner'] + " " + screenStyles.screen}>
            <div className={styles['overlay-screen-inner-unmute']}>
              <button
                tabIndex="-1"
                className={styles[buttonPrefix]}>
                <img className={styles[buttonPrefix + '-img']} alt={tapText} src={VolumeOffBlack}></img>
                <div className={styles[buttonPrefix + '-label'] + " " + (hideUnmuteText ? styles[buttonPrefix + '-label--hide'] : "")}>
                  <div className={styles[buttonPrefix + '-label-inner']}>{tapText}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

