import React, { Component } from "react";
import * as LOG from '../../../log'
import { isDev } from '../../../util'
import { settings } from "../../../settings";
import { AlertScreen } from "../../screens/alert";
import { AppProps } from '../../../app';
import { AppRegistry } from "../../../apps";
import { ErrorScreen } from "../../screens/error";
import { Message } from "../message";
import { OverlayScreen } from "../../screens/overlay"
import { PauseScreen } from "../../screens/pause";
import { Resources, TEXT_IDS } from "../../../resources";
import { StatusScreen } from "../../screens/status";
import { YesNoScreen } from "../../screens/yesno";
import { UrlUtil, addXboxFullscreenCallback, getXboxViewMessage, preloadImages } from '../../../util';
import {
  VolumeOffBlackImage,
  ArrowBackWhiteImage,
  PlayArrowWhiteImage
} from "../../../images/index.js"


import styles from './style.scss'

export class WebrcadeApp extends Component {
  constructor() {
    super();

    preloadImages([
      VolumeOffBlackImage,
      ArrowBackWhiteImage,
      PlayArrowWhiteImage
    ]);

    this.state = {
      mode: this.ModeEnum.LOADING,
      loadingPercent: null,
      errorMessage: null,
      yesNoInfo: null,
      showOverlay: false,
      showXboxViewMessage: false,
      statusMessage: null
    };

    this.pauseExit = false;
    this.exited = false;

    // Add to window to allow for access from menu
    window.app = this;
  }

  ModeEnum = {
    LOADING: "loading",
    LOADED: "loaded",
    ERROR: "error",
    YESNO: "yesno",
    PAUSE: "pause"
  }

  messageListener = (e) => {
    if (e.data === 'exit') {
      this.exit(null, false)
        .catch((e) => LOG.error(e))
        .finally(() => {
          setTimeout(() => {
            e.source.postMessage("exitComplete", "*");
          }, 0)
        });
    }
  }

  componentDidMount() {
    window.addEventListener("message", this.messageListener);

    // Inform that the application was loaded
    if (!isDev() && window.parent) {
      window.parent.postMessage("appLoaded", "*");
    }

    // Xbox view button bug
    addXboxFullscreenCallback((show) => {
      this.setState({ showXboxViewMessage: show })
    });

    // Avoid the white flash
    if (!isDev()) {
      try {
        window.frameElement.style.display = 'block';
      } catch (e) {
        LOG.info('error attempting to make application visible: ' + e)
      }
    }

    const url = window.location.search;
    LOG.info(url);

    // Get props
    const propsEncoded = UrlUtil.getParam(
      url, AppProps.RP_PROPS);
    if (propsEncoded) {
      this.appProps = AppProps.decode(propsEncoded);
      this.type = this.appProps.type;
    } else {
      this.appProps = {};
    }

    //  Is editor
    const context = UrlUtil.getParam(url, AppProps.RP_CONTEXT);
    this.isEditor = context && context === AppProps.RV_CONTEXT_EDITOR;

    // Set debug flag
    this.debug = UrlUtil.getBoolParam(url, AppProps.RP_DEBUG);

    // Enable experimental apps
    AppRegistry.instance.enableExpApps(true);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.messageListener);
  }

  isExitFromPause() {
    return this.pauseExit;
  }

  exitFromPause() {
    this.pauseExit = true;
    this.exit();
  }

  getAppType() {
    return this.type;
  }

  getAppProps() {
    return this.appProps;
  }

  getStoragePath(postfix) {
    return `/wrc/${this.getAppType()}/${postfix}`;
  }

  getCanvasStyles() {
    const styles = {};
    if (settings.isBilinearFilterEnabled()) {
      styles.imageRendering = 'auto';
    }
    return styles;
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
    const { errorCloseCallback, errorMessage } = this.state;

    return (
      <ErrorScreen message={errorMessage} closeCallback={errorCloseCallback} />
    );
  }

  renderYesNoScreen() {
    const { yesNoInfo } = this.state;

    return (
      <YesNoScreen info={yesNoInfo} />
    );
  }

  renderPauseScreen() {
    const { appProps } = this;

    return (
      <PauseScreen
        appProps={appProps}
        closeCallback={() => this.resume()}
        exitCallback={() => {
          this.exitFromPause()
        }}
        isEditor={this.isEditor}
      />
    );
  }

  renderXboxViewScreen() {
    return (
      <AlertScreen
        message={getXboxViewMessage()}
        showButtons={false}
      />
    );
  }

  renderOverlayScreen() {
    return (
      <OverlayScreen />
    );
  }

  isDebug() {
    return this.debug;
  }

  render() {
    const { ModeEnum } = this;
    const { mode, showOverlay, showXboxViewMessage, statusMessage } = this.state;

    let render = null;
    if (showXboxViewMessage) {
      render = this.renderXboxViewScreen();
    } else if (mode === ModeEnum.ERROR) {
      render = this.renderErrorScreen();
    } else if (mode === ModeEnum.YESNO) {
      render = this.renderYesNoScreen();
    } else if (showOverlay) {
      render = this.renderOverlayScreen();
    }

    return ([
      <Message/>,
      render,
      statusMessage && (
        <StatusScreen message={statusMessage} />)
    ])
  }

  setStatusMessage(message) {
    this.setState({
      statusMessage: message
    })
  }

  yesNoPrompt(info) {
    const { ModeEnum } = this;
    this.setState({
      mode: ModeEnum.YESNO,
      yesNoInfo: info
    })
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
    LOG.info('onPreExit...');
  }

  async _exit(navigateBack) {
    // Asynchronous to allow for async saves, etc.
    try {
      await this.onPreExit();
    } catch (e) {
      LOG.error(e);
    }

    if (navigateBack) window.history.back();
  }

  setShowOverlay(show) {
    const { showOverlay } = this.state;
    if (show != showOverlay) {
      this.setState({ showOverlay: show });
    }
  }

  isShowOverlay() {
    const { showOverlay } = this.state;
    return showOverlay;
  }

  async exit(error, navigateBack = true) {
    const { ModeEnum } = this;

    if (error) {
      LOG.error(error);
    }

    if (!this.exited) {
      this.exited = true;
      LOG.info("exiting application...")

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

