import React, { Fragment } from 'react';
import { Component } from 'react';

import { EditorScreen } from '../editor';
import { FieldsTab } from '../editor/tabs';
import { FieldRow } from '../editor/tabs';
import { FieldLabel } from '../editor/tabs';
import { FieldControl } from '../editor/tabs';
import { TelevisionWhiteImage } from '../../../images';
import { ScreenSizeSelect } from '../../components/select/screensizeselect';
import { Switch } from '../../components/switch';
import { WebrcadeContext } from '../../context/webrcadecontext';

export class AppSettingsEditor extends Component {
  constructor() {
    super();
    this.state = {
      tabIndex: null,
      focusGridComps: null,
      values: {},
    };
  }

  componentDidMount() {
    const { emulator } = this.props;

    this.setState({
      values: {
        origBilinearMode: emulator.getPrefs().isBilinearEnabled(),
        bilinearMode: emulator.getPrefs().isBilinearEnabled(),
        origScreenSize: emulator.getPrefs().getScreenSize(),
        screenSize: emulator.getPrefs().getScreenSize()
      },
    });
  }

  render() {
    const { emulator, onClose } = this.props;
    const { tabIndex, values, focusGridComps } = this.state;

    const setFocusGridComps = (comps) => {
      this.setState({ focusGridComps: comps });
    };

    const setValues = (values) => {
      this.setState({ values: values });
    };

    return (
      <EditorScreen
        showCancel={true}
        onOk={() => {
          let change = false;
          if (values.origBilinearMode !== values.bilinearMode) {
            emulator.getPrefs().setBilinearEnabled(values.bilinearMode);
            emulator.updateBilinearFilter();
            change = true;
          }
          if (values.origScreenSize !== values.screenSize) {
            emulator.getPrefs().setScreenSize(values.screenSize);
            emulator.updateScreenSize();
            change = true;
          }
          if (change) {
            emulator.getPrefs().save();
          }
          onClose();
        }}
        onClose={onClose}
        focusGridComps={focusGridComps}
        onTabChange={(oldTab, newTab) => this.setState({ tabIndex: newTab })}
        tabs={[
          {
            image: TelevisionWhiteImage,
            label: 'Display Settings',
            content: (
              <AppDisplaySettingsTab
                emulator={emulator}
                isActive={tabIndex === 0}
                setFocusGridComps={setFocusGridComps}
                values={values}
                setValues={setValues}
              />
            ),
          },
        ]}
      />
    );
  }
}

export class AppDisplaySettingsTab extends FieldsTab {
  constructor() {
    super();
    this.bilinearRef = React.createRef();
    this.screenSizeRef = React.createRef();
    this.gridComps = [
      [this.screenSizeRef],
      [this.bilinearRef]
    ];
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
    const { bilinearRef, screenSizeRef } = this;
    const { focusGrid } = this.context;
    const { setValues, values, hideBilinear } = this.props;

    return (
      <Fragment>
        <FieldRow>
          <FieldLabel>Screen size</FieldLabel>
          <FieldControl>
            <ScreenSizeSelect
              selectRef={screenSizeRef}
              addDefault={true}
              onChange={(value) => {
                setValues({ ...values, ...{ screenSize: value }});
              }}
              value={values.screenSize}
              onPad={e => focusGrid.moveFocus(e.type, screenSizeRef)}
            />
          </FieldControl>
        </FieldRow>
        {!hideBilinear && (
          <FieldRow>
            <FieldLabel>Force bilinear filter</FieldLabel>
            <FieldControl>
              <Switch
                ref={bilinearRef}
                onPad={(e) => focusGrid.moveFocus(e.type, bilinearRef)}
                onChange={(e) => {
                  setValues({ ...values, ...{ bilinearMode: e.target.checked } });
                }}
                checked={values.bilinearMode}
              />
            </FieldControl>
          </FieldRow>
        )}
        </Fragment>
    );
  }
}
AppDisplaySettingsTab.contextType = WebrcadeContext;
