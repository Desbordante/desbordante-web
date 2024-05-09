import cn from 'classnames';
import Image from 'next/image';
import { FC, HTMLProps } from 'react';
import externalLinkIcon from '@assets/icons/external-link.svg';
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
        <Image src={externalLinkIcon} alt="link" width={16} height={16} />
      </div>
    </a>
  );
};

export default ExternalLink;
