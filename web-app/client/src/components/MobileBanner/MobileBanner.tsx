import React, { FC, useReducer } from 'react';
import Cross from '@assets/icons/white-cross.svg?component';
import styles from './MobileBanner.module.scss';

export const MobileBanner: FC = () => {
  const [hidden, hide] = useReducer(() => true, false);

  const banner = (
    <div className={styles.root}>
      <small>
        The mobile version is under development. Some functions may be
        unavailable.
      </small>
      <button aria-label="close" className={styles.close} onClick={hide}>
        <Cross />
      </button>
    </div>
  );

  return hidden ? null : banner;
};
