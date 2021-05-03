import React, { Component } from "react";
import { ImageButton } from "../../components/image-button";
import { FocusGrid, GamepadNotifier } from "../../../input"
import { WebrcadeContext } from "../../context/webrcadecontext.js"
import { Resources, TEXT_IDS } from "../../../resources"

import styles from './style.scss'

export class ErrorScreen extends Component {
  constructor() {
    super();

    this.okButtonRef = React.createRef();

    this.focusGrid.setComponents([
      [this.okButtonRef],
    ]);
  }

  focusGrid = new FocusGrid();
  gamepadNotifier = new GamepadNotifier();
  screenContext = {gamepadNotifier: this.gamepadNotifier};

  formatMessage(message) {
    return (
      message.split("\n").map((item) => {
        return item + "<br/>";
      })
    );
  }

  gamepadCallback = e => {
    const { focusGrid } = this;
    focusGrid.focus();
    return true;
  }

  componentDidMount() {
    const { gamepadNotifier, focusGrid } = this;

    gamepadNotifier.start();
    gamepadNotifier.setDefaultCallback(this.gamepadCallback);

    focusGrid.focus();
  }

  componentWillUnmount() {
    const { gamepadNotifier } = this;

    gamepadNotifier.stop();
    gamepadNotifier.setDefaultCallback(null);
  }

  render() {
    const { okButtonRef, screenContext } = this;
    const { onClose } = this.props;
    let { message } = this.props;

    if (message.message) {
      message = message.message;
    }
    if (!message) {
      message = Resources.getText(TEXT_IDS.ERROR_UNKNOWN);
    }

    const msg = message + "\n" + Resources.getText(TEXT_IDS.SEE_CONSOLE_LOG);

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={styles['error-screen']}>
          <div className={styles['error-screen-inner']}>
            <div className={styles['error-screen-heading']}>
              {Resources.getText(TEXT_IDS.SOMETHING_WENT_WRONG)}
            </div>
            <div className={styles['error-screen-message']}>
              {msg.split('\n').map(function (item, key) {
                return key < 5 ? (
                  <div key={key}>{item}</div>
                ) : null;
              })}
            </div>
            <div className={styles['error-screen-buttons']}>
              <ImageButton
                ref={okButtonRef}
                label={Resources.getText(TEXT_IDS.OK)}
                onClick={() => {if (onClose) onClose();}}
              />
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

