import { ReactNode } from 'react';

import Button from '@components/Button';
import styles from '@styles/UIKit.module.scss';

const buttonContent: ReactNode = 'Click Me';
const buttonVariants = [
  'gradient',
  'primary',
  'secondary',
  'tertiary',
] as const;

const Buttons = () => (
  <>
    {buttonVariants.map((variant) => (
      <div className={styles.row} key={variant}>
        <Button variant={variant} size="sm">
          {buttonContent}
        </Button>
        <Button variant={variant}>{buttonContent}</Button>
        <Button variant={variant} size="lg">
          {buttonContent}
        </Button>
        <Button variant={variant} disabled>
          {buttonContent}
        </Button>
      </div>
    ))}
  </>
);

const UIKit = () => {
  return (
    <div className={styles.root}>
      <Buttons />
    </div>
  );
};

export default UIKit;
