import Button from '@components/Button';
import styles from '@styles/UIKit.module.scss';
import { ReactNode } from 'react';

const buttonContent: ReactNode = 'Click Me';

const UIKit = () => {
  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <Button variant="gradient" size="sm">
          {buttonContent}
        </Button>
        <Button variant="gradient">{buttonContent}</Button>
        <Button variant="gradient" size="lg">
          {buttonContent}
        </Button>
        <Button variant="gradient" disabled>
          {buttonContent}
        </Button>
      </div>
    </div>
  );
};

export default UIKit;
