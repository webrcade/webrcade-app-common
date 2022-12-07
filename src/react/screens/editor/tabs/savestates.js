import React from 'react';
import { Component } from 'react';

import { STATE_SLOTS } from '../../../../app/saves'
import { TEXT_IDS } from '../../../../resources';
import { CloudUploadBlackImage } from '../../../../images'
import { CloudUploadWhiteImage } from '../../../../images'
import { CloudDownloadBlackImage } from '../../../../images'
import { CloudDownloadWhiteImage } from '../../../../images'
import { DeleteForeverBlackImage} from '../../../../images'
import { DeleteForeverWhiteImage} from '../../../../images'
import { EditorScreen } from '../index'
import { EditorTab } from '../index'
import { ImageButton } from '../../../components/image-button';
import { Resources } from '../../../../resources';
import { SaveWhiteImage } from '../../../../images'
import { WebrcadeContext } from '../../../context/webrcadecontext';

import styles from './savestates-style.scss'

const DATE_FORMAT = {
  month: '2-digit', day: '2-digit', year: '2-digit',
  hour: '2-digit', minute: '2-digit'
};

export class SaveStatesEditor extends Component {

  constructor() {
    super();

    this.busy = false;

    this.state = {
      tabIndex: null,
      focusGridComps: null,
      slots: new Array(STATE_SLOTS),
      loaded: false
    };
  }

  async updateStates(showStatus = true) {
    const { emulator } = this.props;

    const slots = await emulator.getStateSlots(showStatus)
    this.setState({
      loaded: true,
      slots: slots ? slots : this.state.slots
    });
  }

  componentDidMount() {
    const { loaded } = this.state;

    if (!loaded) {
      this.updateStates();
    }
  }

  render() {
    const { emptyImageSrc, emulator, onClose, showStatusCallback } = this.props;
    const { loaded, slots, tabIndex, focusGridComps } = this.state;

    if (!loaded) return null;

    const setFocusGridComps = (comps) => {
      this.setState({ focusGridComps: comps });
    };

    const tabs = []
    for (let i = 0; i < STATE_SLOTS; i++) {
      const slot = i + 1;
      tabs.push(
        {
          image: SaveWhiteImage,
          label: `Save Slot ${slot}`,
          content: (
            <SlotTab
              editor={this}
              emptyImageSrc={emptyImageSrc}
              updateStates={async (showStatus) => { await this.updateStates(showStatus) }}
              onClose={onClose}
              slot={slot}
              slots={slots}
              emulator={emulator}
              isActive={tabIndex === i}
              setFocusGridComps={setFocusGridComps}
              showStatusCallback={showStatusCallback}
            />
          ),
        }
      )
    }

    return (
      <EditorScreen
        showCancel={false}
        onOk={() => { onClose(); }}
        onClose={onClose}
        focusGridComps={focusGridComps}
        onTabChange={(oldTab, newTab) => this.setState({ tabIndex: newTab })}
        tabs={tabs}
      />
    );
  }
}

class SlotTab extends EditorTab {
  constructor() {
    super();
    this.loadRef = React.createRef();
    this.saveRef = React.createRef();
    this.deleteRef = React.createRef();
    this.gridComps = [[this.loadRef, this.saveRef, this.deleteRef]];
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps } = this.props;
    const { isActive } = this.props;

    if (isActive && isActive !== prevProps.isActive) {
      setFocusGridComps(gridComps);
    }
  }

  render() {
    const { loadRef, saveRef, deleteRef } = this;
    const { focusGrid } = this.context;
    const { editor, emptyImageSrc, emulator, onClose, slot, slots, updateStates, showStatusCallback } = this.props;

    const currentSlot = slots[slot];

    return (
      <div className={styles['slottab']}>
        <div className={styles['slottab-content']}>
          <div className={styles['slottab-content-left']}>
            <img alt="screenshot" src={currentSlot ? currentSlot.shot : emptyImageSrc} />
          </div>
          <div className={styles['slottab-content-right']}>
            <div className={styles['slottab-content-right-title']}>
              {Resources.getText(TEXT_IDS.SAVE_TIME)}
            </div>
            <div className={styles['slottab-content-right-subtitle']}>
              {currentSlot ?
                new Date(currentSlot.time).toLocaleString([], DATE_FORMAT) :
                Resources.getText(TEXT_IDS.SAVE_DOES_NOT_EXIST)}
            </div>
            <div className={styles['slottab-content-right-buttons']}>
              {currentSlot &&
                <ImageButton
                  ref={loadRef}
                  onPad={e => focusGrid.moveFocus(e.type, loadRef)}
                  label={Resources.getText(TEXT_IDS.LOAD)}
                  imgSrc={CloudDownloadBlackImage}
                  hoverImgSrc={CloudDownloadWhiteImage}
                  onClick={async () => {
                    if (editor.busy) return;
                    try {
                      editor.busy = true;
                      await emulator.loadStateForSlot(slot);
                      onClose();
                    } finally {
                      editor.busy = false;
                    }
                  }}
                />
              }
              <ImageButton
                ref={saveRef}
                onPad={e => focusGrid.moveFocus(e.type, saveRef)}
                label={Resources.getText(TEXT_IDS.SAVE)}
                imgSrc={CloudUploadBlackImage}
                hoverImgSrc={CloudUploadWhiteImage}
                onClick={async () => {
                  if (editor.busy) return;
                  try {
                    editor.busy = true;
                    await emulator.saveStateForSlot(slot);
                    onClose();
                  } finally {
                    editor.busy = false;
                  }
                }}
              />
              {currentSlot &&
                <ImageButton
                  ref={deleteRef}
                  onPad={e => focusGrid.moveFocus(e.type, deleteRef)}
                  label={Resources.getText(TEXT_IDS.DELETE)}
                  imgSrc={DeleteForeverBlackImage}
                  hoverImgSrc={DeleteForeverWhiteImage}
                  onClick={async () => {
                    if (editor.busy) return;
                    try {
                      editor.busy = true;
                      showStatusCallback(Resources.getText(TEXT_IDS.CLOUD_DELETING));
                      await emulator.deleteStateForSlot(slot, false);
                      await updateStates(false);
                    } finally {
                      this.saveRef.current.focus();
                      showStatusCallback(null)
                      editor.busy = false;
                    }
                  }}
                />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
SlotTab.contextType = WebrcadeContext;
