import cn from 'classnames';
import { forwardRef, ForwardRefRenderFunction, ReactNode } from 'react';
import ReactSelect, {
  Props as ReactSelectProps,
  PropsValue,
} from 'react-select';
import { InputPropsBase } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import customComponents, { colorStyles } from './customComponents';
import styles from './MultiSelect.module.scss';

export type MultiSelectProps = InputPropsBase &
  ReactSelectProps & {
    tooltip?: ReactNode;
  };

const MultiSelect: ForwardRefRenderFunction<any, MultiSelectProps> = (
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

export default forwardRef(MultiSelect);
