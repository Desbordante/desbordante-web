import classNames from 'classnames';
import { FC, HTMLProps } from 'react';
import styles from './Table.module.scss';

export const Table: FC<HTMLProps<HTMLTableElement>> = ({
  className,
  ...props
}: HTMLProps<HTMLTableElement>) => (
  <table className={classNames(className, styles.wrapper)} {...props} />
);
