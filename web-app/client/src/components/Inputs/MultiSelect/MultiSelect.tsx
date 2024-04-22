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
import customComponents, { colorStyles } from './customComponents';
import styles from './MultiSelect.module.scss';

export type MultiSelectProps<TValue = string> = InputPropsBase &
  ReactSelectProps<Option<TValue>, true> & {
    tooltip?: ReactNode;
  };

// Can't recreate explicit type
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type RefElement = any;

const MultiSelect: ForwardRefRenderFunction<RefElement, MultiSelectProps> = (
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
        isMulti
        className={cn(styles.multiSelect, error && styles.error)}
        {...props}
        ref={ref}
        components={{ ...customComponents, ...components }}
        styles={colorStyles}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        error={error}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default forwardRef(MultiSelect) as <TValue = string>(
  props: MultiSelectProps<TValue> & { ref?: ForwardedRef<RefElement> },
) => ReturnType<typeof MultiSelect>;
