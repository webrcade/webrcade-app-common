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
import { applyIosNavBarHack, removeIosNavBarHack, UrlUtil, isIos,isSafariOnMac, addXboxFullscreenCallback, getXboxViewMessage, preloadImages } from '../../../util';
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
      loadingMessage: null,
      loadingPercent: null,
      errorMessage: null,
      yesNoInfo: null,
      showOverlay: false,
      showXboxViewMessage: false,
      statusMessage: null,
      refresh: 0
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
      this.setState({mode:null});
      this.exit(null, false)
        .catch((e) => LOG.error(e))
        .finally(() => {
          setTimeout(() => {
            e.source.postMessage("exitComplete", "*");
          }, 0)
        });
    }
  }

  forceRefresh() {
    this.setState({refresh: this.state.refresh + 1});
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
    this.isStandalone = context && context === AppProps.RV_CONTEXT_STANDALONE;

    // Set title if multi-threaded and in editor
    if (this.isEditor && this?.appProps?.mt && this?.appProps?.title) {
      window.document.title = this.appProps.title;
    }

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
    // if (settings.isBilinearFilterEnabled()) {
    //   styles.imageRendering = 'auto';
    // }
    return styles;
  }

  renderLoading() {
    const { loadingMessage, loadingPercent } = this.state;
    return (
      <div key={loadingMessage ? loadingMessage : "loading"}>
        <div className={styles.loading}>{loadingMessage ? loadingMessage : Resources.getText(TEXT_IDS.LOADING)}...</div>
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
        isStandalone={this.isStandalone}
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

  resume(targetMode) {
    const { mode, resumeCallback } = this.state;
    const { ModeEnum } = this;

    if (mode === ModeEnum.PAUSE || (targetMode && (mode === targetMode))) {
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

    if (navigateBack) {
      if (!this.isStandalone) {
        if (this.appProps.mt && this.isEditor) {
          // Editor and multi-threaded, close tab
          window.close();
        } else {
          if (isIos() || isSafariOnMac()) {
            window.parent.postMessage("appExiting", '*');
          } else {
            window.history.back();
          }
        }
      } else {
        window.document.body.innerHTML = '';
      }
    }
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

  // TODO: Move this to common
  async fetchResponseBuffer(response, heapAllocCallback = null) {
    //let checksum = 0;

    let length = response.headers.get('Content-Length');
    let type = response.headers.get("Content-Type");
    let isText = (type &&
      (type.toLowerCase().indexOf("text/") !== -1) ||
      (type.toLowerCase().indexOf("application/json") !== -1) ||
      (type.toLowerCase().indexOf("application/xml") !== -1)
    );

    // console.log("Length: " + length);
    if (!isText && length) {
      length = parseInt(length);

      // If we were passed a heap allocator, use it
      let array = null;
      if (heapAllocCallback && length > 0) {
        array = heapAllocCallback(length);
      } else {
        array = length > 0 ? new Uint8Array(length) : new Uint8Array();
      }

      if (length > 0) {
        let at = 0;
        let reader = response.body.getReader();
        for (;;) {
          let { done, value } = await reader.read();
          if (done) {
            break;
          }

// TODO: FIX THIS BEFORE RELEASE !!!
          if (at + value.length > length) {
            LOG.error("File exceeded reported length! " + (at + value.length) + ", " + length);
            // TODO: Fix this! Download the file w/o streaming...
            return array;
          }

          array.set(value, at);
          at += value.length;

          // for (let i = 0; i < value.length; i++) {
          //   checksum += value[i];
          // }

          const progress = ((at / length).toFixed(2) * 100).toFixed(0);
          this.setState({ loadingPercent: progress | 0 });
        }
      }
      try {
        // console.log("##### " + checksum)
        // alert(checksum)
        return array;
      } finally {
        array = null;
      }
    } else {
      const blob = await response.blob();
      return new Uint8Array(await new Response(blob).arrayBuffer());
    }
  }
}

