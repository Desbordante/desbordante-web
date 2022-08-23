import {
  BaseHTMLAttributes,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useState,
} from 'react';
import Slider, { SliderProps } from 'rc-slider';
import classNames from 'classnames';
import Tooltip from '@components/Tooltip';
import { InputPropsBase, Text } from '@components/Inputs';
import 'rc-slider/assets/index.css';
import styles from './NumberSlider.module.scss';

type Props = InputPropsBase &
  HTMLProps<HTMLInputElement> & {
    tooltip?: ReactNode;
    sliderProps?: SliderProps;
  };

const NumberSlider: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, tooltip, sliderProps, onChange, ...props },
  ref
) => {
  const [value, setValue] = useState(1);
  const min = sliderProps?.min || 0;
  const max = sliderProps?.max || 100;
  const dot2 = (min + max) / 2;
  const dot1 = (min + dot2) / 2;
  const dot3 = dot2 + dot2 - dot1;

  const marks =
    (sliderProps?.step || 1) % 1 === 0
      ? {
          [min]: { style: { top: -40 }, label: min },
          [Math.floor(dot1)]: ' ',
          [Math.floor(dot2)]: {
            style: { top: -40 },
            label: [Math.floor(dot2)],
          },
          [Math.floor(dot3)]: ' ',
          [max]: { style: { top: -40 }, label: max },
        }
      : {
          [min]: { style: { top: -40 }, label: min },
          [dot1]: ' ',
          [dot2]: { style: { top: -40 }, label: [dot2] },
          [dot3]: ' ',
          [max]: { style: { top: -40 }, label: max },
        };

  return (
    <div
      className={classNames(
        styles.inputText,
        props.disabled && styles.disabled,
        className
      )}
    >
      <div className={styles.top}>
        {label && <label htmlFor={id}>{label}</label>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <div className={styles.slider}>
        <Text
          {...props}
          value={value}
          onChange={(e) => {
            const newValue = Number.parseFloat(e.currentTarget.value);
            setValue(newValue);
            onChange && onChange(e);
          }}
          className={styles.text}
          ref={ref}
        />
        <Slider
          marks={marks}
          trackStyle={{ height: 1, backgroundColor: 'transparent' }}
          railStyle={{ height: 1, backgroundColor: 'rgba(37, 30, 41, 0.25)' }}
          dotStyle={{
            borderRadius: 5,
            height: 8,
            bottom: 0,
            borderWidth: 1,
            width: 0,
            borderColor: 'rgba(37, 30, 41, 0.25)',
          }}
          value={value}
          onChange={(v) => {
            setValue(v as number);
          }}
          handleRender={(origin, _props) => (
            <div
              {...(origin.props as BaseHTMLAttributes<HTMLDivElement>)}
              className={styles.sliderHandle}
            />
          )}
          {...sliderProps}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default forwardRef(NumberSlider);
