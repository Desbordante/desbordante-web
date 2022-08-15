import {
  BaseHTMLAttributes,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useState,
} from 'react';
import Slider from 'rc-slider';
import { InputPropsBase, Text } from '@components/Inputs';
import 'rc-slider/assets/index.css';
import styles from './NumberSlider.module.scss';
import Tooltip from '@components/Tooltip';
import classNames from 'classnames';

type Props = InputPropsBase &
  HTMLProps<HTMLInputElement> & {
    tooltip?: ReactNode;
  };

const NumberSlider: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, tooltip, ...props },
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
        <Slider min={1} max={9} step={0.1} marks={{1: {style: {top: -40}, label: "1"}, 3: " ", 5:{style: {top: -40}, label: "5"}, 7: " ", 9: {style: {top: -40}, label: "9"}}} value={value} onChange={v => setValue(v as number)} handleRender={(origin, _props) => <div {...origin.props as BaseHTMLAttributes<HTMLDivElement>} className={styles.sliderHandle} />}/>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default forwardRef(NumberSlider); 
