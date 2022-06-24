import React from "react";
import { Component } from "react";

import {
  ChevronLeftWhiteImage,
  ChevronRightWhiteImage,
} from '../../../images'

import { ImageButton } from "../../components/image-button";
import { Resources } from "../../../resources";
import { Screen } from "../../components/screen";
import { WebrcadeContext } from "../../context/webrcadecontext";
import { TEXT_IDS } from "../../../resources";

import styles from './style.scss'

export class EditorScreen extends Screen {
  constructor() {
    super();

    this.analogCallback = null;
    this.okButtonRef = React.createRef();
    this.cancelButtonRef = React.createRef();
    this.tabLeftRef = React.createRef();
    this.tabRightRef = React.createRef();
    this.state = {
      tabIndex: 0
    };
  }

  focus() {
    const { okButtonRef } = this;

    if (this.gamepadNotifier.padCount > 0) {
      if (okButtonRef && okButtonRef.current) {
        okButtonRef.current.focus();
      }
    }
  }

  componentDidMount() {
    const { gamepadNotifier } = this;
    const { tabIndex } = this.state;

    super.componentDidMount();

    if (!this.analogCallback) {
      this.analogCallback = e => {
        if (e.type === 'r_analog_y') {
          if (this.contentRef) {
            const el = this.contentRef;
            const height = (el.scrollHeight - el.clientHeight);
            let adjust = el.scrollTop + (e.value * 10);
            if (adjust < 0) {
              adjust = 0;
            } else if (adjust > height) {
              adjust = height;
            }
            el.scrollTop = adjust;
          }
        }
      };
      gamepadNotifier.addAnalogCallback(this.analogCallback);
    }

    this.setFocusGridComponents(null);
    this.onTabChange(undefined, tabIndex);
  }

  componentWillUnmount() {
    const { gamepadNotifier } = this;

    super.componentWillUnmount();

    if (this.analogCallback) {
      gamepadNotifier.removeAnalogCallback(this.analogCallback);
    }
  }

  onTabChange(prevTabIndex, newTabIndex) {
    const { onTabChange } = this.props;
    if (onTabChange) onTabChange(prevTabIndex, newTabIndex);
  }

  componentDidUpdate(prevProps, prevState) {
    const { tabIndex } = this.state;
    const { focusGridComps } = this.props;
    const prevTabIndex = prevState.tabIndex;
    if (prevTabIndex !== tabIndex) {
      this.onTabChange(prevTabIndex, tabIndex);
    }
    const prevFocusGridComps = prevProps.focusGridComps;
    if (focusGridComps !== prevFocusGridComps) {
      this.setFocusGridComponents(focusGridComps);
    }
  }

  setFocusGridComponents(gridComps) {
    const { focusGrid } = this;
    const { showCancel } = this.props;

    const comps = [];
    comps.push([this.tabLeftRef, this.tabRightRef]);
    if (gridComps) {
      for (const i in gridComps) {
        comps.push(gridComps[i]);
      }
    }
    if (showCancel) {
      comps.push([this.okButtonRef, this.cancelButtonRef]);
    } else {
      comps.push([this.okButtonRef]);
    }

    focusGrid.setComponents(comps);
  }

  renderTabButton(isPrev) {
    const { tabLeftRef, tabRightRef, focusGrid } = this;
    const { tabs } = this.props;
    const { tabIndex } = this.state;
    const MIN_TAB = 0;
    const MAX_TAB = tabs.length - 1;

    const disabled = (isPrev && tabIndex === MIN_TAB) || (!isPrev && tabIndex === MAX_TAB);

    const fadeOut = () => {
      this.headingRef.classList.remove(styles['editor-screen-content-fade-in']);
      this.contentRef.classList.remove(styles['editor-screen-content-fade-in']);
      this.contentRef.scrollTop = 0;
    }

    return (
      <ImageButton
        className={styles['editor-screen-heading-group-button'] + (disabled ? (' ' + styles['editor-screen-button-hide']) : '')}
        disabled={disabled}
        ref={isPrev ? tabLeftRef : tabRightRef}
        onPad={e => focusGrid.moveFocus(e.type, isPrev ? tabLeftRef : tabRightRef)}
        imgSrc={isPrev ? ChevronLeftWhiteImage : ChevronRightWhiteImage}
        onClick={() => {
          if (!disabled) {
            fadeOut();
            const newIndex = (isPrev ? tabIndex - 1 : tabIndex + 1);
            if ((isPrev && newIndex === MIN_TAB) || (!isPrev && newIndex === MAX_TAB)) {
              setTimeout(() => {
                if (isPrev) {
                  tabRightRef.current.focus()
                } else {
                  tabLeftRef.current.focus();
                }
              }, 50);
            }
            this.setState({ tabIndex: newIndex });
          }
        }}
      />
    )
  }

  renderTabImage(tabIndex) {
    const { tabs } = this.props;
    return (
      <img className={styles['editor-screen-heading-group-image']} src={tabs[tabIndex].image} alt=""></img>
    );
  }

  renderTabLabel(tabIndex) {
    const { tabs } = this.props;
    return (
      <span className={styles['editor-screen-heading-group-right-text']}>{tabs[tabIndex].label}</span>
    );
  }

  renderContent(tabIndex) {
    const { tabs } = this.props;
    return tabs[tabIndex].content;
  }

  render() {
    const { okButtonRef, cancelButtonRef, screenContext, screenStyles, focusGrid } = this;
    const { onOk, onClose, showCancel } = this.props;
    const { tabIndex } = this.state;

    setTimeout(() => {
      this.headingRef.classList.add(styles['editor-screen-content-fade-in']);
      this.contentRef.classList.add(styles['editor-screen-content-fade-in']);
    }, 0);

    return (
      <WebrcadeContext.Provider value={screenContext}>
        <div className={screenStyles['screen-transparency']} style={{ 'animation': 'none' }} />
        <div className={styles['editor-screen']}>
          <div className={styles['editor-screen-inner']}>
            <div ref={(heading) => { this.headingRef = heading; }} className={styles['editor-screen-heading']}>
              <div className={styles['editor-screen-heading-group']}>
                {this.renderTabButton(true)}
                {this.renderTabImage(tabIndex)}
                {this.renderTabLabel(tabIndex)}
                {this.renderTabButton(false)}
              </div>
            </div>
            <div className={styles['editor-screen-content']} ref={(content) => { this.contentRef = content; }}>
              <div className={styles['editor-screen-content-container']}>
                {this.renderContent(tabIndex)}
              </div>
            </div>
            <div className={styles['editor-screen-buttons']}>
              <ImageButton
                ref={okButtonRef}
                onPad={e => focusGrid.moveFocus(e.type, okButtonRef)}
                label={Resources.getText(TEXT_IDS.OK)}
                onClick={() => {
                  if (onOk) {
                    onOk();
                  } else {
                    onClose();
                  }
                }}
              />
              {showCancel ? (
                <ImageButton
                  ref={cancelButtonRef}
                  onPad={e => focusGrid.moveFocus(e.type, cancelButtonRef)}
                  label={Resources.getText(TEXT_IDS.CANCEL)}
                  onClick={() => onClose()}
                />
              ) : null}
            </div>
          </div>
        </div>
      </WebrcadeContext.Provider>
    );
  }
}

export class EditorTab extends Component {
}
