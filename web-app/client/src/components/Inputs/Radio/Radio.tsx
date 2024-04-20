import cn from 'classnames';
import { forwardRef, ForwardRefRenderFunction, HTMLProps } from 'react';
import { InputPropsBase } from '@components/Inputs';
import styles from './Radio.module.scss';

type Props = InputPropsBase & Omit<HTMLProps<HTMLInputElement>, 'type'>;

const Radio: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { label, className, ...props },
  ref,
) => {
  return (
    <label className={cn(className, styles.container)}>
      <input ref={ref} type="radio" {...props} />
      {label}
    </label>
  );
};

export default forwardRef(Radio);
