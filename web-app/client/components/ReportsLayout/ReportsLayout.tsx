import React, { FC, PropsWithChildren } from 'react';
import styles from './ReportsLayout.module.scss';
import bg from '@public/bg.svg';
import settingsIcon from '@assets/icons/settings-black.svg';
import chartIcon from '@assets/icons/chart.svg';
import datatableIcon from '@assets/icons/datatable.svg';
import dropDownIcon from '@assets/icons/list-dropdown.svg';
import Image from 'next/image';

interface Props extends PropsWithChildren {
  // menu: ReactElement;
}

export const ReportsLayout: FC<Props> = ({ children }) => {
  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <img
          src={bg.src}
          className={styles.background_image}
          alt="background"
        />
      </div>
      <div className={styles.menu}>
        <ul>
          <li>
            <span className={styles.icon}>
              <Image src={settingsIcon} width={24} height={24} />
            </span>
            <p>Overview</p>
          </li>

          <li>
            <span className={styles.icon}>
              <Image src={chartIcon} width={24} height={24} />
            </span>
            <p>Statistics</p>
          </li>

          <li className={styles.active}>
            <span className={styles.icon}>
              <Image src={dropDownIcon} width={24} height={24} />
            </span>
            <p>Primitive List</p>
          </li>

          <li>
            <span className={styles.icon}>
              <Image src={datatableIcon} width={24} height={24} />
            </span>
            <p>Dataset snippet</p>
          </li>
        </ul>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
