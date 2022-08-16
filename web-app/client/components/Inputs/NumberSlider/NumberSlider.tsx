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
    sliderProps?: SliderProps
  };

const NumberSlider: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, tooltip, sliderProps, ...props },
  ref
) => {
  const [value, setValue] = useState(1);

  return (
    <div
    className={classNames(
      styles.inputText,
      props.disabled && styles.disabled,
      className
    )}>
      <div className={styles.top}>
        {label && <label htmlFor={id}>{label}</label>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <div className={styles.slider} >
        <Text value={value} onChange={e => setValue(Number.parseFloat(e.currentTarget.value))} {...props} ref={ref} />
        <Slider trackStyle={{height: 1, backgroundColor: 'transparent'}} railStyle={{height: 1, backgroundColor: 'rgba(37, 30, 41, 0.25)'}} dotStyle={{borderRadius: 5, height: 8, bottom: 0, borderWidth: 1, width:0, borderColor: 'rgba(37, 30, 41, 0.25)'}} value={value} onChange={v => setValue(v as number)} handleRender={(origin, _props) => <div {...origin.props as BaseHTMLAttributes<HTMLDivElement>} className={styles.sliderHandle} />} {...sliderProps} />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default forwardRef(NumberSlider); 
