import cn from 'classnames';
import { FC, HTMLProps } from 'react';
import styles from './OptionBadge.module.scss';

type OptionBadgeProps = {
  style?: string;
} & HTMLProps<HTMLDivElement>;

export const OptionBadge: FC<OptionBadgeProps> = ({
  style,
  className,
  ...props
}: OptionBadgeProps) => (
  <article
    className={cn(className, styles.wrapper, style)}
    {...props}
  >
    {props.children}
  </article>
);
