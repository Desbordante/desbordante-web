import { FC, ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

type ButtonVariant = 'gradient' | 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'sm' | 'lg' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button: FC<Props> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  children,
  size = 'md',
  ...rest
}) => {
  const defaultClassName = styles[variant];
  const defaultSizeClassName = styles[size];
  return (
    <button
      {...rest}
      className={classNames(
        styles.button,
        defaultSizeClassName,
        defaultClassName,
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <>{children}</>
    </button>
  );
};

export default Button;
