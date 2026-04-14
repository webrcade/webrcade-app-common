import React, { Fragment } from 'react';
import { Component } from 'react';

import { EditorScreen } from '../../editor';
import { FieldsTab, FieldRow, FieldLabel, FieldControl } from '../../editor/tabs';
import { Switch } from '../../../components/switch';
import { BoltWhiteImage } from '../../../../images';
import { WebrcadeContext } from '../../../context/webrcadecontext';

export class CheatsTab extends FieldsTab {
  constructor(props) {
    super(props);
    this.switchRefs = [];
    this.gridComps = [];
  }

  buildGridComps(cheats) {
    this.switchRefs = cheats.map(() => React.createRef());
    // Put the last switch in the grid so UP from OK lands at the bottom of the list
    this.gridComps = cheats.length > 0 ? [[this.switchRefs[cheats.length - 1]]] : [];
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps, isActive, cheats } = this.props;

    if (cheats !== prevProps.cheats) {
      this.buildGridComps(cheats);
    }

    if (isActive && isActive !== prevProps.isActive) {
      setFocusGridComps(gridComps);
    }
  }

  componentDidMount() {
    const { cheats } = this.props;
    if (cheats) {
      this.buildGridComps(cheats);
    }
  }

  focusFirst() {
    const ref = this.switchRefs[0];
    if (ref && ref.current) ref.current.focus();
  }

  focusLast() {
    const last = this.switchRefs[this.switchRefs.length - 1];
    if (last && last.current) last.current.focus();
  }

  render() {
    const { switchRefs } = this;
    const { focusGrid } = this.context;
    const { cheats, values, setValues } = this.props;

    if (!cheats || cheats.length === 0 || !values.cheats) {
      return null;
    }

    return (
      <Fragment>
        {cheats.map((cheat, idx) => {
          const ref = switchRefs[idx] || React.createRef();
          return (
            <FieldRow key={idx}>
              <FieldLabel>{cheat.desc}</FieldLabel>
              <FieldControl>
                <Switch
                  ref={ref}
                  onPad={(e) => {
                    const { type } = e;
                    if (type === 'up') {
                      if (idx > 0) {
                        const target = switchRefs[idx - 1];
                        if (target && target.current) target.current.focus();
                      } else {
                        focusGrid.moveFocus('down', switchRefs[cheats.length - 1]);
                      }
                    } else if (type === 'down') {
                      if (idx < cheats.length - 1) {
                        const target = switchRefs[idx + 1];
                        if (target && target.current) target.current.focus();
                      } else {
                        focusGrid.moveFocus('down', switchRefs[cheats.length - 1]);
                      }
                    } else if (type === 'lbump') {
                      if (switchRefs[0] && switchRefs[0].current) switchRefs[0].current.focus();
                    } else if (type === 'rbump') {
                      const last = switchRefs[switchRefs.length - 1];
                      if (last && last.current) last.current.focus();
                    } else {
                      focusGrid.moveFocus(type, switchRefs[0]);
                    }
                  }}
                  onChange={(e) => {
                    const updated = values.cheats.map((c, i) =>
                      i === idx ? { ...c, enabled: e.target.checked } : c
                    );
                    setValues({ ...values, cheats: updated });
                  }}
                  checked={values.cheats[idx] ? values.cheats[idx].enabled : false}
                />
              </FieldControl>
            </FieldRow>
          );
        })}
      </Fragment>
    );
  }
}
CheatsTab.contextType = WebrcadeContext;

export class CheatsSettingsEditor extends Component {
  constructor() {
    super();
    this.state = {
      tabIndex: null,
      focusGridComps: null,
      values: {},
    };
    this.busy = false;
    this.cheatsTabRef = React.createRef();
  }

  componentDidMount() {
    const { emulator } = this.props;
    const cheatsService = emulator.getCheatsService();
    const cheats = cheatsService.getList();
    this.setState({
      cheats: cheats,
      values: {
        cheats: cheats.map((c) => ({ ...c })),
      },
    });
  }

  render() {
    const { emulator, onClose } = this.props;
    const { tabIndex, values, focusGridComps, cheats } = this.state;

    const cheatList = cheats || [];

    if (!values.cheats) {
      return null;
    }

    const setFocusGridComps = (comps) => {
      this.setState({ focusGridComps: comps });
    };

    const setValues = (values) => {
      this.setState({ values });
    };

    return (
      <EditorScreen
        showCancel={true}
        onFocus={() => {
          const tab = this.cheatsTabRef.current;
          if (tab) tab.focusFirst();
        }}
        onBump={(input) => {
          const tab = this.cheatsTabRef.current;
          if (!tab) return false;
          if (input === 'lbump') { tab.focusFirst(); return true; }
          if (input === 'rbump') { tab.focusLast(); return true; }
          return false;
        }}
        onOk={() => {
          if (this.busy) return;
          this.busy = true;
          const cheatsService = emulator.getCheatsService();
          if (values.cheats) {
            cheatsService.clear();
            values.cheats.filter((c) => c.enabled).forEach((cheat) => cheatsService.add(cheat));
            cheatsService.save();
          }
          onClose();
        }}
        onClose={onClose}
        focusGridComps={focusGridComps}
        onTabChange={(oldTab, newTab) => this.setState({ tabIndex: newTab })}
        tabs={[
          {
            image: BoltWhiteImage,
            label: 'Cheats',
            content: (
              <CheatsTab
                ref={this.cheatsTabRef}
                emulator={emulator}
                cheats={cheatList}
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
