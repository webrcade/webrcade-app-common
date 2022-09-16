import React from "react";
import { ArrowBackWhiteImage, PlayArrowWhiteImage, SettingsWhiteImage } from "../../../images";
import { ImageButton } from "../../components/image-button";
import { Resources, TEXT_IDS } from "../../../resources";
import { Screen } from '../../components/screen'
import { SettingsEditor } from "../settings";
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'
import { isParentSameOrigin } from "../../../util";

export class PauseScreenButton extends ImageButton {
  render() {
    const { buttonRef, onHandlePad, ...other } = this.props;
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
    this.exitOrSettingsButtonRef = React.createRef();
    this.settingsButtonRef = React.createRef();
    this.resumeButtonRef = React.createRef();

    this.focusGrid.setComponents(this.getFocusGridComponents());

    this.state = {
      showSettingsScreen: false
    }
  }

  getFocusGridComponents() {
    return [[this.exitOrSettingsButtonRef, this.resumeButtonRef]];
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
    const { exitOrSettingsButtonRef, focusGrid, resumeButtonRef, screenContext,
      screenStyles } = this;
    const { appProps, exitCallback, isEditor, isStandalone } = this.props;
    const { showSettingsScreen } = this.state;

    const buttons = [
      <div className={screenStyles['screen-transparency']} />,
      <div className={styles['pause-screen']}>
        <div className={styles['pause-screen-inner'] + " " + screenStyles.screen}>
          <div className={styles['pause-screen-inner-info']}>
            <div className={styles['pause-screen-inner-info-title']}>{appProps.title}</div>
            <div className={styles['pause-screen-inner-info-app']}>{appProps.app}</div>
          </div>
          <div className={styles['pause-screen-inner-buttons']}>
            <div className={styles['pause-screen-inner-buttons-container']}>
              {!isStandalone && (
                <PauseScreenButton
                  className={styles["pause-screen-image-button"]}
                  imgSrc={ArrowBackWhiteImage}
                  buttonRef={exitOrSettingsButtonRef}
                  label={Resources.getText(isEditor ?
                    TEXT_IDS.RETURN_TO_EDITOR : TEXT_IDS.RETURN_TO_BROWSE)}
                  onHandlePad={(focusGrid, e) => focusGrid.moveFocus(e.type, exitOrSettingsButtonRef)}
                  onClick={() => { if (exitCallback) exitCallback() }}
                />
              )}
              {(isStandalone && isParentSameOrigin() && !window.parent._inIframe) && (
                <PauseScreenButton
                  imgSrc={SettingsWhiteImage}
                  buttonRef={exitOrSettingsButtonRef}
                  label={Resources.getText(TEXT_IDS.SETTINGS)}
                  onHandlePad={(focusGrid, e) =>
                    focusGrid.moveFocus(e.type, exitOrSettingsButtonRef)
                  }
                  onClick={() => {
                    this.setState({ showSettingsScreen: true });
                  }}
                />
              )}
              {this.getAdditionalButtons()}
              <PauseScreenButton
                className={styles["pause-screen-image-button"]}
                imgSrc={PlayArrowWhiteImage}
                buttonRef={this.resumeButtonRef}
                label={Resources.getText(TEXT_IDS.RESUME)}
                onHandlePad={(focusGrid, e) => focusGrid.moveFocus(e.type, resumeButtonRef)}
                onClick={() => this.close()}
              />
            </div>
          </div>
        </div>
      </div>
    ];

    const settingsEditor = (
      <SettingsEditor
        isStandalone={isStandalone}
        onClose={() => this.close()}
      />
    );

    return (
      (!showSettingsScreen ? (
        <WebrcadeContext.Provider value={screenContext}>
            {buttons}
        </WebrcadeContext.Provider>
      ) : settingsEditor)
    );
  }
}

export class CustomPauseScreen extends PauseScreen {

  componentDidMount() {
    const { additionalButtonRefs } = this.props;
    const { focusGrid } = this;

    if (additionalButtonRefs) {
      const comps = this.getFocusGridComponents();
      comps[0] = [comps[0][0], ...additionalButtonRefs, comps[0][1]];
      focusGrid.setComponents(comps);
    }

    super.componentDidMount();
  }

  getAdditionalButtons() {
    const { additionalButtons } = this.props;
    return additionalButtons;
  }
}
