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
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        styles.button,
        defaultSizeClassName,
        defaultClassName,
        className
      )}
    >
      <>{children}</>
    </button>
  );
};

export default Button;
