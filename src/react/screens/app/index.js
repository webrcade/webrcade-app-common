import React, { Component } from "react";

import * as LOG from '../../../log';
import { AppProps } from '../../../app';
import { AppRegistry } from '../../../apps';
import { isDev } from '../../../util';

import styles from './style.scss'

export const APP_DIV_ID = "webrcade-app";
export const APP_FRAME_ID = "webrcade-app-iframe";

export class AppScreen extends Component {

  constructor() {
    super();

    this.frameRetryId = null;
  }

  MAX_LOAD_TIME = 10 * 1000;
  STATUS_DIV_ID = "webrcade-app-status-div";

  clearRefreshTimout() {
    const { frameRetryId } = this;

    if (frameRetryId != null) {
      clearTimeout(frameRetryId);
      this.frameRetryId = null;
    }
  }

  messageListener = e => {
    if (e.data === 'appLoaded') {
      LOG.info("app loaded message received.")
      this.clearRefreshTimout();
    }
  }

  getAppDiv() {
    return document.getElementById(APP_DIV_ID);
  }

  getAppIframe() {
    return document.getElementById(APP_FRAME_ID);
  }

  getStatusDiv() {
    return document.getElementById(this.STATUS_DIV_ID);
  }

  componentDidMount() {
    const { MAX_LOAD_TIME } = this;

    window.addEventListener("message", this.messageListener);

    this.frameRetryId = setTimeout(() => {
      const iframe = this.getAppIframe();
      if (iframe && !isDev()) {
        LOG.info("attempting to reload frame, exceeded wait timeout: " + MAX_LOAD_TIME);
        iframe.contentDocument.location.reload();
      }
    }, MAX_LOAD_TIME);
  }

  componentWillUnmount() {
    const { app, exitCallback } = this.props;
    const reg = AppRegistry.instance;
    const appDiv = this.getAppDiv();

    if (!reg.isDelayedExit(app)) {
      if (appDiv) {
        appDiv.parentNode.removeChild(appDiv);
        if (exitCallback) {
          exitCallback();
        }
      }
    } else {
      const statusDiv = this.getStatusDiv();
      if (statusDiv) {
        statusDiv.style.display = 'block';
        setTimeout(() => {
          statusDiv.style.opacity = '1.0';
        }, 100);
      }

      // This is a total hack to try to get browsers to free up
      // the memory used by emscripten in the iframe
      let count = 0;
      const appDiv = this.getAppDiv();
      if (appDiv) {
        const iframe = appDiv.children[0];
        iframe.style.height = '20px';
        iframe.style.opacity = '0';
        let intervalId = setInterval(() => {
          if (count === 20) { // 20 worked
            clearInterval(intervalId);
            appDiv.parentNode.removeChild(appDiv);
            if (exitCallback) {
              exitCallback();
            }
          }
          iframe.src = "about:blank";
          count++;
        }, 100);
      }
    }

    window.removeEventListener("message", this.messageListener);

    this.clearRefreshTimout();
  }

  render() {
    const { app, context, feedProps } = this.props;
    const reg = AppRegistry.instance;

    let location = reg.getLocation(app, context, feedProps);
    if (!isDev() && context && context === AppProps.RV_CONTEXT_EDITOR) {
      location = "../../" + location;
    }

    let appDiv = this.getAppDiv();
    if (!appDiv) {
      appDiv = document.createElement("div");
      appDiv.className = APP_DIV_ID;
      appDiv.id = APP_DIV_ID;

      const iframe = document.createElement("iframe");
      if (!isDev()) {
        iframe.style.display = 'none';
      }
      iframe.id = APP_FRAME_ID;
      iframe.setAttribute("width", "100%");
      iframe.setAttribute("height", "100%");
      iframe.setAttribute("frameBorder", "0");
      iframe.setAttribute("src", location);
      iframe.setAttribute("allow", "autoplay; gamepad");
      appDiv.appendChild(iframe);

      const statusDiv = document.createElement("div");
      statusDiv.id = this.STATUS_DIV_ID;
      statusDiv.innerHTML = "Exiting...";
      statusDiv.style.position = "absolute";
      statusDiv.style.left = "50%";
      statusDiv.style.top = "50%";
      statusDiv.style.marginRight = "-50%";
      statusDiv.style.transform = "translate(-50%, -50%)";
      statusDiv.style.fontSize = "2.75vw";
      statusDiv.style.zIndex = "5";
      statusDiv.style.fontFamily = "Quicksand";
      statusDiv.style.transition = "opacity 1s";
      statusDiv.style.display = 'none';
      statusDiv.style.cursor = 'none';
      statusDiv.style.opacity = '0';
      appDiv.appendChild(statusDiv);

      document.body.appendChild(appDiv);
    }

    return (<div></div>);
  }
};
