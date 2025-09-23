import React, { useEffect, useState, useRef, Fragment } from 'react';
import styles from './shader-styles.scss'

import { FieldsTab, FieldRow, FieldLabel, FieldControl } from '../../editor/tabs';
import { Select } from '../../../components/select';
import { WebrcadeContext } from '../../../context/webrcadecontext';

export class ShaderSettingsTab extends FieldsTab {
  constructor(props) {
    super(props);
    this.categoryRef = React.createRef();
    this.shaderRef = React.createRef();

    this.gridComps = [
      [this.categoryRef],
      [this.shaderRef]
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
    const { categoryRef, shaderRef } = this;
    const { focusGrid } = this.context;
    const { setValues, values, shaderService} = this.props;
    const shaders = shaderService.getShaders();
    const shader = shaderService.getShaderById(values.shaderId);

    return (
      <Fragment>
        <FieldRow>
          <FieldLabel>Shader Category</FieldLabel>
          <FieldControl>
            <ShaderCategorySelect
              shaders={shaders}
              selectRef={categoryRef}
              value={values.shaderCategoryId}
              onChange={(categoryId) => {
                const category = shaders.categories.find((cat) => cat.id === categoryId);
                const firstShader = category?.shaders?.[0];
                setValues({
                  ...values,
                  ...{
                    shaderCategoryId: categoryId,
                    shaderId: firstShader.id,
                  },
                })
              }}
              onPad={(e) => focusGrid.moveFocus(e.type, categoryRef)}
            />
          </FieldControl>
        </FieldRow>
        {values.shaderCategoryId !== "disabled" &&
          <Fragment>
            <FieldRow>
              <FieldLabel>Shader Name</FieldLabel>
              <FieldControl>
                <ShaderSelect
                  shaders={shaders}
                  selectRef={shaderRef}
                  selectedCategoryId={values.shaderCategoryId}
                  value={values.shaderId}
                  onChange={(shaderId) => {
                    setValues({
                      ...values,
                      ...{
                        shaderId: shaderId,
                      },
                    })
                  }}
                  onPad={(e) => focusGrid.moveFocus(e.type, shaderRef)}
                />
              </FieldControl>
            </FieldRow>
            <FieldRow>
              <ShaderDescription
                description={shader?.description}
              />
            </FieldRow>
          </Fragment>
      }
      </Fragment>
    );
  }
}
ShaderSettingsTab.contextType = WebrcadeContext;

export function ShaderDescription({ description }) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState(description);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      // Skip animation on initial mount, just show
      setText(description);
      setVisible(true);
      isFirstMount.current = false;
      return;
    }

    // Animate out, then swap text and animate in
    setVisible(false);

    const timeout = setTimeout(() => {
      setText(description);
      setVisible(true);
    }, 400); // duration of fade-out before text swap

    return () => clearTimeout(timeout);
  }, [description]);

  return (
    <div className={styles['shader-description']}>
      <div
        className={styles['shader-description-inner']}
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export function ShaderCategorySelect(props) {
  const { selectRef, onPad, value, onChange, shaders } = props;

  const opts = shaders.categories.map((cat) => ({
    value: cat.id,
    label: cat.title,
  }));

  return (
    <Select
      width="15rem"
      ref={selectRef}
      options={opts}
      onChange={(value) => onChange(value)}
      value={value}
      onPad={(e) => onPad(e)}
    />
  );
}

export function ShaderSelect(props) {
  const { selectRef, onPad, selectedCategoryId, value, onChange, shaders } = props;

  const category = shaders.categories.find(cat => cat.id === selectedCategoryId);
  const categoryShaders = category?.shaders || [];

  const opts = categoryShaders.map((shader) => ({
    value: shader.id,
    label: shader.title,
  }));

  return (
    <Select
      width="15rem"
      ref={selectRef}
      options={opts}
      onChange={(value) => onChange(value)}
      value={value}
      onPad={(e) => onPad(e)}
    />
  );
}

