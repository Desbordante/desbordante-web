import { ComponentType } from 'react';
import { MenuProps } from 'react-select';
import styles from '@components/FilePropsView/FilePropsView.module.scss';
import { InputPropsBase } from '@components/Inputs';

export const Menu: ComponentType<MenuProps & InputPropsBase> = ({
  innerProps,
  innerRef,
  ...props
}) => {
  return (
    <div {...innerProps} ref={innerRef} {...props} className={styles.menu} />
  );
};
