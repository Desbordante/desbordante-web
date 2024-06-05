import classNames from 'classnames';
import { FC, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';

type ButtonVariant =
  | 'gradient'
  | 'primary'
  | 'secondary'
  | 'secondary-danger'
  | 'tertiary';
type ButtonSize = 'sm' | 'lg' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const Button: FC<Props> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  icon,
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
        !children && styles.withoutText,
        defaultSizeClassName,
        defaultClassName,
        className,
      )}
    >
      <>
        {icon}
        {children}
      </>
    </button>
  );
};

export default Button;
