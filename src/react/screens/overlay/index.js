import React from "react";
import { Screen } from '../../components/screen'
import { WebrcadeContext } from "../../context/webrcadecontext.js"
import { VolumeOffBlack } from "../../../images/index.js"
import { Resources, TEXT_IDS } from "../../../resources";

import styles from './style.scss'

export class OverlayScreen extends Screen {
  constructor() {
    super();

    this.state = {
      hideUnmuteText: false
    };
  }

  componentDidMount() {
    setTimeout(() => { this.setState({hideUnmuteText: true}); }, 5000);
  }

  render() {
    const {
      screenContext,
      screenStyles,
    } = this;
    const {
      hideUnmuteText
    } = this.state;

    const buttonPrefix = "overlay-screen-inner-unmute-button";

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={styles['overlay-screen']}>
          <div className={styles['overlay-screen-inner'] + " " + screenStyles.screen}>
            <div className={styles['overlay-screen-inner-unmute']}>
              <button
                tabIndex="-1"
                className={styles[buttonPrefix]}>
                <img className={styles[buttonPrefix + '-img']} alt={Resources.getText(TEXT_IDS.TAP_TO_UNMUTE)} src={VolumeOffBlack}></img>
                <div className={styles[buttonPrefix + '-label'] + " " + (hideUnmuteText ? styles[buttonPrefix + '-label--hide'] : "")}>
                  <div className={styles[buttonPrefix + '-label-inner']}>{Resources.getText(TEXT_IDS.TAP_TO_UNMUTE)}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

