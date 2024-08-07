import React from "react";
import { Component } from "react";

import { dropbox } from "../../../storage";
import { settings } from '../../../settings'
import { showMessage } from "../../components/message";
import { CloudWhiteImage } from "../../../images";
import { EditorScreen } from "../editor";
import { FieldsTab } from "../editor/tabs";
import { FieldRow } from "../editor/tabs";
import { FieldLabel } from "../editor/tabs";
import { FieldControl } from "../editor/tabs";
import { ImageButton } from "../../components/image-button";
import { LinkBlackImage } from "../../../images";
import { LinkWhiteImage } from "../../../images";
import { LinkOffBlackImage } from "../../../images";
import { LinkOffWhiteImage } from "../../../images";
import { Resources } from "../../../resources";
import { ScreenSizeSelect } from "../../components/select/screensizeselect";
import { Switch } from "../../components/switch";
import { TelevisionWhiteImage } from "../../../images";
import { TuneWhiteImage } from "../../../images";
import { WebrcadeContext } from "../../context/webrcadecontext";
import { TEXT_IDS } from "../../../resources";

export class SettingsEditor extends Component {
  constructor() {
    super();
    const values = {
      expApps: settings.isExpAppsEnabled(),
      vsync: settings.isVsyncEnabled(),
      bilinear: settings.isBilinearFilterEnabled(),
      cloudStorage: settings.isCloudStorageEnabled(),
      hideTitleBar: settings.getHideTitleBar(),
      screenSize: settings.getScreenSize(),
      dbLinked: settings.getDbToken() !== null,
      disableInGame: settings.isGameSavesDisabledAfterState()
    };
    this.state = {
      tabIndex: null,
      focusGridComps: null,
      values: values,
      originalValues: { ...values }
    };
  }

  componentDidMount() {
  }

  render() {
    const { ctx, isStandalone, onClose } = this.props;
    const { originalValues, tabIndex, values, focusGridComps } = this.state;

    const setFocusGridComps = (comps) => {
      this.setState({ focusGridComps: comps });
    }

    const setValues = (values) => {
      this.setState({ values: values });
    }

    return (
      <EditorScreen
        hidden={ctx && ctx.isAlertScreenOpen()}
        showCancel={true}
        onOk={() => {
          const oldCloudEnabled = settings.isCloudStorageEnabled();
          settings.setExpAppsEnabled(values.expApps);
          settings.setVsyncEnabled(values.vsync);
          settings.setBilinearFilterEnabled(values.bilinear);
          settings.setCloudStorageEnabled(values.cloudStorage);
          settings.setHideTitleBar(values.hideTitleBar);
          settings.setScreenSize(values.screenSize);
          settings.setGameSavesDisabledAfterState(values.disableInGame);
          if (originalValues.expApps !== values.expApps) {
            ctx.showAlertScreen(true,
              Resources.getText(TEXT_IDS.RELOAD_EXP_APPS),
              () => {
                settings.save().finally(() => {
                  window.location.reload();
                });
              }, true, true);
          } else {
            settings.save().finally(() => {
              onClose();
              if (isStandalone && (oldCloudEnabled != values.cloudStorage)) {
                // Reload the app for now (TODO: Find a better way)
                window.parent.location.reload();
              }
            });
          }
        }}
        onClose={onClose}
        focusGridComps={focusGridComps}
        onTabChange={(oldTab, newTab) => this.setState({ tabIndex: newTab })}
        tabs={
          isStandalone ? ([
            {
              image: CloudWhiteImage,
              label: Resources.getText(TEXT_IDS.CLOUD_STORAGE),
              content: (
                <CloudStorageTab
                  isActive={tabIndex === 0}
                  setFocusGridComps={setFocusGridComps}
                  values={values}
                  setValues={setValues}
                  isStandalone={isStandalone}
                />
              )
            }
          ]) : ([/*{
            image: SettingsWhiteImage,
            label: Resources.getText(TEXT_IDS.GENERAL_SETTINGS),
            content: (
              <GeneralSettingsTab
                isActive={tabIndex === 0}
                setFocusGridComps={setFocusGridComps}
                values={values}
                setValues={setValues}
              />
            )
        },*/ {
              image: TelevisionWhiteImage,
              label: Resources.getText(TEXT_IDS.DISPLAY_SETTINGS),
              content: (
                <DisplaySettingsTab
                  isActive={tabIndex === 0}
                  setFocusGridComps={setFocusGridComps}
                  values={values}
                  setValues={setValues}
                />
              )
            }, {
              image: CloudWhiteImage,
              label: Resources.getText(TEXT_IDS.CLOUD_STORAGE),
              content: (
                <CloudStorageTab
                  isActive={tabIndex === 1}
                  setFocusGridComps={setFocusGridComps}
                  values={values}
                  setValues={setValues}
                />
              )
            }, {
              image: TuneWhiteImage,
              label: Resources.getText(TEXT_IDS.ADVANCED_SETTINGS),
              content: (
                <AdvancedSettingsTab
                  isActive={tabIndex === 2}
                  setFocusGridComps={setFocusGridComps}
                  values={values}
                  setValues={setValues}
                />
              )
            }])}
      />
    );
  }
}
SettingsEditor.contextType = WebrcadeContext;

