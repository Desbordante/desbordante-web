import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useState,
} from 'react';
import cn from 'classnames';
import Tooltip from '@components/Tooltip';
import { InputPropsBase } from '@components/Inputs';
import styles from './Text.module.scss';

type Props = InputPropsBase &
  HTMLProps<HTMLInputElement> & {
    tooltip?: ReactNode;
  };

const Text: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, tooltip, ...props },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);

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
      <div
        className={cn(
          styles.inputContainer,
          error && styles.error,
          isFocused && styles.focused
        )}
      >
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
