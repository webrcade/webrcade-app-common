import React from "react";
import { Screen } from '../../components/screen'
import { ImageButton } from "../../components/image-button";
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'
import appStyles from '../../components/app/style.scss'

export class PauseScreen extends Screen {
  constructor() {
    super();

    this.exitButtonRef = React.createRef();
    this.resumeButtonRef = React.createRef();

    this.focusGrid.setComponents([
      [this.exitButtonRef, this.resumeButtonRef]
    ]);
  }


  focus() {
    const { resumeButtonRef } = this;
    resumeButtonRef.current.focus();
  }

  render() {
    const {
      screenContext,
      screenStyles,
      exitButtonRef,
      resumeButtonRef,
      focusGrid
    } = this;
    const {
      appProps,
      exitCallback
    } = this.props;

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={screenStyles['screen-transparency']} />
        <div className={styles['pause-screen']}>
          <div className={styles['pause-screen-inner'] + " " + screenStyles.screen}>
            <div className={styles['pause-screen-inner-info']}>
              <div className={styles['pause-screen-inner-info-title']}>{appProps.title}</div>
              <div className={styles['pause-screen-inner-info-app']}>{appProps.app}</div>
            </div>
            <div className={styles['pause-screen-inner-buttons']}>
              <div className={styles['pause-screen-inner-buttons-container']}>
                <ImageButton
                  ref={exitButtonRef}
                  label="Exit" /*{Resources.getText(TEXT_IDS.OK)}*/
                  onPad={e => focusGrid.moveFocus(e.type, exitButtonRef)}
                  onClick={() => {if (exitCallback) exitCallback()}}
                />
                <ImageButton
                  ref={this.resumeButtonRef}
                  label="Resume" /*{Resources.getText(TEXT_IDS.OK)}*/
                  onPad={e => focusGrid.moveFocus(e.type, resumeButtonRef)}
                  onClick={() => this.close()}
                />
              </div>
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

