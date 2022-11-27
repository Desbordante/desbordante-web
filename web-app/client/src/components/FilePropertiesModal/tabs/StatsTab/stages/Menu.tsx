import { ComponentType } from 'react';
import { MenuProps } from 'react-select';
import { InputPropsBase } from '@components/Inputs';
import styles from '../StatsTab.module.scss';

export const Menu: ComponentType<MenuProps & InputPropsBase> = ({
  innerProps,
  innerRef,
  ...props
}) => {
  return (
    <div {...innerProps} ref={innerRef} {...props} className={styles.menu} />
  );
};
