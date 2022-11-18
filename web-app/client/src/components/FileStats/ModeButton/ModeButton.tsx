import { ButtonHTMLAttributes, FC } from 'react';
import styles from './ModeButton.module.scss';
import classNames from 'classnames';
import grid from '@assets/icons/grid.svg';
import list from '@assets/icons/list.svg';
import Button from '@components/Button';

type ModeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tableMode: boolean;
};

export const ModeButton: FC<ModeButtonProps> = ({
  className,
  tableMode,
  ...props
}: ModeButtonProps) => (
  <Button
    variant="secondary"
    icon={!tableMode ? grid : list}
    className={classNames(className, styles.wrapper)}
    aria-label="Change mode"
    {...props}
  />
);
