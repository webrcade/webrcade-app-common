import React from 'react';

import { Select } from "."
import { Resources } from '../../../resources';
import { TEXT_IDS } from '../../../resources';
import { BILINEAR_MODE } from '../../../app/retrowrapper/newprefs';

export function BilinearModeSelect(props) {
  const {onPad, value, onChange, selectRef } = props;

  const opts = [];
  opts.push({ value: BILINEAR_MODE.BL_SHARP, label: Resources.getText(TEXT_IDS.SHARP)});
  opts.push({ value: BILINEAR_MODE.BL_SOFT, label: Resources.getText(TEXT_IDS.SOFT)});
  opts.push({ value: BILINEAR_MODE.BL_OFF, label: Resources.getText(TEXT_IDS.OFF)});

  return (
    <Select
      ref={selectRef}
      options={opts}
      onChange={value => onChange(value)}
      value={value}
      onPad={e => onPad(e)}
    />
  )
}
