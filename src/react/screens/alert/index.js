import React from "react";
import { ImageButton } from "../../components/image-button";
import { Resources, TEXT_IDS } from "../../../resources"
import { Screen } from "../../components/screen"
import { WebrcadeContext } from "../../context/webrcadecontext.js"

import styles from './style.scss'

export class AlertScreen extends Screen {
  constructor() {
    super();

    this.okButtonRef = React.createRef();

    this.focusGrid.setComponents([
      [this.okButtonRef],
    ]);
  }

  render() {
    const { okButtonRef, screenContext, screenStyles } = this;
    const { message, showButtons } = this.props;
    const buttonStyle = !showButtons ? {display: 'none'} : null;

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={styles['alert-screen'] }>
          <div className={styles['alert-screen-inner'] + " " + screenStyles.screen}>
            <div className={styles['alert-screen-message']}>{message}</div>
            <div className={styles['error-screen-buttons']} style={buttonStyle}>
              <ImageButton
                ref={okButtonRef}
                label={Resources.getText(TEXT_IDS.OK)}
                onClick={() => this.close()}
              />
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}
