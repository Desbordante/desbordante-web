import classNames from 'classnames';
import Slider, { SliderProps } from 'rc-slider';
import {
  BaseHTMLAttributes,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { InputPropsBase, Text } from '@components/Inputs';
import 'rc-slider/assets/index.css';
import Tooltip from '@components/Tooltip';
import styles from './NumberSlider.module.scss';

type Props = InputPropsBase &
  Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
    tooltip?: ReactNode;
    sliderProps?: SliderProps;
    onChange: (value: number) => void;
    value: number;
  };

const NumberSlider: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  {
    id,
    label,
    error,
    className,
    tooltip,
    sliderProps,
    value,
    onChange,
    ...props
  },
  ref,
) => {
  const min = sliderProps?.min || 0;
  const max = sliderProps?.max || 100;
  const dot2 = (min + max) / 2;
  const dot1 = (min + dot2) / 2;
  const dot3 = dot2 + dot2 - dot1;

  const marks =
    (sliderProps?.step || 1) % 1 === 0
      ? {
          [min]: { style: { top: -35 }, label: min },
          [Math.floor(dot1)]: ' ',
          [Math.floor(dot2)]: {
            style: { top: -40 },
            label: [Math.floor(dot2)],
          },
          [Math.floor(dot3)]: ' ',
          [max]: { style: { top: -35 }, label: max },
        }
      : {
          [min]: { style: { top: -35 }, label: min },
          [dot1]: ' ',
          [dot2]: { style: { top: -35 }, label: [dot2] },
          [dot3]: ' ',
          [max]: { style: { top: -35 }, label: max },
        };

  const [tempValue, setTempValue] = useState<string>('');
  useEffect(() => {
    setTempValue(value === undefined ? '' : value?.toString());
  }, [value]);

  const prepareValue = (s: string) => {
    const parsed = Number.parseFloat(s);
    return Number.isNaN(parsed) ? min : parsed;
  };

  return (
    <div
      className={classNames(
        styles.inputText,
        props.disabled && styles.disabled,
        className,
      )}
    >
      <div className={styles.top}>
        {label && <label htmlFor={id}>{label}</label>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <div className={styles.slider}>
        <Text
          {...props}
          value={tempValue}
          onBlur={(e) => onChange(prepareValue(e.target.value))}
          onChange={(e) => setTempValue(e.currentTarget.value)}
          className={styles.text}
          ref={ref}
        />
        <Slider
          marks={marks}
          className={styles.slider_track}
          trackStyle={{ height: 1, backgroundColor: 'transparent' }}
          railStyle={{ height: 1, backgroundColor: styles.railColor }}
          dotStyle={{
            borderRadius: 5,
            height: 8,
            bottom: 0,
            borderWidth: 1,
            width: 0,
            borderColor: styles.railColor,
          }}
          value={value}
          onChange={(v) => {
            if (Array.isArray(v)) return; // currently don't support multiple selection on the track
            onChange(v);
            setTempValue(v.toString());
          }}
          handleRender={(origin) => (
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
