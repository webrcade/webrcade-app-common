import React from "react";
import { ImageButton } from "../../components/image-button";
import { Resources, TEXT_IDS } from "../../../resources"
import { Screen } from "../../components/screen"
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'

export class YesNoScreen extends Screen {
  constructor() {
    super();

    this.yesButtonRef = React.createRef();
    this.noButtonRef = React.createRef();

    this.focusGrid.setComponents([
      [this.yesButtonRef, this.noButtonRef]
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
    const { focusGrid, yesButtonRef, noButtonRef, screenContext, screenStyles } = this;
    const { header, message, prompt, onYes, onNo } = this.props.info;

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={styles['yesno-screen']}>
          <div className={styles['yesno-screen-inner'] + " " + screenStyles.screen}>
            <div className={styles['yesno-screen-heading']}>
              {header}
            </div>
            <div className={styles['yesno-screen-message']}>
              {message.split('\n').map(function (item, key) {
                const val = (item ? <span>{item}</span> : <span>&nbsp;</span>);
                return key < 10 ? (
                  <div className={styles['yesno-screen-message-line']} key={key}>{val}</div>
                ) : null;
              })}
            </div>
            <div className={styles['yesno-screen-prompt']}>
              {prompt}
            </div>
            <div className={styles['yesno-screen-buttons']}>
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
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