class GeneralSettingsTab extends FieldsTab {
  constructor() {
    super();
    this.hideTitleBarRef = React.createRef();
    this.gridComps = [
      [this.hideTitleBarRef]
    ]
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps } = this.props;
    const { isActive } = this.props;

    if (isActive && (isActive !== prevProps.isActive)) {
      setFocusGridComps(gridComps);
    }
  }

  render() {
    const { hideTitleBarRef } = this;
    const { focusGrid } = this.context;
    const { setValues, values } = this.props;

    return (
      <>
        <FieldRow>
          <FieldLabel>
            {Resources.getText(TEXT_IDS.HIDE_TITLE_BAR)}
          </FieldLabel>
          <FieldControl>
            <Switch
              ref={hideTitleBarRef}
              onPad={e => focusGrid.moveFocus(e.type, hideTitleBarRef)}
              onChange={e => {
                setValues({ ...values, ...{ hideTitleBar: e.target.checked } });
              }}
              checked={values.hideTitleBar}
            />
          </FieldControl>
        </FieldRow>
      </>
    );
  }
}
GeneralSettingsTab.contextType = WebrcadeContext;

class AdvancedSettingsTab extends FieldsTab {
  constructor() {
    super();
    this.showExperimentalAppsRef = React.createRef();
    this.hideTitleBarRef = React.createRef();
    this.gridComps = [
      [this.showExperimentalAppsRef],
      [this.hideTitleBarRef],
    ]
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps } = this.props;
    const { isActive } = this.props;

    if (isActive && (isActive !== prevProps.isActive)) {
      setFocusGridComps(gridComps);
    }
  }

  render() {
    const { hideTitleBarRef, showExperimentalAppsRef } = this;
    const { focusGrid } = this.context;
    const { setValues, values } = this.props;

    return ([
      <FieldRow>
        <FieldLabel>
          {Resources.getText(TEXT_IDS.EXPERIMENTAL_APPS)}
        </FieldLabel>
        <FieldControl>
          <Switch
            ref={showExperimentalAppsRef}
            onPad={e => focusGrid.moveFocus(e.type, showExperimentalAppsRef)}
            onChange={e => {
              setValues({ ...values, ...{ expApps: e.target.checked } });
            }}
            checked={values.expApps}
          />
        </FieldControl>
      </FieldRow>,
      <FieldRow>
        <FieldLabel>
          {Resources.getText(TEXT_IDS.HIDE_TITLE_BAR)}
        </FieldLabel>
        <FieldControl>
          <Switch
            ref={hideTitleBarRef}
            onPad={e => focusGrid.moveFocus(e.type, hideTitleBarRef)}
            onChange={e => {
              setValues({ ...values, ...{ hideTitleBar: e.target.checked } });
            }}
            checked={values.hideTitleBar}
          />
        </FieldControl>
      </FieldRow>
    ]
    );
  }
}
AdvancedSettingsTab.contextType = WebrcadeContext;

class DisplaySettingsTab extends FieldsTab {
  constructor() {
    super();
    this.screenSizeRef = React.createRef();
    this.verticalSyncRef = React.createRef();
    this.bilinearFilterRef = React.createRef();
    this.gridComps = [
      [this.screenSizeRef],
      [this.verticalSyncRef],
      [this.bilinearFilterRef]
    ]
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps } = this.props;
    const { isActive } = this.props;

