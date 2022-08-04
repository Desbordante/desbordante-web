import { forwardRef, ForwardRefRenderFunction } from 'react';
import cn from 'classnames';
import { InputProps } from '../../Input';
import Tooltip from '@components/Tooltip';

import styles from './Text.module.scss';

const Text: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { id, label, error, className, tooltip, ...props },
  ref
) => {
  return (
    <div
      className={cn(
        styles.inputText,
        props.disabled && styles.disabled,
        className
      )}
    >
      <div className={styles.top}>
        {label && <label htmlFor={id}>{label}</label>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <div className={cn(styles.inputContainer, error && styles.error)}>
        <input
          type="text"
          ref={ref}
          id={id}
          className={styles.input}
          {...props}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default forwardRef(Text);
