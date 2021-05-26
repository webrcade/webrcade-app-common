import React, { Component } from "react";
import { UrlUtil } from '../../../util';
import { AppProps } from '../../../app';
import { isDev } from '../../../dev'
import { ErrorScreen } from "../../screens/error";
import { PauseScreen } from "../../screens/pause";
import { OverlayScreen } from "../../screens/overlay"
import { Resources, TEXT_IDS } from "../../../resources";

import styles from './style.scss'

export class WebrcadeApp extends Component {
  constructor() {
    super();

    this.state = {
      mode: this.ModeEnum.LOADING,
      loadingPercent: null,
      errorMessage: null,
      showOverlay: false
    };

    this.exited = false;

    // Add to window to allow for access from menu
    window.app = this;
  }

  ModeEnum = {
    LOADING: "loading",
    LOADED: "loaded",
    ERROR: "error",
    PAUSE: "pause"
  }

  messageListener = (e) => {
    if (e.data === 'exit') {
      this.exit(null, false)
        .catch((e) => console.error(e)) // TODO: Proper error handling
        .finally(() => {
          setTimeout(() => {
            e.source.postMessage("exitComplete", "*");
          }, 0)
        });
    }
  }

  componentDidMount() {
    window.addEventListener("message", this.messageListener);

    // Avoid the white flash
    if (!isDev()) {
      try {
        window.frameElement.style.display = 'block';
      } catch(e) {
        console.log('error attempting to make application visible: ' + e)
      }
    }

    const url = window.location.search;
    console.log(url);

    // Get props
    const propsEncoded = UrlUtil.getParam(
      url, AppProps.RP_PROPS);
    if (propsEncoded) {
      this.appProps = AppProps.decode(propsEncoded);
      this.type = this.appProps.type;
    } else {
      this.appProps = {};
    }

    // Set debug flag
    this.debug = UrlUtil.getBoolParam(url, AppProps.RP_DEBUG);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.messageListener);
  }

  getAppType() {
    return this.type;
  }

  getStoragePath(postfix) {
    return `/wrc/${this.getAppType()}/${postfix}`;
  }

  renderLoading() {
    const { loadingPercent } = this.state;
    return (
      <div>
        <div className={styles.loading}>{Resources.getText(TEXT_IDS.LOADING)}...</div>
        {loadingPercent !== null ?
          <div className={styles['loading-percent']}>{loadingPercent}%</div> : null}
      </div>
    );
  }

  renderErrorScreen() {
    const { errorMessage, errorCloseCallback } = this.state;

    return (
       <ErrorScreen message={errorMessage} closeCallback={errorCloseCallback}/>
    );
  }

  renderPauseScreen() {
    const { appProps } = this;

    return (
      <PauseScreen
        appProps={appProps}
        closeCallback={() => this.resume()}
        exitCallback={() => this.exit()}
      />
    );
  }

  renderOverlayScreen() {
    return (
      <OverlayScreen/>
    );
  }

  isDebug() {
    return this.debug;
  }

  render() {
    const { ModeEnum } = this;
    const { mode, showOverlay } = this.state;

    if (mode === ModeEnum.ERROR) {
      return this.renderErrorScreen();
    } else if (showOverlay) {
      return this.renderOverlayScreen();
    }

    return null;
  }

  pause(resumeCallback) {
    const { mode } = this.state;
    const { ModeEnum } = this;

    if (mode !== ModeEnum.PAUSE) {
      this.setState({
        mode: ModeEnum.PAUSE,
        resumeCallback: resumeCallback
      })
      return true;
    }
    return false;
  }

  resume() {
    const { mode, resumeCallback } = this.state;
    const { ModeEnum } = this;

    if (mode === ModeEnum.PAUSE) {
      this.setState({
        mode: ModeEnum.LOADED,
        resumeCallback: null
      }, () => resumeCallback());
      return true;
    }
    return false;
  }

  isPauseScreen() {
    const { mode } = this.state;
    const { ModeEnum } = this;

    return mode === ModeEnum.PAUSE;
  }

  // Async to allow for asynchronous saves, etc.
  async onPreExit() {
    console.log('onPreExit...');
  }

  async _exit(navigateBack) {
    // Asynchronous to allow for async saves, etc.
    try {
      await this.onPreExit();
    } catch (e) {
      console.error(e); // TODO: Proper logging
    }

    if (navigateBack) window.history.back();
  }

  setShowOverlay(show) {
    const { showOverlay } = this.state;
    if (show != showOverlay) {
      this.setState({showOverlay: show});
    }
  }

  isShowOverlay() {
    const { showOverlay } = this.state;
    return showOverlay;
  }

  async exit(error, navigateBack = true) {
    const { ModeEnum } = this;

    if (error) {
      console.error(error);
    }

    if (!this.exited) {
      this.exited = true;
      console.log("exiting application...")

      if (error) {
        this.setState({
          mode: ModeEnum.ERROR,
          errorMessage: error,
          errorCloseCallback: async () => {
            await this._exit(navigateBack);
          }
        });
      } else {
        await this._exit(navigateBack);
      }
    }
  }
}
