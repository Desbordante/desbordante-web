import classNames from 'classnames';
import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { InputPropsBase, Text } from '@components/common/uikit/Inputs';
import Tooltip from '@components/common/uikit/Tooltip';
import styles from './NumberInput.module.scss';

export type NumberInputProps = {
  defaultNum: number;
  min?: number;
  includingMin?: boolean;
  max?: number;
  includingMax?: boolean;
  numbersAfterDot?: number;
};

export type Props = InputPropsBase &
  Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
    tooltip?: ReactNode;
    numberProps?: NumberInputProps;
    onChange: (value: number) => void;
    value: number;
  };

const NumberInput: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  {
    id,
    label,
    error,
    className,
    numberProps,
    tooltip,
    value,
    onChange,
    ...props
  },
  ref,
) => {
  const {
    numbersAfterDot,
    min,
    max,
    includingMin = true,
    includingMax = true,
    defaultNum = 0,
  } = numberProps || {};

  const [displayValue, setDisplayValue] = useState('');
  useEffect(() => {
    setDisplayValue(value === undefined ? '' : value?.toString());
  }, [value]);

  const placeInsideBorders = (s: string): number => {
    const parsed = +s;
    if (!Number.isNaN(parsed)) {
      if (min !== undefined && parsed <= min)
        return includingMin ? min : defaultNum;
      if (max !== undefined && parsed >= max)
        return includingMax ? max : defaultNum;
      return parsed;
    } else return defaultNum;
  };

  const prepareValue = (s: string): number => {
    const parsed = placeInsideBorders(s);
    if (numbersAfterDot !== undefined) return +parsed.toFixed(numbersAfterDot);
    return parsed;
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
          error={error}
          {...props}
          value={displayValue}
          onBlur={(e) => {
            onChange(prepareValue(e.target.value));
            setDisplayValue(prepareValue(e.target.value).toString());
          }}
          onChange={(e) => setDisplayValue(e.currentTarget.value)}
          className={styles.text}
          ref={ref}
        />
      </div>
    </div>
  );
};

export default forwardRef(NumberInput);