    if (isActive && (isActive !== prevProps.isActive)) {
      setFocusGridComps(gridComps);
    }
  }

  render() {
    const { bilinearFilterRef, screenSizeRef, verticalSyncRef } = this;
    const { focusGrid } = this.context;
    const { setValues, values } = this.props;

    return ([
      <FieldRow>
        <FieldLabel>
          {Resources.getText(TEXT_IDS.SCREEN_SIZE)}
        </FieldLabel>
        <FieldControl>
          <ScreenSizeSelect
            selectRef={screenSizeRef}
            onChange={(value) => {
              setValues({ ...values, ...{ screenSize: value }});
            }}
            value={values.screenSize}
            onPad={e => focusGrid.moveFocus(e.type, screenSizeRef)}
          />
        </FieldControl>
      </FieldRow>,
      <FieldRow>
        <FieldLabel>
          {Resources.getText(TEXT_IDS.VERTICAL_SYNC)}
        </FieldLabel>
        <FieldControl>
          <Switch
            ref={verticalSyncRef}
            onPad={e => focusGrid.moveFocus(e.type, verticalSyncRef)}
            onChange={e => {
              setValues({ ...values, ...{ vsync: e.target.checked } });
            }}
            checked={values.vsync}
          />
        </FieldControl>
      </FieldRow>,
      <FieldRow>
        <FieldLabel>
          {Resources.getText(TEXT_IDS.BILINEAR_FILTER)}
        </FieldLabel>
        <FieldControl>
          <Switch
            ref={bilinearFilterRef}
            onPad={e => focusGrid.moveFocus(e.type, bilinearFilterRef)}
            onChange={e => {
              setValues({ ...values, ...{ bilinear: e.target.checked } });
            }}
            checked={values.bilinear}
          />
        </FieldControl>
      </FieldRow>
    ]);
  }
}
DisplaySettingsTab.contextType = WebrcadeContext;

class CloudStorageTab extends FieldsTab {
  constructor() {
    super();
    this.cloudStorageRef = React.createRef();
    this.dropboxRef = React.createRef();
    this.disableSavesRef = React.createRef();
    this.gridComps = [
      [this.cloudStorageRef],
      [this.dropboxRef],
      [this.disableSavesRef],
    ]
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps } = this.props;
    const { isActive } = this.props;

    if (isActive && (isActive !== prevProps.isActive)) {
      setFocusGridComps(gridComps);
    }
  }

  render() {
    const { cloudStorageRef, dropboxRef, disableSavesRef } = this;
    const { focusGrid } = this.context;
    const { isStandalone, setValues, values } = this.props;

    let cloudStorageComps = null;
    if (values.cloudStorage) {
      cloudStorageComps = [
        <FieldRow>
          <FieldLabel>
            {Resources.getText(TEXT_IDS.DROPBOX)}
          </FieldLabel>
          <FieldControl>
            <div>
              <ImageButton
                ref={dropboxRef}
                imgSrc={values.dbLinked ? LinkOffBlackImage : LinkBlackImage}
                hoverImgSrc={values.dbLinked ? LinkOffWhiteImage : LinkWhiteImage}
                label={Resources.getText(values.dbLinked ? TEXT_IDS.UNLINK : TEXT_IDS.LINK)}
                onPad={e => focusGrid.moveFocus(e.type, dropboxRef)}
                onClick={() => {
                  if (!values.dbLinked) {
                    // Force cloud storage to be enabled
                    settings.setCloudStorageEnabled(true);
                    settings.save().finally(() => {
                      if (isStandalone) {
                        window.parent._dropbox.link(window.parent.location.href).catch((e) => showMessage(e));
                      } else {
                        dropbox.link().catch((e) => showMessage(e));
                      }
                    });
                  } else {
                    settings.setDbToken(null);
                    settings.save().finally(() => {
                      setValues({ ...values, ...{ dbLinked: false } });
                    });
                  }
                }}
              />
            </div>
          </FieldControl>
        </FieldRow>,
        <FieldRow>
          <FieldLabel>
            {Resources.getText(TEXT_IDS.STATUS)}
          </FieldLabel>
          <FieldControl>
            <div>{Resources.getText(values.dbLinked ? TEXT_IDS.LINKED : TEXT_IDS.UNLINKED)}</div>
          </FieldControl>
        </FieldRow>,
        <FieldRow>
          <FieldLabel>
            Disable saves after state load
          </FieldLabel>
          <FieldControl>
            <Switch
              ref={disableSavesRef}
              onPad={e => focusGrid.moveFocus(e.type, disableSavesRef)}
              onChange={e => {
                setValues({ ...values, ...{ disableInGame: e.target.checked } });
              }}
              checked={values.disableInGame}
            />
          </FieldControl>
        </FieldRow>
      ]
    }

    return ([
      <FieldRow>
        <FieldLabel>
          {Resources.getText(TEXT_IDS.ENABLED)}
        </FieldLabel>
        <FieldControl>
          <Switch
            ref={cloudStorageRef}
            onPad={e => focusGrid.moveFocus(e.type, cloudStorageRef)}
            onChange={e => {
              setValues({ ...values, ...{ cloudStorage: e.target.checked } });
            }}
            checked={values.cloudStorage}
          />
        </FieldControl>
      </FieldRow>,
      cloudStorageComps
    ]);
  }
}
CloudStorageTab.contextType = WebrcadeContext;
