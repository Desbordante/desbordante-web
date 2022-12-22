import classNames from 'classnames';
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
import Tooltip from '@components/Tooltip';
import styles from './NumberInput.module.scss';

interface NumberInputProps {
  defaultNum: number;
  min?: number;
  includingMin?: boolean;
  max?: number;
  includingMax?: boolean;
  nunbersAfterDot?: number;
}

type Props = InputPropsBase &
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
  ref
) => {
  const nunbersAfterDot = numberProps?.nunbersAfterDot !== undefined ? numberProps?.nunbersAfterDot : null;
  const min = numberProps?.min !== undefined ? numberProps?.min : null; // (0 || null) === null
  const max = numberProps?.max !== undefined ? numberProps?.max : null;
  const includingMin = numberProps?.includingMin !== undefined ? numberProps?.includingMin : true;
  const includingMax = numberProps?.includingMax !== undefined ? numberProps?.includingMax : true;
  const defaultNum = numberProps?.defaultNum || 0;

  const [tempValue, setTempValue] = useState<string>('');
  useEffect(() => {
    setTempValue(value === undefined ? '' : value?.toString());
  }, [value]);

  const placeIncideBorders = (s: string): number => {
    const parsed = Number.parseFloat(s);
    if (!Number.isNaN(parsed)) {
      if (min !== null && parsed <= min) return includingMin ? min : defaultNum;
      if (max !== null && parsed >= max) return includingMax ? max : defaultNum;
      return parsed;
    } else return defaultNum;
  };

  const prepareValue = (s: string): number => {
    const parsed = placeIncideBorders(s);
    if (nunbersAfterDot !== null)
      return Number.parseFloat(parsed.toFixed(nunbersAfterDot));
    return parsed;
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
          value={tempValue}
          onBlur={(e) => {
            setTempValue(prepareValue(e.target.value).toString());
            onChange(prepareValue(e.target.value));
          }}
          onChange={(e) => setTempValue(e.currentTarget.value)}
          className={styles.text}
          ref={ref}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default forwardRef(NumberInput);
