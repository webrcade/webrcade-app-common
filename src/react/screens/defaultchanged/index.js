import React from "react";
import { ImageButton } from "../../components/image-button";
import { Resources, TEXT_IDS } from "../../../resources"
import { Screen } from "../../components/screen"
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'

export class DefaultChangedScreen extends Screen {
  constructor() {
    super();

    this.yesButtonRef = React.createRef();
    this.noButtonRef = React.createRef();
    this.dontAskAgainRef = React.createRef();

    this.focusGrid.setComponents([
      [this.yesButtonRef, this.noButtonRef, this.dontAskAgainRef]
    ]);

    this.state = {};
  }

  focus() {
    const { noButtonRef } = this;
    if (noButtonRef && noButtonRef.current) {
      noButtonRef.current.focus();
    }
  }

  render() {
    const { focusGrid, yesButtonRef, noButtonRef, dontAskAgainRef, screenContext, screenStyles } = this;
    const { onYes, onNo, onDontAskAgain, applicationType, shortApplicationType, oldDefault, newDefault } = this.props.info;

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={styles['default-changed-screen']}>
          <div className={styles['default-changed-screen-inner'] + " " + screenStyles.screen}>

            {/* Heading */}
            <div className={styles['default-changed-screen-heading']}>
              Default Application Changed
            </div>

            {/* Message */}
            <div className={styles['default-changed-screen-message']}>
              The default <span className={styles['highlight']}>{applicationType} application</span> has changed from <span className={styles['highlight']}>{oldDefault}</span> to <span className={styles['highlight']}>{newDefault}</span>.
            </div>
            <div className={styles['default-changed-screen-message-save']}>
              You have existing save data for <span className={styles['highlight']}>{oldDefault}</span>.
            </div>
            {/* Prompt */}
            <div className={styles['default-changed-screen-prompt']}>
              Do you want to <span className={styles['highlight']}>change your default {shortApplicationType} application to {oldDefault}</span> and continue using your existing save data?
            </div>

            {/* Buttons */}
            <div className={styles['default-changed-screen-buttons']}>
              <ImageButton
                ref={yesButtonRef}
                label={Resources.getText(TEXT_IDS.YES)}
                onPad={e => focusGrid.moveFocus(e.type, yesButtonRef)}
                onClick={() => { if (onYes) onYes(this) }}
              />
              <ImageButton
                ref={noButtonRef}
                label={Resources.getText(TEXT_IDS.NO)}
                onPad={e => focusGrid.moveFocus(e.type, noButtonRef)}
                onClick={() => { if (onNo) onNo(this) }}
              />
              <ImageButton
                ref={dontAskAgainRef}
                label={Resources.getText(TEXT_IDS.DONT_ASK_AGAIN)}
                onPad={e => focusGrid.moveFocus(e.type, dontAskAgainRef)}
                onClick={() => { if (onDontAskAgain) onDontAskAgain(this) }}
              />
            </div>

          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}
