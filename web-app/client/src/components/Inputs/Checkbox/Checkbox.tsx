import cn from 'classnames';
import { forwardRef, ForwardRefRenderFunction, HTMLProps } from 'react';
import { InputPropsBase } from '@components/Inputs';
import styles from './Checkbox.module.scss';

type CheckboxProps = {
  variant?: 'outline' | 'simple';
};

type Props = CheckboxProps & InputPropsBase & HTMLProps<HTMLInputElement>;

const Checkbox: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, variant = 'outline', ...props },
  ref,
) => {
  return (
    <div
      className={cn(
        styles.inputCheckbox,
        props.disabled && styles.disabled,
        className,
      )}
    >
      <label className={styles.inputContainer}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={cn(
            error && styles.checkboxError,
            variant === 'simple' && styles.simple,
          )}
          {...props}
        />
        {label}
      </label>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default forwardRef(Checkbox);
