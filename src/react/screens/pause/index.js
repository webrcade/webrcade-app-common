import React from "react";
import { ArrowBackWhiteImage, PlayArrowWhiteImage } from "../../../images";
import { ImageButton } from "../../components/image-button";
import { Resources, TEXT_IDS } from "../../../resources";
import { Screen } from '../../components/screen'
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'

export class PauseScreenButton extends ImageButton {
  render() {
    const {buttonRef, onHandlePad, ...other} = this.props;
    const { focusGrid } = this.context;

    return (
      <ImageButton
        ref={buttonRef}
        className={styles["pause-screen-image-button"]}
        onPad={e => {
          if (onHandlePad) onHandlePad(focusGrid, e);
        }}
        {...other}
      />
    );
  }
}

export class PauseScreen extends Screen {
  constructor() {
    super();

    this.pauseStyles = styles;
    this.exitButtonRef = React.createRef();
    this.resumeButtonRef = React.createRef();

    this.focusGrid.setComponents(this.getFocusGridComponents());
  }

  getFocusGridComponents() {
    return [[this.exitButtonRef, this.resumeButtonRef]];
  }

  focus() {
    const { resumeButtonRef } = this;

    if (this.gamepadNotifier.padCount > 0) {
      if (resumeButtonRef && resumeButtonRef.current) {
        resumeButtonRef.current.focus();
      }
    }
  }

  getAdditionalButtons() {
    return null;
  }

  render() {
    const { exitButtonRef, focusGrid, resumeButtonRef, screenContext,
      screenStyles } = this;
    const { appProps, exitCallback, isEditor } = this.props;

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
              <PauseScreenButton
                  className={styles["pause-screen-image-button"]}

                  imgSrc={ArrowBackWhiteImage}
                  buttonRef={exitButtonRef}
                  label={Resources.getText( isEditor ?
                    TEXT_IDS.RETURN_TO_EDITOR : TEXT_IDS.RETURN_TO_BROWSE)}
                   onHandlePad={(focusGrid, e) => focusGrid.moveFocus(e.type, exitButtonRef)}
                  onClick={() => {if (exitCallback) exitCallback()}}
                />
              <PauseScreenButton
                  className={styles["pause-screen-image-button"]}

                  imgSrc={PlayArrowWhiteImage}
                  buttonRef={this.resumeButtonRef}
                  label={Resources.getText(TEXT_IDS.RESUME)}
                  onHandlePad={(focusGrid, e) => focusGrid.moveFocus(e.type, resumeButtonRef)}
                  onClick={() => this.close()}
                />
                {this.getAdditionalButtons()}
              </div>
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

export class CustomPauseScreen extends PauseScreen {

  componentDidMount() {
    const { additionalButtonRefs } = this.props;
    const { focusGrid } = this;

    if (additionalButtonRefs) {
      const comps = this.getFocusGridComponents();
      comps[0].push(...additionalButtonRefs);
      focusGrid.setComponents(comps);
    }

    super.componentDidMount();
  }

  getAdditionalButtons() {
    const { additionalButtons } = this.props;
    return additionalButtons;
  }
}
