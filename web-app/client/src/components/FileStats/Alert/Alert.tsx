import { FC, HTMLProps, ReactNode } from 'react';
import styles from './Alert.module.scss';
import classNames from 'classnames';
import info from '@assets/icons/info-blue.svg';
import error from '@assets/icons/error-red.svg';
import success from '@assets/icons/success-green.svg';
import Image, { StaticImageData } from 'next/image';

type AlertVariant = 'info' | 'error' | 'success';

type AlertProps = {
  variant?: AlertVariant;
  header?: ReactNode;
} & HTMLProps<HTMLDivElement>;

const alertIcons: Record<AlertVariant, StaticImageData> = {
  info: info,
  error: error,
  success: success,
};

export const Alert: FC<AlertProps> = ({
  className,
  children,
  variant = 'info',
  header,
  ...props
}: AlertProps) => (
  <article
    role="alert"
    className={classNames(className, styles.wrapper, styles[variant])}
    {...props}
  >
    <Image src={alertIcons[variant]} alt={variant} />
    <div>
      {header && <p className={styles.header}>{header}</p>}
      <p>{children}</p>
    </div>
  </article>
);
