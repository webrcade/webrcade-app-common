import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  FieldsTab,
  FieldRow,
  FieldLabel,
  FieldControl
} from '../editor/tabs';

import { Select } from '../../components/select';
import { ImageButton } from '../../components/image-button';
import { WebrcadeContext } from '../../context/webrcadecontext';
import { AppRegistry } from '../../../apps';
import { showMessage } from '../../components/message';

import styles from './apps-styles.scss';


// ---------------------------------------------------------
// Fade-in/out description component using shader CSS
// ---------------------------------------------------------
function DescriptionFade({ text }) {
  const [current, setCurrent] = useState(text);
  const [fadeState, setFadeState] = useState("fade-in");
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      setCurrent(text);
      setFadeState("fade-in");
      return;
    }

    // fade out
    setFadeState("fade-out");

    // swap text and fade in
    const timeout = setTimeout(() => {
      setCurrent(text);
      setFadeState("fade-in");
    }, 300);

    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <div className={styles['apps-description']}>
      <div
        className={
          styles['apps-description-inner'] +
          ' ' +
          styles[fadeState]
        }
      >
        {current}
      </div>
    </div>
  );
}


// ---------------------------------------------------------
// AppsTab Component
// ---------------------------------------------------------
export class AppsTab extends FieldsTab {
  constructor(props) {
    super(props);

    this.aliasRef = React.createRef();
    this.appRef = React.createRef();
    this.resetRef = React.createRef();

    this.gridComps = [
      [this.aliasRef],
      [this.appRef],
      [this.resetRef],
    ];

    this.registry = AppRegistry.instance;
  }

  componentDidUpdate(prevProps) {
    const { isActive, setFocusGridComps } = this.props;
    if (isActive && isActive !== prevProps.isActive) {
      setFocusGridComps(this.gridComps);
    }
  }

  buildAliasData() {
    const map = this.registry.buildAliasToAppsMap();

    const sortedAliases = Object.keys(map).sort((a, b) => {
      const an = this.registry.getGeneralShortNameForType(a);
      const bn = this.registry.getGeneralShortNameForType(b);
      return an.localeCompare(bn);
    });

    return { map, sortedAliases };
  }

  render() {
    const { focusGrid } = this.context;
    const { values, setValues } = this.props;

    const overrides = values.overrides || {};
    const setOverrides = (o) =>
      setValues({ ...values, overrides: o });

    const { map, sortedAliases } = this.buildAliasData();

    const alias = values.alias || sortedAliases[0];
    const def = "__default__";

    const aliasMenuItems = sortedAliases.map((a) => ({
      value: a,
      label: this.registry.getGeneralShortNameForType(a),
    }));

    const sortedApps = [...map[alias]].sort((a, b) => {
      if (a.default && !b.default) return -1;
      if (!a.default && b.default) return 1;

      a.name.localeCompare(b.name)
    });

    const currentAppKey = overrides[alias];
    let description = null;

    if (currentAppKey) {
      const app = sortedApps.find(a => a.typeName === currentAppKey);
      description = app
        ? app.description || "No description available."
        : null;
    } else {
      description = "Uses the feed-specified application for this alias, or falls back to the alias's default (which may change over time)."
    }

    return (
      <Fragment>
        {/* Alias */}
        <FieldRow>
          <div className={styles['apps-title']}>
            <div className={styles['apps-title-inner']} >
              Select an application for each alias (or fall back to the defaults)
            </div>
          </div>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Application Alias</FieldLabel>
          <FieldControl>
            <Select
              ref={this.aliasRef}
              width="17rem"
              value={alias}
              options={aliasMenuItems}
              onChange={(newAlias) => {
                setValues({ ...values, alias: newAlias });
              }}
              onPad={(e) => focusGrid.moveFocus(e.type, this.aliasRef)}
            />
          </FieldControl>
        </FieldRow>

        {/* Application */}
        <FieldRow>
          <FieldLabel>Mapped Application</FieldLabel>
          <FieldControl>
            <Select
              key={alias}
              ref={this.appRef}
              width="17rem"
              value={currentAppKey ? currentAppKey : def}
              options={[
                { value: def, label: "(use default)" },
                ...sortedApps.map(app => ({
                  value: app.typeName,
                  label: app.name + (app.default ? " *" : "")
                })),
              ]}
              onChange={(val) => {
                if (val === def) delete overrides[alias];
                else overrides[alias] = val;
                setOverrides(overrides);
              }}
              onPad={(e) => focusGrid.moveFocus(e.type, this.appRef)}
            />
          </FieldControl>
        </FieldRow>

        {/* Description with shader fade animation */}
        <FieldRow>
          <DescriptionFade
          text={description} />
        </FieldRow>
        {/* Reset button */}
        { (values.overrides && Object.keys(values.overrides).length > 0) &&
          <FieldRow>
            <FieldLabel>Clear Selections</FieldLabel>
            <FieldControl>
              <div>
              <ImageButton
                ref={this.resetRef}
                label={"Clear"}
                onPad={e => focusGrid.moveFocus(e.type, this.resetRef)}
                onClick={() => {
                  setValues({ ...values,
                    alias: sortedAliases[0],
                    overrides: {}
                  })
                  this.aliasRef.current.focus();
                  showMessage("All application selections have been cleared.", false, false)
                }}
              />
              </div>
            </FieldControl>
          </FieldRow>
        }
      </Fragment>
    );
  }
}

AppsTab.contextType = WebrcadeContext;
