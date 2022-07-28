import { FC, HTMLProps } from 'react';
import cn from 'classnames';
import Image from 'next/image';
import styles from './ExternalLink.module.scss';

import externalLinkIcon from '@assets/icons/external-link.svg';

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
      <Image src={externalLinkIcon} alt="link" width={16} height={16} />
    </a>
  );
};

export default ExternalLink;
