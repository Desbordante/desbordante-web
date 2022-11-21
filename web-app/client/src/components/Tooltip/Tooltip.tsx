import cn from 'classnames';
import Image from 'next/image';
import { useState } from 'react';
import infoIcon from '@assets/icons/info.svg';
import { FCWithChildren } from 'types/react';

import styles from './Tooltip.module.scss';

interface Props {
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const Tooltip: FCWithChildren<Props> = ({
  className,
  position = 'top',
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn(styles.tooltip, className)}>
      <Image
        width={16}
        height={16}
        src={infoIcon}
        alt="info"
        className={styles.icon}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <div
        className={cn(
          styles.content,
          styles[position],
          !isHovered && styles.hidden
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
