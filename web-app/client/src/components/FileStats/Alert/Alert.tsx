import { FC, HTMLProps, ReactNode } from 'react';
import styles from './Alert.module.scss';
import classNames from 'classnames';
import InfoIcon from '@assets/icons/info-blue.svg?component';
import ErrorIcon from '@assets/icons/error-red.svg?component';
import SuccessIcon from '@assets/icons/success-green.svg?component';

type AlertVariant = 'info' | 'error' | 'success';

type AlertProps = {
  variant?: AlertVariant;
  header?: ReactNode;
} & HTMLProps<HTMLDivElement>;

const alertIcons: Record<AlertVariant, ReactNode> = {
  info: <InfoIcon />,
  error: <ErrorIcon />,
  success: <SuccessIcon />,
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
