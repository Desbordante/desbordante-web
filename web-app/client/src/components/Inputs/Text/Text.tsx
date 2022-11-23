import cn from 'classnames';
import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useId,
} from 'react';
import { InputPropsBase } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import styles from './Text.module.scss';

type Props = InputPropsBase &
  HTMLProps<HTMLInputElement> & {
    tooltip?: ReactNode;
    type?: 'email' | 'password' | 'text';
  };

const Text: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, type = 'text', label, error, className, tooltip, ...props },
  ref
) => {
  const uniqueId = useId();
  const inputId = id || uniqueId;

  return (
    <div
      className={cn(
        styles.inputText,
        props.disabled && styles.disabled,
        className
      )}
    >
      <div className={styles.top}>
        {label && <label htmlFor={inputId}>{label}</label>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <input
        type={type}
        ref={ref}
        id={inputId}
        className={cn(error && styles.error)}
        {...props}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default forwardRef(Text);
