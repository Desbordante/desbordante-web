import cn from 'classnames';
import {
  ForwardedRef,
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
} from 'react';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';
import { InputPropsBase } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import { Option } from 'types/inputs';
import customComponents from './customComponents';
import styles from './Select.module.scss';

export type Props<TValue = string> = InputPropsBase &
  ReactSelectProps<Option<TValue>, false> & {
    tooltip?: ReactNode;
  };

// Can't recreate explicit type
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type RefElement = any;

const Select: ForwardRefRenderFunction<RefElement, Props> = (
  { label, error, tooltip, className, id, components, ...props },
  ref,
) => {
  return (
    <div
      className={cn(
        styles.inputSelect,
        props.isDisabled && styles.disabled,
        className,
      )}
    >
      <div className={styles.top}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <ReactSelect
        className={styles.selectContainer}
        classNamePrefix={styles.selectContainer}
        {...props}
        ref={ref}
        components={{ ...customComponents, ...components }}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default forwardRef(Select) as <TValue = string>(
  props: Props<TValue> & { ref?: ForwardedRef<RefElement> },
) => ReturnType<typeof Select>;
