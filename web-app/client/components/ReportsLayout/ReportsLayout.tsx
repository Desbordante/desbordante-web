import React, { FC, PropsWithChildren } from 'react';
import styles from './ReportsLayout.module.scss';
import bg from '@public/bg.jpg';
import settingsIcon from '@assets/icons/settings-black.svg';
import chartIcon from '@assets/icons/chart.svg';
import datatableIcon from '@assets/icons/datatable.svg';
import dropDownIcon from '@assets/icons/list-dropdown.svg';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PrimitiveType } from 'types/globalTypes';
import { useTaskContext } from '@components/TaskContext';
import classNames from 'classnames';

interface Props extends PropsWithChildren {}

const menuOverview = {
  label: 'Overview',
  pathname: '/',
  icon: settingsIcon,
};
const menuStatistics = {
  label: 'Statistics',
  pathname: '/reports/charts',
  icon: chartIcon,
};
const menuPrimitiveList = {
  label: 'Primitive list',
  pathname: '/reports/dependencies',
  icon: dropDownIcon,
};
const menuDatasetSnippet = {
  label: 'Dataset snippet',
  pathname: '/',
  icon: datatableIcon,
};

export const reportsTabs: Record<
  PrimitiveType,
  { label: string; pathname: string; icon: any }[]
> = {
  [PrimitiveType.TypoCluster]: [],
  [PrimitiveType.FD]: [
    menuOverview,
    menuStatistics,
    menuPrimitiveList,
    menuDatasetSnippet,
  ],
  [PrimitiveType.CFD]: [
    menuOverview,
    menuStatistics,
    menuPrimitiveList,
    menuDatasetSnippet,
  ],
  [PrimitiveType.AR]: [
    menuOverview,
    menuStatistics,
    menuPrimitiveList,
    menuDatasetSnippet,
  ],
  [PrimitiveType.TypoFD]: [
    menuOverview,
    menuStatistics,
    menuPrimitiveList,
    menuDatasetSnippet,
  ],
};

export const ReportsLayout: FC<Props> = ({ children }) => {
  const router = useRouter();
  const { taskInfo } = useTaskContext();
  const primitive = taskInfo?.taskInfo.data.baseConfig.type;
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
          {primitive &&
            reportsTabs[primitive].map(({ icon, label, pathname }) => (
              <li
                key={pathname}
                className={classNames(
                  router.pathname === pathname && styles.active
                )}
                onClick={() =>
                  router.push({
                    pathname,
                    query: router.query,
                  })
                }
              >
                <span className={styles.icon}>
                  <Image src={icon} width={24} height={24} />
                </span>
                <p>{label}</p>
              </li>
            ))}
        </ul>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
