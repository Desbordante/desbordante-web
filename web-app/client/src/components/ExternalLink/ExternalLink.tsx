import cn from 'classnames';
import { FC, HTMLProps } from 'react';
import Icon from '@components/Icon';
import styles from './ExternalLink.module.scss';

const ExternalLink: FC<HTMLProps<HTMLAnchorElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <a
      className={cn(className, styles.externalLink)}
      target="_blank"
      {...props}
    >
      {children}
      <div className={styles.imageWrapper}>
        <Icon name="externalLink" size={16} />
      </div>
    </a>
  );
};

export default ExternalLink;
