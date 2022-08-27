import React, {
  DragEvent,
  DragEventHandler,
  FC,
  PropsWithChildren,
  ReactElement,
} from 'react';
import styles from './WizardLayout.module.scss';
import bg from '@public/bg.svg';

interface Props extends PropsWithChildren {
  header: ReactElement;
  footer: ReactElement;
}

export const WizardLayout: FC<Props> = ({ header, footer, children }) => {
  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <img
          src={bg.src}
          className={styles.background_image}
          alt="background"
        />
      </div>
      <div className={styles.section_text}>{header}</div>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
};
