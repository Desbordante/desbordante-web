import classNames from 'classnames';
import { FC, HTMLProps, ReactNode } from 'react';
import ErrorIcon from '@assets/icons/error-red.svg?component';
import InfoIcon from '@assets/icons/info-blue.svg?component';
import SuccessIcon from '@assets/icons/success-green.svg?component';
import styles from './Alert.module.scss';

type AlertVariant = 'info' | 'error' | 'success' | 'warning';

type AlertProps = {
  variant?: AlertVariant;
  header?: ReactNode;
} & HTMLProps<HTMLDivElement>;

const alertIcons: Record<AlertVariant, ReactNode> = {
  info: <InfoIcon />,
  error: <ErrorIcon />,
  success: <SuccessIcon />,
  warning: <ErrorIcon />,
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
    {alertIcons[variant]}
    <div>
      {header && <p className={styles.header}>{header}</p>}
      <p>{children}</p>
    </div>
  </article>
);
