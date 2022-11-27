import cn from 'classnames';
import { useState } from 'react';
import ArrowDown from '@assets/icons/arrow-down.svg?component';
import { FCWithChildren } from 'types/react';
import styles from './Collapse.module.scss';

interface Props {
  title: string;
  className?: string;
}

export const Collapse: FCWithChildren<Props> = ({
  title,
  className,
  children,
}) => {
  const [isShown, setIsShown] = useState(true);

  return (
    <div className={styles.root}>
      <h5
        className={cn(className, !isShown && styles.collapsed, styles.title)}
        onClick={() => setIsShown((isShown) => !isShown)}
      >
        {title}{' '}
        <ArrowDown
          height={20}
          width={20}
          className={cn(isShown && styles.reversed)}
        />
      </h5>
      {isShown && <div>{children}</div>}
    </div>
  );
};
