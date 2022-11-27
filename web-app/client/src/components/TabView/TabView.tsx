import classNames from 'classnames';
import React, { FC, PropsWithChildren, useState } from 'react';
import styles from './TabView.module.scss';

type TabProps = {
  name: string;
};

export const Tab: FC<TabProps & PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div>{children}</div>
    </>
  );
};

type Props = {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
};

export const TabView: FC<Props> = ({ children }) => {
  const [tab, setTab] = useState(0);
  const childrenArray = Array.isArray(children)
    ? children.filter((child) => child)
    : [children];
  return (
    <div>
      <div className={styles.header}>
        {childrenArray.map(({ props }, i) => (
          <p
            key={props.name}
            onClick={() => setTab(i)}
            className={classNames(i === tab && styles.selected)}
          >
            {props.name}
          </p>
        ))}
      </div>
      {childrenArray[tab]}
    </div>
  );
};
