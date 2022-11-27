import cn from 'classnames';
import { useState } from 'react';
import InfoIcon from '@assets/icons/info.svg?component';
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
      <InfoIcon
        width={16}
        height={16}
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
