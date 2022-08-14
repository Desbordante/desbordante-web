import { forwardRef, ForwardRefRenderFunction, ReactNode } from 'react';
import cn from 'classnames';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';
import { InputPropsBase } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import customComponents from './customComponents';
import styles from './Select.module.scss';

type Props = InputPropsBase &
  ReactSelectProps & {
    tooltip?: ReactNode;
  };

const Select: ForwardRefRenderFunction<any, Props> = (
  { label, error, tooltip, className, id, ...props },
  ref
) => {
  return (
    <div
      className={cn(
        styles.inputSelect,
        props.isDisabled && styles.disabled,
        className
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
        components={customComponents}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default forwardRef(Select);