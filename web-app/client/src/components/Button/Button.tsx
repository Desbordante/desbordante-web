import classNames from 'classnames';
import Image, { StaticImageData } from 'next/image';
import { FC, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.scss';

type ButtonVariant =
  | 'gradient'
  | 'primary'
  | 'secondary'
  | 'secondary-danger'
  | 'tertiary';
type ButtonSize = 'sm' | 'lg' | 'md';
type Icon = string | StaticImageData;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
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
        defaultSizeClassName,
        defaultClassName,
        className
      )}
    >
      <>
        {icon && (
          <span className={styles.icon}>
            <Image src={icon} width={24} height={24} />
          </span>
        )}
        {children && <span className={styles.inner}>{children}</span>}
      </>
    </button>
  );
};

export default Button;
