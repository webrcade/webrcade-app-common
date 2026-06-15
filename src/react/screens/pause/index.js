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
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
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

  getPrimaryContainerClassName() {
    return this.pauseStyles['pause-screen-inner-buttons-container'];
  }

  getSecondaryRow() {
    return null;
  }

  render() {
    const { exitOrSettingsButtonRef, focusGrid, resumeButtonRef, screenContext,
      screenStyles } = this;
    const { appProps, exitCallback, isEditor, isStandalone } = this.props;
    const { showSettingsScreen } = this.state;

    const buttons = [
      <div className={screenStyles['screen-transparency-dark']} />,
      <div className={styles['pause-screen']}>
        <div className={styles['pause-screen-inner'] + " " + screenStyles.screen}>
          <div className={styles['pause-screen-inner-info']}>
            <div className={styles['pause-screen-inner-info-title']}>{appProps.title}</div>
            <div className={styles['pause-screen-inner-info-app']}>{appProps.app}</div>
          </div>
          <div className={styles['pause-screen-inner-buttons']}>
            <div className={this.getPrimaryContainerClassName()}>
              {!isStandalone && (
                <PauseScreenButton
                  className={styles["pause-screen-image-button"]}
                  imgSrc={ArrowBackWhiteImage}
                  buttonRef={exitOrSettingsButtonRef}
                  label={Resources.getText(
                    isEditor ?
                      appProps.mt ? TEXT_IDS.EXIT : TEXT_IDS.RETURN_TO_EDITOR :
                      TEXT_IDS.RETURN_TO_BROWSE)}
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
            {this.getSecondaryRow()}
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

  constructor() {
    super();
    this._secBlurTimer = null;
    this.state = { ...this.state, secondaryFocused: false };
  }

  _onSecondaryFocus() {
    if (this._secBlurTimer) {
      clearTimeout(this._secBlurTimer);
      this._secBlurTimer = null;
    }
    if (!this.state.secondaryFocused) {
      this.setState({ secondaryFocused: true });
    }
  }

  _onSecondaryBlur() {
    this._secBlurTimer = setTimeout(() => {
      this._secBlurTimer = null;
      this.setState({ secondaryFocused: false });
    }, 0);
  }

  componentDidMount() {
    const { additionalButtonRefs, secondaryButtonRefs } = this.props;
    const { focusGrid } = this;

    const comps = this.getFocusGridComponents();
    if (additionalButtonRefs) {
      comps[0] = [comps[0][0], ...additionalButtonRefs, comps[0][1]];
    }
    if (secondaryButtonRefs && secondaryButtonRefs.length > 0) {
      comps.push(secondaryButtonRefs);
      focusGrid.enableSpatialNavigation();
    }
    focusGrid.setComponents(comps);

    super.componentDidMount();
  }

  getAdditionalButtons() {
    const { additionalButtons } = this.props;
    return additionalButtons;
  }

  getSecondaryButtons() {
    const { secondaryButtons } = this.props;
    return secondaryButtons && secondaryButtons.length > 0 ? secondaryButtons : null;
  }

  getPrimaryContainerClassName() {
    const { secondaryFocused } = this.state;
    return (
      styles['pause-screen-inner-buttons-container'] +
      (secondaryFocused ? ' ' + styles['pause-screen-inner-buttons-container--dim'] : '')
    );
  }

  getSecondaryRow() {
    const secondaryButtons = this.getSecondaryButtons();
    if (!secondaryButtons) return null;
    return (
      <div
        className={styles['pause-screen-inner-buttons-container'] + ' ' + styles['pause-screen-inner-buttons-secondary']}
        onFocus={() => this._onSecondaryFocus()}
        onBlur={() => this._onSecondaryBlur()}
      >
        {secondaryButtons.map((btn, i) =>
          React.cloneElement(btn, { key: i, className: styles['pause-screen-secondary-image-button'] })
        )}
      </div>
    );
  }
}
