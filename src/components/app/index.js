import React, { Component } from "react";
import { UrlUtil } from '../../util';
import { AppProps } from '../../app';
import { isDev } from '../../dev'

import styles from './style.scss'

export class WebrcadeApp extends Component {
  constructor() {
    super();

    this.state = {
      mode: this.ModeEnum.LOADING
    };

    this.exited = false;

    // Add to window to allow for access from menu
    window.app = this;
  }

  ModeEnum = {
    LOADING: "loading",
    LOADED: "loaded"
  }

  componentDidMount() {
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

  getAppType() {
    return this.type;
  }

  getStoragePath(postfix) {
    return `/wrc/${this.getAppType()}/${postfix}`;
  }

  renderLoading() {
    return (<div className={styles.loading}>Loading...</div>);
  }

  isDebug() {
    return this.debug;
  }

  // Async to allow for asynchronous saves, etc.
  async onPreExit() {
    console.log('onPreExit...');
  }

  async exit(error, navigateBack = true) {
    if (error) {
      console.log(error);
    }
    if (!this.exited) {
      this.exited = true;
      console.log("exiting application...")

      if (error) {
        alert(error); // TODO: Proper logging
      }

      // Asynchronous to allow for async saves, etc.
      try {
        await this.onPreExit();
      } catch (e) {
        alert(e); // TODO: Proper logging
      }

      if (navigateBack) window.history.back();
    }
  }
}

